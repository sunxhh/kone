void

function () {
    var sendAjax = function (url, data, success, fail, type) {
        var callCode = {
            "0": function (d) {
                success(d);
            },
            "-105": function (d) {
                alert("请登录后在操作");
                location.href = '/login.html';
                fail && fail(d);
            },
            "-102": function (d) {
                alert("您没有权限进行该操作");
                fail && fail(d);
            },
            "-103": function (d) {
                alert("要添加的操作员已存在，不能重复添加！");
                fail && fail(d);
            },
            "-203": function (d) {
                alert("该测试单元已存在，不能重复添加！");
                fail && fail(d);
            },
            "-20": function (d) {
                alert(d.codeInfo);
                fail && fail(d);
            },
            "-824": function (d) {
                alert("该测试未生成报告，无法增加备注!");
                fail && fail(d);
            }

        };
        url = url + ".2x";
        $.ajax({
            type: type,
            url: url,
            data: data,
            timeout: 600000, //  暂时先设置600秒延迟
            dataType: "json",
            success: function (d) {
                var fn = callCode[d.code];
                if (fn) {
                    fn(d);
                } else {
                    alert(d.codeInfo);
                    fail && fail(d);
                }
            },
            error: function (d) {
                fail && fail(d);
            }
        });
    };

    var floatLayer = function (data, fn, tplId) {
        data.tpl = tpl.getDataTpl(tplId || "popu", data);
        var dragFn = function (p) {
            var wrap = p.wrap;
            var dragData = {
                dragAreaNode: p.mark,
                // 拖拽的元素
                dragList: [{
                    d: $(wrap).find(".popu-title")[0],
                    m: wrap
                }]
            };
            DragClass(dragData);
        }
        var callbackFn = data.callbackFn;
        data.callbackFn = function (p) {
            callbackFn && callbackFn(p);
            dragFn && dragFn(p);
            fn && fn(p);
        };
        return popu(data);
    };
    window.floatLayer = floatLayer;

    var ajax = {
        /**
         * 1.1 用户登录
         * String username  //用户姓名
         * String password  //用户密码
         */
        login: function (data, success, fail) {
            var url = "/userLogin";
            sendAjax(url, data, success, fail, "get");
        },
        /**
         * 1.2 用户注销
         */
        userLogout: function (success, fail) {
            var url = "/userLogout";
            sendAjax(url, {}, success, fail, "get");
        },
        /**
         * 1.3 添加用户
         * String username  //用户姓名
         * String password  //用户密码
         * String role      //0-操作员 1-管理员
         */
        addUser: function (data, success, fail) {
            var url = "/addUser";
            sendAjax(url, data, success, fail, "post");
        },
        /**
         * 1.4 删除用户
         * String uids  多个用","分隔
         */
        removeUser: function (uids, success, fail) {
            var url = "/removeUser";
            sendAjax(url, {
                uids: uids
            }, success, fail, "get");
        },
        /**
         * 1.5 分页查询用户
         * int  currentpage    //当前页
         * int  pagesize      //每页条目
         */
        getUsers: function (data, success, fail) {
            var url = "/getUsers";
            sendAjax(url, data, success, fail, "get");
        },
        /**
         * 1.6 获取当前登录用户
         */
        getCurrentUser: function (success, fail) {
            var url = "/getCurrentUser";
            sendAjax(url, {}, success, fail, "get");
        },
        /**
         * 1.7 编辑用户
         * int  id   //修改的操作工ID
         * String  name      //名字
         * String   newpassword // 新密码
         * String   confirmpassword //确认新密码
         */
        modifyUser: function (data, success, fail) {
            var url = "/modifyUser";
            sendAjax(url, data, success, fail, "post");
        },
        /**
         * 2.1 新增测试单元(设备绑定)
         * Body String deviceNo   //设备号
         * String unitName //测试单元名称
         * String devicePort //设备端口
         */
        addUnit: function (data, success, fail) {
            var url = "/addUnit";
            sendAjax(url, data, success, fail, "post");
        },
        /**
         * 2.2 编辑测试单元(设备绑定)
         * String unitId   //设备记录ID
         * String deviceNo   //设备号
         * String devicePort //设备端口
         * String unitName //测试单元名称
         */
        modifyUnit: function (data, success, fail) {
            var url = "/modifyUnit";
            sendAjax(url, data, success, fail, "post");
        },
        /**
         * 2.3 删除测试单元(设备绑定)
         * String unitId   //设备记录ID
         */
        removeUnit: function (uids, success, fail) {
            var url = "/removeUnit";
            sendAjax(url, {
                uids: uids
            }, success, fail, "get");
        },
        /**
         * 2.4 分页查询测试单元(设备绑定)
         * int  currentpage    //当前页
         * int  pagesize      //每页条目
         */
        getUnits: function (data, success, fail) {
            var url = "/getUnits";
            sendAjax(url, data, success, fail, "get");
        },
        /**
         * 2.5 不分页查询测试单元
         */
        queryUnits: function (success, fail) {
            var url = "/queryUnits";
            sendAjax(url, {}, success, fail, "get");
        },
        /**
         * 4.1 新增步骤
         * Body    int  jobId   //测试配置ID，新增时候为0
         * String  jobName  //测试配置名字
         * String   unitIds // 测试单元id，顿号分隔
         * String   unitNames  //所选择测试单元名称逗号分隔拼接的字符串
         * String   testTime  //测试时间
         * String   controlType  //设备控制，1-扶梯上行 0-扶梯下行
         * int     stepOrder   //步骤顺序，传现有步骤的最大顺序，没有为0
         */
        addStep: function (data, success, fail) {
            var url = "/addStep";
            sendAjax(url, data, success, fail, "post");
        },
        /**
         * 4.2 编辑步骤
         * Body    int  stepId//测试步骤ID
         * String   unitIds // 测试单元id，顿号分隔
         * String   unitNames  //所选择测试单元名称逗号分隔拼接的字符串
         * String   testTime  //测试时间
         * String   controlType  //设备控制，1-扶梯上行 0-扶梯下行
         */
        modifyStep: function (data, success, fail) {
            var url = "/modifyStep";
            sendAjax(url, data, success, fail, "post");
        },
        /**
         * 4.3 删除步骤
         * Body String   sids// 测试步骤id，顿号分隔
         */
        delStep: function (sids, success, fail) {
            var url = "/delStep";
            sendAjax(url, {
                sids: sids
            }, success, fail, "post");
        },
        /**
         * 4.4 根据步骤配置ID查询所配置步骤
         * Body int   id// 步骤配置ID
         */
        getSteps: function (id, success, fail) {
            var url = "/getSteps";
            sendAjax(url, {
                jobId: id
            }, success, fail, "get");
        },
        /**
         * 4.5 查询已启用步骤配置
         */
        getEnableSteps: function (success, fail) {
            var url = "/getEnableSteps";
            sendAjax(url, {}, success, fail, "get");
        },
        /**
         * 4.6 查询步骤配置列表
         * int  currentpage    //当前页
         * int  pagesize      //每页条目
         */
        getJobs: function (data, success, fail) {
            var url = "/getJobs";
            sendAjax(url, data, success, fail, "get");
        },
        /**
         * 4.7 启用步骤配置
         * int   jobId //步骤配置ID
         */
        enableJob: function (jobId, success, fail) {
            var url = "/enableJob";
            sendAjax(url, {
                jobId: jobId
            }, success, fail, "get");
        },
        /**
         * 4.8删除步骤配置
         * String jids //步骤配置ID,多个逗号分隔
         */
        delJob: function (jids, success, fail) {
            var url = "/delJob";
            sendAjax(url, {
                jids: jids
            }, success, fail, "get");
        },
        /**
         * 5.1 保存性能指标设定
         *  String setInfo
            setInfo指标信息(参数为json格式)
            {    "id":1,  //配置id,编辑时不能为空，新建时可以为空
                "name": "测试性能", //配置名称
                "speed": "100.2",    //运行速度下限值
                "vibration": "20.03",   //振动下限值
                "electricity": "10.22",   //电流下限值
                "signaldelay": "40",    //信号延时
                "noise": "50",        //噪音下限值
                "voltage": "50",      //电压下限值
                "alarmdelay": "50",   //报警延时
                "energy4a": "60",    //能耗A+++
                "energy3a": "50",    //能耗A++
                "energy2a": "40",    //能耗A+
                "energya": "30",    //能耗A
                "energyb": "20",     //能耗B
                "energyc": "10",     //能耗c
                "energyd": "5",     //能耗D
                "energyoffset": "1",  //能耗offset
                "energyalarmtype":"0",  //0-能耗报警未开启 1-能耗报警开启 可空
                " energyalarm":"12",//能耗报警值 根据energyalarmtype来决定是否有该值
            }
         */
        saveSet: function (data, success, fail) {
            var url = "/saveSet";
            var val = JSON.stringify(data);
            sendAjax(url, {
                setInfo: val
            }, success, fail, "post");
        },
        /**
         * 5.2 启用性能指标设置
         *  String  setId  //配置ID
         */
        enableSet: function (setId, success, fail) {
            var url = "/enableSet";
            sendAjax(url, {
                setId: setId
            }, success, fail, "get");
        },
        /**
         * 5.3 分页查询性能指标列表
         *  int  currentpage
            int  pagesize
         */
        getSets: function (data, success, fail) {
            var url = "/getSets";
            sendAjax(url, data, success, fail, "get");
        },
        /**
         * 5.4 删除性能指标设置
         *  pids 
         */
        delSet: function (pids, success, fail) {
            var url = "/delSet";
            sendAjax(url, {
                pids: pids
            }, success, fail, "get");
        },
        /**
         * 6.1 被测梯参数录入
         *  String leftInfo
            leftInfo被测梯信息(参数为json格式)
            {   
                "productline": "L21", //产品线
                "liftno": "12", //梯号
                "height": "50", //提升高度
                "width": "20", //梯级宽度
                "motortype": "1", //马达类型
                "motorpower": "50", //马达功率
                "speed": "40", //速度
                "runmode": "3", //运行模式
                "inclination": "60", //倾斜角度
                "handstrapdrivertype": "30", //扶手驱动类型
                "gearboxtype": "22", //减速箱类型
                "handstraptype": "50" //扶手带类型
            }
 
         */
        saveElevator: function (data, success, fail) {
            var url = "/saveElevator";
            data = JSON.stringify(data);
            sendAjax(url, {
                leftInfo: data
            }, success, fail, "post");
        },
        /**
         * 6.2 获取被测梯参数
         */
        queryElevator: function (success, fail) {
            var url = "/queryElevator";
            sendAjax(url, {}, success, fail, "get");
        },
        /**
         * 7.1 分页查询被测梯记录
         * Body int  currentpage
                int  pagesize

         */
        getRecords: function (data, success, fail) {
            var url = "/getRecords";
            sendAjax(url, data, success, fail, "get");
        },
        /**
         * 7.2 启用数据分析
         * Body String  setId  //配置ID
         */
        enableRecord: function (data, success, fail) {
            var url = "/enableRecord";
            sendAjax(url, data, success, fail, "get");
        },
        /**
         * 7.3 删除数据分析
         * Body String  rids  //配置ID
         */
        delRecord: function (rids, success, fail) {
            var url = "/delRecord";
            sendAjax(url, {
                rids: rids
            }, success, fail, "get");
        },
        /**
         * 7.4 查询报告
         * Body int  recordId //数据分析记录ID
         */
        queryReport: function (rids, success, fail) {
            var url = "/queryReport";
            sendAjax(url, {
                recordId: rids
            }, success, fail, "get");
        },
        /**
         * 8.1 启用重测记录
         * int  recordId //重测记录ID
         */
        enableReTestRecord: function (rids, success, fail) {
            var url = "/enableReTestRecord";
            sendAjax(url, {
                recordId: rids
            }, success, fail, "get");
        },
        /**
         * 8.2 删除重测记录
         * String rids //多个用逗号分隔
         */
        delReTestRecord: function (rids, success, fail) {
            var url = "/delReTestRecord";
            sendAjax(url, {
                rids: rids
            }, success, fail, "get");
        },
        /**
         * 8.3 查询重测数据
         * ing  recordId 
         * {"codeInfo":"对不起，请登陆后操作！","code":-105,"objects":null}
            {
                "codeInfo": "操作成功！",
                "code": 0,
                "objects": [
                    {
                        "createtime": "",
                        "data": "12",
                        "id": 1,
                        "retestrecordid": 1,
                        "unitid": 29,
                        "unitname": "aa"
                    }
                ]
            }
         */
        queryReTestReport: function (rids, success, fail) {
            var url = "/queryReTestReport";
            sendAjax(url, {
                recordId: rids
            }, success, fail, "get");
        },
        /**
         * 8.4 判断测试是否成功
         */
        isconnect: function (success, fail) {
            var url = "/test/connect";
            sendAjax(url, {}, success, fail, "get");
        },
        /**
         * 8.5 开机信息
         */
        testLED1: function (success, fail) {
            var url = "/testLED1";
            sendAjax(url, {}, success, fail, "get");
        },
        /**
         * 8.6 测试中信息
         */
        testLED2: function (success, fail) {
            var url = "/testLED2";
            sendAjax(url, {}, success, fail, "get");
        },
        /**
         * 8.7 测试完成信息
         */
        testLED3: function (success, fail) {
            var url = "/testLED3";
            sendAjax(url, {}, success, fail, "get");
        },
        /**
         * 8.8 LED显示屏
         */
        testLED4: function (text, success, fail) {
            var url = "/testLED4";
            sendAjax(url, {
                text: text
            }, success, fail, "get");
        },
        /**
         * 8.9 打开关闭指示灯
         */
        testLED5: function (data, success, fail) {
            var url = "/testLED5";
            sendAjax(url, data, success, fail, "get");
        },
        /**
         * 9.0 查询校验参数的配置
         */
        queryParam: function (success, fail) {
            var url = "/queryParam";
            sendAjax(url, {}, success, fail, "get");
        },
        /**
         * 9.1 设置校验参数的配置
         *  @RequestParam(value = "SNoiseDataP", required = false) String SNoiseDataP,
            @RequestParam(value = "SHandStrapN", required = false) String SHandStrapN,
            @RequestParam(value = "NHandStrapIso", required = false) int NHandStrapIso,
            @RequestParam(value = "SStairN", required = false) String SStairN,
            @RequestParam(value = "NStairIso", required = false) int NStairIso,
            @RequestParam(value = "SPlateN", required = false) String SPlateN,
            @RequestParam(value = "NPlateIso", required = false) int NPlateIso)

         */
        setParam: function (data, success, fail) {
            var url = "/setParam";
            sendAjax(url, data, success, fail, "get");
        },
        /**
         * 9.2 查询振动数据
         *  参数
            @RequestParam(value = "liftno", required = true) String liftno,  //必传
            @RequestParam(value = "queryname", required = true) String queryname,//必传
            @RequestParam(value = "lifttype", required = true) String lifttype,//必传
            @RequestParam(value = "runType", required = true) Integer runType,//必传
            @RequestParam(value = "filterType", required = false) String filterType,//非必传
            @RequestParam(value = "speedype", required = false) String speedtype//非必传
            
            @param  liftno 梯号，queryName-> vibration（振动），noise（噪音），energy（能耗）
            @param  lifttype 振动，能耗，噪音测试单元类型 runType liftType的运行方式 1上行 -1下行， 
            speedType 速度类
            @param  filterType 滤波 rms  iso

         */
        queryData: function (data, success, fail) {
            var url = "/queryData";
            sendAjax(url, data, success, fail, "get");
        },
        // 数据统计
        queryDataCount: function (data, success, fail) {
            var url = "/queryDataCount";
            sendAjax(url, data, success, fail, "get");
        },

        // 数据统计
        // 参数:
        // reportid
        // description
        updateDescription: function (data, success, fail) {
            var url = "/updateDescription";
            sendAjax(url, data, success, fail, "post");
        },
        // 获取选择的视频
        // start_date 起始时间
        // end_date 结束时间
        // 时间是utc时间  
        replay: function (data, success, fail) {
            var url = "/replay";
            sendAjax(url, data, success, fail, "post");
        }
    };

    window.ajax = ajax;
    window.pageStart = function (fn) {
        fn && fn(ajax);
    };
}();