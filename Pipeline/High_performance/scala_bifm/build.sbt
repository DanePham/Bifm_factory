val scala3Version = "3.3.1"
// val scala3Version = "3.3.3"

// val sparkVersion = "2.4.7"
val sparkVersion = "3.1.1"

lazy val root = project
  .in(file("."))
  .settings(
    name := "scala_bifm",
    version := "0.1.0-SNAPSHOT",

    scalaVersion := scala3Version,

    libraryDependencies ++= Seq(
      "org.scalameta" %% "munit" % "0.7.29" % Test,
      // "io.github.romans-weapon" %% "spear-framework" % "2.4-3.0.3",
      // "com.typesafe.scala-logging" %% "scala-logging" % "3.9.3",
      "ch.qos.logback" % "logback-classic" % "1.2.3",
      "io.github.romans-weapon" % "spear-framework_2.12" % "3.1.1-3.0"
    )
  )
