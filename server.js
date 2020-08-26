const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const app = express();
var expressLayouts = require("express-ejs-layouts");

// DB connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12qw!@QW",
  database: "test",
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

//layout
app.use(expressLayouts);

// 이 과정을 거쳐야 내부폴더에 있는 파일을 접근할 수 있음
app.use(express.static(__dirname));

// 홈 화면
app.get("/admin", function (req, res) {
  res.render("../server/admin");
});

// 홈 화면
app.get("/home", function (req, res) {
  res.render("home");
});

// 휴게소 정보 화면
app.get("/restAreaInfo", function (req, res) {
  res.render("home/restAreaInfo");
});

//메뉴 목록 화면
app.get("/menulist", function (request, response) {
  response.render("home/menulist");
});

//메뉴고르고 결제할때 화면
app.get("/payment", function (request, response) {
  response.render("home/payment");
});

//장바구니 화면
app.get("/cart", function (request, response) {
  response.render("cart/cart");
});

// 결제완료시 주문완료 화면
app.get("/cartOk", function (request, response) {
  response.render("cart/cartOk");
});


//주문했었던 목록 화면(주문번호, 주문내역 확인)
app.get("/orderlist", function (request, response) {
  response.render("orderlist/orderlist");
});

// 결제 상세
app.get("/orderDetail", function (req, res) {
  res.render("orderlist/orderDetail");
});

// 서버 Start
app.listen(3000, function () {
  console.log("example app listening at http://localhost:3000");
});

// // 서버 Start
// app.listen(3001, function () {
//   console.log("example app listening at http://localhost:3001");
// });





// 사용자 앱에서 휴게서 위도,경도 요청시 값 보내주기 - 홈 화면(지도, 리스트)
app.post("/requestRestAreaLatLong", function (req, res) {
  connection.query("SELECT area_code, area_nm, road_nm, latitude, longitude FROM restarea_info_tb", function (
    error,
    result,
    fields
  ) {
    if (error) {
      throw error;
    } else {
      res.send(JSON.stringify(result));
    }
  });
});

// 사용자 앱에서 휴게소 하나 선택시, 휴게소 정보 값 보내주기 - 휴게소 정보 화면(휴게소 정보)
app.post("/requestRestAreaInfo", function (req, res) {
  const areaCode = req.body.area_code;
  connection.query("SELECT * FROM restarea_info_tb WHERE area_code = ?", [areaCode], function (error, result, fields) {
    if (error) {
      throw error;
    } else {
      res.send(JSON.stringify(result));
    }
  });
});

// 사용자 앱에서 메뉴주문 선택시, 메뉴 내용 값 보내주기 - 메뉴 화면(휴게소 메뉴 정보)
app.post("/requestMenuInfo", async function (req, res) {
  const areaName = req.body.area_nm;
  const results = await getMenuInfo(areaName);

  res.send(results);
});

// 사용자 번호 입력받아서 주문내역 반환
app.post("/requestOrderList", function (req, res) {
  const phone_no = req.body.phone_no;
  const gigan = req.body.gigan;
  // 오늘 날짜 yyyymmdd 형태로 만들기
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const todayDate = year + (month < 10 ? "0" + month : month).toString() + (day < 10 ? "0" + day : day).toString();
  console.log("today:", todayDate);

  let searchGigan;
  if(gigan == '오늘') {
    searchGigan = '%' + todayDate + '%';
  } else {
    searchGigan = '%';
  }
  console.log(searchGigan);

  var formatted = phone_no.slice(0, 3) + "-" + phone_no.slice(3, 7) + "-" + phone_no.slice(7);
  console.log(formatted);

  connection.query("SELECT * FROM order_info_tb WHERE order_no LIKE ? AND orderer_pn = ? ORDER BY 1 DESC", [searchGigan, formatted], function (error, result, fields) {
    if (error) {
      throw error;
    } else {
      res.send(result);
    }
  });
})

app.post("/requestOrderInfo", function (req, res) {
    const order_no = req.body.order_no;
  
    connection.query('SELECT * FROM order_food_info_tb WHERE order_no = ?', [order_no], function(error, result, fields) {
      if(error) { 
        throw error;
      } else {
        res.send(result);      
      }
    });
  })

// 메뉴API(공공데이터) 사용해서 메뉴 가져오기
getMenuInfo = async (areaName) => {
  const API_KEY = "7027848923";

  var url = "http://data.ex.co.kr/openapi/restinfo/restBestfoodList";
  var queryParams = "?" + encodeURIComponent("key") + `=${API_KEY}`; /* Service Key*/
  queryParams += "&" + encodeURIComponent("type") + "=" + encodeURIComponent("json");
  queryParams += "&" + encodeURIComponent("stdRestNm") + "=" + encodeURIComponent(`${areaName}`);
  queryParams += "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("100");

  const res = await axios.get(url + queryParams);
  // console.log(res.data.list);
  return res.data.list;
};

// 결제완료시 음식 주문내역 DB에 삽입
app.post("/insertOrderList", async function (req, res) {
  console.log(req.body);
  const phoneNo = req.body.phone_no;
  const totalCost = req.body.total_cost;
  const areaNm = req.body.area_nm;
  const lists = req.body.lists;
  const jsonData = JSON.parse(lists);

  console.log("orderNo start");
  const order_no = await getOrderNo();
  console.log("orderNo end");

  console.log(phoneNo);

  const SQL1 = {
    order_no: order_no,
    area_nm: areaNm,
    total_cost: totalCost,
    orderer_pn: phoneNo,
  };
  // 주문정보 INSERT
  connection.query("INSERT INTO order_info_tb SET ? ", SQL1, function (error, result, fields) {
    if (error) {
      console.log("[ERR] 주문정보 ISNERT 실패");
      throw error;
    } else {
      console.log("[OK] 주문정보 INSERT");

      // 음식 리스트 INSERT
      for (i in jsonData) {
        console.log(jsonData[i]);
        const name = jsonData[i].item_name;
        const cnt = jsonData[i].qty;
        const price = jsonData[i].price;

        const SQL2 = {
          order_no: order_no,
          food_nm: name,
          food_cnt: cnt,
          food_price: price,
          total_price: price * cnt,
        };

        connection.query("INSERT INTO order_food_info_tb SET ?", SQL2, function (error, result, fields) {
          if (error) {
            console.log("[ERR] 음식정보 ISNERT 실패");
            throw error;
          } else {
            console.log("[OK] 음식정보 INSERT 성공");
          }
        });
      }
    }
    // 주문정보, 음식주문정보 테이블에 다 넣으면 주문번호 반환
    res.send(order_no);
  });
});

// 주문번호 만들기
async function getOrderNo() {
  // 오늘 날짜 yyyymmdd 형태로 만들기
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const todayDate = year + (month < 10 ? "0" + month : month).toString() + (day < 10 ? "0" + day : day).toString();
  console.log("today:", todayDate);

  // 오늘 날짜 기준으로 주문 건수 계산해서 다음 번호 붙이기
  const cnt = await getOrderCnt(todayDate);
  console.log("count :", cnt);

  // 주문번호 만들기
  const orderNo = "OD" + todayDate + cnt;
  console.log("in order No:", orderNo);

  return orderNo;
}

// DB에서 오늘 날짜 기준으로 들어온 주문 건수 가져오기 (동기 처리 해야함)
function getOrderCnt(todayDate) {
  return new Promise((resolve, reject) => {
    let cnt = 0;
    connection.query("SELECT * FROM order_info_tb WHERE substr(order_no, 3, 8) = ?", [todayDate], function (
      error,
      result,
      fields
    ) {
      if (error) {
        reject(error);
      } else {
        console.log("result length:", result.length);
        let temp = result.length + 1;
        cnt =
          temp < 10
            ? "0000" + temp
            : temp < 100
            ? "000" + temp
            : temp < 1000
            ? "00" + temp
            : temp < 10000
            ? "0" + temp
            : temp;
        console.log("getOrderCnt:", cnt);
        resolve(cnt);
      }
    });
  });
}

