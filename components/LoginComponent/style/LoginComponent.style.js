const style = () => ({
    gridContainer: {},
    gridItem: {
        padding: '12px 0',
    },
    loginButton: {
        fontSize: 22,
        fontWeight: 'bold',
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: 5,
        height: 54,
    },
    loginButtonUserPortal: props => ({
            fontSize: 20,
            fontWeight: '600',
            boxShadow: '0px 3px 6px #00000029',
            borderRadius: 5,
        }
    ),
    textFieldUserPortal: props => ({
        marginTop: "16px",
        borderRadius: "5px",
        "& .MuiInputLabel-root": {

        },
        "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {

            },
            "&.Mui-focused fieldset": {
                border: `1px solid ${props?.borderColor}`,
                backgroundColor:"transparent"
            },
        },
    }) ,
    textFieldDestinationPortal: props => ({
        borderRadius: "5px",
        "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
                //border: "5px solid",
            },
        },
    }),
    checkboxUserPortal: props => ({
        "&.MuiIconButton-root": {
            padding: "0 8px 0 0"
        }
    }),
    checkboxDestinationPortal: {
        "&.MuiIconButton-root": {
            padding: "0 8px 0 0"
        }
    },
    formControlLabel: {
        marginBottom: "0",
        marginLeft: "0"
    },
    checkboxLabel: props => ({
        fontSize: "15px",
        color: props.checkboxColor,
    }),
    checkboxLabelDestinationPortal: {
        fontSize: "15px",
    },
    tabPanel: {},
    wrapper: {
        position: 'relative',
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    tabsIndicator: {
        height: "4px"
    },
    tabsRootUserPortal: {
        "& .Mui-selected ": {
            color:"#E24B33",
        },
    },
    tabsIndicatorUserPortal: {
        height: "4px",
        backgroundColor: "#E24B33"
    },
    loginTab: {
        fontSize: 12,
        textTransform: 'capitalize',
        padding: 0,
        minWidth: 50,
        overflow: 'visible',
    },
})

export default style
