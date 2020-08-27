const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const app = express();
const BootpayRest = require('bootpay-rest-client');
var expressLayouts = require("express-ejs-layouts");

// DB connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12qw!@QW",
  database: "test",
  dateStrings: "date",
});

// BootPay set
BootpayRest.setConfig(
	'5f34ea102fa5c20025eecac3',
	'QIE0I0o851JbjihaAoLetULpoWWKJ962pKcUfLC73No='
);

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

// 주문번호 받아서 주문상세 내역 반환
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


// admin 에서 휴게소이름에 따라 주문리스트 보여주기
app.post("/adminRequestOrderList", function(req, res) {
  let area_nm = (req.body.area_nm == '전체' ? '%' : req.body.area_nm);
  console.log(area_nm);
  connection.query('SELECT * FROM order_info_tb WHERE area_nm LIKE ? ORDER BY 1 DESC', [area_nm], function(error, result, fields) {
    if(error) {
      throw error;
    } else {
      console.log(result);
      res.send(JSON.stringify(result));
    }
  })
})

// admin 에서 휴게소이름에 따라 주문리스트 보여주기
app.post("/adminUpdateOrderInfo", function(req, res) {
  const orderNo = req.body.order_no;

  console.log(orderNo);

  // 수정
  connection.query('UPDATE order_info_tb SET serving_yn = ? WHERE order_no = ?', ['Y', orderNo], function(error, result, fields) {
    if(error) {
      throw error;
    } else {
      console.log(result);
    }
  })
})






// 클라이언트에서 결제 요청
app.post('/requestPayment', async function(req, res) {
  const name = req.body.name;
  const price = req.body.price;
  const phone = req.body.phone;
  const items = JSON.parse(req.body.items);
  const receiptId = req.body.receipt_id;

  console.log("orderNo start");
  const orderNo = await getOrderNo();
  console.log("orderNo end");
  
  BootpayRest.getAccessToken().then(function (response) {
    // Access Token을 발급 받았을 때
    if (response.status === 200 && response.data.token !== undefined) {
      BootpayRest.verify(receiptId).then(function (_response) {
        // 검증 결과를 제대로 가져왔을 때
        if (_response.status === 200) {
          // console.log(_response);
          console.log(_response.status);
          
          // DB에 삽입
          insertOrderList(name, price, phone, items, receiptId, orderNo);

          const result = {
            receipt_id: _response.data.receipt_id,
            code: _response.status,
            order_no: orderNo,
          }
          console.log(result);
          res.send(result);
        }
      });
    }
  });
})

// 주문 확인시 주문테이블에 삽입
async function insertOrderList (name, price, phone, items, pay_id, orderNo) {
  const totalCost = price;
  const areaNm = name;
  const payId = pay_id;
  const phoneNo = phone;
  const jsonData = items;

  // 결제가 완료되면 DB에 INSERT
  const SQL1 = {
    order_no: orderNo,
    orderer_pn: phoneNo,
    pay_id: payId,
    area_nm: areaNm,
    total_cost: totalCost,
    serving_yn: 'N',
    cancel_yn: 'N'
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
          order_no: orderNo,
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
  });
}

// 결제 취소 부분
app.post('/requestPayCancel', function(req, res) {
  const order_no = req.body.order_no;
  
  connection.query('SELECT * FROM order_info_tb WHERE order_no = ?', [order_no], function(error, result, fields) {
    if(error) {
      throw error;
    } else {
      console.log(result);
      const price = result[0].total_cost;
      const receiptID = result[0].pay_id;
      const ordererNo = result[0].orderer_pn;

      console.log(price, receiptID,ordererNo);
      // 취소 통신
      BootpayRest.getAccessToken().then(function (token) {
        if (token.status === 200) {
          BootpayRest.cancel(receiptID, price, ordererNo, '주문취소').then(function (response) {
            // 결제 취소가 완료되었다면
            if (response.status === 200) {
              // TODO: 결제 취소에 관련된 로직을 수행하시면 됩니다.
              connection.query('UPDATE order_info_tb SET cancel_yn = ? WHERE order_no = ?', ['Y', order_no], function(error, result, fiedls) {
                if(error) {
                  throw error;
                } else {
                  res.send('취소 성공');
                }
              })
            }
          });
        }
      });
    }
  })

  
})
