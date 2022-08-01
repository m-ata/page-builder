const style = (theme) => ({
    '@global': {
        'html,body,#__next': {
            height: '100%',
        },
        '#__next': {
            display: 'flex',
            flexDirection: 'column',
        },
        '*:focus': {
            outline: 'none',
        },
        'button:focus': {
            outline: 'none',
        },
        a: {
            color: 'inherit',
            textDecoration: 'none',
        },
        'a:hover': {
            color: 'inherit',
            textDecoration: 'none',
        },
    },
    section: {
        flexGrow: 1,
        backgroundColor: '#F0F0F7',
    },
    main: {
        flexGrow: 1,
    },
    appCardRoot: {
       '& > .MuiCardContent-root:last-child': {
           paddingBottom: 0
       }
    },
    appCardContent: {
        paddingTop: 5,
    },
    cardHeaderRoot: {
        '& > .MuiCardHeader-action': {
            alignSelf: 'unset'
        }
    }
})

export default style