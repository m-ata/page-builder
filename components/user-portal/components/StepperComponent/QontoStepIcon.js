import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import clsx from 'clsx';
import {Check} from '@material-ui/icons';

const useQontoStepIconStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
    active: (props) =>  ({
        color: '#FFF',
        backgroundColor: theme.palette.primary.main,
        borderRadius: '50%',
        width: props.iconWidth || 38,
        height: props.iconWidth || 38,
    }),
    circle: props => ({
        fontSize: '14px',
        border: `1px solid ${theme.palette.primary.main}`,
        display: 'flex',
        width: props.iconWidth || 38,
        height: props.iconWidth || 38,
        alignItems: 'center',
        justifyContent:"center",
        borderRadius: '50%',
        backgroundColor: props.completed ? theme.palette.primary.main : '',
        color: props.active ? '#FFF' : theme.palette.text.main
    }),
    completed: {
        fontSize:"18px",
        color: '#FFF',
        zIndex: 1,
    },
}));

export default function QontoStepIcon(props) {
    const { active, completed, icon, width } = props;
    const classes = useQontoStepIconStyles({iconWidth: width, completed: completed, active: active});
    
    return (
        <div
            className={clsx(classes.root, {
                [classes.active]: active,
            })}
        >
            {completed ? <div className={classes.circle} ><Check className={classes.completed} /></div> : <div className={classes.circle}>{icon}</div>}
        </div>
    );
}