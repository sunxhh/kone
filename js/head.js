var headerClass = (function() {
    var headtpl = `<div class="logo-wrap">
                        <img class="logo-img" src="../img/logo.png">
                        <span class="company-name big-font">通力扶梯综合性能测试系统</span>
                        <div class="header-btn-wrapper">
                            <div class="header-user-info select-language">
                                <a class="chinese-language">中文</a><a class="englise-language">English</a>
                            </div>
                            <div class="header-user-info">
                                <i class="user-icon"></i>
                                <span class="header-username" style="margin-right: 20px;">{#name}</span>
                                <a class="sign-out">退出登录</a>
                            </div>
                        </div>
                    </div>`;

    function changeLanguage(type) {
        var url = location.href;
        var pathname = location.pathname;
        type = type || "ch"
        if (type == "en") {
            if (~url.indexOf("/en/")) {
                return;
            }
            location.href = ("/en" + pathname);
        } else {
            if (!~url.indexOf("/en/")) {
                return;
            }
            location.href = pathname.replace(/^(\/en)/,"");
        }
    }

    function __self(obj) {
        var html = tpl.dataToHtml(obj, headtpl);
        $(".header").empty().append(html);
        $(".header").find(".chinese-language").click(function() {
            changeLanguage();
        });
        $(".header").find(".englise-language").click(function() {
            changeLanguage("en");
        });
        $(".header").find(".sign-out").click(function() {
            $.ajax({
                type: 'get',
                url: "/userLogout.2x",
                data: {},
                timeout: 20000, //  暂时先设置20秒延迟
                dataType: "json",
                success: function(d) {
                    location.href = "/login.html";
                },
                error: function(d) {
                    alert("退出失败");
                }
            });

        });
    }

    return __self;
})();

headerClass(dominator.user);
