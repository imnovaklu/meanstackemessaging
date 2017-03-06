var app = angular.module('myApp', ['ngRoute']);

app.service('userService', ['$http', function ($http) {
    this.getLogUser = function (callback) {
        $http.get('/getloguser')
            .success(function (resp){
                callback(resp);
            })
    }
}]);

app.service('formService', [function () {
    this.serializeObject = function ($ele) {
        var $txt = $ele.find('input[type="text"], input[type="password"]');
        var obj = {};
        $txt.each(function (index, $val) {
            obj[$val.title] = $val.value;
        });
        return obj;
    }
}]);

app.service('boxService', [function () {
    this.box = function (str, alert) {
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
}]);

app.service('messageService', ['$http', function ($http) {
    this.send = function ($scope, important) {
        if($scope.receiver == undefined || $scope.subject == undefined || $scope.content == undefined){
            boxService.box("Please fill in all text box", true);
            return false;
        }
        $http.get('/getloguser')
            .success(function (loguser) {
                var date = new Date();
                var mes = {"sender":loguser.username, "receiver":$scope.receiver,"date":date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(),"subject":$scope.subject,"content":$scope.content,"important":important};
                $http.post('/postmessage', mes)
                    .success(function (resp) {
                        $scope.messages = resp;
                        $scope.receiver = "";
                        $scope.subject = "";
                        $scope.content = "";
                        $scope.needSendMessage = false;
                    });
            });
    };
}]);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/login', {templateUrl: 'views/login.html', controller: 'myController'})
        .when('/register', {templateUrl: 'views/register.html', controller: 'registerController'}) //页面上没有加ng-controller
        .when('/home', {templateUrl: 'views/home.html', controller: 'editController'})
        .when('/profile', {templateUrl: 'views/home.html', controller: 'editController'})
        .when('/message', {templateUrl: 'views/message.html', controller: 'messageController'})
        .when('/message/:id', {templateUrl:'views/message_details.html', controller: 'messageDetailsController'})
        .otherwise({redirectTo: '/login'});
}]);

app.controller('myController',  ['$scope', '$window', '$http', '$location', 'boxService', function ($scope, $window, $http, $location, boxService) {
    $http.get('/isloggedin')
        .success(function (data) {
            if(data){
                $location.path('/home');
            }
        });
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
            $http.post('/getuser', {"username":$scope.login_username,"password":$scope.login_password})
                .success(function (data) {
                    //console.log(data);
                    if(data.status === 200){
                        $http.post('/login', {"username":$scope.login_username,"password":$scope.login_password})
                            .success(function (data) {
                                console.log(data);
                                if(data.status === 200){
                                    return $window.location.href = "#/home";
                                }
                            });
                    }else {
                        boxService.box("The username and password are not matched", true);
                    }
                });
        }
    };
    $scope.register = function () {
        $window.location.href = "#/register";
    };
}]);

app.controller('registerController', ['$scope', '$location', '$http', 'formService', 'boxService', function ($scope, $location, $http, formService, boxService) {
    function clearAll() {
        for(var key in $scope.newuser){
            $scope.newuser[key] = "";
        }
    }
    $scope.submit_register = function () {
        var $form = $("#add_contact");
        $http.post('/postuser', formService.serializeObject($form))
            .success(function (data) {
                if (data.status == 200) {
                    boxService.box(data.text);
                } else if (data.status == 400) {
                    boxService.box(data.text, true)
                }
                clearAll();//+
                $location.path("/login");
            })
            .error(function () {
            });
    };
    $scope.clear_all = function () {
        clearAll();
    };
    $scope.back_login = function () {
        $location.path('/login');
    };
}]);

app.controller('editController', ['$scope', '$location', '$http', 'formService', 'boxService', 'userService', function ($scope, $location, $http, formService, boxService, userService) {
    var user_info;
    $http.get('/isloggedin')
        .success(function (data) {
            if(!data){
                return $location.path('/login');
            }else{
                userService.getLogUser(function (user) {
                    console.log('***********');
                    console.log(user);
                    user_info = jQuery.extend({}, user);
                    $scope.user_info = user;
                });
                /*$http.get('/getloguser')
                    .success(function (user) {
                        user_info = jQuery.extend({}, user);
                        $scope.user_info = user;
                    })*/
            }
        });

    $scope.update = function () {
        var new_user_info = formService.serializeObject($('#add_contact'));
        $http.post('/updateuser', new_user_info)
            .success(function (resp) {
                if(resp.status == 200){
                    boxService.box("Update User Information Successfully!");
                }
            });
        //var user_info = {"username": $scope.edit_username, "password": $scope.edit_password, "name": $scope.edit_name, "location": $scope.edit_location, "email": $scope.edit_email, "number":$scope.edit_number};
        /*var old_user_str = sessionStorage.logUser;
        var newStr = localStorage.users.replace(old_user_str, JSON.stringify(user_info));
        sessionStorage.logUser = JSON.stringify(user_info);
        localStorage.users = newStr;
        box("Update User Information Successfully!");*/
    };
    $scope.reset = function () {
        $scope.user_info = user_info;
        boxService.box("Reset Successfully!");
    };
    $scope.logout = function () {
        $http.post('/logout')
            .success(function (res) {
                if(res.status == 200){
                    $location.path('#/login');
                }
            });
    };
}]);

app.controller('messageController', ['$scope', '$location', '$rootScope', '$http', 'boxService', 'messageService', function ($scope, $location, $rootScope, $http, boxService, messageService) {
    $http.get('getloguser')
        .success(function (user) {
            $http.get('/getlogusermessages')
                .success(function (resp) {
                    $scope.message_username = user;
                    $scope.messages = resp;
                });
        });
    $scope.logout = function () {
        $http.post('/logout')
            .success(function (res) {
                if(res.status == 200){
                    $location.path('#/login');
                }
            });
    };
    $scope.delete_message = function ($event) {
        var tar = $event.target.parentNode.parentNode;
        console.log(tar);
        console.log(tar.getAttribute("messageobj"));
        $http.post('/deletemessage',{"id":tar.getAttribute("messageobj")})
            .success(function () {
                $(tar).slideUp();
            });
    };
    $scope.view_message = function ($event) {
        var thisMes = JSON.parse($event.target.parentNode.parentNode.parentNode.getAttribute("messageobj"));
        $rootScope.thisMessage = thisMes;
        var timestamp = thisMes.timestamp;
        $location.path('/message/' + timestamp);
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
        boxService.box("setting successfully!")
    };

    $scope.send = function () {
        messageService.send($scope, false);
        console.log($scope);
    };
    $scope.send_as_important = function () {
        messageService.send($scope, true);
    };
}]);

app.controller('messageDetailsController', ['$scope', '$rootScope', '$window', function ($scope, $rootScope, $window) {
    $scope.logUser = $rootScope.thisMessage;
    $scope.back = function () {
        $window.location.href = "#/message";
    }
}]);

app.directive('messageDirective', ['$compile', '$http', 'boxService', function ($compile, $http, boxService) {
    return {
        templateUrl:'views/message_component.html',
        controller:'messageController',
        restrict:'E',
        link:function (scope, elem, attrs) {
            $http.post('/getmessages', {"id":attrs.messageobj})
                .success(function (resp) {
                    console.log(resp);
                });
        }
    };
}]);
