'use strict'
// 显示错误
function showError1(text) {
    var errorDiv = $(".red-error-1");
    errorDiv.text(text);
    errorDiv.css({
        "visibility": "visible"
    });
};


$.extend(tpl.format, {

});
var urlData = getUrlRequest();
var liftData = JSON.parse(sessionstorage.get("report_" + getUrlRequest().id));

var querynameMap = {
    1: "vibration",
    2: "speed",
    3: "noise",
    4: "energy"
}

// 算法对应的map
var arithmeticType = {
    1: ["iso", "rms"]
};

var aRadio = function(data) {
    var self = this;
    var html = tpl.getDataTpl("ari_unit", data);
    var label = this.label = $(html).filter("label")[0];
    this.data = data;
    var input = this.input = $(label).find("input")[0];

    input.onclick = function() {
        self.sendCommand();
    };
};
aRadio.prototype = {
    // 发送命令
    sendCommand: function() {
        var wrap = $(".test-unit-left");
        var input = $(this.label).find("input");
        if (input.prop("checked")) {
            wrap.find("input[name=radio]").not(input).prop("checked", false);
            this.start();
        } else {
            this.stop();
        }
    },
    start: function() {
        var checked = unitbox.getChecked();
        if (checked) {
            if (checked.data.lifttype.substring(0, 1) == 1) {
                checked.start();
            }
        }
    },
    stop: function() {
        var checked = unitbox.getChecked();
        if (checked) {
            if (checked.data.lifttype.substring(0, 1) == 1) {
                checked.start();
            }
        }
    }
};

var arithmeticOpt = function() {
    for (var type in arithmeticType) {
        var list = arithmeticType[type];
        for (var i = 0; i < list.length; i++) {
            var obj = {
                type: type,
                isArithmetic: true,
                id: list[i]
            };
            var ra = new aRadio(obj);
            if (!unitbox.boxList[type]) {
                unitbox.boxList[type] = [];
            }
            arithmeticOpt.list.push(ra);
            unitbox.boxList[type].push(ra);
        }
    }
};
arithmeticOpt.list = [];

function getVibrationType() {
    var filterType = '';
    var radioList = arithmeticOpt.list;
    for (var i = 0; i < radioList.length; i++) {
        if (radioList[i].input.checked) {
            filterType = radioList[i].data.id;
            break;
        }
    }
    return filterType;
};

// 生成CheckBox
var unitbox = (function() {
    var boxList = {};

    var box = function(data) {
        return new box.prototype.init(data);
    };

    box.prototype = {
        init: function(data) {
            var self = this;
            var html = tpl.getDataTpl("test_unit", data);
            var label = this.label = $(html).filter("label")[0];
            this.data = data;
            var input = this.input = $(label).find("input")[0];
            var type = testDeviceTypeMap[data.lifttype.substring(0, 1)];
            this.data.deviceType = type;

            input.onclick = function() {
                self.sendCommand();
            };
        },
        getSpeed: function() {
            var list = $(".test-unit-right").find("input");
            var ll = [];
            for (var i = 0; i < list.length; i++) {
                if (list.eq(i).prop("checked")) {
                    ll.push(list.eq(i).attr("lifttype"));
                }
            }
            return ll.join(',');
        },
        // 开始获取数据
        start: function() {
            var data = __self.getChecked().data;
            if (!data) {
                page.resetChartWrap();
                return false;
            }
            console.log(data)
            var sendData = {
                liftno: liftData.liftno,
                queryname: querynameMap[data.lifttype.substring(0, 1)],
                lifttype: data.lifttype,
                runType: data.runType,
                testrecordid: urlData.id
            };

            if(sendData.lifttype.substring(0,1) == '4'){
                // 能耗 lifttype 转成00上行 和01下行
                if(sendData.runType == -1){
                    sendData.lifttype = "01";
                }
                else{
                    sendData.lifttype = "00";
                }
            }
            

            if (this.getSpeed()) {
                sendData.speedype = this.getSpeed();
            }

            if (data.lifttype.substring(0, 1) == '1') {
                var filterType = '';
                var radioList = arithmeticOpt.list;
                for (var i = 0; i < radioList.length; i++) {
                    if (radioList[i].input.checked) {
                        filterType = radioList[i].data.id;
                        break;
                    }
                }
                if (filterType) {
                    sendData.filterType = filterType;
                }
            }

            ajax.queryData(sendData, function(data) {
                page.creatLine(data.objects);

            });
        },
        // 发送命令
        sendCommand: function() {
            var checkbox = $(this.label).find("input");
            var type = this.data.lifttype.substring(0, 1);
            if (checkbox.prop("checked")) {
                if (type != "2") {
                    this.cancelChecked();
                }

            }
            this.start();
        },
        cancelChecked: function() {
            var curId = this.data.id;
            for (var id in boxList) {
                var list = boxList[id];
                for (var i = 0; i < list.length; i++) {
                    var obj = list[i];
                    var type;
                    if (obj.data.lifttype) {
                        type = obj.data.lifttype.substring(0, 1);
                    }

                    if ($(obj.label).find("input").prop("checked") && !obj.data.isArithmetic && type != "2") {
                        
                        if (obj.data != this.data) {
                            $(obj.label).find("input").prop("checked", false);
                        }
                    }

                }
            }
        }
    };

    box.prototype.init.prototype = box.prototype;

    var __self = function(list, fn) {
        for (var i = 0; i < list.length; i++) {
            var obj = list[i];
            var b = box(obj);
            var type = obj.lifttype.substring(0, 1);
            if (!boxList.hasOwnProperty(type)) {
                boxList[type] = [];
            }
            boxList[type].push(b);
        }
        fn && fn();
    }


    __self.boxList = boxList;
    __self.getChecked = function() {
        for (var id in boxList) {
            var list = boxList[id];
            for (var i = 0; i < list.length; i++) {
                var obj = list[i];
                var type;
                if (obj.data.lifttype) {
                    type = obj.data.lifttype.substring(0, 1);
                }

                if ($(obj.label).find("input").prop("checked") && !obj.data.isArithmetic && type != "2") {
                    return obj;
                }

            }
        }
        return false;
    };
    return __self;
})();
window.unitbox = unitbox;

// 弹出层
function buildFloatLayer(data) {
    floatLayer({
        width: data.width || "500px",
        title: data.title,
        content: data.content
    }, function(p) {
        var jQcloseBtn = $(p.wrap).find(".popu-title .close-popu");
        jQcloseBtn.click(function() {
            p.close();
        });
        data.initFn && data.initFn(p);
    });
};
window.buildFloatLayer = buildFloatLayer;


var page = {
    init: function() {
        this.bindle();
        this.getList();

        this.setLiftData();
    },
    resetChartWrap: function() {
        $("#chart_list_wrap").empty();
        $("#chart_btn_wrap").empty();
        $("#chart_list_wrap").append(tpl.getDataTpl("chart_wrap_popu", {
            type: 1
        }));
    },
    emptyChartWrap: function() {
        $("#chart_list_wrap").empty();
        $("#chart_btn_wrap").empty();
    },
    creatLine: function(data) {
        this.emptyChartWrap();
        var formatedData = createChartsList(data);
    },
    setLiftData: function() {
        $("#lift_name_span").text(liftData.name);
        $("#lift_type_span").text(liftData.handstraptype);
        $("#lift_beltline_span").text(liftData.productline);
    },
    bindle: function() {
        var self = this;
        $(".tab-div a").click(function() {
            $(".tab-div a").removeClass("selected");
            $(this).addClass("selected");
            self.showUnit();
        });
        $("#chart_btn_wrap").click(function(e) {
            let target = e.target;
            if ($(target).hasClass('chart-btn')) {
                let cid = $(target).attr('cid');
                if ($(target).hasClass('hide-chart-btn')) {
                    $(target).removeClass('hide-chart-btn')
                    $(`#${cid}`).show();
                } else {
                    $(target).addClass('hide-chart-btn')
                    $(`#${cid}`).hide();
                }
            }
        });
    },
    createSpeedUnit: function() {
        var type = 2;
        var wrap = $(".test-unit-right");
        wrap.empty();
        var list = unitbox.boxList[type];
        if (!list) {
            return;
        }
        for (var i = 0; i < list.length; i++) {
            wrap.append(list[i].label);
        }
    },
    showUnit: function() {
        var type = $(".tab-div .selected").attr("type");
        var wrap = $(".test-unit-left");
        wrap.empty();
        var list = unitbox.boxList[type];
        if (!list) {
            return;
        }
        for (var i = 0; i < list.length; i++) {
            wrap.append(list[i].label);
        }
    },
    // 获取当前测试步骤的测试单元
    getList: function() {
        var that = this;
        ajax.queryUnits(function(callback) {
            var obj = callback.objects;
            ajax.getSteps(liftData.testjobid, function(cb) {
                var steps = cb.objects.steps;
                var unitsList = [];
                var list = [];

                var map = {};
                for (var i = 0; i < steps.length; i++) {
                    var tList = steps[i].unitids.split(',');
                    unitsList = unitsList.concat(tList);
                    for (var j = 0; j < tList.length; j++) {
                        if (!map[tList[j]]) {
                            map[tList[j]] = {};
                        }

                        if (steps[i].controltype == "00") {
                            map[tList[j]][1] = true;
                        } else {
                            map[tList[j]][-1] = true;
                        }
                    }
                }

                for (var i = 0; i < obj.length; i++) {
                    if (~unitsList.indexOf(obj[i].id.toString())) {
                        if (map[obj[i].id][1]) {
                            var dd = $.extend(true, {}, obj[i]);
                            dd.runType = 1;
                            dd.unitname = dd.unitname + "(上行)";
                            list.push(dd);
                        }
                        if (map[obj[i].id][-1]) {
                            var dd = $.extend(true, {}, obj[i]);
                            dd.runType = -1;
                            dd.unitname = dd.unitname + "(下行)";
                            list.push(dd);
                        }
                    }
                }
                unitbox(list, function() {
                    arithmeticOpt();
                });
                that.showUnit();
                that.createSpeedUnit();
                that.unitList = list;
            });

        });
    }
};

page.init();
