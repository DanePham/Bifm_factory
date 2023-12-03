/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package com.github.edge.roman.spear.commons

import com.databricks.spark.xml.XmlDataFrameReader
import com.github.edge.roman.spear.SpearConnector
import org.apache.log4j.Logger
import org.apache.spark.sql.DataFrame
import org.apache.spark.sql.functions.from_json
import org.apache.spark.sql.types.StructType
import com.github.edge.roman.spear.SpearConnector.spark.implicits._
import com.mongodb.spark.config.ReadConfig
import com.mongodb.spark.sql.SparkSessionFunctions

object ConnectorCommon {
  val logger: Logger = Logger.getLogger(this.getClass.getName)

  def sourceFile(sourceFormat: String, sourceFilePath: String, params: Map[String, String]): DataFrame = {
    sourceFormat match {
      case "csv" =>
        SpearConnector.spark.read.options(params).csv(sourceFilePath)
      case "avro" | "parquet" =>
        SpearConnector.spark.read.format(sourceFormat).options(params).load(sourceFilePath)
      case "json" =>
        SpearConnector.spark.read.options(params).json(sourceFilePath)
      case "tsv" =>
        val _params = params + ("sep" -> "\t")
        SpearConnector.spark.read.options(_params).csv(sourceFilePath)
      case "xml" =>
        SpearConnector.spark.read.format("com.databricks.spark.xml").options(params).xml(sourceFilePath)
      case _ =>
        throw new Exception("Invalid source format provided.")
    }
  }

  def sourceJDBC(sourceObject: String, sourceFormat: String, params: Map[String, String]): DataFrame = {
    sourceFormat match {
      case "soql" | "saql" =>
        throw new NoSuchMethodException(s"Salesforce object ${sourceObject} cannot be loaded directly.Instead use sourceSql function with soql/saql query to load the data")
      case "hive" =>
        SpearConnector.spark.read.table(sourceObject)
      case _ =>
        SpearConnector.spark.read.format(sourceFormat).option("dbtable", sourceObject).options(params).load()
    }
  }

  def sourceGraphDB(sourceObject: String, sourceFormat: String, params: Map[String, String]): DataFrame = {
    sourceFormat match {
      case "neo4j" =>
        SpearConnector.spark.read.format("org.neo4j.spark.DataSource")
          .options(params)
          .option("labels", sourceObject)
          .load()
      case _ =>
        throw new Exception("Invalid source format for Graph Databases !!!")
    }
  }

  def sourceSQL(sqlText: String, sourceFormat: String, params: Map[String, String]): DataFrame = {
    sourceFormat match {
      case "soql" | "saql" =>
        if (sourceFormat.equals("soql")) {
          SpearConnector.spark.read.format(SpearCommons.SalesforceFormat).option("soql", s"$sqlText").options(params).load()
        } else {
          SpearConnector.spark.read.format(SpearCommons.SalesforceFormat).option("saql", s"$sqlText").options(params).load()
        }
      case "hive" =>
        SpearConnector.spark.sql(s"$sqlText")
      case "neo4j" =>
        SpearConnector.spark.read.format("org.neo4j.spark.DataSource")
          .options(params)
          .option("query", sqlText)
          .load()
      case _ =>
        SpearConnector.spark.read.format(sourceFormat).option("dbtable", s"($sqlText)temp").options(params).load()
    }
  }


  def sourceStream(sourceTopic: String, sourceFormat: String, params: Map[String, String], schema: StructType): DataFrame = {
    sourceFormat match {
      case "kafka" =>
        SpearConnector.spark
          .readStream
          .format(sourceFormat)
          .option("subscribe", sourceTopic)
          .options(params)
          .load()
          .selectExpr("CAST(value AS STRING)").as[String]
          .select(from_json($"value", schema).as("data"))
          .select("data.*")
      case _ =>
        SpearConnector.spark
          .readStream
          .format(sourceFormat)
          .schema(schema)
          .options(params)
          .load(sourceTopic + "/*." + sourceFormat)
    }
  }

  def sourceNOSQL(sourceObject: String, sourceFormat: String, params: Map[String, String]): DataFrame = {
    sourceFormat match {
      case "mongo" =>
        SparkSessionFunctions(SpearConnector.spark).loadFromMongoDB(ReadConfig(Map("uri" -> params.getOrElse("uri",throw new NullPointerException("No key 'uri' found in the target properties!!")).concat(s"/$sourceObject"))))
      case "cassandra" =>
        val sourceObj = sourceObject.split("\\.")
        val keySpace = sourceObj(0)
        val tableName = sourceObj(1)
        SpearConnector.spark.read.format("org.apache.spark.sql.cassandra").options(Map("keyspace" -> keySpace, "table" -> tableName) ++ params).load()
    }
  }
}
