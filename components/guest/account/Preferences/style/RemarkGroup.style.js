const RemarkGroupStyle = () => ({
    formLabel: {
        textAlign: 'left',
        fontSize: 22,
        color: '#2F3434',
    },
    number: {
        textAlign: 'left',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: '0.44px',
        color: '#2F3434',
    },
    accordionSummaryStyle: {
        "& .MuiAccordionSummary-root": {
            width: '100%',
        },
        "& .MuiAccordionSummary-content": {
            display: 'unset',
            width: '100%'
        },
    },
    summaryContainer:{
        display: 'flex',
        alignItems: 'center',
        "&:hover $addRemarkDiv": {
            opacity: 1
        }
    },
    addRemarkDiv: {
        opacity: 0,
        marginLeft: 'auto'
    }
})
export default RemarkGroupStyle