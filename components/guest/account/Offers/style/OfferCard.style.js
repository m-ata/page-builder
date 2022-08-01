const style = (theme) => ({
    root: {
        background: '#ffffff 0% 0% no-repeat padding-box',
        boxShadow: '0px 3px 6px #122D3129',
        paddingBottom: 10,
        borderRadius: 10
    },
    nameText: {
        color: theme.palette.primary.main,
        fontSize: '1.30em',
        lineHeight: 1.2,
        fontWeight: 600,
        minHeight: '3.3rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    descText: {
        marginTop: 10,
        minHeight: 40
    },
    offerImage: {
        '& img': {
            borderRadius: 10
        }
    },
    ctaButton: {
        borderWidth: 2.3,
        fontWeight: 400,
        margin: '0 auto',
        width: '95%',
        '&:hover': {
            borderWidth: 2.3,
            fontWeight: 400,
        }
    },
    descriptionText: {
        fontSize: 18,
        color: '#707070',
        textAlign: 'center',
        padding: '0 6px',
        height: 48,
        overflow: 'auto',
    },
    paper: {
        position: 'absolute',
        top: 10,
        background: '#E2F4F7 0% 0% no-repeat padding-box',
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: '6px 6px 6px 0px',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2F3434',
    },
    priceBox: {
        position: 'absolute',
        top: 0,
        background: '#ffffffc9',
        marginTop: '20%',
        padding: 7,
        paddingBottom: 5,
        paddingLeft: 10,
        borderRadius: '0px 5px 5px 0px',
        boxShadow: '3px 0 6px #17171766'
    },
    night: {
        fontSize: 14,
        color: '#2F3434',
        marginLeft: 5,
    },
    form: {
        alignItems: 'center',
    },
    submit: {
        backgroundColor: '#FFFFFF',
        border: '2px solid #198C9B',
        borderRadius: 6,
    },
    book: {
        fontSize: 16,
        color: '#198C9B',
    },
    media: {
        height: 221,
        backgroundSize: 'cover',
    },
})

export default style