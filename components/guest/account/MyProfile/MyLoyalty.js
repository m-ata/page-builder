import React, { useState } from 'react'
import styles from './style/MyLoyalty.style'
import stylesTabPanel from '../style/TabPanel.style'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { LinearProgress, makeStyles } from '@material-ui/core'
import { connect } from 'react-redux'
import NumberFormat from 'react-number-format'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { withStyles } from '@material-ui/core/styles'
import SeeAdvantages from '../LoyaltyClub/SeeAdvantages'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

const BorderLinearProgress = withStyles({
    root: {
        background: '#ccdfe2',
        height: 8,
    },
    bar: {
        borderRadius: 0,
        background: '#49777f',
    },
})(LinearProgress)

const MyLoyalty = (props) => {
    const { state } = props
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()
    const { t } = useTranslation()
    const nextCardTypeCode = state.memCardNext && state.memCardNext.nextcardtypecode
    const [openSeeAdvantages, setOpenSeeAdvantages] = useState(false)

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={12}>
                    <div className={classes.cardContainerWrapper}>
                        <Grid container alignItems={'center'} className={classes.cardContainer}>
                            {state.memCardNext && (
                                <React.Fragment>
                                    {nextCardTypeCode ? (
                                        <React.Fragment>
                                            <Grid item xs={12} className={classesTabPanel.gridItem}>
                                                <Grid container justify={'center'} alignItems={'center'}>
                                                    <Grid item xs={12}>
                                                        <NumberFormat
                                                            value={state.memCardNext && state.memCardNext.nextbonusreq}
                                                            displayType={'text'}
                                                            decimalScale={2}
                                                            isNumericString={true}
                                                            thousandSeparator={true}
                                                            renderText={(value) => (
                                                                <Typography className={classes.left} align={'center'}>
                                                                    {t('str_onlyLeftToCard', {
                                                                        currentpts: value || 0,
                                                                        nextcardcode: nextCardTypeCode,
                                                                    })}
                                                                </Typography>
                                                            )}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12} className={classesTabPanel.gridItem}>
                                                <Grid container>
                                                    <Grid item xs={12} className={classes.progress}>
                                                        <BorderLinearProgress
                                                            variant='determinate'
                                                            value={(state.memCardNext && (state.memCardNext.totalbonus / state.memCardNext.nextbonustotal) * 100) || 0}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </React.Fragment>
                                    ): null}
                                    <Grid item xs={12} className={classesTabPanel.gridItem}>
                                        <Grid container justify={'center'} alignItems={'center'}>
                                            <Grid item xs={12}>
                                                <Typography
                                                    onClick={()=> setOpenSeeAdvantages(true)}
                                                    className={classes.leftLink} align={'center'}>
                                                    {t('str_seeTheAdvantages')}
                                                </Typography>
                                                {openSeeAdvantages && (<SeeAdvantages open={openSeeAdvantages} onClose={(e)=> setOpenSeeAdvantages(e)}/>)}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </React.Fragment>
                            )}
                        </Grid>
                    </div>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

export default connect(mapStateToProps, null)(MyLoyalty)
