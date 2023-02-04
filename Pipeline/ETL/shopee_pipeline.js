import * as puppeteer from "puppeteer";
import * as fs from "fs";
import { MongoClient } from "mongodb";
import * as mysql from "mysql";

(async () => {
    const data_crawler = await new Promise(async (resolve) => {
        MongoClient.connect("mongodb://127.0.0.1:27017/", function (err, db) {
            if (err) throw err;
            var dbo = db.db("shopee");
            dbo
                .collection("product_list")
                .find({})
                .toArray(function (err, result) {
                    if (err) throw err;
                    resolve(result);
                    db.close();
                });
        });
    });


    let product_mysql = [];
    for (var data in data_crawler) {
        for (var item in data_crawler[data].items) {
            const product_mongo = data_crawler[data]?.items[item]?.item_basic;
            product_mysql.push([
                product_mongo?.name,
                product_mongo?.price,
                null,
                product_mongo?.itemid,
                product_mongo?.shopid,
                product_mongo?.catid,
                null,
            ]);
        }
    }

    // console.log(product_mysql[0]);

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        database: "bifm",
        charset: 'utf8mb4'
    });


    var sql = "INSERT INTO productshopee (name, price, description, item_id, shop_id, category_id, review_id) VALUES ?";

    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        for (var key in product_mysql) {
    
          con.query(sql, [[product_mysql[key]]], function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
          });
    
        }
        con.end();
    });
})();