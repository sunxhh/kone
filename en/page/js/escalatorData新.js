'use strict'
//pageStart(function(ajax) {
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
            var sendData = {
                liftno: liftData.liftno,
                queryname: querynameMap[data.lifttype.substring(0, 1)],
                lifttype: data.lifttype,
                runType: data.runType,
                testrecordid: urlData.id
            };

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
                        if (obj.data.id != curId) {
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
        var formatedData = getChartType(data);
        this.emptyChartWrap();
        this.createChartWrap(formatedData);
        console.log(formatedData);
        this.createCharts(formatedData);
    },
    createCharts: function(data) {
        for (var id in data) {
            createChart(data[id], ('#chartWrap_' + id));
        }
    },
    createChartWrap: function(data) {
        let showList = ['4', '5', '6', '7', '8', '9'];
        for (let id in data) {
            var html = tpl.getDataTpl("chart_wrap_popu", {
                type: id
            });
            $("#chart_list_wrap").append(html);

            if (~showList.indexOf(id)) {
                let text = data[id].yAxis[0].name;
                let btnHtml = `<a class="com-btn2 submit-btn chart-btn" cid="chartWrap_${id}">${text}</a>`;
                $("#chart_btn_wrap").append(btnHtml);
            }
        }
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
                            dd.unitname = dd.unitname + "(上行)";
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



function getChartType(objs) {
    var data = {};

    for (var key in objs) {
        var type = key.split("-")[1].substring(0, 1);
        data = formatChartData(objs[key], type);
    }
    return data;
}

// 获取y轴的信息
function getYAxis(data) {
    var list = [];
    for (var key in data) {
        yAxisLabel[key];
    }
}

// 格式化一个类型的图表数据
var formatChartData = function(testData, type) {
    // 基础的图表Server配置
    var baseChartOption = {
        type: 'line',
        symbol: 'none',
        lineWidth: 1,
        sampling: 'average',
        animation: false,
        xAxisList: [],
        data: [],
    }

    // 图表配置参数
    var chartMap = {
        1: {
            "Data_x": {
                yType: "7",
                name: "x轴振动"
            },
            "Data_y": {
                yType: "8",
                name: "y轴振动"
            },
            "Data_z": {
                yType: "9",
                name: "z轴振动"
            }
        },
        2: {
            "Value": {
                yType: "2",
                name: "速度"
            }
        },
        3: {
            "Value": {
                yType: "3",
                name: "噪音"
            }
        },
        4: {
            "ACurrent": {
                yType: "4",
                name: "A相电流"
            },
            "BCurrent": {
                yType: "4",
                name: "B相电流"
            },
            "CCurrent": {
                yType: "4",
                name: "C相电流"
            },
            "AVoltage": {
                yType: "6",
                name: "A相电压"
            },
            "BVoltage": {
                yType: "6",
                name: "B相电压"
            },
            "CVoltage": {
                yType: "6",
                name: "C相电压"
            },
            "totalActivePower": {
                yType: "5",
                name: "总有功功率"
            }
        }
    };

    // 单个图表值
    var chartData = [];

    // 当前类型的chart的series配置
    var seriesMap = chartMap[type];

    console.log(seriesMap)

    // 处理单笔数据
    var dealData = function(val, series) {
        val = parseFloat(val);
        if (isNaN(val)) {
            val = 0;
        }
        switch (series.yType) {
            case '5':
                //val = dealChartData.totalPower(val);
                break;
            case '3':
                //val = dealChartData.noise(val);
                break;
            case '4':
                //val = dealChartData.current(val);
                break;
        }
        return val;
    }

    // 格式化
    var format = function(data) {
        for (var key in seriesMap) {
            var cOpt = seriesMap[key];
            var startTime = new Date(data.time);
            var list = data.out;
            for (var i = 0; i < list.length; i++) {
                var cObj = list[i];
                var val = cObj[key];
                val = dealData(val, cOpt);
                cOpt.data.push(val);
                cOpt.xAxisList.push(startTime.format("YYYY-M-D hh:mm:ss.ll"));
                console.log(startTime.getMilliseconds())
                startTime = getTheDate('l', 5, startTime);
            }
        }
    };

    for (var key in seriesMap) {
        var option = seriesMap[key];
        $.extend(true, option, baseChartOption);
    }

    if (type == "1") {
        for (var key in seriesMap) {
            var curVibList = testData
        }
    } else {
        for (let data of testData) {
            format(data, type);
        }
    }


    for (var key in seriesMap) {
        var option = seriesMap[key];
        var yType = option.yType;
        if (!chartData[yType]) {
            chartData[yType] = {};
            chartData[yType].series = [];
            chartData[yType].yAxis = [];
            chartData[yType].xAxis = [];
            chartData[yType].yAxis.push(yAxisLabel[yType]);
            chartData[yType].xAxis.push({
                boundaryGap: false,
                axisLine: {
                    onZero: false
                },
                data: option.xAxisList
            });
        }
        chartData[yType].series.push(option);
    }

    return chartData;
};



var yAxisLabel = {
    "1": {
        ytype: "1",
        labels: {
            format: '{value}g'
        },
        axisPointer:{snap:true},
        name: '振动'
    },
    "2": {
        ytype: "2",
        labels: {
            format: '{value}m/s'
        },
        axisPointer:{snap:true},
        name: '速度'
    },
    "3": {
        ytype: "3",
        labels: {
            format: '{value}dB(A)'
        },
        axisPointer:{snap:true},
        name: '噪音'
    },
    "4": {
        ytype: "4",
        labels: {
            format: '{value}A'
        },
        axisPointer:{snap:true},
        name: '电流'
    },
    "5": {
        ytype: "5",
        labels: {
            format: '{value}KW'
        },
        axisPointer:{snap:true},
        name: '功率'
    },
    "6": {
        ytype: "6",
        labels: {
            format: '{value}V'
        },
        axisPointer:{snap:true},
        name: '电压'
    },
    "7": {
        ytype: "7",
        labels: {
            format: '{value}g'
        },
        axisPointer:{snap:true},
        name: 'x轴振动'
    },
    "8": {
        ytype: "8",
        labels: {
            format: '{value}g'
        },
        axisPointer:{snap:true},
        name: 'y轴振动'
    },
    "9": {
        ytype: "9",
        labels: {
            format: '{value}g'
        },
        axisPointer:{snap:true},
        name: 'z轴振动'
    },
};


// 生成图表
var createChart = function(data, wrap) {
    wrap = wrap || "#chartWrap";
    wrap = $(wrap)[0];
    if (!data.series[0]) {
        return;
    }
    var myChart = echarts.init(wrap);

    var option = {
        title: {
            text: ''
        },
        animation: false,
        xAxis: data.xAxis,
        yAxis: data.yAxis,
        series: data.series
    };

    myChart.setOption(option);
};
