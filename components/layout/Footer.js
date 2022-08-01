import React, { useContext, useEffect, useState } from 'react'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import styles from './style/Footer.style'
import WebCmsGlobal from 'components/webcms-global'
import WebsiteFooter from 'components/website/footer/WebsiteFooter'
import {updateState} from "../../state/actions";
import {connect} from "react-redux";

const useStyles = makeStyles(styles)

const Footer = (props) => {
    const { updateState } = props
    const classes = useStyles()
    const { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
    const footerColor = WEBCMS_DATA.assets.colors.secondary.main
    const [ verNo, setVerNo ] = useState(false)

    useEffect(() => {
        setVerNo(window.__NEXT_DATA__.buildId || '')
    }, [])

    useEffect(() => {
        GENERAL_SETTINGS.GUESTAPP_FOOTER && updateState('website', 'defaultFooter', GENERAL_SETTINGS.GUESTAPP_FOOTER);
    }, [GENERAL_SETTINGS.GUESTAPP_FOOTER]);

    return (
        GENERAL_SETTINGS.GUESTAPP_FOOTER ?
            <React.Fragment>
                <WebsiteFooter assets={WEBCMS_DATA.assets}/>
                <footer className={classes.footer} style={{ backgroundColor: footerColor }}>
                    <Grid container spacing={1} className={classes.footerGrid}>
                        <Grid item xs={12}>
                            <Divider className={classes.footerDivider}/>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container justify={'space-between'} alignItems={'center'}
                                  className={classes.gridContainer}>
                                <Grid item>
                                    <Typography className={classes.footerCopyrightText}>
                                        Copyright © {new Date().getFullYear()} {WEBCMS_DATA.assets.meta.title}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <a href={'https://hotech.systems/'} target={'_blank'}>
                                        <img
                                            src={'imgs/powered-by.png'}
                                            alt="powered by hotech"
                                            className={classes.poweredByImage}
                                        />
                                    </a>
                                    <span className={classes.buildId}>v.{verNo || ''}</span>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </footer>
            </React.Fragment>
        :
        <footer className={classes.footer}>
            <Grid container spacing={1} className={classes.footerGrid}>
                <Grid item xs={12}>
                    <Grid container spacing={3} justify={'space-around'} className={classes.gridContainer}>
                        <Grid item xs={12}>
                            <Grid container justify={'center'} className={classes.gridContainer}>
                                <Grid item xs={12} style={{ textAlign: 'center' }}>
                                    <div style={{
                                        display: 'block',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        boxSizing: 'border-box',
                                        margin: '0px',
                                    }}>
                                        <img alt="logo"
                                             src={GENERAL_SETTINGS.STATIC_URL + WEBCMS_DATA.assets.images.altLogo}
                                             decoding="async" style={{
                                            visibility: 'visible',
                                            inset: '0px',
                                            boxSizing: 'border-box',
                                            padding: '0px',
                                            border: 'none',
                                            margin: 'auto',
                                            display: 'block',
                                            maxWidth: '100%',
                                            minHeight: '100%',
                                            maxHeight: '100%',
                                        }}/>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Divider className={classes.footerDivider} />
                </Grid>
                <Grid item xs={12}>
                    <Grid container justify={'space-between'} alignItems={'center'} className={classes.gridContainer}>
                        <Grid item>
                            <Typography className={classes.footerCopyrightText}>
                                Copyright © {new Date().getFullYear()} {WEBCMS_DATA.assets.meta.title}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <a href={'https://hotech.systems/'} target={'_blank'}>
                                <img
                                    src={'imgs/powered-by.png'}
                                    alt="powered by hotech"
                                    className={classes.poweredByImage}
                                />
                            </a>
                            <span className={classes.buildId}>v.{verNo || ''}</span>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </footer>
    )
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
});

export default connect(null, mapDispatchToProps)(Footer);