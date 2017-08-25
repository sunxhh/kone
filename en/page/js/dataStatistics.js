jeDate({
    dateCell: "#start_time", //isinitVal:true,
    format: "YYYY-MM-DD",
    isTime: false, //isClear:false,
    maxDate: new Date().format("YYYY-MM-DD")
});
jeDate({
    dateCell: "#end_time", //isinitVal:true,
    format: "YYYY-MM-DD",
    isTime: false, //isClear:false,
    maxDate: new Date().format("YYYY-MM-DD")
});

var units = {
    1: {
        name: 'Uplink energy consumption',
        id: 1,
        type: 4
    },
    2: {
        name: 'Downlink energy consumption',
        id: 2,
        type: 4
    },
    3: {
        name: 'Uplink top noise',
        id: 3,
        type: 3
    },
    4: {
        name: 'Uplink central noise',
        id: 4,
        type: 3
    },
    5: {
        name: 'Uplink lower noise',
        id: 5,
        type: 3
    },
    6: {
        name: 'Down top noise',
        id: 6,
        type: 3
    },
    7: {
        name: 'Down Central noise',
        id: 7,
        type: 3
    },
    8: {
        name: 'Down lower noise',
        id: 8,
        type: 3
    },
    9: {
        name: 'Upward vibration of comb plate',
        id: 9,
        type: 1
    },
    10: {
        name: 'Down vibration of comb plate',
        id: 10,
        type: 1
    },
    11: {
        name: 'Stepped vibration uplink',
        id: 11,
        type: 1
    },
    12: {
        name: 'Stepped vibration downlink',
        id: 12,
        type: 1
    },
    14: {
        name: 'The left handrail vibration upward',
        id: 14,
        type: 1
    },
    15: {
        name: 'The left handrail vibration down',
        id: 15,
        type: 1
    },
    16: {
        name: 'The right handrail vibration upward',
        id: 16,
        type: 1
    },
    17: {
        name: 'The right handrail vibration upward',
        id: 17,
        type: 1
    }
}

var getChartData = function(optList, type) {
    var llv = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D']
    var lllo = ['AAA', 'AA', 'A', 'U'];
    var ll = lllo;

    if (type == "4") {
        ll = llv;
    }
    var list = [];
    for (var i = 0; i < ll.length; i++) {
        var count = 0;
        for (var j = 0; j < optList.length; j++) {
            if (ll[i] == optList[j].level_type) {
                count = optList[j].count;
                break;
            }
        }
        list.push({
            name: ll[i],
            y: count
        })
    }

    return list;
}


var page = {
    init: function() {
        this.bindle();
        //this.getList();
        this.showUnitSelect();
    },
    bindle: function() {
        var that = this;
        $("#unit_select").change(function() {
            that.showData();
        });
        $("#submint_btn").click(function() {
            that.getData();
        });
    },
    showData: function() {
        var id = $("#unit_select").val();
        var curUnit = units[id];

        $("#type_title").text(curUnit.name);

    },
    createSelect: function(list) {
        var that = this;
        var select = $("#unit_select").empty();
        var html = '';
        for (var i = 0; i < list.length; i++) {
            html += tpl.getDataTpl("select_option", list[i]);
        }
        select.append(html);
        that.showData();
    },
    dealOptionData: function(list) {
        var newList = [];
        for (var i = 0; i < list.length; i++) {
            var type = list[i].lifttype.substring(0, 1);
            if (type == 1 || type == 4) {
                var up = $.extend({}, list[i]);
                up.controltype = 1;
                up.unitname = up.unitname + "(上行)";
                up.id = up.id + "_" + up.controltype;
                newList.push(up);

                var down = $.extend({}, list[i]);
                down.controltype = -1;
                down.unitname = down.unitname + "(下行)";
                down.id = down.id + "_" + -1;
                newList.push(down);
            } else {
                newList.push(list[i]);
            }
        }
        return newList;
    },
    //数据
    levelObj: null,
    setData: function(data) {
        $("#level_table").hide();
        $("#level_table_o").hide();

        var ele;

        if (data.length == 4) {
            ele = $("#level_table_o");
        } else {
            ele = $("#level_table");
        }
        ele.show();
        var td = ele.find("tr").eq(1).find("td");
        for (var i = 0; i < data.length; i++) {
            td.eq((i + 1)).text(data[i].y);
        }
    },
    // 获取测试单元
    getList: function() {
        var that = this;
        ajax.queryUnits(function(callback) {
            var obj = that.dealOptionData(callback.objects);
            that.unitList = obj;
            that.levelObj = virtualChartData(obj);
            that.createSelect(obj);

        });
    },
    queryDataCount: function() {
        var sendData = {};
    },
    showUnitSelect: function() {
        var list = [];
        var that = this;
        var html = "";
        var select = $("#unit_select");
        select.empty();
        for (var key in units) {
            html += tpl.getDataTpl("select_option2", units[key]);
        }

        select.append(html);
        that.showData();
    },

    getData: function() {
        var that = this;
        var sendData = {};
        var start_time = $("#start_time").val();
        var end_time = $("#end_time").val();
        var type = $("#unit_select").val();
        var unitType = units[type].type;

        if (start_time && end_time && type) {
            sendData.start_date = start_time;
            sendData.end_date = end_time;
            sendData.type = type;

            ajax.queryDataCount(sendData, function(cb) {
                var list = getChartData(cb.objects, unitType);
                that.setData(list);
                createChart(list);
            });
        }
    }
};

page.init();

var createChart = function(data) {
    // Create the chart
    Highcharts.chart('chart_container', {
        chart: {
            type: 'column'
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
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
            colorByPoint: true,
            data: data
        }]

    });
}
