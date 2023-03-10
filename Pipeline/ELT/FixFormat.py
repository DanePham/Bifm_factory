import mysql.connector
from os import path
from multiprocessing import Process
import requests
from multiprocessing import Pool
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

bifm_cursor.execute("SELECT * FROM product_tiki")
data_all = bifm_cursor.fetchall()


for data in data_all:
    id = data[0]
    name = fix_encoding(data[1])
    
    sql = "UPDATE product_tiki SET name = %s WHERE id = %s"
    
    bifm_cursor.execute(sql, (name, id))
    bifm_mysql.commit()

    # print(id, name)