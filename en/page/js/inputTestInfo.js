'use strict'
// pageStart(function(ajax) {
$.extend(tpl.format, {
    controltype: function(v) {
        return deviceControlTypeMap[v];
    }
})


// 显示错误
function showError1(wrap, text) {
    var errorDiv = $(wrap).find(".red-error-1");
    errorDiv.text(text);
    errorDiv.css({
        "visibility": "visible"
    });
};

var urlData = getUrlRequest();

// 弹出层
function buildFloatLayer(data) {
    floatLayer({
        width: data.width || "500px",
        title: data.title,
        content: data.content,
        callbackFn: data.callbackFn
    }, function(p) {
        var jQcloseBtn = $(p.wrap).find(".popu-title .close-popu");
        jQcloseBtn.click(function() {
            p.close();
        });
        data.initFn && data.initFn(p);
    });
};
window.buildFloatLayer = buildFloatLayer;



var inputTestInfo = {
    init: function() {
        if (!this.isInit) {
            this.bindle();
            this.create();
            this.setData();
            this.isInit = true;
            if(urlData.step == '2'){
                this.showTestStep();
            }
        }
    },
    isInit: false,
    configList: null,
    jQwrap: $("#input_test_info_wrap"),
    setData: function() {
        var odata = this.defaultData;
        var radio = $("input[type=radio]");
        if (!odata) {
            radio.eq(0).click();
            return false;
        }
        if (odata.hashandrail == 1) {
            radio.eq(0).click();
        } else {
            radio.eq(1).click();
        }
        var list = this.configList.allConfigList;
        for (var i = 0; i < list.length; i++) {
            var obj = list[i];
            var data = obj.data;
            obj.setVal(odata[data.sendId]);
        }

    },
    createOne: function(list, title, fn) {
        var lastList = [];
        for (var i = 0; i < list.length; i++) {
            var obj = escalatorParam[list[i]];
            if (obj.sendId == 'hashandrail') {
                obj.attribute = {
                    colspan: 2,
                    class: 'has-handrail-td'
                };
            }
            lastList.push(obj);
        }
        var html = tpl.getDataTpl("inputTestInfoPopu", {
            title: title
        });
        var div = $(html).filter(".test-info-table-wrap");
        this.jQwrap.find("#tables_outdiv").append(div);
        this.configList = configParam([{
            wrap: div.find(".test-info-table"),
            list: lastList
        }]);
        fn && fn(div);
    },
    create: function() {
        var jQwrap = this.jQwrap;
        var list1 = ["liftno", "productline", "height", "speed", "width", "inclination"];
        var list2 = ["runmode", "gearboxtype", "motortype", "motorpower"];
        var list3 = ["hashandrail", "handstrapdrivertype", "handstraptype"];

        this.createOne(list1, "基本信息");
        this.createOne(list2, "马达减速箱信息");
        this.createOne(list3, "扶手带信息", function(div) {
            var radio = div.find("input[type=radio]");
            var tr = div.find("table").find("tr").eq(0);
            tr.find("td").css({
                width: "100%"
            });
            radio.click(function() {
                var rid = $(this).attr("rid");
                if (rid == 1) {
                    div.find("table").find("tr").eq(1).show();
                } else if (rid == 0) {
                    div.find("table").find("tr").eq(1).hide();
                }
            });
            div.find("table").find("tr").eq(1).hide();

        });
    },
    //录入的信息
    inputData: null,
    bindle: function() {
        var jQwrap = this.jQwrap;
        var self = this;
        jQwrap.find(".submit-btn").click(function() {
            var sendData = {};
            if (self.defaultData) {
                //self.showTestStep();
                //return;
            }
            sendData = self.getSendData(self.configList.allConfigList, sendData);
            if (!sendData) {
                return false;
            }
            ajax.saveElevator(sendData, function(cb) {
                self.defaultData = cb.objects;
                //self.showTestStep();
                confirmPopu();
            });
        });
    },
    showTestStep: function() {
        $(".tab-div1").hide();
        $(".tab-div2").show();
        testStep.init();
    },
    getSendData: function(list, odata) {
        odata = odata || {};
        for (var i = 0; i < list.length; i++) {
            var obj = list[i];
            var data = obj.data;
            var val = obj.getVal();
            if (data.checkData) {
                if (!data.checkData(val)) {
                    showError1("#input_test_info_wrap", data.errorText);
                    return false;
                }
            }
            odata[data.sendId] = val;
        }
        return odata;
    }
};

var testStep = {
    init: function() {
        if (!this.isInit) {
            this.bindle();
            this.isInit = true;
        }
        this.getEnableSteps();
    },
    isInit: false,
    bindle: function() {
        var jQwrap = $(".tab-div2");
        jQwrap.find("#back_last_step").click(function() {
            inputTestInfo.init();
            $(".tab-div1").show();
            $(".tab-div2").hide();
        });

        jQwrap.find("#begin_test").click(function() {
            location.href = "/page/test.html?liftno=" + inputTestInfo.defaultData.liftno;
        });
    },
    getEnableSteps: function() {
        var self = this;
        ajax.getEnableSteps(function(cb) {
            self.create(cb.objects);
        });
    },
    create: function(list) {
        var index = 1;
        var jQwrap = $(".tab-div2").find(".step-wrap");
        jQwrap.empty();
        for (var i = 0; i < list.length; i++) {
            var data = list[i];
            if (!data.isdelete) {
                data.index = index;
                var html = tpl.getDataTpl("testStepPopu", data);
                jQwrap.append(html);
                index++;
            }
        }
    }
};

ajax.queryElevator(function(cb) {
    if (cb.objects) {
        inputTestInfo.defaultData = cb.objects;
        console.log(inputTestInfo.defaultData);
        if (cb.objects.type == 1 && false) {
            location.href = "/page/test.html?liftno=" + inputTestInfo.defaultData.liftno;
            return true;
        }
    }

    inputTestInfo.init();
});

class InfoDiv {
    
    constructor(data) {
        this.data = data.data;
        this.val = data.getVal();
        this.unit = data.data.unit || "";
        this.wrap = document.createElement("div");
        this.handrailMap = {
            0:"不包含",
            1:"包含"
        }
        this.create();
    }

    create(){
        let wrap = $(this.wrap);
        wrap.addClass("info-div");
        let data = this.data;
        let span1 = document.createElement("span");
        span1.innerText = data.name + "：";
        wrap.append(span1);

        let span2 = document.createElement("span");
        span2.innerText = this.val + this.unit;
        if(data.sendId == "hashandrail"){
            span2.innerText = this.handrailMap[this.val];
            // wrap.addClass("two-info-div");
        }

        wrap.append(span2);
    }
}

var confirmPopu = function() {
    var list = inputTestInfo.configList.allConfigList
    var data = {
        title: "Please verify that the entered escalator information is correct",
        content: tpl.getDataTpl("confirmPopu", {}),
        width: "680px",
        initFn: function(p) {
            var wrap = p.wrap;
            var divWrap = $(wrap).find("#info_preview_wrap");

            for (var i = 0; i < list.length; i++) {
                var obj = list[i];
                var infodiv = new InfoDiv(obj);
                divWrap.append(infodiv.wrap);
                if(obj.data.sendId == "hashandrail"&&obj.getVal() == "0"){
                    break;
                }
            }

            $(wrap).find("#back_btn").click(function(){
                p.close();
            });

            $(wrap).find("#next_btn").click(function(){
                inputTestInfo.showTestStep();
                p.close();
            });

        }
    };
    buildFloatLayer(data);
}

// });
