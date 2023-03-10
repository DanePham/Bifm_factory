import mysql.connector
from os import path
from multiprocessing import Process
import requests
from multiprocessing import Pool

bifm_mysql = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="",
    database="bifm",
    charset="utf8mb4"
)
bifm_cursor = bifm_mysql.cursor()

def crawlerImg(image_path, thumbnail_url, table_name, id):
    try:
        if path.exists(image_path) is False:
            img_data = requests.get(thumbnail_url).content
            with open(image_path, 'wb') as handler:
                handler.write(img_data)
            print('Download img: ' + image_path)
        update_table(table_name, id, 1)
    except:
        update_table(table_name, id, 2)

def update_table(table_name, id, is_crawler = 1):
    bifm_cursor.execute("UPDATE "+table_name+" SET is_crawler = "+str(is_crawler)+" WHERE id = " + str(id))
    bifm_mysql.commit()

def check_img(list_pool):
    table_name = list_pool[0]
    store_img = list_pool[1]

    bifm_cursor.execute("SELECT * FROM "+table_name+" WHERE is_crawler = 0 LIMIT 10000")
    data_all = bifm_cursor.fetchall()

    if len(data_all) > 0:
        for data in data_all:
            id = data[0]
            thumbnail_url = data[1]
            thumbnail_image = data[2]
            image_path = 'F:/DATA/'+store_img+'/' + thumbnail_image
            
            crawlerImg(image_path, thumbnail_url, table_name, id)

def check_img_all():  
    with Pool(4) as p:
        print(p.map(check_img, [["img_chotot","Chotot"], ["img_lazada","Lazada"], ["img_shopee","Shoppe"], ["img_tiki","Tiki"]] ))  

if __name__ == '__main__':
    check_img_all()