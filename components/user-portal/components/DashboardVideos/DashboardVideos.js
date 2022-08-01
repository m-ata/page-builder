import React, { useState, useEffect, useContext } from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {setToState} from '../../../../state/actions';
import { connect, useSelector } from 'react-redux';
import {Typography, Grid, Card, CardContent, Button, TextField, InputAdornment, MuiThemeProvider, Checkbox} from '@material-ui/core';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import YoutubeVideoViewer from '../../../../@webcms-ui/core/youtube-video-viewer';

const useStyles = makeStyles(theme => ({
    mainTitle: {
        paddingBottom: "40px",
        fontSize: "28px",
        fontWeight: "500",
        color: "#43425D"
    },
    allVideosText: {
        textDecoration:"underline",
        fontSize: "20px",
        color:"#2697D4",
        textAlign: "right"
    }
}))

function DashboardVideos() {
    const classes = useStyles();
    
    const {t} = useTranslation();
    
    return(
        <React.Fragment>
            <Typography className={classes.mainTitle}>
                {t("str_recommendedByHotech")}
            </Typography>
            <Grid container spacing={8}>
                <Grid item xs={12} sm={12} md={6}>
                    <Card>
                        
                        <CardContent>
                            <YoutubeVideoViewer
                                videoId={"CwRQ9RF8C3I"}
                                width={"100%"}
                                height={370}
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    <Card>
                        <CardContent>
                            <YoutubeVideoViewer
                                videoId={"nEfTQzrgqBQ"}
                                width={"100%"}
                                height={370}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <div style={{textAlign: "right", paddingTop:"16px"}}>
                <a className={classes.allVideosText}
                   href={"https://www.youtube.com/channel/UCjLJdqG0yzbomEvFWvF5-IA"}
                   target={"_blank"}
                >
                    {t("str_seeAllVideos")}
                </a>
            </div>
        </React.Fragment>
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DashboardVideos)