import {Typography} from "@material-ui/core";
import React from "react";


const Copyright = () => {
    return (
        <Typography align="center">
            <a href={'https://hotech.systems/'} target={'_blank'}>
                <img src={'imgs/powered-by.png'} style={{ width: 150 }} alt="powered by hotech" />
            </a>
        </Typography>
    )
}

export default Copyright