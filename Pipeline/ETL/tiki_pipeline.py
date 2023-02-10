import mysql.connector
import json
import os
from os import path
from urllib.parse import urlparse
import requests

def crawlerImg(image_path, thumbnail_url):
    try:
        if path.exists(image_path) is False:
            img_data = requests.get(thumbnail_url).content
            with open(image_path, 'wb') as handler:
                handler.write(img_data)
    except print('Error crawlerImg: ' + str(thumbnail_url)):
        crawlerImg(image_path, thumbnail_url)

bifm_mysql = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="root",
    database="bifm",
    charset="utf8mb4"
)

bifm_cursor = bifm_mysql.cursor()
bifm_cursor.execute("SELECT * FROM tiki_crawler")
tiki_data_all = bifm_cursor.fetchall()

for tiki_data in tiki_data_all:
    data_crawler = json.loads(tiki_data[1])
    if len(data_crawler['data']) > 0:
        for tiki_item in data_crawler['data']:
            name = tiki_item['name']
            price = tiki_item['price']
            description = None
            item_id = tiki_item['id']
            seller_id = tiki_item['seller_product_id']
            category_id = tiki_item['primary_category_path'].split('/')[-1]
            thumbnail_url = tiki_item['thumbnail_url']
            
            
            bifm_cursor.execute("SELECT * FROM product_tiki where item_id = " + str(item_id))
            check_data = bifm_cursor.fetchall()
            
            if (len(check_data) == 0):
                val = (name, price, description, item_id, seller_id, category_id)
                bifm_cursor.execute("INSERT INTO product_tiki (name,price,description,item_id,seller_id,category_id) VALUES (%s,%s,%s,%s,%s,%s)", val)
                bifm_mysql.commit()
                
                print("Insert info tiki: " + str(item_id))
                
                if thumbnail_url is not None:
                    thumbnail_image = os.path.basename(urlparse(thumbnail_url).path)
                    product_id = bifm_cursor.lastrowid
                    image_path = 'C:/DSOFT/DATA/Tiki/' + thumbnail_image
                    
                    crawlerImg(image_path, thumbnail_url)
                    
                    val = (thumbnail_url, thumbnail_image, product_id)
                    bifm_cursor.execute("INSERT INTO img_tiki (thumbnail_url,thumbnail_image,product_id) VALUES (%s,%s,%s)", val)
                    bifm_mysql.commit()
                    
                    print("Insert image tiki: " + str(bifm_cursor.lastrowid))
            else:
                print('Item exist: ' + str(item_id))
