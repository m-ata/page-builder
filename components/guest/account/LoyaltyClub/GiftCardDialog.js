import React, { useEffect, useState, useContext } from 'react'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import axios from 'axios'
import Slider from 'react-slick'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { getHyperlinkParser, stdTimeFormat } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import { FALSE, NULL, ZERO } from 'model/globals'
import useTranslation from 'lib/translations/hooks/useTranslation'
import LoadingSpinner from 'components/LoadingSpinner'
import { makeStyles } from '@material-ui/core/styles'
import Link from '@material-ui/core/Button'

const useStyles = makeStyles((theme) => ({
    dialogTitle: {
        '& h2': {
            [theme.breakpoints.only('md')]: {
                fontSize: 15,
            },
            [theme.breakpoints.only('sm')]: {
                fontSize: 14,
            },
            [theme.breakpoints.only('xs')]: {
                fontSize: 13,
            },
        },
    },
    sliderImgBox: {
        width: '100%',
        height: 340,
        [theme.breakpoints.only('xs')]: {
            height: 180,
        },
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
    },
    button: {
        textAlign: 'center',
        '& a': {
            background: '#fffbfb',
            padding: 10,
            textAlign: 'center',
            color: theme.palette.primary.main,
            border: `1px solid ${theme.palette.primary.main}`,
            fontSize: '0.875rem',
            minWidth: 64,
            boxSizing: 'border-box',
            transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            fontWeight: 500,
            lineHeight: 1.75,
            borderRadius: 4,
            letterSpacing: '0.02857em',
            textTransform: 'uppercase'
        },
    },
}))

const GiftCardDialog = (props) => {
    const { state, sliderID, open, onClose } = props

    const [itemSlideData, setItemSlideData] = useState(false)
    const { t } = useTranslation()
    const classes = useStyles()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    let clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    useEffect(() => {
        let active = true
        if (active && open && itemSlideData === FALSE) {

            if (GENERAL_SETTINGS.ISCHAIN && state.changeHotelRefno !== false) {
                clientParams.ischain = true
                clientParams.chainid = state.changeHotelRefno
                clientParams.hotelrefno = GENERAL_SETTINGS.HOTELREFNO

            } else {
                clientParams.ischain = false
                clientParams.chainid = false
            }

            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/slider',
                method: 'post',
                params:  Object.assign({
                    sliderid: sliderID,
                }, clientParams),
            }).then((sliderResponse) => {
                if (active) {
                    const sliderData = sliderResponse.data
                    if (sliderData.success && sliderData.data.length > 0) {
                        setItemSlideData(sliderData.data)
                    } else {
                        setItemSlideData(null)
                    }
                }
            })
        }

        return () => {
            active = false
        }
    }, [sliderID])

    const handleCloseDialog = () => {
        onClose(false)
        setItemSlideData(false)
    }

    const settings = {
        dots: true,
        infinite: true,
        lazyLoad: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        swipeToSlide: true,
        touchMove: true,
    }

    const renderButton = (cta) => {
        if (cta) {
            let link = getHyperlinkParser(cta)

            if(link === false){
                return
            }

            let href = link.href
            let text = link?.text?.replace(/ /g,'') || ''
            let host = window.location.host

            let isExternalLink = false
            if(href.includes('http') && !href.includes(host)){
                isExternalLink = true
            }

            if(!isExternalLink){
                return (
                    <Link id="slick-button"  variant="outlined" color="primary" href={href}>
                        {t(text?.removeHtmlTag())}
                    </Link>
                )
            }

            return (
                <Link id="slick-button"  variant="outlined" color="primary" target="_blank" href={href}>
                    {t(text?.removeHtmlTag())}
                </Link>
            )
        } else {
            return
        }
    }

    return (
        <React.Fragment>
            <Dialog fullWidth maxWidth="md" open={open} onClose={() => handleCloseDialog()}>
                <DialogTitle className={classes.dialogTitle}>{itemSlideData && t(itemSlideData[0]?.slidertitle?.removeHtmlTag()) || itemSlideData && t(itemSlideData[0]?.title?.removeHtmlTag()) || '-'}</DialogTitle>
                <DialogContent dividers style={{overflow: 'overlay', width: '100%'}}>
                    {itemSlideData === FALSE ? (
                        <Box p={3}>
                            <LoadingSpinner size={40} />
                        </Box>
                    ) : itemSlideData === NULL ? (
                        <Box p={3}>
                            <Typography variant="h6" align="center" gutterBottom>
                                {t('str_noDefaultRecord')}
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Box p={1}>
                                    <Slider {...settings}>
                                        {itemSlideData &&
                                        itemSlideData.map((item, i) => {
                                            return (
                                                <Box key={i} p={1}>
                                                    <div className={classes.sliderImgBox} style={{backgroundImage:`url(${GENERAL_SETTINGS.STATIC_URL + item.fileurl})`}}></div>
                                                </Box>
                                            )
                                        })}
                                    </Slider>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" style={{padding: 10}}>{itemSlideData && itemSlideData[0] && itemSlideData[0].sliderdesc?.removeHtmlTag()}</Typography>
                            </Grid>
                            {itemSlideData && itemSlideData[0] && itemSlideData[0].slidercta && (
                                <Grid item xs={12} style={{ padding: 10, textAlign: 'center' }}>
                                    {itemSlideData && itemSlideData[0] && renderButton(itemSlideData[0].slidercta)}
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCloseDialog()} color="primary">
                        {t('str_close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(GiftCardDialog)
