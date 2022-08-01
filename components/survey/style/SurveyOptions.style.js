const itemColor = '#4666B0'
const itemColorDisabled = '#BFC8E2'

const style = (theme) => ({
    surveyTitle: {
        fontSize: 36,
        letterSpacing: 0.45,
        textAlign: 'center',
        margin: '36px 0',
        overflowWrap: 'break-word',
        [theme.breakpoints.down('sm')]: {
            fontSize: 32,
            margin: '24px 0',
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 27,
            margin: '18px 0',
        },
    },
    groupTitle: {
        fontSize: 25,
        letterSpacing: 0.32,
        margin: 0,
        alignSelf: 'center',
        [theme.breakpoints.down('sm')]: {
            fontSize: 21,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 19,
        },
    },
    questionTitle: {
        fontSize: 20,
        letterSpacing: 0.25,
        [theme.breakpoints.down('sm')]: {
            fontSize: 17,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 15,
        },
    },
    answerText: {
        color: '#6B6B6B',
        fontSize: 16,
        [theme.breakpoints.down('sm')]: {
            fontSize: 14,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 13,
        },
    },
    textField: {
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    textFieldInput: {
        fontSize: 17,
        [theme.breakpoints.down('sm')]: {
            fontSize: 14,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 13,
        },
    },
    textFieldLabel: {
        // fontSize: 16,
        // [theme.breakpoints.down('sm')]: {
        //     fontSize: 15,
        // },
        // [theme.breakpoints.down('xs')]: {
        //     fontSize: 14,
        // },
    },
    expandMoreIcon: {
        color: theme.palette.secondary.light,
        fontSize: 35,
        [theme.breakpoints.down('sm')]: {
            fontSize: 32,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 30,
        },
    },
    formControlLabel: {
        width: 'fit-content',
        margin: 0,
    },
    optionContainer: {
        //maxWidth: 500,
        margin: '12px 0',
    },
    questionContainer: {
        margin: '24px 12px',
    },
    subQuestionContainer: {
        margin: '48px 0 0 0',
    },
    expansionPanel: {
        boxShadow: 'none',
        backgroundColor: 'transparent',
    },
    expansionPanelSummary: {
        background: theme.palette.secondary.main,
        color: '#ffffff',
        minHeight: '50px!important',
        [theme.breakpoints.down('sm')]: {
            margin: 0,
        },
    },
    expansionPanelDetails: {
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
    },
    scoreIcon: {
        fontSize: 70,
        [theme.breakpoints.down('sm')]: {
            fontSize: 60,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 50,
        },
    },
    uploadFileButton: {
        color: '#fff',
        textTransform: 'initial',
        fontSize: 17,
        [theme.breakpoints.down('sm')]: {
            fontSize: 14,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 13,
        },
    },
    controlRoot: {
       color: `${theme.palette.primary.main}!important`,
    },
    controlChecked: {
        color: `${theme.palette.primary.main}!important`,
    },
    controlDisabled: {
        color: `${theme.palette.secondary.main}!important`,
    },
    fileUploadPreviewImage: {
        objectFit: 'contain',
        margin: 0,
    },
    fileUploadPreviewParagraph: {
        fontWeight: 500,
        color: '#707070',
        margin: '24px 6px',
    },
    button: {
        color: `${theme.palette.primary.main}!important`,
    },
    tabsRoot: {
        color: '#fff',
    },
    tabsIndicator: {
        height: 5,
        backgroundColor: '#000',
        display: 'none',
    },
    tabsFlexContainer: {
        margin: 'auto',
    },
    tabsScrollButtons: {
        width: '65px!important',
        background: theme.palette.primary.main,
        marginLeft: 5,
        color: '#ffffff',
        '&:first-child': {
            marginLeft: 0,
            marginRight: 5
        },
    },
    tabRoot: {
        marginRight: 4,
        flexGrow: 1,
        maxWidth: 'none',
        [theme.breakpoints.up('sm')]: {
            minHeight: 70
        },
    },
    tabWrapper: {
        fontSize: 22,
        letterSpacing: 0.32,
        color: '#FFFFFF',
        margin: 0,
        [theme.breakpoints.down('sm')]: {
            fontSize: 18,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 16,
        },
        flexDirection: 'row',
    },
    tabLabelIcon: {},
    tabPanel: {
        margin: 'auto',
        paddingTop: 12,
        [theme.breakpoints.down('md')]: {
            paddingTop: 6,
        },
        [theme.breakpoints.down('xs')]: {
            paddingTop: 10,
        },
    },
    tabTextColorInherit: {
        opacity: 0.4,
    },
    tabScrollRoot: {
        width: 20,
        '& svg': {
            fontSize: 28,
        },
    },
    tabScrollDisabled: {
        opacity: '0.4!important',
    },
    groupImage: {
        maxHeight: 40,
        margin: '0 6px 0 0!important',
        [theme.breakpoints.down('sm')]: {
            zoom: '85%',
        },
        [theme.breakpoints.down('sm')]: {
            zoom: '70%',
        },
        [theme.breakpoints.down('xs')]: {
            zoom: '50%',
        },
    },
    answerImage: {
        width: '100%',
        height: '100%',
        maxWidth: 400,
        maxHeight: 400,
    },
    isRequiredQuestion: {
        color: '#db5864'
    }
})

export default style
