import React from "react";
import {makeStyles} from '@material-ui/core/styles'
import {
    Typography,
} from '@material-ui/core'
import clsx from 'clsx'


const useStyles = makeStyles((theme) => ({
    highPoint: {
        backgroundColor: '#70CFA2',
        color: '#ffffff',
    },
    mediumPoint: {
        backgroundColor: '#FFD740',
        color: '#ffffff',
    },
    lowPoint: {
        backgroundColor: '#ed5e4f',
        color: '#ffffff',
    },
    fullPoint: {
        fontSize: 15,
        color: '#ffffffba',
    },
    itemPoint: {
        letterSpacing: 0,
        marginRight: 3,
    },
}))


export default function ScoreBox (props) {
    const classes = useStyles();
    const { score } = props

     const pointsColors = {
        high:  score >= 4.5,
        medium:  score >= 3 && score < 4.5,
        low:  score < 3,
        unset:  score <= 0
    }

    return(
        <div className={clsx("", { [classes.highPoint]: pointsColors.high, [classes.mediumPoint]: pointsColors.medium, [classes.lowPoint]: pointsColors.low, })} style={{padding:"6px 12px", display: "inline-block", borderRadius: "8px"}}>
            <Typography style={{textAlign: "center", letterSpacing: "3px"}}>
                <span style={{fontWeight:"bold", letterSpacing: "2px"}}>{score > 0 ? score.toFixed(1) : "-"}</span>
                /5
            </Typography>
        </div>
    )
}