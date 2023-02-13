import * as fs from 'fs';
import * as mysql from 'mysql';

(async () => {

  // var dataCat = JSON.parse(fs.readFileSync('data/dataCat.json', 'utf8'));
  var dataTree = JSON.parse(fs.readFileSync('data/categoryTree.json', 'utf8'));

  var arrTree1 = [];

  var dataList = dataTree.data.category_list;

  for (var keyList in dataList) {
    arrTree1.push([
      dataList[keyList].catid,
      dataList[keyList].parent_catid,
      dataList[keyList].name,
      dataList[keyList].display_name,
      dataList[keyList].image,
      dataList[keyList].unselected_image,
      dataList[keyList].selected_image,
      dataList[keyList].level,
      dataList[keyList].block_buyer_platform,
    ]);
    var chilrenCat = dataList[keyList]?.children;
    if (chilrenCat !== undefined) {
      for (var keyChild in chilrenCat) {
        let block = (chilrenCat[keyChild].block_buyer_platform === null) ? chilrenCat[keyChild].block_buyer_platform : '1,2';
        arrTree1.push([
          chilrenCat[keyChild].catid,
          chilrenCat[keyChild].parent_catid,
          chilrenCat[keyChild].name,
          chilrenCat[keyChild].display_name,
          chilrenCat[keyChild].image,
          chilrenCat[keyChild].unselected_image,
          chilrenCat[keyChild].selected_image,
          chilrenCat[keyChild].level,
          block,
        ]);
      }
    }
  }

  console.log('Loop OK');

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "bifm"
  });

  // console.log(arrTree1.length);

  // process.exit();

  var sql = "INSERT INTO categoryShopee (catid, parent_catid, name, display_name, image, unselected_image, selected_image, level, block_buyer_platform) VALUES ?";

  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    for (var tree in arrTree1) {

      con.query(sql, [[arrTree1[tree]]], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
      });

    }
    con.end();
  });

  console.log('End insert');

})();