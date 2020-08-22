const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const app = express();

// DB connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "mydb",
});

// views
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// ajax
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

// 이 과정을 거쳐야 내부폴더에 있는 파일을 접근할 수 있음
app.use(express.static(__dirname));

// 홈 화면
app.get("/home", function (req, res) {
  res.render("home");
});

// 휴게소 정보 화면
app.get("/restAreaInfo", function (req, res) {
  res.render("restAreaInfo");
});

// 메뉴 주문 화면
app.get("/menu", function (req, res) {
  res.render("menu");
});

// 결제 화면
app.get("/orderList", function (req, res) {
  res.render("orderList");
});

// 서버 Start
app.listen(3000, function () {
  console.log("example app listening at http://localhost:3000");
});

// 사용자 앱에서 휴게서 위도,경도 요청시 값 보내주기 - 홈 화면(지도, 리스트)
app.post("/requestRestAreaLatLong", function (req, res) {
  connection.query(
    "SELECT area_code, area_nm, latitude, longitude FROM restarea_info_tb",
    function (error, result, fields) {
      if (error) {
        throw error;
      } else {
        res.send(JSON.stringify(result));
      }
    }
  );
});

// 사용자 앱에서 휴게소 하나 선택시, 휴게소 정보 값 보내주기 - 휴게소 정보 화면(휴게소 정보)
app.post("/requestRestAreaInfo", function (req, res) {
  const areaCode = req.body.area_code;
  connection.query(
    "SELECT * FROM restarea_info_tb WHERE area_code = ?",
    [areaCode],
    function (error, result, fields) {
      if (error) {
        throw error;
      } else {
        res.send(JSON.stringify(result));
      }
    }
  );
});

// 사용자 앱에서 메뉴주문 선택시, 메뉴 내용 값 보내주기 - 메뉴 화면(휴게소 메뉴 정보)
app.post("/requestMenuInfo", async function (req, res) {
  const areaName = req.body.area_nm;
  const results = await getMenuInfo(areaName);

  res.send(results);
});

// 메뉴API(공공데이터) 사용해서 메뉴 가져오기
getMenuInfo = async (areaName) => {
  const API_KEY = "7027848923";

  var url = "http://data.ex.co.kr/openapi/restinfo/restBestfoodList";
  var queryParams =
    "?" + encodeURIComponent("key") + `=${API_KEY}`; /* Service Key*/
  queryParams +=
    "&" + encodeURIComponent("type") + "=" + encodeURIComponent("json");
  queryParams +=
    "&" +
    encodeURIComponent("stdRestNm") +
    "=" +
    encodeURIComponent(`${areaName}`);
  queryParams +=
    "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("100");

  const res = await axios.get(url + queryParams);
  // console.log(res.data.list);
  return res.data.list;
};
