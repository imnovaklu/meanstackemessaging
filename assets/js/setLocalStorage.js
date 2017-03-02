/*
var users = [
    {"username": "chenlu", "password": "1992", "name": "chen lu", "location": "New Jersey", "email": "564275140@qq.com", "number":"315-243-5608"},
    {"username": "english", "password": "mama", "name": "Michael Jason", "location": "New York", "email": "mkjason@gmail.com", "number":"745-654-1179"}
];
var messages = [
    {"sender":"chenlu", "receiver":"english","date":"2/17/2017","subject":"Are you","content":"Are you ready to go?","important":true,"timestamp":1280977330748},
    {"sender":"chenlu", "receiver":"english","date":"2/17/2017","subject":"Please come out","content":"Please come out?","important":true,"timestamp":1280977330753},
    {"sender":"english", "receiver":"chenlu","date":"2/17/2017","subject":"Wait","content":"Wait me for an hour, OK?","important":false,"timestamp":1280977330818},
    {"sender":"chenlu", "receiver":"english","date":"2/18/2017","subject":"Sure","content":"Sure, I'd love to wait for you!","important":true,"timestamp":1280977331225}
    ];
if(!localStorage.users){
    localStorage.users = JSON.stringify(users);
}
if(!localStorage.messages){
    localStorage.messages = JSON.stringify(messages);
}
*/

function box(str, alert) {
    var $box = jQuery("#informationBox");
    if(alert != undefined){
        $box.addClass("alertBox");
    }else {
        $box.removeClass("alertBox");
    }
    $box.html(str);
    $box.addClass("confirmBox_down");
    setTimeout(function () {
        $box.removeClass("confirmBox_down");
    },3000);
}