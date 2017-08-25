var dominator = {
    //当前版本,适合js修改之后防止用户出现缓存导致新js无法载入
    config: {
        //当前版本
        version: "v11"
    }
};


void

function() {
    var config = dominator.config;
    //需要载入的js和css的标签
    var rs = [];
    var script = document.getElementsByTagName("script");

    var node = script[script.length - 1];
    var css = node.getAttribute("css");

    //获取script的路径
    var path = node.src.split("config.js")[0];
    rs.push('<link href="/css/css.css' + '?' + config.version + '" rel="stylesheet" type="text/css" />');
    //不使用css 设置为none
    if (css != "none" && css) {
        css = css.split(",");
        while (css.length) {
            rs.push('<link href="' + css.shift() + '?' + config.version + '" rel="stylesheet" type="text/css" />');
        }
    }

    rs.push('<script type="text/javascript" src="' + path + 'jquery.js"></script>');
    //加入common.js
    rs.push('<script type="text/javascript" src="' + path + 'common.js?' + config.version + '"></script>');
    //加入 data.js
    rs.push('<script type="text/javascript" src="' + path + 'data.js?' + config.version + '"></script>');
    //写入节点数据
    rs.push('<script type="text/javascript" src="' + path + 'check.js?' + config.version + '"></script>');

    document.write(rs.join(""));

    //使用的js延后加载
    var js = node.getAttribute("js");
    config.jss = js;
}();
