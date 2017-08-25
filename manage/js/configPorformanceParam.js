pageStart(function(ajax) {
    var headList = [{
        name: "配置名称：",
        type: "text",
        sendId: "name",
        attribute: {
            className: "comtd"
        }
    }];

    // 显示错误
    function showError1(text) {
        var errorDiv = $(".red-error-1");
        errorDiv.text(text);
        errorDiv.css({
            "visibility": "visible"
        });
    };


    $.extend(tpl.format, {
        hasUsername: function(v) {
            if (v) {
                return "readonly='readonly'";
            }
            return "";
        }
    });


    var tableOption = {
        table: document.getElementById('data_table'),
        head: [{
            title: '配置名称',
            key: 'name',
            width: "60%"
        }, {
            title: '操作',
            key: 'operate',
            width: "40%"
        }],
        id: "id",
        body: {
            operate: function(td, obj) {
                
                var btn = {
                    use: function() {
                        var a = document.createElement("a");
                        a.className = 'opt-btn mr30 use_this_config_btn';

                        var i = document.createElement("i");
                        i.className = "use-icon";
                        a.appendChild(i);

                        var span = document.createElement("span");
                        span.innerHTML = " 使用此设定";
                        if (obj.enable) {
                            $(a).addClass("selected_config");
                            span.innerHTML = " 已启用";
                        }
                        a.appendChild(span);
                        td.appendChild(a);


                        a.onclick = function() {
                            ajax.enableSet(obj.id, function(cb) {
                                alert("启用成功");
                                $(".selected_config").find("span").text(" 使用此设定");
                                $(".selected_config").removeClass("selected_config");

                                span.innerText = " 已启用";
                                $(a).addClass("selected_config");
                            });
                        }
                    },
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
                            if($(td).find(".selected_config").length != 0){
                                alert("不能删除已启用的性能参数配置");
                                return;
                            }
                            page.removeTr(td, obj);
                        }
                    }
                };
                for (var id in btn) {
                    btn[id]();
                }
            }
        }
    };

    //页数
    var pager = new dominator.Paging();
    //页数的改变
    pager.appendEvent('change', function(_page) {
        page.pageIndex = _page;
        page.getList();
    });
    //一页展示数量的改变
    pager.appendEvent('pageSizeChange', function(pageSize) {
        page.pageIndex = 1;
        page.pageSize = pageSize;
        page.getList();
    });

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

    var page = {
        pageIndex: 1,
        pageSize: 10,
        init: function() {
            this.bindle();
            this.getList();
        },
        bindle: function() {
            var self = this;
            $("#add_porformance").click(function() {
                self.addPopu();
            });
        },
        removeTr: function(td, obj) {
            var self = this;
            ajax.delSet(obj.id, function() {
                alert("删除成功");
                self.table.remove(obj);
            });
        },
        getList: function() {
            var that = this;
            var data = {
                currentpage: page.pageIndex,
                pagesize: page.pageSize
            };

            ajax.getSets(data, function(callback) {
                var obj = callback.objects || {};

                pager.set(obj.pageCount, obj.currentPage, 6, page.pageSize);
                pager.write('#pager');
                that.buildTable(obj.entityList);
            });
        },
        buildTable: function(data) {
            this.table = treeTable(data, tableOption);
        },
        getSendData: function(list, odata) {
            odata = odata || {};
            for (i = 0; i < list.length; i++) {
                var obj = list[i];
                var data = obj.data;
                var val = obj.getVal();
                if (val === "") {
                    showError1("请输入名字");
                    return false;
                }
                odata[data.sendId] = val;
            }
            return odata;
        },
        setData: function(list, odata) {
            for (i = 0; i < list.length; i++) {
                var obj = list[i];
                var data = obj.data;
                obj.setVal(odata[data.sendId]);
            }
        },
        addPopu: function(obj) {
            var self = this;
            var configParamObj;
            var data = {
                title: obj ? "修改性能指标参数" : "添加性能指标参数",
                width: "900px",
                content: tpl.getDataTpl("addPorformance", {}),
                callbackFn: function(p) {
                    var wrap = p.wrap;
                    configParamObj = configParam([{
                        wrap: $(wrap).find(".config-params-table1"),
                        list: headList
                    }, {
                        wrap: $(wrap).find(".config-params-table2"),
                        list: validList
                    }, {
                        wrap: $(wrap).find(".config-params-table3"),
                        list: levelList
                    }, {
                        wrap: $(wrap).find(".config-params-table4"),
                        list: vibrationList
                    }, {
                        wrap: $(wrap).find(".config-params-table5"),
                        list: noiseList
                    }, {
                        wrap: $(wrap).find(".config-params-table6"),
                        list: railVibrationList
                    }]);
                },
                initFn: function(p) {
                    var wrap = p.wrap;
                    if (obj) {
                        self.setData(configParamObj.allConfigList, obj);
                    }

                    $(wrap).find(".submit-btn").click(function() {
                        var dd = {};
                        if (obj) {
                            dd.id = obj.id
                        }
                        var sendData = self.getSendData(configParamObj.allConfigList, dd);
                        if (!sendData) {
                            return false;
                        }
                        ajax.saveSet(sendData, function(cb) {
                            p.close();
                            if (obj) {
                                self.table.update(cb.objects);
                            } else {
                                self.table.add(cb.objects);
                            }
                            alert(cb.codeInfo);
                        });
                    });
                }
            };
            buildFloatLayer(data);
        }
    };

    page.init();

});
