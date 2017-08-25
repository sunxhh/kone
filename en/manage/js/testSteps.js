pageStart(function(ajax) {
    var tableOption = {
        table: document.getElementById('data_table'),
        head: [{
            title: 'Test configuration name',
            key: 'jobname',
            width: "60%"
        }, {
            title: 'Operation',
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
                        span.innerHTML = " Use this configuration";
                        if (obj.enable) {
                            $(a).addClass("selected_config");
                            span.innerHTML = "Enabled";
                        }
                        a.appendChild(span);
                        td.appendChild(a);

                        a.onclick = function() {
                            ajax.enableJob(obj.id, function(cb) {
                                alert("Enable success");
                                $(".selected_config").find("span").text(" Use this configuration");
                                $(".selected_config").removeClass("selected_config");

                                span.innerText = " Enabled";
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
                        span.innerHTML = " Edit";
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
                        span.innerHTML = " Delete";
                        a.appendChild(span);
                        td.appendChild(a);

                        a.onclick = function() {
                            if($(td).find(".selected_config").length != 0){
                                alert("You cannot delete the enabled test steps");
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
                alert("Delete successfully");
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
