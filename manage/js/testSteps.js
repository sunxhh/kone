pageStart(function(ajax) {
    var tableOption = {
        table: document.getElementById('data_table'),
        head: [{
            title: '测试配置名称',
            key: 'jobname',
            width: "70%"
        }, {
            title: '操作',
            key: 'operate',
            width: "30%"
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
                        span.innerHTML = " 使用此配置";
                        if (obj.enable) {
                            $(a).addClass("selected_config");
                            span.innerHTML = " 已启用";
                        }
                        a.appendChild(span);
                        td.appendChild(a);

                        a.onclick = function() {
                            ajax.enableJob(obj.id, function(cb) {
                                alert("启用成功");
                                $(".selected_config").find("span").text(" 使用此配置");
                                $(".selected_config").removeClass("selected_config");

                                span.innerText = " 已启用";
                                $(a).addClass("selected_config");
                            });
                        }
                    },
                    edit: function() {
                        var a = document.createElement("a");
                        a.className = 'opt-btn mr30';
                        a.target = "_blank";
                        a.href = "/manage/configSteps.html?jid=" + obj.id;

                        var i = document.createElement("i");
                        i.className = "edit-icon";
                        a.appendChild(i);

                        var span = document.createElement("span");
                        span.innerHTML = " 编辑";
                        a.appendChild(span);
                        td.appendChild(a);

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
                                alert("不能删除已启用的测试步骤");
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
        },
        removeTr: function(td, obj) {
            var self = this;
            ajax.delJob(obj.id, function() {
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

            ajax.getJobs(data, function(callback) {
                var obj = callback.objects;
                pager.set(obj.pageCount, obj.currentPage, 6, page.pageSize);
                pager.write('#pager');
                that.buildTable(obj.entityList);
            });
        },
        buildTable: function(data) {
            this.table = treeTable(data, tableOption);
        }
    };

    page.init();
});
