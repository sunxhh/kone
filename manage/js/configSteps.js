pageStart(function(ajax) {
    var stopStaircaseOptions = [0.1, 0.2, 0.3, 0.4, 0.5];
    var domOpt = {
        unitname: {
            subId: "unitName",
            dom: "#unitname",
            err: "请输入测试单元名称",
            set: function() {

            }
        },
        deviceno: {
            subId: "deviceNo",
            dom: "#deviceno",
            err: "请输入设备编号"
        },
        deviceport: {
            subId: "devicePort",
            dom: "#deviceport",
            err: "请输入设备端口"
        }
    };

    // 默认选中的选项的name
    var CHECKEDUNIT = "扶手带速度";

    // 获取数据
    function getDomData(data, list) {
        for (var i = 0; i < list.length; i++) {
            var name = list[i];
            var obj = domOpt[name];
            var val;
            if (obj.get) {
                val = obj.get();
            } else {
                val = $(obj.dom).val();
            }
            if (isEmpty(val) && !obj.noMust) {
                showError1(obj.err);
                return false;
            }
            if (obj.subId) {
                data[obj.subId] = val;
            }
        }
        return true;
    };

    // 设置数据
    function setDomData(data, list) {
        for (var i = 0; i < list.length; i++) {
            var name = list[i];
            var obj = domOpt[name];
            if (obj.set) {
                obj.set(data[name], data);
            } else {
                $(obj.dom).val(data[name]);
            }
        }
    };

    // 显示错误
    function showError1(dom, text) {
        var dom = dom || ".red-error-1";
        var errorDiv = $(dom);
        errorDiv.text(text);
        errorDiv.css({
            "visibility": "visible"
        });
    };


    $.extend(tpl.format, {
        defaultChecked: function() {
            var obj = arguments[arguments.length - 1];
            var attr = "";
            if (obj.lifttype == '203' || obj.unitname == CHECKEDUNIT) {
                attr += 'checked="checked" disabled="disabled" ';
            }
            if (obj.lifttype.substring(0, 1) == "1") {
                attr += 'vibrate="vibrate"';
            }
            return attr;
        }
    });


    var tableOption = {
        table: document.getElementById('data_table'),
        head: [{
            title: '步骤',
            key: 'setp',
            width: "100"
        }, {
            title: '测试单元',
            key: 'unitnames',
            width: "300"
        }, {
            title: '测试时间',
            key: 'testtime',
            width: "80"
        }, {
            title: '设备控制',
            key: 'controltype',
            width: "100"
        }, {
            title: '操作',
            key: 'operate',
            width: "150"
        }],
        id: "jobid",
        body: {
            setp: function(td) {
                var str = "步骤" + (arguments[5] + 1);
                td.innerText = str;
            },
            controltype: function(td, obj) {
                td.innerText = deviceControlTypeMap[obj.controltype];
            },
            testtime: function(td, obj) {
                var val = obj.testtime;
                if (val != 'auto') {
                    if (parseInt(val) > 0) {
                        val = parseInt(parseInt(val) / testTimeUnit);
                    } else {
                        val = val + "圈";
                    }
                }
                td.innerHTML = val;
            },
            operate: function(td, obj) {
                var btn = {
                    edit: function() {
                        var a = document.createElement("a");
                        a.className = 'opt-btn mr30';

                        var i = document.createElement("i");
                        i.className = "edit-icon";
                        a.appendChild(i);

                        var span = document.createElement("span");
                        span.innerHTML = " 编辑";
                        a.appendChild(span);
                        td.appendChild(a);

                        a.onclick = function() {
                            page.addPopu(obj);
                        }
                    },
                    del: function() {
                        var a = document.createElement("a");
                        a.className = 'opt-btn';

                        var i = document.createElement("i");
                        i.className = "del-icon";
                        a.appendChild(i);

                        var span = document.createElement("span");
                        span.innerHTML = " 删除";
                        a.appendChild(span);
                        td.appendChild(a);

                        a.onclick = function() {
                            page.removeJob(td, obj);
                        }
                    }
                };
                for (var id in btn) {
                    btn[id]();
                }
            }
        }
    };


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

    var jobid = getUrlRequest().jid;
    var page = {
        init: function() {
            this.bindle();
            if (isEmpty(jobid)) {
                this.setConfigName();
                this.buildTable([]);
            } else {
                this.getList();
            }
        },
        bindle: function() {
            var self = this;
            $("#add_btn").click(function() {
                if (jobid) {
                    self.addPopu();
                } else {
                    self.setConfigName();
                }
            });
        },
        removeJob: function(td, obj) {
            var self = this;
            ajax.delStep(obj.id, function() {
                alert("删除成功");
                self.table.remove(obj);
            });
        },
        getList: function() {
            var that = this;
            ajax.getSteps(jobid, function(callback) {
                var obj = callback.objects;
                that.configMap.configName = obj.job.jobname;
                $(".main-body-head").text(that.configMap.configName);
                if (obj.steps && obj.steps.length != 0) {
                    that.configMap.stepOrder = obj.steps[obj.steps.length - 1].steporder + 1;
                } else {
                    that.configMap.stepOrder = 1;
                }
                that.buildTable(obj.steps);
            });
        },
        buildTable: function(data) {
            this.table = treeTable(data, tableOption);
        },
        // 添加测试配置名字
        setConfigName: function() {
            var self = this;
            var data = {
                width: "400px",
                title: "<div class='popu-title-1'>新建测试配置</div>",
                content: tpl.getDataTpl("add_popu_1", {}),
                initFn: function(p) {
                    var wrap = p.wrap;
                    $(wrap).find(".submit-btn").click(function() {
                        var val = $(wrap).find("input").val();
                        if (isEmpty(val)) {
                            showError1($(wrap).find(".red-error-1"), "请输入测试配置名称");
                            return;
                        }
                        self.addPopu(val);
                        p.close();
                    });
                }
            };
            buildFloatLayer(data);
        },
        // 获取所有测试单元
        getUnits: function(fn) {
            var self = this;
            var configMap = self.configMap;
            if (configMap.allUnits) {
                fn && fn(configMap.allUnits);
            } else {
                ajax.queryUnits(function(cb) {
                    configMap.allUnits = cb.objects;
                    fn && fn(cb.objects);
                });
            }
        },
        // 配置的基础信息
        configMap: {
            // 当前所有的测试单元
            allUnits: null,
            // 测试步骤配置的名字
            configName: "",
            // 最大步骤
            stepOrder: 0
        },
        // 添加
        addPopu: function(configName) {
            var self = this;
            var configMap = self.configMap;

            var target = arguments[0];
            var configName = null,
                initObj = null;
            if (typeof target == "string") {
                configName = target;
                initObj = arguments[1];
            } else {
                initObj = target;
            }

            // 获取需要保存的数据
            function getSendData(wrap, data) {
                var data = data || {};
                if (initObj) {
                    data.stepId = initObj.id;
                } else {
                    data.stepOrder = configMap.stepOrder;
                }
                data.jobId = jobid || 0;
                data.jobName = configMap.configName || configName;
                data.controlType = $(wrap).find(".device-config-div").find("input:checked").attr("status");
                var checkbox = $(wrap).find(".test-unit-div").find("input:checked");
                var unitIds = [],
                    lifttypes = [],
                    unitNames = [];
                for (var i = 0; i < checkbox.length; i++) {
                    unitIds.push(checkbox.eq(i).attr("did"));
                    unitNames.push(checkbox.eq(i).attr("dname"));
                    lifttypes.push(checkbox.eq(i).attr("dlifttype"));
                }
                if (unitIds.length == 0) {
                    showError1($(wrap).find(".red-error-1"), "至少选择一个测试单元");
                    return false;
                }
                data.unitIds = unitIds.join(",");
                data.unitNames = unitNames.join(",");

                var jQtestTime = $(wrap).find(".test-time-div");
                if (jQtestTime.find("input:checked").attr("status") == "0") {
                    data.testTime = "auto";
                } else if (jQtestTime.find("input:checked").attr("status") == "1") {
                    data.testTime = (~~jQtestTime.find("input[type=text]").val()) * testTimeUnit;
                    if (data.testTime < 1) {
                        return false;
                    }
                } else {
                    data.testTime = parseFloat(jQtestTime.find("select").val());
                }
                if (!data.testTime) {
                    showError1($(wrap).find(".red-error-1"), "请选择或者输入时间");
                    return false;
                }

                var hasVibrate = false;
                for (var i = 0; i < lifttypes.length; i++) {
                    if (~needSign.indexOf(lifttypes[i])) {
                        hasVibrate = true;
                        break;
                    }
                }
                if (hasVibrate && data.testTime != "auto") {
                    alert("测试单元与停梯单元时间停梯冲突，保存失败");
                    return false;
                }

                var hasNoise = false;
                var noiseMinTime = 2;
                var hasEng = false;
                var engMinTime = 6;
                var timeStatus = jQtestTime.find("input:checked").attr("status");
                for (var i = 0; i < lifttypes.length; i++) {
                    var ltype = lifttypes[i].substring(0, 1);
                    if (ltype == "3") {
                        hasNoise = true;
                    }
                    if (ltype == "4") {
                        hasEng = true;
                    }
                }
                if (hasEng) {
                    if (timeStatus == 0) {
                        alert("测试单元与停梯单元时间停梯冲突，保存失败");
                        return false;
                    }
                    if (data.testTime < engMinTime * 60) {
                        alert("测试步骤有能耗检测，时间必须大于" + engMinTime + "分钟");
                        return false;
                    }
                }
                if (hasNoise) {
                    if (timeStatus == 0) {
                        alert("测试单元与停梯单元时间停梯冲突，保存失败");
                        return false;
                    }
                    if (data.testTime < noiseMinTime * 60) {
                        alert("测试步骤有能耗检测，时间必须大于" + noiseMinTime + "分钟");
                        return false;
                    }
                }
                return data;
            };

            // 设置原始消息
            var sendData = function(wrap, data) {
                $(wrap).find(".device-config-div").find("input[status=" + data.controltype + "]").prop("checked", "checked");;

                var checkbox = $(wrap).find(".test-unit-div").find("input");
                var unitIdList = data.unitids.split(",");
                for (var i = 0; i < checkbox.length; i++) {
                    var did = checkbox.eq(i).attr("did");
                    if (~unitIdList.indexOf(did)) {
                        checkbox.eq(i).prop("checked", "checked");
                    }
                }

                var jQtestTime = $(wrap).find(".test-time-div");
                if (data.testtime == "auto") {
                    jQtestTime.find("input[status=0]").prop("checked", "checked");
                } else if (parseInt(data.testtime) >= 1) {
                    jQtestTime.find("input[status=1]").prop("checked", "checked");
                    jQtestTime.find("input[type=text]").val(parseInt(parseInt(data.testtime) / testTimeUnit));
                } else {
                    jQtestTime.find("input[status=2]").prop("checked", "checked");
                    jQtestTime.find("#stop_staircase_num").val(data.testtime);
                }

                return data;
            };

            function setStopStaircaseOptions(wrap) {
                var select = $(wrap).find("#stop_staircase_num");
                for (var i = 0; i < stopStaircaseOptions.length; i++) {
                    select.append(new Option(stopStaircaseOptions[i], stopStaircaseOptions[i]));
                }
            }

            var data = {
                width: "800px",
                title: "<div class='popu-blue-title'>测试步骤</div>",
                content: tpl.getDataTpl("add_step", {}),
                initFn: function(p) {
                    var wrap = p.wrap;
                    var jQtestUnitsWrap = $(wrap).find(".test-unit-div .add-step-module-body");
                    $(wrap).find(".submit-btn").click(function() {
                        var sendData = getSendData(wrap, {});
                        if (!sendData) {
                            return false;
                        }
                        if (initObj) {
                            ajax.modifyStep(sendData, function(cb) {
                                $(".main-body-head").text(configMap.configName);
                                p.close();
                                self.table.update(cb.objects);
                            });
                        } else {
                            ajax.addStep(sendData, function(cb) {
                                if (configName) {
                                    configMap.configName = configName;
                                }

                                configMap.stepOrder++;
                                $(".main-body-head").text(configMap.configName);
                                p.close();
                                self.table.add(cb.objects);
                                self.continueAdd();
                                jobid = cb.objects.jobid;
                            });
                        }

                    });

                    $(wrap).find("#stop_staircase_time").inputNumber();
                    setStopStaircaseOptions(wrap);
                    $(wrap).find("input[type=text]").focus(function() {
                        $(this).parent("label").find("input[type=radio]").click();
                    });
                    $(wrap).find("#stop_staircase_num").click(function() {
                        $(this).parent("label").find("input[type=radio]").click();
                    });
                    self.getUnits(function(list) {
                        jQtestUnitsWrap.empty();
                        var html = "";
                        for (var i = 0; i < list.length; i++) {
                            html += tpl.getDataTpl("test_unit", list[i]);
                        }
                        jQtestUnitsWrap.append(html);

                        // 选择振动与停梯
                        // jQtestUnitsWrap.find("input[vibrate=vibrate]").click(function() {
                        //     var checkbox = jQtestUnitsWrap.find("input[vibrate=vibrate]");
                        //     var isChecked = false;
                        //     for (var i = 0; i < checkbox.length; i++) {
                        //         if(checkbox.eq(i).prop("checked")){
                        //             isChecked = true;
                        //             break;
                        //         }
                        //     }
                        //     if(isChecked){
                        //         $(wrap).find("input[type=radio]").attr("disabled","disabled")
                        //         $(wrap).find("input[type=radio]").eq(0).prop("checked",true);
                        //     }
                        //     else{
                        //         $(wrap).find("input[type=radio]").attr("disabled",false)
                        //     }
                        // });

                        if (initObj) {
                            sendData(wrap, initObj);
                        }
                    });
                }
            };
            buildFloatLayer(data);
        },

        // 继续添加
        continueAdd: function() {
            var self = this;
            var data = {
                width: "450px",
                title: "<div class='popu-title-1'>是否继续添加步骤</div>",
                content: tpl.getDataTpl("continue_add", {}),
                initFn: function(p) {
                    var wrap = p.wrap;
                    $(wrap).find(".not-add-btn").click(function() {
                        p.close();
                    });
                    $(wrap).find(".continue-add-btn").click(function() {
                        p.close();
                        self.addPopu();
                    });
                }
            };
            buildFloatLayer(data);
        }
    };

    page.init();
});
