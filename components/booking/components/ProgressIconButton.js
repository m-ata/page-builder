import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, CircularProgress } from '@material-ui/core'

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
        marginLeft: -6,
    },
}));

export default function ProgressIconButton(props) {
    const classes = useStyles();
    const { edge, ariaLabel, isLoading, onClick,children } = props

    return (
        <div className={classes.root}>
            <div className={classes.wrapper}>
                <IconButton
                    disabled={isLoading}
                    edge={edge}
                    aria-label={ariaLabel}
                    onClick={()=> onClick()}
                >
                    {children}
                </IconButton>
                {isLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
        </div>
    );
}