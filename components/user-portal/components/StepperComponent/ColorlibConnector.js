import React from 'react';
import { withStyles } from '@material-ui/core/styles'
import StepConnector from '@material-ui/core/StepConnector'

const ColorlibConnector = withStyles({
    alternativeLabel: {
        top: 17,
        padding:"0 8px"
    },
    active: {
        '& $line': {
            //backgroundImage: 'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
            backgroundColor: '#4666B0',
        },
    },
    completed: {
        '& $line': {
            backgroundColor: '#4666B0',
        },
    },
    line: {
        height: 2,
        border: 0,
        backgroundColor: '#4666B0',
        borderRadius: 1,
    },
})(StepConnector);

export default ColorlibConnector;
