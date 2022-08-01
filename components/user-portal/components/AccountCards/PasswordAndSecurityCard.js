import React, { useEffect, useState } from 'react';
import {useSelector} from 'react-redux';
import { makeStyles } from '@material-ui/core/styles'
import { Button, Typography, Grid, Card, CardContent, Dialog } from '@material-ui/core';
import { Lock } from '@material-ui/icons';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import {DEFAULT_OREST_TOKEN} from '../../../../model/orest/constants';
import ChangePassword from '../../../guest/account/Details/ChangePassword';



const useStyles = makeStyles(theme => ({
    subText: {
        fontSize: "14px",
        fontWeight: "600",
    },
    textColor: {
        color: theme.palette.text.main
    },
    subTitle: {
        paddingBottom: "8px",
        fontSize: "15px",
        fontWeight: "500",
        color: "#43425D",
        
    },
    cardContent: {
        padding: "24px 48px",
    },
    avatarStyle: {
        width: "4.5em",
        height: "4.5em",
        [theme.breakpoints.down("md")]: {
            margin: "auto",
            width: "4em",
            height: "4em",
        },
        color: theme.palette.text.main
    },
    gridStyle: {
        alignSelf: "center",
        [theme.breakpoints.down("md")]: {
            textAlign: "center",
        },
        
    },
}))


export default function PasswordAndSecurityCard() {



    const classes = useStyles();

    return(
        <>
            <Card>
                <CardContent className={classes.cardContent}>
                    <Grid container spacing={2}>
                        <Grid className={classes.gridStyle} item xs={12} sm={12} md={12} lg={2}>
                            <Lock className={classes.avatarStyle} />
                        </Grid>
                        <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={2}>
                            <Typography className={classes.subText} style={{opacity: ".7"}}>
                            </Typography>
                            <Typography className={classes.subText}>
                            </Typography>
                        </Grid>
                        <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={2}>
                            <Typography className={classes.subText} style={{opacity: ".7"}}>
                            </Typography>
                            <Typography className={classes.subText}>
                            </Typography>
                        </Grid>
                        <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={3}>
                            <Typography className={classes.subText} style={{opacity: ".7"}}>
                            </Typography>
                            <Typography className={classes.subText}>
                            </Typography>
                        </Grid>
                        <Grid className={classes.gridStyle} item xs={12} sm={6} md={6} lg={1}>
                            <Typography className={classes.subText} style={{opacity: ".7"}}>
                            </Typography>
                            <Typography className={classes.subText}>
                            </Typography>
                        </Grid>
                        <Grid className={classes.gridStyle} item xs={12} sm={12} md={12} lg={2}>
                            <ChangePassword />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
}