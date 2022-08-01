import { green } from '@material-ui/core/colors'

const style = () => ({
    gridContainer: {
        margin: 0,
        marginBottom: 20,
        width: '100%'

    },
    gridContainerToolbar: {
        width: 'calc(100% - 16px)',
        margin: 0,
        marginLeft: 8,
        marginBottom: 20,
        background: '#f3f3f3',
        borderRadius: 4
    },
    proceedButton: {
        color: '#ffffff',
        backgroundColor: green[400],
        '&:hover': {
            backgroundColor: green[600],
        },
        '&.Mui-disabled': {
            background: '#d1d1d1'
        }
    },
    gridItem: {
        width: '100%',
        padding: '18px',
        position: 'relative'
    },
    nothingToShow: {
        marginTop: 15,
        textAlign: 'center',
    },
    showMoreText: {
        textAlign: 'left',
        textDecoration: 'underline',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#198C9B',
    },
    showMoreIcon: {
        color: '#198C9B',
    },
})

export default style