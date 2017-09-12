function getChartType(objs) {
    var list = [];
    var speed = [];
    for (var key in objs) {
        var type = key.split("-")[1].substring(0, 1);
        var data = formatChartData(objs[key], type);
        for (var key in data) {
            if (key != '2') {
                list.push([data[key]]);
            } else {
                speed.push(data[key]);
            }
        }
    }
    for (var i = 0; i < list.length; i++) {
        var cData = list[i];
        list[i] = cData.concat(speed);
    }
    return list;
};


// 格式化一个类型的图表数据
var formatChartData = function(testData, type) {
    // 基础的图表Server配置
    var baseChartOption = {
        type: 'line',
        symbol: 'none',
        lineWidth: 1,
        clipOverflow: false,
        animation: false,
        xAxisList: [],
        data: [],
    }

    formatVibUnit();

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
        0: {
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
    var chartData = {};

    // 当前类型的chart的series配置
    var seriesMap = chartMap[type];

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
                var val = cObj;
                if (typeof cObj == "object") {
                    val = cObj[key];
                }
                val = dealData(val, cOpt);
                cOpt.data.push(val);
                cOpt.xAxisList.push(startTime.format("YYYY-M-D hh:mm:ss.ll"));
                startTime = getTheDate('l', 5, startTime);
            }
        }
    };

    // 格式化振动数据
    var formatVib = function(data) {
        for (var key in seriesMap) {
            var startTime = new Date(data.Data_time);
            var list = data[key];
            var cOpt = seriesMap[key];
            for (var i = 0; i < list.length; i++) {
                var cObj = list[i];
                var val = cObj;
                val = dealData(val, cOpt);
                cOpt.data.push(val);
                cOpt.xAxisList.push(startTime.format("YYYY-M-D hh:mm:ss.ll"));
                startTime = getTheDate('l', 5, startTime);
            }
        }
    };

    for (var key in seriesMap) {
        var option = seriesMap[key];
        $.extend(true, option, baseChartOption);
    }

    if (type == "1") {
        formatVib(testData);
    } else {
        console.log(testData);
        for (let key in testData) {
            var data = testData[key];
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
            chartData[yType].yAxis.push(yAxisLabel[yType]);
            chartData[yType].xAxis = option.xAxisList;
        }
        chartData[yType].series.push(option);
    }

    return chartData;
};

var formatVibUnit = function() {
    if (getVibrationType()) {
        yAxisLabel[7].axisLabel.formatter = '{value}mg';
        yAxisLabel[8].axisLabel.formatter = '{value}mg';
        yAxisLabel[9].axisLabel.formatter = '{value}mg';
    } else {
        yAxisLabel[7].axisLabel.formatter = '{value}g';
        yAxisLabel[8].axisLabel.formatter = '{value}g';
        yAxisLabel[9].axisLabel.formatter = '{value}g';
    }
}

var yAxisLabel = (function() {
    var _defaultOption = {
        scale: true
    }
    var _self = {
        "1": {
            ytype: "1",
            axisLabel: {
                formatter: '{value}g'
            },
            name: '振动'
        },
        "2": {
            ytype: "2",
            axisLabel: {
                formatter: '{value}m/s'
            },
            name: '速度'
        },
        "3": {
            ytype: "3",
            axisLabel: {
                formatter: '{value}dB(A)'
            },
            name: '噪音'
        },
        "4": {
            ytype: "4",
            axisLabel: {
                formatter: '{value}A'
            },
            name: '电流'
        },
        "5": {
            ytype: "5",
            axisLabel: {
                formatter: '{value}KW'
            },
            name: '功率'
        },
        "6": {
            ytype: "6",
            axisLabel: {
                formatter: '{value}V'
            },
            name: '电压'
        },
        "7": {
            ytype: "7",
            axisLabel: {
                formatter: '{value}g'
            },
            name: 'x轴振动'
        },
        "8": {
            ytype: "8",
            axisLabel: {
                formatter: '{value}g'
            },
            name: 'y轴振动'
        },
        "9": {
            ytype: "9",
            axisLabel: {
                formatter: '{value}g'
            },
            name: 'z轴振动'
        }
    };

    for (var id in _self) {
        var yoption = _self[id];
        $.extend(yoption, _defaultOption);
    }

    return _self;
})();


// 生成图表
var createChart = function(data, wrap) {
    wrap = wrap;
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
        xAxis: [{
            type: 'category',
            axisLabel: {
                formatter: function(value, index) {
                    if (!value) {
                        return;
                    }
                    value = new Date(value);
                    return value.format("M-D hh:mm:ss").replace(' ', '\n');

                }
            },
            data: data.xAxis
        }],
        grid: {
            top: 30,
            bottom: 70
        },
        dataZoom: [{
            type: 'slider',
            xAxisIndex: [0],
            show: true,
            start: 0,
            end: 100,
            orient: 'horizontal',
            bottom: 0,
            labelFormatter: function(index, value) {
                if (!value) {
                    return;
                }
                value = new Date(value);
                return value.format("M-D hh:mm:ss").replace(' ', '\n');
            }
        }, {
            type: 'inside',
            xAxisIndex: [0],
            startValue: 0,
            endValue: 100,
        }],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        yAxis: data.yAxis,
        series: data.series
    };
    myChart.setOption(option);
    
};



function createChartsList(data) {
    data = getChartType(data);
    for (var i = 0; i < data.length; i++) {
        var cData = data[i];
        createCharts(cData);
    }
}

function createCharts(list) {
    var outWrap = createChartsWrap(list[0]);
    for (var i = 0; i < list.length; i++) {
        var data = list[i];
        var wrap = createChartWrap(data, outWrap);
        createChart(data, wrap);
    }
}

var createChartWrap = (function() {
    var index = 0;
    return function(data, wrap) {
        index++;
        var chartHtml = `<div id="chart_one_wrap_${index}" class="chart-wrap"></div>`;
        $(wrap).append(chartHtml);
        $(wrap).find('.bg-chart-b').remove();
        $(wrap).removeClass('bg-chart-b');
        return $(wrap).find(`#chart_one_wrap_${index}`)[0];

    }
})();

function createChartsWrap(data) {
    var showList = ['4', '5', '6', '7', '8', '9'];
    var id = data.series[0].yType;
    var html = tpl.getDataTpl("chart_wrap_popu", {
        type: id
    });
    var dom = $(html);
    $("#chart_list_wrap").append(dom);
    if (~showList.indexOf(id)) {
        var text = data.yAxis[0].name;
        var btnHtml = `<a class="com-btn2 submit-btn chart-btn" cid="chartWrap_${id}">${text}</a>`;
        $("#chart_btn_wrap").append(btnHtml);
    }
    return dom[0];
}
