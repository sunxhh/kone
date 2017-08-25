/**
 * 异步操作
 * 

    var flow = new asy();
    flow.when(['A', 'B', 'C'], function() {
        // both A and B are done!!
        console.log(3)
        setTimeout(function() {
            console.log(flow.map[1].launch)
        }, 20)

    });

    flow.trigger('A', function() {
        console.log(1)
    });

    flow.trigger('B', function() {
        console.log(2)
    });


 */
var asy = (function() {
    var uid = 1;
    var __asy = function() {
        this.map = {};
        this.keyMap = {};
    };

    var indexOf = Array.prototype.indexOf || function(obj) {
        for (var i = 0, len = this.length; i < len; ++i) {
            if (this[i] === obj) return i;
        }
        return -1;
    };


    __asy.prototype = {
        when: function(keyList, callback) {
            var id = uid++;
            var self = this;
            var map = this.map;
            var keyMap = this.keyMap;
            keyList = typeof keyList == "string" ? [keyList] : keyList;
            map[id] = {
                launch: function() {
                    var len = this.keyList.length;
                    var keyMap = this.keyMap;
                    var count = 0;

                    for (var key in keyMap) count++;
                    if (count < len) return;

                    for (var key in keyMap) {
                        var obj = keyMap[key];
                        obj.fn && obj.fn();
                    }

                    callback && callback(this);
                    delete this.keyMap;
                    this.keyMap = {};

                },
                keyList: keyList.slice(0),
                keyMap: {}
            }

            for (var i = 0; i < keyList.length; i++) {
                var key = keyList[i];
                if (!keyMap[key]) keyMap[key] = [];
                keyMap[key].push(id);
            }
        },
        trigger: function(key, data, fn) {
            var keyMap = this.keyMap;
            var map = this.map;
            var list = keyMap[key];
            var index = 1;
            if (typeof arguments[index] == "function") {
                fn = arguments[index];
                data = undefined;
            }

            if (!list || list.length == 0) return;

            for (var i = 0; i < list.length; i++) {
                var cid = list[i];
                var cmap = map[cid];

                cmap.keyMap[key] = {
                    data: data,
                    fn: fn
                }
                cmap.launch();
            }
        },
        release: function() {

        }
    };

    return __asy;
})();
