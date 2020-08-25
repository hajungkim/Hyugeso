// 데이터 삽입
const mysql = require('mysql');
const jsonData = require('./restareadata.json');
const request = require('request');

// number format
const formatNum = (number) => {
    let result;
    result = number < 10 ? '00' + number : (number < 100 ? '0' + number : number);
    return result;
}

// Json 에서 가져온 데이터 만큼, 반복 수행
function InsertLoop (connection) {
    // loop
    for (var i in jsonData.records) {
        let temp = jsonData.records[i];

        const restareaObj = {
            area_code: 'RA' + formatNum(i),
            area_nm: temp.휴게소명,
            road_no: temp.도로노선번호,
            road_type: temp.도로종류,
            road_nm: temp.도로노선명,
            road_way: temp.도로노선방향,
            latitude: temp.위도,
            longitude: temp.경도,
            parking_space_cnt: temp.주차면수,
            maintenance_yn: temp.경정비가능여부,
            lpg_yn: temp.LPG충전소유무,
            gas_yn: temp.주유소유무,
            electric_yn: temp.전기차충전소유무,
            bus_transfer_yn: temp.버스환승가능여부,
            shelter_yn: temp.쉼터유무,
            restroom_yn: temp.화장실유무,
            pharmacy_yn: temp.약국유무,
            nursing_room_yn: temp.수유실유무,
            store_yn: temp.매점유무,
            restaurant_yn: temp.음식점유무,
            area_pn: temp.휴게소전화번호,
        }

        insertRestareaInfo(connection, restareaObj);
    }
}

// 휴게소 데이터 INSERT
function insertRestareaInfo(connection, obj) {
    const SQL = {
        area_code: obj.area_code,
        area_nm: obj.area_nm,
        road_no: obj.road_no,
        road_type: obj.road_type,
        road_nm: obj.road_nm,
        road_way: obj.road_way,
        latitude: obj.latitude,
        longitude: obj.longitude,
        parking_space_cnt: obj.parking_space_cnt,
        maintenance_yn: obj.maintenance_yn,
        lpg_yn: obj.lpg_yn,
        gas_yn: obj.gas_yn,
        electric_yn: obj.electric_yn,
        bus_transfer_yn: obj.bus_transfer_yn,
        shelter_yn: obj.shelter_yn,
        restroom_yn: obj.restroom_yn,
        pharmacy_yn: obj.pharmacy_yn,
        nursing_room_yn: obj.nursing_room_yn,
        store_yn: obj.store_yn,
        restaurant_yn: obj.restaurant_yn,
        area_pn: obj.area_pn
    };

    connection.query(`INSERT INTO restarea_info_tb SET ?`, SQL, function(error, result, fields) {
        if(error) {
            throw error;
        } else {
            return result;
        }
    });
}

module.exports = InsertLoop;