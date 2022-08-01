import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core'

const useStyles = makeStyles(() => ({
    root: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'start'
    },
    wrapper: {
        position: 'relative',
    },
    buttonProgress: {
        color: 'green',
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}));

export default function Index(props) {
    const classes = useStyles();
    const {
        isLoading,
        children
    } = props

    return (
        <div className={classes.root}>
            <div className={classes.wrapper}>
                {children}
                {isLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
        </div>
    );
}