const { performance } = require("perf_hooks");

let mysql = require("mysql");
var url = require("url");
var path = require("path");

const { parentPort, workerData } = require("worker_threads");

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

        console.log(`Import info: ${result.insertId} | Site: ${workerData.params.site}`);

        resolve(result.insertId);
      });
    });
  },
  insertImg: function(sql, value){
    pool.query(sql, [value], (error, result) => {
      if (error) throw error;

      console.log(`Import img: ${result.insertId} | Site: ${workerData.params.site}`);
    });
  },
  updateExtract: function(recordId){
    const sqlUpdate = `UPDATE ${workerData.params.tableCrawler} SET is_extract = 1 WHERE id = ${recordId}`;

    pool.query(sqlUpdate, [], (error, result) => {
      if (error) throw error;

      console.log(`Update crawler success: ${recordId} | Site: ${workerData.params.site}`);
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
    transDataPipeline : function(data){
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

            factory[workerData.params.site].exportDataPipeline(name, price, description, item_id, seller_id, category_id, thumbs);
          }
        }

        factory.updateExtract(value.id);
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, seller_id, category_id, thumbs){
      const sqlInfo = `INSERT INTO product_lazada (name, price, description, item_id, seller_id, category_id) VALUES ?`;
      let values = [[name, price, description, item_id, seller_id, category_id]];
      const productIdDb = await factory.insertInfo(sqlInfo, values);
      
      const sqlImg = `INSERT INTO img_lazada (thumbnail_url, thumbnail_image, product_id) VALUES ?`;
      if( thumbs !== null && thumbs.length > 0 ){
        try{
          for (let i = 0; i < thumbs.length; i++) {
            if( thumbs[i].image !== '' ){
              const parsed = url.parse(thumbs[i].image);
              
              const thumbnail_image = path.basename(parsed.pathname);
              let values = [[thumbs[i].image, thumbnail_image, productIdDb]];
        
              factory.insertImg(sqlImg, values);
            }    
          }
        } catch (err) {
          console.log(thumbs, 'hehe');
          throw err;
        }
      }
    }
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
  
        factory[workerData.params.site].exportDataPipeline(name, price, description, item_id, category_id, images);

        factory.updateExtract(value.id);
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
  },
  shopee : {
    transDataPipeline : function(data){
      data.forEach(function(value, key){
        const dataJson = JSON.parse(value.data_crawler);
        const shopeeItems = dataJson.data.sections[0].data.item;
    
        if (shopeeItems.length > 0) {
          for (let j = 0; j < shopeeItems.length; j++) {
            const name = shopeeItems[j].name;
            const price = shopeeItems[j].price;
            const description = null;
            const item_id = shopeeItems[j].itemid;
            const shop_id = shopeeItems[j].shopid;
            const category_id = value.category_id;
            const images = shopeeItems[j].images;
      
            factory[workerData.params.site].exportDataPipeline(name, price, description, item_id, shop_id, category_id, images);
          }
        }

        factory.updateExtract(value.id);
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, shop_id, category_id, images){
      const sqlInfo = `INSERT INTO product_shopee (name, price, description, item_id, shop_id, category_id) VALUES ?`;
      let values = [[name, price, description, item_id, shop_id, category_id]];
      const productIdDb = await factory.insertInfo(sqlInfo, values);
      
      const sqlImg = `INSERT INTO img_shopee (thumbnail_url, thumbnail_image, product_id) VALUES ?`;
      for (let i = 0; i < images.length; i++) {
        const thumbnail_url = 'https://cf.shopee.vn/file/' + images[i];
        let values = [[thumbnail_url, images[i], productIdDb]];
  
        factory.insertImg(sqlImg, values);
      }
    }
  },
  tiki : {
    transDataPipeline : function(data){
      data.forEach(function(value, key){
        const dataJson = JSON.parse(value.data_crawler);
        const tikiItems = dataJson.data;
    
        if (tikiItems.length > 0) {
          for (let j = 0; j < tikiItems.length; j++) {
            const name = tikiItems[j].name;
            const price = tikiItems[j].price;
            const description = null;
            const item_id = tikiItems[j].id;
            const seller_id = tikiItems[j].seller_product_id;
            const category_id = tikiItems[j].primary_category_path.split('/')[-1];
            const thumbnail_url = tikiItems[j].thumbnail_url;
      
            factory[workerData.params.site].exportDataPipeline(name, price, description, item_id, seller_id, category_id, thumbnail_url);
          }
        }

        factory.updateExtract(value.id);
      });
    },
    exportDataPipeline: async function(name, price, description, item_id, seller_id, category_id, thumbnail_url){
      const sqlInfo = `INSERT INTO product_tiki (name, price, description, item_id, seller_id, category_id) VALUES ?`;
      let values = [[name, price, description, item_id, seller_id, category_id]];
      const productIdDb = await factory.insertInfo(sqlInfo, values);
      
      const sqlImg = `INSERT INTO img_tiki (thumbnail_url, thumbnail_image, product_id) VALUES ?`;
      if( thumbnail_url !== null ){
        const parsed = url.parse(thumbnail_url);
        const thumbnail_image = path.basename(parsed.pathname);
        let values = [[thumbnail_url, thumbnail_image, productIdDb]];
  
        factory.insertImg(sqlImg, values);
      }
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
