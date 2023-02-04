import pymongo
import mysql.connector

import os

import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

client = pymongo.MongoClient("mongodb://localhost:27017/")

bifmE = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="root",
    database="bifm",
    charset="utf8mb4"
)

bifmEcursor = bifmE.cursor()

db = client["shopee"]
col = db["product_list"]

data_mongo = col.find().limit(500)[0]
# data_mongo_str = JSONEncoder().encode(data_mongo)

# for item in data[0].items():
#     print(item[0])

# data_dump = json.dumps(data_mongo_str)
# data = json.loads(data_mongo_str)

# JSONEncoder().encode(data_mongo)

print(data_mongo)

os._exit(1)

for item in data:
    data_list = item.items
    for data_item in data_list:
        print(data_item)
        break

# print(data[0].items()[0])

# try:
#     for item in col.find().limit(500):
        
#         sql = "INSERT INTO product_info (name,price,description) VALUES (%s,%s,%s)"
#         val = (item['title'], item['price'], item['imgUrl'])
#         bifmEcursor.execute(sql, val)
        
#         bifmE.commit()

#         print(bifmEcursor.rowcount, "item shopee inserted.")
# except:
#     print(item['_id'])



