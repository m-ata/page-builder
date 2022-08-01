const style = (theme) => ({
    loginBannerGrid: {
        background: `transparent radial-gradient(closest-side at 50% 42%, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.light} 49%, ${theme.palette.secondary.dark} 200%) 0% 0% no-repeat padding-box`,
        opacity: 1,
    },
    listItem: {
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: '0.4px',
        color: theme.palette.secondary.contrastText,
        textAlign: 'center',
        [theme.breakpoints.down('xs')]: {
            fontSize: 13,
        },
        textShadow: '0px 1px 1px #949797',
    },
    loginBannerLogo: {
        width: '100%',
        [theme.breakpoints.down('md')]: {
            width: 250,
            maxHeight: 100,
            objectFit: 'contain',
        },
        [theme.breakpoints.down('xs')]: {
            width: 175,
            maxHeight: 100,
            objectFit: 'contain',
        },
    },
    memberClubText: {
        fontSize: 32,
        letterSpacing: '0.64px',
        [theme.breakpoints.down('xs')]: {
            fontSize: 22,
        },
        textShadow: '0px 1px 1px #949797',
        color: theme.palette.secondary.contrastText,
    },
})

export default style