const customSelectStyle = (theme) => ({
    formControl:{
        textAlign:"left",
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                border: "2px solid #4666B0",
            },
            "&:hover fieldset": {
                borderColor: "#4666B0",
            },
            "&.Mui-focused fieldset": {
                borderColor: "#4666B0",
            },
        },
        [theme.breakpoints.down('md')]: {
            width:"50%"
        },
        [theme.breakpoints.down('xs')]: {
            width:"100%"
        },
    },
    selectRoot: {
        backgroundColor:"#FFF",
        fontWeight:"500",
        fontSize:"13px",
        minWidth: "120px",
        color:"#4D4F5C",
        lineHeight:"24px",
        maxHeight:"36px",
        [theme.breakpoints.down('md')]: {
            width:"100%"
        },
        "& .MuiOutlinedInput-input": {
            backgroundColor: "transparent"
        }
    },
})

export default customSelectStyle