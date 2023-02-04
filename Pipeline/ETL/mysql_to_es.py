from sqlalchemy import create_engine
import pymysql
import pandas as pd
import json

from elasticsearch import Elasticsearch
from elasticsearch import helpers

CONSTR = 'mysql+pymysql://root:root@127.0.0.1/bifm'
sqlEngine       = create_engine(CONSTR, pool_recycle=3600)
dbConnection    = sqlEngine.connect()
df           = pd.read_sql("select * from product_info", dbConnection);

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