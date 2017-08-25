// 全局变量
dominator = dominator || {};

// 扩充基础方法
(function() {
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(elt /*, from*/ ) {
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0)
                from += len;
            for (; from < len; from++) {
                if (from in this &&
                    this[from] === elt)
                    return from;
            }
            return -1;
        };
    }

    // 格式化时间
    Date.prototype.format = function(join) {
        var self = this;
        return (join || "YYYY-MM-DD").replace(/YYYY/g, this.getFullYear())
            .replace(/YY/g, String(this.getYear()).slice(-2))
            .replace(/MM/g, ("0" + (this.getMonth() + 1)).slice(-2))
            .replace(/M/g, this.getMonth() + 1)
            .replace(/DD/g, ("0" + this.getDate()).slice(-2))
            .replace(/D/g, this.getDate())
            .replace(/hh/g, ("0" + this.getHours()).slice(-2))
            .replace(/h/g, this.getHours())
            .replace(/mm/g, ("0" + this.getMinutes()).slice(-2))
            .replace(/m/g, this.getMinutes())
            .replace(/ss/g, ("0" + this.getSeconds()).slice(-2))
            .replace(/ll/g, this.getMilliseconds())
            .replace(/ww/g, function() {
                var list = ["日", "一", "二", "三", "四", "五", "六"];
                var day = self.getDay();
                return ("星期" + list[day])
            })
            .replace(/s/g, this.getSeconds());
    };

    // 格式化20170222T112630.837314时间
    var formatSQLDate = window.formatSQLDate = function(v) {
        var year = v.substring(0, 4);
        var month = v.substring(4, 6);
        var day = v.substring(6, 8);
        var hour = v.substring(9, 11);
        var minute = v.substring(11, 13);
        var second = v.substring(13, 15);
        var s = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
        var date = new Date(s);
        return date;
    };


    // 格式化毫秒
    var formatMsecond = window.formatMsecond = function(t) {
        t = parseInt(t / 1000);
        var list = [];
        var second = t % 60;
        list.push({
            v: second,
            u: "秒"
        });
        t = parseInt(t / 60);

        var minute = t % 60;
        list.push({
            v: minute,
            u: "分"
        });
        t = parseInt(t / 60);

        var hour = t % 24;
        list.push({
            v: hour,
            u: "时"
        });
        t = parseInt(t / 24);

        list.push({
            v: t,
            u: "天"
        });
        var r = "";
        for (var i = (list.length - 1); i >= 0; i--) {
            var obj = list[i];
            if (obj.v != 0) {
                r += (obj.v + obj.u);
            }
        }
        if (r == "") {
            r = "0秒";
        }
        return r;
    }

})();

//扩展jquery
void

function() {
    $.prototype.inputNumber = function() {
        $(this).on("keyup", function(e) {
            var tmptxt = $(this).val();
            $(this).val(tmptxt.replace(/\D|^0/g, ''));
        }).on("paste", function() {
            var tmptxt = $(this).val();
            $(this).val(tmptxt.replace(/\D|^0/g, ''));
        })
    }
}()

//扩展
void

function() {
    //扩展object
    //将参数添加到this里面
    function extra(k, v) {
        if (typeof k == "string") {
            this[k] = v;
            return this;
        }
        var ag = Array.prototype.slice.call(arguments),
            m, n;
        while (ag.length) {
            m = ag.shift();
            for (n in m) {
                this[n] = m[n];
            }
        }
        return this;
    };
    //简单的对 最后一个参数的扩展（将最后一个参数前面的参数属性扩展到最后一个参数上)
    //例如：
    //var c = dominator.extra(a,b,{}); 产生一个c，将包含a和b的所有属性，但不对a和b产生印象
    dominator.extra = function() {
        return extra.apply(Array.prototype.pop.call(arguments), arguments);
    };
    //扩展this
    function extend() {
        var ag = Array.prototype.slice.call(arguments),
            m;
        if (typeof this == "function") {
            this.prototype.extend = extra;
            this._inits_ = [];
            while (ag.length) {
                m = ag.shift();
                if (typeof m == "function") {
                    extra.call(this, m);
                    this._inits_.unshift(m);
                    m = m.prototype;
                }
                extra.call(this.prototype, m);
            }
        } else {
            while (m = ag.shift()) {
                if (typeof m == "function") {
                    try {
                        m = new m();
                    } catch (e) {
                        m = m.prototype;
                    }
                }
                extra.call(this, m);
            }
        }
        return this;
    };
    //继承与扩展
    //将前面的object扩展到最后一个函数的原型链上 用于类的继承
    //例如 ，下面讲到的 Ajax类就是继承了Event类
    dominator.extend = function() {
        return extend.apply(Array.prototype.pop.call(arguments), arguments);
    };
}();
// 获取距离当前固定时间的日期
var getTheDate = function(interval, number, idate) {
    number = parseInt(number);
    var date;
    if (typeof(idate) == "string") {
        date = idate.split(/\D/);
        eval("var date = new Date(" + date.join(",") + ")");
    }
    if (typeof(idate) == "object") {
        date = idate;
    }
    switch (interval) {
        case "y":
            date.setFullYear(date.getFullYear() + number);
            break;
        case "m":
            date.setMonth(date.getMonth() + number);
            break;
        case "d":
            date.setDate(date.getDate() + number);
            break;
        case "w":
            date.setDate(date.getDate() + 7 * number);
            break;
        case "h":
            date.setHours(date.getHours() + number);
            break;
        case "n":
            date.setMinutes(date.getMinutes() + number);
            break;
        case "s":
            date.setSeconds(date.getSeconds() + number);
            break;
        case "l":

            date = new Date(date.getTime() + number);
            //date.setMilliseconds(date.getMilliseconds() + number);
            break;
    }
    return date;
};

//阻止默认浏览器动作
function stopDefault(e) {
    //阻止默认浏览器动作(W3C)
    if (e && e.preventDefault)
        e.preventDefault();
    //IE中阻止函数器默认动作的方式
    else
        window.event.returnValue = false;
    return false;
};

//阻止冒泡
function stopPropagation(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        // IE's interface
        e.cancelBubble = true;
    }
};

//阻止浏览器默认动作以及阻止冒泡
function stopEvent(e) {
    stopPropagation(e);
    stopDefault(e);
};

//获取url中的参数
function getUrlRequest() {
    //获取url中"?"符后的字串
    var url = location.search;
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
};

// 是否是空值
function isEmpty(param) {
    if (param === undefined || param === null || param === false) {
        return true;
    }
    var type = typeof param;
    if (type === "string") {
        if (param.replace(/\s/g, "") == "") {
            return true;
        }
        return false;
    }

    if (type === "number") {
        if (isNaN(param)) {
            return true;
        }
        return false;
    }

    if (type === "object") {
        for (var id in param) {
            if (param.hasOwnProperty(id)) {
                return false;
            }
        }
        return true;
    }
    return false;
};

//获取键盘码
function getKeyboard(e) {
    var e = e || event;
    var currKey = e.keyCode || e.which || e.charCode;
    return currKey;
};

//生成元素
function createElement(type, name) {
    var element = null;
    try {
        //ie
        element = document.createElement('<' + type + ' type="' + name + '">');
    } catch (e) {
        // Probably failed because we’re not running on IE 
    }
    if (element == null) {
        element = document.createElement(type);
        element.type = name;
    }
    return element;
};

//一些正则验证
dominator.validateTool = {
    //验证是否是手机
    isPhone: function(val) {
        var phone = /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/;
        if (phone.test(val)) {
            return true;
        }
        return false;
    },
    isSignlessNum: function(val) {
        var phone = /^[0-9]*[1-9][0-9]*$/;
        if (phone.test(val)) {
            return true;
        }
        return false;
    }
};

//模板类
var tpl = {
    format: {},
    //获取模板字符串
    getTemplate: function(name) {
        return document.getElementById(name).innerHTML;
    },
    //向字符串中添加数据
    dataToHtml: function(data, tpl) {
        var that = this;
        var reg = /\{#(.*?)(?:\|([\w$]+?))*(?:\((.*?)\))?\}/g;
        var html = tpl.replace(reg, function(v, prop, fnName, params) {
            var propList = prop.split(".");
            var result = data[prop] || '';
            if (fnName) {
                var fn = that.format[fnName];
                if (fn) {
                    var _params = [result];
                    if (params) {
                        _params = _params.concat(params.split(','));
                    }
                    _params.push(data);
                    result = fn.apply(undefined, _params);
                }
            } else {
                result = data;
                for (var i = 0; i < propList.length; i++) {
                    result = result[propList[i]];
                }
            }
            return result == undefined ? "" : result;
        });
        return html;
    },
    tplMap: {},
    //获取有数据的模板
    getDataTpl: function(name, data) {
        var that = this,
            tplMap = that.tplMap,
            str = "";
        if (tplMap[name]) {
            str = tplMap[name];
        } else {
            str = that.getTemplate(name);
            tplMap[name] = str;
        }
        str = that.dataToHtml(data, str);
        return str;
    }
};


// 获取最大的z-index
dominator.getMaxZIndex = function(node) {
    var pnode = node ? $(node) : $(document.body);
    var children = pnode.children();
    var max = 0;
    var invalidVal = ['auto'];
    for (var i = 0; i < children.length; i++) {
        var zIndex = children.eq(i).css('z-index');
        if (!~invalidVal.indexOf(zIndex)) {
            zIndex = parseInt(zIndex, 10);
            if (zIndex > max) {
                max = zIndex;
            }
        }
    }
    return max;
};

// 创建mark
var createMark = function(pnode) {
    var div = document.createElement("div");
    div.className = 'mark-div';
    var maxZIndex = dominator.getMaxZIndex(pnode);
    maxZIndex += 10;
    $(div).css({
        "z-index": maxZIndex
    });
    return div;
};

// 打开或者关闭载入中的遮盖层
(function() {
    /**
     * 创建遮盖层
     * @param  wrap:wrap, 覆盖层的父元素
     */
    var loading = function(data) {
        return new loading.prototype.init(data);
    };

    loading.prototype = {
        // 创建
        openLoading: function() {
            var self = this;
            var jQwrap = self.jQwrap;
            var mark = createMark(self.jQwrap);
            var loadingGif = self.createLoadingGif();

            mark.appendChild(loadingGif);
            jQwrap.append(mark);
            self.mark = mark;
        },
        createLoadingGif: function() {
            var loadingGif = document.createElement("div");
            loadingGif.className = 'mark-loading';
            return loadingGif;
        },
        // 关闭
        closeLoading: function() {
            $(self.mark).remove();
        }
    };
    var fn = loading.prototype;
    fn.init = function(data) {
        data = data || {};
        this.data = data;
        this.jQwrap = data.wrap ? $(data.wrap) : $("body");
        this.openLoading();
    };
    fn.init.prototype = fn;


    dominator.loading = loading;
})();

// 设置居中
function setNodeCenter(dom, pnode) {
    if (!(dom && pnode)) {
        return;
    }
    var domSize = {
        y: dom.offsetHeight,
        x: dom.clientWidth
    };
    var pSize = {
        y: pnode.offsetHeight,
        x: pnode.clientWidth
    };

    dom.style.left = (pSize.x - domSize.x) / 2 + "px";
    dom.style.top = (pSize.y - domSize.y) / 2 + "px";
};

// 创建弹出浮层
var popu = (function() {
    var __popu = function(data) {
        return new __popu.prototype.init(data);
    };
    __popu.prototype = {
        open: function() {
            var self = this;
            var jQwrap = self.jQwrap;
            var mark = createMark(self.jQwrap);
            self.mark = mark;
            var popuDiv = self.createPopu();

            if (self.data.callbackFn) {
                self.data.callbackFn(self);
            }
            document.body.style.overflow = "hidden";
            jQwrap.append(mark);
            jQwrap.append(popuDiv);
            setNodeCenter(popuDiv, mark);
        },
        createPopu: function() {
            var self = this;
            var div = $($.parseHTML(self.data.tpl)).filter(".popu-div")[0];
            self.wrap = div;
            var maxZIndex = dominator.getMaxZIndex(self.jQwrap);
            maxZIndex += 10;
            $(div).css({
                "z-index": maxZIndex
            });
            return div;
        },
        close: function() {
            $(this.mark).remove();
            $(this.wrap).remove();
            document.body.style.overflow = "auto";
        }
    };
    var fn = __popu.prototype;
    fn.init = function(data) {
        this.data = data;
        this.jQwrap = $("body");
        this.open();
    };
    fn.init.prototype = fn;
    return __popu;
})();

//Dom加载完毕触发事件
void

function() {
    //domReady
    //在ready之前就放入缓存，在dom加载完成之后触发.
    var readyArr = [];

    var ready = function() {
        //dom ready函数
        for (var i = 0; i < readyArr.length; i += 1) {
            readyExe.apply(dominator, readyArr[i]);
        }
        ready = null;
        dominator.onReady = readyExe;
    };

    //获取参数，参数的第一个必须是函数，调用函数,第二个参数是一个对象会被当成第一个函数的this调用
    function readyExe() {
        var ag = Array.prototype.slice.call(arguments);
        setTimeout(function() {
            ag.shift().apply(ag.shift() || dominator, ag);
        });
        return dominator;
    };


    //加入DOMContentLoaded事件
    document.attachEvent ? document.attachEvent("onreadystatechange", function() {
        if (document.readyState == "complete" || document.readyState == "loaded") {
            ready();
        }
    }) : document.addEventListener("DOMContentLoaded", ready, false);

    //存入临时,当元素加载完成的时候触发
    dominator.onReady = function() {
        readyArr.push(arguments);
        return dominator;
    };
}();


//异步脚本加载器
/*
    异步脚本模块加载js采用队列模式
    脚本加载后回调，采用堆栈模式
    优先加载脚本，等脚本全部加载完毕后，在进行脚本回调函数出栈操作
*/

void

function() {
    // 形式[[1.js,2.js,3.js],]
    var jssList = [];
    // 是否载入完成可以操作
    var flag = 1;
    // 载入js
    var loadJs = function(url, callBack, charset) {
        var _url = url;
        if (_url.indexOf('?') == -1) {
            if (dominator.config && dominator.config.version) {
                _url = _url + '?' + dominator.config.version;
            }
        }
        var t = document.createElement("script");
        t.setAttribute("type", "text/javascript");
        //设置编码类型
        t.setAttribute("charset", charset || "utf-8");
        t.onreadystatechange = t.onload = t.onerror = function() {
            if (!t.readyState || t.readyState == 'loaded' || t.readyState == 'complete') {
                t.onreadystatechange = t.onload = t.onerror = null;
                t = null;
                //防止回调的时候，script还没执行完毕
                callBack && setTimeout(function() {
                    callBack();
                }, 10);
            }
        };

        t.src = _url;
        document.getElementsByTagName("head")[0].appendChild(t);
    };

    //载入需要加载的js
    function stackShift() {
        //如果存在待加载的js，优先加载js
        if (jssList.length) {
            //使用 shift 将前面的js先加载
            disorderJS(jssList.shift());
            return;
        }
        flag = 0;
    };

    //无序下载
    //多个js一起加载
    var disorderJS = function(urls) {
        var charset = "utf-8";
        if (typeof urls == "string") {
            loadJs(urls, stackShift, charset);
            return;
        }
        var loadedCount = 0;
        var len = urls.length;
        // 是否全部加载完成
        function loadedcallback() {
            if ((++loadedCount) == len) {
                stackShift();
            }
        };
        for (var i = 0; i < urls.length; i++) {
            loadJs(urls[i], loadedcallback, charset);
        }
    };

    //页面ready后，执行出栈操作
    dominator.onReady(function() {
        //出栈操作
        stackShift();
    }, dominator);

    //外部调用的
    dominator.require = function(urls) {
        if (typeof urls == "string") {
            jssList = urls.split(";");
            for (var i = 0; i < jssList.length; i++) {
                jssList[i] = jssList[i].split(",");
            }
        } else {
            jssList = urls;
        }
        //如果没有在进行中，启动出栈
        if (flag == 0) {
            flag = 1;
            stackShift();
        }
    };
}();

//函数继承
function extendFn(subClass, superClass) {
    var F = function() {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    subClass.superClass = superClass.prototype;
    if (superClass.prototype.constructor == Object.prototype.constructor) {
        superClass.prototype.constructor = superClass;
    }
}


//通用事件原型
//扩展自定义事件 适用于扩展在object或者类上
dominator.Event = dominator.extend({
    //加入事件
    appendEvent: function(type, fn) {
        this.__monitor || (this.__monitor = {});
        var monitor = this.__monitor;
        monitor[type] || (monitor[type] = []);
        monitor[type].push(fn);
        return this;
    },
    //加入单次事件
    appendEventOne: function(type, fn) {
        this.appendEvent(type, function() {
            fn.apply(this, arguments);
            this.removeEvent(type, arguments.callee);
        });
        return this;
    },
    //移除事件
    removeEvent: function(type, fn) {
        var monitor = this.__monitor;
        if (monitor) {
            if (fn) {
                var es = monitor[type];
                if (es) {
                    for (var i = 0; i < es.length; i += 1) {
                        if (es[i] == fn) {
                            es.splice(i, 1);
                            break;
                        }
                    }
                }
            } else {
                delete monitor[type];
            }
        }
        return this;
    },
    //触发事件
    fireEvent: function() {
        var type = Array.prototype.shift.call(arguments),
            es = this.__monitor ? this.__monitor[type] : null,
            flag, i;
        //返回false 阻止冒泡
        if (es) {
            var m;
            for (i = 0; i < es.length; i += 1) {
                m = es[i].apply(this, arguments);
                flag !== false && (flag = m);
            }
        }

        //以下是冒泡事件
        if (flag !== false) {
            es = this.constructor.__monitor ? this.constructor.__monitor[type] : null;
            if (es) {
                for (i = 0; i < es.length; i += 1) {
                    es[i].apply(this, arguments);
                }
            }
        }
        var t = "on" + type.replace(/^(\w)/, function() {
            return arguments[1].toUpperCase();
        });
        if (typeof this[t] == "function") {
            return this[t].apply(this, arguments);
        }
        return this;
    }
}, function() {});
dominator.Event.appendEvent = dominator.Event.prototype.appendEvent;
dominator.Event.removeEvent = dominator.Event.prototype.removeEvent;


//添加/移除 事件
dominator.appendEvent = document.addEventListener ? function(d, e, fn) {
    d.addEventListener(e, fn, false);
} : function(d, e, fn) {
    d.attachEvent("on" + e, fn);
};
dominator.removeEvent = document.removeEventListener ? function(d, e, fn) {
    d.removeEventListener(e, fn, false);
} : function(d, e, fn) {
    d.detachEvent("on" + e, fn);
};

// 存储操作
var storage = (function() {
    var _self = {
        save: function(name, data) {
            var type = typeof data;
            var val = data;
            if (type == "Object") {
                val = JSON.stringify(data);
            }
            window.localStorage.setItem(name, val);
        },
        get: function(name, isObject) {
            var val = window.localStorage.getItem(name);
            if (isObject) {
                val = JSON.parse(val);
            }
            return val;
        },
        remove: function(name) {
            window.localStorage.removeItem(name);
        },
        clear: function() {
            window.localStorage.clear();
        }
    };
    return _self;
})();

// 存储操作
var sessionstorage = (function() {
    var _self = {
        save: function(name, data) {
            var type = typeof data;
            var val = data;
            if (type == "object") {
                val = JSON.stringify(data);
            }
            window.sessionStorage.setItem(name, val);
        },
        get: function(name, isObject) {
            var val = window.sessionStorage.getItem(name);
            if (isObject) {
                val = JSON.parse(val);
            }
            return val;
        },
        remove: function(name) {
            window.sessionStorage.removeItem(name);
        },
        clear: function() {
            window.sessionStorage.clear();
        }
    };
    return _self;
})();

var configParam = (function() {
    // 所有的生成的参数对象放在这里
    var allConfigList = [];

    // 创建td
    var superTd = function() {};
    superTd.prototype = {
        // 获取值
        getVal: function() {
            var valDom = this.valDom;
            return $(valDom).val();
        },
        // 设置值
        setVal: function(val) {
            var valDom = this.valDom;
            var data = this.data;
            if (data.toFixedNumble) {
                if (typeof val == "number") {
                    val = val.toFixed(data.toFixedNumble);
                }
            }
            $(valDom).val(val);
        },
        common: function() {
            var td = this.td;
            var data = this.data;
            var td = this.td;
            var attribute = data.attribute;
            if (attribute) {
                for (var id in attribute) {
                    td.setAttribute(id, attribute[id]);
                }
            }
            if (data.isHide) {
                td.style.display = 'none';
            }
        }
    };

    // 文本td
    var textTd = function(data) {
        this.data = data;
        var td = this.td = document.createElement("td");

        var nameSpan = this.nameSpan = document.createElement("span");
        nameSpan.innerText = data.name;
        td.appendChild(nameSpan);

        var valDom = this.valDom = createElement("input", "text");
        td.appendChild(valDom);

        if (data.unit) {
            var unitSpan = document.createElement("span");
            unitSpan.innerHTML = data.unit;
            unitSpan.style.marginLeft = "10px";
            td.appendChild(unitSpan);
        }

        this.common();

    };
    extendFn(textTd, superTd);
    $.extend(textTd.prototype, {});

    // 下拉框td
    var selectTd = function(data) {
        this.data = data;
        var td = this.td = document.createElement("td");

        var nameSpan = this.nameSpan = document.createElement("span");
        nameSpan.innerText = data.name;
        td.appendChild(nameSpan);

        var valDom = this.valDom = createElement("select");
        td.appendChild(valDom);

        this.common();
    };
    extendFn(selectTd, superTd);
    $.extend(selectTd.prototype, {
        common: function() {
            var data = this.data;
            if (data.list && data.list.length > 0) {
                this.createOptionByList();
            } else {
                this.createOptionByVal();
            }
        },
        createOptionByList: function() {
            var data = this.data;
            var list = data.list;
            var valDom = this.valDom;
            for (var i = 0; i < list.length; i++) {
                var name = list[i];
                if (data.unit) {
                    name = list[i] + data.unit;
                }
                valDom.options.add(new Option(name, list[i]));
            }
            var defaultVal = data.defaultVal;
            if (defaultVal) {
                defaultVal = data.toFixedNumble ? defaultVal.toFixed(data.toFixedNumble) : defaultVal;
                $(valDom).val(defaultVal)
            }
        },
        createOptionByVal: function() {
            var data = this.data;
            var list = data.list;
            var min = data.min;
            var max = data.max;
            var interval = data.interval;
            var valDom = this.valDom;
            for (var i = min; i <= max;) {
                var val = i;
                if (data.toFixedNumble) {
                    if (typeof val == "number") {
                        val = val.toFixed(data.toFixedNumble);
                    }

                }
                valDom.options.add(new Option(val, val));
                i += interval;
            }

            var defaultVal = data.defaultVal;
            if (defaultVal != null && defaultVal != undefined) {
                defaultVal = data.toFixedNumble ? defaultVal.toFixed(data.toFixedNumble) : defaultVal;
                $(valDom).val(defaultVal)
            }
        }
    });

    // 多选框td
    var checkboxTd = function(data) {
        this.data = data;
        var td = this.td = document.createElement("td");
        var label = this.label = document.createElement("label");
        td.append(label);

        var valDom = this.valDom = createElement("input", "checkbox");
        label.appendChild(valDom);

        var nameSpan = this.nameSpan = document.createElement("span");
        nameSpan.innerText = data.name;
        label.appendChild(nameSpan);

        this.common();
    };
    extendFn(checkboxTd, superTd);
    $.extend(checkboxTd.prototype, {
        // 获取值
        getVal: function() {
            var valDom = this.valDom;
            if ($(valDom).prop("checked")) {
                return 1;
            }
            return 0;
        },
        // 设置值
        setVal: function(val) {
            var valDom = this.valDom;
            if (val == 1) {
                $(valDom).prop("checked", "checked");
            }
        }
    });

    // 单选框td
    var radioTd = function(data) {
        this.data = data;
        var list = this.list = [];
        var td = this.td = document.createElement("td");

        var nameSpan = document.createElement("span");
        nameSpan.innerText = data.name;
        td.appendChild(nameSpan);

        var dList = data.list;
        for (var i = 0; i < dList.length; i++) {
            this.create(dList[i]);
        }

        this.common();
    };
    extendFn(radioTd, superTd);
    $.extend(radioTd.prototype, {
        // 获取值
        getVal: function() {
            var list = this.list;
            for (var i = 0; i < list.length; i++) {
                var valDom = list[i];
                if ($(valDom).prop("checked")) {
                    var val = $(valDom).attr("rid");
                    return val;
                }
            }

        },
        // 设置值
        setVal: function(val) {
            var list = this.list;
            for (var i = 0; i < list.length; i++) {
                var valDom = list[i];
                if ($(valDom).attr("rid") == val) {
                    $(valDom).prop("checked", "checked");
                    break;
                }
            }
        },
        create: function(obj) {
            var td = this.td;
            var list = this.list;
            var label = document.createElement("label");
            td.appendChild(label);

            var valDom = createElement("input", "radio");
            valDom.setAttribute("name", obj.attName);
            valDom.setAttribute("rid", obj.val);
            label.appendChild(valDom);

            var nameSpan = document.createElement("span");
            nameSpan.innerText = obj.name;
            label.appendChild(nameSpan);

            list.push(valDom);
        }
    });

    // 生成一组td
    function createTdList(wrap, list) {
        $(wrap).empty();
        var tr;
        var oneList = [];
        var index = 0;
        for (var i = 0; i < list.length; i++) {
            var data = list[i];
            var tdObj;
            if (index == 0) {
                tr = document.createElement("tr");
                $(wrap).append(tr);
            }
            switch (data.type) {
                case "text":
                    tdObj = new textTd(data);
                    break;
                case "select":
                    tdObj = new selectTd(data);
                    break;
                case "checkbox":
                    tdObj = new checkboxTd(data);
                    break;
                case "radio":
                    tdObj = new radioTd(data);
                    break;
            }
            allConfigList.push(tdObj);
            oneList.push(tdObj);
            $(tr).append(tdObj.td);
            index++;
            if (data.attribute && data.attribute.colspan) {
                index = index + data.attribute.colspan - 1;
            }
            if (index >= 2) {
                index = 0;
            }
        }
        return oneList;
    }

    var __obj = {
        allConfigList: allConfigList
    };

    var __self = function(data) {
        for (var i = 0; i < data.length; i++) {
            var wrap = $(data[i].wrap);
            var list = data[i].list;
            createTdList(wrap, list);
        }

        return __obj;
    };

    return __self;
})();

// 设备控制
var deviceControlTypeMap = {
    "0": "扶梯上行",
    "1": "扶梯下行",
    "00": "扶梯上行",
    "01": "扶梯下行"
};

// 信号有效性
var validList = [{
    name: "运行速度下线值",
    type: "select",
    sendId: "speed",
    min: 0,
    max: 5,
    interval: 0.01,
    toFixedNumble: 2,
    defaultVal: 0.45,
    list: []
}, {
    name: "噪音下限值",
    type: "select",
    sendId: "noise",
    min: 20,
    max: 65,
    interval: 1,
    defaultVal: 50,
    list: []
}, {
    name: "振动下限值",
    type: "select",
    sendId: "vibration",
    min: 0,
    max: 30,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 1,
    list: []
}, {
    name: "电压下限值",
    type: "select",
    sendId: "voltage",
    min: 100,
    max: 300,
    interval: 1,
    toFixedNumble: null,
    defaultVal: 200,
    list: []
}, {
    name: "电流下限值",
    type: "select",
    sendId: "electricity",
    min: 0,
    max: 10,
    interval: 0.01,
    toFixedNumble: 2,
    defaultVal: 0.5,
    list: []
}, {
    name: "低于限值报警延时时间",
    type: "select",
    sendId: "alarmdelay",
    min: 0,
    max: 10,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 5,
    list: []
}, {
    name: "信号分析延时",
    type: "select",
    sendId: "signaldelay",
    min: 0,
    max: 10,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 1,
    list: []
}];

// 能耗等级
var levelList = [{
    name: "能耗A+++",
    type: "select",
    sendId: "energy4a",
    min: 0,
    max: 55,
    interval: 1,
    toFixedNumble: 0,
    defaultVal: 55,
    list: []
}, {
    name: "能耗A++",
    type: "select",
    sendId: "energy3a",
    min: 56,
    max: 60,
    interval: 1,
    toFixedNumble: 0,
    defaultVal: 60,
    list: []
}, {
    name: "能耗A+",
    type: "select",
    sendId: "energy2a",
    min: 61,
    max: 65,
    interval: 1,
    toFixedNumble: 0,
    defaultVal: 65,
    list: []
}, {
    name: "能耗A",
    type: "select",
    sendId: "energya",
    min: 66,
    max: 70,
    interval: 1,
    toFixedNumble: 0,
    defaultVal: 70,
    list: []
}, {
    name: "能耗B",
    type: "select",
    sendId: "energyb",
    min: 71,
    max: 80,
    interval: 1,
    toFixedNumble: 0,
    defaultVal: 80,
    list: []
}, {
    name: "能耗C",
    type: "select",
    sendId: "energyc",
    min: 81,
    max: 90,
    interval: 1,
    toFixedNumble: 0,
    defaultVal: 90,
    list: []
}, {
    name: "能耗D",
    type: "select",
    sendId: "energyd",
    min: 91,
    max: 100,
    interval: 1,
    toFixedNumble: 0,
    defaultVal: 100,
    list: []
}, {
    name: "能耗 offset",
    type: "select",
    sendId: "energyoffset",
    min: -30,
    max: 50,
    interval: 1,
    toFixedNumble: 0,
    defaultVal: 0,
    isHide: true,
    list: []
}, {
    name: "能耗报警功能",
    sendId: "energyalarmtype",
    type: "checkbox"
}, {
    name: "能耗报警值",
    type: "select",
    sendId: "energyalarm",
    min: 60,
    max: 200,
    interval: 1,
    toFixedNumble: 0,
    defaultVal: 100,
    list: []
}];


// 梯级振动评分
var vibrationList = [{
    name: "0.5m/s 梯级振动 AAA offset",
    type: "select",
    sendId: "stairvibration3aoffset50",
    min: 0,
    max: 50,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 7,
    list: []
}, {
    name: "0.5m/s 梯级振动 Max VR",
    type: "select",
    sendId: "stairvibrationmaxvr50",
    min: 5,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 35,
    list: []
}, {
    name: "0.5m/s 梯级振动 AAA Max Vib",
    type: "select",
    sendId: "stairvibration3amax50",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 30,
    list: []
}, {
    name: "0.5m/s 梯级振动 AA offset",
    type: "select",
    sendId: "stairvibration2aoffset50",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 10,
    list: []
}, {
    name: "0.5m/s 梯级振动 A offset",
    type: "select",
    sendId: "stairvibrationaoffset50",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 13,
    list: []
}, {
    name: "0.5m/s 梯级振动 U offset",
    type: "select",
    sendId: "stairvibrationuoffset50",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 16,
    list: []
}, {
    name: "0.65m/s 梯级振动 AAA offset",
    type: "select",
    sendId: "stairvibration3aoffset65",
    min: 0,
    max: 50,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 9,
    list: []
}, {
    name: "0.65m/s 梯级振动 Max VR",
    type: "select",
    sendId: "stairvibrationmaxvr65",
    min: 5,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 35,
    list: []
}, {
    name: "0.65m/s 梯级振动 AAA Max Vib",
    type: "select",
    sendId: "stairvibration3amax65",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 40,
    list: []
}, {
    name: "0.65m/s 梯级振动 AA offset",
    type: "select",
    sendId: "stairvibration2aoffset65",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 12,
    list: []
}, {
    name: "0.65m/s 梯级振动 A offset",
    type: "select",
    sendId: "stairvibrationaoffset65",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 13,
    list: []
}, {
    name: "0.65m/s 梯级振动 U offset",
    type: "select",
    sendId: "stairvibrationuoffset65",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 21,
    list: []
}, {
    name: "AAA Offset",
    type: "select",
    sendId: "offset3a",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 21,
    list: []
}, {
    name: "Max VR",
    type: "select",
    sendId: "maxvr",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 21,
    list: []
}, {
    name: "Max Vibration AAA",
    type: "select",
    sendId: "maxvibration3a",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 21,
    list: []
}, {
    name: "AA offset",
    type: "select",
    sendId: "offset2a",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 21,
    list: []
}, {
    name: "A offset",
    type: "select",
    sendId: "offseta",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 21,
    list: []
}, {
    name: "U offset",
    type: "select",
    sendId: "offsetu",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 21,
    list: []
}, {
    name: "梯级振动报警功能",
    type: "checkbox",
    sendId: "vibrationalarmtype"
}, {
    name: "梯级振动报警值",
    type: "select",
    sendId: "vibrationalarm",
    defaultVal: "U",
    list: ["AAA", "AA", "A", "U"]
}];

// 噪音评分
var noiseList = [{
    name: "0.5m/s 噪音 AAA offset",
    type: "select",
    sendId: "noise3aoffset50",
    min: 50,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 55,
    list: []
}, {
    name: "0.5m/s 噪音 Max VR",
    type: "select",
    sendId: "noisemaxvr50",
    min: 0,
    max: 50,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 30,
    list: []
}, {
    name: "0.5m/s 噪音 AAA Max Noise",
    type: "select",
    sendId: "noise3amax50",
    min: 50,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 56.5,
    list: []
}, {
    name: "0.5m/s 噪音 AA offset",
    type: "select",
    sendId: "noise2aoffset50",
    min: 50,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 57.5,
    list: []
}, {
    name: "0.5m/s 噪音 A offset",
    type: "select",
    sendId: "noiseaoffset50",
    min: 50,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 60.5,
    list: []
}, {
    name: "0.5m/s 噪音 U offset",
    type: "select",
    sendId: "noiseuoffset50",
    min: 50,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 63.5,
    list: []
}, {
    name: "0.65m/s 噪音 AAA offset",
    type: "select",
    sendId: "noise3aoffset65",
    min: 50,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 57.5,
    list: []
}, {
    name: "0.65m/s 噪音 Max VR",
    type: "select",
    sendId: "noisemaxvr65",
    min: 0,
    max: 50,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 30,
    list: []
}, {
    name: "0.65m/s 噪音 AAA Max Noise",
    type: "select",
    sendId: "noise3amax65",
    min: 50,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 59.5,
    list: []
}, {
    name: "0.65m/s 噪音 AA offset",
    type: "select",
    sendId: "noise2aoffset65",
    min: 50,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 60.5,
    list: []
}, {
    name: "0.65m/s 噪音 A offset",
    type: "select",
    sendId: "noiseaoffset65",
    min: 50,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 63.5,
    list: []
}, {
    name: "0.65m/s 噪音 U offset",
    type: "select",
    sendId: "noiseuoffset65",
    min: 50,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: 66.5,
    list: []
}, {
    name: "噪音报警功能",
    type: "checkbox",
    sendId: "noisealarmtype"
}, {
    name: "噪音报警值",
    type: "select",
    sendId: "noisealarm",
    defaultVal: "U",
    list: ["AAA", "AA", "A", "U"]
}];

//   扶手振动评分
var railVibrationList = [{
    name: "0.5m/s 扶手振动 AAA offset",
    type: "select",
    sendId: "handrailvibration3aoffset50",
    min: 0,
    max: 50,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "0.5m/s 扶手振动 Max VR",
    type: "select",
    sendId: "handrailvibrationmaxvr50",
    min: 5,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "0.5m/s 扶手振动 AAA Max Vib",
    type: "select",
    sendId: "handrailvibration3amax50",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "0.5m/s 扶手振动 AA offset",
    type: "select",
    sendId: "handrailvibration2aoffset50",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "0.5m/s 扶手振动 A offset",
    type: "select",
    sendId: "handrailvibrationaoffset50",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "0.5m/s 扶手振动 U offset",
    type: "select",
    sendId: "handrailvibrationuoffset50",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "0.65m/s 扶手振动 AAA offset",
    type: "select",
    sendId: "handrailvibration3aoffset65",
    min: 0,
    max: 50,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "0.65m/s 扶手振动 Max VR",
    type: "select",
    sendId: "handrailvibrationmaxvr65",
    min: 5,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "0.65m/s 扶手振动 AAA Max Vib",
    type: "select",
    sendId: "handrailvibration3amax65",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "0.65m/s 扶手振动 AA offset",
    type: "select",
    sendId: "handrailvibration2aoffset65",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "0.65m/s 扶手振动 A offset",
    type: "select",
    sendId: "handrailvibrationaoffset65",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "0.65m/s 扶手振动 U offset",
    type: "select",
    sendId: "handrailvibrationuoffset65",
    min: 0,
    max: 100,
    interval: 0.1,
    toFixedNumble: 1,
    defaultVal: null,
    list: []
}, {
    name: "扶手振动报警功能",
    type: "checkbox",
    sendId: "handrailvibrationalarmtype"
}, {
    name: "扶手振动报警值",
    type: "select",
    sendId: "handrailvibrationalarm",
    defaultVal: "U",
    list: ["AAA", "AA", "A", "U"]
}];

// 被测电梯参数
var escalatorParam = {
    liftno: {
        name: "梯号",
        type: "text",
        sendId: "liftno",
        checkData: function(val) {
            var errorText = "梯号请输入7-8位数字串";
            if (!dominator.validateTool.isSignlessNum(val)) {
                this.errorText = errorText;
                return false;
            }
            if (val.length != 7 && val.length != 8) {
                this.errorText = errorText;
                return false;
            }
            return true;
        }
    },
    gearboxtype: {
        name: "减速箱类型",
        type: "select",
        sendId: "gearboxtype",
        defaultVal: "蜗轮蜗杆",
        list: ["蜗轮蜗杆", "斜齿轮", "GOSD"]
    },
    productline: {
        name: "梯型",
        type: "select",
        sendId: "productline",
        defaultVal: "TM110",
        list: ["TM110", "TM120", "TM140", "TM115", "TM165"]
    },
    height: {
        name: "提升高度",
        type: "text",
        sendId: "height",
        unit: "m",
        checkData: function(val) {
            var errorText = "提升高度请输入0-100的数字";
            if (parseFloat(val) > 100 || parseFloat(val) < 0 || isNaN(parseFloat(val))) {
                this.errorText = errorText;
                return false;
            }
            return true;
        }
    },
    motortype: {
        name: "马达类型",
        type: "select",
        sendId: "motortype",
        defaultVal: "普通 6 极马达",
        list: ["普通 6 极马达", "IE3 高效马达"]
    },
    motorpower: {
        name: "马达功率",
        type: "select",
        sendId: "motorpower",
        defaultVal: 5,
        list: ["5.5KW", "7.5KW", "9.2KW", "11KW", "15KW", "22KW"]
    },
    speed: {
        name: "速度",
        type: "select",
        sendId: "speed",
        defaultVal: 0.5,
        unit: "m/s",
        list: [0.5, 0.65, 0.75]
    },
    runmode: {
        name: "运行模式",
        type: "select",
        sendId: "runmode",
        defaultVal: "星三角",
        list: ["星三角", '智能变频', '全变频']
    },
    inclination: {
        name: "倾斜角度",
        type: "select",
        sendId: "inclination",
        defaultVal: 30,
        unit: "°",
        list: [27.5, 30, 35]
    },
    handstrapdrivertype: {
        name: "扶手驱动类型",
        type: "select",
        sendId: "handstrapdrivertype",
        defaultVal: "摩擦轮驱动",
        list: ["摩擦轮驱动", "端部驱动"]
    },
    width: {
        name: "梯级宽度",
        type: "select",
        sendId: "width",
        defaultVal: "1000mm",
        list: ['600mm', '800mm', '1000mm']
    },
    handstraptype: {
        name: "扶手带类型",
        type: "select",
        sendId: "handstraptype",
        defaultVal: "摩擦轮驱动",
        list: ['C 型带', 'V 型带']
    },
    hashandrail: {
        name: "被测电梯是否包含扶手带",
        type: "radio",
        sendId: "hashandrail",
        defaultVal: 1,
        list: [{
            val: 1,
            name: "包含"
        }, {
            val: 0,
            name: "不包含"
        }]
    }
};

var hashandrailMap = {
    "1": "包含",
    "0": "不包含"
}

/**
 * 101 左扶手带振动
 * 102 右扶手带振动
 * 103 梯级振动
 * 104 上梳齿板振动
 * 105 下梳齿板振动
 * 201 左扶手带速度
 * 202 右扶手带速度
 * 301 下部噪音
 * 302 中部噪音
 * 303 上部噪音
 * 401 能耗
 */

var testDeviceTypeMap = {
    "1": "vib",
    "2": "speed",
    "3": "noise",
    "4": "eng"
};

var testDeviceList = [{
    unitname: "左扶手带振动",
    lifttype: "101",
    commandtype: "03",
    command: "00"
}, {
    unitname: "右扶手带振动",
    lifttype: "102",
    commandtype: "03",
    command: "00"
}, {
    unitname: "梯级振动",
    lifttype: "103",
    commandtype: "03",
    command: "00"
}, {
    unitname: "上梳齿板振动",
    lifttype: "104",
    commandtype: "03",
    command: "00"
}, {
    unitname: "下梳齿板振动",
    lifttype: "105",
    commandtype: "03",
    command: "00"
}, {
    unitname: "左扶手带速度",
    lifttype: "201",
    commandtype: "03",
    command: "02"
}, {
    unitname: "右扶手带速度",
    lifttype: "202",
    commandtype: "03",
    command: "02"
}, {
    unitname: "扶手带速度",
    lifttype: "203",
    commandtype: "03",
    command: "02"
}, {
    unitname: "下部噪音",
    lifttype: "301",
    commandtype: "03",
    command: "03"
}, {
    unitname: "中部噪音",
    lifttype: "302",
    commandtype: "03",
    command: "03"
}, {
    unitname: "上部噪音",
    lifttype: "303",
    commandtype: "03",
    command: "03"
}, {
    unitname: "能耗",
    lifttype: "401",
    commandtype: "03",
    command: "01"
}];

// 单位
var yAxisUnit = {
    "2": {
        name: "速度",
        unit: "m/s"
    },
    "1": {
        name: "振动",
        unit: "g"
    },
    "3": {
        name: "噪音",
        unit: "dB(A)"
    },
    "5": {
        name: "电流",
        unit: "A"
    },
    "4": {
        name: "功率",
        unit: "KW"
    }
};

// 
var liftTypeMap = {
    1: "vib",
    2: "speed",
    3: "noise",
    4: "eng"
};

// y轴的格式化
var yAxisLabel = {
    "2": {
        labels: {
            format: '{value}m/s',
        },
        title: {
            text: '速度',
        },
    },
    "1": {
        labels: {
            format: '{value}g',
        },
        title: {
            text: '振动',
        },
    },
    "3": {
        labels: {
            format: '{value}dB(A)',
        },
        title: {
            text: '噪音',
        },
    },
    "5": {
        labels: {
            format: '{value}A',
        },
        title: {
            text: '电流',
        },
    },
    "4": {
        labels: {
            format: '{value}KW',
        },
        title: {
            text: '功率',
        }
    }
};

// 格式化图表数据
var formatChartData = function(list, type) {

    // 格式化
    var format = function(list) {
        var map = this.map,
            chartData = {
                yAxis: this.yAxis
            },
            rList = [];

        if (typeof list[0] == "object") {
            for (var i = 0; i < list.length; i++) {
                var cData = list[i];
                for (var id in map) {
                    var val = cData[id];
                    val = parseFloat(val);
                    if (isNaN(val)) {
                        val = 0;
                    }

                    switch (map[id].yType) {
                        case '5':
                            val = dealChartData.totalPower(val);
                            break;
                        case '3':
                            val = dealChartData.noise(val);
                            break;
                        case '4':
                            val = dealChartData.current(val);
                            break;
                    }

                    map[id].data.push(val)
                }
            }

            for (var id in map) {
                rList.push(map[id]);
            }
        } else {
            for (var i = 0; i < list.length; i++) {
                var cData = list[i];
                var val = cData;
                val = parseFloat(val);
                if (isNaN(val)) {
                    val = 0;
                }
                if (map["Value"]) {
                    map["Value"].data.push(val)
                } else {
                    map["Data_x"].data.push(val)
                }

            }
            if (map["Value"]) {
                rList.push(map["Value"]);
            } else {
                rList.push(map["Data_x"]);
            }
        }
        chartData.series = rList;
        return chartData;
    }

    // 格式化方法
    var formatTypeMap = {
        eng: {
            map: {
                // "A_current": {
                //     type: 'line',
                //     lineWidth: 1,
                //     yType: "4",
                //     marker: {
                //         enabled: false
                //     },
                //     name: "A相电流",
                //     lineWidth: 1,
                //     yAxis: 0,
                //     animation: false, // 关闭生成动画
                //     data: []
                // },
                // "B_current": {
                //     type: 'line',
                //     lineWidth: 1,
                //     yType: "4",
                //     marker: {
                //         enabled: false
                //     },
                //     name: "B相电流",
                //     lineWidth: 1,
                //     yAxis: 0,
                //     animation: false, // 关闭生成动画
                //     data: []
                // },
                // "C_current": {
                //     type: 'line',
                //     lineWidth: 1,
                //     yType: "4",
                //     marker: {
                //         enabled: false
                //     },
                //     name: "C相电流",
                //     lineWidth: 1,
                //     yAxis: 0,
                //     animation: false, // 关闭生成动画
                //     data: []
                // },
                "Total_active_power": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "5",
                    marker: {
                        enabled: false
                    },
                    name: "总有功功率",
                    lineWidth: 1,
                    yAxis: 0,
                    color: '#FF0000',
                    animation: false, // 关闭生成动画
                    data: []
                }
            },
            yAxis: [yAxisLabel["4"]]
        },
        speed: {
            map: {
                "Value": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "1",
                    marker: {
                        enabled: false
                    },
                    name: "速度",
                    lineWidth: 1,
                    yAxis: 0,
                    color: 'rgb(20,68,106)',
                    animation: false, // 关闭生成动画
                    data: []
                }
            },
            yAxis: [yAxisLabel["2"]]
        },
        noise: {
            map: {
                "Value": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "3",
                    marker: {
                        enabled: false
                    },
                    name: "噪音",
                    lineWidth: 1,
                    yAxis: 0,
                    color: 'rgb(29,191,151)',
                    animation: false, // 关闭生成动画
                    data: []
                }
            },
            yAxis: [yAxisLabel["3"]]
        },
        vib: {
            map: {
                "Data_x": {
                    type: 'line',
                    lineWidth: 1,
                    yType: "2",
                    marker: {
                        enabled: false
                    },
                    name: "振动",
                    lineWidth: 1,
                    yAxis: 0,
                    color: 'rgb(230,155,3)',
                    animation: false, // 关闭生成动画
                    data: []
                }
            },
            yAxis: [yAxisLabel["1"]]
        }
    };

    var arg = [].slice.call(arguments);

    return format.apply(formatTypeMap[type], arg);
};



// 需要到位信号控制的lifttype
var needSign = ["101", "102", "103"];

// 弹出层
function buildFloatLayer(data, tplId) {
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
    }, tplId);
};



// 处理图表数据
var dealChartData = {
    noise: function(val) {
        if (isEmpty(val)) {
            val = 0;
        }
        return val = val / 10;
    },
    totalPower: function(val) {
        if (isEmpty(val) || val == 0) {
            val = 0;
        }
        if(val == 0){
            return 0;
        }
        return (65535 - val) / 100;
    },
    current: function(val) {
        if (isEmpty(val)) {
            val = 0;
        }
        return val / 100;
    },
    voltage: function(val) {
        if (isEmpty(val)) {
            val = 0;
        }
        return val / 10;
    }
};

// 测试时间基础秒
var testTimeUnit = 60;
