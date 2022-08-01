const wikiNavMenuStyle = (theme) => ({
    formControl: {
        width: "calc(100% - 24px)",
        borderRadius:"4px",
        backgroundColor:"#FFF",
        "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
                borderColor: "#4666B0",
            },
            "&.Mui-focused fieldset": {
                borderColor: "#4666B0",
            },
        },
    },
    textFieldStyle: {
        "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
                borderColor: "#4666B0"
            },
            "&.Mui-focused fieldset": {
                borderColor: "#4666B0",
            },
        },
    },
    paperMenuOpen: {
        marginTop:"2px",
        position:"absolute",
        width: "calc(100% - 48px)",
        maxHeight: "500px",
        overflow: "auto",
        zIndex:"2",
        visibility:"visible"
    },
    paperMenuClose: {
        position:"absolute",
        maxHeight: "500px",
        overflow: "auto",
        visibility:"hidden"
    },
    treeItemRoot: {
        color: "#FFF",
        '& .MuiTreeItem-content:hover': {
            backgroundColor: 'rgb(230, 126, 34, 0.4)'
        },
        '& .MuiTreeItem-content': {
            borderRadius: "4px"
        },
        '& .Mui-selected > .MuiTreeItem-content, & .Mui-focused > .MuiTreeItem-content': {
            color: '#FFF',
            backgroundColor: 'rgb(230, 126, 34, 0.7)',
        },
    },
    treeItemLabelRoot: {
        display: "flex",
        alignItems: 'center',
        
    },
    treeItemLabelAction: {
        position: "absolute",
        top: "-6px",
        right: "16px",
        visibility: "hidden",
    },
    label: {
        fontWeight: 'inherit',
        color: 'inherit',
    },
    treeItemActionButton: {
        padding: "4px",
        zIndex: 1300,
        color:"inherit"
    },
    treeItemDiv: {
        position: "relative",
        "&:hover > $treeItemLabelAction": {
            visibility: "visible"
        },
    },
    addDialog: {
        padding: "16px"
    },
    saveButton: {
        "&:hover": {
            backgroundColor: "#151b26",
        },
        backgroundColor: "#151b26",
        color:"#FFF"
    },
    selectStyle: {
        width: "auto",
    }
})

export default wikiNavMenuStyle;