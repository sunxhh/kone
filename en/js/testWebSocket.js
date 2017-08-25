var testCode = {
    websocket: {
        "0": {
            codeInfo: "Connection success"
        },
        "-10" {
            codeInfo: "Connection failed"
        }
    },
    device: {
        "0": {
            codeInfo: "Normal connection"
        },
        "-20": {
            codeInfo: "Hardware connection fault！"
        }
    },
    test: {
        "0": {
            codeInfo: "Normal"
        },
        "-30": {
            codeInfo: "Test alarm stop！"
        }
    },
    command: {
        "0": {
            codeInfo: "Normal"
        },
        "-40": {
            codeInfo: "Send command failed！"
        },
        "-41": {
            codeInfo: "Instruction type error！"
        }
    },
    testunit: {
        "-204": {
            codeInfo: "对不起，测试单元不存在！"
        }
    },
    teststep: {
        "-502": {
            codeInfo: "Sorry, this test step does not exist！"
        }
    },
    lift: {
        "-704": {
            codeInfo: "No inquiries to the escalator！"
        },
        "-706": {
            codeInfo: "Current no test escalator！"
        }
    },
    alarm: {
        "-50": {
            codeInfo: "The speed is below the lower limit and the ladder is being stopped!"
        },
        "-52": {
            codeInfo: "Send command failed to stop the ladder！"
        },
        "-51": {
            codeInfo: "Automatic stop / stop test"
        }
    }
}
};
