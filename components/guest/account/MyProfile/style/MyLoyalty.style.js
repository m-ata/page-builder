const style = () => ({
    cardContainerWrapper:{
        background: '#fafafa',
        opacity: 0.79,
        borderRadius: 15,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        maxWidth: '374.66px',
        margin: '0 auto',
        boxShadow: '0 3px 1px #6d6d6d4d'
    },
    gridCard: {
        background: '#fff',
        boxShadow: '0 3px 1px #6d6d6d4d',
        borderRadius: 15
    },
    loyaltyMessage: {
        textAlign: 'left',
        fontSize: 23,
        color: '#707070',
    },
    submit: {
        background: '#6EC7D3 0% 0% no-repeat padding-box',
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: 5,
        textAlign: 'left',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2F3434',
        textTransform: 'initial',
    },
    left: {
        fontSize: 22,
        color: '#707070',
    },
    leftLink: {
        fontSize: 22,
        color: '#2196F3',
        fontWeight: 'bold',
        cursor: 'pointer',
        '&:hover': {
            color: '#64B5F6',
        },
    },
})

export default style
