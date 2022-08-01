const defaultTabsMaxWidth = 1500
const defaultTabPanelMaxWidth = 1500

const style = (theme) => ({
    root: {
        flexGrow: 1,
    },
    tabsRoot: {
        backgroundColor: theme.palette.secondary.light,
        boxShadow: '0px 2px 4px #00000014,  inset 0 -5px 1px #a9def3',
    },
    tab: {
        textTransform: 'capitalize',
        padding: 12,
        fontSize: '1.3em',
    },
    tabsIndicator: {
        height: 5
    },
    tabsFlexContainer: {
        maxWidth: defaultTabsMaxWidth,
        margin: 'auto',
    },
    tabPanel: {
        maxWidth: defaultTabPanelMaxWidth,
        margin: 'auto',
        padding: 44,
        [theme.breakpoints.down('md')]: {
            padding: 24,
        },
        [theme.breakpoints.down('xs')]: {
            padding: 12,
        },
    },
})

export default style
