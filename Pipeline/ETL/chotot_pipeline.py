import mysql.connector
import json
import os
from os import path
from urllib.parse import urlparse
import requests

bifm_mysql = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="",
    database="bifm",
    charset="utf8mb4"
)

bifm_cursor = bifm_mysql.cursor()
bifm_cursor.execute("SELECT * FROM chotot_crawler")
chotot_data_all = bifm_cursor.fetchall()

for chotot_data in chotot_data_all:
    try:
        data_crawler = json.loads(chotot_data[1])
            
        item_id = data_crawler['ad']['ad_id']
        name = data_crawler['ad']['subject']
        price = data_crawler['ad']['price'] if 'price' in data_crawler['ad'] else 0
        description = data_crawler['ad']['body']
        category_id = data_crawler['ad']['category']
        images = data_crawler['ad']['images'] if 'images' in data_crawler['ad'] else None
        
        bifm_cursor.execute("SELECT * FROM product_chotot where item_id = " + str(item_id))
        check_data = bifm_cursor.fetchall()
        
        if (len(check_data) == 0):
            val = (item_id, name, price, description, category_id)
            bifm_cursor.execute("INSERT INTO product_chotot (item_id,name,price,description,category_id) VALUES (%s,%s,%s,%s,%s)", val)
            bifm_mysql.commit()

            print("Insert info chotot: " + str(item_id))
            
            if images is not None:
                for thumbnail_url in images:
                    thumbnail_image = os.path.basename(urlparse(thumbnail_url).path)
                    product_id = bifm_cursor.lastrowid
                    image_path = 'C:/DSOFT/DATA/Chotot/' + thumbnail_image
                    
                    if path.exists(image_path) is False:
                        with open(image_path, 'wb') as handle:
                            response = requests.get(thumbnail_url, stream=True)

                            if not response.ok:
                                print(response)

                            for block in response.iter_content(1024):
                                if not block:
                                    break

                                handle.write(block)
                    
                    val = (thumbnail_url, thumbnail_image, product_id)
                    bifm_cursor.execute("INSERT INTO img_chotot (thumbnail_url,thumbnail_image,product_id) VALUES (%s,%s,%s)", val)
                    bifm_mysql.commit()
                    
                    print("Insert image chotot: " + str(bifm_cursor.lastrowid))
        else:
            print("Exist info chotot: " + str(item_id))
    except print(chotot_data):
        print(data_crawler)
        # pass
