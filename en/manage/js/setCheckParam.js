pageStart(function(ajax) {


    var vibParam = [{
        v: "0",
        name: "wb"
    }, {
        v: '1',
        name: "wc"
    }, {
        v: '2',
        name: "wd"
    }, {
        v: '3',
        name: "we"
    }, {
        v: '4',
        name: "wf"
    }, {
        v: '5',
        name: "wh"
    }, {
        v: '6',
        name: "wj"
    }, {
        v: '7',
        name: "wk"
    }, {
        v: '8',
        name: "wm"
    }];

    var paramMap = {
        noise: {
            name: "Noise test Delta",
            type: "text",
            sendId: "SNoiseDataP"
        },
        handrailVibrateVal: {
            name: "Vibration amplitude of handrail N",
            type: "text",
            sendId: "SHandStrapN"
        },
        handrailVibrateParam: {
            name: "Handrail vibration ISO parameter",
            type: "radio",
            sendId: "NHandStrapIso",
            list: vibParam
        },
        stairVibrateVal: {
            name: "Amplitude of stepped vibration N",
            type: "text",
            sendId: "SStairN"
        },
        stairVibrateParam: {
            name: "ISO parameter of cascade vibration",
            type: "radio",
            sendId: "NStairIso",
            list: vibParam
        },
        fishbackVibrateVal: {
            name: "Vibration amplitude of comb plate N",
            type: "text",
            sendId: "SPlateN"
        },
        fishbackVibrateParam: {
            name: "ISO parameter of comb plate vibration",
            type: "radio",
            sendId: "NPlateIso",
            list: vibParam
        }
    };

    var radioClass = function(obj) {
        this.obj = obj;
        var trStr = tpl.getDataTpl("trTpl", obj);
        var tr = this.tr = $(trStr).filter("tr")[0];

        var jQtd = $(tr).find("td").eq(1);
        var list = obj.list;
        var html = "";
        for (var i = 0; i < list.length; i++) {
            var data = $.extend({}, list[i]);
            data.sendId = obj.sendId;
            html += tpl.getDataTpl("radioTpl", data);
        }
        jQtd.append(html);
        obj.defaultVal = obj.defaultVal || 0;
        jQtd.find("input[param=" + obj.defaultVal + "]").click();
    }
    radioClass.prototype = {
        get: function() {
            var tr = $(this.tr);
            var val = tr.find("input:checked").attr("param");
            return val;
        },
        set: function(v) {
            var tr = $(this.tr);
            tr.find("input[param=" + v + "]").click();
        }
    };

    var textClass = function(obj) {
        this.obj = obj;
        var trStr = tpl.getDataTpl("trTpl", obj);
        var tr = this.tr = $(trStr).filter("tr")[0];

        var jQtd = $(tr).find("td").eq(1);
        jQtd.append('<input type="txt" >');
    }

    textClass.prototype = {
        get: function() {
            var tr = $(this.tr);
            var val = tr.find("input").val();
            return val;
        },
        set: function(v) {
            var tr = $(this.tr);
            tr.find("input").val(v);
        }
    };

    // 显示错误
    function showError1(text, dom) {
        var dom = dom || ".red-error-1";
        var errorDiv = $(dom);
        errorDiv.text(text);
        errorDiv.css({
            "visibility": "visible"
        });
    };
    var paramList = ["noise", "handrailVibrateVal", "handrailVibrateParam", "stairVibrateVal", "stairVibrateParam", "fishbackVibrateVal", "fishbackVibrateParam"];
    var allMap = {};

    var page = {
        init: function() {
            this.bindle();
            this.create();
        },
        bindle: function() {
            $(".submit-btn").click(function() {
                page.save();
            })
        },
        create: function() {
            var wrap = $("#tables_outdiv").find("table");
            wrap.empty();
            for (var i = 0; i < paramList.length; i++) {
                var obj = paramMap[paramList[i]];
                var trObj;

                switch (obj.type) {
                    case "radio":
                        trObj = new radioClass(obj);
                        break;
                    case "text":
                        trObj = new textClass(obj);
                        break;
                }
                wrap.append(trObj.tr);
                allMap[obj.sendId] = trObj;
            }
            this.queryParam();
        },
        queryParam: function() {
            ajax.queryParam(function(cb) {
                if (cb.objects) {
                    var data = cb.objects;
                    for (var id in allMap) {
                        var obj = allMap[id];
                       	obj.set(data[id]);
                    }
                }
            });
        },
        save: function() {
            var sendData = {};
            for (var id in allMap) {
                var obj = allMap[id];
                sendData[id] = obj.get();
                if (sendData[id] == "") {
                    showError1("请填写完整再提交");
                    return;
                }
            }
            ajax.setParam(sendData, function(cb) {
                alert(cb.codeInfo);
            });
        }
    };

    page.init();
});
