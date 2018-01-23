// pageStart(function(ajax) {
// 显示错误
function showError1(text, wrap) {
    var errorDiv = wrap ? $(wrap) : $(".red-error-1");
    errorDiv.text(text);
    errorDiv.css({
        "visibility": "visible"
    });
};

var allUserTime = 0;

// 弹出层
function buildFloatLayer1(data) {
    floatLayer({
        width: data.width || "500px",
        title: data.title,
        content: data.content
    }, function (p) {
        var jQcloseBtn = $(p.wrap).find(".popu-title .close-popu");
        jQcloseBtn.click(function () {
            p.close();
        });
        data.initFn && data.initFn(p);
    });
};

// 弹出
function showAlert(text, fn) {
    showAlert.isShow = true;
    var isVisible = text.indexOf("振动") !== -1 ? true : false;
    var smallText = "";
    if (isVisible) {
        smallText = "请重新启动振动传感器，如果重启后仍然无法连接，请打开BeeData软件，重新配对网关和传感器。";
    }
    var data = {
        title: "检测出错",
        width: "800px",
        content: tpl.getDataTpl("test_error", {
            text: text,
            smallText: smallText
        }),
        initFn: function (p) {
            var wrap = p.wrap;
            $(wrap).find(".submit-btn").click(function () {
                showAlert.isShow = false;
                testStep.offledwarn();
                p.close();
                fn && fn();
            });
        }
    };
    buildFloatLayer(data);
}


var liftData = getUrlRequest();
var chart;
var ws;
var CHECKING_STATUS = true;

$.extend(tpl.format, {
    isHide: function (v) {
        if (v) {
            return "display:none";
        }
        return "";
    }
});

function createChecking(obj) {
    var html = tpl.getDataTpl("checking_item", obj);
    return html;
}

// 需要检测的
var needCheck = {
    check: {
        name: "到位信号压线检测",
        id: "check_singal",
        create: function () {
            return createChecking(this);
        }
    },
    device: {
        name: "中控板通讯检测",
        id: "check_device",
        create: function () {
            return createChecking(this);
        }
    },
    isVibReady: {
        name: "振动信号检测",
        id: "check_visible",
        create: function () {
            return createChecking(this);
        }
    },
    direction: {
        name: "电梯运行方向检测",
        id: "check_direction",
        create: function () {
            return createChecking(this);
        }
    },
    speed: {
        name: "电梯速度检测",
        id: "check_speed",
        isHide: true,
        create: function () {
            return createChecking(this);
        }
    }
};

var ignoreErrorCodeList = ['06'];

// 处理返回的图表数据
var handSocketMsg = function (e) {
    var data = e.data ? e.data : e;
    data = JSON.parse(data);

    var typeMap = {
        // pos: function(data) {
        //     var directionData = $.extend({}, data);
        //     directionData.type = "direction";

        //     if (data.code == 0) {
        //         checking.checkResult(data);
        //         checking.checkResult(directionData);
        //     } else if (data.code == -1002) {
        //         checking.checkResult(directionData);
        //     } else if (data.code == -1001) {
        //         checking.checkResult(data);
        //     }
        // },
        // WebSocket通信类-type(websocket)
        websocket: function (data) {
            if (~data.codeInfo.indexOf("成功")) {

            }
        },
        // 后台与硬件通许类-type(device)
        device: function (data) {
            if (data.code == 0) {
                // 与硬件连接正常
                checking.checkResult(data);

            } else {
                checking.checkResult(data);
            }
        },
        isVibReady: function () {
            if (data.code == 1) {
                return;
            }
            if (data.code != 0) {
                // 与硬件连接正常
                showError1(data.codeInfo);
            }
            setTimeout(function () {
                checking.checkResult(data);
            }, 5000);
        },
        // 测试状态类-type(test)
        test: function (data) {
            if (data.codeInfo == "next") {
                if (!showAlert.isShow && !checking.p) {
                    allUserTime += showChart.nowTime;
                    testStep.stopStepInit();
                    testStep.nextStep();
                }

            } else if (~data.codeInfo.indexOf("开始")) {

            } else if (~data.codeInfo.indexOf("停止")) {
                testStep.stopStepInit();
            } else if (~data.codeInfo.indexOf("扶梯")) {
                $("#open_lift").text(data.codeInfo);
            } else {
                showError1(data.codeInfo);
            }
        },
        // 后台指令类-type(command)
        command: function (data) {

        },
        // 测试单元类-type(testunit)
        testunit: function (data) {
            if (data.code == 0) {

            } else {
                alert(data.codeInfo);
                checking.file(data.codeInfo);
                showError1(data.codeInfo);
            }

        },
        // 测试步骤类-type(teststep)
        teststep: function (data) {
            if (data.code == 0) {

            } else {
                alert(data.codeInfo);
                checking.file(data.codeInfo);
                showError1(data.codeInfo);
            }
        },
        // 扶梯信息类-type(lift)
        lift: function (data) {

        },
        // 检测到位信号
        check: function (data) {
            checking.checkResult(data);
            if (data.code != 0) {
                alert(data.codeInfo);
                showError1(data.codeInfo);
            }
        },
        // 检测速度
        speed: function (data) {
            checking.checkResult(data);
            if (data.code != 0) {
                alert(data.codeInfo);
                showError1(data.codeInfo);
            }
        },
        // 电梯运行方向
        direction: function (data) {
            checking.checkResult(data);
            if (data.code != 0) {
                alert(data.codeInfo);
                showError1(data.codeInfo);
            }
        },
        deviceError: function (data) {
            //alert(data.codeInfo);
            if (~ignoreErrorCodeList.indexOf(data.errorCode)) {
                return;
            }
            showError1(data.errorInfo + "错误编码:" + data.errorCode);
            if (showChart.recordTime) {
                clearInterval(showChart.recordTime);
                showChart.recordTime = null;
            }
            if (isTesting) {
                testStep.stopStepInit();
            } else {
                if (checking.p) {
                    checking.p.close();
                }
            }
            if (!showAlert.isShow) {
                showAlert(data.errorInfo, function () {
                    checking();
                });
            }

        },
        alertType: function (data) {
            //alert(data.codeInfo);
            showError1(data.codeInfo);
            if (showChart.recordTime) {
                clearInterval(showChart.recordTime);
                showChart.recordTime = null;
                alert(data.codeInfo);
            }
        },
        alarm: function (data) {
            if (data.code == '-54' && ~data.codeInfo.indexOf("检测开梯中")) {
                return;
            }
            if ((~data.codeInfo.indexOf("方向") && ~data.codeInfo.indexOf("错误")) || (~data.codeInfo.indexOf("速度异常"))) {
                if (isTesting) {
                    testStep.stopStepInit();
                } else {
                    if (checking.p) {
                        checking.p.close();
                    }
                }
                if (!showAlert.isShow) {
                    showAlert(data.codeInfo, function () {
                        checking();
                    });
                }
            }

        }
    };
    if (data.Data && data.Data.length) {
        showChart(data);
    } else if (data.value && data.value.length) {
        showChart(data);
    } else if (data.Data_x && data.Data_x.length) {
        showChart(data);
    } else {
        if (typeMap[data.type]) {
            typeMap[data.type](data);
        } else {
            showError1(data.codeInfo);
        }
        if (data.code == 0) {
            showError1("");
        }
    }
};


// 生成图表
var showChart = (function () {
    // 图表总共显示的点数
    var CHART_COUNT = 600;

    // 生成图表
    var createChart = function (wrap, data) {
        var list = data;
        $(wrap).empty();
        var wrap = $(wrap)[0];
        var type = $(wrap).attr("lifttype");
        var liftType = liftTypeMap[type.substring(0, 1)];

        var seriesData = formatChartData(list, liftType);

        var yAxisList = seriesData.series;


        // 初始化需要显示的点数
        for (var k = 0; k < yAxisList.length; k++) {
            var y = yAxisList[k];
            for (var i = 0; i < (CHART_COUNT - y.data.length); i++) {
                y.data.unshift(0);
            }
        }



        var unitText = yAxisUnit[type.substring(0, 1)].unit;

        var chartObj = Highcharts.chart(wrap, {
            chart: {
                animation: false,
                panning: false, //禁用放大
                pinchType: '', //禁用手势操作
                zoomType: "",
            },
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            xAxis: {
                labels: {
                    enabled: false // 隐藏轴
                },
                tickLength: 0
            },
            tooltip: {
                enabled: false
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false // 隐藏原点
                    }
                }
            },
            yAxis: seriesData.yAxis,
            series: yAxisList
        });
        chartObj.liftType = liftType;
        return chartObj;
    };


    // 生成图表
    var __showChart = function (data) {
        var list = data.Data;
        var time = data.Time;
        if (!list) {
            list = data.value;
        }
        if (!list) {
            list = data.Data_x;
        }
        var chart = showChart.chart;
        var deviceno = data.DeviceID;
        var deviceport = data.PortID;
        var thisChart = chart[deviceno + "-" + deviceport];

        time = formatSQLDate(time);

        if (thisChart) {
            var formatData = formatChartData(list, thisChart.chart.liftType);

            var yAxisList = formatData.series;

            for (var k = 0; k < yAxisList.length; k++) {
                var y = yAxisList[k];
                for (var i = 0; i < y.data.length; i++) {
                    thisChart.chart.series[k].addPoint(y.data[i], false, true, false);
                }
            }

            // 重新绘制图表
            thisChart.chart.redraw();
        } else {
            thisChart = chart[deviceno + "-" + deviceport] = {};
            thisChart.el = $((".chart-div-unitid" + deviceno + "-" + deviceport));
            thisChart.chart = createChart(thisChart.el, list);
        }

        if (list[0]) {
            var lwrap = $((".chart-div-unitid" + deviceno + "-" + deviceport));
            var ltype = $(lwrap).attr("lifttype");
            if (!ltype) {
                return;
            }
            var lliftType = liftTypeMap[ltype.substring(0, 1)];
            var dd = formatChartData(list, lliftType);
            var se = dd.series;

            for (var k = 0; k < se.length; k++) {
                var y = se[k];
                for (var i = 0; i < y.data.length; i++) {
                    $(".current_param_span" + deviceno + "-" + deviceport).text(y.data[i]);
                    break;
                }
                break;
            }
        }
    };

    __showChart.chart = {};

    return __showChart;
})();

// 连接socket
var connect = (function () {
    var TRY_RECONNECT = 0;
    var TRY_RECONNECT_MAX = 3;
    // 正在连接socket的动画显示
    var connecting = function (fn) {
        var data = {
            title: "",
            width: "300px",
            content: tpl.getDataTpl("connecting", {}),
            initFn: function (p) {
                var wrap = p.wrap;
                var connectInfo = $(wrap).find("#connect_info");

                fn && fn(p);
            }
        };
        buildFloatLayer(data);
    };
    window.connecting = connecting;


    function __connect() {
        if ('WebSocket' in window) {
            var href = "ws://" + location.host + "/websck.2x";
            ws = new WebSocket(href);
        } else {
            ws = new SockJS(location.origin + "/sockjs/websck/info.2x");
        }

        connecting(function (p) {
            ws.onopen = function (e) {
                if (e.type == "open") {
                    p.close();
                    TRY_RECONNECT = 0;
                    page.init();
                }
            };

            ws.onerror = function () {
                alert("socket连接失败,正在尝试重连");
                p.close();
                TRY_RECONNECT++;
                if (TRY_RECONNECT >= TRY_RECONNECT_MAX) {
                    return;
                }
                __connect();
            }

        });

        ws.onmessage = function (e) {
            handSocketMsg(e);
        };



        ws.onclose = function (e) {
            var data = e.data;
            ws = null;
            //showError1("与服务器断开连接");
            //alert("与服务器断开连接");
            if (isTesting) {
                testStep.stopStepInit();
            } else {
                if (checking.p) {
                    checking.p.close();
                }
            }
            __connect();
        };
    }

    return __connect;
})();

var timer = null;
var isTesting = false;

// 正在硬件检测
var checking = (function () {
    var checkedCount = 0;
    var count = 0;
    var typeList = [];
    var hasFile = false;
    var failList = [];
    var checkList = [];

    // 添加需要检测的单元
    function createCheckUnit(wrap) {
        var list = ["device"];
        if (testStep.checkNeedSign()) {
            //list = list.concat(["check", "direction"]);
        }
        if (testStep.hasVisible()) {
            list = list.concat(["isVibReady"]);
        }
        list.push("speed");
        for (var i = 0; i < list.length; i++) {

            var html = needCheck[list[i]].create();
            $(wrap).append(html);
        }
        checkList = list;
        count = list.length;
    }

    var createCountdown = function () {

    }
    var isStartCheck = true;
    var __checking = function () {
        var t;
        isStartCheck = false;
        checkedCount = 0;
        typeList = [];
        hasFile = false;
        failList = [];
        checkList = [];

        var data = {
            title: "硬件检测",
            width: "800px",
            content: tpl.getDataTpl("check_popu", {}),
            initFn: function (p) {
                __checking.p = p;
                var wrap = p.wrap;
                $(wrap).addClass('check-notice')
                createCheckUnit($(wrap).find(".check-wrapper"));

                // 开始检测
                $(wrap).find("#start_test").click(function () {
                    __checking.close();
                    testStep.startTest();
                    isStartCheck = true;
                });

                // 重新检测
                $(wrap).find("#recheck_test").click(function () {
                    __checking.close();
                    checking();
                });

                // 取消倒计时
                $(wrap).find("#cancel_test").click(function () {
                    if (timer) {
                        __checking.endCountdown();
                        $("#start_test").show();
                        $(this).hide();
                    }
                });
            }
        };

        buildFloatLayer(data);
        setTimeout(function () {
            testStep.checkTest();
        }, 3000);
    }


    var defaultTime = 20;
    __checking.close = function () {
        __checking.p.close();
        __checking.p = null;
    }
    __checking.startCountdown = function () {
        var countdown = $("#countdown_wrap");
        defaultTime = 20;
        $("#cancel_test").show();
        $("#countdown_wrap").show();
        if (timer) {
            return false;
        }
        timer = setInterval(function () {
            defaultTime = defaultTime - 1;

            $("#countdown_span").text(defaultTime);
            if (defaultTime < 0) {
                __checking.endCountdown();
                $("#start_test").click();
                return;
            }
        }, 1000);
    }
    __checking.endCountdown = function () {
        $("#countdown_wrap").hide();
        $("#cancel_test").hide();
        if (!timer) {
            return;
        }
        clearInterval(timer);
        timer = null;
    }
    __checking.hasNoise = function (list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].lifttype[0] == "3") {
                return true;
            }
        }
        return false;
    }
    __checking.checkResult = function (data) {
        if (!~checkList.indexOf(data.type)) {
            return;
        }
        var checkObj = needCheck[data.type];
        var icon = $("#checking_item_" + checkObj.id).find(".check-status");
        if (data.code == 0) {
            icon.addClass("success").removeClass("checking").removeClass("fail");
            if (~failList.indexOf(data.type)) {
                failList.splice(failList.indexOf(data.type), 1);
                if (failList.length == 0) {
                    hasFile = false;
                }
            }
        } else {
            icon.addClass("fail").removeClass("checking").removeClass("success");
            showError1(data.codeInfo, $(".check-popu-wrapper").find(".check-error"));
            hasFile = true;
            $("#recheck_test").show();
            if (!~failList.indexOf(data.type)) {
                failList.push(data.type);
            }

        }
        if (!~typeList.indexOf(data.type)) {
            typeList.push(data.type);
            checkedCount++;
        }

        if (typeList.length == (count - 1)) {
            $("#checking_item_check_speed").show();
        }
        if (typeList.length >= count) {
            if (isStartCheck) {
                return;
            }
            if (hasFile) {
                $("#start_test").hide();
                $("#recheck_test").show();
                __checking.endCountdown();
            } else {
                var JQwrap = $(".test-step-tab-wrap");
                var curStep = JQwrap.find(".current-step");
                var obj = curStep[0].data;

                if (__checking.hasNoise(obj.units)) {
                    __checking.startCountdown();
                } else {
                    $("#start_test").show();
                    $("#start_test").click();
                }

                $("#open_lift").hide();
                $("#recheck_test").hide();
            }
        }
    };

    __checking.file = function (text) {
        checking.checkResult({
            type: "check",
            code: 1,
            codeInfo: text
        });

        checking.checkResult({
            type: "direction",
            code: 1,
            codeInfo: text
        });
        checking.checkResult({
            type: "speed",
            code: 1,
            codeInfo: text
        });
    }

    return __checking;
})();


// 测试步骤
var testStep = {
    init: function () {
        var JQwrap = $(".test-step-tab-wrap");
        var curStep = JQwrap.find(".current-step");
        if (curStep.length > 0) {
            checking();
            return;
        }
        this.closePage();
        this.getEnableSteps();
    },
    closePage: function () {
        window.onbeforeunload = function () {
            if (ws && !testStep.isEndTest) {
                var data = {
                    "optType": "abort_collect",
                    "liftno": liftData.liftno,
                    "enable": true
                };
                data = JSON.stringify(data);
                ws.send(data);
            } else if (ws) {

            }
        }
    },
    // 获取已启用步骤配置
    getEnableSteps: function () {
        var that = this;
        ajax.getEnableSteps(function (cd) {
            var data = cd.objects;
            that.create(data);
        });
    },
    // 生成步骤
    create: function (data) {
        var JQwrap = $(".test-step-tab-wrap");
        JQwrap.empty();

        var index = 1;
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            if (obj.isdelete) {
                continue;
            }
            obj.index = index;
            index++;
            var html = tpl.getDataTpl("test_step_popu", obj);
            var div = $($.parseHTML(html)).filter(".test-step-div")[0];
            div.data = obj;
            JQwrap.append(div);
        }
        this.nextStep();
    },
    // 开始下一步测试
    nextStep: function () {
        var JQwrap = $(".test-step-tab-wrap");
        var curStep = JQwrap.find(".current-step");
        if (curStep.length == 0) {
            curStep = JQwrap.find(".test-step-div").eq(0);
        } else {
            curStep.removeClass("current-step");
            curStep = curStep.next();
        }
        if (curStep.length == 0) {
            this.endStep();
        } else {
            document.getElementById("next_test").isSendNext = false;
            curStep.addClass("current-step");
            this.setComInfo();
            //testStep.startTest();
            checking();
        }

    },
    // 是否需要到位信号
    checkNeedSign: function () {
        var JQwrap = $(".test-step-tab-wrap");
        var curStep = JQwrap.find(".current-step");
        var obj = curStep[0].data;

        var units = obj.units;

        // if(obj.testtime == "auto"){
        //     return true;
        // }
        var needCheckList = ['101', '102', '103'];
        for (var i = 0; i < units.length; i++) {
            var data = units[i];
            var lifttype = data.lifttype;
            if (needCheckList.indexOf(lifttype) != -1) {
                return true;
            }
        }
        return false;
    },
    // 是否有振动
    hasVisible: function () {
        var JQwrap = $(".test-step-tab-wrap");
        var curStep = JQwrap.find(".current-step");
        var obj = curStep[0].data;

        var units = obj.units;

        var visibleKey = '1';
        for (var i = 0; i < units.length; i++) {
            var data = units[i];
            var lifttype = data.lifttype;
            if (lifttype.substring(0, 1) == "1") {
                return true;
            }
        }
        return false;
    },
    // 设置通用的数据
    setComInfo: function () {
        var JQwrap = $(".test-step-tab-wrap");
        var curStep = JQwrap.find(".current-step");
        var obj = curStep[0].data;
        var unitnames = obj.unitnames;
        var unitids = obj.unitids;
        var unitIdList = unitids.split(",");
        var unitnameList = unitnames.split(",");
        var chartsWrapper = $(".charts-wrap");
        var units = obj.units;
        chartsWrapper.empty();

        $("#stepOrder").text(("测试步骤" + obj.index));
        $("#unitnames").text(obj.unitnames);
        $("#controltype").text(deviceControlTypeMap[obj.controltype]);
        $("#testtime").text(0);

        var chartHtml = "";


        for (var i = 0; i < units.length; i++) {
            chartHtml += tpl.getDataTpl("chart_div_popu", units[i]);
        }

        chartsWrapper.append(chartHtml);
        this.createUnits(units);
    },
    // 生成测试单元
    createUnits: function (unitIdList) {
        var wrap = $(".unit-wrapper");
        var liWrap = $(".test-unit-li-wrapper");
        var html = "";
        var htmlLi = "";

        wrap.empty();
        liWrap.empty();

        for (var i = 0; i < unitIdList.length; i++) {
            html += tpl.getDataTpl("checkbox_div_popu", unitIdList[i]);
            htmlLi += tpl.getDataTpl("current_param_popu", unitIdList[i]);
        }
        wrap.append(html);
        liWrap.append(htmlLi);

        wrap.find(".unit-checkbox").click(function (e) {
            var deviceno = $(this).attr("deviceno");
            var deviceport = $(this).attr("deviceport");
            if (this.checked) {
                $(".chart-div-unitid" + deviceno + "-" + deviceport).show();
            } else {
                $(".chart-div-unitid" + deviceno + "-" + deviceport).hide();
            }
        });

    },
    // 开始检测
    checkTest: function () {
        var JQwrap = $(".test-step-tab-wrap");
        var curStep = JQwrap.find(".current-step");
        var obj = curStep[0].data;

        var data = {
            "optType": "set_check",
            "stepid": obj.id
        };
        data = JSON.stringify(data);
        ws.send(data);
        isTesting = false;
    },
    // 重新检测
    recheck: function () {
        var JQwrap = $(".test-step-tab-wrap");
        var curStep = JQwrap.find(".current-step");
        var obj = curStep[0].data;

        var data = {
            "optType": "recheck"
        };
        data = JSON.stringify(data);
        ws.send(data);
    },
    // 开始测试
    startTest: function () {
        var JQwrap = $(".test-step-tab-wrap");
        var curStep = JQwrap.find(".current-step");
        var obj = curStep[0].data;

        var data = {
            "optType": "start_collect",
            "liftno": liftData.liftno,
            "enable": true,
            "stepid": obj.id,
            "order": obj.index
        };
        data = JSON.stringify(data);
        ws.send(data);
        showChart.nowTime = 0;
        isTesting = true;
        this.startTestInit();
    },
    startTestInit: function () {
        showChart.chart = {};
        var time = showChart.nowTime;
        showChart.recordTime = setInterval(function () {
            time += 1;
            showChart.nowTime = time;
            $("#testtime").text(formatMsecond(time * 1000));
        }, 1000);
    },
    // 停止采集数据
    stopStep: function () {
        if (!ws) {
            alert("连接已断开");
            return false;
        }
        var JQwrap = $(".test-step-tab-wrap");
        var curStep = JQwrap.find(".current-step");
        var obj = curStep[0].data;

        var data = {
            "optType": "stop_collect",
            "liftno": liftData.liftno,
            "enable": true,
            "stepid": obj.id,
            "order": obj.index
        };
        data = JSON.stringify(data);
        ws.send(data);
    },
    stopStepInit: function () {
        if (showChart.recordTime) {
            clearInterval(showChart.recordTime);
            showChart.recordTime = null;
        }
    },
    isEndTest: false,
    // 采集结束 
    endStep: function () {
        var data = {
            "optType": "end_collect",
            "liftno": liftData.liftno,
            "enable": true
            // ,
            // "stepid": obj.id,
            // "order": obj.index
        };
        this.isEndTest = true;
        data = JSON.stringify(data);
        ws.send(data);
        showEndAlert("如果不需要继续测试，请把上中下三个支架升到原来位置，以防推入电梯时被撞到。", function () {
            endTest();
        });
    },
    virtualNextStep: function () {
        var JQwrap = $(".test-step-tab-wrap");
        var curStep = JQwrap.find(".current-step");
        var obj = curStep[0].data;

        var data = {
            "optType": "next"
        };

        data = JSON.stringify(data);
        ws.send(data);
    },
    offledwarn: function () {
        var data = {
            "optType": "offledwarn"
        };
        data = JSON.stringify(data);
        ws.send(data);
    }
};

window.testStep = testStep;


// 页面初始化
var page = {
    init: function () {
        // 连接socket
        this.bindle();
        testStep.init();
    },
    bindle: function () {
        $("#stop_test").click(function () {
            if (!ws) {
                return false;
            }
            testStep.stopStep();
        });

        $("#end_test").click(function () {
            if (!ws) {
                return false;
            }
            testStep.endStep();
        });

        $("#next_test").click(function () {
            if (!ws || this.isSendNext) {
                return false;
            }
            this.isSendNext = true;
            testStep.virtualNextStep();
        });
    }
};

connect();
// });


// 测试结束
function endTest() {
    var data = {
        title: "测试完成",
        width: "400px",
        content: tpl.getDataTpl("end_test_popu", {
            time: formatMsecond(parseInt(allUserTime) * 1000)
        }),
        initFn: function (p) {

        }
    };
    buildFloatLayer(data);
}

// 弹出
function showEndAlert(text, fn) {
    var data = {
        title: "注意",
        width: "500px",
        content: tpl.getDataTpl("test_end_alert", {
            text: text
        }),
        initFn: function (p) {
            var wrap = p.wrap;

            $(wrap).find(".submit-btn").click(function () {
                p.close();
                fn && fn();
            });
        }
    };
    buildFloatLayer(data);
}

setInterval(function () {
    if (ws) {
        ws.send('{"action":"heartbeat-web"}');
    }
}, 5000);