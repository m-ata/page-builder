import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import clsx from 'clsx';

const useStyle = makeStyles({
    icon: {
        border:"3px solid #9AAAD3",
        borderRadius:'50%',
        width: "30px",
        height: "30px",
        transition:"fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
    },
    checkedIcon: {
        border:"3px solid #4666B0",
        '&:before': {
            borderRadius:"50%",
            marginTop:"5px",
            marginLeft:"5px",
            backgroundColor: '#4666B0',
            display: 'block',
            width: "14px",
            height: "14px",
            content: '""',
            transition:"fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        },
    },
});

export default function customRadioButton(props) {
    const classes = useStyle();
    
    return (
        <Radio
            className={classes.root}
            disableRipple
            color="default"
            checkedIcon={<span className={clsx(classes.icon, classes.checkedIcon)} />}
            icon={<span className={classes.icon} />}
            {...props}
        />
    );
}
