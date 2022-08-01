const wikiHeaderStyle = (theme) => ({
    drawerStyle: {
        zIndex:"1",
        width:"360px",
        backgroundColor:"#151b26",
        [theme.breakpoints.down("sm")]: {
            width:"230px",
        },
    },
    drawerPaper: {
        zIndex:"1",
        width:"360px",
        [theme.breakpoints.down("sm")]: {
            width:"230px",
        },
    },
    appBar: {
        backgroundColor:"#1c2332",
    },
    appBarLogo: {
        width:"50px"
    },
    appBarTitle: {
        paddingLeft:"16px",
        fontSize:"24px",
        [theme.breakpoints.down("sm")]: {
            fontSize: "16px"
        },
    },
    appBarRightLinks: {
        marginLeft:"auto",
        display:"flex",
        color:"#FFF",

    },
    title: {
        textTransform: "capitalize",
        [theme.breakpoints.down("sm")]: {
            fontSize: "12px"
        },
    },
    appBarLeftLinks: {
        [theme.breakpoints.down("xs")]: {
            display: "none"
        },
        [theme.breakpoints.down("sm")]: {
            fontSize: "14px"
        },
    },
    navMenu: {
        fontSize:"16px",
        padding:"96px 0 0 24px",
        color:"#FFF",
        [theme.breakpoints.down("sm")]: {
            padding:"18px 0 0 18px",
        },
    },
    aStyle: {
        textDecoration:"none",
        "&:hover,&:visited": {
            color:"#FFF",
            textDecoration:"none",
        }
    },
    withoutLoginTranslateButton: {
        color: "#FFFFFF"
    },
    withLoginTranslateButton: {
        width: "100%"
    },
    menuPaper: {
        minWidth: '350px'
    }

   
})

export default wikiHeaderStyle;