var mongoClient = require("mongodb").MongoClient,
    express = require('express'),
    app = express(),
    fs = require('fs'),
    conn_str = "mongodb://localhost:27017/ass7";

app.use(express.static('assets'));

/*app.post('/postuser', function (req, res) {
    console.log('username: ' + req.query.username);
    console.log('password: ' + req.query.password);
    res.send("Finished");
});

app.post('/postmessage', function (req, res) {
    res.sendfile(__dirname + '/login.html');
});*/

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(function (req, res) {
    res.send('404 Not Found!!!!');
});

app.listen(8080, function () {
    console.log('Server running @ localhost:8080');
});

function insertDataArray(db, collection, objArr) {
    var devices = db.collection(collection);
    objArr.forEach(function (data) {
        devices.insert(data,function(err, res){
            if(err) {
                console.log("error while inserting");
            }else{
                console.log("finish inserting");
            }
            //db.close();
        });
    });
}

/*mongoClient.connect(conn_str, function(error, db){
    console.log('Connection Established!');
    var users = [
        {"username": "chenlu", "password": "1992", "name": "chen lu", "location": "New Jersey", "email": "564275140@qq.com", "number":"315-243-5608"},
        {"username": "english", "password": "mama", "name": "Michael Jason", "location": "New York", "email": "mkjason@gmail.com", "number":"745-654-1179"}
    ];
    var messages = [
        {"sender":"chenlu", "receiver":"english","date":"2/17/2017","subject":"Are you","content":"Are you ready to go?","important":true},
        {"sender":"chenlu", "receiver":"english","date":"2/17/2017","subject":"Please come out","content":"Please come out?","important":true},
        {"sender":"english", "receiver":"chenlu","date":"2/17/2017","subject":"Wait","content":"Wait me for an hour, OK?","important":false},
        {"sender":"chenlu", "receiver":"english","date":"2/18/2017","subject":"Sure","content":"Sure, I'd love to wait for you!","important":true}
    ];
    /!*insertDataArray(db,'users', users);
    insertDataArray(db,'messages', messages);*!/
    var db_records = db.collection('messages').find();
    db_records.each(function (err, res) {
        console.log(res);
    });
});*/
