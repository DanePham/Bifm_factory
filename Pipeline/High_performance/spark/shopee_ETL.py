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
# spark = SparkSession \
#     .builder \
#     .appName("SparkByExamples.com") \
#     .config("spark.jars", "mysql-connector-j-8.1.0.jar") \
#     .config("spark.memory.fraction", 0.8) \
#     .config("spark.executor.memory", "1g") \
#     .config("spark.driver.memory", "1g")\
#     .config("spark.sql.shuffle.partitions" , "800") \
#     .getOrCreate()

spark = SparkSession \
    .builder \
    .appName("SparkByExamples.com") \
    .config("spark.jars", "mysql-connector-j-8.1.0.jar") \
    .config("spark.executor.memory", "1g") \
    .config("spark.driver.memory", "1g")\
    .getOrCreate()
    
# spark = SparkSession \
#   .builder \
#   .appName("SparkByExamples.com") \
#   .config("spark.jars", "mysql-connector-j-8.1.0.jar") \
#   .getOrCreate()

def extract():
    print("extract") 
    
    global df
    # Read from MySQL Table        
    df = spark.read \
        .format("jdbc") \
        .option("driver","com.mysql.cj.jdbc.Driver") \
        .option("url", "jdbc:mysql://localhost:3306/bifm?sessionVariables=sql_mode='NO_ENGINE_SUBSTITUTION'&jdbcCompliantTruncation=false") \
        .option("user", "root") \
        .option("password", "") \
        .option("dbtable", "shopee_crawler") \
        .option("partitionColumn","id") \
        .option("lowerBound", 1) \
        .option("upperBound", 10) \
        .option("numPartitions", 1) \
        .option("fetchsize",1) \
        .load()
    # df = spark.read \
    #     .format("jdbc") \
    #     .option("driver","com.mysql.cj.jdbc.Driver") \
    #     .option("url", "jdbc:mysql://localhost:3306/bifm?sessionVariables=sql_mode='NO_ENGINE_SUBSTITUTION'&jdbcCompliantTruncation=false") \
    #     .option("user", "root") \
    #     .option("password", "") \
    #     .option("dbtable", "shopee_crawler") \
    #     .option("numPartitions", 5) \
    #     .option("partitionColumn", "id") \
    #     .option("lowerBound", 1) \
    #     .option("upperBound", 1000) \
    #     .load()
    
    # df.head(5)

def transform():
    print("transform") 
    
    global df_trans
    # new_df = sqlContext.read.json(df.rdd.map(lambda r: r.data_crawler))
    # new_df.printSchema()
    
    # df_trans = new_df.select(col('ad.subject').alias("name"), 
    #                     'ad.price', 
    #                     col('ad.body').alias("description"), 
    #                     lit('NULL').alias('url'), 
    #                     lit('NULL').alias('uri'), 
    #                     col('ad.ad_id').alias("item_id"), 
    #                     col('ad.category').alias("category_id"),
    #                     lit(0).alias('review_id'),
    #                     lit(0).alias('is_es'))
    # df_trans.show()

def load():
    print("load") 
    # Write to MySQL Table
    # df_trans.write \
    #   .format("jdbc") \
    #   .option("driver","com.mysql.cj.jdbc.Driver") \
    #   .option("url", "jdbc:mysql://localhost:3306/bifm") \
    #   .option("dbtable", "product_chotot_2") \
    #   .option("user", "root") \
    #   .option("password", "") \
    #   .mode('append') \
    #   .save()
    
    # Count rows
    row_count = df.count()

    print(f'The DataFrame has {row_count} rows.')
    
    df.write \
      .format("jdbc") \
      .option("driver","com.mysql.cj.jdbc.Driver") \
      .option("url", "jdbc:mysql://localhost:3306/bifm") \
      .option("dbtable", "product_shopee_3") \
      .option("user", "root") \
      .option("password", "") \
      .mode('append') \
      .save()

extract() 
transform()
load()