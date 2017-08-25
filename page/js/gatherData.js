'use strict'
// 显示错误
function showError1(text) {
    var errorDiv = $(".red-error-1");
    errorDiv.text(text);
    errorDiv.css({
        "visibility": "visible"
    });
};

var ws;
// 连接socket
function connect() {
    if ('WebSocket' in window) {
        var href = "ws://" + location.host + "/websck.2x";
        ws = new WebSocket(href);
    } else {
        ws = new SockJS(location.origin + "/sockjs/websck/info.2x");
    }

    ws.onopen = function(e) {
        if (e.type == "open") {
            //showError1("连接服务器成功");
        }
    };

    ws.onmessage = function(e) {
        handSocketMsg(e);
    };
    ws.onclose = function(e) {
        showError1("连接已经断开")
        alert("连接已经断开");
        ws = null;
        connect();
    };
};



// 处理返回的数据
var handSocketMsg = function(e) {
    var data = e.data;
    data = JSON.parse(data);

    if (data.action == "heartbeat-response") {
        return;
    }

    if (data.Data && data.Data.length) {
        showChart(data);
    } else if (data && data.value && data.value.length) {
        showChart(data);
    } else if (data && data.Data_x && data.Data_x.length) {
        showChart(data);
    } else {
        if (data.codeInfo != "websocket连接成功！") {
            showError1(data.codeInfo);
        }

        if (data.type == "test") {
            if (data.codeInfo == "测试停止！") {
                chart = null;
            }
        }
    }
};

var chart = null;
// 显示生成chart
var showChart = (function() {
    // 生成chart的div
    var createTable = function(data) {
        let showList = ['4', '5', '6', '7', '8', '9'];

        for (let id in data) {
            var html = tpl.getDataTpl("chart_wrap_popu", {
                type: id
            });
            $("#chart_list_wrap").append(html);

            if (~showList.indexOf(id)) {
                let text = data[id].yAxis[0].title.text;
                let btnHtml = `<a class="com-btn2 submit-btn chart-btn" cid="chartWrap_${id}">${text}</a>`;
                $("#chart_btn_wrap").append(btnHtml);
            }
        }
    };

    // 处理振动消息
    var dealVibData = function(data) {
        var list = [];
        var dataList = data.Data;
        var typeList = data.channels;
        var map = {
            1: {
                key: 'xValue',
                list: []
            },
            2: {
                key: 'yValue',
                list: []
            },
            3: {
                key: 'zValue',
                list: []
            }
        }

        for (var i = 0; i < dataList.length; i++) {
            map[typeList[i]].list.push(dataList[i]);
        }
        var max = 0;
        for (var key in map) {
            if (max < map[key].list.length) {
                max = map[key].list.length;
            }
        }

        for (var i = 0; i < max; i++) {
            var obj = {};
            for (var key in map) {
                obj[map[key].key] = map[key].list[i] || 0;
            }
            list.push(obj);
        }

        return list;
    }

    // 处理振动消息
    var dealVibDataNew = function(data) {
        var list = [];

        var map = {
            1: {
                key: 'Data_x',
                list: data.Data_x || []
            },
            2: {
                key: 'Data_y',
                list: data.Data_y || []
            },
            3: {
                key: 'Data_z',
                list: data.Data_z || []
            }
        }


        var max = 0;
        for (var key in map) {
            if (max < map[key].list.length) {
                max = map[key].list.length;
            }
        }

        for (var i = 0; i < max; i++) {
            var obj = {};
            for (var key in map) {
                obj[map[key].key] = map[key].list[i] || 0;
            }
            list.push(obj);
        }

        return list;
    }

    var _self = function(data) {
        var list = data.Data;
        if (!list) {
            list = data.value;
        }
        var type = page.getCheckedType();
        if (type == '1') {
            list = dealVibDataNew(data);

        }
        var chartData = formatChartData(list, type);

        if (chart) {
            for (var key in chartData) {
                var thisData = chartData[key];
                var thisChart = chart[key];
                var thisList = thisData.series;

                for (var i = 0; i < thisList.length; i++) {
                    var list = thisList[i].data;
                    for (var j = 0; j < list.length; j++) {
                        thisChart.series[i].addPoint(list[j], false, true, false);
                    }
                }
                thisChart.redraw();
            }
        } else {
            page.emptyChartWrap();
            chart = {};
            createTable(chartData);
            for (var id in chartData) {
                chart[id] = createChart(chartData[id], ('#chartWrap_' + id));
            }
        }
    };

    return _self;
})();




// 设置当前的测试的设备
var setCurTestDevice = function(obj) {
    var deviceId = obj.DeviceID;
    var port = obj.PortID;
    var unitList = page.unitList;
    if (!unitList) {
        return;
    }
    var boxList = unitbox.boxList;
    for (var id in boxList) {
        var list = boxList[id];
        for (var i = 0; i < list.length; i++) {
            var obj = list[i];

            if (obj.data.deviceno == deviceId && port == obj.data.deviceport) {
                if (!$(obj.label).find("input").prop("checked")) {
                    $(obj.input).prop("checked", true);
                }
                return true;
            }
        }
    }
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
        var data = this.data;
        var obj = {
            "dataType": data.id,
            "optType": "set_collect"
        };
        obj = JSON.stringify(obj);
        ws.send(obj);
    },
    stop: function() {
        var data = this.data;
        var obj = {
            "optType": "set_collect"
        };
        obj = JSON.stringify(obj);
        ws.send(obj);
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
            unitbox.boxList[type].push(ra);
        }
    }

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

            this.isTest = false;
            input.onclick = function() {
                self.sendCommand();
            };
        },
        // 停止获取数据
        stop: function() {
            var data = this.data;
            var obj = {
                "optType": "stop"
            };
            obj.id = data.id;
            obj = JSON.stringify(obj);
            ws.send(obj);
            this.isTest = false;
        },
        // 开始获取数据
        start: function() {
            var data = this.data;
            var obj = {
                "optType": data.deviceType
            };
            obj.id = data.id;
            obj = JSON.stringify(obj);
            ws.send(obj);
            this.isTest = true;
            page.resetChartWrap();
        },
        // 发送命令
        sendCommand: function() {
            var checkbox = $(this.label).find("input");
            var hasTesting = this.getIsTesting();
            if (checkbox.prop("checked")) {
                if (hasTesting) {
                    if (this.hasCheckedIsNoSelf()) {
                        alert("有任务正在执行，请等待或者强行中止本次测试步骤");
                        checkbox.prop("checked", false);
                        return;
                    }
                } else {
                    this.removeOtherChecked();
                }
                //this.start();
            } else {
                if (hasTesting) {
                    checkbox.prop("checked", true);
                    alert("请先停止当前步骤");
                }
                //this.stop();
            }
        },
        hasCheckedIsNoSelf: function() {
            var curId = this.data.id;
            for (var id in boxList) {
                var list = boxList[id];
                for (var i = 0; i < list.length; i++) {
                    var obj = list[i];
                    if ($(obj.label).find("input").prop("checked") && !obj.data.isArithmetic) {
                        if (obj.data.id != curId) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        removeOtherChecked: function() {
            var curId = this.data.id;
            for (var id in boxList) {
                var list = boxList[id];
                for (var i = 0; i < list.length; i++) {
                    var obj = list[i];
                    if ($(obj.label).find("input").prop("checked") && !obj.data.isArithmetic) {
                        if (obj.data.id != curId) {
                            $(obj.label).find("input").prop("checked", false);
                        }
                    }
                }
            }
        },
        getIsTesting: function() {
            var curId = this.data.id;
            for (var id in boxList) {
                var list = boxList[id];
                for (var i = 0; i < list.length; i++) {
                    var obj = list[i];
                    if (obj.isTest) {
                        return true;
                    }
                }
            }
            return false;
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
        this.createSpeedUnit();
        this.sendHeartbeat();
        this.resetChartWrap();
    },
    resetChartWrap: function() {
        chart = null;
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
    // 发送心跳
    sendHeartbeat: function() {
        setInterval(function() {
            if (ws) {
                ws.send('{"action":"heartbeat-web"}');
            }
        }, 30000);
    },
    bindle: function() {
        var self = this;
        $(".tab-div a").click(function() {
            $(".tab-div a").removeClass("selected");
            $(this).addClass("selected");
            self.showUnit();
        });

        $("#start").click(function() {
            if (!ws) {
                connect();
            }
        });

        $("#stop").click(function() {
            var boxList = unitbox.boxList;
            for (var id in boxList) {
                var list = boxList[id];
                for (var i = 0; i < list.length; i++) {
                    var obj = list[i];
                    if ($(obj.label).find("input").prop("checked")) {
                        obj.input.click();
                    }
                }
            }
        });
        $("#start_test").click(function() {
            self.startTest();
        });

        $("#stop_test").click(function() {
            self.stopTest();
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
    startTest: function() {
        var curSelect = this.getSelectedInput();
        if (!curSelect) {
            alert("请先选择需要开始测试的");
            return;
        }
        if(curSelect.isTest){
            alert("该单元正在测试中，请先停止");
            return;
        }
        curSelect.start();
    },
    stopTest: function() {
        var curSelect = this.getSelectedInput();
        if (!curSelect) {
            alert("请先选择需要停止测试的");
            return;
        }
        if(!curSelect.isTest){
            alert("该单元已经停止测试");
            return ;
        }
        curSelect.stop();
    },
    getSelectedInput: function() {
        var boxList = unitbox.boxList;
        for (var id in boxList) {
            var list = boxList[id];
            for (var i = 0; i < list.length; i++) {
                var obj = list[i];
                if ($(obj.label).find("input").prop("checked")) {
                    return obj;
                }
            }
        }
        return null;
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
    unitList: null,
    // 获取测试单元
    getList: function() {
        var that = this;
        ajax.queryUnits(function(callback) {
            var obj = callback.objects;
            unitbox(obj, function() {
                //arithmeticOpt();
            });
            that.showUnit();
            that.unitList = obj;
            connect();
        });
    },
    // 获取选中的类型
    getCheckedType: function() {
        var type;
        var boxList = unitbox.boxList;
        for (var id in boxList) {
            var devicelist = boxList[id];
            for (var i = 0; i < devicelist.length; i++) {
                var obj = devicelist[i];
                if ($(obj.label).find("input").prop("checked")) {
                    type = obj.data.lifttype.substring(0, 1);
                    break;
                }
            }
        }
        return type;
    }
};


page.init();


// 生成图表
var createChart = function(data, wrap) {
    var yAxisList = data.series;

    for (var j = 0; j < yAxisList.length; j++) {
        for (var i = 0; i < (600 - yAxisList[j].data.length); i++) {
            yAxisList[j].data.unshift(0);
        }
    }

    wrap = $(wrap);
    var tchart = Highcharts.chart(wrap[0], {
        chart: {
            zoomType: 'x',
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
        subtitle: {
            text: ''
        },
        yAxis: data.yAxis,
        tooltip: {
            shared: true
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            x: 100,
            verticalAlign: 'top',
            y: 0,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: yAxisList
    });
    return tchart;
};

// 格式化图表信息
var formatChartData = function(list, dataType) {
    // 默认的参数
    var chartSeries = {
        type: 'line',
        lineWidth: 1,
        marker: {
            enabled: false
        },
        lineWidth: 1,
        yAxis: 0,
        animation: false, // 关闭生成动画
        data: []
    };

    // 初始化map
    var chartMap = {
        "4": {
            "A_current": {
                yType: "4",
                name: "A相电流",
            },
            "B_current": {
                yType: "4",
                name: "B相电流"
            },
            "C_current": {
                yType: "4",
                name: "C相电流"
            },
            "A_voltage": {
                yType: "6",
                name: "A相电压"
            },
            "B_voltage": {
                yType: "6",
                name: "B相电压"
            },
            "C_voltage": {
                yType: "6",
                name: "C相电压"
            },
            "Total_active_power": {
                yType: "5",
                name: "总有功功率"
            }
        },
        "2": {
            "Value": {
                yType: "2",
                name: "速度"
            }
        },
        "3": {
            "Value": {
                yType: "3",
                name: "噪音"
            }
        },
        "1": {
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

        }
    };

    // 设置参数
    function setChartSeries() {
        for (let key in chartMap) {
            let data = chartMap[key];
            for (let id in data) {
                let entity = data[id];
                $.extend(true, entity, chartSeries);
            }
        }
    }

    setChartSeries();

    let chartData = chartMap[dataType];

    // 格式化并存放数据
    function format(data) {
        for (let key in chartData) {
            let map = chartData[key];
            let val = data;
            if (typeof data == 'object') {
                val = data[key];
            }
            val = parseFloat(val);

            if (isNaN(val)) {
                val = 0;
            }

            switch (map.yType) {
                case '5':
                    val = dealChartData.totalPower(val);
                    break;
                case '3':
                    val = dealChartData.noise(val);
                    break;
                case '4':
                    val = dealChartData.current(val);
                    break;
                case '6':
                    val = dealChartData.voltage(val);
                    break;
            }
            map.data.push(val);
        }
    }

    if (!list) {
        return {};
    }
    for (let i = 0; i < list.length; i++) {
        format(list[i]);
    }


    let resultData = {};

    for (let key in chartData) {
        let data = chartData[key];
        let yType = data.yType;
        if (!resultData.hasOwnProperty(yType)) {
            resultData[yType] = {};
            resultData[yType].yAxis = [yAxis[yType]];
            resultData[yType].series = [];
        }
        resultData[yType].series.push(data);
    }

    return resultData;
};

var yAxis = {
    "1": {
        type: "1",
        labels: {
            format: '{value}g'
        },
        title: {
            text: '振动'
        },
    },
    "2": {
        type: "2",
        labels: {
            format: '{value}m/s'
        },
        title: {
            text: '速度'
        },
    },
    "3": {
        type: "3",
        labels: {
            format: '{value}dB(A)'
        },
        title: {
            text: '噪音'
        },
    },
    "4": {
        type: "4",
        labels: {
            format: '{value}A'
        },
        title: {
            text: '电流'
        },
    },
    "5": {
        type: "5",
        labels: {
            format: '{value}KW'
        },
        title: {
            text: '功率'
        }
    },
    "6": {
        type: "6",
        labels: {
            format: '{value}V'
        },
        title: {
            text: '电压'
        }
    },
    "7": {
        type: "7",
        labels: {
            format: '{value}g'
        },
        title: {
            text: 'x轴振动'
        }
    },
    "8": {
        type: "8",
        labels: {
            format: '{value}g'
        },
        title: {
            text: 'y轴振动'
        }
    },
    "9": {
        type: "9",
        labels: {
            format: '{value}g'
        },
        title: {
            text: 'z轴振动'
        }
    }
};
