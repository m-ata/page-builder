const TrainingRequestConfirmStepStyle = (theme) => ({
    title: {
        paddingBottom:"8px",
        fontSize:"12px",
        fontWeight:"bold",
        color:"#A3A6B4"
    },
    autoCompleteStyle: {
        "& .MuiInputBase-root": {
            width: "240px",
            maxWidth:"100%"
        },
        "& .MuiOutlinedInput-input": {
            //padding:"0",
            //marginTop:"-7px"
        }
    },
    textFieldStyle: {
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                //border: "1px solid #4666B0",
            },
            "&:hover fieldset": {
                borderColor: "#4666B0"
            },
            "&.Mui-focused fieldset": {
                borderColor: "#4666B0",
            },
        },
    },
    formControl: {
        width: "100%",
        maxWidth:"100%",
        
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                //border: "2px solid #4666B0",
            },
            "&:hover fieldset": {
                borderColor: "#4666B0",
            },
            "&.Mui-focused fieldset": {
                borderColor: "#4666B0",
            },
        },
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 2,
    },
    noLabel: {
        marginTop: {...theme.spacing(3)},
    },
    textAreaStyle: {
        padding:"16px",
        width:"100%",
        border:"1px solid #E8E9EC",
        maxHeight:"180px",
        overflow:"auto"
    },
    checkBoxStyle: {
        padding:"0",
        //width:"24px",
        //height:"24px",
        color:"rgb(70, 102, 176,0.5)",
        borderRadius:"6px",
        transition:"background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        "&.Mui-checked": {
            color:"#4666B0",
        },
    },
    formControlStyle: {
        alignItems:"start",
        "&:label": {
            fontSize:"32px"
        },
        "&.MuiFormControlLabel-label": {
            "& label": {
                fontSize:"32px"
            },
            "& MuiFormControlLabel-label MuiTypography-body1": {
                fontSize:"32px"
            }
        }
    },
    checkBoxDesc: {
        paddingLeft:"12px",
        fontSize:"13px",
    },
    menuItem: {
        "&.Mui-selected": {
            backgroundColor:"#FFF"
        }
    }
})

export default TrainingRequestConfirmStepStyle;