pageStart(function(ajax) {
    var tableOption = {
        table: document.getElementById('data_table'),
        head: [{
            title: 'Test record',
            key: 'name',
            width: "25%"
        }, {
            title: 'Test time',
            key: 'testdate',
            width: "25%"
        }, {
            title: 'Operator',
            key: 'testoperator',
            width: "25%"
        }, {
            title: 'operate',
            key: 'operate',
            className: "operate-td",
            width: "25%"
        }],
        id: "id",
        body: {
            testdate: function(td, obj) {
                var date = new Date(obj.testdate);
                td.innerText = date.format("YYYY年MM月DD日   hh:mm");
            },
            operate: function(td, obj) {
                td.style.textAlign = "left";
                var btn = {
                    view: function() {
                        var a = document.createElement("a");
                        a.className = 'opt-btn mr30';
                        a.target = "_blank";
                        a.href = "/page/testDetail.html?id=" + obj.id;

                        var i = document.createElement("i");
                        i.className = "edit-icon";
                        a.appendChild(i);

                        var span = document.createElement("span");
                        span.innerHTML = " View";
                        a.appendChild(span);
                        td.appendChild(a);

                    },
                    del: function() {
                        var a = document.createElement("a");
                        a.className = 'opt-btn  mr30';

                        var i = document.createElement("i");
                        i.className = "del-icon";
                        a.appendChild(i);

                        var span = document.createElement("span");
                        span.innerHTML = " Delete";
                        a.appendChild(span);
                        td.appendChild(a);

                        a.onclick = function() {
                            if ($(td).find(".selected_config").length != 0) {
                                alert("The enabled test record cannot be deleted");
                                return;
                            }
                            page.removeTr(td, obj);
                        }
                    },
                    use: function() {
                        var a = document.createElement("a");
                        a.className = 'opt-btn use_this_config_btn';

                        var i = document.createElement("i");
                        i.className = "use-icon";
                        a.appendChild(i);

                        var span = document.createElement("span");
                        span.innerHTML = " Set as final report";
                        if (obj.enable) {
                            $(a).addClass("selected_config");
                            span.innerHTML = " Enabled";
                        }
                        a.appendChild(span);
                        td.appendChild(a);

                        a.onclick = function() {
                            ajax.enableRecord(obj.id, function(cb) {
                                alert("Enable success");
                                $(".selected_config").find("span").text(" Set as final report");
                                $(".selected_config").removeClass("selected_config");

                                span.innerText = " Enabled";
                                $(a).addClass("selected_config");
                            });
                        }
                    },
                    reTest: function() {
                        var a = document.createElement("a");
                        a.className = 'opt-btn';
                        a.style.marginLeft = "10px";
                        a.href = '/page/inputTestInfo.html?step=2';
                        a.setAttribute("target", '_blank');
                        var span = document.createElement("span");
                        span.innerHTML = "Retest";

                        a.appendChild(span);
                        td.appendChild(a);
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
            ajax.delRecord(obj.id, function() {
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

            ajax.getRecords(data, function(callback) {
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
