var app = angular.module('myApp', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/login', {templateUrl: 'views/login.html', controller: 'myController'})
        .when('/home', {templateUrl: 'views/home.html', controller: 'editController'})
        .when('/profile', {templateUrl: 'views/home.html', controller: 'editController'})
        .when('/message', {templateUrl: 'views/message.html', controller: 'messageController'})
        .when('/message/:id', {templateUrl:'views/message_details.html', controller: 'messageDetailsController'})
        .otherwise({redirectTo: '/login'});
}]);

app.controller('myController',  ['$scope', '$window', function ($scope, $window) {
    if(sessionStorage.logUser){
        return $window.location.href = "#/home";
    }
    $scope.login = function () {
        $scope.username_show = false;
        $scope.password_show = false;
        if($scope.login_username == undefined){
            $scope.username_show = true;
        }
        else if($scope.login_password == undefined){
            $scope.password_show = true;
        }
        else{
            var users = JSON.parse(localStorage.users);
            for(var key in users){
                if(users[key].username == $scope.login_username && users[key].password == $scope.login_password){
                    sessionStorage.logUser = JSON.stringify(users[key]);
                    return $window.location.href = "#/home";
                }
            }
            box("The username and password are not matched", true);
        }
    };
}]);

app.controller('editController', ['$scope', '$window', function ($scope, $window) {
    if(!sessionStorage.logUser){
        return $window.location.href = '#/login';
    }
    var user_info = JSON.parse(sessionStorage.logUser);
    $scope.edit_name = user_info.name;
    $scope.edit_password = user_info.password;
    $scope.edit_email = user_info.email;
    $scope.edit_username = user_info.username;
    $scope.edit_location = user_info.location;
    $scope.edit_number = user_info.number;
    $scope.update = function () {
        var user_info = {"username": $scope.edit_username, "password": $scope.edit_password, "name": $scope.edit_name, "location": $scope.edit_location, "email": $scope.edit_email, "number":$scope.edit_number};
        var old_user_str = sessionStorage.logUser;
        var newStr = localStorage.users.replace(old_user_str, JSON.stringify(user_info));
        sessionStorage.logUser = JSON.stringify(user_info);
        localStorage.users = newStr;
        box("Update User Information Successfully!");
    };
    $scope.reset = function () {
        $scope.edit_name = user_info.name;
        $scope.edit_password = user_info.password;
        $scope.edit_email = user_info.email;
        $scope.edit_location = user_info.location;
        $scope.edit_number = user_info.number;
        box("Reset Successfully!");
    };
    $scope.logout = function () {
        sessionStorage.removeItem("logUser");
        return $window.location.href = '#/login';
    };
}]);

app.controller('messageController', ['$scope', '$window', '$rootScope', function ($scope, $window, $rootScope) {
    var user_info = JSON.parse(sessionStorage.logUser);
    $scope.message_username = user_info.username;
    $scope.messages = JSON.parse(localStorage.messages);
    $scope.logout = function () {
        sessionStorage.removeItem("logUser");
        return $window.location.href = '#/login';
    };
    $scope.delete_message = function ($event) {
        var $tar = $event.target.parentNode.parentNode.parentNode;
        var deleting = $tar.getAttribute("messageobj");
        if(localStorage.messages.indexOf("," + deleting) > -1){
            localStorage.messages = localStorage.messages.replace("," + deleting, "");
            document.getElementById("container").removeChild($tar);
        }else if(localStorage.messages.indexOf(deleting + ",") > -1){
            localStorage.messages = localStorage.messages.replace(deleting + ",", "");
            document.getElementById("container").removeChild($tar);
        }else {
            alert("Error");
        }
    };
    $scope.view_message = function ($event) {
        var thisMes = JSON.parse($event.target.parentNode.parentNode.parentNode.getAttribute("messageobj"));
        $rootScope.thisMessage = thisMes;
        var timestamp = thisMes.timestamp;
        //$location.path("#/message/" + timestamp);
        $window.location.href = '#/message/' + timestamp;
    };
    $scope.open_send = function () {
        $scope.needSendMessage = true;
        $scope.needViewMessage = false;
    };
    $scope.make_important = function ($event) {
        var oldObjStr = $event.target.parentNode.parentNode.parentNode.getAttribute("messageobj");
        var newObj = JSON.parse(oldObjStr);
        newObj.important = !JSON.parse(oldObjStr).important;
        var newStr = localStorage.messages.replace(oldObjStr, JSON.stringify(newObj));
        localStorage.messages = newStr;
        $scope.messages = JSON.parse(newStr);
        box("setting successfully!")
    };
    var sendFn = function (important) {
        if($scope.receiver == undefined || $scope.subject == undefined || $scope.content == undefined){
            box("Please fill in all text box", true);
            return false;
        }
        var user_info = JSON.parse(sessionStorage.logUser);
        var date = new Date();
        var timestamp = (new Date()).valueOf();
        var mes = {"sender":user_info.username, "receiver":$scope.receiver,"date":date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),"subject":$scope.subject,"content":$scope.content,"important":important,"timestamp":timestamp};
        var messages_arr = JSON.parse(localStorage.messages);
        messages_arr.push(mes);
        localStorage.messages = JSON.stringify(messages_arr);
        $scope.messages = messages_arr;
        $scope.receiver = "";
        $scope.subject = "";
        $scope.content = "";
        $scope.needSendMessage = false;
    };
    $scope.send = function () {
        sendFn(false);
    };
    $scope.send_as_important = function () {
        sendFn(true);
    };
}]);

app.controller('messageDetailsController', ['$scope', '$rootScope', '$window', function ($scope, $rootScope, $window) {
    $scope.logUser = $rootScope.thisMessage;
    $scope.back = function () {
        $window.location.href = "#/message";
    }
}]);

app.directive('messageDirective', ['$compile', function ($compile) {
    return {
        templateUrl:'message_component.html',
        controller:'messageController',
        restrict:'E',
        link:function (scope, elem, attrs) {
            var obj = JSON.parse(attrs.messageobj);
            scope.important = obj.important;
            scope.sender = obj.sender;
            scope.date = obj.date;
            scope.subject = obj.subject;
            scope.makeImp = function () {
                var oldObjStr = elem[0].getAttribute("messageobj");
                var newObj = JSON.parse(oldObjStr);
                newObj.important = !JSON.parse(oldObjStr).important;
                var newStr = localStorage.messages.replace(oldObjStr, JSON.stringify(newObj));
                localStorage.messages = newStr;
                scope.important = !scope.important;
                box("setting successfully!")
            };
        }
    };
}]);
