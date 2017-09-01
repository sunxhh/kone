pageStart(function (ajax) {
    var recordData = getUrlRequest();
    // 打印
    function preview(oper) {
        if (oper < 10) {
            bdhtml = window.document.body.innerHTML; //获取当前页的html代码
            sprnstr = "<!--startprint" + oper + "-->"; //设置打印开始区域
            eprnstr = "<!--endprint" + oper + "-->"; //设置打印结束区域
            prnhtml = bdhtml.substring(bdhtml.indexOf(sprnstr) + 18); //从开始代码向后取html
            prnhtml = prnhtml.substring(0, prnhtml.indexOf(eprnstr)); //从结束代码向前取html
            window.document.body.innerHTML = prnhtml;
            window.print();
            window.document.body.innerHTML = bdhtml;
        } else {
            window.print();
        }
    };


    var reportIdList = [
        ["speed", "speedLevel"],
        ["avgspeed", ],
        ["floorleverupvmax", "floorleverupvmaxLevel"],
        ["floorleverdownvmax", "floorleverdownvmaxLevel"],
        ["lefthandrialupvmax", "lefthandrialupvmaxLevel"],
        ["lefthandrialdownvmax", "lefthandrialdownvmaxLevel"],
        ["righthandrialupvmax", "righthandrialupvmaxLevel"],
        ["righthandrialdownvmax", "righthandrialdownvmaxLevel"],
        ["shuchibanupvmax", "shuchibanupvmaxLevel"],
        ["shuchibandownvmax", "shuchibandownvmaxLevel"],
        ["upnoisevmax", "upnoiselevel"],
        ["upnoisevmax2", "upnoisevmaxlevel2"],
        ["midnoisevmax", "midnoiselevel"],
        ["midnoisevmax2", "midnoisevmaxlevel2"],
        ["downnoisevmax", "downnoiselevel"],
        ["downnoisevmax2", "downnoisevmaxlevel2"],
        ["engvalue", "englevel", "engpercent"],
        ["engvaluedown", "engleveldown", "engpercentdown"]
    ];



    // 测试步骤的option
    var stepTableOption = {
        table: document.getElementById('step_table'),
        head: [{
                title: '步骤',
                key: 'index'
            }, {
                title: '测试单元',
                key: 'unitnames'
            }, {
                title: '测试时间',
                key: 'testtime'
            }, {
                title: '设备控制',
                key: 'controltype'
            }
            // , {
            //     title: '操作',
            //     key: 'operate'
            // }
        ],
        id: "id",
        body: {
            index: function (td, obj) {
                td.innerText = "步骤" + obj.index;
            },
            controltype: function (td, obj) {
                td.innerText = deviceControlTypeMap[obj.controltype];
            },
            operate: function (td, obj) {
                var a = document.createElement("a");
                a.innerText = '重新测试';
                td.appendChild(a);
            }
        }
    };

    // 重测记录的option
    var retestTableOption = {
        table: document.getElementById('retest_table'),
        head: [{
            title: '重测记录',
            key: 'name',
            width: '25%'
        }, {
            title: '测试时间',
            key: 'date',
            width: '25%'
        }, {
            title: '操作人',
            key: 'operator',
            width: '25%'
        }, {
            title: '操作',
            key: 'operate',
            width: '25%'
        }],
        id: "id",
        body: {
            date: function (td, obj) {
                var date = new Date(obj.date);
                td.innerText = date.format("YYYY-MM-DD");
            },
            operate: function (td, obj) {
                var btn = {
                    view: function () {
                        var a = document.createElement("a");
                        a.className = 'opt-btn mr30';
                        a.target = "_blank";
                        // a.href = "/manage/testReport.html?id=" + obj.testrecordid;

                        var i = document.createElement("i");
                        i.className = "edit-icon";
                        a.appendChild(i);
                        a.onclick = function () {
                            page.getRetestRecord(obj.testrecordid);
                        };
                        var span = document.createElement("span");
                        span.innerHTML = " 查看报告";
                        a.appendChild(span);
                        td.appendChild(a);
                    },
                    use: function () {
                        var a = document.createElement("a");
                        a.className = 'opt-btn mr30 use_this_config_btn';
                        a.id = "enable_btn_" + obj.testrecordid;
                        var i = document.createElement("i");
                        i.className = "use-icon";
                        a.appendChild(i);

                        var span = document.createElement("span");
                        span.innerHTML = " 存入报告";
                        if (obj.enable) {
                            $(a).addClass("selected_config");
                            span.innerHTML = " 已存入";
                        }
                        a.appendChild(span);
                        td.appendChild(a);

                        a.onclick = function () {
                            page.enableRecord(obj);
                        }
                    }
                };
                for (var id in btn) {
                    btn[id]();
                }
            }
        }
    };


    // 重测记录详情的option
    var retestDetailTableOption = {
        table: null,
        head: [{
            title: '测试内容contents',
            key: 'unitname',
            width: '20%'
        }, {
            title: '评估项次Item',
            key: 'item',
            width: '20%'
        }, {
            title: '测试数据Data',
            key: 'data',
            width: '20%'
        }, {
            title: '单位unit',
            key: 'unit',
            width: '20%'
        }, {
            title: '参考结论Result',
            key: 'result',
            width: '20%'
        }],
        id: "id",
        body: {
            item: function (td, obj) {
                td.innerText = "VMAX";
            },
            unit: function (td, obj) {
                td.innerText = "mg";
            },
            result: function (td, obj) {
                td.innerText = "无";
            },
        }
    };


    // 弹出层
    function buildFloatLayer(data) {
        floatLayer({
            width: data.width || "500px",
            title: data.title,
            popuClass: data.popuClass,
            content: data.content,
            callbackFn: data.callbackFn
        }, function (p) {
            var jQcloseBtn = $(p.wrap).find(".popu-title .close-popu");
            jQcloseBtn.click(function () {
                p.close();
            });
            data.initFn && data.initFn(p);
        });
    };
    window.buildFloatLayer = buildFloatLayer;


    // 查看重测报告
    function retestView(list) {
        buildFloatLayer({
            width: "700px",
            title: "测试报告",
            content: tpl.getDataTpl("testReport"),
            callbackFn: function (p) {
                var wrap = p.wrap;
                retestDetailTableOption.table = $(wrap).find("table")[0];
                treeTable(list, retestDetailTableOption);
            },
            initFn: function (p) {
                var wrap = p.wrap;
                $(wrap).find(".enable").click(function () {
                    page.enableRecord(list[0]);
                });
                $(wrap).find(".retest").click(function () {

                });

            }
        })
    };



    // 生成table
    var createTable = function (data, table, colNum, tdFn) {
        colNum = colNum || 3;
        $(table).empty();
        var createTr = function () {
            var tr = document.createElement("tr");
            return tr;
        }
        var createTd = function (obj) {
            var td = document.createElement("td");
            tdFn(td, obj);
            return td;
        }

        var cTr = null;
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            if (i % colNum === 0) {
                cTr = createTr();
                $(table).append(cTr);
            }
            var td = createTd(obj);
            cTr.appendChild(td);
        }
    };


    var page = {
        init: function () {
            this.bindle();
            this.getRecordDetail();
        },
        bindle: function () {
            var that = this;
            $("#printf").click(function () {
                preview();
            });
            $("#download_pdf_btn").click(function () {
                printPDF();
            });
            $("#viewTestData").click(function () {
                location.href = "/page/escalatorData1.html?id=" + recordData.id;
            });
            $("#submit_remark").click(function () {
                that.updateDescription();
            });
        },
        updateDescription: function () {
            var that = this;
            var description = $.trim($("#description_textarea").val());
            if (description == "") {
                alert("请输入备注信息");
                return;
            }
            var reqData = {
                recordid: recordData.id,
                description: description
            };
            ajax.updateDescription(reqData, function (cbd) {
                that.disabledTextarea();
                alert("保存成功");
            });
        },
        disabledTextarea: function () {
            $("#description_textarea").attr("readonly","readonly");
            $("#submit_remark").hide();
        },
        // 启用
        enableRecord: function (obj) {
            var a = $("#enable_btn_" + obj.testrecordid);
            var span = a.find("span");
            ajax.enableReTestRecord(obj.testrecordid, function (cb) {
                alert("启用成功");
                $(".selected_config").find("span").text(" 存入报告");
                $(".selected_config").removeClass("selected_config");

                span.text(" 已存入");
                a.addClass("selected_config");
            });
        },
        getRetestRecord: function (id) {
            ajax.queryReTestReport(id, function (cb) {
                var data = cb.objects;
                retestView(data);
            });
        },
        getRecordDetail: function () {
            var that = this;
            ajax.queryReport(recordData.id, function (cb) {
                //cb = reportData;
                var data = cb.objects;
                $("#test_time").text(data.testdate);
                $("#test_name").text(data.name);
                that.createStepTable(data.teststeps);
                that.createRetestTable(data.retestrecords);
                that.createPorformance(data.performanceset);
                that.createEscalator(data);

                that.createReport(data.report);
            });
        },
        createStepTable: function (data) {
            var list = [];
            var index = 0;
            for (var i = 0; i < data.length; i++) {
                var obj = data[i];
                if (obj.isdelete) {
                    continue;
                }
                obj.index = ++index;
                list.push(obj);
            }
            this.stepTable = treeTable(list, stepTableOption);
        },
        createRetestTable: function (data) {
            data = data || [];
            this.retestTable = treeTable(data, retestTableOption);
        },
        createPorformance: function (data) {
            $("#test_operator").text(data.operator);
            var list = validList.concat(levelList, vibrationList, noiseList, railVibrationList);
            createTable(list, '#porformance_table', 3, function (td, obj) {
                var text = obj.name + " : " + (data[obj.sendId] ? data[obj.sendId] : "");
                td.innerText = text;
            });
        },
        createEscalator: function (obj) {
            var html = "";
            var jQwrap = $(".escalator-outdiv");
            var list1 = ["liftno", "productline", "speed", "height", "width", "inclination"];
            var list2 = ["runmode", "gearboxtype", "motortype", "motorpower"];
            var list3 = ["hashandrail", "handstrapdrivertype", "handstraptype"];
            var list = list1.concat(list2, list3);

            jQwrap.empty();
            for (var i = 0; i < list.length; i++) {
                var id = list[i];
                var val = obj[escalatorParam[id].sendId];
                switch (id) {
                    case "hashandrail":
                        val = val || 0;
                        val = hashandrailMap[val];
                        break;
                }
                var data = {
                    name: escalatorParam[id].name,
                    val: val
                };
                html += tpl.getDataTpl("escalatorParam", data);
            }
            jQwrap.append(html);
        },
        createReport: function (data) {
            var that = this;
            data = data || {};
            for (var i = 0; i < reportIdList.length; i++) {
                var cId = reportIdList[i];
                var ele = $("#" + cId[0]);

                var levelEle = ele.next().next();


                var id = cId[0];
                var le = cId[1];
                var pId = cId[2];
                var val = data[id];
                var leval = data[le];
                if (val == "Null") {
                    val = "";
                }
                if (leval == "Null") {
                    leval = "";
                }
                if (val || parseInt(val) == 0) {
                    var dataVal = tofixedNumber(val);
                    if (pId && data[pId]) {
                        dataVal = dataVal + "(" + tofixedNumber(data[pId]) + ")";
                    }
                    ele.text(dataVal);
                    levelEle.text(leval || '——');
                    if (~id.indexOf('noise')) {
                        if (parseFloat(tofixedNumber(val)) > 68) {
                            ele.css("color", "red");
                            levelEle.css("color", "red");
                        } else {
                            ele.css("color", "black");
                            ele.css("color", "black");
                        }
                    }
                } else {
                    ele.text('——');
                    levelEle.text('——');
                }

            }
            if(data.description){
                $("#description_textarea").val(data.description);
                that.disabledTextarea();
            }
        }
    };

    page.init();


    function printPDF() {
        var data = {
            title: "下载pdf",
            width: "90%",
            popuClass: "pdf-popu",
            content: tpl.getDataTpl("print_pdf", {}),
            initFn: function (p) {
                var wrap = p.wrap;
                var pdfWrap = $(wrap).find("#pdf-wrap");
                pdfWrap.append($("#lift_detail")[0].innerHTML);
                pdfWrap.append($("#test_report")[0].innerHTML);
                pdfWrap.find("#printf").remove();

                $(wrap).find("#download_pdf").click(function () {
                    demoFromHTML(pdfWrap[0]);
                });
            }
        };
        buildFloatLayer(data);

    }

});

function demoFromHTML(node) {
    // 将 id 为 content 的 div 渲染成 canvas
    html2canvas(node, {
        // 渲染完成时调用，获得 canvas
        onrendered: function (canvas) {
            // 从 canvas 提取图片数据
            var imgData = canvas.toDataURL('image/jpeg');

            var doc = new jsPDF("p", "mm", "a2");
            //                               |
            // |—————————————————————————————|                     
            // A0 841×1189                           
            // A1 594×841                            
            // A2 420×594                            
            // A3 297×420                            
            // A4 210×297                            
            // A5 148×210                            
            // A6 105×148                            
            // A7 74×105                             
            // A8 52×74                              
            // A9 37×52                              
            // A10 26×37             
            //     |——|———————————————————————————|
            //                                 |——|——|
            //                                 |     |      
            doc.addImage(imgData, 'JPEG', 0, 0, 420, 594);
            var name = $("#test_name").text();
            doc.save((name + '.pdf'));
        }
    });

}

function tofixedNumber(val) {
    val = parseFloat(val);
    if (isEmpty(val)) {
        return 0;
    }
    return val.toFixed(2);
}