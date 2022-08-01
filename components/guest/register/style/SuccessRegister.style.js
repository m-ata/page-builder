const style = (theme) => ({
    title: {
        fontSize: 20,
        marginBottom: 12,
        letterSpacing: 0.4,
        color: '#2F3434',
    },
    paragraph1: {
        fontSize: 20,
        letterSpacing: 0.4,
        color: '#2F3434',
    },
    message: {
        textDecoration: 'underline',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#198C9B',
        marginTop: 20,
    },
    message1: {
        textDecoration: 'underline',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#616365',
        height: 20,
    },
    arrowIcon: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#616365',
        marginRight: 6,
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
        textAlign: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    gridItem: {
        width: '100%',
    },
})

export default style