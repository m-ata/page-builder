import React from 'react';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles({
    root: {
        padding: '0 10px',
        height: '345px',
        overflowY: 'auto',
        boxSizing: 'border-box',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
            display: 'none'
        }
    }
});

const Stem = ({ children }) => {
    const classes = useStyles();
    return (
        <section className={classes.root}>
            {children}
        </section>
    );
}

export default Stem;