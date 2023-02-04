import pymongo
import mysql.connector

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

db = client["chotot"]
col = db["product"]
try:
    for item in col.find().limit(500):
        sql = "INSERT INTO product_info (name,price,description) VALUES (%s,%s,%s)"
        price = None
        if "price_string" in item['data_crawler']['ad']:
            price = item['data_crawler']['ad']['price_string']
        val = (item['data_crawler']['ad']['subject'], price, item['data_crawler']['ad']['body'])
        bifmEcursor.execute(sql, val)

        bifmE.commit()

        print(bifmEcursor.rowcount, "item chotot inserted.")
except:
    print(item['_id'])


db = client["lazada"]
col = db["product"]
try:
    for item in col.find().limit(500):
        
        sql = "INSERT INTO product_info (name,price,description) VALUES (%s,%s,%s)"
        val = (item['name'], item['price'], item['product_url'])
        bifmEcursor.execute(sql, val)
        
        bifmE.commit()

        print(bifmEcursor.rowcount, "item lazada inserted.")
except:
    print(item['_id'])


db = client["tiki"]
col = db["product"]
try:
    for item in col.find().limit(500):
        
        sql = "INSERT INTO product_info (name,price,description) VALUES (%s,%s,%s)"
        val = (item['name'], item['price'], item['thumbnail_url'])
        bifmEcursor.execute(sql, val)
        
        bifmE.commit()

        print(bifmEcursor.rowcount, "item tiki inserted.")
except:
    print(item['_id'])


db = client["shopee"]
col = db["product"]
try:
    for item in col.find().limit(500):
        
        sql = "INSERT INTO product_info (name,price,description) VALUES (%s,%s,%s)"
        val = (item['title'], item['price'], item['imgUrl'])
        bifmEcursor.execute(sql, val)
        
        bifmE.commit()

        print(bifmEcursor.rowcount, "item shopee inserted.")
except:
    print(item['_id'])



