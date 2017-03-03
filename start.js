var mongoClient = require("mongodb").MongoClient,
    express = require('express'),
    app = express(),
    fs = require('fs'),
    conn_str = "mongodb://localhost:27017/ass7";

app.use(express.static('assets'));

var ajaxResult = {
    "OK": {
        "status":200,
        "text":"Register successfully!"
    },
    "DUPLICATED": {
        "status":400,
        "text":"Please use another username"
    },
    "NOTFOUND": {
        "status":404,
        "text":"The username and password are not matched"
    },
    "FOUND":{
        "status":200,
        "text":"Login in"
    }
};

app.post('/postuser', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            console.log("Error happened while connecting to MongoDB");
        }else {
            var records = db.collection('users').find({"username":req.query.username});
            records.count(function (err, count) {
                if(count === 0){
                    var users = {
                        "username": req.query.username,
                        "password": req.query.password,
                        "name": req.query.name,
                        "location": req.query.location,
                        "email": req.query.email,
                        "number": req.query.number
                    };
                    insertData(db,'users', users);
                    res.send(ajaxResult.OK);
                }else {
                    console.log("Not allowed to insert duplicated items");
                    res.send(ajaxResult.DUPLICATED);
                }
                db.close();
            });
        }
    });
});

app.get('/getuser', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            console.log("Error happened while connecting to MongoDB");
        }else {
            db.collection('users').findOne({"username":req.query.username,"password":req.query.password}, function (err, data) {
                console.log(data);
                if(data == null){
                    res.send({});
                }else {
                    res.send(data);
                }
                
            });
            
            /*records.each(function (val) {
                if(val == null){
                    res.send(ajaxResult.NOTFOUND);
                }else {
                    console.log(val);
                    res.send({"status":200,"text":"", "data":val})
                }
                db.close();
            });*/
        }
    });
});

app.get('/finduser', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            console.log("Error happened while connecting to MongoDB");
        }else {
            var records = db.collection('users').find({"username":req.query.username,"password":req.query.password});
            records.count(function (err, count) {
                if(count === 0){
                    res.send(ajaxResult.NOTFOUND);
                }else {
                    res.send(ajaxResult.FOUND);
                }
                db.close();
            });
        }
    });
});

app.post('/postmessage', function (req, res) {
    res.sendfile(__dirname + '/login.html');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(function (req, res) {
    res.send('404 Not Found!!!!');
});

app.listen(8080, function () {
    console.log('Server running @ localhost:8080');
});

function insertData(db, collection, obj) {
    var devices = db.collection(collection);
    devices.insert(obj, function(err, res){
        if(err) {
            console.log("error while inserting");
        }else{
            console.log("finish inserting");
        }
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
