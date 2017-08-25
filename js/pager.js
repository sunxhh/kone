//JS级别分页
dominator.Paging = function() {
    //分页点击事件
    function clickFun() {
        this[Array.prototype.shift.call(arguments)].apply(this, arguments);
        return false;
    }

    //首页 上一页 下一页 末页
    var Txt_first = "\u9996\u9875",
        Txt_previous = "\u4e0a\u4e00\u9875",
        Txt_next = "\u4e0b\u4e00\u9875",
        Txt_last = "\u672b\u9875",
        Txt_iptbtn = "跳转";

    //分页条中 输入框对输入内容的限制
    var numIpt = {
        onkeypress: function() {
            var event = dominator.getEvent();
            if (event.code == 13) {
                $(this).next().trigger("click");
                return false;
            }
            //alert(event.keyCode);
            if (event.code < 48 || event.code > 57) {
                event.preventDefault();
                return false;
            }
        },
        onkeyup: function() {
            var v = this.value.trim();
            if (v) {
                v = Math.abs(parseInt(v)) || 1;
                if (v != this.value) {
                    this.value = v;
                }
            }
        },
        onblur: function() {
            this.value = this.value * 1 || 1;
        }
    };

    //创建 动态的分页节点
    var Dev = {
            //首页
            first: function() {
                var txt = this.Txt_first || Txt_first,
                    d = this.$first = jQuery('<a href="javascript:;" hidefocus="true"><b>' + txt + '</b></a>')[0];
                d.onclick = clickFun.bind(this, "goFirst");
                d.title = txt;
                return d;
            },
            //上一页
            previous: function() {
                var txt = this.Txt_previous || Txt_previous,
                    d = this.$previous = jQuery('<a href="javascript:;" hidefocus="true"><b>' + txt + '</b></a>')[0];
                d.onclick = clickFun.bind(this, "goPrevious");
                d.title = txt;
                return d;
            },
            //下一页
            next: function() {
                var txt = this.Txt_next || Txt_next,
                    d = this.$next = jQuery('<a href="javascript:;" hidefocus="true"><b>' + txt + '</b></a>')[0];
                d.onclick = clickFun.bind(this, "goNext");
                d.title = txt;
                return d;
            },
            //末页
            last: function() {
                var txt = this.Txt_last || Txt_last,
                    d = this.$last = jQuery('<a href="javascript:;" hidefocus="true"><b>' + txt + '</b></a>')[0];
                d.onclick = clickFun.bind(this, "goLast");
                d.title = txt;
                return d;
            },
            //分页数字 Cot
            txtRank: function() {
                var t = jQuery('<span class="p-ENum"><span class="p-ENum2"></span></span>')[0];
                this.$txtRank = t.firstChild;
                return t;
            },
            //分页输入框
            txtIpt: function() {
                var txt = this.Txt_iptbtn || Txt_iptbtn,
                    t = jQuery('<span class="p-EIpt"><input type="text" value="' + this.$pCurr + '" /><a href="javascript:;" hidefocus="true" class="p-EBK"><b>' + txt + '</b></a></span>')[0],
                    ts = t.childNodes;
                this.$txtIpt = ts[0];
                dominator.extra(numIpt, ts[0]);
                ts[1].onclick = clickFun.bind(this, "goIpt");
                return t;
            },
            sizeselect: function() {
                var s = $('<span>每页</span>');
                var s1 = $('<select cus="no"><option value="10">10</option><option value="20">20</option><option value="50">50</option><option value="100">100</option></select>');
                var s2 = $('<span>条记录</span>');
                this.$pageSizeSelect = s1;
                var that = this;
                var frag = document.createDocumentFragment();
                if (this.$pageSize) {
                    frag.appendChild(s[0]);
                    frag.appendChild(s1[0]);
                    frag.appendChild(s2[0]);
                    s1[0].onchange = clickFun.bind(this, "changePageSize");
                }
                return frag;
            }
        },
        //刷新时调用的函数
        Ref = {
            //刷新第一页节点
            first: function() {
                this.$first.className = this.$pCurr > 1 ? "p-EBK p-EFir" : "p-EBK p-EFirDis";
            },
            //刷新上一页节点
            previous: function() {
                this.$previous.className = this.$pCurr > 1 ? "p-EBK p-EPre" : "p-EBK p-EPreDis";
            },
            //刷新下一页节点
            next: function() {
                this.$next.className = this.$pCurr < this.$pCount ? "p-EBK p-ENxt" : "p-EBK p-ENxtDis";
            },
            //刷新末页节点
            last: function() {
                this.$last.className = this.$pCurr < this.$pCount ? "p-EBK p-ELst" : "p-EBK p-ELstDis";
            },
            //刷新分页输入框显示的页码
            txtIpt: function() {
                this.$txtIpt.value = this.$pCurr;
            },
            //分页数字 刷新
            txtRank: function() {
                //先清空
                this.$txtRank.innerHTML = "";
                var startNo = 1,
                    endNo = this.$pCount,
                    minNo = parseInt(this.$pCount / 2) || 1,
                    endFlg = false;

                if (this.$pCount > this.$pRank) {
                    minNo = Math.max(Math.floor(this.$pRank / 2) - 1, 0) || 1;
                    startNo = (this.$pCurr - minNo) > 0 ? this.$pCurr - minNo : 1;
                    endNo = startNo + this.$pRank - 1;
                    if (endNo > this.$pCount) {
                        endNo = this.$pCount;
                        startNo = (endNo - this.$pRank) > 0 ? endNo - this.$pRank + 1 : 1;
                    }
                }

                if (this.$pCount - endNo > 0) {
                    endNo -= 2;
                    endFlg = true;
                }
                for (var i = startNo; i <= endNo; i += 1) {
                    if (i == this.$pCurr) {
                        jQuery('<a hidefocus="true" class="p-ESe">' + i + '</a>').appendTo(this.$txtRank);
                    } else {
                        jQuery('<a hidefocus="true" href="javascript:void(0);">' + i + '</a>').click(clickFun.bind(this, "goNav", i)).appendTo(this.$txtRank);
                    }
                }

                if (!endFlg) {
                    return;
                }
                jQuery('<b>..</b>').appendTo(this.$txtRank);
                jQuery('<a hidefocus="true" href="javascript:void(0);">' + this.$pCount + '</a>').click(clickFun.bind(this, "goLast")).appendTo(this.$txtRank);
            }
        };
    var Pg = dominator.extend(dominator.Event, {
        //pCount 总页数
        //pCurr 当前页码
        //pRank 分页条中，最多显示多少个页码
        set: function(pCount, pCurr, pRank, pageSize) {
            this.$pCount = pCount || this.$pCount || 0;
            this.$pCurr = pCurr || this.$pCurr || 1;
            this.$pRank = pRank || this.$pRank || 10;
            if (this.$pRank < 3) {
                this.$pRank = 3;
            }
            if (!this.written && pageSize) {
                this.$pageSize = pageSize;
            }
            return this;
        },
        //跳转首页
        goFirst: function() {
            this.goNav(1);
            return this;
        },
        //跳转 上一页
        goPrevious: function() {
            this.goNav(this.$pCurr - 1);
            return this;
        },
        //跳转下一页
        goNext: function() {
            this.goNav(this.$pCurr + 1);
            return this;
        },
        //跳转 末页
        goLast: function() {
            this.goNav(this.$pCount);
            return this;
        },
        //跳转固定页
        goNav: function(pgno, same) {
            pgno = pgno < 1 ? 1 : pgno > this.$pCount ? this.$pCount : pgno;
            if (!same && this.$pCurr == pgno) {
                return this;
            }
            this.$pCurr = pgno;
            if (this.fireEvent("change", pgno) === false) {
                return this;
            }
            this.goRef();
            return this;
        },
        //输入框定位页码
        goIpt: function() {
            var v = parseInt(this.$txtIpt.value.trim());
            if (isNaN(v) || v < 1) {
                alert("请输入正确的页码");
                this.$txtIpt.focus();
                return;
            }
            if (this.$pCount < v) {
                alert("已经超出最大页面，请重新输入");
                this.$txtIpt.focus();
                return;
            }
            this.goNav(v);
        },
        //刷新 指定项或者所有 的Element节点
        goRef: function(key) {
            if (key) {
                if (typeof Ref[key] == "function") {
                    Ref[key].call(this);
                }
                return this;
            }
            key = this.$deploy;
            for (var i = 0; i < key.length; i += 1) {
                if (typeof Ref[key[i]] == "function") {
                    Ref[key[i]].call(this);
                }
            }
            return this;
        },
        changePageSize: function() {
            var pageSize = this.$pageSizeSelect[0].value;
            this.$pageSize = parseInt(pageSize);
            if (this.fireEvent("pageSizeChange", this.$pageSize) === false) {
                return this;
            }
            this.$wCot.innerHTML = '';
            this.written = false;
            this.write(this.$wCot)
        },
        //第一次执行写入节点
        write: function(wCot, deploy) {
            if (this.written) {
                this.goRef();
                return;
            }
            wCot = this.$wCot = $(wCot)[0];
            if (deploy) {
                this.$deploy = deploy;
            }
            for (var i = 0; i < this.$deploy.length; i += 1) {
                if (typeof this.$deploy[i] == "string") {
                    wCot.appendChild(Dev[this.$deploy[i]].call(this));
                    Ref[this.$deploy[i]] && Ref[this.$deploy[i]].call(this);
                } else {
                    wCot.appendChild(this.$deploy[i].call(this));
                }
            }
            if (this.$pageSize) {
                this.$pageSizeSelect.val(this.$pageSize);
            }
            this.written = true;
            return this;
        }
    }, function() {
        this.$deploy = ["first", "previous", "txtRank", "next", "last", "txtIpt", "sizeselect"];
        if (arguments.length > 0) {
            this.set.apply(this, arguments);
        }
    });
    return Pg;
}();
