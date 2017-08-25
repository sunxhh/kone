// <div class="menu-type">
//     <div class="menu-name">
//         <i class="menu-icon "></i>
//         <a>被测电梯参数输入</a>
//         <i class="arrow-left"></i>
//     </div>
// </div>
// <div class="menu-type">
//     <div class="menu-name">
//         <i class="menu-icon pram-icon"></i>
//         <a>系统设置</a>
//         <i class="arrow-bottom"></i>
//     </div>
//     <div class="menu-link">
//         <a href="">设备参数列表</a>
//         <a href="" class="cur-url">User account</a>
//     </div>
// </div>


var leftMenu = (function() {
    var menuList = [{
        data: {
            url: '/en/page/inputTestInfo.html',
            name: 'Escalator Testing',
            openUrlList: ["/page/test.html"],
            imgClassName: 'pram-icon'
        }
    }, {
        data: {
            url: '/en/page/gatherData.html',
            name: 'Single Test',
            imgClassName: 'pan-icon'
        }
    }, {
        data: {
            url: '/en/page/video.html',
            name: 'Audio&Video',
            imgClassName: 'video-icon'
        }
    }, {
        data: {
            url: '/en/page/reportList.html',
            name: 'Data Inquiry',
            openUrlList: ["/page/escalatorData.html"],
            imgClassName: 'search-icon'
        }
    }, {
        data: {
            url: '/en/page/analyTestData.html',
            name: 'Data Analysis',
            openUrlList: ["/page/testDetail.html"],
            imgClassName: 'photo-icon'
        }
    }, {
        data: {
            url: '/en/page/dataStatistics.html',
            name: 'Data Statistics',
            imgClassName: 'chart-icon'
        }
        // ,
        // list: [{
        //     url: 'javascript:;',
        //     name: '数据分布'
        // }]
    }, {
        data: {
            url: 'javascript:;',
            name: 'System set',
            imgClassName: 'set-icon'
        },
        list: [{
            url: '/en/manage/testSteps.html',
            name: 'Test Procedure list'
        }, {
            url: '/en/manage/configSteps.html',
            name: 'Procedure configuration'
        }, {
            url: '/en/manage/unit.html',
            name: 'Test unit'
        }, {
            url: '/en/manage/configPorformanceParam.html',
            name: 'Parameter set'
        }, {
            url: '/en/manage/user.html',
            name: 'User account'
        }, {
            url: '/en/manage/setCheckParam.html',
            name: 'Correcting'
        }, {
            url: '/en/test/connectTest.html',
            name: 'Hardware test'
        }]
    }];

    // 测试用的menu
    var testMenuList = [{
        data: {
            url: '/en/page/inputTestInfo.html',
            name: 'Escalator test',
            openUrlList: ["/page/test.html"],
            imgClassName: 'pram-icon'
        }
    }, {
        data: {
            url: 'javascript:;',
            name: 'System set',
            imgClassName: 'set-icon'
        },
        list: [{
            url: '/en/manage/unit.html',
            name: 'Test unit'
        }]
    }];


    var linkList = [];
    var slideHtml = `<div class="menu-slide-left"></div>`;

    var menuType = function(data) {
        var obj = data.data;
        var wrap = document.createElement("div");
        wrap.className = "menu-type";

        var typeNameDiv = document.createElement("div");
        typeNameDiv.className = "menu-name";

        var menuLink = document.createElement("div");
        menuLink.className = "menu-link";

        wrap.open = function() {
            $(menuLink).show();
            $(wrap).find(".arrow").addClass("arrow-bottom").removeClass("arrow-left");
        };

        wrap.close = function() {
            $(menuLink).hide();
            $(wrap).find(".arrow").removeClass("arrow-bottom").addClass("arrow-left");
        }

        typeNameDiv.onclick = function() {
            var jQarrow = $(wrap).find(".arrow");
            if (jQarrow.length != 0) {
                if (jQarrow.hasClass("arrow-bottom")) {
                    wrap.close();
                } else {
                    wrap.open();
                }
            }
        };


        wrap.appendChild(typeNameDiv);
        wrap.appendChild(menuLink);

        var menuIcon = document.createElement("i");
        menuIcon.className = 'menu-icon ' + obj.imgClassName;

        var name = linkA(obj);

        typeNameDiv.appendChild(menuIcon);
        typeNameDiv.appendChild(name);

        if (data.list && data.list.length > 0) {
            var list = data.list;
            var arrow = document.createElement("i");
            arrow.className = 'arrow arrow-left';
            typeNameDiv.appendChild(arrow);

            for (var i = 0; i < list.length; i++) {
                var link = linkA(list[i])
                menuLink.appendChild(link);
            }
        }
        return wrap;
    };


    var linkA = function(data) {
        var map = {};
        map.data = data;

        var a = document.createElement("a");
        a.innerText = data.name;
        a.href = data.url;
        map.a = a;

        if (data.url != "javascript:;") {
            linkList.push(map);
        }
        return a;
    };


    var openCurMenu = function() {
        var href = location.href;
        var cura;
        for (var i = 0; i < linkList.length; i++) {
            var data = linkList[i];
            if ((~href.indexOf(data.data.url)) || (~href.indexOf(data.data.openUrlList))) {
                cura = data.a;
                break;
            }
        }
        $(cura).addClass("cur-url");
        var jQwrap = $(cura).parents(".menu-type");
        jQwrap.addClass("cur-menu");
        jQwrap[0] && jQwrap[0].open();
    };

    function bind() {
        $(".slide-btn").click(function() {
            if (moveSlide.isMoveing) {
                return;
            }
            if ($(this).hasClass("slide-open")) {
                moveSlide.close();
            } else {
                moveSlide.open();
            }
        });
    }

    var moveSlide = {
        isMoveing: false,
        close: function() {
            this.isMoveing = true;
            var that = this;
            $(".main-left .slide-btn").removeClass("slide-open").addClass("slide-close");
            $(".main-left").animate({ left: '-201px' }, 100, function() {
                that.isMoveing = false;
            });
            $(".main").animate({ 'margin-left': '30px' }, 100);
        },
        open: function() {
            this.isMoveing = true;
            var that = this;
            $(".main-left .slide-btn").removeClass("slide-close").addClass("slide-open");
            $(".main-left").animate({ left: '0px' }, 100, function() {
                that.isMoveing = false;
            });
            $(".main").animate({ 'margin-left': '230px' }, 100);
        }
    }

    function _self() {
        var jQbody = $(document.body);
        var jQwrap = jQbody.find(".main-left");
        var jQleft = $(slideHtml) //jQbody.find(".main-left");
        jQwrap.empty();
        for (var i = 0; i < menuList.length; i++) {
            jQleft.append(menuType(menuList[i]));
        }
        openCurMenu();
        // jQleft.append(slideHtml);
        jQwrap.append(`<div class="slide-btn slide-open"></div>`);
        jQwrap.append(jQleft);
        bind();
    };

    return _self;
})();

leftMenu();
