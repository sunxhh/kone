pageStart(function(ajax) {
    var tableOption = {
        table: document.getElementById('data_table'),
        head: [{
            title: '测试记录',
            key: 'name',
            width: "25%"
        }, {
            title: '操作时间',
            key: 'testdate',
            width: "25%"
        }, {
            title: '操作员',
            key: 'testoperator',
            width: "25%"
        }, {
            title: '操作',
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
                        sessionstorage.save(('report_' + obj.id), obj);
                        var a = document.createElement("a");
                        a.className = 'opt-btn mr30';
                        a.target = "_blank";
                        a.href = "/page/testDetail.html?id=" + obj.id;

                        var i = document.createElement("i");
                        i.className = "edit-icon";
                        a.appendChild(i);

                        var span = document.createElement("span");
                        span.innerHTML = " 查看";
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
                        span.innerHTML = " 删除";
                        a.appendChild(span);
                        td.appendChild(a);

                        a.onclick = function() {
                            if ($(td).find(".selected_config").length != 0) {
                                alert("不能删除已启用测试记录");
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
                        span.innerHTML = " 设为最终报告";
                        // 全部设置为一起用
                        if (obj.enable) {
                            $(a).addClass("selected_config");
                            span.innerHTML = " 已启用";
                        }
                        a.cdata = obj;

                        a.appendChild(span);
                        td.appendChild(a);

                        a.onclick = function() {
                            var sendData = {
                                recordId: obj.id,
                                liftno: obj.liftno
                            };
                            ajax.enableRecord(sendData, function(cb) {
                                alert("启用成功");
                                page.removeSelected(obj.liftno);
                                
                                span.innerText = " 已启用";
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
                        span.innerHTML = "重新测试";

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
        removeSelected: function(liftno) {
            var selected = $(".selected_config");
            for(var i=0;i<selected.length;i++){
                var a = selected[i];
                if(a.cdata.liftno == liftno){
                    $(a).find("span").text(" 设为最终报告");
                    $(a).removeClass("selected_config");
                }
            }
            
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
