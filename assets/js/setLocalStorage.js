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