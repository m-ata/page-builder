const ReservationStyle = () => ({
    more: {
        textAlign: 'left',
        textDecoration: 'underline',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#198C9B',
    },
    expand: {
        color: '#198C9B',
    },
    subTitle: {
        borderBottom: '1px solid #f1f1f1',
        fontWeight: 700,
        fontSize: '1.20rem',
        color: '#737373'
    },
    dialogAction: {
        padding: '8px 24px'
    },
    closeButton: {
        '@media print': {
            display: 'none'
        }
    }
})
export default ReservationStyle