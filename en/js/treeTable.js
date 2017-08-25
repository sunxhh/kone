var treeTable = function(arr,opt){
    var defaultOption = {
        id : 'functonId',//条目主键
        pid:'parentId',//父条目主键
        table :'',//table对象
        head :[//表头列表
            /**
            * width 宽度，可以不配置
            * title 表头名
            * key 表内容的主键
            * pucker 是否在这一列显示折叠按钮，可以都不配置，配置的话最好只配一个
            * row 列合并，合并几列
            * from 从第几行开始合并
            * puckerClick 点击折叠的时候回调函数
            * className 
            */
            {width:10,title:'aaa',key:'aaa',pucker:true,puckerClick:function(){},row:3,from:1,className:''}
        ],
        /**表内容配置
        * 可以不配这个选项，默认显示字段内容
        * key1为head里面的key的值，表示需要这一列特殊显示
        * 可以为function，自定义任何内容
        * 可以为字符串
        * 
        */
        body : {
            /**
            * 若为function，可用参数分别为：
            * td 当前单元格
            * data 当前单元格的数据
            * that treeTable本身
            * objarr 经过加工后的数据对象，将传进来的数组转换成Object，以id为key，本身为value
            */
            key1 : function(td,data,that,objarr){},
            key2 : '<a href="#">aaa</a>'
        },
        openClass:'toggle toggle-',//折叠按钮打开后的样式
        closeClass:'toggle toggle\+',//折叠按钮折叠后的样式
        /*
        * @tr 该tr
        * @td 该td
        * @obj 该行对应的数据
        * @objarr 该表格对应的数据对象，以id为key
        *
        */
        callback : function(tr,td,obj,objarr){//每个td创建后的回调函数
            
        },
        finalCallBack : function(){//表格创建后的回调函数
            
        },
        treeArrSort : undefined,//树形结构排序
        childSort : undefined,//子元素排序
        defaultShow : function(data){return true;},//默认折叠按钮全部打开，若有不希望打开的重新写defaultShow，判断data，并return false；
        rowSpanBorder : '1px solid #EFEFEF',//当有需要合并列的时候，单元格的左右边框样式
        byAjax : false,//是否通过ajax取子元素，设true的话只显示根目录，再配置puckerClick来获取数据并重新生成表格
        foot : false,//表格脚部,为一个object数据，格式与表内具体数据一致,
        hideHead : false,
        /*
        * @head 哪一列
        * @obj 该行对应的数据
        */
        createTd : function(head,obj){return 0;}//是否创建这个td
    }
    opt = dominator.extra(opt,defaultOption); //配合合并
    var len = opt.head.length;//获取表格长度
    var head = opt.head;
    var dlen = arr.length;//获取数据长度
    var _table = opt.table;
    var indexKey = opt.id,pIndexKey = opt.pid; //数据本身主键名，已经父元素的主键名
    var puckIndex = false; // 存放需要折叠的列的index，默认false
    /**
    * objarr 存放KEY-VALUE对，便于获取数据
    * treearr 存放最终的树形结构数据
    * rowTdCreate 存放需要合并列的tr的信息有index跟created2个值，分别存放第几列与该行这一列是否可能需要合并
    * newarr 根据树形结构从上到下排序的对象数组
    * puckerKey 存放需要折叠子元素的key值
    */
    var objarr = {},treearr = {},rowTdCreate = {},newarr = [],puckerKey='',_treeArr=[];
    /**
    * 将数组数据转化为对象与tree结构
    */
    function seriable(arr){
        objarr = {},treearr = {},newarr = [],_treeArr=[];
        var dlen  = arr.length;
        //获取需要折叠子元素的索引与key值
        for(var i=0;i<len;i++){
            if(opt.head[i].pucker){
                puckIndex = i;
                puckerKey = opt.head[i].key;
            }
            if(opt.head[i].row){
                rowTdCreate[opt.head[i].key] = {};
                rowTdCreate[opt.head[i].key].created = false;
                rowTdCreate[opt.head[i].key].index = i;
            }
        }
        //给每个元素添加child属性
        //以id为key，本身为值添加到objarr中
        for(var i=0;i<dlen;i++){
            if(!opt.byAjax){
                arr[i].child = arr[i].child || [];
            }else{
                arr[i].child = arr[i].child !== undefined ? arr[i].child : [];
            }
            objarr[arr[i][indexKey]+''] = arr[i];
        }
        //将每个元素的子元素添加到child属性中
        for(var i=0;i<dlen;i++){
            if(arr[i][pIndexKey]){
                if(objarr[arr[i][pIndexKey]]){
                    objarr[arr[i][pIndexKey]].child.length!==undefined && (objarr[arr[i][pIndexKey]].child.push(arr[i]));
                }
            }
        }
        //最终生成树形obj，并给元素添加level属性
        for(var i=0;i<dlen;i++){
            opt.childSort && arr[i].child.length && (arr[i].child.sort(opt.childSort));
            if(!arr[i][pIndexKey] || !objarr[arr[i][pIndexKey]]){
                arr[i]._level = 0;
                treearr[arr[i][indexKey]+''] = arr[i];
                _treeArr.push(arr[i]);
            }else{
                arr[i]._level  = 0;
                var parent = objarr[arr[i][pIndexKey]];
                while(parent){
                    arr[i]._level ++;
                    parent = objarr[parent[pIndexKey]];
                }
            }
        }
    }
    seriable(arr);
    /**
    * 获取元素默认CSS
    * @oElm 需要获取样式的dom
    * @strCssRule 需要获取样式的名字
    */
    function getStyle(oElm, strCssRule){
        var strValue = "";
        if(document.defaultView && document.defaultView.getComputedStyle){
            strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
        }else if(oElm.currentStyle){
            strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
                return p1.toUpperCase();
            });
            strValue = oElm.currentStyle[strCssRule];
        }
        return strValue;
    }
    /**
    * 创建元素方法
    * @tag html标签名
    */
    function create(tag){
        return document.createElement(tag);
    }
    /**
    * 创建表格中的行
    * @data 该行的数据
    * @tbody 最终放入的tbody
    */
    function createChild(data,tbody){
        var that = this;
        
        if(data.ISBLANKOBJECT!==true){
            newarr.push(data);
            var tr = create('tr');
            for(var j=0;j<len;j++){
                if(opt.createTd(data,head[j]) == -1){
                    continue;
                }
                head[j].from = head[j].from === undefined ? 0 : head[j].from;
                //根据rowTdCreate[head[j].key]得知如果该行需要合并
                // rowTdCreate[head[j].key].created并且已经合并
                //newarr.length<=head[j].row+head[j].from 并且当前行小于需要合并的行数，则此行此列不创建td
                if(rowTdCreate[head[j].key] && rowTdCreate[head[j].key].created && (newarr.length<=head[j].row+head[j].from)){
                    continue;
                }
                var td = create('td');
                //判断该行该列是不是需要添加rowspan属性
                if(rowTdCreate[head[j].key]  && head[j].row && !rowTdCreate[head[j].key].created && (newarr.length>head[j].from)){
                    td.rowSpan = head[j].row;
                    td.setAttribute('rowspans',true);
                    td.style.background = '#FFF';
                    rowTdCreate[head[j].key].created = true;
                    td.style.borderLeft = opt.rowSpanBorder;
                }
                if(opt.createTd(data,head[j]) >= 1){
                    td.rowSpan = opt.createTd(data,head[j]);
                    td.style.background = '#FFF';
                    td.style.borderLeft = opt.rowSpanBorder;
                }
                //设置缩进
                var level = data._level , _padd;
                if(puckIndex!==false){
                    var pid = data[pIndexKey],hasBlank = false,rlevel = 0;
                    while(pid && objarr[pid]){
                        if(objarr[pid].ISBLANKOBJECT){
                            !hasBlank && (rlevel = objarr[pid]._level);
                            hasBlank = true;
                        }
                        pid = objarr[pid][pIndexKey];
                    }
                    _padd = data.child.length==0 ? 17 : 0;
                    hasBlank && (level = level - rlevel - 1);
                    j==puckIndex && (td.style.paddingLeft = level==0 ? (10+_padd)+'px' :level*(10+17)+10+_padd+'px');
                }
                var key = head[j].key;
                puckerKey == key && (td.className = 'left');
                //创建td内元素
                if(head[j].pucker){
                    if(data.child.length>0 || data.child === true){
                        var span = create('span');
                        span.setAttribute('fid',data[indexKey]);
                        //span.innerHTML = '-';
                        td.appendChild(span);
                        span.className = data.child===true ? opt.closeClass : opt.openClass;
                        span.onclick = (function(j){
                            return function(){
                                var cn = this.className;
                                var clen = data.child.length;
                                if(cn == opt.openClass){
                                    if(opt.byAjax && data.child === true){
                                        head[j].puckerClick && head[j].puckerClick('close');
                                    }
                                    that.hide(data[indexKey]);
                                }else{
                                    if(opt.byAjax && data.child === true){
                                        head[j].puckerClick && head[j].puckerClick('open',data,function(childs){
                                            that.createChildAfterAjax(tr,data[indexKey],childs);
                                        });
                                    }
                                    that.show(data[indexKey]);
                                }
                            }
                        })(j);
                        data.puckDom = span;
                    }
                }
                if(opt.body[key]){
                    typeof opt.body[key] == 'function' ? opt.body[key](td,data,that,objarr,tr,arguments[2]) : td.innerHTML += opt.body[key] || '';
                }else{
                    var span = create('span');
                    span.innerHTML = data[key]===undefined ? '' : data[key];
                    td.appendChild(span);
                }
                tr.appendChild(td);
            }
            data.dom = tr;
            tbody.appendChild(tr);
            if(data.child===true){
                return;
            }
            opt.callback && opt.callback(tr,td,data,objarr);
        }
        if(data.child.length>0){
            for(var i=0,clen=data.child.length;i<clen;i++){
                arguments.callee.call(that,data.child[i],tbody,i);
            }
        }
    }
    /**
    * 目标元素后面插入新元素
    * @newElement 新元素
    * @targetElement 目标元素
    */
    function insertAfter(newElement, targetElement){
        var parent = targetElement.parentNode;
        if (parent.lastChild == targetElement) {
            // 如果最后的节点是目标元素，则直接添加。因为默认是最后
            parent.appendChild(newElement);
        }
        else {
            parent.insertBefore(newElement, targetElement.nextSibling);
            //如果不是，则插入在目标元素的下一个兄弟节点 的前面。也就是目标元素的后面
        }
    }
    var table = function(){
        this.createTable();
    }
    table.prototype.show = function(pid,pop){
        if(pid){
            var child = objarr[pid].child,len=child.length;
            objarr[pid].puckDom && (objarr[pid].puckDom.className = opt.openClass);
            // objarr[pid].puckDom.innerHTML = '-'
            for(var i=0;i<len;i++){
                child[i].dom  && (child[i].dom.style.display = '');
                if(child[i].ISBLANKOBJECT===true){
                    this.show(child[i][indexKey]);
                    continue;
                }
                if(child[i].child.length){
                    child[i].puckDom && (child[i].puckDom.className == opt.openClass) && this.show(child[i][indexKey]);
                }
            }
        }else{
            for(var i=0;i<dlen;i++){
                this.show(arr[i][indexKey]);
            }
        }
    }
    table.prototype.hide = function(pid,pop){
        if(pid){
            var child = objarr[pid].child,len=child.length;
            var pDom = objarr[pid].puckDom;
            if(!pop){
                // pDom.innerHTML = '+';
                pDom && (pDom.className = opt.closeClass);
            }
            for(var i=0;i<len;i++){
                child[i].dom && (child[i].dom.style.display = 'none');
                if(child[i].child.length){
                    this.hide(child[i][indexKey],true);
                }
            }
        }else{
            for(var i=0;i<dlen;i++){
                this.hide(arr[i][indexKey]);
            }
        }
    }
    table.prototype.redraw = function(data){
        arr = data;
        seriable(data);
        this.createTable();
    }
    table.prototype.createTable = function(){
        var fr = _table.firstChild;
        while (fr) {
            _table.removeChild(fr);
            fr = _table.firstChild;
        }
        var frag = document.createDocumentFragment();
        if(!opt.hideHead){
            frag.appendChild(this.createHead());
        }
        frag.appendChild(this.createBody());
        var parent = _table.parentNode;
        if(parent.id!=_table.id + '_con'){
            var div = create('div');
            div.id = _table.id + '_con';
            parent.insertBefore(div,_table);
            div.appendChild(_table);
            var css = [getStyle(_table,'border-left-width'),getStyle(_table,'border-left-style'),getStyle(_table,'border-left-color')].join(' ');
            div.style.borderBottom = css;
            div.style.width = '100%';
        }
        _table.style.borderBottom = 'none';
        for(var i=0;i<dlen;i++){
            var result = opt.defaultShow(arr[i],objarr);
            (result === false || result === undefined) && arr[i].child.length>0 && this.hide(arr[i][indexKey]);
        }
        frag.appendChild(this.createFoot());
        _table.appendChild(frag);
        opt.finalCallBack && opt.finalCallBack(div);
    }
    table.prototype.createHead = function(){
        var head = opt.head,that = this;
        var className ,thead = create('thead') , tr = create('tr'),td;
        this.order = this.order || {};
        order = this.order;
        for(var i=0;i<len;i++){
            td = create('td');
            head[i].className && (td.className = head[i].className);
            head[i].width && (td.width = head[i].width);
            if(head[i].order){
                var a = create('a');
                a.innerHTML = head[i].title;
                a.href = 'javascript:void(0)';
                a.className = 'order';
                if(order.col == (head[i].orderCol || head[i].key)){
                    a.className = 'order ' + order.by;
                }
                a.onclick = (function(i){
                    return function(){
                        if(order.col && order.col != (head[i].orderCol || head[i].key)){
                            order.by = undefined;
                        }
                        order.col = head[i].orderCol || head[i].key;
                        order.by = (order.by === undefined || order.by == 'asc')? 'desc' : 'asc';
                        opt.orderFunction && opt.orderFunction(order.col,order.by,that);
                    }
                })(i);
                td.appendChild(a);
            }else{
                td.innerHTML = head[i].title;
            }
            tr.appendChild(td);
        }
        thead.appendChild(tr);
        return thead;
    }
    table.prototype.add = function(data){
        arr.push(data);
        seriable(arr);
        var tbody = _table.getElementsByTagName('tbody')[0] || create('tbody');
        _table.removeChild(tbody);
        _table.appendChild(this.createBody());
        _table.appendChild(this.createFoot());
    }
    table.prototype.createChildAfterAjax = function(tr,selfId,childs){
        var targetObj = objarr[selfId];
        targetObj.child = childs;
        var frag = document.createDocumentFragment();
        for(var i=0,len=childs.length;i<len;i++){
            childs[i].child = childs[i].child === undefined ? true : childs[i].child;
            childs[i][pIndexKey] = selfId;
            childs[i]._level = targetObj._level + 1;
            objarr[childs[i][indexKey]] = childs[i];
            createChild.call(this,childs[i],frag,i);
        }
        insertAfter(frag,tr);
    }
    table.prototype.remove = function(data){
        for(var i=0,len=arr.length;i<len;i++){
            if(arr[i][indexKey] == data[indexKey]){
                arr.splice(i,1);
                break;
            }
        }
        seriable(arr);
        var tbody = _table.getElementsByTagName('tbody')[0] || create('tbody');
        var tfoot = _table.getElementsByTagName('tfoot')[0] || create('tfoot');
        _table.removeChild(tbody);
        $(tfoot).remove();
        _table.appendChild(this.createBody());
        _table.appendChild(this.createFoot());
    }
    table.prototype.update = function(data){
        for(var i=0,len=arr.length;i<len;i++){
            if(arr[i][indexKey] == data[indexKey]){
                arr[i] = data;
                break;
            }
        }
        seriable(arr);
        var tbody = _table.getElementsByTagName('tbody')[0] || create('tbody');
        var tfoot = _table.getElementsByTagName('tfoot')[0] || create('tfoot');
        _table.removeChild(tbody);
        $(tfoot).remove();
        _table.appendChild(this.createBody());
        _table.appendChild(this.createFoot());
    }
    table.prototype.createBody = function(){
        var head = opt.head;
        var frag = document.createDocumentFragment();
        var tbody = create('tbody');
        if(arr.length==0){
            var tr = create('tr');
            var td = create('td');
            td.colSpan = head.length;
            td.style.textAlign = 'center';
            td.innerHTML = opt.noData || '没有数据';
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
        if(opt.treeArrSort){
            var x = opt.treeArrSort(treearr);
            for(var i=0,len=x.length;i<len;i++){
                createChild.call(this,x[i],tbody,i);
            }
        }else{
            for(var i=0,len=_treeArr.length;i<len;i++){
                createChild.call(this,_treeArr[i],tbody,i);
            }
        }
        frag.appendChild(tbody);
        newarr = [];
        return frag;
    }
    table.prototype.createFoot = function(){    
        var that = this;
        var frag = document.createDocumentFragment();
        if(opt.foot){
            var tfoot = create('tfoot');
            var tr = create('tr'),td;
            if(typeof opt.foot === 'function'){
                opt.foot(tfoot,tr);
            }else{
                var footObj = opt.foot;
                for(var i=0,len=opt.head.length;i<len;i++){
                    td = create('td');
                    var key = opt.head[i].key;
                    if(opt.body[key]){
                        typeof opt.body[key] == 'function' ? opt.body[key](td,footObj,that,objarr) : td.innerHTML += opt.body[key] || '';
                    }else{
                        var span = create('span');
                        span.innerHTML = footObj[key]===undefined ? '' : footObj[key];
                        td.appendChild(span);
                    }
                    tr.appendChild(td);
                }
            }
            tfoot.appendChild(tr);
            frag.appendChild(tfoot);
        }
        return frag;
    }
    return new table();
};