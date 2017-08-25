pageStart(function(ajax) {
    var domOpt = {
        username: {
            subId: "username",
            dom: "#username",
            err: "请输入用户名",
            set: function() {

            }
        },
        password: {
            subId: "password",
            dom: "#password",
            err: "请输入密码"
        },
        comfirmPassword: {
            dom: "#comfirmPassword",
            get: function() {
                var ps1 = $(this.dom).val();
                var ps2 = $("#password").val();
                if (ps1 == "") {
                    showError1("请输入第二次密码");
                    return false;
                }
                if (ps1 != ps2) {
                    showError1("两次密码不一致");
                    return false;
                }
                return true;
            }
        },
        name: {
            subId: "name",
            dom: "#name",
            err: "请输入操作员姓名"
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
            title: '用户名',
            key: 'username',
            width: "33%"
        }, {
            title: '操作人姓名',
            key: 'name',
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
                            page.updateUserPopu(obj);
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
                            page.removeUser(td, obj);
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
                self.addUserPopu();
            });
        },
        removeUser: function(td, obj) {
            var self = this;
            ajax.removeUser(obj.id, function() {
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

            ajax.getUsers(data, function(callback) {
                var obj = callback.objects;
                pager.set(obj.pageCount, obj.currentPage, 6, page.pageSize);
                pager.write('#pager');
                that.buildTable(obj.entityList);
            });
        },
        buildTable: function(data) {
            this.table = treeTable(data, tableOption);
        },
        // 添加用户
        addUser: function(data, fn) {
            ajax.addUser(data, function(cb) {
                fn && fn(cb);
            });
        },
        updateUserPopu: function(sendData) {
            var self = this;
            var data = {
                title: "编辑用户",
                content: tpl.getDataTpl("addUser", sendData),
                initFn: function(p) {
                    var wrap = p.wrap;
                    $(wrap).find(".submit-btn").click(function() {
                        var list = ["username", "password", "comfirmPassword", "name"];
                        var ssendData = {};
                        if (getDomData(ssendData, list)) {
                            ssendData.id = sendData.id;
                            ssendData.newpassword = ssendData.password;
                            ssendData.confirmpassword = ssendData.password;
                            ssendData.role = sendData.role;
                            ajax.modifyUser(ssendData, function(cb) {
                                self.table.update(cb.objects);
                                p.close();
                            });
                        }
                    });
                }
            };
            buildFloatLayer(data);
        },
        addUserPopu: function() {
            var self = this;
            var data = {
                title: "添加用户",
                content: tpl.getDataTpl("addUser", {}),
                initFn: function(p) {
                    var wrap = p.wrap;
                    $(wrap).find(".submit-btn").click(function() {
                        var sendData = {
                            role: 0
                        };
                        var list = ["username", "password", "comfirmPassword", "name"];
                        if (getDomData(sendData, list)) {
                            self.addUser(sendData, function(cb) {
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
