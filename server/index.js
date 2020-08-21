const express = require('express');
const mysql = require('mysql');
const app = express();

// DB connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12qw!@QW',
    database: 'test',
});

// views
app.set('views', __dirname);
app.set('view engine', 'ejs');

// ajax
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// dir 
// 이 과정을 거쳐야 내부폴더에 있는 파일을 접근할 수 있음
app.use(express.static(__dirname));

// 기본 요청
app.get('/', function (req, res) {
    res.render('index');
});

// 기본 요청
app.get('/index', function (req, res) {
    res.render('index');
});

app.listen(3000, function () {
    console.log('example app listening at http://localhost:3000')
});

// 사용자 앱에서 휴게서 위도,경도 요청시 값 보내주기
app.post('/requestRestAreaLatLong', function(req, res) {
    connection.query('SELECT area_code, area_nm, latitude, longitude FROM restarea_info_tb', function(error, result, fields) {
        if(error) {
            throw error;
        } else {
            res.send(JSON.stringify(result));
        }
    })
})

// 휴게소 웹에서 각 휴게소 별로 주문 내역 보내주기
app.post('/orderList', function(req, res) {

    let restarea_code = req.body.restarea_code;
    if (restarea_code === 'all') {
        restarea_code = '%'
    }
    console.log(restarea_code);

    connection.query('SELECT * FROM restarea_info_tb WHERE area_code LIKE ?', [restarea_code], function(error, result, fields) {
        if (error) {
            throw error;
        } else {
            // console.log(JSON.stringify(result));
            res.json(JSON.stringify(result));
        }
    });
    // console.log(data);
    // res.json(data);
})

// 휴게소 웹에서 select box에 (휴게소코드, 휴게소이름) 값 보내주기
app.post('/restAreaList', function(req, res) {
    connection.query('SELECT area_code, area_nm FROM restarea_info_tb', function(error, result, fields) {
        if(error) {
            throw error;
        } else {
            console.log(result.length);
            res.send(JSON.stringify(result));
        }
    })
});

// 사용자 앱에서 휴게소 선택시 (휴게소코드) 를 넘겨주면 휴게소코드에 맞는 휴게소 정보 보내주기 
app.post('/restAreaInfo', function(req, res) {
    // 선택한 휴게소 코드 받기
    const restarea_code = req.body.restarea_code;

    console.log('code:', restarea_code);

    // 선택한 휴게소 코드로 DB SELECT 후 결과값 send
    connection.query('SELECT * FROM restarea_info_tb WHERE area_code = ?', [restarea_code], function(error, result, fields) {
        if(error) {
            throw error;
        } else {
            console.log(result);
            res.send(JSON.stringify(result));
        }
    })
});

// 사용자 앱에서 현재위치에서 각 휴게소 거리 요청 할 때






// 사용자에서 결제 완료 시 (주문정보, 주문자번호) 넘겨주면,
// 주문정보 DB에 INSERT 작업 한 후 주문성공여부 반환(성공/실패)
app.post('/insertDBOrderList', async function(req, res) {
    console.log('start');
    const order_no = await getOrderNo();

    console.log('end');
    console.log('out order No:', order_no);

    const orderer_pn = req.body.orderer_pn;

    console.log(order_no, orderer_pn);

    const SQL = {
        order_no : order_no,
        orderer_pn : orderer_pn
    }

    connection.query('INSERT INTO order_info_tb SET ?', SQL, function(error, result, fields) {
        if(error) {
            res.send('err');
            throw error;
        } else {
            if(result) {
                console.log('success');
                res.send(order_no);
            }
        }
    })

})

// 주문번호 만들기
async function getOrderNo() {
    // 오늘 날짜 yyyymmdd 형태로 만들기
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1);
    const day = date.getDate();
    const todayDate = year + (month < 10 ? ('0' + month) : month).toString() + (day < 10 ? ('0' + day) : day).toString();
    console.log('today:', todayDate);
    
    // 오늘 날짜 기준으로 주문 건수 계산해서 다음 번호 붙이기
    const cnt = await getOrderCnt(todayDate);
    console.log('count :', cnt);

    // 주문번호 만들기
    const orderNo = 'OD' + todayDate + cnt;
    console.log('in order No:', orderNo);

    return orderNo;
}

// DB에서 오늘 날짜 기준으로 들어온 주문 건수 가져오기 (동기 처리 해야함)
function getOrderCnt(todayDate) {
    return new Promise( (resolve, reject) => {
        let cnt = 0;
        connection.query('SELECT * FROM order_info_tb WHERE substr(order_no, 3, 8) = ?', [todayDate], function(error, result, fields) {
            if(error) {
                reject(error);
            } else {
                console.log('result length:', result.length);
                let temp = result.length + 1;
                cnt = (temp < 10 ? '0000' + temp : (temp < 100 ? '000' + temp : (temp < 1000 ? '00' + temp : (temp < 10000 ? '0' + temp : temp))));
                console.log('getOrderCnt:',cnt);
                resolve(cnt);
            }
        });
    })
}
