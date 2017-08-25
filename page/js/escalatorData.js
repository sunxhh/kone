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

Highcharts.setOptions({
    // 所有语言文字相关配置都设置在 lang 里
    lang: {
        resetZoom: '重置缩放比例',
        resetZoomTitle: '重置缩放比例'
    }
});

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



var yAxisLabel = {
    "2": {
        type: "1",
        labels: {
            format: '{value}m/s',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: '速度',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        opposite: true
    },
    "1": {
        type: "2",
        labels: {
            format: '{value}g',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: '振动',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
    },
    "3": {
        type: "3",
        labels: {
            format: '{value}dB(A)',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: '噪音',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
    },
    "4": {
        type: "4",
        labels: {
            format: '{value}A',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: '电流',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
    },
    "5": {
        type: "5",
        labels: {
            format: '{value}KW',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: '功率',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        }
        // ,
        // opposite: true
    },
    "6": {
        type: "6",
        labels: {
            format: '{value}V',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        title: {
            text: '电压',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        }
    },
    "7": {
        type: "7",
        labels: {
            format: '{value}g'
        },
        title: {
            text: 'x轴振动'
        },
    },
    "8": {
        type: "8",
        labels: {
            format: '{value}g'
        },
        title: {
            text: 'y轴振动'
        },
    },
    "9": {
        type: "9",
        labels: {
            format: '{value}g'
        },
        title: {
            text: 'z轴振动'
        },
    },
};

// 格式化图表数据
var formatChartData = function(obj) {
    // 格式化
    var format = function(list, chartData, type) {
        var map = this.map;
        var ylist = chartData.yAxis;
        var oldList = this.yAxis;

        for (var i = 0; i < oldList.length; i++) {
            if (!~chartData.yAxis.indexOf(oldList[i])) {
                chartData.yAxis.push(oldList[i]);
            }
        }

        for (var i = 0; i < list.length; i++) {
            var dataList = list[i].out;
            if (type == "1") {
                dataList = list[i].vibData;
            }
            var startTime = new Date(list[i].time);
            for (var j = 0; j < dataList.length; j++) {
                var cData = dataList[j];
                var cTime = startTime.format("YYYY-M-D hh:mm:ss.ll");
                for (var id in map) {
                    var val = cData;
                    if (typeof dataList[j] == 'object') {
                        val = cData[id];
                    }
                    val = parseFloat(val);
                    if (isNaN(val)) {
                        val = 0;
                    }

                    switch (map[id].yType) {
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
                    if (type != '1') {
                        map[id].data.push(val);
                        map[id].xg.push(cTime);
                    } else {
                        val = cData;
                        if (val.substring(0, 1) == id) {
                            val = val.split('|')[1];
                            val = parseFloat(val);
                            map[id].data.push([cTime, val]);
                        }
                    }
                }

                startTime = getTheDate('l', 5, startTime);
            }
        }



        for (var id in map) {
            for (var i = 0; i < ylist.length; i++) {
                if (ylist[i].type == map[id].yType) {
                    // map[id].yAxis = i;
                    break;
                }
            }
            chartData.series.push(map[id]);
        }

        return chartData;
    }

    // 格式化
    var formatVibData = function(list, chartData) {
        var map = this.map;
        var ylist = chartData.yAxis;
        var oldList = this.yAxis;

        if (getVibrationType()) {
            yAxisLabel[7].labels.format = '{value}mg';
            yAxisLabel[8].labels.format = '{value}mg';
            yAxisLabel[9].labels.format = '{value}mg';
        } else {
            yAxisLabel[7].labels.format = '{value}g';
            yAxisLabel[8].labels.format = '{value}g';
            yAxisLabel[9].labels.format = '{value}g';
        }

        for (var i = 0; i < oldList.length; i++) {
            if (!~chartData.yAxis.indexOf(oldList[i])) {
                chartData.yAxis.push(oldList[i]);
            }
        }


        for (var id in map) {
            var dataList = list[id];
            if (!dataList) {
                continue;
            }
            var startTime = new Date(list['Data_time']);
            for (var i = 0; i < dataList.length; i++) {
                var val = dataList[i];
                var cTime = startTime.format("YYYY-M-D hh:mm:ss.ll");
                val = parseFloat(val);
                if (isNaN(val)) {
                    val = 0;
                }
                map[id].data.push( val);
                map[id].xg.push(cTime);
                startTime = getTheDate('l', 5, startTime);
            }
        }





        for (var id in map) {
            for (var i = 0; i < ylist.length; i++) {
                if (ylist[i].type == map[id].yType) {
                    // map[id].yAxis = i;
                    break;
                }
            }
            chartData.series.push(map[id]);
        }

        return chartData;
    }

    // 格式化方法
    var formatTypeMap = {
        4: {
            map: {
                "ACurrent": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "4",
                    marker: {
                        enabled: false
                    },
                    name: "A相电流",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                },
                "BCurrent": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "4",
                    marker: {
                        enabled: false
                    },
                    name: "B相电流",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                },
                "CCurrent": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "4",
                    marker: {
                        enabled: false
                    },
                    name: "C相电流",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                },
                "AVoltage": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "6",
                    marker: {
                        enabled: false
                    },
                    name: "A相电压",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                },
                "BVoltage": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "6",
                    marker: {
                        enabled: false
                    },
                    name: "B相电压",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                },
                "CVoltage": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "6",
                    marker: {
                        enabled: false
                    },
                    name: "C相电压",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                },
                "totalActivePower": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "5",
                    marker: {
                        enabled: false
                    },
                    name: "总有功功率",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                }
            },
            yAxis: [yAxisLabel["5"], yAxisLabel["4"], yAxisLabel["6"]]
        },
        2: {
            map: {
                "Value": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "1",
                    marker: {
                        enabled: false
                    },
                    name: "速度",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                }
            },
            yAxis: [yAxisLabel["2"]]
        },
        3: {
            map: {
                "Value": {
                    type: 'area',
                    lineWidth: 1,
                    yType: "3",
                    marker: {
                        enabled: false
                    },
                    name: "噪音",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                }
            },
            yAxis: [yAxisLabel["3"]]
        },
        1: {
            map: {
                "Data_x": {
                    type: 'area',
                    lineWidth: 1,
                    yType: "7",
                    marker: {
                        enabled: false
                    },
                    name: "x轴振动",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                },
                "Data_y": {
                    type: 'area',
                    lineWidth: 1,
                    yType: "8",
                    marker: {
                        enabled: false
                    },
                    name: "y轴振动",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                },
                "Data_z": {
                    type: 'area',
                    lineWidth: 1,
                    yType: "9",
                    marker: {
                        enabled: false
                    },
                    name: "z轴振动",
                    lineWidth: 1,
                    yAxis: 0,
                    animation: false, // 关闭生成动画
                    data: [],
                    xg: []
                }
            },
            yAxis: [yAxisLabel["7"], yAxisLabel["8"], yAxisLabel["9"]]
        }
    };

    var arg = [].slice.call(arguments);

    var chartData = {
        yAxis: [],
        series: []
    };

    for (var key in obj) {
        var lifttype = key.split("-")[1];
        var type = lifttype.substring(0, 1);
        if (!obj[key]) {
            continue;
        }
        // if (!~chartData.yAxis.indexOf(yAxisLabel[type])) {
        //     chartData.yAxis.push(yAxisLabel[type]);
        // }
        if (type != 1) {
            format.apply(formatTypeMap[type], [obj[key], chartData, type]);
        } else {
            formatVibData.apply(formatTypeMap[type], [obj[key], chartData]);
        }

    }

    function setyAxis(list) {
        for (var id in map) {
            for (var i = 0; i < ylist.length; i++) {
                if (ylist[i].type == map[id].yType) {
                    map[id].yAxis = i;
                    break;
                }
            }
            chartData.series.push(map[id]);
        }
    }

    let lasData = {};
    let speedType = '1';
    let hasnoSpeed = false;
    let speed = {};
    for (let i = 0; i < chartData.yAxis.length; i++) {
        let obj = chartData.yAxis[i];
        if (!lasData.hasOwnProperty(obj.type) && obj.type != speedType) {
            lasData[obj.type] = {};
            lasData[obj.type].yAxis = [obj];
            lasData[obj.type].series = [];
            hasnoSpeed = true;
        }
        if (obj.type == speedType) {
            speed.yAxis = [obj];
        }
    }

    for (let i = 0; i < chartData.series.length; i++) {
        let obj = chartData.series[i];

        if (obj.yType == speedType) {
            speed.series = [obj];
        } else {
            lasData[obj.yType].series.push(obj);
        }
    }

    if (!hasnoSpeed) {
        return {
            [speedType]: speed
        };
    } else {
        if (speed.yAxis) {
            speed.yAxis[0].opposite = true;
            speed.series[0].yAxis = 1;
            for (let id in lasData) {
                lasData[id].yAxis.push(speed.yAxis[0]);
                lasData[id].series.push(speed.series[0]);
            }
        }
    }

    return lasData;

};

// 生成图标
var createChart = function(data, wrap) {
    wrap = wrap || "#chartWrap";
    console.log(data)
    if (!data || !data.series[0]) {
        return;
    }

    $(wrap).highcharts({
        chart: {
            zoomType: 'x',
            animation: false
        },
        scrollbar: {
            enabled: true
        },
        title: {
            text: ''
        },
        lang: {
            resetZoom: "重置缩放比"
        },
        credits: {
            enabled: false
        },
        xAxis: {
            min: 0,
            categories: data.series[0].xg
            //type: 'datetime',
            // dateTimeLabelFormats: {
            //     millisecond: "%Y-%m-%e, %H:%M:%S.%L"
            // },
            // max: data.series[0].data.length > 200 ? 200 : data.series[0].data.length
        },
        subtitle: {
            text: ''
        },
        yAxis: data.yAxis,
        tooltip: {
            //shared: true
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            x: 80,
            verticalAlign: 'top',
            y: 0,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: data.series
    });
};



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
        var formatedData = formatChartData(data);
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
                let text = data[id].yAxis[0].title.text;
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
//});
