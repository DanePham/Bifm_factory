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

//connect to database
let connection = mysql.createConnection(config);

const pool = mysql.createPool(config);

async function insertProduct(
  name,
  price,
  description,
  item_id,
  seller_id,
  category_id,
  thumbs
) {
  // Import info
  const productIdDb = await new Promise(async (resolve) => {
    let sql = `INSERT INTO product_lazada_test (name, price, description, item_id, seller_id, category_id) VALUES ?`;
    let values = [[name, price, description, item_id, seller_id, category_id]];

    pool.query(sql, [values], (error, result) => {
      if (error) throw error;

      const productId = result.insertId;
      console.log("Import info: " + productId);

      resolve(productId);
    });
  });

  // Import img
  const sqlImg = `INSERT INTO img_lazada_test (thumbnail_url,thumbnail_image,product_id) VALUES ?`;
  for (let i = 0; i < thumbs.length; i++) {
    const parsed = url.parse(thumbs[i].image);
    const thumbnail_image = path.basename(parsed.pathname);
    let values = [[thumbs[i].image, thumbnail_image, productIdDb]];

    pool.query(sqlImg, [values], (error, result) => {
      if (error) throw error;

      console.log("Import img: " + result.insertId);
    });
  }
}

const { parentPort, workerData } = require("worker_threads");

var t0 = performance.now();

(async () => {
  const pipeline = async () => {
    try {
      const dataLazada = await new Promise(async (resolve) => {
        connection.connect(function (err) {
          var limit_number = workerData.limit;
          var offset_number = workerData.params.offset * limit_number;

          var sql = `SELECT * FROM lazada_crawler WHERE is_extract = 0 LIMIT ${limit_number} OFFSET ${offset_number}`;

          connection.query(sql, function (err, results) {
            if (err) throw err;
            // console.log('this is offset: ' + workerData.params.offset + " length " + results.length);

            resolve(results);
          });

          connection.end();
        });
      });

      dataLazada.forEach(function (value, key) {
        const data = JSON.parse(value.data_crawler);

        const lazadaItems = data.mods.listItems;

        if (lazadaItems.length > 0) {
          console.log(lazadaItems[0].name);

          for (let j = 0; j < lazadaItems.length; j++) {
            const name = lazadaItems[j].name;
            const price = lazadaItems[j].price;
            const description = null;
            const item_id = lazadaItems[j].itemId;
            const seller_id = lazadaItems[j].sellerId;
            const category_id = lazadaItems[j].categories[0];
            const thumbs = lazadaItems[j].thumbs;

            // console.log(name, price, description, item_id, seller_id, category_id, thumbs);

            insertProduct(
              name,
              price,
              description,
              item_id,
              seller_id,
              category_id,
              thumbs
            );
          }
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  pipeline();
})();

var t1 = performance.now();
// console.log("Took: " + (t1 - t0) + "msecs");
//loop
parentPort.close();
