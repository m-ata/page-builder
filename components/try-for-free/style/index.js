import { makeStyles } from '@material-ui/core/styles'

const tryForFreeStyle = makeStyles(() => ({
    '@global': {
        'body': {
            backgroundColor: '#e2e8f0',
        },
        'button': {
            '&:focus': {
                outline: '0!important',
            },
        },
    },
    stepperLabel: {
        left: 0,
        width: '100%',
        position: 'absolute',
        marginTop: -75,
        padding: '5px 0',
        backgroundColor: 'transparent'
    },
    tryCloudContainer: {
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 10%), 0 1px 2px 0 rgb(0 0 0 / 6%)',
        backgroundColor: '#fff',
        border: 0,
        borderRadius: '.25rem',
        position: 'relative',
        top: 150,
        zIndex: 2,
        paddingTop: 30,
        paddingBottom: 30,
    },
    formControl: {
        width: '100%',
    },
    toogleButtonGroup: {
        width: '100%',
    },
    toogleButton: {
        width: '50%',
        textTransform: 'capitalize',
    },
    toogleButtonLabel: {
        paddingLeft: 8,
    },
    congratsLabel: {
        fontWeight: 'lighter'
    },
    congratsDescription: {
        fontWeight: 'lighter'
    }
}))

export default tryForFreeStyle