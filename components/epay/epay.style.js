const style = (theme) => ({
    wrapper: {
        marginTop: 20,
        marginBottom: 40,
        maxWidth: 700,
    },
    paperTopWrap:{
        marginTop: 20,
        marginBottom: 20
    },
    textAlignRight: {
      textAlign: 'right'
    },
    accordionSummaryContent: {
        margin: '5px 0!important'
    },
    accordionSummaryExpanded: {
        minHeight: '40px!important'
    },
    infoTitle: {
        lineHeight: 2
    },
    payAmountTitle: {
        color: '#4a4a4a'
    },
    payAmount: {
        marginTop: 3,
        boxShadow: '0 0 1px 2px #4caf5096',
        lineHeight: '1.60',
        background: '#ffffff',
        fontSize: '1rem',
        position: 'absolute',
        right: '55px',
        borderRadius: '2px',
        padding: '5px',
        paddingRight: 10,
        paddingLeft: 10
    },
    paperBottomWrap: {},
    payButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 3,
        border: 0,
        color: 'white',
        height: 48,
        padding: '0 30px',
        boxShadow: '0 3px 5px 2px #A5D6A7',
        '&:hover': {
            backgroundColor: '#5ccc61'
        }
    },
    yesConfirmButton: {
        background: 'fff',
        borderRadius: 3,
        border: '2px solid',
        height: 45,
        padding: '0 5px',
        boxShadow: 'none',
        color: '#8BC34A',
        width: '100%',
        textTransform: 'initial',
        lineHeight: 1,
        fontWeight: 'bolder'
    },
    noConfirmButton: {
        background: 'fff',
        borderRadius: 3,
        border: '2px solid',
        height: 45,
        padding: '0 5px',
        boxShadow: 'none',
        color: 'rgb(255 87 34 / 58%)',
        width: '100%',
        textTransform: 'initial',
        lineHeight: 1,
        fontWeight: 'bolder'
    },
    editConfirmButton: {
        background: 'fff',
        borderRadius: 3,
        border: '2px solid',
        height: 45,
        padding: '0 5px',
        boxShadow: 'none',
        color: '#4a8bc3',
        width: '100%',
        textTransform: 'initial',
        lineHeight: 1,
        fontWeight: 'bolder'
    },
    listItem: {
        borderBottom: '1px dotted #d8d8d8'
    },
    listItemTitlePrimary: {
        fontWeight: 500,
        color: '#565656',
        fontSize: '1.1em'
    },
    listItemTitlePricePrimary: {
        fontWeight: 'bolder',
        color: '#565656',
        fontSize: '1.1em'
    },
    listItemBody2: {
        fontSize: '1.2em'
    },
    detailsRoot: {
        borderTop: '1px solid #cecdd4',
        padding: 0
    },
    bottomBanner:{
        textAlign: 'right',
    },
    bottomBannerImg:{
        maxWidth: 320
    },
    termsAndConditions: {
        textAlign: 'center'
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    backdropDiv: {
        zIndex: theme.zIndex.drawer + 2,
    },
    backdropDivChip: {
        backgroundColor: '#fbfbfbd9'
    }
})

export default style