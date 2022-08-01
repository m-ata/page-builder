const defaultFooterMaxWidth = 1366
const style = (theme) => ({
    footer: {
        backgroundColor: '#434341',
        "@media print": {
            display: 'none'
        }
    },
    footerGrid: {
        width: '100%',
        maxWidth: defaultFooterMaxWidth,
        margin: '0 auto',
        padding: 12,
    },
    gridContainer: {
        margin: 0,
        width: '100%',
    },
    footerLogo: {
        padding: '12px 0',
        [theme.breakpoints.down('xs')]: {
            padding: 0,
        },
    },
    footerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    footerLinkItem: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ACACAC',
        textTransform: 'uppercase',
        paddingTop: 8,
        paddingBottom: 8,
    },
    privacyPolicy: {
        fontSize: 14,
        color: '#FDFDFD',
    },
    footerCopyrightText: {
        fontSize: 12,
        color: '#DBDBDB',
        margin: '6px 8px',
    },
    poweredByImage: {
        width: 135,
        margin: '6px 8px',
        background: '#ffffff',
        padding: 5,
        borderRadius: 3,
    },
    footerDivider: {
        backgroundColor: '#6F6F6F',
    },
    footerTitleDivider: {
        backgroundColor: '#ACACAC',
        margin: '6px 0',
    },
    socialGridItem: {
        padding: '0 12px',
        [theme.breakpoints.down('xs')]: {
            padding: '0 6px',
        },
    },
    buildId: {
        display: 'block',
        textAlign: 'right',
        paddingRight: 10,
        color: '#9c9c9c61',
        fontSize: 10
    }
})

export default style