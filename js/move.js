/*
var defaultData = {
    // 开始拖动
    // startFn: function() {},
    // // 拖动结束
    // endFn: function() {},
    // // 拖动中
    // movingFn: function() {},
    // 移动触发事件的元素
    mouseoverNode: document,
    // 可拖拽的边界
    dragAreaNode: document.body,
    // 拖拽的元素
    dragList: [{d:ele,m:ele}],
    // dragType:all 所有,lengthways,level,不填就是所有
    // 最大偏移 
    maxOffset: {
        l: function(ele) {
            if ($(ele).hasClass("row_div")) {
                return -100;
            }
            return 0;
        },
        r: function(ele) {
            if ($(ele).hasClass("row_div")) {
                return 0;
            }
            return 375;
        }
    }
}
*/
var DragClass = (function() {
    //移动的构造函数
    function __DragClass(defaultData) {
        return new __DragClass.prototype.init(defaultData);
    };

    var eventGroup = (function() {
        var o = navigator.userAgent.toLowerCase();
        var n = o.indexOf("chrome") > -1 && (o.indexOf("windows") > -1 || o.indexOf("macintosh") > -1 || o.indexOf("linux") > -1) && o.indexOf("mobile") < 0 && o.indexOf("android") < 0;
        if ("ontouchstart" in window) {
            return {
                startevent: "touchstart",
                endevent: "touchend",
                moveevent: "touchmove",
                tapevent: "tap",
                scrollevent: "touchmove"
            };
        }
        return {
            startevent: "mousedown",
            endevent: "mouseup",
            moveevent: "mousemove",
            tapevent: "click",
            scrollevent: "scroll"
        };
    })();


    // jQuery 的拷贝
    __DragClass.extend = __DragClass.prototype.extend = function() {
        var src, copyIsArray, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        // 是否是深拷贝
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            // 设置参数起始位置
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        // 处理当参数不是object或者function的时候
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {};
        }
        // extend jQuery itself if only one argument is passed
        // 如果只有一个参数那么传入的参数添加到本身
        if (length === i) {
            target = this;
            --i;
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    // 如果需要深拷贝
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];

                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = __DragClass.extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        // 返回修改的对象
        return target;
    };

    __DragClass.extend({
        //获取鼠标的位置
        getMousePosition: function(e) {
            var e = e || window.event;
            var group = {
                mobile: function(e) {
                    var e = e || window.event;
                    var targetTouches = e.originalEvent.targetTouches[0];
                    return {
                        x: targetTouches.clientX,
                        y: targetTouches.clientY
                    }
                },
                pc: function() {
                    var e = e || window.event;
                    return {
                        x: e.clientX,
                        y: e.clientY
                    };
                }
            };

            if (e.originalEvent && e.originalEvent.targetTouches) {
                this.getMousePosition = group.mobile;
            } else {
                this.getMousePosition = group.pc;
            }

            return this.getMousePosition(e);
        },
        //获取元素位置（相对于dom）
        getDomPosition: function(ele) {
            var ele = ele;
            var offsetTop = ele.offsetTop;
            var offsetLeft = ele.offsetLeft;
            if (ele.offsetParent != null) {
                var offset = __DragClass.getPosition(ele.offsetParent);
                offsetTop += offset.y;
                offsetLeft += offset.x;
            }
            return {
                x: offsetLeft,
                y: offsetTop
            };
        },
        // 获取鼠标和元素的相对位置
        getMouseAndEleDifValue: function(e, ele) {
            // 准备开始移动的元素
            var target = ele || e.currentTarget;
            // 鼠标位置
            var mousePos = __DragClass.getMousePosition(e);

            //元素当前的position
            var cPosition = __DragClass.getCssPos(target);
            var pos = {};

            pos.dif_y = cPosition.top - mousePos.y;
            pos.dif_x = cPosition.left - mousePos.x;
            return pos;
        },
        // 获取当前的top值和left值
        getCssPos: function(target) {
            var pos = {};
            var top = target.offsetTop;
            var left = target.offsetLeft;

            pos.top = top ? top : 0;
            pos.left = left ? left : 0;

            return pos;
        },
        // 拖动元素可移动最大宽高
        getCanDragBound: function(dragEle, data) {
            var dragAreaNode = data.dragAreaNode;
            var maxOffset = data.maxOffset;
            dragAreaNode = dragAreaNode || document.body;
            var cPos = dragEle.getBoundingClientRect();
            var pPos = dragAreaNode.getBoundingClientRect();
            var cPosition = __DragClass.getCssPos(dragEle);
            var oPos = dragEle.originalPos;


            var posBound = {};
            //元素可移动的最大宽高
            var range = {
                l: (function() {
                    var ol = oPos.left;
                    if (maxOffset) {
                        var l = maxOffset.l;
                        if (typeof l === "function") {
                            l = l(dragEle);
                        }
                        return (ol + l);
                    }
                    return cPosition.left - cPos.left + pPos.left + parseInt($(dragAreaNode).css("border-left-width"));
                })(),
                r: (function() {
                    var ol = oPos.left;
                    if (maxOffset) {
                        var r = maxOffset.r;
                        if (typeof r === "function") {
                            r = r(dragEle);
                        }
                        return (ol + r);
                    }
                    return cPosition.left - cPos.right + pPos.right - parseInt($(dragAreaNode).css("border-right-width"));
                })(),
                t: (function() {
                    var ot = oPos.top;
                    if (maxOffset) {
                        var t = maxOffset.t;
                        if (typeof t === "function") {
                            t = t(dragEle);
                        }
                        return (ot + t);
                    }
                    return cPosition.top - cPos.top + pPos.top + parseInt($(dragAreaNode).css("border-top-width"));
                })(),
                b: (function() {
                    var ot = oPos.top;
                    if (maxOffset) {
                        var b = maxOffset.b;
                        if (typeof b === "function") {
                            b = b(dragEle);
                        }
                        return (ot + b);
                    }
                    return cPosition.top - cPos.bottom + pPos.bottom - parseInt($(dragAreaNode).css("border-bottom-width"));
                })()
            }

            posBound.minT = range.t;
            posBound.maxT = range.b;
            posBound.minL = range.l;
            posBound.maxL = range.r;
            return posBound;
        }
    });

    var fn = __DragClass.prototype;

    // 初始化
    fn.init = function(defaultData) {
        var self = this;
        this.defaultData = {
            // 开始拖动
            // startFn: function() {},
            // // 拖动结束
            // endFn: function() {},
            // // 拖动中
            // movingFn: function() {},
            // 移动触发事件的元素
            mouseoverNode: document,
            // 可拖拽的边界
            dragAreaNode: document.body,
            // 拖拽的元素
            dragList: [],
            // dragType:all 所有,lengthways,level,不填就是所有
        }

        __DragClass.extend(true, this.defaultData, defaultData);

        this.data = {
            //当前移动的元素
            curDragData: null,
            //替换的元素
            substituteEle: null,
            //可拖拽进去的box的信息
            boxsList: []
        };

        __DragClass.bindle.call(this);

        $(this.defaultData.mouseoverNode).on(eventGroup.moveevent, function(e) {
            self.moving(e);
        });
        $(this.defaultData.mouseoverNode).on(eventGroup.endevent, function(e) {
            self.endDrag(e);
        });
        return this;
    };
    fn.init.prototype = __DragClass.prototype;
    // 绑定事件
    __DragClass.bindle = fn.bindle = function(dragEleList, dragAreaNode) {
        var dragEleList = dragEleList;
        var self = this;
        var dragAreaNode = dragAreaNode;
        if (!dragEleList) {
            dragEleList = self.defaultData.dragList;
        }

        dragAreaNode = dragAreaNode || self.defaultData.dragAreaNode;
        console.log(dragAreaNode);
        dragEleList = jQuery.isArray(dragEleList) ? dragEleList : [dragEleList];


        for (var i = 0; i < dragEleList.length; i++) {
            var obj = dragEleList[i];
            var target;
            var dragNode;
            if (obj.nodeType != undefined) {
                target = obj;
                dragNode = obj;
            } else {
                target = obj.m;
                dragNode = obj.d;
            }

            target.originalPos = target.getBoundingClientRect();

            $(dragNode).on(eventGroup.startevent, (function(target) {
                return function(e) {
                    self.startDrag(e, target);
                }
            })(target));


        }
    };

    // 开始移动
    fn.startDrag = function(e, ele) {
        var e = e || window.event;
        var self = this;

        // 准备开始移动的元素
        var target = ele || e.currentTarget;

        var curDragData = self.data.curDragData = {};

        curDragData.dragEle = target;

        curDragData.difPos = __DragClass.getMouseAndEleDifValue(e, target);

        curDragData.bound = __DragClass.getCanDragBound(target, self.defaultData);


        if (self.defaultData.startFn) {
            self.defaultData.startFn(self, e);
        }
    };

    //移动中
    fn.moving = function(e) {
        var self = this;
        var curDragData = self.data.curDragData;

        if (!curDragData || !curDragData.dragEle) {
            return;
        }

        var dragEle = curDragData.dragEle;

        var curMousePos = __DragClass.getMousePosition(e);
        var top = curMousePos.y + curDragData.difPos.dif_y;
        var left = curMousePos.x + curDragData.difPos.dif_x;
        var bound = curDragData.bound;

        if (top < bound.minT) {
            top = bound.minT;
        } else if (top > bound.maxT) {
            top = bound.maxT;
        }

        if (left < bound.minL) {
            left = bound.minL;
        } else if (left > bound.maxL) {
            left = bound.maxL;
        }


        if (self.defaultData.dragType != "lengthways") {
            dragEle.style.left = left + "px";
        }
        if (self.defaultData.dragType != "level") {
            dragEle.style.top = top + "px";
        }

        if (self.defaultData.movingFn) {
            self.defaultData.movingFn(self, e);
        }
    };

    //移动结束
    fn.endDrag = function() {
        if (this.defaultData.endFn) {
            this.defaultData.endFn(self, e);
        }
        this.data.curDragData = null;
    };

    return __DragClass;
})();


// var ele1 = document.getElementById("div1");
// var ele2 = document.getElementById("div2");
// var data = {
//     dragAreaNode: document.getElementById("parent_div"),

//     // 拖拽的元素
//     dragList: ele1
// };
// var a = DragClass(data);

// a.bindle(ele2);
