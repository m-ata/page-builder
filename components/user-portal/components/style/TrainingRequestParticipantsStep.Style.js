
const TrainingRequestParticipantsStepStyle = (theme) => ({
    requestTitle: {
        paddingBottom:"4px",
        fontSize:"20px",
        fontWeight:"600",
        color:"#4D4F5C",
        [theme.breakpoints.down('sm')]: {
        
        },
    },
    searchCombo: {
        fontSize: "13px",
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
    textField: {
        width:"100%",
        textAlign:"left",
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                border: "transparent",
            },
            "&:hover fieldset": {
                borderColor: "transparent",
            },
            "&.Mui-focused fieldset": {
                border: "1px solid black",
                backgroundColor:"transparent"
            },
            "& input": {
                height:"50px",
                padding:"0 8px",
                textAlign:"left",
                fontSize: "13px"
            }
        },
        '&:hover $addIconContainer': {
            visibility: 'visible'

        }
    },
    addIconContainer: {
        visibility: 'hidden'
    },
    textFieldEmployeeId: {
        width:"100%",
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                border: "transparent",
            },
            "&:hover fieldset": {
                borderColor: "transparent",
            },
            "&.Mui-focused fieldset": {
                border: "1px solid black",
                backgroundColor:"transparent"
            },
            "& input": {
                height:"50px",
                padding:"0 8px",
                textAlign:"right",
                fontSize: "13px"
            }
        },
    },
    addIcon: {
        paddingRight:"8px",
        width:"1.5em",
        height:"1.5em",
        color:"#67B548",
    },
    addText: {
        fontSize:"15px",
        fontWeight:"600",
        color:"#67B548",
    },
    iconButton: {
        padding:"0",
        "&:focus": {
            borderColor: "#4666B0",
            outline: "none"
        },
        "&.Mui-focusVisible": {
            borderColor: "#4666B0",
            backgroundColor: "#4666B0"
        },
        "&.MuiTouchRipple-root": {
            "&:focus": {
                borderColor: "#4666B0",
            }
        },
    },
    deleteButton: {
        padding:"0",
        color:"#F16A4B"
    },
    tableContainer: {
        width:"100%",
        maxHeight:"280px",
    },
    tableCellHeaderAction: {
        minWidth:"48px",
        width:"110px",
        maxWidth:"120px",
        border: "1px solid #E8E9EC",
        backgroundColor:"#FFF"
    },
    tableCellHeader: {
        minWidth:"100px",
        padding:"19px 0",
        fontSize:"12px",
        fontWeight:"bold",
        backgroundColor:"#FFF",
        border: "1px solid #E8E9EC",
        textAlign:"center",
        color:"#A3A6B4"
    },
    tableCellHeaderEmail: {
        minWidth:"200px",
        padding:"19px 0",
        fontSize:"12px",
        fontWeight:"bold",
        backgroundColor:"#FFF",
        border: "1px solid #E8E9EC",
        textAlign:"center",
        color:"#A3A6B4"
    },
    tableCellAction: {
        padding:0,
        border: "1px solid #E8E9EC",
        textAlign:"center",
        borderRadius:"4px"
    },
    tableCellBody: {
        padding:"0",
        fontSize:"12px",
        border: "1px solid #E8E9EC",
        textAlign:"center",
        borderRadius:"4px"
    },
    tableBody: {
        "&:hover > $menuDiv": {
            visibility:"visible"
        }
    },
    selectedRow: {
        backgroundColor:"#FEF3E2"
    },
    zebraRowDark: {
        backgroundColor:"#F9F9F9",
        "&:hover  $menuDiv": {
            visibility:"visible"
        }
    },
    zebraRowLight: {
        backgroundColor:"#FFF",
        "&:hover $menuDiv": {
            visibility:"visible"
        }
    },
    counterText: {
        paddingTop:"16px",
        textAlign:"right",
        fontSize:"16px",
        fontWeight:"500",
    },
    openList: {
        zIndex:"2",
        position:"absolute",
        visibility:"visible",
        maxHeight: "150px",
        overflowY:"auto"
    },
    closeList: {
        position:"absolute",
        visibility:"hidden",
        maxHeight: "150px",
        display: 'none'
    },
    paperMenu: {
        marginTop:"2px",
        position:"absolute",
        maxWidth: "50%",
        maxHeight: "240px",
        zIndex:"1300",
        overflow: "auto",
    },
    spanStyle: {
        padding: "0 4px"
    }
  
})

export default TrainingRequestParticipantsStepStyle;