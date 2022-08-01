import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { COLORS } from '../../constants'

const fontStyles = {
    fontSize: '14px'
}


const useStyles = makeStyles({
    root: {
        padding: '10px 5px',
        textAlign: 'right',
        '& *': {
            display: 'inline-block'
        }
    }
});


const FooterActions = ({ primaryBtnText, secondaryBtnText, handleNextClick, handleSkipClick }) => {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            <Button size="large" style={fontStyles} onClick={handleSkipClick}>
                {secondaryBtnText}
            </Button>

            <Button size="large" style={fontStyles} onClick={handleNextClick}>
                {primaryBtnText}
            </Button>
        </div>
    )
}

export default FooterActions;

