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
    password="",
    database="bifm",
    charset="utf8mb4"
)

bifm_cursor = bifm_mysql.cursor()
bifm_cursor.execute("SELECT * FROM lazada_crawler")
lazada_data_all = bifm_cursor.fetchall()

for lazada_data in lazada_data_all:
    data_crawler = json.loads(lazada_data[1])
    if len(data_crawler['mods']['listItems']) > 0:
        for lazada_item in data_crawler['mods']['listItems']:
            name = lazada_item['name']
            price = lazada_item['price']
            description = None
            item_id = lazada_item['itemId']
            seller_id = lazada_item['sellerId']
            category_id = lazada_item['categories'][0]
            thumbs = lazada_item['thumbs'] if 'thumbs' in lazada_item else None
            
            bifm_cursor.execute("SELECT * FROM product_lazada where item_id = " + str(item_id))
            check_data = bifm_cursor.fetchall()
            
            if (len(check_data) == 0):
                val = (name, price, description, item_id, seller_id, category_id)
                bifm_cursor.execute("INSERT INTO product_lazada (name,price,description,item_id,seller_id,category_id) VALUES (%s,%s,%s,%s,%s,%s)", val)
                bifm_mysql.commit()
                
                print("Insert info lazada: " + str(item_id))
                
                if thumbs is not None:
                    for image in thumbs:
                        thumbnail_url = image['image']
                        thumbnail_image = os.path.basename(urlparse(thumbnail_url).path)
                        product_id = bifm_cursor.lastrowid
                        image_path = 'C:/DSOFT/DATA/Lazada/' + thumbnail_image
                        
                        crawlerImg(image_path, thumbnail_url)
                        
                        val = (thumbnail_url, thumbnail_image, product_id)
                        bifm_cursor.execute("INSERT INTO img_lazada (thumbnail_url,thumbnail_image,product_id) VALUES (%s,%s,%s)", val)
                        bifm_mysql.commit()
                        
                        print("Insert image lazada: " + str(bifm_cursor.lastrowid))
            else:
                print('Item exist: ' + str(item_id))
