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
import IconButton from '@material-ui/core/IconButton'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import StarBorderIcon from '@material-ui/icons/StarBorder'
import Rating from '@material-ui/lab/Rating'
import Chip from '@material-ui/core/Chip'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import { getHyperlinkParser, stdTimeFormat } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import { FALSE, NULL, ZERO } from 'model/globals'
import useTranslation from 'lib/translations/hooks/useTranslation'
import LoadingSpinner from 'components/LoadingSpinner'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import RestaurantReservation from 'components/guest/public/components/info/event-reservation'
import MenuDialog from 'components/guest/public/components/info/event-reservation/menu-dialog'
import { makeStyles } from '@material-ui/core/styles'
import Link from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { useSnackbar } from 'notistack'
import getSymbolFromCurrency from '../../../model/currency-symbol'
import * as global from '@webcms-globals'
import Avatar from '@material-ui/core/Avatar'
import Tooltip from '@material-ui/core/Tooltip'
import TodayIcon from '@material-ui/icons/Today'
import moment from 'moment'
import CardSliderItemInfoDialog from './card-slider-item-info-dialog'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import RepeatIcon from '@material-ui/icons/Repeat'
import LoginDialog from '../../../components/LoginComponent/LoginDialog'
import { useRouter } from 'next/router'

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
    sliderImgBox: {
        width: '100%',
        height: 340,
        [theme.breakpoints.only('xs')]: {
            height: 180,
        },
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
    },
    deleteIcon: {
        cursor: 'unset'
    }
}))

const geoFormat = (number) => {
    const str = String(number)
    const $1 = str.substr(0, 2)
    const $2 = str.substr(2, str.length)
    const res = `${$1}.${$2}`

    return parseFloat(res)
}

const CardSliderItemDialog = (props) => {
    const { state, updateState, dialogData, open, close, type, openReservation, openMenu, closeReservation, closeMenu, isReservation, isRoomService } = props

    const [openRestaurantReservation, setOpenRestaurantReservation] = useState(false)
    const [openRestaurantMenu, setOpenRestaurantMenu] = useState(false)
    const [mouseX, setMouseX] = useState(null)
    const [mouseY, setMouseY] = useState(null)
    const [openContextMenu, setOpenContextMenu] = useState(false)
    const [contextData, setContextData] = useState(null)
    const [itemSlideData, setItemSlideData] = useState(false)
    const [openInfoDialog, setOpenInfoDialog] = useState(false)
    const [isOpenLoginDialog, setIsOpenLoginDialog] = useState(false)
    const { enqueueSnackbar } = useSnackbar()
    const { t } = useTranslation()
    const classes = useStyles()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const router = useRouter()
    const isLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth) ? true : false
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const reservBase = state?.clientReservation || false

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
                    sliderid: type === 'event' ? dialogData.sliderid : dialogData.id,
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
    }, [open, openReservation, openMenu])

    useEffect(() => {
        let active = true

        if(active && openReservation && !openRestaurantReservation){
            handleOpenRestaurant()
        }

        if(active && openMenu && !openRestaurantMenu){
            setOpenRestaurantMenu(true)
        }

        return () => {
            active = false
        }

    }, [openReservation, openMenu])

    const handleCloseDialog = () => {
        close(false)
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

    const handleOpenRestaurant = () => {
        if(!reservBase){
            enqueueSnackbar(t('str_yourRoomReservationIsNotAvailable'), { variant: 'info' })
            return false
        }

        if(dialogData?.hotelrefno !== reservBase.hotelrefno){
            enqueueSnackbar(t('str_youCanOnlyBookARestaurantAtTheHotelYouAreStayingAt'), { variant: 'info' })
            return false
        }

        if(dialogData?.loconlyih && reservBase?.status !== 'I'){
            enqueueSnackbar(t('str_youMustBeInhouseTheHotelToBookARestaurant'), { variant: 'info' })
            return false
        }

        setOpenRestaurantReservation(true)
        router.push({
            pathname: 'guest',
            query: Object.assign({}, router.query, {locid: dialogData?.locid, step: '0'})
        })
        updateState('guest', ['routerQueryState'], Object.assign({}, router.query, {locid: String(dialogData?.locid), step: '0', isResCompleted: false}))
    }

    const handleRestaurantMenu = () => {
        setOpenRestaurantMenu(true)
    }

    const handleLocation = () => {
        if (dialogData.loclat && dialogData.loclng) {
            window.open(`https://www.google.com.tr/maps/@${geoFormat(dialogData.loclat)},${geoFormat(dialogData.loclng)},19z`)
        } else {
            enqueueSnackbar(t('str_notDefined'), { variant: 'info' })
        }
    }

    const handleCheckIsLogin = () => {
        enqueueSnackbar(t('str_youMustLoginFirst'), { variant: 'info' })
        setIsOpenLoginDialog(true)
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
                        {t(text)}
                    </Link>
                )
            }

            return (
                <Link id="slick-button"  variant="outlined" color="primary" target="_blank" href={href}>
                    {t(text)}
                </Link>
            )
        } else {
            return
        }
    }

    const handleOpenInfo = () => {
        setOpenInfoDialog(openInfoDialog ? false : true)
    }

    const handleRightClick = (e, item) => {
        setMouseX(e.clientX - 2)
        setMouseY(e.clientY - 4)
        setOpenContextMenu(true)
        setContextData(item)
        e.preventDefault()
    }

    const onHandleCopyText = () => {
        navigator.clipboard.writeText(contextData).then(() => {
            enqueueSnackbar(t("str_copiedToClipboard").replace('%s', `"${contextData.substring(0, 50) + '...'}"`), { variant: 'success', autoHideDuration: 2000 })
        })
        setOpenContextMenu(false)
        setContextData(null)
    }

    const RenderDateLabel = () => {
        const showEndDate = dialogData?.startdate && dialogData?.enddate && dialogData.startdate !== dialogData.enddate
        return (
            <React.Fragment>
                {dialogData?.startdate ? moment(dialogData.startdate, 'YYYY-MM-DD').format('DD MMMM'): null} {showEndDate ? '/': null} {showEndDate && dialogData?.enddate ? moment(dialogData.enddate, 'YYYY-MM-DD').format('DD MMMM'): null}
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            <LoginDialog open={isOpenLoginDialog} onClose={(status) => setIsOpenLoginDialog(status)} locationName='guest' isLoginWrapper disableRegister/>
            <Dialog maxWidth="sm" open={open} onClose={() => handleCloseDialog()}>
                <DialogTitle className={classes.dialogTitle}>{dialogData && t(dialogData.localtitle?.removeHtmlTag())}</DialogTitle>
                <DialogContent dividers style={{overflow: 'overlay', padding: '16px 40px'}}>
                    {dialogData === FALSE ? (
                        <Box p={3}>
                            <LoadingSpinner size={40} />
                        </Box>
                    ) : dialogData === NULL ? (
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
                                                    <div className={classes.sliderImgBox} style={{ backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL + item.fileurl})` }}/>
                                                </Box>
                                            )
                                        })}
                                    </Slider>
                                    <br/>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography onContextMenu={(e)=> handleRightClick(e, t(dialogData?.localtitle?.removeHtmlTag()))}  variant="subtitle1">{t(dialogData?.localtitle?.removeHtmlTag())}</Typography>
                                <Typography onContextMenu={(e)=> handleRightClick(e, t(dialogData?.localdesc?.removeHtmlTag()))} variant="body2" style={{whiteSpace: 'pre-line'}} dangerouslySetInnerHTML={{ __html: t(dialogData?.localdesc)?.replace('\n', '<br/>')}} />
                                <Menu
                                    open={openContextMenu}
                                    onClose={() => setOpenContextMenu(false)}
                                    anchorReference="anchorPosition"
                                    anchorPosition={mouseY !== null && mouseX !== null ? { top: mouseY, left: mouseX } : undefined}
                                >
                                    <MenuItem onClick={()=> onHandleCopyText()}>{t("str_copy")}</MenuItem>
                                </Menu>
                            </Grid>
                            {dialogData && dialogData.cta && (
                                <Grid item xs={12}>
                                    <br/>
                                    {renderButton(dialogData.cta)}
                                    <br/>
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                {type === 'event' && (dialogData.startdate || dialogData.enddate) && (
                                    <div style={{ display: 'flex', marginBottom: 10 }}>
                                        <Box mb={3} style={{ margin: '0 0 0 auto' }} component="fieldset" borderColor="transparent">
                                            {dialogData?.hasrecurr ? (
                                                <Chip
                                                    classes={{ deleteIcon: classes.deleteIcon }}
                                                    onDelete={()=> { return; }}
                                                    deleteIcon={
                                                        <Tooltip title={t('str_recurrence')} arrow>
                                                            <RepeatIcon/>
                                                        </Tooltip>
                                                    }
                                                    variant="outlined"
                                                    icon={<TodayIcon/>}
                                                    label={<RenderDateLabel />}
                                                />
                                            ): (
                                                <Chip
                                                    variant="outlined"
                                                    icon={<TodayIcon/>}
                                                    label={<RenderDateLabel />}
                                                />
                                            )}
                                        </Box>
                                    </div>
                                )}
                                <div style={{ display: 'flex', marginBottom: 10 }}>
                                    {(dialogData.price > 0 && type === 'event') && (
                                        <Tooltip title={t(dialogData.priceinfo)} interactive>
                                            <Chip
                                                variant="outlined"
                                                avatar={<Avatar style={{ background: '#e6e6e6', color: '#3c3c3c', fontSize: 15 }}>{getSymbolFromCurrency(dialogData.currcode)}</Avatar>}
                                                label={global.helper.formatPrice(dialogData.price)}
                                            />
                                        </Tooltip>
                                    )}
                                    {(dialogData.loclat && dialogData.loclng) && (
                                        <IconButton onClick={() => handleLocation()}>
                                            <LocationOnIcon />
                                        </IconButton>
                                    )}
                                    {dialogData.hasdoc && (
                                        <Tooltip title={t('str_info')}>
                                            <IconButton onClick={() => handleOpenInfo()}>
                                                <InfoOutlinedIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {
                                        dialogData?.locshowrevscore && (
                                            <Box mb={3} style={{ margin: '0 0 0 auto' }} component="fieldset" borderColor="transparent">
                                                {(type === 'info' && dialogData.locrate) && (
                                                    <Rating
                                                        name="customized-empty"
                                                        value={Number(dialogData.locrate) || ZERO}
                                                        precision={0.5}
                                                        emptyIcon={<StarBorderIcon fontSize="inherit" />}
                                                    />
                                                )}
                                                {(type === 'event' && dialogData.starttime) && (
                                                    <Chip
                                                        variant="outlined"
                                                        icon={<AccessTimeIcon />}
                                                        label={stdTimeFormat(dialogData.starttime)}
                                                    />
                                                )}
                                            </Box>
                                        )
                                    }
                                </div>
                            </Grid>
                            {(dialogData.locisposmain || dialogData.lochasres || dialogData.lochasmenu) && (
                                <Grid item xs={12}>
                                    <Grid container justify="center" spacing={2}>
                                        <Grid item>
                                            <ButtonGroup size="large" color="primary">
                                                {(isReservation) && (
                                                    <Button onClick={() => isLogin ? handleOpenRestaurant() : handleCheckIsLogin()}>{t('str_makeAReservation')}</Button>
                                                )}
                                                {dialogData.locdepartid && dialogData.lochasmenu && (
                                                    <Button onClick={handleRestaurantMenu}>{t('str_menu')}</Button>
                                                )}
                                            </ButtonGroup>
                                        </Grid>
                                    </Grid>
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
            {(openRestaurantReservation && (dialogData.lochasres || dialogData.locisposmain || dialogData.isspares)) ? (
                <RestaurantReservation
                    isOpen={openRestaurantReservation}
                    onClose={(e) => {
                        setOpenRestaurantReservation(e)
                        closeReservation()
                        updateState('guest', 'menuGroupAndProductList', FALSE)
                    }}
                    isRoomService={isRoomService}
                    eventLocData={dialogData}
                />
            ): null}
            {openRestaurantMenu && dialogData.lochasmenu && dialogData.locdepartid && (
                <MenuDialog
                    isOpen={openRestaurantMenu}
                    onClose={(e) => {
                        setOpenRestaurantMenu(e)
                        closeMenu()
                        updateState('guest', 'menuGroupAndProductList', FALSE)
                    }}
                    eventLocData={dialogData}
                />
            )}
            {(dialogData.hasdoc && openInfoDialog) && (
                <CardSliderItemInfoDialog
                    open={openInfoDialog}
                    close={(e)=> setOpenInfoDialog(e)}
                    dialogData={dialogData}
                />
            )}
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

export default connect(mapStateToProps, mapDispatchToProps)(CardSliderItemDialog)
