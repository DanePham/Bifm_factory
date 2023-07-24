const { performance } = require("perf_hooks");

let mysql = require("mysql");
var url = require("url");
var path = require("path");

const { parentPort, workerData } = require("worker_threads");
const e = require("express");

const config = {
  host: "localhost",
  user: "root",
  password: "",
  database: "bifm",
  port: 3306,
  charset: "utf8mb4",
};

const thumb = `CONCAT(
  '[',
    GROUP_CONCAT(
      JSON_OBJECT(
        'thumbnail_url', 
        thumbnail_url,
        'thumbnail_image', 
        thumbnail_image
      )
    ),
  ']'
) AS thumb`;

//connect to database
const connection = mysql.createConnection(config);
const pool = mysql.createPool(config);

const factory = {
  insertInfo: async function(sql, value){
    return await new Promise(async (resolve) => {
      pool.query(sql, [value], (error, result) => {
        if (error) throw error;

        console.log(`Import info: ${result.insertId} | Site: ${workerData.params.site}`);

        resolve(result.insertId);
      });
    });
  },
  insertImg: async function(sql, value){
    return await new Promise((resolve) => {
      pool.query(sql, [value], (error, result) => {
        if (error) throw error;

        console.log(`Import img: ${result.insertId} | Site: ${workerData.params.site}`);
        resolve(true);
      });
    });
  },
  updateExtract: function(recordId){
    const sqlUpdate = `UPDATE ${workerData.params.tableProduct} SET is_combine = 1 WHERE id = ${recordId}`;

    pool.query(sqlUpdate, [], (error, result) => {
      if (error) throw error;

      console.log(`Update crawler success: ${recordId} | Site: ${workerData.params.site}`);
    });
  },
  loadDataPipeline: async function(){
    return await new Promise(async (resolve) => {
      connection.connect(function (err) {
        var tb_product = workerData.params.tableProduct;
        var tb_product_img = workerData.params.tableProductImg;
        var limit_number = workerData.limit;
        var offset_number = workerData.offset * limit_number;
  
        var sql = `SELECT ${tb_product}.*, ${thumb} FROM ${tb_product} 
              JOIN ${tb_product_img} ON ${tb_product}.id = ${tb_product_img}.product_id
              WHERE is_combine = 0 
              GROUP BY id
              LIMIT ${limit_number} OFFSET ${offset_number}`;
  
        connection.query(sql, function (err, results) {
          if (err) throw err;
          console.log('this is site: ' + workerData.params.site + " length " + results.length);
  
          resolve(results);
        });
  
        connection.end();
      });
    });
  },
  lazada : {
    transDataPipeline : async function(data){
      const promisesJson = data.map(value => new Promise(async (resolve) =>{

        factory[workerData.params.site].exportDataPipeline(
          value.name, 
          value.price, 
          value.description, 
          value.item_id,
          value.seller_id, 
          value.category_id, 
          JSON.parse(value.thumb)
        ).then(() => {
          resolve(true);
        });
        
        factory.updateExtract(value.id);

      }));

      await Promise.all(promisesJson).then(() => {
        console.log("OK lazada");
        process.exit();
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, seller_id, category_id, thumbs){
      return await new Promise(async (resolve) => {
        const sqlInfo = `INSERT INTO product_info (name, price, description, item_id, shop_id, seller_id, category_id, review_id, site_id) VALUES ?`;
        let values = [[name, price, description, item_id, null, seller_id, category_id, null, 4]];
        const productIdDb = await factory.insertInfo(sqlInfo, values);
        
        const sqlImg = `INSERT INTO product_img (thumbnail_url, thumbnail_image, product_id, site_id) VALUES ?`;
        const promisesImg = thumbs.map(thumb => new Promise(resolve => {
            let values = [[thumb.thumbnail_url, thumb.thumbnail_image, productIdDb, 3]];
      
            factory.insertImg(sqlImg, values).then(() => {
              resolve(true);
            });
        }));

        await Promise.all(promisesImg).then(() => {
          resolve(true);
        });
      });
    }
  },
  chotot : {
    transDataPipeline : async function(data){
      const promisesJson = data.map(value => new Promise(async (resolve) =>{

        factory[workerData.params.site].exportDataPipeline(
          value.name, 
          value.price, 
          value.description, 
          value.item_id,
          value.category_id, 
          JSON.parse(value.thumb)
        ).then(() => {
          resolve(true);
        });
        
        factory.updateExtract(value.id);

      }));

      await Promise.all(promisesJson).then(() => {
        console.log("OK chotot");
        process.exit();
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, category_id, images){
      return await new Promise(async (resolve) => {
        const sqlInfo = `INSERT INTO product_info (name, price, description, item_id, shop_id, seller_id, category_id, review_id, site_id) VALUES ?`;
        let values = [[name, price, description, item_id, null, null, category_id, null, 1]];
        const productIdDb = await factory.insertInfo(sqlInfo, values);
        
        const sqlImg = `INSERT INTO product_img (thumbnail_url, thumbnail_image, product_id, site_id) VALUES ?`;
        const promisesImg = images.map(thumb => new Promise(resolve => {
            let values = [[thumb.thumbnail_url, thumb.thumbnail_image, productIdDb, 1]];
      
            factory.insertImg(sqlImg, values).then(() => {
              resolve(true);
            });
        }));

        await Promise.all(promisesImg).then(() => {
          resolve(true);
        });
      });
    }
  },
  shopee : {
    transDataPipeline : async function(data){
      const promisesJson = data.map(value => new Promise(async (resolve) =>{

        factory[workerData.params.site].exportDataPipeline(
          value.name, 
          value.price, 
          value.description, 
          value.item_id,
          value.shop_id, 
          value.category_id, 
          JSON.parse(value.thumb)
        ).then(() => {
          resolve(true);
        });
        
        factory.updateExtract(value.id);

      }));


      await Promise.all(promisesJson).then(() => {
        console.log("OK shopee");
        process.exit();
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, shop_id, category_id, images){
      return await new Promise(async (resolve) => {
        const sqlInfo = `INSERT INTO product_info (name, price, description, item_id, shop_id, seller_id, category_id, review_id, site_id) VALUES ?`;
        let values = [[name, price, description, item_id, shop_id, null, category_id, null, 2]];
        const productIdDb = await factory.insertInfo(sqlInfo, values);
        
        const sqlImg = `INSERT INTO product_img (thumbnail_url, thumbnail_image, product_id, site_id) VALUES ?`;
        const promisesImg = images.map(thumb => new Promise(resolve => {
          let values = [[thumb.thumbnail_url, thumb.thumbnail_image, productIdDb, 2]];
    
          factory.insertImg(sqlImg, values).then(() => {
            resolve(true);
          });
        }));

        await Promise.all(promisesImg).then(() => {
          resolve(true);
        });
      });


    }
  },
  tiki : {
    transDataPipeline : async function(data){
      const promisesJson = data.map(value => new Promise(async (resolve) =>{

        factory[workerData.params.site].exportDataPipeline(
          value.name, 
          value.price, 
          value.description, 
          value.item_id,
          value.seller_id,
          value.category_id, 
          JSON.parse(value.thumb)
        ).then(() => {
          resolve(true);
        });
        
        factory.updateExtract(value.id);

      }));

      await Promise.all(promisesJson).then(() => {
        console.log("OK tiki");
        process.exit();
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, seller_id, category_id, thumb){
      return await new Promise(async (resolve) => {
        const sqlInfo = `INSERT INTO product_info (name, price, description, item_id, shop_id, seller_id, category_id, review_id, site_id) VALUES ?`;
        let values = [[name, price, description, item_id, null ,seller_id, category_id, null, 4]];
        const productIdDb = await factory.insertInfo(sqlInfo, values);
        
        const sqlImg = `INSERT INTO product_img (thumbnail_url, thumbnail_image, product_id, site_id) VALUES ?`;
        const promisesImg = thumb.map(thumb => new Promise(resolve => {
          let values = [[thumb.thumbnail_url, thumb.thumbnail_image, productIdDb, 2]];
    
          factory.insertImg(sqlImg, values).then(() => {
            resolve(true);
          });
        }));

        await Promise.all(promisesImg).then(() => {
          resolve(true);
        });
      });
    }
  }
};

(async () => {
  const pipeline = async () => {
    try {
      const data = await factory.loadDataPipeline();

      factory[workerData.params.site].transDataPipeline(data);
    } catch (err) {
      console.error(err);
    }
  };

  pipeline();
})();
