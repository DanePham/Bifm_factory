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
    df              = pd.read_sql("SELECT * FROM bifm_product WHERE is_es = 0 ORDER BY id LIMIT 1000", dbConnection);
    # df           = pd.read_sql("select product_info.*, CONCAT('[',GROUP_CONCAT(JSON_OBJECT('thumbnail_url',thumbnail_url,'thumbnail_image',thumbnail_image)),']') AS thumb from product_info JOIN product_img ON product_info.id = product_img.product_id WHERE is_es = 0 GROUP BY id LIMIT 1000", dbConnection);
    
    if( len(df.index) > 1 ):
        try:
            list_id = tuple(df.iloc[:, 0])
        
            rows = df.to_json(orient='records')

            es = Elasticsearch()
            actions=[]

            json_data = json.loads(rows)

            for item in json_data:
                item['thumb'] = json.loads(item['thumb'])

                action = {
                    "_id": "bifm_%s"%int(item['id']),
                    "doc_type": "_doc",
                    "doc": item
                }
                actions.append(action)
                
                if item['site_id'] == 1:
                    table_product = 'product_chotot'
                if item['site_id'] == 2:
                    table_product = 'product_shopee'
                if item['site_id'] == 3:
                    table_product = 'product_lazada'
                if item['site_id'] == 4:
                    table_product = 'product_tiki'
                
                bifm_cursor.execute( "UPDATE " +table_product+ " SET is_es = 1 WHERE id = " + str(item['id']) )
                bifm_mysql.commit()

            response = helpers.bulk(es, actions, index="bifm", doc_type='_doc')
            

            # dbConnection.close()
            print("-------------------- Run pipeline ES from: " + str(min(list_id)) + " -> " + str(max(list_id)))
            es_pipeline()
        except Exception as error:
            bifm_mysql.rollback()
            print("An exception occurred:", error)
        dbConnection.close()
    else:
        print("-------------------- Run pipeline ES finish --------------------")
    
es_pipeline()