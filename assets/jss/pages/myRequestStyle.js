
const myRequestStyle = (theme) => ({
    root: {
        width: '100%',
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
    titleRow: {
        background: '#E2F4F7 0% 0% no-repeat padding-box',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    field: {
        marginRight: theme.spacing(1),
    },
    title: {
        flexGrow: 1,
    },
    mainTitle: {
        fontWeight:"500",
        fontSize:"28px",
        color: "#43425D"
    },
    addTaskButton: {
        minWidth:"130px",
        maxHeight:"36px",
        fontWeight: "normal",
        fontSize:"16px",
        borderRadius:"4px",
        border:"1px solid #4666B0",
        backgroundColor:"#4666B0",
        textTransform:"none",
        color:"#FFF",
        "&:hover,&:focus": {
            backgroundColor:"#4666B0",
            border:"1px solid #4666B0",
            boxShadow:
                "0 14px 26px -12px rgba(59, 89, 152, 0.42), 0 4px 23px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(59, 89, 152, 0.2)"
        },
        [theme.breakpoints.down("md")]: {
            marginRight:"0",
            marginTop:"12px",
            width:"50%"
        },
        [theme.breakpoints.down("xs")]: {
            marginRight:"0",
            width:"100%"
        }
    },
    checkIcon:{
        whiteSpace: 'nowrap',
        '& .MuiIconButton-label>.Mui-checked': {
            color:"#4666B0",
        },
        '& .MuiIconButton-label>svg': {
            color:"#4666B0",
        },
    },
    statusDot: {
        width:"12px",
        height:"12px",
        borderRadius:"50%",
    },
    statusText: {
        fontSize:"13px",
        paddingLeft: '4px',
        textTransform:"capitalize"
    },
    dataDateText: {
        fontWeight:"bolder",
        fontSize:"13px",
    },
    requestDialog: {
        "& .MuiDialog-paperWidthMd": {
            width:"670px",
            maxWidth:"670px",
        },
        "& .MuiDialog-paperWidthXl": {
            width:"1366px",
            maxWidth:"1366px",
        }
    },
    requestDialogDiv: {
        padding: "0 24px",
        [theme.breakpoints.only("sm")]: {
            padding: "0 12px",
        },
        [theme.breakpoints.only("xs")]: {
            padding: "0",
        },
    },
    selectItem: {
        fontSize:"13px",
        color:"#4D4F5C"
    },
    descriptionText: {
        fontSize:"13px",
        color:"#4D4F5C"
    },
    status: {
        width: '100%',
        alignItems: 'center',
        display: "flex",
    },
    dialogButton: {
        textTransform: "none",
        backgroundColor:"#4666B0",
        color:"#FFF",
        "&:hover": {
            backgroundColor:"#4666B0"
        }
    },
    dialogText: {
        "&.MuiDialogContentText-root": {
            padding:"0 24px",
            color:"black"
            
        }
    },
})

export default myRequestStyle;