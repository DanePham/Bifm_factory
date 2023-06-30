let mysql = require("mysql");
var url = require("url");
var path = require("path");

const config = {
  host: "localhost",
  user: "root",
  password: "",
  database: "testdb",
  port: 3306,
  charset: "utf8mb4",
};

const chotot = 'chotot';

//connect to database
const connection = mysql.createConnection(config);
const pool = mysql.createPool(config);

var operationsCompleted = 0;
function operation() {
    ++operationsCompleted;
    console.log('This is operationsCompleted: ' ,operationsCompleted)
    // if (operationsCompleted === 100) after_forloop(); 
    if (operationsCompleted === 100) console.log("Finish"); 
}

const factory = {
  insertInfo: async function(sql, value){
    return await new Promise(async (resolve) => {
      pool.query(sql, [value], (error, result) => {
        if (error) throw error;

        console.log(`Import info: ${result.insertId} | Site: ${chotot}`);

        resolve(result.insertId);
      });
    });
  },
  insertImg: function(sql, value){
    pool.query(sql, [value], (error, result) => {
      if (error) throw error;

      console.log(`Import img: ${result.insertId} | Site: ${chotot}`);
    });
  },
  updateExtract: function(recordId){
    const sqlUpdate = `UPDATE chotot_crawler SET is_extract = 1 WHERE id = ${recordId}`;

    pool.query(sqlUpdate, [], (error, result) => {
      if (error) throw error;

      console.log(`Update crawler success: ${recordId} | Site: ${chotot}`);
    });
  },
  loadDataPipeline: async function(){
    return await new Promise(async (resolve) => {
      connection.connect(function (err) {
        var tb_crawler = 'chotot_crawler';
        var limit_number = 100;
        var offset_number = 0;
  
        var sql = `SELECT * FROM ${tb_crawler} WHERE is_extract = 0 LIMIT ${limit_number} OFFSET ${offset_number}`;
  
        connection.query(sql, function (err, results) {
          if (err) throw err;
          console.log('this is site: ' + chotot + " length " + results.length);
  
          resolve(results);
        });
  
        connection.end();
      });
    });
  },
  chotot : {
    transDataPipeline : function(data){
      data.forEach(function(value, key){
        const dataJson = JSON.parse(value.data_crawler);
        const chototItems = dataJson.ad;

        const name = chototItems.subject;
        const price = chototItems.price ?? null;
        const description = chototItems.body;
        const item_id = chototItems.ad_id;
        const category_id = chototItems.category;
        const images = chototItems.images ?? null;
  
        factory[chotot].exportDataPipeline(name, price, description, item_id, category_id, images);
        factory.updateExtract(value.id);

        operation();
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, category_id, images){
      const sqlInfo = `INSERT INTO product_chotot (name, price, description, item_id, category_id) VALUES ?`;
      let values = [[name, price, description, item_id, category_id]];
      const productIdDb = await factory.insertInfo(sqlInfo, values);
      
      const sqlImg = `INSERT INTO img_chotot (thumbnail_url, thumbnail_image, product_id) VALUES ?`;
      if( images !== null ){
        for (let i = 0; i < images.length; i++) {
          const parsed = url.parse(images[i]);
          const thumbnail_image = path.basename(parsed.pathname);
          let values = [[images[i], thumbnail_image, productIdDb]];
    
          factory.insertImg(sqlImg, values);
        }
      }
    }
  }
};

(async () => {
  const pipeline = async () => {
    try {
      const data = await factory.loadDataPipeline();

      factory[chotot].transDataPipeline(data);
    } catch (err) {
      console.error(err);
    }
  };

  pipeline();
})();
