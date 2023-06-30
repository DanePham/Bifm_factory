const { performance } = require("perf_hooks");

let mysql = require("mysql");
var url = require("url");
var path = require("path");

const config = {
  host: "localhost",
  user: "root",
  password: "",
  database: "bifm",
  port: 3306,
  charset: "utf8mb4",
};

const LIMIT = 300;

const OFFSET = 0; 

const params = [
  {
    site: 'lazada', 
    tableCrawler: 'lazada_crawler'
  },
  {
    site: 'chotot', 
    tableCrawler: 'chotot_crawler'
  },
  {
    site: 'shopee', 
    tableCrawler: 'shopee_crawler'
  },
  {
    site: 'tiki', 
    tableCrawler: 'tiki_crawler'
  }
]; 

const workerData = {
  workerId: 1,
  params: params[0],
  limit: LIMIT,
  offset: OFFSET
};

//connect to database
const connection = mysql.createConnection(config);
const pool = mysql.createPool(config);

async function loadDataPipeline(){
  return await new Promise(async (resolve) => {
    connection.connect(function (err) {
      var tb_crawler = workerData.params.tableCrawler;
      var limit_number = workerData.limit;
      // var offset_number = workerData.params.offset * limit_number;
      var offset_number = workerData.offset * limit_number;

      var sql = `SELECT * FROM ${tb_crawler} WHERE is_extract = 0 LIMIT ${limit_number} OFFSET ${offset_number}`;

      connection.query(sql, function (err, results) {
        if (err) throw err;
        console.log('this is site: ' + workerData.params.site + " length " + results.length);

        resolve(results);
      });

      connection.end();
    });
  });
}

async function insertInfo(sql, value){
  return await new Promise(async (resolve) => {
    pool.query(sql, [value], (error, result) => {
      if (error) throw error;

      console.log(`Import info: ${result.insertId} | Site: ${workerData.params.site}`);

      resolve(result.insertId);
    });
  });
}

async function insertImg(sql, value){
  pool.query(sql, [value], (error, result) => {
    if (error) throw error;

    console.log(`Import img: ${result.insertId} | Site: ${workerData.params.site}`);
  });
}

function updateExtract(recordId){
  const sqlUpdate = `UPDATE ${workerData.params.tableCrawler} SET is_extract = 1 WHERE id = ${recordId}`;

  pool.query(sqlUpdate, [], (error, result) => {
    if (error) throw error;

    console.log(`Update crawler success: ${recordId} | Site: ${workerData.params.site}`);
  });
}

async function transDataPipeline(data){
  data.forEach(function(value, key){
    const dataJson = JSON.parse(value.data_crawler);
    const lazadaItems = dataJson.mods.listItems;

    if (lazadaItems.length > 0) {
      for (let j = 0; j < lazadaItems.length; j++) {
        const name = lazadaItems[j].name;
        const price = lazadaItems[j].price;
        const description = null;
        const item_id = lazadaItems[j].itemId;
        const seller_id = lazadaItems[j].sellerId;
        const category_id = lazadaItems[j].categories[0];
        const thumbs = lazadaItems[j].thumbs;

        exportDataPipeline(name, price, description, item_id, seller_id, category_id, thumbs);
      }
    }

    updateExtract(value.id);
  });
}

async function exportDataPipeline(name, price, description, item_id, seller_id, category_id, thumbs){
  const sqlInfo = `INSERT INTO product_lazada (name, price, description, item_id, seller_id, category_id) VALUES ?`;
  let values = [[name, price, description, item_id, seller_id, category_id]];
  const productIdDb = await insertInfo(sqlInfo, values);
  
  const sqlImg = `INSERT INTO img_lazada (thumbnail_url, thumbnail_image, product_id) VALUES ?`;
  if( thumbs !== null && thumbs.length > 0 ){
    for (let i = 0; i < thumbs.length; i++) {
      if( thumbs[i].image !== '' ){
        const parsed = url.parse(thumbs[i].image);
        const thumbnail_image = path.basename(parsed.pathname);
        let values = [[thumbs[i].image, thumbnail_image, productIdDb]];
  
        insertImg(sqlImg, values);
      }    
    }
  }
}

(async () => {
  const data = await loadDataPipeline();

  transDataPipeline(data); 

})();