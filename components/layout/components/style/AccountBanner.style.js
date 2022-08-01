const defaultAccountProfileMaxWidth = 1500

const style = (theme) => ({
    rootCls: {
        minHeight: 45
    },
    contentCls: {
        margin: 0,
        fontSize: '0.7rem'
    },
    details: {
        maxWidth: defaultAccountProfileMaxWidth,
        margin: 'auto',
        marginBottom: 20
    },
    memberType: {
        color: '#49777f',
        padding: 5,
        lineHeight: 1,
        fontSize: '0.9em',
        background: '#c2d8da',
        fontWeight: 'bold',
        borderRadius: 2,
        [theme.breakpoints.down('xs')]: {
            margin: '0 auto'
        },
    },
    memberFullName: {
        fontWeight: 700,
        display: 'block',
        fontSize: '1.5em',
        lineHeight: 1,
        color: '#5b5b5b',
        [theme.breakpoints.down('xs')]: {
            fontSize: '1.5em',
            margin: '0 auto'
        },
    },
    textName: {
        fontSize: 27,
        fontWeight: 'bold',
        color: '#2F3434',
    },
    textYourNext: {
        marginLeft: 18,
        fontSize: 22,
        letterSpacing: 2.2,
        color: '#2F3434',
    },
    miniDivider: {
        width: 2,
        height: 100,
    },
    memberSince: {
        textAlign: 'left',
        fontSize: 16,
        color: '#2F3434',
        opacity: 1,
    },
    memberSinceDate: {
        fontWeight: 'bold',
        color: '#262626',
    },
    cardContainer: {
        height: 182,
        //background: 'linear-gradient(0deg, rgb(241 241 241 / 63%) 0%, rgb(169 169 169 / 62%) 100%)',
        boxShadow: '0 3px 1px #6d6d6d4d',
        borderRadius: 15,
        padding: 6,
    },
    cardDivider: {
        backgroundColor: '#fff3',
        height: 2,
        opacity: 1,
    },
    cardType: {
        textAlign: 'left',
        fontSize: 20,
        letterSpacing: 2,
        fontWeight: 'bold',
        textShadow: '0px 3px 6px #53535329',
        textTransform: 'uppercase',
        opacity: 1,
    },
    cardBonus: {
        fontSize: 36,
        letterSpacing: 0.72,
        textAlign: 'left',
        opacity: 1,
        marginLeft: 2,
        marginTop: 35,
    },
    cardPts: {
        fontSize: 20,
        letterSpacing: 0.4,
        marginLeft: 6,
    },
    cardClientName: {
        textAlign: 'left',
        fontSize: 13,
        letterSpacing: '0.39px',
        opacity: 1,
        textShadow: '0px 3px 6px #00000029',
        textTransform: 'uppercase',
        marginLeft: 6,
    },
    cardClientId: {
        textAlign: 'right',
        fontSize: 13,
        letterSpacing: '0.39px',
        opacity: 1,
        textShadow: '0px 3px 6px #00000029',
        textTransform: 'uppercase',
        marginRight: 6,
    },
    cardBonusLeft: {
        fontSize: 12,
        marginLeft: 5,
        marginTop: -5
    },
    cardBonusLeftPts: {
        fontSize: 15,
    },
    arrowIcon: {
        background: '#42B9C9 0% 0% no-repeat padding-box',
        color: '#FFFFFF',
        opacity: 0.5,
    },
})

export default style