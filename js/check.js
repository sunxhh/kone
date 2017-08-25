//需要延迟载入的js
function loadjs() {
    if (dominator.config.jss) {
        dominator.require(dominator.config.jss);
    }
};

var noneedSignList = ['/login.html'];

function getUser() {
    var pathname = location.pathname;
    if (!~noneedSignList.indexOf(pathname)) {
        ajax.getCurrentUser(function(data) {
            dominator.user = data.objects;
            loadjs();
        }, function(data) {
            location.href = '/login.html';
        });
    }
    else{
    	loadjs();
    }
}
getUser();