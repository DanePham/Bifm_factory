from sqlalchemy import create_engine
import pymysql
import pandas as pd
import json
import mysql.connector

from elasticsearch import Elasticsearch
from elasticsearch import helpers

bifm_mysql = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="",
    database="bifm",
    charset="utf8mb4"
)
bifm_cursor = bifm_mysql.cursor()

def es_pipeline():
    CONSTR = 'mysql+pymysql://root:@127.0.0.1/bifm'
    sqlEngine       = create_engine(CONSTR, pool_recycle=3600)
    dbConnection    = sqlEngine.connect()
    df           = pd.read_sql("select * from product_info WHERE is_es = 0 LIMIT 1000", dbConnection);
    
    if( len(df.index) > 1 ):
        list_id = tuple(df.iloc[:, 0])
        
        rows = df.to_json(orient='records')

        es = Elasticsearch()
        actions=[]

        json_data = json.loads(rows)

        for item in json_data:
            action = {
                "_id": "bifm_%s"%int(item['id']),
                "doc_type": "_doc",
                "doc": item
            }
            actions.append(action)

        response = helpers.bulk(es, actions, index="bifm", doc_type='_doc')
        

        dbConnection.close()

        bifm_cursor.execute( "UPDATE product_info SET is_es = 1 WHERE id IN " + str(list_id) )
        bifm_mysql.commit()
        print("-------------------- Run pipeline ES from: " + str(min(list_id)) + " -> " + str(max(list_id)))
        es_pipeline()
    else:
        print("-------------------- Run pipeline ES finish --------------------")
    
es_pipeline()