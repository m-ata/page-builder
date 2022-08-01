import React from 'react';
import { makeStyles } from '@material-ui/core/styles'


const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: "100%",
        width: "100%",
        height: "auto"
    }
}))

export const HomeSliderPlaceHolder = () => {
    const classes = useStyles();
    return(
        <svg className={classes.root} xmlns="http://www.w3.org/2000/svg" width="1366" height="587" viewBox="0 0 1366 587">
            <g id="Group_17225" data-name="Group 17225" transform="translate(-50 -126)">
                <g id="Group_17192" data-name="Group 17192" transform="translate(-11 -34)">
                    <rect id="Rectangle_25504" data-name="Rectangle 25504" width="1160" height="383" rx="10" transform="translate(164 160)" fill="#c2d8da"/>
                    <path id="Rectangle_25505" data-name="Rectangle 25505" d="M0,0H63A10,10,0,0,1,73,10V373a10,10,0,0,1-10,10H0a0,0,0,0,1,0,0V0A0,0,0,0,1,0,0Z" transform="translate(61 160)" fill="#cedfe1"/>
                    <path id="Rectangle_25506" data-name="Rectangle 25506" d="M10,0H73a0,0,0,0,1,0,0V383a0,0,0,0,1,0,0H10A10,10,0,0,1,0,373V10A10,10,0,0,1,10,0Z" transform="translate(1354 160)" fill="#cedfe1"/>
                </g>
                <rect id="Rectangle_25512" data-name="Rectangle 25512" width="785" height="13" rx="6.5" transform="translate(341 608)" fill="#c2d8da"/>
                <rect id="Rectangle_25513" data-name="Rectangle 25513" width="145" height="22" rx="11" transform="translate(661 556.5)" fill="#c2d8da"/>
                <rect id="Rectangle_25514" data-name="Rectangle 25514" width="298" height="36" rx="5" transform="translate(584 677)" fill="#c2d8da"/>
            </g>
        </svg>

    )
}