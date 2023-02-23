import mysql.connector
import json
import os
from os import path
from urllib.parse import urlparse
import requests
from ftfy import fix_encoding

bifm_mysql = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="",
    database="bifm",
    charset="utf8mb4"
)
bifm_cursor = bifm_mysql.cursor()

LIMIT_NUMBER = str(50)

def insert_info(bifm_cursor, val, site_name):
    bifm_cursor.execute("INSERT INTO product_info (name, price, description, item_id, shop_id, seller_id, category_id, review_id, site_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)", val)
    bifm_mysql.commit()
    product_info_id = bifm_cursor.lastrowid
    print("Integrate info "+site_name+": " + str(product_info_id))
    return product_info_id

def insert_img(bifm_cursor, val, site_name):
    bifm_cursor.execute("INSERT INTO product_img (thumbnail_url, thumbnail_image, product_id, site_id) VALUES (%s,%s,%s,%s)", val)
    bifm_mysql.commit()
    print("Integrate image "+site_name+": " + str(bifm_cursor.lastrowid))
    
def update_combine(table_name, id, is_combine = 1):
    bifm_cursor.execute("UPDATE "+table_name+" SET is_combine = "+str(is_combine)+" WHERE id = " + str(id))
    bifm_mysql.commit()
    print('--------------------------- Integration success DATA: ' + str(id) + ' ---------------------------')  

def integration_chotot():
    # get infos
    bifm_cursor.execute("SELECT * FROM product_chotot WHERE is_combine = 0 LIMIT " + LIMIT_NUMBER)
    chotot_data_all = bifm_cursor.fetchall()
    
    if len(chotot_data_all) > 0:
        for chotot_data in chotot_data_all:
            id = chotot_data[0]
            # get images
            bifm_cursor.execute("SELECT * FROM img_chotot WHERE product_id = " + str(id))
            chotot_img_all = bifm_cursor.fetchall()
            
            if len(chotot_img_all) > 0:
                name = fix_encoding(chotot_data[1])
                price = chotot_data[2]
                description = fix_encoding(chotot_data[3])
                item_id = chotot_data[4]
                category_id = chotot_data[5]
                
                val = (name, price, description, item_id, None, None,category_id, None, 1)
                product_info_id = insert_info(bifm_cursor, val, "chotot")
                
                for chotot_img in chotot_img_all:
                    thumbnail_url = chotot_img[1]
                    thumbnail_image = chotot_img[2]
                    
                    val = (thumbnail_url, thumbnail_image, product_info_id, 1)
                    insert_img(bifm_cursor, val, "chotot")
                    
                update_combine("product_chotot", id)
            else:
                update_combine("product_chotot", id, 2)

def integration_lazada():
    # get infos
    bifm_cursor.execute("SELECT * FROM product_lazada WHERE is_combine = 0 LIMIT " + LIMIT_NUMBER)
    lazada_data_all = bifm_cursor.fetchall()
    # check exist infos
    if len(lazada_data_all) > 0:
        for lazada_data in lazada_data_all:
            id = lazada_data[0]
            # get images
            bifm_cursor.execute("SELECT * FROM img_lazada WHERE product_id = " + str(id))
            lazada_img_all = bifm_cursor.fetchall()
            # check exist images
            if len(lazada_img_all) > 0:
                name = fix_encoding(lazada_data[1])
                price = lazada_data[2]
                description = None
                item_id = lazada_data[4]
                seller_id = lazada_data[5]
                category_id = lazada_data[6]
                
                val = (name, price, description, item_id, None, seller_id,category_id, None, 3)
                product_info_id = insert_info(bifm_cursor, val, "lazada")
                
                for lazada_img in lazada_img_all:
                    thumbnail_url = lazada_img[1]
                    thumbnail_image = lazada_img[2]
                    
                    val = (thumbnail_url, thumbnail_image, product_info_id, 3)
                    insert_img(bifm_cursor, val, "lazada")
                
                update_combine("product_lazada", id)
            else:
                update_combine("product_lazada", id, 2)        
            

def integration_shopee():
    # get infos
    bifm_cursor.execute("SELECT * FROM product_shopee WHERE is_combine = 0 LIMIT " + LIMIT_NUMBER)
    shopee_data_all = bifm_cursor.fetchall()
    # check exist infos
    if len(shopee_data_all) > 0:
        for shopee_data in shopee_data_all:
            id = shopee_data[0]
            # get images
            bifm_cursor.execute("SELECT * FROM img_shopee WHERE product_id = " + str(id))
            shopee_img_all = bifm_cursor.fetchall()
            # check exist images
            if len(shopee_img_all) > 0:
                name = fix_encoding(shopee_data[1])
                price = shopee_data[2]
                description = None
                item_id = shopee_data[4]
                shop_id = shopee_data[5]
                category_id = shopee_data[6]
                
                val = (name, price, description, item_id, shop_id, None,category_id, None, 2)
                product_info_id = insert_info(bifm_cursor, val, "shopee")
                
                for shopee_img in shopee_img_all:
                    thumbnail_url = shopee_img[1]
                    thumbnail_image = shopee_img[2]
                    
                    val = (thumbnail_url, thumbnail_image, product_info_id, 2)
                    insert_img(bifm_cursor, val, "shopee")
                
                update_combine("product_shopee", id)
            else:
                update_combine("product_shopee", id, 2)

def integration_tiki():
    # get infos
    bifm_cursor.execute("SELECT * FROM product_tiki WHERE is_combine = 0 LIMIT " + LIMIT_NUMBER)
    tiki_data_all = bifm_cursor.fetchall()
    # check exist infos
    if len(tiki_data_all) > 0:
        for tiki_data in tiki_data_all:
            id = tiki_data[0]
            # get images
            bifm_cursor.execute("SELECT * FROM img_tiki WHERE product_id = " + str(id))
            tiki_img_all = bifm_cursor.fetchall()
            # check exist images
            if len(tiki_img_all) > 0:
                name = fix_encoding(tiki_data[1])
                price = tiki_data[2]
                description = None
                item_id = tiki_data[4]
                seller_id = tiki_data[5]
                category_id = tiki_data[6]
                
                val = (name, price, description, item_id, None, seller_id,category_id, None, 4)
                product_info_id = insert_info(bifm_cursor, val, "tiki")
                
                for tiki_img in tiki_img_all:
                    thumbnail_url = tiki_img[1]
                    thumbnail_image = tiki_img[2]
                    
                    val = (thumbnail_url, thumbnail_image, product_info_id, 4)
                    insert_img(bifm_cursor, val, "tiki")
                  
                update_combine("product_tiki", id)
            else:
                update_combine("product_tiki", id, 2)  
                

def etl_bifm():
    integration_chotot()
    integration_lazada()
    integration_shopee()
    integration_tiki()
    
    etl_bifm()
    
    
etl_bifm()