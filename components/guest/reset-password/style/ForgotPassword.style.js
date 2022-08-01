const style = () => ({
    gridContainer: {
        width: '100%',
        margin: 0,
        paddingBottom: 20
    },
    gridItem: {
        width: '100%',
        maxWidth: 425,
    },
    divider: {
        color: '#707070',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2F3434',
    },
    titleSuccess1: {
        fontSize: 27,
        fontWeight: 'bold',
        color: '#2F3434',
        textAlign: 'center',
    },
    titleSuccess2: {
        fontSize: 23,
        fontWeight: 500,
        color: '#2F3434',
        textAlign: 'center',
    },
    sendButton: {
        fontSize: 22,
        fontWeight: 'bold',
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: 5,
    },
    sendButtonUserPortal: {
        backgroundColor: "#063E8D",
        fontSize: 20,
        fontWeight: '600',
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: 5,
        "&:hover": {
            backgroundColor: "rgb(6, 62, 141, 0.8)",
        },
    },
    successIcon: {
        fontSize: 75,
        color: '#4CAF50',
    },
    textStyle: props => ({
        paddingTop: "16px",
        fontSize: "15px",
        fontWeight:"bold",
        cursor: "pointer",
        textAlign: "center",
    }),
    textFieldUserPortal: {
        marginTop: "16px",
        borderRadius: "5px",
        "& .MuiInputLabel-root": {
            color: "#063E8D",
        },
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                //border: "transparent",
            },
            "&:hover fieldset": {
                borderColor: "#063E8D",
            },
            "&.Mui-focused fieldset": {
                border: "1px solid #063E8D",
                backgroundColor:"transparent"
            },
            "& input": {
                //height: "42px"
            },
        },
    },
    textFieldDestinationPortal: {
        borderRadius: "5px",
    },
  
})

export default style