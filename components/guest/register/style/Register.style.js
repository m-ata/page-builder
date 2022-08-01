const defaultGridMaxWidth = 1366

const style = () => ({
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        letterSpacing: 0.52,
        color: '#2F3434',
    },
    submit: {
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: 5,
        fontSize: 22,
        fontWeight: 'bold',
        maxWidth: 350,
        height: 60,
    },
    registerContainer: {
        margin: '24px 0',
    },
    gridContainer: {
        width: '100%',
        maxWidth: defaultGridMaxWidth,
        margin: 'auto',
        padding: '0 12px',
    },
    grid: {
        width: '100%',
        maxWidth: defaultGridMaxWidth,
        margin: 'auto',
    },
    divider: {
        margin: '30px 0',
    },
    trm: {
        fontSize: 18,
        color: '#2F3434',
        fontWeight: 'normal',
    },
    privacyText: {
        fontSize: 18,
        color: '#2F3434',
        fontWeight: 'normal',
    },
    forgetPw: {
        fontSize: 18,
        color: '#198C9B',
        fontWeight: 'bold',
        textDecoration: 'underline',
        textAlign: 'center',
    },
    formControl: {
        padding: '0 12px',
    },
})

export default style