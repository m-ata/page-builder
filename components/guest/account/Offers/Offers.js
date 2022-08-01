import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import stylesTabPanel from '../style/TabPanel.style'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import LoadingSpinner from 'components/LoadingSpinner'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ExpandLess from '@material-ui/icons/ExpandLess'
import OfferCard from './OfferCard'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'
import OfferCardDialog from './OfferCardDialog'
import ReceivableGiftCard from '../LoyaltyClub/ReceivableGiftCard'
const useStylesTabPanel = makeStyles(stylesTabPanel)

const Offers = (props) => {
    const { state, setToState } = props
    const [sliderID, setSliderID] = useState(false)
    const classesTabPanel = useStylesTabPanel()
    const { t } = useTranslation()

    const handleShowMore = () => {
        setToState('guest', ['offers', 'limit'], state.offers.data.length)
        setToState('guest', ['offers', 'isdone'], true)
    }

    const handleShowLess = () => {
        setToState('guest', ['offers', 'limit'], 3)
        setToState('guest', ['offers', 'isdone'], false)
    }

    if (state.offers.data === false || state.homeList.isLoading) {
        return (
            <Box p={4}>
                <LoadingSpinner size={40}/>
            </Box>
        )
    }

    if (state.offers.data === null) {
        return (
            <Box p={4}>
                <Typography variant='h6' align='center' gutterBottom>
                    {t('str_noDataAvailable')}
                </Typography>
            </Box>
        )
    }

    return (
        <React.Fragment>
            <OfferCardDialog sliderID={sliderID} open={Boolean(sliderID)} onClose={()=> setSliderID(false)} />
            <Grid container justify={'center'} spacing={4}>
                {state.offers.data && state.offers.data.slice(0, state.offers.limit).map((offer, i) => {
                    return(
                        <OfferCard key={i} offer={offer} onDetail={(id) => setSliderID(id)} />
                    )
                })}
                {state.offers.data && state.offers.data.length > 0 && (
                    <Grid item xs={12} className={classesTabPanel.gridItem}>
                        <Grid container direction={'row'} justify={'center'} alignItems={'center'}>
                            <Grid item>
                                {state.offers.isdone ? (
                                    <Button onClick={() => handleShowLess()}>
                                        <Typography variant='h5' className={classesTabPanel.showMoreText}>
                                            {t('str_showLess')}
                                        </Typography>
                                        <ExpandLess className={classesTabPanel.showMoreIcon} />
                                    </Button>
                                ) : (
                                    <Button onClick={() => handleShowMore()}>
                                        <Typography variant='h5' className={classesTabPanel.showMoreText}>
                                            {t('str_showMore')}
                                        </Typography>
                                        <ExpandMore className={classesTabPanel.showMoreIcon} />
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                )}
            </Grid>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Offers)
