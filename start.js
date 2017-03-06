var mongodb = require('mongodb'),
    mongoClient = mongodb.MongoClient,
    express = require('express'),
    app = express(),
    session = require('express-session'),
    MongoDBStore = require('connect-mongodb-session')(session),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    conn_str = "mongodb://localhost:27017/ass7";

var store = new MongoDBStore({
    uri:"mongodb://localhost:27017/ass7",
    collection:'user_session'
});

var ajaxResult = {
    "OK": {
        "status":200,
        "text":"successful Operation!"
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
    },
    "CONNECTIONFAIL":{
        "status":500,
        "text":"MongoDB failed to connect"
    },
    "LOGOUT":{
        "status": 405,
        "text": "You have to login in"
    }
};

app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(
    session({
        secret:'ass7_sess_secret_key',
        resave:true,
        saveUninitialized:true,
        store:store
    })
);

store.on('error', function (req, res) {
    console.log("error");
});

app.post('/postuser', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            console.log("Error happened while connecting to MongoDB");
        }else {
            var records = db.collection('users').find({"username":req.body.username});
            records.count(function (err, count) {
                if(count === 0){
                    console.log(req.body);
                    insertData(db,'users', req.body);
                    //req.session.user = req.body;
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

app.get('/isloggedin', function (req, res) {
    var isLoggedIn = req.session.user? true: false;
    res.send(isLoggedIn);
});

app.post('/login', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            console.log("Error happened while connecting to MongoDB");
        }else {
            db.collection('users').findOne({"username":req.body.username, "password": req.body.password}, function (err, data) {
                req.session.user = data;
                res.send(ajaxResult.FOUND);
            });
            db.close();
        }
    });
    req.session.user = req.body;
});

app.post('/logout', function (req, res) {
    req.session.user = null;
    res.send(ajaxResult.OK);
});

app.get('/getloguser', function (req, res) {
    res.send(req.session.user);
});

app.post('/getuser', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            console.log("Error happened while connecting to MongoDB");
            res.send(ajaxResult.CONNECTIONFAIL);
        }else {
            console.log(req.body);
            var records = db.collection('users').find({"username":req.body.username, "password":req.body.password});
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

app.post('/updateuser', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            console.log("Error happened while connecting to MongoDB");
            res.send(ajaxResult.CONNECTIONFAIL);
        }else {
            db.collection('users').update(req.session.user,req.body, function (err, result) {
                if(!err){
                    req.session.user = req.body;
                    res.send(ajaxResult.OK);
                }else {
                    res.send(ajaxResult.CONNECTIONFAIL);
                }
            });
        }
    });
});

app.get('/getlogusermessages', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            console.log("Error happened while connecting to MongoDB");
            res.send(ajaxResult.CONNECTIONFAIL);
        }else {
            db.collection('messages').find({"receiver":req.session.user.username}).toArray(function (err, result) {
                if(!err){
                    res.send(result);
                }else {
                    res.send(ajaxResult.LOGOUT);
                }
            });
        }
    });
});

app.post('/getmessages', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            res.send(ajaxResult.CONNECTIONFAIL);
        }else {
            db.collection('messages').findOne({"_id":req.body.id},function (err, result) {
                if(!err){
                    res.send(result);
                }else {
                    res.send(ajaxResult.LOGOUT);
                }
                db.close();
            });
        }
    });
});

app.post('/postmessage', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            res.send(ajaxResult.CONNECTIONFAIL);
        }else {
            db.collection('messages').insert(req.body, function (err) {
                if(!err){
                    db.collection('messages').find({"receiver":req.body.receiver}).toArray(function (err, result) {
                        res.send(result);
                    });
                }else {
                    res.send(ajaxResult.LOGOUT);
                }
                db.close();
            });
        }
    });
});

app.post('/updatemessage', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            console.log("error");
            res.send(ajaxResult.CONNECTIONFAIL);
        }else {
            db.collection('messages').update({"_id": new mongodb.ObjectID(req.body.id)}, {$set: {"important":req.body.important}},function (err, result) {
                if(!err){
                    db.collection('messages').find({"receiver":req.session.user}).toArray(function (err, result) {
                        res.send(result);
                    });
                }else {
                    res.send(ajaxResult.LOGOUT);
                }
                db.close();
            });
        }
    });
});

app.post('/deletemessage', function (req, res) {
    mongoClient.connect(conn_str, function(err, db){
        if(err){
            res.send(ajaxResult.CONNECTIONFAIL);
        }else {
            console.log(req.body.id);
            db.collection('messages').remove({"_id": new mongodb.ObjectID(req.body.id)},function (err, result) {
                //console.log(result);
                if(!err){
                    res.send(ajaxResult.OK);
                }else {
                    res.send(ajaxResult.NOTFOUND);
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
        }else {
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
