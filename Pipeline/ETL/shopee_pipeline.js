import { MongoClient } from "mongodb";
import * as mysql from "mysql";
import * as fs from "fs";
import request from "request";

(async () => {

    const data_crawler = await new Promise(async (resolve) => {
        MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, db) {
            if (err) throw err;
            var dbo = db.db("shopee");
            dbo
                .collection("product_list4")
                .find({})
                // .limit(1)
                .toArray(function (err, result) {
                    if (err) throw err;
                    resolve(result);
                    db.close();
                });
        });
    });

    let product_mysql = [];
    for (var index in data_crawler) {
        for (var item in data_crawler[index].data.sections[0].data.item) {
            const product_mongo = data_crawler[index].data.sections[0].data.item[item];
            product_mysql.push([
                product_mongo?.name,
                product_mongo?.price,
                null,
                product_mongo?.itemid,
                product_mongo?.shopid,
                data_crawler[index].catid,
                null,
                product_mongo?.images
            ]);
        }
    }

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        database: "bifm",
        charset: 'utf8mb4'
    });

    var sqlInfo = "INSERT INTO product_shopee2 (name, price, description, item_id, shop_id, category_id, review_id) VALUES ?";
    var sqlImg = "INSERT INTO product_img2 (thumbnail_url, thumbnail_image, product_id) VALUES ?";

    var img_mysql = [];

    con.connect(async function (err) {
        if (err) throw err;
        console.log("Connected!");
        for (var key in product_mysql) {
            let itemId = product_mysql[key][3];
            const product_check = await new Promise(async (resolve) => {
                con.query("SELECT * FROM product_shopee2 WHERE item_id = " + itemId + " LIMIT 1", function (err, result, fields) {
                    if (err) throw err;
                    if (result.length > 0) {
                        console.log("Exist product: " + itemId);
                    }
                    resolve(result);
                });
            });

            if (product_check.length == 0) {

                var image_arr = product_mysql[key][7];
                product_mysql[key].splice(7, 1);


                const id = await new Promise(function (resolve) {
                    con.query(sqlInfo, [[product_mysql[key]]], function (err, result) {
                        if (err) throw err;

                        console.log("Inserted info: " + result.insertId);
                        resolve(result.insertId);
                    });
                });

                for (var key in image_arr) {
                    let url = 'https://cf.shopee.vn/file/' + image_arr[key];
                    let img_path = 'C:/DSOFT/DATA/Shoppe/' + image_arr[key] + '.jpg';
                    img_mysql = [
                        url,
                        image_arr[key],
                        id
                    ];


                    if (!fs.existsSync(img_path)) {

                        await new Promise(async function (resolve) {
                            request.head(url, function (err, res, body) {
                                //   console.log('content-type:', res.headers['content-type']);
                                //   console.log('content-length:', res.headers['content-length']);
                                request(url).pipe(fs.createWriteStream(img_path)).on('close', function () {
                                    console.log('Download image: ' + url);
                                });
                                resolve();
                            });
                        });
                    }

                    con.query(sqlImg, [[img_mysql]], function (err, result) {
                        if (err) throw err;

                        console.log("Inserted image: " + result.insertId);
                    });
                }
            }

        }
        con.end();
    });

})();