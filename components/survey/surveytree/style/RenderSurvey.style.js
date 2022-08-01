const itemColor = '#4666B0'

const style = (theme) => ({
    saveButton: {
        /*background: `${theme.palette.primary.main}} 0% 0% no-repeat padding-box`,
        '&:hover': {
            backgroundColor: theme.palette.secondary.main,
            opacity: 0.9,
        },
        color: '#fff',*/
        boxShadow: '0px 3px 6px #00000029',
        borderRadius: 4,
        fontSize: 18,
        letterSpacing: 0.23,
        fontWeight: 400,
        [theme.breakpoints.down('sm')]: {
            fontSize: 16,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 15,
        },
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    paginationGrid: {
        width: '100%',
        margin: '32px 0',
        [theme.breakpoints.down('sm')]: {
            margin: '6px 0',
        },
    },
    paginationUl: {
        '& li': {
            margin: '0 auto',
        },
    },
    paginationItemRoot: {
        margin: '0 3px',
        [theme.breakpoints.down('md')]: {
            margin: '0 2px',
        },
        [theme.breakpoints.down('sm')]: {
            margin: '0 1px',
        },
    },
    paginationItemSelected: {
        color: '#fff',
        backgroundColor: `${theme.palette.primary.main}!important`,
    },
    paginationItemSize: {
        [theme.breakpoints.up('sm')]: {
            height: 40,
            padding: '0 10px',
            fontSize: '1rem',
            minWidth: 40,
            borderRadius: 20,
        },
    },
    paginationItemEllipsis: {
        height: 'auto',
    },
    arrowIcon: {
        color: '#fff',
        fontSize: 40,
        [theme.breakpoints.down('sm')]: {
            fontSize: 36,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 34,
        },
    },
    arrowIconButton: {
        backgroundColor: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: theme.palette.primary.light,
            opacity: 0.9,
        },
        padding: 2,
    },
    arrowIconButtonDisabled: {
        backgroundColor: `${theme.palette.secondary.main}!important`,
        opacity: 0.7,
    },
    arrowIconDivider: {
        width: 100,
        [theme.breakpoints.down('sm')]: {
            flexGrow: 1,
            width: 0,
        },
    },
    arrowText: {
        fontSize: 18,
        color: '#2F2E50',
        padding: '0 12px',
        [theme.breakpoints.down('sm')]: {
            fontSize: 15,
        },
    },
    bottomGridForMobile: {
        margin: 0,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            textAlign: 'center',
        },
    },
})

export default style