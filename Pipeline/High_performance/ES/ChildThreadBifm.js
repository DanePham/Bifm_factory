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

//connect to database
const connection = mysql.createConnection(config);
const pool = mysql.createPool(config);

const factory = {
  insertInfo: async function(sql, value){
    return await new Promise(async (resolve) => {
      pool.query(sql, [value], (error, result) => {
        if (error) throw error;

        // console.log(`Import info: ${result.insertId} | Site: ${workerData.params.site}`);

        resolve(result.insertId);
      });
    });
  },
  insertImg: async function(sql, value){
    return await new Promise((resolve) => {
      pool.query(sql, [value], (error, result) => {
        if (error) throw error;

        // console.log(`Import img: ${result.insertId} | Site: ${workerData.params.site}`);
        resolve(true);
      });
    });
  },
  updateExtract: function(recordId){
    const sqlUpdate = `UPDATE ${workerData.params.tableCrawler} SET is_extract = 1 WHERE id = ${recordId}`;

    pool.query(sqlUpdate, [], (error, result) => {
      if (error) throw error;

      // console.log(`Update crawler success: ${recordId} | Site: ${workerData.params.site}`);
    });
  },
  loadDataPipeline: async function(){
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
  },
  lazada : {
    transDataPipeline : async function(data){
      const promisesJson = data.map(value => new Promise(async (resolve) =>{
        // data.forEach(function(value, key){
          const dataJson = JSON.parse(value.data_crawler);
          const lazadaItems = dataJson.mods.listItems;
      
          if (lazadaItems.length > 0) {
            const promisesItems = lazadaItems.map(item => new Promise(resolve => {
              // for (let j = 0; j < lazadaItems.length; j++) {
                const name = item.name;
                const price = item.price;
                const description = null;
                const item_id = item.itemId;
                const seller_id = item.sellerId;
                const category_id = item.categories[0];
                const thumbs = item.thumbs;

                factory[workerData.params.site].exportDataPipeline(name, price, description, item_id, seller_id, category_id, thumbs).then(() => {
                  resolve(true);
                });
              // }
            }));
            
            factory.updateExtract(value.id);

            await Promise.all(promisesItems).then(() => {
              resolve(true);
            });
          }else{
            factory.updateExtract(value.id);

            resolve(true);
          }
        // });
      }));

      await Promise.all(promisesJson).then(() => {
        console.log("OK lazada");
        process.exit();
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, seller_id, category_id, thumbs){
      return await new Promise(async (resolve) => {
        const sqlInfo = `INSERT INTO product_lazada (name, price, description, item_id, seller_id, category_id) VALUES ?`;
        let values = [[name, price, description, item_id, seller_id, category_id]];
        const productIdDb = await factory.insertInfo(sqlInfo, values);
        
        const sqlImg = `INSERT INTO img_lazada (thumbnail_url, thumbnail_image, product_id) VALUES ?`;
        if( thumbs !== null && thumbs.length > 0 ){
          const promisesImg = thumbs.map(thumb => new Promise(resolve => {
          // for (let i = 0; i < thumbs.length; i++) {
            if( thumb.image !== '' ){
              const parsed = url.parse(thumb.image);
              
              const thumbnail_image = path.basename(parsed.pathname);
              let values = [[thumb.image, thumbnail_image, productIdDb]];
        
              factory.insertImg(sqlImg, values).then(() => {
                resolve(true);
              });
            }    
          // }
          }));

          await Promise.all(promisesImg).then(() => {
            resolve(true);
          });
        }else{
          resolve(true);
        }
      });
    }
  },
  chotot : {
    transDataPipeline : async function(data){
      const promisesJson = data.map(value => new Promise(async (resolve) =>{
        // data.forEach(function(value, key){
          const dataJson = JSON.parse(value.data_crawler);
          const chototItems = dataJson.ad;

          const name = chototItems.subject;
          const price = chototItems.price ?? null;
          const description = chototItems.body;
          const item_id = chototItems.ad_id;
          const category_id = chototItems.category;
          const images = chototItems.images ?? null;
    
          factory[workerData.params.site].exportDataPipeline(name, price, description, item_id, category_id, images).then(() => {
            resolve(true);
          });

          factory.updateExtract(value.id);
        // });
      }));

      await Promise.all(promisesJson).then(() => {
        console.log("OK chotot");
        process.exit();
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, category_id, images){
      return await new Promise(async (resolve) => {
        const sqlInfo = `INSERT INTO product_chotot (name, price, description, item_id, category_id) VALUES ?`;
        let values = [[name, price, description, item_id, category_id]];
        const productIdDb = await factory.insertInfo(sqlInfo, values);
        
        const sqlImg = `INSERT INTO img_chotot (thumbnail_url, thumbnail_image, product_id) VALUES ?`;
        if( images !== null ){
          const promisesImg = images.map(thumb => new Promise(resolve => {
          // for (let i = 0; i < images.length; i++) {
            const parsed = url.parse(thumb);
            const thumbnail_image = path.basename(parsed.pathname);
            let values = [[thumb, thumbnail_image, productIdDb]];
      
            factory.insertImg(sqlImg, values).then(() => {
              resolve(true);
            });
          // }
          }));

          await Promise.all(promisesImg).then(() => {
            resolve(true);
          });
        }else{
          resolve(true);
        }
      });
    }
  },
  shopee : {
    transDataPipeline : async function(data){
      const promisesJson = data.map(value => new Promise(async (resolve) =>{
      // data.forEach(function(value, key){
        const dataJson = JSON.parse(value.data_crawler);
        const shopeeItems = dataJson.data.sections[0].data.item;
    
        if (shopeeItems.length > 0) {
          const promisesItems = shopeeItems.map(item => new Promise(resolve => {
          // for (let j = 0; j < shopeeItems.length; j++) {
            const name = item.name;
            const price = item.price;
            const description = null;
            const item_id = item.itemid;
            const shop_id = item.shopid;
            const category_id = value.category_id;
            const images = item.images;
      
            factory[workerData.params.site].exportDataPipeline(name, price, description, item_id, shop_id, category_id, images).then(() => {
              resolve(true);
            });
          // }
          }));

          factory.updateExtract(value.id);

          await Promise.all(promisesItems).then(() => {
            resolve(true);
          });
        }else{
          factory.updateExtract(value.id);

          resolve(true);
        }
      // });
      }));

      await Promise.all(promisesJson).then(() => {
        console.log("OK shopee");
        process.exit();
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, shop_id, category_id, images){
      return await new Promise(async (resolve) => {
        const sqlInfo = `INSERT INTO product_shopee (name, price, description, item_id, shop_id, category_id) VALUES ?`;
        let values = [[name, price, description, item_id, shop_id, category_id]];
        const productIdDb = await factory.insertInfo(sqlInfo, values);
        
        const sqlImg = `INSERT INTO img_shopee (thumbnail_url, thumbnail_image, product_id) VALUES ?`;
        
        const promisesImg = images.map(thumb => new Promise(resolve => {
        // for (let i = 0; i < images.length; i++) {
          const thumbnail_url = 'https://cf.shopee.vn/file/' + thumb;
          let values = [[thumbnail_url, thumb, productIdDb]];
    
          factory.insertImg(sqlImg, values).then(() => {
            resolve(true);
          });
        // }
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
      // data.forEach(function(value, key){
        const dataJson = JSON.parse(value.data_crawler);
        const tikiItems = dataJson.data;
    
        if (tikiItems.length > 0) {
          const promisesItems = tikiItems.map(item => new Promise(resolve => {
          // for (let j = 0; j < tikiItems.length; j++) {
            const name = item.name;
            const price = item.price;
            const description = null;
            const item_id = item.id;
            const seller_id = item.seller_product_id;
            const category_id = item.primary_category_path.split('/')[-1];
            const thumbnail_url = item.thumbnail_url;
      
            factory[workerData.params.site].exportDataPipeline(name, price, description, item_id, seller_id, category_id, thumbnail_url).then(() => {
              resolve(true);
            });
          // }
          }));

          factory.updateExtract(value.id);

          await Promise.all(promisesItems).then(() => {
            resolve(true);
          });
        }else{
          factory.updateExtract(value.id);

          resolve(true);
        }

      // });
      }));

      await Promise.all(promisesJson).then(() => {
        console.log("OK tiki");
        process.exit();
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, seller_id, category_id, thumbnail_url){
      return await new Promise(async (resolve) => {
        const sqlInfo = `INSERT INTO product_tiki (name, price, description, item_id, seller_id, category_id) VALUES ?`;
        let values = [[name, price, description, item_id, seller_id, category_id]];
        const productIdDb = await factory.insertInfo(sqlInfo, values);
        
        const sqlImg = `INSERT INTO img_tiki (thumbnail_url, thumbnail_image, product_id) VALUES ?`;
        if( thumbnail_url !== null ){
          const parsed = url.parse(thumbnail_url);
          const thumbnail_image = path.basename(parsed.pathname);
          let values = [[thumbnail_url, thumbnail_image, productIdDb]];
    
          factory.insertImg(sqlImg, values).then(() => {
            resolve(true);
          });
        }else{
          resolve(true);
        }
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
