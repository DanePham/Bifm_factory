from sqlalchemy import create_engine
import pandas as pd
import json
import mysql.connector
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

CONSTR = 'mysql+pymysql://root:@127.0.0.1/bifm'
sqlEngine       = create_engine(CONSTR, pool_recycle=3600)
dbConnection    = sqlEngine.connect()
df              = pd.read_sql("SELECT * FROM chotot_crawler_2 LIMIT 5", dbConnection);



# df = pd.DataFrame(inp)
# print (df)

# With the iterrows method
# for index, row in df.iterrows():
#     df['data_crawler'] = df['data_crawler'].apply(lambda x: x.encode('ascii', 'ignore').decode('ascii'))
#     df['link_url'] = df['link_url'].apply(lambda x: x.encode('ascii', 'ignore').decode('ascii'))
    # print(row["data_crawler"], row["link_url"])
    # print(5421412)

# Define data structure of dataframe transform
df_trans = pd.DataFrame(columns=['name', 'price', 'description', 'uri', 'url', 'item_id', 'category_id', 'images'])
# With the itertuples method
for row in df.itertuples(index=True, name='Pandas'):
    data_crawler = json.loads(row.data_crawler)
    item = data_crawler['ad'];
    
    name = fix_encoding(item['subject']);
    price = item['price'] or None;
    description = item['body'];
    uri = None;
    url = row.link_url;
    item_id = item['ad_id'];
    category_id = item['category'];
    images = item['images'] or None;
    
    df_trans.loc[len(df_trans.index)] = [name, price, description, uri, url, item_id, category_id, images] 
    
print(df_trans)