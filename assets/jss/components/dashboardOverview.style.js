
const dashboardOverview = (theme) => ({
    mainTitle: {
        paddingTop:"38px",
        fontSize:"28px",
        fontWeight:"normal",
        color:"#43425D",
    },
    iconStyle: {
        color:"#FFF",
        "&.MuiSvgIcon-root": {
            width:"1.75em",
            height:"2.188em"
        }
    },
    iconDiv: {
        top:"-20px",
        padding:"12px 16px",
        position:"absolute",
        width:"78px",
        height:"78px"
    },
    cardStyle: {
        minHeight:"130px",
        [theme.breakpoints.down('xs')]: {
            width:"100%",
        },
    },
    cardContent: {
        padding: "16px 32px",
    },
    cardTitle: {
        fontSize:"18px",
        fontWeight:"normal",
        textAlign:"right",
        color:"#43425D",
        textTransform:"uppercase",
        [theme.breakpoints.down('xs')]: {
            textAlign:"right",
        },
    },
    cardCountText: {
        fontSize:"30px",
        fontWeight:"bold",
        textAlign:"right",
    },
    dividerStyle: {
        width:"calc(100% - 30px)",
        color:"#CECECE",
        [theme.breakpoints.down('xs')]: {
            width:"100%",
        },
    },
    detailTitle: {
        fontSize: "14px",
        fontWeight: "500",
        textTransform: "uppercase",
        color: "#43425D",
        textDecoration: "underline"
    },
    detailDoneCountText: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#5B5A72"
    },
    detailProcessCountText: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#43425D"
    }
})

export default dashboardOverview;