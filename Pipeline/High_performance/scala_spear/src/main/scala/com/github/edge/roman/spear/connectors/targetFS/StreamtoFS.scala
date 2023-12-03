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

package com.github.edge.roman.spear.connectors.targetFS

import com.github.edge.roman.spear.commons.{ConnectorCommon, SpearCommons}
import com.github.edge.roman.spear.connectors.AbstractTargetFSConnector
import com.github.edge.roman.spear.{Connector, SpearConnector}
import org.apache.spark.sql.types.StructType
import org.apache.spark.sql.{DataFrame, SaveMode}

class StreamtoFS(sourceFormat: String, destFormat: String) extends AbstractTargetFSConnector(sourceFormat, destFormat) {

  override def source(sourceObject: String, params: Map[String, String], schema: StructType): Connector = {
    logger.info(s"Real time streaming Connector:${appName} to Target:File System with Format:${destFormat} from streaming source object:${sourceObject} with Format:${sourceFormat} started running!!")
    //providing schema is mandatory in case of realtime streaming
    if (schema.isEmpty) {
      throw new Exception("schema is necessary while streaming in real time")
    } else {
      ConnectorCommon.sourceStream(sourceObject, sourceFormat, params, schema)
      this
    }
  }

  override def source(sourceObject: String, params: Map[String, String]): Connector = {
    val _df = SpearConnector.spark
      .readStream
      .format(sourceFormat)
      .options(params)
      .load()
    this.df = _df
    this
  }

  override def targetFS(destinationFilePath: String, destFormat: String, saveAsTable: String, params: Map[String, String], saveMode: SaveMode): Unit = {
    this.df.writeStream
      .foreachBatch { (batchDF: DataFrame, _: Long) =>
        if (destinationFilePath.isEmpty) {
          if (saveAsTable.isEmpty) {
            throw new Exception("Neither file_path nor table_name is provided for streaming data to destination")
          } else {
            batchDF.write.format(destFormat).mode(saveMode).saveAsTable(saveAsTable)
          }
        } else {
          if (saveAsTable.isEmpty) {
            batchDF.write.format(destFormat).mode(saveMode).option("path", destinationFilePath).save()
          } else {
            batchDF.write.format(destFormat).mode(saveMode).option("path", destinationFilePath).saveAsTable(saveAsTable)
          }
        }
      }.start()
      .awaitTermination()
    logger.info(s"Streaming data to target path: ${destinationFilePath} with format: ${destFormat} and saved as table ${saveAsTable} completed with status:${SpearCommons.SuccessStatus}")
    show()
  }
}
