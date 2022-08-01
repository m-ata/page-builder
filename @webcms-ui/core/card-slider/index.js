import React, { useCallback, useState } from 'react'
import Slider from 'react-slick'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import CardSliderItem from './card-slider-item'
import { connect } from 'react-redux'
import { useRouter } from 'next/router'
import { setToState, updateState } from 'state/actions'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles({
    root: {
        maxWidth: '95%',
        marginBottom: 5,
    },
    media: {
        height: 0,
        paddingTop: '56.25%',
    },
    slideBox: {
        marginBottom: 50,
    },
    seeMore: {
        textAlign: 'right'
    }
})

const CardSlider = (props) => {
    const classes = useStyles()
    const { title, slideData, openId, type, setToState, state } = props
    const [swiped, setSwiped] = useState(false)
    const [loadPiority, setLoadPiority] = useState(0)
    const { t } = useTranslation()
    const router = useRouter()

    const handleSwiped = useCallback(() => {
        setSwiped(true)
    }, [setSwiped])

    const handleSwipedStatus = useCallback((e) => {
        if (swiped) {
            e.stopPropagation()
            e.preventDefault()
            setSwiped(false)
        }
    }, [swiped])

    const settings = {
        dots: true,
        speed: 500,
        lazyLoad: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        centerMode: true,
        swipeToSlide: true,
        infinite: slideData.length > 2 ? true : false,
        afterChange: current => setLoadPiority(current),
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    }

    if(state.infoListOneGroup.id) {
        return (
            <React.Fragment>
                <Paper elevation={3}>
                    <Box className={classes.slideBox} p={3}>
                        <Grid container direction="row" justify="space-between" alignItems="center">
                            <Grid item xs={6}>
                                <Typography variant="h6" gutterBottom className={classes.hotelListTitle}>
                                   <span dangerouslySetInnerHTML={{__html: title || ''}}/>
                                </Typography>
                            </Grid>
                            <Grid item xs={6} className={classes.seeMore}>
                                <Button color="primary" onClick={() => {
                                    router.push({
                                        pathname: router.pathname,
                                        query: {
                                            menu: 'info'
                                        },
                                    })
                                }}>{t('str_seeLess')}</Button>
                            </Grid>
                        </Grid>
                        <Box p={3}>
                            {slideData.sort((a, b) => a.orderno - b.orderno).map((item, i) => {
                                return (
                                    <Box key={i} onClickCapture={handleSwipedStatus}>
                                        <CardSliderItem
                                            openId={Number(openId)}
                                            rootCls={classes.root}
                                            mediaCls={classes.media}
                                            sliderData={item}
                                            slideIndex={i}
                                            type={type}
                                            loadPriority={loadPiority === i ? "true" : "false"}
                                        />
                                    </Box>
                                )
                            })}
                        </Box>
                    </Box>
                </Paper>
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            <Paper elevation={type !== 'event' ? 3 : 0}>
                <Box className={classes.slideBox} p={1}>
                    <Grid container direction="row" justify="space-between" alignItems="center">
                        <Grid item xs={6}>
                            <Typography variant="h6" gutterBottom className={classes.hotelListTitle}>
                                {title}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} className={classes.seeMore}>
                            {type !== 'event' ? (
                                <Button
                                    color='primary'
                                    onClick={() => {
                                        router.push({
                                            pathname: router.pathname,
                                            query: {
                                                menu: 'info',
                                                catid: slideData[0].catid,
                                                hotelrefno: slideData[0].hotelrefno,
                                            },
                                        })
                                    }}>
                                    {t('str_seeMore')}
                                </Button>
                            ) : null}
                        </Grid>
                    </Grid>
                    <Box p={type !== 'event' ? 3 : 1}>
                        <Slider onSwipe={handleSwiped} {...settings}>
                            {slideData.sort((a, b) => a.orderno - b.orderno).map((item, i) => {
                                return (
                                    <Box key={i} onClickCapture={handleSwipedStatus}>
                                        <CardSliderItem
                                            openId={Number(openId)}
                                            rootCls={classes.root}
                                            mediaCls={classes.media}
                                            sliderData={item}
                                            slideIndex={i}
                                            type={type}
                                            loadPriority={loadPiority === i ? "true" : "false"}
                                        />
                                    </Box>
                                )
                            })}
                        </Slider>
                    </Box>
                </Box>
            </Paper>
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

export default connect(mapStateToProps, mapDispatchToProps)(CardSlider)
