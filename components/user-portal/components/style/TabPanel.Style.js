import {makeStyles} from '@material-ui/core';

const useStyle = makeStyles(theme => ({
    gridMain: {
        width: '100%',
        margin: 0,
        padding: '6px',
        [theme.breakpoints.up('sm')]: {
            padding: '12px',
        },
        [theme.breakpoints.up('md')]: {
            padding: '18px',
        }
    },
    gridItem: {
        width: '100%',
        maxWidth: 1500,
    },
    gridPanel: {
        width: '100%',
        margin: 0,
        textAlign: 'left',
        padding: '12px 0',
        [theme.breakpoints.up('sm')]: {
            padding: '24px 0',
        }
    },
    title: {
        textAlign: 'left',
        font: 'Bold 26px Roboto',
        color: '#2F3434'
    },
    divider: {
        margin:'21px 0',
        color: '#707070'
    },
    editMessage: {
        textAlign: 'right',
        font: 'Bold 18px/24px Roboto',
        color: '#42B9C9',
        textDecoration: 'underline',
    },
}));

export default useStyle;
