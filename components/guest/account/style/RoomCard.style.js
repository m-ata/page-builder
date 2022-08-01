const style = (theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        margin: 'auto',
        maxWidth: 500,
        cursor: 'pointer',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        position: 'relative',
    },
    active: {
        borderColor:'#5bdb78',
        '& > div': {
            background: '#c4ffd121'
        }
    },
    image: {
        width: 128,
        height: 128,
        display: 'flex',
        alignItems: 'center'
    },
    img: {
        margin: 'auto',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'cover',
        height: '85%',
        borderRadius: 5
    },
    textAndIcon: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.primary.main,
        '& p':{
            padding: 5
        }
    },
    propValue:{
        paddingLeft: 29
    },
    roomNo: {
        color: 'grey',
    }
})

export default style