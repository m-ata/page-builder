import React, {useEffect, useContext, useState} from 'react'
import axios from 'axios'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'
import {
    IconButton,
    Grid,
    Paper,
    Typography,
    Button,
    Icon,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    CardMedia,
    Chip
} from '@material-ui/core'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { OREST_ENDPOINT } from 'model/orest/constants'
import { setToState } from 'state/actions'
import { connect } from 'react-redux'
import WebCmsGlobal from '../../webcms-global'
import RoomPriceWrap from '../../ibe/RoomPriceWrap'
import ProgressButton from './ProgressButton'
import RoomTypeAttributes from './RoomTypeAttributes'
import Slider from 'react-slick'
import LoadingSpinner from 'components/LoadingSpinner'
import { useSnackbar } from 'notistack'
import Alert from '@material-ui/lab/Alert'
import PersonIcon from '@material-ui/icons/Person'
import TagManager from '@webcms-globals/tag-manager'
import * as global from '@webcms-globals'
import { defaultLocale } from 'lib/translations/config'
import { useRouter } from 'next/router'
import { useTotalPrice, formatDiscRate } from 'lib/helpers/useFunction'
import WhatshotIcon from '@material-ui/icons/Whatshot'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        position: 'relative',
        marginBottom: 25
    },
    moreInfoRoot: {
        position: 'relative',
        textAlign: 'center',
        marginTop: -8,
        marginBottom: 10,
        '&::before': {
            content: '""',
            width: '100%',
            marginTop: 12,
            display: 'block',
            position: 'absolute',
            borderBottom: '1px dashed #ededed',
            boxShadow: '0 -15px 15px 10px #ffffff',
        },
    },
    moreInfoButton: {
        fontSize: '0.7rem',
        padding: '2px 10px 1px',
        background: 'white',
    },
    wrapper: {
        margin: 'auto',
        backgroundColor: '#fff',
        border: '1px solid #dadadd',
        borderRadius: 6
    },
    title: {
        fontWeight: 'bold',
        fontSize: '1.2rem'
    },
    description: {
        display: 'block',
        overflow: 'hidden',
        textAlign: 'justify',
        fontSize: '0.95rem'
    },
    thumbnail: {
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        borderRadius: '6px 0 0 0',
        [theme.breakpoints.down("md")]: {
            minHeight: 480,
            borderRadius: '6px 6px 0 0'
        },
        [theme.breakpoints.down("xs")]: {
            minHeight: 220
        }
    },
    rightColumn: {
        padding: '16px 16px 5px 16px',
    },
    bottomColumn: {

    },
    priceListItem: {
        borderTop: '1px solid #ebebeb'
    },
    attributeList: {
        display: 'inline-flex',
        padding: 0,
    },
    attributeItem: {
        position: 'relative',
        listStyleType: 'none',
        padding: '15px',
        borderRight: '1px solid #ababab59',
        '&:last-child': {
            borderRight: 'none',
        },
    },
    attributeIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        '-ms-transform': 'translate(-50%, -50%)',
        transform: 'translate(-50%, -50%)',
    },
    actionsContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        '& > div': {
            textAlign: 'right',
        },
    },
    addRoomTitle:{
      paddingRight: 6
    },
    addRoomButton: {
        padding: 6,
    },
    deleteRoomButton: {
        padding: 6,
    },
    addRoomTotal: {
        padding: 10,
        width: 50,
    },
    noRoomAlert: {
        width: '100%'
    },
    sliderImage: {
        padding: '0px 10px 10px 10px',
        [theme.breakpoints.only('xs')]: {
            padding: '0px 5px 5px 5px',
        },
    },
    sliderDesc: {
        marginTop: 50
    },
    media: {
        height: '50vh',
        [theme.breakpoints.only('xs')]: {
            height: '25vh',
        },
    },
    roomCardTotalPerInfoBox: {
        position: 'absolute',
        display: 'inline-block',
        top: 10,
        left: 10
    },
    roomCardTotalPerInfo: {
        color: '#000000',
        opacity: 0.9,
        fontSize: 16,
        marginLeft: 0,
        borderRadius: 6,
        backgroundColor: '#b5b5b5',
        border: 'none',
    },
    roomCardTotalPerInfoIcon: {
        color: '#000000!important',
    },
    priceDescBadge: {
        top: -3,
        left: -2,
        color: '#1a8a46',
        display: 'inline-block',
        padding: '0.9px 4px 0.6px 4px',
        position: 'relative',
        fontSize: 9,
        background: '#ebfff3',
        fontWeight: 'bolder',
        lineHeight: 1.6,
        borderRadius: 3,
        marginLeft: 3
    },
    lastRemainingRooms:{
        color: '#d32f2f',
        position: 'absolute',
        top: -12,
        right: 10,
        fontSize: 12,
        borderColor: '#d32f2fa1',
        backgroundColor: '#fff'
    },
    lastRemainingRoomsIcon: {
        color: '#d32f2f!important',
    },
    priceDescriptionBadge: {
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '14px',
        display: 'inline',
        borderRadius: 6,
        background: '#e3efff',
        color: '#0896ff',
        padding: '5px 8px',
    },
    roomCardSpliter: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 17,
        height: 65,
        position: 'relative',
        textAlign: 'center',
        '&:after': {
            content: '\'\'',
            display: 'block',
            background: '#dedede',
            width: 1,
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
        },
        '&:first-child': {
            '&:after': {
                display: 'none',
            }
        }
    },
    roomCardAddButton: {
        lineHeight: 1.3,
        marginTop: -1
    }
}))

const ThumbnailSlider = (props) => {
    const { open, onClose, sliderID, roomtypeDesc, roomTypeLongText } = props
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , [itemSlideData, setItemSlideData] = useState(false)
        , [isLoading, setIsLoading] = useState(false)
        , { t } = useTranslation()
        , classes = useStyles()

    useEffect(() => {
        let active = true
        if (active && open && sliderID) {
            setIsLoading(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/slider',
                method: 'post',
                params: {
                    sliderid: sliderID
                }
            }).then((sliderResponse) => {
                if (active) {
                    const sliderData = sliderResponse.data
                    if (sliderData.success && sliderData.data.length > 0) {
                        setItemSlideData(sliderData.data)
                    } else {
                        setItemSlideData(null)
                    }
                    setIsLoading(false)
                }
            })
        }

        return () => {
            active = false
            setIsLoading(false)
        }
    }, [open])

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

    return (
            <Dialog
                open={open}
                onClose={()=> onClose(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {roomtypeDesc && roomtypeDesc.textOnly().isLangCode() ? t(roomtypeDesc.textOnly()) : roomtypeDesc && <div dangerouslySetInnerHTML={{ __html: roomtypeDesc }} /> || ''}
                </DialogTitle>
                <DialogContent dividers style={{overflow: 'overlay', padding: 40}}>
                    {isLoading ?
                        (<React.Fragment>
                            <Box p={3}>
                                <LoadingSpinner size={50} />
                            </Box>
                        </React.Fragment>) :
                        (<Slider {...settings}>
                            {itemSlideData &&
                            itemSlideData.map((item, i) => {
                                return (
                                    <Box key={i} className={classes.sliderImage}>
                                        <CardMedia
                                            className={classes.media}
                                            image={GENERAL_SETTINGS.STATIC_URL + item.fileurl}
                                            title="Contemplative Reptile"
                                        />
                                    </Box>
                                )
                            })}
                        </Slider>)
                    }
                    <Typography variant="body1" gutterBottom className={classes.sliderDesc} align="justify">
                      {t(roomTypeLongText) || ''}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={()=> onClose(false)}>{t('str_close')}</Button>
                </DialogActions>
            </Dialog>
    )
}

const priceDescRender = (str) => {
    if(str){
        str = str.split(',')
        if(str.length > 0) return str
    }

    return [str]
}

const Description = ({ str = '', useLength = 275, useShort = 275, openSlider, moreInfoText }) => {
    const classes = useStyles()
    if (str && str.length >= useLength) {
        return (
            <React.Fragment>
                <Typography className={classes.description} variant='body1' gutterBottom>
                    {str.substring(0, useShort) + '...'}
                </Typography>
                <div className={classes.moreInfoRoot}>
                    <Button className={classes.moreInfoButton} variant='outlined' color='primary' size='small' onClick={() => openSlider()} style={{ fontSize: '0.7rem', padding: '2px 10px 1px' }}>
                        {moreInfoText}
                    </Button>
                </div>
            </React.Fragment>
        )
    }

    return (
        <Typography className={classes.description} variant='body1' gutterBottom>
            {str || ''}
        </Typography>
    )
}

const RoomCard = (props) => {
    const classes = useStyles()
        , { info, totalRoomSelected, state, setToState, isDisabled, roomUnAvailable } = props
        , { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
        , [totalRoom, setTotalRoom] = useState(1)
        , [isAddRoom, setIsAddRoom] = useState(false)
        , [isOpenSlider, setIsOpenSlider] = useState(null)
        , { enqueueSnackbar } = useSnackbar()
        , { t } = useTranslation()
        , router = useRouter()
        , settings = {
            containerMaxWidth: 'lg',
            containerSpacing: 0,
            wrapper: {
                elevation: 0,
                square: true,
            },
            leftColumn: {
                xs: 12,
                sm: 12,
                md: 12,
                lg: 4,
                xl: 4,
            },
            rightColumn: {
                xs: 12,
                sm: 12,
                md: 12,
                lg: 8,
                xl: 8,
            },
    }

    let isRoomCardDisable = false

    useEffect(() => {
        if(totalRoomSelected > 0){
            setTotalRoom(1)
        }else{
            setTotalRoom(0)
        }
    }, [totalRoomSelected, state.bookingIsDisable])

    const roomThumbnail = (roomid) => {
        return state.roomAvailabilityList && state.roomAvailabilityList.find((item) => item.id === roomid).imgfileurl
    }

    const roomName = (roomid) => {
        return state.roomAvailabilityList && t(state.roomAvailabilityList.find((item) => item.id === roomid).shorttext || '')
    }

    const priceCurr = (roomid) => {
        return state.roomAvailabilityList && state.roomAvailabilityList.find((item) => item.id === roomid).pricecurr
    }

    const agencyChdAges = { babyage: state.hotelBookingInfo.babyAge, chd1age: state.hotelBookingInfo.chd1Age, chd2age: state.hotelBookingInfo.chd2Age }

    const  getIsDisable = (totalPrice, pricecurr) => {
        return totalPrice === null || totalPrice === 0 || pricecurr === null;
    }

    const getTotalPrice = (priceList, adult, childAges, agencyChdAges) => {
       return useTotalPrice(priceList, adult, childAges, agencyChdAges)
    }

    const handleAddRoom = (contMasterId, priceListItemIndex) => {
        const addRoomData = {
            ci: moment(state.bookingState.stayDates[0]).locale(defaultLocale).format(OREST_ENDPOINT.DATEFORMAT),
            co: moment(state.bookingState.stayDates[1]).locale(defaultLocale).format(OREST_ENDPOINT.DATEFORMAT),
            resdate: moment(moment()).locale(defaultLocale).format(OREST_ENDPOINT.DATEFORMAT),
            adult: state.bookingState.adult,
            child: state.bookingState.child,
            night: state.bookingState.night,
            childages: state.childAges,
            resaction: 0,
            roomtype: info.id,
            qty: totalRoom,
            agencyid: state.hotelBookingInfo.agencyid,
            pricecurrid: info.pricecurrid || state.hotelBookingInfo.currencyid,
            searchid: state.searchid,
            uitoken: state.hotelUiToken,
            contmasterid: contMasterId
        }

        if(GENERAL_SETTINGS?.hotelSettings?.maxroom && state.selectedRooms.length >= GENERAL_SETTINGS.hotelSettings.maxroom){
            setToState('ibe', ['isMaxRoomError'], true)
            return enqueueSnackbar(t('str_youCanChooseAMaximumOfRooms', { maxroom: GENERAL_SETTINGS.hotelSettings.maxroom }), { variant: 'warning', autoHideDuration: 3000 })
        }

        setToState('ibe', ['bookingIsDisable'], true)
        setIsAddRoom(priceListItemIndex)
        return axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/ors/room/add',
            method: 'post',
            params: addRoomData,
        }).then((addRoomResponse) => {
            const roomResponse = addRoomResponse.data
            if (roomResponse.success) {
                if (roomResponse.data && roomResponse.data.length > 0 && !(roomResponse.data[0].totalprice > 0)) {
                    setIsAddRoom(false)
                    enqueueSnackbar(t('str_theOperationTimedOutPleaseWait'), {
                        variant: 'warning',
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                        },
                    })

                    return setTimeout(function() {
                        router.reload()
                    }, 1000)
                }

                let newRoomData = state.selectedRooms, addToCartData = []
                roomResponse.data.map((item) => {
                    let guestList = []
                    const numberOfGuests = (Number(item.totalpax) + Number(item.totalchd))
                    Array.from({length: numberOfGuests }).map(() => {
                        guestList.push({
                            firstName: {
                                value: '',
                                isrequired: true,
                                iserror: false,
                            },
                            lastName: {
                                value: '',
                                isrequired: true,
                                iserror: false,
                            },
                            mail: {
                                value: '',
                                isrequired: false,
                                iserror: false,
                            },
                            birthDate: {
                                value: '',
                                isrequired: false,
                                iserror: false,
                            },
                            phone: {
                                value: '',
                                isrequired: false,
                                iserror: false,
                            },
                            note: {
                                value: '',
                                isrequired: false,
                                iserror: false,
                            },
                            healthcode: {
                                value: '',
                                isrequired: false,
                                iserror: false,
                            }
                        })
                    })

                    newRoomData.push({
                        gid: item.gid,
                        roomtypeid: item.roomtypeid,
                        thumbnail: roomThumbnail(item.roomtypeid),
                        roomtypename: roomName(item.roomtypeid),
                        pricecurr: priceCurr(item.roomtypeid),
                        reservno: item.reservno,
                        totalpax: item.totalpax,
                        totalchd: item.totalchd,
                        totalnight: item.totalnight,
                        totalprice: item.totalprice,
                        dailyrate: item.dailyrate,
                        checkin: item.checkin,
                        checkout: item.checkout,
                        roomsearchid: roomResponse.searchid,
                        guestList: guestList,
                        childages: state.childAges,
                    })

                    addToCartData.push({
                        reservNo: item.reservno,
                        id: item.roomtypeid,
                        name: roomName(item.roomtypeid),
                        price: global.helper.formatPrice(item.totalprice),
                        qty: 1,
                        category: 'Room',
                    })

                })
                enqueueSnackbar(t('str_addedRoomSuccess'), { variant: 'success', autoHideDuration: 3000 })
                setToState('ibe', ['selectedRooms'], newRoomData)
                setToState('ibe', ['bookingIsDisable'], false)
                setIsAddRoom(false)
                if(WEBCMS_DATA?.assets?.meta?.googleTag){
                    TagManager.booking.setAddRoom({
                        eventLabel: 'Add to Cart',
                        hotelName: WEBCMS_DATA?.assets?.meta?.title,
                        hotelId: GENERAL_SETTINGS.HOTELREFNO,
                        ciDate: addRoomData.ci,
                        coDate: addRoomData.co,
                        adult: addRoomData.adult,
                        child: addRoomData.child,
                        currencyCode: priceCurr(addRoomData.roomtype),
                        addToCartData: addToCartData
                    })
                }

            }else {
                enqueueSnackbar(t('str_addRoomError'), { variant: 'warning', autoHideDuration: 3000 })
                setToState('ibe', ['bookingIsDisable'], false)
                setIsAddRoom(false)
            }
        })
    }

    const handleIncRoom = () => {
        if(totalRoomSelected > 0 && totalRoomSelected > totalRoom){
            setTotalRoom(totalRoom + 1)
        }
    }

    const handleSubRoom = () => {
        if(totalRoom > 1) {
            setTotalRoom((prevTotalRoom) => prevTotalRoom - 1)
        }
    }

    const checkTotalPrice = () => {
        let isDisable = false
        info.priceList.map((priceListItem) => {
            const roomPrice = getTotalPrice(priceListItem.prices, state.bookingState.adult, state.childAges, agencyChdAges)
            isRoomCardDisable = getIsDisable(roomPrice.totalPrice, info.pricecurr)
            isDisable = isRoomCardDisable
        })

        return isDisable
    }

    const roomPriceWrapGridSize = (desc, tagstr) => {
        let def = 3
        if (!desc) {
            def = def + 3
        }

        if (!tagstr) {
            def = def + 4
        }

        return def
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.wrapper} elevation={settings.wrapper.elevation} square={settings.wrapper.square}>
                <Grid container spacing={settings.containerSpacing}>
                    <Grid item
                          xs={settings.leftColumn.xs}
                          sm={settings.leftColumn.sm}
                          md={settings.leftColumn.md}
                          lg={settings.leftColumn.lg}
                          xl={settings.leftColumn.xl}
                    >
                        <div className={classes.thumbnail} onClick={() => setIsOpenSlider(true)} style={{ backgroundImage: `url(${info.imgfileurl && GENERAL_SETTINGS.STATIC_URL + '/' + info.imgfileurl || 'imgs/not-found.png'})` }}/>
                    </Grid>
                    <Grid className={classes.rightColumn} item
                          xs={settings.rightColumn.xs}
                          sm={settings.rightColumn.sm}
                          md={settings.rightColumn.md}
                          lg={settings.rightColumn.lg}
                          xl={settings.rightColumn.xl}
                    >
                        <Grid container spacing={0}>
                            <Grid item xs={12}>
                                {(!checkTotalPrice() && totalRoomSelected !== 0) && info?.totalroom > 0 && info?.totalroom < 5 ? (
                                    <Chip
                                        className={classes.lastRemainingRooms}
                                        size="small"
                                        variant="outlined"
                                        avatar={<WhatshotIcon className={classes.lastRemainingRoomsIcon} />}
                                        label={t('str_lastRemainingRooms', { totalroom: totalRoomSelected === totalRoom ? totalRoom : info.totalroom})}
                                    />
                                ): null}
                                <Typography className={classes.title} variant="h5" component="h2" gutterBottom noWrap>
                                    {t(info.shorttext)}
                                </Typography>
                                <Description
                                    str={t(info.longtext)}
                                    openSlider={()=> setIsOpenSlider(true)}
                                    moreInfoText={t('str_moreInfo')}
                                />
                            </Grid>
                            <Grid item xs={12}>
                               <RoomTypeAttributes roomtypeid={info.id} roomgid={info.roomgid}/>
                            </Grid>
                            {(!checkTotalPrice() && totalRoomSelected !== 0) ? (
                                <Grid item xs={12} style={{textAlign: 'end'}}>
                                    <Typography className={classes.addRoomTitle} variant='body2' display='inline'>
                                        {t('str_rooms')}
                                    </Typography>
                                    <IconButton
                                        className={classes.deleteRoomButton}
                                        aria-label='delete-room'
                                        disabled={state.bookingIsDisable || totalRoom === 1 || totalRoomSelected === 0}
                                        onClick={() => {
                                            handleSubRoom()
                                        }}
                                    >
                                        <Icon fontSize='small'>remove_circle_outline</Icon>
                                    </IconButton>
                                    <Typography className={classes.addRoomTotal} variant='button' display='inline'>
                                        {totalRoom}
                                    </Typography>
                                    <IconButton
                                        className={classes.addRoomButton}
                                        aria-label='add-room'
                                        disabled={state.bookingIsDisable || totalRoomSelected === totalRoom || totalRoomSelected === 0}
                                        onClick={() => {
                                            const selectedTotalRooms = state.selectedRooms.length + totalRoom
                                            if(GENERAL_SETTINGS?.hotelSettings?.maxroom && selectedTotalRooms >= GENERAL_SETTINGS.hotelSettings.maxroom){
                                                setToState('ibe', ['isMaxRoomError'], true)
                                                return enqueueSnackbar(t('str_youCanChooseAMaximumOfRooms', { maxroom: GENERAL_SETTINGS.hotelSettings.maxroom }), { variant: 'warning', autoHideDuration: 3000 })
                                            }
                                            handleIncRoom()
                                        }}
                                    >
                                        <Icon fontSize='small'>add_circle_outline</Icon>
                                    </IconButton>
                                </Grid>
                            ): null}
                        </Grid>
                    </Grid>
                    <Grid className={classes.bottomColumn} item xs={12}>
                        <Grid container>
                            {checkTotalPrice() || roomUnAvailable || isRoomCardDisable ? (
                                <Grid item xs={12} className={classes.priceListItem}>
                                    <Alert variant='outlined' severity='info' className={classes.noRoomAlert}>
                                        {t('str_noRoomsAvailable')}
                                    </Alert>
                                </Grid>
                            ): (
                                info?.priceList?.length > 0 && info.priceList.map((priceListItem, priceListItemIndex) => {
                                    const roomPrice = getTotalPrice(priceListItem.prices, state.bookingState.adult, state.childAges, agencyChdAges)
                                    isRoomCardDisable = getIsDisable(roomPrice.totalPrice, info.pricecurr)
                                    if(!isRoomCardDisable){
                                        return (
                                            <Grid item xs={12} className={classes.priceListItem}>
                                                <Grid container direction='row' justify='space-between' alignItems='center'>
                                                    {priceListItem?.description ? (
                                                        <Grid item xs={12} sm={3} className={classes.roomCardSpliter}>
                                                            <Typography variant="body2" className={classes.priceDescriptionBadge}>
                                                                {t(priceListItem.description)}
                                                            </Typography>
                                                        </Grid>
                                                    ): null}
                                                    {priceListItem?.tagstr ? (
                                                        <Grid item xs={12} sm={4} className={classes.roomCardSpliter}>
                                                            {priceDescRender(t(priceListItem.tagstr)).map((priceDesc) => {
                                                                return <span className={classes.priceDescBadge}>{priceDesc}</span>
                                                            })}
                                                        </Grid>
                                                    ): null}
                                                    <Grid item xs={12} sm={roomPriceWrapGridSize(priceListItem.description, priceListItem.tagstr)} style={{ textAlign: 'end', paddingTop: 3, paddingRight: 15 }} className={classes.roomCardSpliter}>
                                                        <RoomPriceWrap
                                                            totalPaxPrice={roomPrice.totalPrice}
                                                            currency={info.pricecurr}
                                                            discTotalPaxPrice={roomPrice.discrateTotal ? roomPrice.discTotalPrice : false}
                                                            discountDescription={roomPrice.discrateTotal ? `%${formatDiscRate(roomPrice.discrateTotal)} ${t('str_totalDiscount')}` : false}
                                                            priceList={priceListItem.prices}
                                                            adult={state.bookingState.adult}
                                                            chdAges={state.childAges}
                                                            agencyChdAges={agencyChdAges}
                                                            checkin={moment(state.bookingState.stayDates[0]).locale(defaultLocale).format(OREST_ENDPOINT.DATEFORMAT)}
                                                            checkout={moment(state.bookingState.stayDates[1]).locale(defaultLocale).format(OREST_ENDPOINT.DATEFORMAT)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={2} className={classes.roomCardSpliter}>
                                                        <ProgressButton
                                                            isLoading={isAddRoom === priceListItemIndex}>
                                                            <Button
                                                                disabled={isDisabled || isRoomCardDisable || totalRoomSelected === 0 || (isAddRoom === priceListItemIndex)}
                                                                onClick={() => !state.bookingIsDisable && handleAddRoom(priceListItem.id, priceListItemIndex)}
                                                                variant='contained'
                                                                size='small'
                                                                color='primary'
                                                                disableElevation
                                                                className={classes.roomCardAddButton}
                                                            >
                                                                {t('str_addRoom')}
                                                            </Button>
                                                        </ProgressButton>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        )
                                    }else {
                                        return null
                                    }
                                })
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
            <ThumbnailSlider open={isOpenSlider} onClose={(e)=> setIsOpenSlider(e)} sliderID={info.sliderid} roomtypeDesc={info.shorttext} roomTypeLongText={info?.longtext || ''}/>
            <div className={classes.roomCardTotalPerInfoBox}>
                {info?.totalpax ?
                    <Chip variant="outlined" avatar={<PersonIcon className={classes.roomCardTotalPerInfoIcon} />} label={info.totalpax} className={classes.roomCardTotalPerInfo}/>
                : null}
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.ibe,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RoomCard)

