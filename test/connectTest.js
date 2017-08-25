pageStart(function(ajax) {
    var ws;

    function showMsg(data) {
        var wrap = $("#connect_text");
        if (data.code == 0) {
            wrap.removeClass("error-status");
        } else {
            wrap.addClass("error-status");
        }

        wrap.text(data.codeInfo);
    }


    // 处理返回的数据
    var handSocketMsg = function(e) {
        var data = e.data;
        data = JSON.parse(data);

        if (data.Data && data.Data.length) {
            showChart(data);
        } else {
            if (data.type == "device") {
                if (data.code == 0) {
                    data.codeInfo = page.curTest.unitname + "测试成功";
                } else {
                    data.codeInfo = page.curTest.unitname + "连接失败";
                    page.curTest = null;
                }
                showMsg(data);

            } else if (data.type == "websocket") {
                showMsg(data);
            } else if (data.type == "test") {
                showMsg(data);
                alert(data.codeInfo);
                if (data.codeInfo == "测试停止！") {
                    chart = null;
                    page.curTest = null;
                }
            }
        }
    };

    var chart = null;

    // 设置当前的测试的设备
    var setCurTestDevice = function(obj) {
        var deviceId = obj.DeviceID;
        var port = obj.PortID;
        var unitList = page.unitList;
        if (!unitList) {
            return;
        }
        for (var i = 0; i < unitList.length; i++) {
            var data = unitList[i];
            if (data.deviceno == deviceId && port == data.deviceport) {
                page.curTest = data;
                return;
            }
        }
    }

    // 显示生成chart
    var showChart = function(data) {
        var list = data.Data;
        var time = data.Time;
        time = formatSQLDate(time);

        setCurTestDevice(data);

        if (chart) {
            var formatData = formatChartData(list);
            var yAxisList = formatData[1];

            for (var i = 0; i < yAxisList.length; i++) {
                var list = yAxisList[i].data;
                for (var j = 0; j < list.length; j++) {
                    chart.series[i].addPoint(list[j], false, true, false);
                }

            }
            chart.redraw();
        } else {
            chart = createChart("#sschart", list);
            chart.startTestTime = 0;
        }
    };



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
                showMsg({
                    code: 0,
                    codeInfo: "连接服务器成功"
                });
            }
        };

        ws.onmessage = function(e) {
            handSocketMsg(e);
        };
        ws.onclose = function(e) {
            var data = e.data;
            ws = null;
            showMsg({
                code: -1,
                codeInfo: "连接已关闭"
            });
        };
    };

    connect();

    function sendMsg() {
        var data = {
            "optType": "speed",
            "liftno": liftData.liftno,
            "enable": true,
            "stepid": obj.id,
            "order": obj.index
        };
        data = JSON.stringify(data);
        ws.send(data);
        this.setComInfo();
    }

    var page = {
        init: function() {
            this.bindle();
            this.getList();
        },
        bindle: function() {
            var that = this;
            var curTest = this.curTest;
            $(".test-btn-wrap").click(function(e) {
                var target = e.target;
                if ($(target).hasClass("com-btn4")) {
                    that.sendMsg(target.data);
                }
            });
            $("#stop").click(function() {
                that.stopTest();
            });

            $("#ledbtn").click(function() {
                that.settestLED4();
            });

            $("#lamp").click(function() {
                var checked = $("#lamp_type_div").find("input:checked");
                if (checked.length == 0) {
                    alert("请选择要打开的指示灯");
                    return;
                }
                var data = {
                    color: checked.attr("num"),
                    status: "00"
                };
                ajax.testLED5(data, function(d) {
                    alert(d.codeInfo);
                });
            });

            $("#closelamp").click(function() {
                var checked = $("#lamp_type_div").find("input:checked");
                if (checked.length == 0) {
                    alert("请选择要关闭的指示灯");
                    return;
                }
                var data = {
                    color: checked.attr("num"),
                    status: "01"
                };
                ajax.testLED5(data, function(d) {
                    alert(d.codeInfo);
                });
            });

        },
        unitList: null,
        getList: function() {
            var that = this;

            ajax.queryUnits(function(callback) {
                var obj = callback.objects;
                that.createBtn(obj);
                that.unitList = obj;
            });
        },
        createBtn: function(list) {
            var wrap = $(".test-btn-wrap").find(".test-btn-div");
            wrap.empty();
            for (var i = 0; i < list.length; i++) {
                var data = list[i];
                var html = tpl.getDataTpl("unitbtn", data);
                var a = $(html).filter("a")[0];
                a.data = data;
                data.target = a;
                wrap.append(a);
            }
        },
        curTest: null,
        stopTest: function() {
            var obj = {
                "optType": "stop"
            };
            var data = this.curTest;
            if (data) {
                var type = testDeviceTypeMap[data.lifttype.substring(0, 1)];
                if (type == "eng") {
                    obj.id = data.id;
                }
            }
            obj = JSON.stringify(obj);
            ws.send(obj);
        },
        sendMsg: function(data) {
            var lifttype = data.lifttype;
            page.curTest = data;
            var type = testDeviceTypeMap[lifttype.substring(0, 1)];
            var obj = {
                "optType": type
            };
            if (type == "eng") {
                obj.id = data.id;
            }
            obj = JSON.stringify(obj);
            ws.send(obj);
        },
        gettestLED1: function() {
            ajax.testLED1(function(cb) {

            });
        },
        gettestLED2: function() {
            ajax.testLED2(function(cb) {

            });
        },
        gettestLED3: function() {
            ajax.testLED3(function(cb) {

            });
        },
        settestLED4: function() {
            var txt = $("#ledtxt").val();
            ajax.testLED4(txt, function(cb) {

            });
        }
    };
    window.page = page;
    // 格式化图标信息
    var formatChartData = function(list) {
        var xAxisList = [];
        var yAxisList = [];
        var dif = 100;
        var type = false;
        if (page.curTest) {
            type = testDeviceTypeMap[page.curTest.lifttype.substring(0, 1)];
        }

        var orgData = {
            showInLegend: false, // 隐藏名字
            lineWidth: 1,
            animation: false, // 关闭生成动画
            data: []
        };

        // 格式化方法
        var formatTypeMap = {
            eng: function(list) {
                var map = {
                    "A_current": {
                        name: "A相电流",
                        lineWidth: 1,
                        animation: false, // 关闭生成动画
                        data: []
                    },
                    "B_current": {
                        name: "B相电流",
                        lineWidth: 1,
                        animation: false, // 关闭生成动画
                        data: []
                    },
                    "C_current": {
                        name: "C相电流",
                        lineWidth: 1,
                        animation: false, // 关闭生成动画
                        data: []
                    },
                    "Total_active_power": {
                        name: "总有功功率",
                        lineWidth: 1,
                        animation: false, // 关闭生成动画
                        data: []
                    }
                };
                var rList = [];
                for (var i = 0; i < list.length; i++) {
                    var cData = list[i];
                    for (var id in map) {
                        var val = cData[id];
                        val = parseFloat(val);
                        map[id].data.push(val)
                    }
                }

                for (var id in map) {
                    rList.push(map[id]);
                }
                return rList;
            },
            speed: function(list) {
                var map = {
                    "Value": {
                        name: "速度",
                        lineWidth: 1,
                        animation: false, // 关闭生成动画
                        data: []
                    }
                };
                var rList = [];
                for (var i = 0; i < list.length; i++) {
                    var cData = list[i];
                    for (var id in map) {
                        var val = cData[id];
                        val = parseFloat(val);
                        map[id].data.push(val)
                    }
                }

                for (var id in map) {
                    rList.push(map[id]);
                }
                return rList;
            },
            noise: function(list) {
                var map = {
                    "Value": {
                        name: "噪音",
                        lineWidth: 1,
                        animation: false, // 关闭生成动画
                        data: []
                    }
                };
                var rList = [];
                for (var i = 0; i < list.length; i++) {
                    var cData = list[i];
                    for (var id in map) {
                        var val = cData[id];
                        val = parseFloat(val);
                        map[id].data.push(val)
                    }
                }

                for (var id in map) {
                    rList.push(map[id]);
                }
                return rList;
            },
            vib: function(list) {
                var map = {
                    "Value": {
                        name: "振动",
                        lineWidth: 1,
                        animation: false, // 关闭生成动画
                        data: []
                    }
                };
                var rList = [];
                for (var i = 0; i < list.length; i++) {
                    var cData = list[i];
                    for (var id in map) {
                        var val = cData[id];
                        val = parseFloat(val);
                        map[id].data.push(val)
                    }
                }

                for (var id in map) {
                    rList.push(map[id]);
                }
                return rList;
            }
        };

        yAxisList = formatTypeMap[type || "eng"](list);
        return [xAxisList, yAxisList];
    };

    // 生成图标
    var createChart = function(wrap, data) {
        var list = data;
        var ll = formatChartData(list);
        var xAxisList = ll[0];
        var yAxisList = ll[1];

        for (var j = 0; j < yAxisList.length; j++) {
            for (var i = 0; i < 600; i++) {
                yAxisList[j].data.unshift(0);
            }
        }

        var wrap = $(wrap);
        wrap.empty();

        var chart = Highcharts.chart(wrap[0], {
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
            yAxis: {
                tickInterval: 10, // 间隔
                title: {
                    text: '<div>LV<div><div>(V)</div>',
                    rotation: 0,
                    style: {
                        "text-align": 'center'
                    },
                    useHTML: true
                },

                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: yAxisList
        });
        return chart;
    };
    page.init();
});
