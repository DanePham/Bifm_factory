import os
import sys

os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable
# Imports
from pyspark import SparkContext
sc=SparkContext()
# sc is an existing SparkContext.
from pyspark.sql import SQLContext, Row
sqlContext = SQLContext(sc)

from pyspark.sql import SparkSession
import json
from ftfy import fix_encoding 
import pandas as pd
from pyspark.sql.functions import upper, from_json, col, lit

# Create SparkSession
spark = SparkSession.builder.appName('SparkByExamples.com').config("spark.jars", "mysql-connector-j-8.1.0.jar").getOrCreate()

def extract():
    print("extract") 
    
    global df
    # Read from MySQL Table
    df = spark.read \
        .format("jdbc") \
        .option("driver","com.mysql.cj.jdbc.Driver") \
        .option("url", "jdbc:mysql://localhost:3306/bifm") \
        .option("user", "root") \
        .option("password", "") \
        .option("query", "select * from chotot_crawler_2") \
        .option("numPartitions",5) \
        .option("fetchsize", 20) \
        .load()
    df.show()

def transform():
    print("transform") 
    
    global df_trans
    
    # Define data structure of dataframe transform
    # df_trans = pd.DataFrame(columns=['name', 'price', 'description', 'uri', 'url', 'item_id', 'category_id', 'review_id'])
    # # With the itertuples method
    # for row in df.rdd.toLocalIterator():
    #     data_crawler = json.loads(row['data_crawler'])
    #     item = data_crawler['ad'];
        
    #     name = fix_encoding(item['subject']);
    #     price = item['price'] or None;
    #     description = item['body'];
    #     uri = None;
    #     url = row['link_url'];
    #     item_id = item['ad_id'];
    #     category_id = item['category'];
    #     # images = item['images'] or None;
        
    #     df_trans.loc[len(df_trans.index)] = [name, price, description, uri, url, item_id, category_id, None] 
        
    # select id and name column using map()
    # df_trans = df.rdd.map(lambda loop: 
    #     ( 
    #         json.loads(loop['data_crawler'])['ad']['subject'], 
    #         json.loads(loop['data_crawler'])['ad']['price'], 
    #         json.loads(loop['data_crawler'])['ad']['body'], 
    #         None, 
    #         loop['link_url'], 
    #         json.loads(loop['data_crawler'])['ad']['ad_id'], 
    #         json.loads(loop['data_crawler'])['ad']['category'],
    #         None
    #     )
    # )
    
    # new_df = sqlContext.read.json(df.rdd.map(lambda r: Row(crwler=r.data_crawler,  link=r.link_url)))
    new_df = sqlContext.read.json(df.rdd.map(lambda r: r.data_crawler))
    # new_df.printSchema()
    
    df_trans = new_df.select(col('ad.subject').alias("name"), 
                        'ad.price', 
                        col('ad.body').alias("description"), 
                        lit('NULL').alias('url'), 
                        lit('NULL').alias('uri'), 
                        col('ad.ad_id').alias("item_id"), 
                        col('ad.category').alias("category_id"),
                        lit(0).alias('review_id'),
                        lit(0).alias('is_es'))
    df_trans.show()

def load():
    # Write to MySQL Table
    df_trans.write \
      .format("jdbc") \
      .option("driver","com.mysql.cj.jdbc.Driver") \
      .option("url", "jdbc:mysql://localhost:3306/bifm") \
      .option("dbtable", "product_chotot_2") \
      .option("user", "root") \
      .option("password", "") \
      .mode('append') \
      .save()
    
    print("load") 

extract() 
transform()
load()