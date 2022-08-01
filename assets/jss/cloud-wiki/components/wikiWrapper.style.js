import React from 'react';

const wikiWrapperStyle = (theme) => ({
    appBarSpace: {
        ...theme.mixins.toolbar
    },
    main: {
        flexGrow: 1,
        backgroundColor:"#F0F0F7",
        height: '100vh',
        overflow:"auto"
    },
    container: {
        paddingTop:"96px"
    },
    childWrapper: {
        marginLeft:"360px",
        backgroundColor:"#F0F0F7",
        [theme.breakpoints.down("sm")]: {
            margin:"auto",
            textAlign:"auto"
        },
    }
})

export default wikiWrapperStyle;