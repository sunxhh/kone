var testCode = {
    websocket: {
        "0": {
            codeInfo: "连接成功"
        },
        "-10" {
            codeInfo: "连接失败"
        }
    },
    device: {
        "0": {
            codeInfo: "连接正常"
        },
        "-20": {
            codeInfo: "与硬件连接故障！"
        }
    },
    test: {
        "0": {
            codeInfo: "正常"
        },
        "-30": {
            codeInfo: "测试报警停止！"
        }
    },
    command: {
        "0": {
            codeInfo: "正常"
        },
        "-40": {
            codeInfo: "发送指令失败！"
        },
        "-41": {
            codeInfo: "指令类型错误！"
        }
    },
    testunit: {
        "-204": {
            codeInfo: "对不起，测试单元不存在！"
        }
    },
    teststep: {
        "-502": {
            codeInfo: "对不起，该测试步骤不存在！"
        }
    },
    lift: {
        "-704": {
            codeInfo: "未查询到待测扶梯！"
        },
        "-706": {
            codeInfo: "当前无测试扶梯！"
        }
    },
    alarm: {
        "-50": {
            codeInfo: "速度低于下限值，正在停梯！"
        },
        "-52": {
            codeInfo: "发送指令停梯失败！"
        },
        "-51": {
            codeInfo: "已经自动停梯/停测"
        }
    }
}
};
