pageStart(function(ajax) {
    var domOpt = {
        unitname: {
            subId: "unitName",
            dom: "#unitname",
            err: "请输入测试单元名称"
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
    function showError1(text) {
        var errorDiv = $(".red-error-1");
        errorDiv.text(text);
        errorDiv.css({
            "visibility": "visible"
        });
    };


    $.extend(tpl.format, {

    });


    var tableOption = {
        table: document.getElementById('data_table'),
        head: [{
            title: '测试名称',
            key: 'unitname',
            width: "33%"
        }, {
            title: '传感器ID',
            key: 'deviceno',
            width: "33%"
        }, {
            title: '操作',
            key: 'operate',
            width: "33%"
        }],
        id: "id",
        body: {
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
                            page.updatePopu(obj);
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
                            page.removeUnit(td, obj);
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
        pageIndex: 1,
        pageSize: 10,
        init: function() {
            this.bindle();
            this.getList();
        },
        bindle: function() {
            var self = this;
            $("#add_user").click(function() {
                self.addPopu();
            });
        },
        removeUnit: function(td, obj) {
            var self = this;
            ajax.removeUnit(obj.id, function() {
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

            ajax.getUnits(data, function(callback) {
                var obj = callback.objects;
                pager.set(obj.pageCount, obj.currentPage, 6, page.pageSize);
                pager.write('#pager');
                that.buildTable(obj.entityList);
            });
        },
        buildTable: function(data) {
            this.table = treeTable(data, tableOption);
        },
        // 添加测试单元
        addUnit: function(data, fn) {
            ajax.addUnit(data, function(cb) {
                fn && fn(cb);
            });
        },
        createUnit: function(wrap) {
            var unitname = $(wrap).find("#unitname")[0];
            for (var i = 0; i < testDeviceList.length; i++) {
                var obj = testDeviceList[i];
                unitname.options.add(new Option(obj.unitname, obj.unitname));
            }
        },
        getUnitInfo: function(obj) {
            for (var i = 0; i < testDeviceList.length; i++) {
                if (obj.unitName == testDeviceList[i].unitname) {
                    obj.lifttype = testDeviceList[i].lifttype;
                    obj.commandtype = testDeviceList[i].commandtype;
                    obj.command = testDeviceList[i].command;
                    break;
                }
            }
        },
        // 修改
        updatePopu: function(sendData) {
            var self = this;
            var data = {
                title: "编辑测试",
                content: tpl.getDataTpl("addUnit", sendData),
                initFn: function(p) {
                    var wrap = p.wrap;
                    self.createUnit(wrap);

                    $(wrap).find("#unitname").val(sendData.unitname);

                    $(wrap).find(".submit-btn").click(function() {
                        var list = ["unitname", "deviceno", "deviceport"];
                        var ssendData = {};
                        if (getDomData(ssendData, list)) {
                            ssendData.unitId = sendData.id;
                            self.getUnitInfo(ssendData);
                            ajax.modifyUnit(ssendData, function(cb) {
                                self.table.update(cb.objects);
                                p.close();
                            });
                        }
                    });
                }
            };
            buildFloatLayer(data);
        },
        // 添加
        addPopu: function() {
            var self = this;
            var data = {
                title: "新增测试",
                content: tpl.getDataTpl("addUnit", {}),
                initFn: function(p) {
                    var wrap = p.wrap;
                    self.createUnit(wrap);
                    $(wrap).find(".submit-btn").click(function() {
                        var sendData = {};
                        var list = ["unitname", "deviceno", "deviceport"];
                        if (getDomData(sendData, list)) {
                            self.getUnitInfo(sendData);
                            self.addUnit(sendData, function(cb) {
                                self.table.add(cb.objects);
                                p.close();
                            });
                        }
                    });
                }
            };
            buildFloatLayer(data);
        }
    };

    page.init();
});
