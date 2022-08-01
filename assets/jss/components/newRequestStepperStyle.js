
const newRequestStepperStyle = (theme) => ({
    
    requestTitle: {
        //padding:"0 0 21px 0",
        fontSize:"20px",
        fontWeight:"600",
        color:"#4D4F5C",
    },
    requestText: {
        "& .MuiFormControlLabel-label": {
            fontSize:"15px",
            color:"#43425D"
        }
    },
    requestSubTitle: {
        padding:"0 0 8px 0",
        fontSize:"12px",
        fontWeight:"bold",
        color:"#A3A6B4",
    },
    textFieldStyle: {
        "& .MuiOutlinedInput-root": {
            //height:"40px",
            "& fieldset": {
                border: "1px solid #4666B0",
            },
            "&:hover fieldset": {
                borderColor: "#4666B0"
            },
            "&.Mui-focused fieldset": {
                borderColor: "#4666B0",
            },
        },
    },
    
    textFieldStyleMultiLine: {
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                border: "1px solid #4666B0",
            },
            "&:hover fieldset": {
                borderColor: "#4666B0"
            },
            "&.Mui-focused fieldset": {
                borderColor: "#4666B0",
            },
        },
    },
    autoCompleteStyle: {
        "& .MuiInputBase-root": {
            //height:"40px"
        },
        "& .MuiOutlinedInput-input": {
            padding:"0",
            marginTop:"-7px"
        }
    },
    fileStepDiv:{
        width:"510px",
        height:"352px",
        margin:"auto",
        backgroundColor:"#F0F2F8"
    },
    fileStepTitle: {
        fontSize:"35px",
        fontWeight:"normal",
        color:"#43425D",
        textAlign:"center"
    },
    fileStepText: {
        fontSize:"18px",
        fontWeight:"normal",
        color:"rgb(67, 66, 93, 0.5)",
        textAlign:"center"
    },
    fileStepIcon: {
        position:"absolute",
        top:"10%",
        left:"35%",
        fontSize:"144px",
        width:"144px",
        height:"auto",
        color:"rgb(67, 66, 93,0.1)",
        "& .MuiDropzoneArea-icon": {
        
        }
    },
    uploadArea: {
        width:"510px",
        height:"352px",
        margin:"auto",
        backgroundColor:"#F0F2F8",
        border:"none",
    },
    uploadAreaText: {
        position:"absolute",
        top:"40%",
        left:"35%"
    },
    buttonStyle: {
        width:"131px",
        backgroundColor:"#4666B0",
        color:"#FFF",
        "&:hover": {
            backgroundColor:"#4666B0"
        }
    },
    dialogRoot: {
        "& .MuiDialog-paperWidthMd": {
            width:"500px",
            maxWidth:"670px",
            //height:"482px"
        }
    },
    dialogTitle: {
        "&.MuiDialogTitle-root": {
            paddingTop:"24px",
            paddingLeft:"24px",
            paddingRight:"12px",
            paddingBottom:"8px"
            //textTransform:"lowercase"
        }
    },
    dialogText: {
        "&.MuiDialogContentText-root": {
            padding:"0 24px",
            color:"black"
            
        }
    },
    inputAdornmentStyle: {
        position:"absolute",
        right:"2px",
        top:"10px",
        "&.MuiInputAdornment-positionStart": {
            marginRight:"0"
        }
    },
    characterCountText: {
        fontSize:"12px",
    },
    stepperButtonDiv: {
      padding: "0 48px",
        [theme.breakpoints.down('sm')]: {
            padding: "0",
        },
    },
    pleaseWaitPaper: {
        marginTop: "-24px",
        padding: "0 8px",
        position: "absolute",
        textAlign: "center"
    }
    
})

export default newRequestStepperStyle;