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

def etl():
    bifm_cursor = bifm_mysql.cursor()
    bifm_cursor.execute("SELECT * FROM shopee_crawler WHERE is_extract = 0 LIMIT 50")
    shopee_data_all = bifm_cursor.fetchall()

    if len(shopee_data_all) > 0:
        for shopee_data in shopee_data_all:
            data_crawler = json.loads(shopee_data[1])
            
            if len(data_crawler['data']['sections'][0]['data']['item']) > 0:
                for shopee_item in data_crawler['data']['sections'][0]['data']['item']:
                    
                    name = shopee_item['name']
                    price = shopee_item['price']
                    description = None
                    item_id = shopee_item['itemid']
                    shop_id = shopee_item['shopid']
                    category_id = shopee_data[0]
                    images = shopee_item['images'] if 'images' in shopee_item else None
                    
                    bifm_cursor.execute("SELECT * FROM product_shopee where item_id = " + str(item_id))
                    check_data = bifm_cursor.fetchall()
                    
                    if (len(check_data) == 0):
                        val = (name, price, description, item_id, shop_id, category_id)
                        bifm_cursor.execute("INSERT INTO product_shopee (name,price,description,item_id,shop_id,category_id) VALUES (%s,%s,%s,%s,%s,%s)", val)
                        bifm_mysql.commit()
                        
                        print("Insert info shopee: " + str(item_id))
                        
                        if images is not None:
                            for thumbnail_image in images:
                                thumbnail_url =  'https://cf.shopee.vn/file/' + thumbnail_image
                                product_id = bifm_cursor.lastrowid
                                image_path = 'F:/DATA/Shoppe/' + thumbnail_image + '.jpg'
                                
                                crawlerImg(image_path, thumbnail_url)
                                
                                val = (thumbnail_url, thumbnail_image, product_id)
                                bifm_cursor.execute("INSERT INTO img_shopee (thumbnail_url,thumbnail_image,product_id) VALUES (%s,%s,%s)", val)
                                bifm_mysql.commit()
                                
                                print("Insert image shopee: " + str(bifm_cursor.lastrowid))
                    else:
                        print('Item exist: ' + str(item_id))
                # Update extract data  
                bifm_cursor.execute("UPDATE shopee_crawler SET is_extract = 1 WHERE id = " + str(shopee_data[0]))
                bifm_mysql.commit()
                print('--------------------------- Extract success DATA: ' + str(shopee_data[0]) + ' ---------------------------')
    etl()

etl()