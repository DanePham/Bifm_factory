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
bifm_cursor.execute("SELECT * FROM lazada_crawler WHERE is_extract = 0 LIMIT 100")
lazada_data_all = bifm_cursor.fetchall()
print(len(lazada_data_all))