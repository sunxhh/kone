var headerClass = (function() {
    var headtpl = `<div class="logo-wrap">
			            <img class="logo-img" src="../img/logo.png">
			            <span class="company-name big-font">KONE ESCALATOR INTEGRATE PERFORMANCE TEST SYSTEM</span>
			            <div class="header-btn-wrapper">
			                <div class="header-user-info">
			                    <i class="user-icon"></i>
			                    <span class="header-username" style="margin-right: 20px;">{#name}</span>
			                    <a class="sign-out">Logout</a>
			                </div>
			            </div>
			        </div>`;

    function __self(obj) {
        var html = tpl.dataToHtml(obj, headtpl);
        $(".header").empty().append(html);
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
                    alert("Exit failed");
                }
            });

        });
    }

    return __self;
})();

headerClass(dominator.user);
