import com.github.edge.roman.spear.SpearConnector
// import org.apache.log4j.{Level, Logger}
import org.apache.spark.sql.SaveMode

// Logger.getLogger("com.github").setLevel(Level.INFO)
val targetProps = Map(
    "driver" -> "org.postgresql.Driver",
    "user" -> "postgres_user",
    "password" -> "mysecretpassword",
    "url" -> "jdbc:postgresql://postgres:5432/pgdb"
  )

val csvJdbcConnector = SpearConnector
    .createConnector(name="CSVtoPostgresConnector")
    .source(sourceType = "file", sourceFormat = "csv")
    .target(targetType = "relational", targetFormat = "jdbc")
    .getConnector   
 
csvJdbcConnector.setVeboseLogging(true)
csvJdbcConnector
  .source(sourceObject="file:///opt/spear-framework/data/us-election-2012-results-by-county.csv", Map("header" -> "true", "inferSchema" -> "true"))
  .saveAs("__tmp__")
  .transformSql(
    """select state_code,party,
      |sum(votes) as total_votes
      |from __tmp__
      |group by state_code,party""".stripMargin)
  .targetJDBC(objectName="mytable", props=targetProps, saveMode=SaveMode.Overwrite)
csvJdbcConnector.stop()