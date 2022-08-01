const styles = (theme) => ({
    rootContainer: {
        marginTop: 25,
    },
    inputCls: {
        padding: 12
    },
    wordCounter: {
        display: 'block',
        width: '100%',
        textAlign: 'end',
        background: '#ededed',
        padding: '10px',
        border: '1px solid #cccccc',
        borderTopWidth: 0
    },
    overLimit: {
        color: 'red'
    },
    contextMenuIcon: {
        position: 'relative',
        top: 3
    },
    contextMenuText: {
        position: 'relative',
        top: -3
    },
    deleteButton: {
        background: '#ec1717',
        color: '#ffffff',
        "&:hover": {
            background: '#a31111',
        },
    },
    backupButton: {
        background: '#e5a74d',
        color: '#ffffff',
        "&:hover": {
            background: '#e8a435',
        },
    },
    emptyMsgWrapper: {
        alignItems: "center",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "row",
        height: "calc(100vh - 230px)",
        justifyContent: "center",
        textAlign: "center",
        width: "100%"
    },
    emptyMsg: {
        textAlign: "center",
        padding: "10px",
        alignItems: "center",
        borderRadius: "50%",
        backgroundColor: "#f1f3f4",
        display: "flex",
        flexDirection: "column",
        height: "320px",
        justifyContent: "center",
        width: "320px",
        margin: "0 auto",
    },
    emptyMsgTxt: {
        fontSize: ".875rem",
        letterSpacing: ".25px",
        color: "#5f6368",
        fontWeight: 500
    },
    emptyMsgIcon: {
        color: 'rgb(154, 160, 166)',
        display: 'block',
        margin: '0 auto',
        fontSize: '6em',
        marginTop: -30,
        marginBottom: 10
    },
    textFieldFormHelper: {
        textAlign: 'end'
    },
    targetEditor: {
        width: '100%'
    }
})

export default styles