// 일단은 시간이 애매해서 사용 못할 것 같은 TABLE

// restarea_code_tb
function createRestareaCode (connection) {
    return new Promise( (resolve, reject) => {
        connection.query(
        `CREATE TABLE restarea_code_tb (
            area_code varchar(5) primary key,
            area_nm varchar(50) character set utf8 not null
        )`,
        function(error, result, fields) {
            if(error) {
                reject(error);
            } else {
                resolve(result);
            }
        }); 
    })
}

// food_info_tb
function createFoodInfo (connection) {
    return new Promise( (resolve, reject) => {
        connection.query(
        `CREATE TABLE food_info_tb (
            food_code varchar(5) primary key,
            food_nm varchar(30) not null,
            food_price int(5) not null,
            area_code varchar(5) not null,
            menu_code varchar(5) not null,
            food_detail varchar(500),
            recommend_yn varchar(1),
            best_yn varchar(1),
            premium_yn varchar(1),
            season_yn varchar(1)
        )`,
        function(error, result, fields) {
            if(error) {
                reject(error);
            } else {
                resolve(result);
            }
        }); 
    })
}

// menu_code_tb
function createMenuCode (connection) {
    return new Promise( (resolve, reject) => {
        connection.query(
        `CREATE TABLE menu_code_tb (
            menu_code varchar(5) primary key,
            menu_nm varchar(10) not null,
            area_code varchar(5) not null
        )`,
        function(error, result, fields) {
            if(error) {
                reject(error);
            } else {
                resolve(result);
            }
        }); 
    })
}

// orderer_info_tb
function createOrdererInfo (connection) {
    return new Promise( (resolve, reject) => {
        connection.query(
        `CREATE TABLE orderer_info_tb (
            orderer_pn varchar(13) primary key,
            orderer_nm varchar(10) not null,
            order_no varchar(15) not null
        )`,
        function(error, result, fields) {
            if(error) {
                reject(error);
            } else {
                resolve(result);
            }
        }); 
    })
}


// 사용하는 TABLE

// restarea_info_tb
function createRestareaInfo( connection) {
    return new Promise( (resolve, reject) => {
        connection.query(
        `CREATE TABLE restarea_info_tb (
            area_code varchar(5) primary key,
            area_nm varchar(30) character set utf8 not null,
            road_type varchar(10) not null,
            road_no varchar(10) not null,
            road_nm varchar(30) character set utf8 not null,
            road_way varchar(10) character set utf8 not null,
            latitude decimal(13,10) not null,
            longitude decimal(13,10) not null,
            parking_space_cnt varchar(5),
            maintenance_yn varchar(1),
            lpg_yn varchar(1),
            gas_yn varchar(1),
            electric_yn varchar(1),
            bus_transfer_yn varchar(1),
            shelter_yn varchar(1),
            restroom_yn varchar(1),
            pharmacy_yn varchar(1),
            nursing_room_yn varchar(1),
            store_yn varchar(1),
            restaurant_yn varchar(1),
            area_pn varchar(13)
        )`,
        function(error, result, fields) {
            if(error) {
                reject(error);
            } else {
                resolve(result);
            }
        }); 
    })
}

// order_info_tb
function createOrderInfo (connection) {
    return new Promise( (resolve, reject) => {
    connection.query(
        `CREATE TABLE order_info_tb (
            order_no varchar(15) primary key,
            orderer_pn varchar(13) not null,
            order_time datetime default now(),
            pay_id varchar(40) not null,
            area_nm varchar(30) character set utf8 not null,
            total_cost int not null,
            serving_yn varchar(1) not null default 'N',
            cancel_yn varchar(1) not null default 'N'
        )`,
        function(error, result, fields) {
            if(error) {
                reject(error);
            } else {
                resolve(result);
            }
        }); 
    })
}

// order_food_info_tb
function createOrderFoodInfo (connection) {
    return new Promise( (resolve, reject) => {
    connection.query(
        `CREATE TABLE order_food_info_tb (
            order_no varchar(15) not null,
            food_nm varchar(30) not null,
            food_price int(5) not null,
            food_cnt int(5) not null,
            total_price int(6) not null
        )`,
        function(error, result, fields) {
            if(error) {
                reject(error);
            } else {
                resolve(result);
            }
        }); 
    })
}


// DB create
async function createQuery( connection ) {

    const a = await createRestareaInfo(connection);     // 휴게소 정보 TB
    const b = await createOrderInfo(connection);        // 주문내역 TB
    const c = await createOrderFoodInfo(connection);    // 주문음식 정보 TB

    // console.log(a, b, c, d);
    // connection end
}

module.exports = createQuery;
// create 의 결과 여부를 return - 성공 OK, 실패 Fail 형태로 콘솔로