const style = (theme) => ({
    noPrint: {
        "@media print": {
            display: 'none'
        }
    },
    appBar: {
        backgroundColor: '#fff',
        zIndex: 4
    },
    toolBar: {
        justifyContent: 'space-between',
    },
    toolbarDestinationPortal: {
        "&.MuiToolbar-gutters": {
            paddingLeft: "0",
            paddingRight: "0",
            [theme.breakpoints.down("sm")]: {
                paddingLeft: "0",
                paddingRight: "0",
            },
        }
    },
    headerLogo: {
        maxHeight: 50,
    },
    textLogin: {
        fontSize: 18,
        color: '#000',
        textTransform: 'none',
    },
    listItemIcon: {
        minWidth: 35,
    },
    container: {
        paddingLeft: "64px",
        paddingRight: "64px",
        [theme.breakpoints.down('sm')]: {
            paddingLeft: "24px",
            paddingRight: "24px",
        },
    },
    headerLoginButton: {
        padding: "4px 8px",
        marginLeft: "16px",
        fontSize: "14px",
        fontWeight: "bold",
        //color: "#FFFFFF",
        //backgroundColor: "#122D31",
        borderRadius: "7px",
        textTransform: "none",
        "&:hover": {
            //backgroundColor: "rgb(18, 45, 49, 0.58)"
        }
    },
    dividerStyle: {
        margin: '8px 16px 8px 8px'
    },
    loginName: {
        fontSize: '15px',
        color: 'initial',
        [theme.breakpoints.down("xs")]: {
            fontSize: '12px'
        },
    }
})

export default style