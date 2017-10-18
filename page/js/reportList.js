pageStart(function (ajax) {
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
        }],
        id: "id",
        body: {
            name: function (td, obj, a, b, tr) {
                td.innerText = obj.name;
                tr.onclick = function () {
                    sessionstorage.save(('report_' + obj.id), obj);
                    location.href = "/page/escalatorData1.html?id=" + obj.id;
                };
            },
            testdate: function (td, obj) {
                var date = new Date(obj.testdate);
                td.innerText = date.format("YYYY年MM月DD日   hh:mm");
            }
        }
    };

    //页数
    var pager = new dominator.Paging();
    //页数的改变
    pager.appendEvent('change', function (_page) {
        page.pageIndex = _page;
        page.getList();
    });
    //一页展示数量的改变
    pager.appendEvent('pageSizeChange', function (pageSize) {
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
        }, function (p) {
            var jQcloseBtn = $(p.wrap).find(".popu-title .close-popu");
            jQcloseBtn.click(function () {
                p.close();
            });
            data.initFn && data.initFn(p);
        });
    };
    window.buildFloatLayer = buildFloatLayer;

    var page = {
        pageIndex: 1,
        pageSize: 10,
        init: function () {
            this.bindle();
            this.getList();
        },
        bindle: function () {
            var self = this;
            $("#seach_btn").click(function () {
                self.getList();
            });
        },
        removeTr: function (td, obj) {
            var self = this;
            ajax.delRecord(obj.id, function () {
                alert("删除成功");
                self.table.remove(obj);
            });
        },
        getList: function () {
            var that = this;
            var data = {
                currentpage: page.pageIndex,
                pagesize: page.pageSize
            };
            var key = $("#search_input").val().trim();
            if (key) {
                data.liftno = key;
            }
            ajax.getRecords(data, function (callback) {
                var obj = callback.objects;
                if (!obj) {
                    obj = {
                        pageCount: 1,
                        currentPage: page.pageInde,
                        entityList: []
                    };
                }
                pager.set(obj.pageCount, obj.currentPage, 6, page.pageSize);
                pager.write('#pager');
                that.buildTable(obj.entityList);
            });
        },
        buildTable: function (data) {
            this.table = treeTable(data, tableOption);
        }
    };

    page.init();
});