
const changeHotelStepStyle = (theme) => ({
    closeIconDiv: {
        padding:"12px",
        textAlign:"right"
    },
    title: {
        paddingTop:"12px",
        paddingLeft:"24px",
        paddingRight:"100px",
        fontSize:"20px",
        fontWeight:"600",
    },
    buttonStyle: {
        width:"131px",
    },
    dialogRoot: {
        "& .MuiDialog-paperWidthMd": {
            width:"400px",
            maxWidth:"670px",
        }
    },
    dialogTitle: {
        "&.MuiDialogTitle-root": {
            paddingTop:"24px",
            paddingLeft:"24px",
            paddingRight:"12px",
            paddingBottom:"8px"
        }
    },
    dialogText: {
        "&.MuiDialogContentText-root": {
            padding:"0 24px",
            color:"black"
        }
    },
})

export default changeHotelStepStyle;