const style = (theme) => ({
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2F3434',
        letterSpacing: '0.52px',
    },
    message1: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#616365',
        height: 20,
        textDecoration: 'underline',
    },
    arrowIcon: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#616365',
        marginRight: 6,
    },
    submit: {
        color: '#2F3434',
        fontSize: 22,
        fontWeight: 'bold',
        background: '#66D0DD 0% 0% no-repeat padding-box',
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: 5,
        height: 60,
    },
    divider: {
        color: '#FCFCFC',
        margin: 40,
        [theme.breakpoints.down('xs')]: {
            margin: 12,
            marginBottom: 40,
        },
    },
    grid: {
        width: '100%',
        margin: 0,
        paddingTop: 12,
    },
    gridItem1: {
        width: '100%',
        maxWidth: 425,
    },
})

export default style