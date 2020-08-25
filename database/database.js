const createdb = require("./createdb.js");
const insertdb = require("./insertdb.js");
const mysql = require("mysql");

// local DB 정보
const password = "12qw!@QW"; // 로컬 DB 비밀번호
const name = "test"; // 생성한 스키마 이름

// DB connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: password,
  database: name,
});

// DB setting
async function settingDB(connection) {
  // TABLE 생성
  console.log("[CREATE]: START");
  await createdb(connection);
  console.log("[CREATE]: END");

  // 휴게소 DATA 삽입
  console.log("[INSERT]: START");
  insertdb(connection);
  console.log("[INSERT]: END");

  connection.end();
}

settingDB(connection);
