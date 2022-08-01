import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import StarBorderIcon from '@material-ui/icons/StarBorder'
import ListIcon from '@material-ui/icons/List';
import Rating from '@material-ui/lab/Rating'
import Chip from '@material-ui/core/Chip'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import CardSliderItemDialog from './card-slider-item-dialog'
import WebCmsGlobal from 'components/webcms-global'
import {FALSE, SLASH, ZERO} from 'model/globals'
import {DEFAULT_OREST_TOKEN, getHyperlinkParser, OREST_ENDPOINT, stdTimeFormat} from 'model/orest/constants'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { makeStyles } from '@material-ui/core/styles'
import EventAvailableIcon from '@material-ui/icons/EventAvailable'
import RestaurantMenuIcon from '@material-ui/icons/RestaurantMenu'
import Tooltip from '@material-ui/core/Tooltip'
import Avatar from '@material-ui/core/Avatar'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import PhoneIcon from '@material-ui/icons/Phone'
import CardImage from '@webcms-ui/core/card-image'
import getSymbolFromCurrency from 'model/currency-symbol'
import * as global from '@webcms-globals'
import TodayIcon from '@material-ui/icons/Today'
import moment from 'moment'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import RepeatIcon from '@material-ui/icons/Repeat'
import CardSliderItemInfoDialog from './card-slider-item-info-dialog'
import LoginDialog from 'components/LoginComponent/LoginDialog'
import { useSnackbar } from 'notistack'
import RoomServiceIcon from '@material-ui/icons/RoomService'
import useWidth from '@webcms-ui/hooks/use-width'
import { useRouter } from 'next/router'
import ReviewDialog from "../../../components/ReviewDialog";
import {UseOrest} from "@webcms/orest";
import AlignToCenter from "../../../components/AlignToCenter";
import LoadingSpinner from "../../../components/LoadingSpinner";

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: '1rem',
    },
    cardRoot: {
      width: '100%',
        marginBottom: 35
    },
    cardImage: {
        [theme.breakpoints.down('md')]: {
            width: '100%',
        },
        width: '40%',
        float: 'left',
        '& div:nth-child(1)': {
            display: 'block!important'
        }
    },
    cardTitle: {
        color: '#484848',
        fontSize: '1.2rem',
    },
    cardDesc: {
        color: '#494949',
        fontSize: '0.8rem',
    },
    cardContentWrap: {
        width: '60%',
        [theme.breakpoints.down('md')]: {
            width: '100%',
        },
        float: 'left',
    },
    cardContent:{
        height: 205,
        [theme.breakpoints.down('md')]: {
            height: 125,
        },
    },
    deleteIcon: {
        cursor: 'unset'
    },
    cardChip: {
        [theme.breakpoints.down('xs')]: {
            transform: 'scale(0.9)'
        },
    }
}))

const geoFormat = (number) => {
    const str = String(number)
    const $1 = str.substr(0, 2)
    const $2 = str.substr(2, str.length)
    const res = `${$1}.${$2}`

    return parseFloat(res)
}

const CardSliderItem = (props) => {
    const width = useWidth()
    const { rootCls, openId, sliderData, type, state, loadPriority, updateState, setToState } = props
    const [openDialog, setOpenDialog] = useState(false)
    const [openReservation, setOpenReservation] = useState(false)
    const [openMenu, setOpenMenu] = useState(false)
    const [openInfoDialog, setOpenInfoDialog] = useState(false)
    const [openRoomService, setOpenRoomService] = useState(false)
    const [isOpenLoginDialog, setIsOpenLoginDialog] = useState(false)
    const [openReviewDialog, setOpenReviewDialog] = useState(false)
    const [reviewScore, setReviewScore] = useState(-1)
    const [eventResNo, setEventResNo] = useState(-1)
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const classes = useStyles()
    const { t } = useTranslation()
    const { enqueueSnackbar } = useSnackbar()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const isLogin = !!useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
    const reservBase = state.clientReservation || false
    const clientBase = useSelector((state) => state?.orest.state?.client || false)
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const hotelRefNo = useSelector((state) => state?.formReducer?.guest?.changeHotelRefno || state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO)

    useEffect(() => {
        if (Number(openId) === sliderData.locid && !router.query.openMenu) {
            handleOpenDialog()
        } else if (Number(openId) === sliderData.locid && router.query.openMenu) {
            handleOpenMenu()
        }
    }, [openId])



    useEffect(() => {
        if(Number(state.routerQueryState?.locid) === sliderData?.locid) {
            setOpenReservation(true)
        }
    }, [state.routerQueryState?.locid])


    useEffect(() => {
        router.beforePopState(({ url, as, options }) => {
            const queryRegex = /\?(.*)/
            const text = queryRegex.exec(url)
            if(text) {
                let stringifyText = text[1].replaceAll('=', ':').replaceAll('&', ',')
                stringifyText = stringifyText.split(',')
                let a = ''
                stringifyText.map((item, ind) => {
                    const key = item.split(':')[0]
                    const value = item.split(':')[1]
                    if(ind < stringifyText.length - 1) {
                        a += '"' + key + '":' + '"' + value + '"' + ','
                    } else {
                        a += '"' + key + '":' + '"' + value + '"'
                    }
                })
                stringifyText = a
                stringifyText = '{' + stringifyText + '}'
                const jsonQuery = JSON.parse(stringifyText)
                updateState('guest', ['routerQueryState'], {
                    ...state.routerQueryState,
                    locid: jsonQuery.locid,
                    step: jsonQuery.step
                })
                if(jsonQuery.step === '1' && (!state.routerQueryState?.date || !state.routerQueryState?.time)) {
                    enqueueSnackbar(t('str_pleaseSelectDateAndTime'), { variant: 'warning' })
                    return false
                }
                if(jsonQuery.step === '1' && state.routerQueryState?.isResCompleted) {
                    router.push({
                        pathname: 'guest',
                        query: {
                            ...router.query,
                            step: '0'
                        }
                    }).then(() => {
                        const routerQuery = {...router.query}
                        delete routerQuery.locid
                        delete routerQuery.step
                        router.push({
                            pathname: 'guest',
                            query: routerQuery
                        })
                    })
                    updateState('guest', ['routerQueryState'], false)
                    return false
                }
                return true
            }  else {
                updateState('guest', ['routerQueryState'], false)
                return true
            }

        })

        return () => {
            router.beforePopState(() => true);
        };
    }, [router])


    const handleOpenDialog = () => {
        if(sliderData.locismulti){
            router.push({
                pathname: router.pathname,
                query: {
                    menu: 'info',
                    catid: sliderData.locid,
                    hotelrefno: sliderData.hotelrefno,
                },
            })
        }else{
            setOpenDialog(!openDialog)
        }
    }

    const handleOpenActivity = () => {
        setToState('guest', ['activityRes', 'openDialog'], true)
        setToState('guest', ['activityRes', 'selectedActivity'], sliderData)
    }

    const handleOpenRestaurant = () => {
        if(!reservBase){
            enqueueSnackbar(t('str_yourRoomReservationIsNotAvailable'), { variant: 'info' })
            return false
        }

        if(sliderData?.hotelrefno !== reservBase.hotelrefno){
            enqueueSnackbar(t('str_youCanOnlyBookARestaurantAtTheHotelYouAreStayingAt'), { variant: 'info' })
            return false
        }

        if(sliderData?.loconlyih && reservBase?.status !== 'I'){
            enqueueSnackbar(t('str_youMustBeInhouseTheHotelToBookARestaurant'), { variant: 'info' })
            return false
        }

        setOpenReservation(!openReservation)
        router.push({
            pathname: 'guest',
            query: Object.assign({}, router.query, {locid: sliderData?.locid, step: '0'})
        })
        updateState('guest', ['routerQueryState'], Object.assign({}, router.query, {locid: String(sliderData?.locid), step: '0', isResCompleted: false}))
    }

    const handleOpenMenu = () => {
        setOpenMenu(!openMenu)
    }

    const handleOpenInfo = () => {
        setOpenInfoDialog(!openInfoDialog)
    }

    const handleRoomService = () =>{
        if(reservBase.roomno){
            setOpenRoomService(!openRoomService)
            //setOpenReservation(!openReservation)
            router.push({
                pathname: 'guest',
                query: {
                    ...router?.query,
                    makeorder: true,
                    menuid: sliderData?.locdepartid,
                    departcode:  sliderData?.locdepartcode
                }
            })
        }else{
            enqueueSnackbar(t('str_yourRoomNumberIsNotAvailableARoomNumberIsRequiredToOrder'), { variant: 'info' })
        }
    }

    const handleLocation = () => {
        if (sliderData.loclat && sliderData.loclng) {
            window.open(`https://www.google.com.tr/maps/@${geoFormat(sliderData.loclat)},${geoFormat(sliderData.loclng)},19z`)
        } else {
            enqueueSnackbar(t('str_notDefined'), { variant: 'info' })
        }
    }

    const handleCheckIsLogin = () => {
        enqueueSnackbar(t('str_youMustLoginFirst'), { variant: 'info' })
        setIsOpenLoginDialog(true)
    }

    let cta = false
    if (sliderData.cta) {
        let link = getHyperlinkParser(sliderData.cta)
        if (link) {
            cta = {}
            cta.href = link.href
            cta.text = link.text
        }
    }

    const isTelIconShow = (cta) => cta?.href && cta.href.startsWith("tel:") || false

    let isReservation = (eventloc) => {
        if (eventloc.lochasres && eventloc.isorsactive || eventloc.isspares) {
            return true
        } else {
            return false
        }
    }

    isReservation = sliderData && isReservation(sliderData)

    const getDescription = (str, isLong = true) => {
        let useLength = 95, useShort = 75
        if(isLong){
            useLength = 470
            useShort = 470
        }

        if (str && str.length >= useLength) {
            return str.substring(0, useShort) + ' ...'
        }
        return str
    }

    const checkCanReview = async (locId) => {
        if(locId) {
            setIsLoading(true)
            const resInfo = await findRes(locId)
            if(resInfo) {
                const resNo = resInfo.reservno
                const reviewInfo = await findReview(resNo)
                if(!reviewInfo) {
                    setEventResNo(resNo)
                    setOpenReviewDialog(true)
                } else {
                    enqueueSnackbar(t('str_youAreAlreadyHaveAReview'), {variant: 'info'})
                }

            } else {
                enqueueSnackbar(t('str_reservationNotFound'), {variant: 'warning'})
            }
        setIsLoading(false)
        }

    }

    const findRes = async (locId) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESEVENT + SLASH + OREST_ENDPOINT.VIEW + SLASH + OREST_ENDPOINT.LOCRES + SLASH + OREST_ENDPOINT.LIST,
            token,
            params: {
                limit: 1,
                sort: 'transdate-',
                query: `clientid:${clientBase?.id},eventlocid:${locId}`,
                hotelrefno: hotelRefNo
            }
        }).then((res) => {
            if(res.status === 200) {
                return res.data.count > 0 ? res.data.data[0] : null
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const findReview = async (resNo) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'surevportrans/view/list',
            token,
            params: {
                limit: 1,
                query: `clientid:${clientBase?.id},reservno:${resNo}`,
                hotelrefno: hotelRefNo
            }
        }).then((res) => {
            if(res.status === 200) {
                 return res.data.count > 0 ? res.data.data[0] : null
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const RenderDateLabel = () => {
        const showEndDate = sliderData?.startdate && sliderData?.enddate && sliderData.startdate !== sliderData.enddate
        return (
            <React.Fragment>
                {sliderData?.startdate ? moment(sliderData.startdate, 'YYYY-MM-DD').format('DD MMMM') : null} {showEndDate ? '/' : null} {showEndDate && sliderData?.enddate ? moment(sliderData.enddate, 'YYYY-MM-DD').format('DD MMMM') : null}
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            <LoginDialog open={isOpenLoginDialog} onClose={(status) => setIsOpenLoginDialog(status)} locationName='guest' isLoginWrapper disableRegister/>
            <Card className={type === 'infoOneGroup' ? classes.cardRoot : rootCls} variant="outlined">
                <CardImage
                    className={type === 'infoOneGroup' ? classes.cardImage : undefined}
                    loadPriority={loadPriority || "false"}
                    src={sliderData.imageurl ? GENERAL_SETTINGS.STATIC_URL + sliderData.imageurl : '/imgs/not-found.png'}
                    alt={t(sliderData?.localtitle?.removeHtmlTag())}
                    layout="fill"
                    cursor="pointer"
                    onClick={() => handleOpenDialog()}
                />
                <div className={type === 'infoOneGroup' ? classes.cardContentWrap : undefined}>
                    <CardContent className={type === 'infoOneGroup' ? classes.cardContent : undefined}>
                        <Typography
                            noWrap={true}
                            className={type === 'infoOneGroup' ? classes.cardTitle : classes.title}
                            variant={'button'}
                            onClick={() => handleOpenDialog()}
                            style={{ cursor: 'pointer' }}
                            title={sliderData.localtitle && t(sliderData.localtitle).length >= 30 ? sliderData?.localtitle?.removeHtmlTag() : ''}
                        >
                            {t(sliderData?.localtitle?.removeHtmlTag())}
                        </Typography>
                        {type === 'infoOneGroup' && (
                            <Typography className={classes.cardDesc} variant="caption" display="block" align="justify" gutterBottom>
                                {getDescription(t(sliderData?.localdesc?.removeHtmlTag()), (width !== 'xs'))}
                            </Typography>
                        )}
                    </CardContent>
                    {type === 'event' && (sliderData.startdate || sliderData.enddate) && (
                        <CardActions disableSpacing style={{ paddingTop:0, paddingBottom: 0 }}>
                            <Box style={{ margin: '0 0 0 auto' }} component="fieldset" mb={3} borderColor="transparent">
                                {sliderData?.hasrecurr ? (
                                    <Chip
                                        className={classes.cardChip}
                                        classes={{ deleteIcon: classes.deleteIcon }}
                                        onDelete={()=> { return; }}
                                        deleteIcon={
                                            <Tooltip title={t('str_recurrence')} arrow>
                                                <RepeatIcon/>
                                            </Tooltip>
                                        }
                                        variant="outlined"
                                        icon={<TodayIcon/>}
                                        label={<RenderDateLabel/>}
                                    />
                                ): (
                                    <Chip
                                        className={classes.cardChip}
                                        variant="outlined"
                                        icon={<TodayIcon/>}
                                        label={<RenderDateLabel/>}
                                    />
                                )}
                            </Box>
                        </CardActions>
                    )}
                    <CardActions disableSpacing style={{ minHeight: 64 }}>
                        {(cta && cta.text && cta.href) ? (
                            (isTelIconShow(cta)) ? (
                                <Tooltip title={t(cta.text)}>
                                    <IconButton onClick={() => cta.href.includes(window.location.host) ? window.location.href = cta.href : window.open(cta.href)}>
                                        <PhoneIcon />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Tooltip title={t(cta.text)}>
                                    <IconButton onClick={() => cta.href.includes(window.location.host) ? window.location.href = cta.href : window.open(cta.href)}>
                                        <ArrowForwardIcon />
                                    </IconButton>
                                </Tooltip>
                            )
                        ) : null}                    
                        {(isReservation) ? (
                            <Tooltip title={t('str_reservation')}>
                                <IconButton onClick={() => isLogin ? handleOpenRestaurant() : handleCheckIsLogin()}>
                                    <EventAvailableIcon/>
                                </IconButton>
                            </Tooltip>
                        ): null}
                        {(sliderData && sliderData.locdepartid && sliderData.lochasmenu) && (
                            <Tooltip title={t('str_menu')}>
                                <IconButton onClick={() => handleOpenMenu()}>
                                    {sliderData?.isspares ? <ListIcon /> : <RestaurantMenuIcon/>}
                                </IconButton>
                            </Tooltip>
                        )}
                        {(sliderData && sliderData.loclat && sliderData.loclng) && (
                            <Tooltip title={t('str_location')}>
                                <IconButton onClick={() => handleLocation()}>
                                    <LocationOnIcon/>
                                </IconButton>
                            </Tooltip>
                        )}
                        {(sliderData.price > 0 && type === 'event') && (
                            <Tooltip title={t(sliderData.priceinfo)} interactive>
                                <Chip
                                    className={classes.cardChip}
                                    variant="outlined"
                                    avatar={<Avatar style={{ background: '#e6e6e6', color: '#3c3c3c', fontSize: 15 }}>{getSymbolFromCurrency(sliderData.currcode)}</Avatar>}
                                    label={global.helper.formatPrice(sliderData.price)}
                                />
                            </Tooltip>
                        )}
                        {!sliderData.isspares && !sliderData.isbanquet && sliderData.lochasmenu && sliderData.locisposmain && (
                            <Tooltip title={t('str_order')}>
                                <IconButton onClick={() => isLogin ? handleRoomService() : handleCheckIsLogin()}>
                                    <RoomServiceIcon/>
                                </IconButton>
                            </Tooltip>
                        )}
                        {sliderData.hasdoc && (
                            <Tooltip title={t('str_info')}>
                                <IconButton onClick={() => handleOpenInfo()}>
                                    <InfoOutlinedIcon/>
                                </IconButton>
                            </Tooltip>
                        )}
                        {
                            sliderData?.locshowrevscore && (
                                <Box style={{ margin: '0 0 0 auto' }} component="fieldset" mb={3} borderColor="transparent">
                                    {(type === 'info' || type === 'infoOneGroup') && (
                                        <div style={{position: 'relative'}}>
                                            {
                                                isLoading && (
                                                    <AlignToCenter>
                                                        <LoadingSpinner size={24}/>
                                                    </AlignToCenter>
                                                )
                                            }
                                            <Rating
                                                disabled={isLoading}
                                                aria-label={sliderData.locid}
                                                readOnly={!isLogin || !sliderData?.islocres}
                                                className={classes.cardChip}
                                                name={sliderData.locid.toString()}
                                                value={Number(sliderData.locrate) || ZERO}
                                                precision={0.5}
                                                emptyIcon={<StarBorderIcon fontSize="inherit"/>}
                                                onChange={(e, newValue) => {
                                                    setReviewScore(newValue)
                                                    checkCanReview(sliderData?.locid)
                                                }}
                                            />
                                        </div>

                                    )}
                                    {(type === 'event' && sliderData.starttime)&& (
                                        <Chip
                                            className={classes.cardChip}
                                            variant="outlined"
                                            icon={<AccessTimeIcon/>}
                                            label={stdTimeFormat(sliderData.starttime)}
                                        />
                                    )}
                                </Box>
                            )
                        }
                    </CardActions>
                </div>
            </Card>
            {(openRoomService || openDialog || openReservation || openMenu) ? (
                <CardSliderItemDialog
                    open={openDialog}
                    close={(e) => setOpenDialog(e)}
                    type={type}
                    dialogData={sliderData}
                    isRoomService={openRoomService || false}
                    isReservation={isReservation || false}
                    openReservation={openReservation}
                    closeReservation={() => setOpenReservation(false)}
                    openMenu={openMenu}
                    closeMenu={() => setOpenMenu(false)}
                />

            ): null}
            {(sliderData.hasdoc && openInfoDialog) ? (
                <CardSliderItemInfoDialog
                    open={openInfoDialog}
                    close={(e)=> setOpenInfoDialog(e)}
                    dialogData={sliderData}
                />
            ): null}
            <ReviewDialog
                open={openReviewDialog}
                onClose={() => setOpenReviewDialog(false)}
                initialValue={reviewScore}
                params={{
                    clientid: clientBase?.id,
                    hotelrefno: hotelRefNo,
                    reservno: eventResNo
                }}
                handleAfterInsert={() => {
                    setEventResNo(-1)
                    setOpenReviewDialog(false)
                    setReviewScore(-1)
                }}
            />
        </React.Fragment>
    )
}

CardSliderItem.propTypes = {
    rootCls: PropTypes.string,
    mediaCls: PropTypes.string,
    openId: PropTypes.number,
    sliderData: PropTypes.object,
    type: PropTypes.string,
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value))
})

export default connect(mapStateToProps, mapDispatchToProps)(CardSliderItem)
