const style = (theme) => ({
    privacyText: {
        textAlign: 'left',
        fontSize: 18,
        color: '#2F3434',
    },
    trm: {
        textAlign: 'left',
        fontSize: 18,
        color: '#2F3434',
    },
    editIcon: {
        background: '#42B9C9 0% 0% no-repeat padding-box',
        borderRadius: 5,
        color: '#FCFCFC',
    },
    button: {
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: 5,
        height: 54,
        maxWidth: 425,
    },
    buttonTypography: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'initial',
    },
    buttonConfirm: {
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: 5,
        height: 54,
        maxWidth: 425,
        background: '#4caf50cf',
        color: '#fff',
    },
    textContactUs: {
        color: '#198C9B',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    reservatSignature: {
        display: 'block',
        marginTop: 13,
    },
    reservatSignatureError: {
        color: 'red',
    },
    signPadContainter: {
        borderBottom: '1px solid #858585b3',
        background: '#e4e4e4',
        borderRadius: '4px 4px 0 0',
    },
})

export default style