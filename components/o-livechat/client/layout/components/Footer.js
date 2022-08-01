import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { COLORS } from "../../../constants/index";

const useStyles = makeStyles({
    root: {
        borderTop: `1px solid ${COLORS.borderColor}`
    }
});

const Footer = ({ children }) => {
    const classes = useStyles();
    return (
        <section className={classes.root}>
            {children}
        </section>
    );
}

export default Footer;