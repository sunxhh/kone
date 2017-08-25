var domOpt = {
    username: {
        subId: "username",
        dom: "#username",
        err: "Please Enter Your Username"
            // ,
            // set: function() {

        // },
        // get: function() {

        // }
    },
    password: {
        subId: "password",
        dom: "#password",
        err: "Please Enter Your Password"
    }
};

// 显示错误
function showError1(text) {
    var errorDiv = $(".red-error-1");
    errorDiv.text(text);
    errorDiv.css({
        "visibility": "visible"
    });
};

// 获取数据
function getDomData(data, list) {
    for (var i = 0; i < list.length; i++) {
        var name = list[i];
        var obj = domOpt[name];
        var val;
        if (obj.get) {
            val = obj.get();
        } else {
            val = $(obj.dom).val();
        }
        if (isEmpty(val) && !obj.noMust) {
            showError1(obj.err);
            return false;
        }
        data[name] = val;
    }
    return true;
};

// 设置数据
function setDomData(data, list) {
    for (var i = 0; i < list.length; i++) {
        var name = list[i];
        var obj = domOpt[name];
        if (obj.set) {
            obj.set(data[name], data);
        } else {
            $(obj.dom).val(data[name]);
        }
    }
};

// 保存用户名密码
function savePass(data) {
    if ($("#remember-pass").prop("checked")) {
        storage.save("username", data.username);
        storage.save("password", data.password);
    } else {
        storage.remove("username");
        storage.remove("password");
    }
};


var login = function() {
    var data = {};
    var list = ["username", "password"];
    if (!getDomData(data, list)) {
        return false;
    }
    ajax.login(data, function(cl) {
        savePass(data);
        location.href = '/page/inputTestInfo.html';
    }, function(cl) {
        showError1("ERROR Incorrect username or password");
    });
};


// 设置用户名密码
function setPass() {
    var data = {};
    var list = ["username", "password"];
    data.username = storage.get("username");
    data.password = storage.get("password");
    if (data.username && data.password) {
        setDomData(data, list);
        $("#remember-pass").prop("checked", "checked");
    }
};

function bindle() {
    $(".delete-btn").click(function() {
        var input = $(this).parent(".login-row").find("input");
        input.val("");
    });

    $("#submit").click(function() {
        login();
    });

    $("body").keydown(function(e) {
        var key = getKeyboard(e);
        if (key == 13) {
            login();
        }
    });
}

setPass()
bindle()
