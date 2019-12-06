const express = require("express");
const http = require("http");

let app = express();
app.set("port", 8082);

var server = app.listen(app.get('port'), '0.0.0.0', function () {
    var port = server.address().port;
    console.log('AC Shuffle Racing Proxy started on ' + port);
});

app.get("/*", processMessage);

let shufflecarname = "__temp";
let carList = ["ks_porsche_718_boxster_s_pdk", "ks_nissan_370z", "lotus_evora_s", "ks_bmw_m235i_racing", "bmw_z4_drift", "ks_audi_sport_quattro", "ks_alfa_romeo_4c", "ks_ford_mustang_2015", "ks_mazda_rx7_spirit_r", "ks_porsche_cayenne"];
let skinList = {
    ks_porsche_718_boxster_s_pdk: ["14_sapphire_blue_metallic"],
    ks_nissan_370z: ["01_magnetic_black_met"],
    lotus_evora_s: ["Chrome_Orange"],
    ks_bmw_m235i_racing: ["racing_44"],
    bmw_z4_drift: ["Falken"],
    ks_audi_sport_quattro: ["05_tornado_red"],
    ks_alfa_romeo_4c: ["rosso_alfa_black_rims_pastel"],
    ks_ford_mustang_2015: ["02_triple_yellow_tricoat_s2"],
    ks_mazda_rx7_spirit_r: ["08_titanium_grey"],
    ks_porsche_cayenne: ["09_sapphire_blue_metallic"]
};

function getCar() {
    let car = carList[carList.length * Math.random() | 0];
    console.log(car);
    return car;
}

function getSkinForCar(car) {
    let skin = skinList[car][skinList[car].length * Math.random() | 0];
    console.log(skin);
    return skin;
}

function processMessage(req, res) {
    console.log(req.path);

    let url = new URL("http://127.0.0.1:8081");
    var options = {
        // here we use model_ui because that's what genesis exports, and starts with a dm/graph node
        // todo maybe work on non ui models?
        path: req.path,
        host: url.hostname,
        port: url.port,
        method: 'GET'
    };

    if (req.path.indexOf("SUB") > 0) {
        let params = req.path.split("%7C");
        params[1] = getCar();
        params[2] = getSkinForCar(params[1]);
        //console.log(params);
        options.path = params.join("|");
    }

    let reqs = http.request(options, function (incoming) {
        let response = "";
        incoming.setEncoding('utf8');
        incoming.on('data', (chunk) => {
            response += chunk;
        });
        incoming.on('end', () => {
            if (req.path === "/INFO") {
                console.log("intercepting info request");
                let json = JSON.parse(response);
                json.cport = 8082;
                json.cars = [shufflecarname];
                json.name = "WAT: Shuffle Racing Test";
                response = JSON.stringify(json);
            }

            if (req.path.indexOf("JSON") > 0) {
                let json = JSON.parse(response);
                json.Cars.forEach(c => { c.Model = shufflecarname; c.Skin = "temp" });
                response = JSON.stringify(json);
            }

            console.log(response);
            res.end(response);
        });
    });

    reqs.end();
}