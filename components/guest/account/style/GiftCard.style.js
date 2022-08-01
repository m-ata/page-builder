const style = (theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: 10,
        margin: 'auto',
        maxWidth: 500,
    },
    active: {
        boxShadow: '0 0 1px 2px #ffe187',
        transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
    },
    image: {
        width: 128,
        height: 128,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
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