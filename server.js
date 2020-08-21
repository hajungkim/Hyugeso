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
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// ajax
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// 이 과정을 거쳐야 내부폴더에 있는 파일을 접근할 수 있음
app.use(express.static(__dirname));

// Home 화면
app.get('/home', function (req, res) {
    res.render('home');
});

// Home 화면
app.get('/order', function (req, res) {
    res.render('order');
});

// Home 화면
app.get('/info', function (req, res) {
    res.render('info');
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

// 사용자 앱에서 휴게서 위도,경도 요청시 값 보내주기
app.post('/requestRestAreaInfo', function(req, res) {
    const areaCode = req.body.area_code;
    connection.query('SELECT * FROM restarea_info_tb WHERE area_code = ?', [areaCode], function(error, result, fields) {
        if(error) {
            throw error;
        } else {
            res.send(JSON.stringify(result));
        }
    })
})