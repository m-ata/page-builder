const defaultGridMaxWidth = 1366

const style = (theme) => ({
    grid: {
        width: '100%',
        maxWidth: defaultGridMaxWidth,
        margin: 'auto',
        padding: '24px 0',
        [theme.breakpoints.down('md')]: {
            padding: '12px 0',
        },
        [theme.breakpoints.down('sm')]: {
            padding: 0,
        },
    },
    gridItem: {
        maxWidth: 450,
    },
    divider: {
        margin: 'auto',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        letterSpacing: 0.52,
        color: '#2F3434',
    },
    submit: {
        fontSize: 22,
        fontWeight: 'bold',
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: 5,
        height: 60,
    },
    forgetPw: {
        fontSize: 18,
        color: '#198C9B',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
})

export default style