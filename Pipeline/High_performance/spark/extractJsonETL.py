import os
import sys

os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable
# Imports
from pyspark.sql import SparkSession

# Create SparkSession
spark = SparkSession.builder.appName('SparkByExamples.com').config("spark.jars", "mysql-connector-j-8.1.0.jar").getOrCreate()

def extract():
    global df
    # Read from MySQL Table
    df = spark.read \
        .format("jdbc") \
        .option("driver","com.mysql.jdbc.Driver") \
        .option("url", "jdbc:mysql://localhost:3306/bifm") \
        .option("user", "root") \
        .option("password", "") \
        .option("query", "select * from chotot_crawler where is_extract = 0") \
        .option("numPartitions",5) \
        .option("fetchsize", 20) \
        .load()
        
    df.show()
    
    print("extract") 

def transform():
    print("transform") 

def load():
    # Write to MySQL Table
    df.write \
      .format("jdbc") \
      .option("driver","com.mysql.jdbc.Driver") \
      .option("url", "jdbc:mysql://localhost:3306/bifm") \
      .option("dbtable", "chotot_crawler_2") \
      .option("user", "root") \
      .option("password", "") \
      .save()
    
    print("load") 

# Create DataFrame 
# columns = ["id", "name","age","gender"]
# data = [(1, "James",30,"M"), (2, "Ann",40,"F"),
#     (3, "Jeff",41,"M"),(4, "Jennifer",20,"F")]

# sampleDF = spark.sparkContext.parallelize(data).toDF(columns)

extract() 
transform()
load()