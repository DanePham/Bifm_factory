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

package com.github.edge.roman.spear.connectors.targetAny

import com.github.edge.roman.spear.Connector
import com.github.edge.roman.spear.commons.{ConnectorCommon, SpearCommons}
import com.github.edge.roman.spear.connectors.AbstractMultiTargetConnector

class NOSQLtoAny(sourceFormat: String) extends AbstractMultiTargetConnector(sourceFormat) {

  override def source(objectName: String, params: Map[String, String]): NOSQLtoAny = {
    logger.info(s"MultiTarget connector with name:${appName} from NoSQL Object:${objectName} with format:${sourceFormat} started running !!")
    this.df = ConnectorCommon.sourceNOSQL(sourceObject = objectName, sourceFormat, params)
    logger.info(s"Reading source object:${objectName} with format:${sourceFormat} status:${SpearCommons.SuccessStatus}")
    if (this.verboseLogging) this.df.show(this.numRows, false)
    this
  }

  override def sourceSql(params: Map[String, String], sqlText: String): Connector = throw new NoSuchMethodException(s"method sourceSql is not supported for given sourceType 'nosql' for connector type 'NOSQLtoAny'")
}
