const PreferencesStyle = () => ({
    tooltip: {
        fontSize: 18,
        color: '#434341',
    },
    editIcon: {
        background: '#42B9C9 0% 0% no-repeat padding-box',
        borderRadius: 5,
        color: '#FCFCFC',
    },
    inputAdornmentStyle: {
        position:"absolute",
        right:"4px",
        top:"20px",
        "&.MuiInputAdornment-positionStart": {
            marginRight:"0"
        },
    },
    changesDiv: {
        position: "absolute",
        top:"15px",
        lineHeight: "0",
        fontSize: "42px",
        width: "0",
        cursor: "default"
    }
})
export default PreferencesStyle