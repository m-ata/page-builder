import React, { useContext, useEffect, useState, useRef } from 'react'
import { connect, useSelector } from 'react-redux'
import { updateState } from 'state/actions'
import styles from './style/AccountBanner.style'
import Typography from '@material-ui/core/Typography'
import ListItem from '@material-ui/core/ListItem'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import { DropzoneDialog } from 'material-ui-dropzone'
import { makeStyles } from '@material-ui/core/styles'
import MuiExpansionPanel from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Delete, ViewList, UseOrest, Upload } from '@webcms/orest'
import {
    isErrorMsg,
    OREST_ENDPOINT,
    REQUEST_METHOD_CONST,
    useOrestQuery,
} from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import useNotifications from 'model/notification/useNotifications'
import NumberFormat from 'react-number-format'
import { useOrestAction } from 'model/orest'
import { withStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'
import * as global from '@webcms-globals'
import Container from '@material-ui/core/Container'
import MyLoyalty from 'components/guest/account/MyProfile/MyLoyalty'
import CircularProgress from '@material-ui/core/CircularProgress'
import Box from '@material-ui/core/Box'
import LoadingSpinner from 'components/LoadingSpinner'
import { useSnackbar } from 'notistack'
import { objectTransliterate } from '../../../@webcms-globals/helpers'

const useStyles = makeStyles(styles)

const Accordion = withStyles((theme) => ({
    root: {
        background: `transparent radial-gradient(closest-side at 50% 42%, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.light} 49%, ${theme.palette.secondary.dark} 200%) 0% 0% no-repeat padding-box`,
        '&$expanded': {
            margin: 0,
        },
    },
    expanded: {
        margin: 0,
    },
}))(MuiExpansionPanel)

const useStylesAvatarCircularProgress = makeStyles((theme) => ({
    root: {
        position: 'relative',
        zIndex: 3,
        marginTop: 5,
        '&:hover': {
            zIndex: 0,
        },
    },
    bottom: {
        color: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    top: {
        color: '#1a90ff',
        position: 'absolute',
        left: 0,
        animation: 'none',
    },
    circle: {
        strokeLinecap: 'round',
    },
}))

function AvatarCircularProgress(props) {
    const classes = useStylesAvatarCircularProgress()

    return (
        <div className={classes.root}>
            <CircularProgress
                variant="determinate"
                className={classes.bottom}
                size={160}
                thickness={4}
                {...props}
                value={100}
            />
            <CircularProgress
                variant="determinate"
                className={classes.top}
                classes={{
                    circle: classes.circle,
                }}
                size={160}
                thickness={4}
                {...props}
            />
        </div>
    )
}

const AccountBanner = (props) => {
    const classes = useStyles()
    const { updateState, state, isKiosk } = props
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()
    const { enqueueSnackbar } = useSnackbar()
    const txtContentCode = "0000505"

    const useStyleAvatar = makeStyles((theme) => ({
        root: {
            width: 160,
            height: 160,
            '&:hover': {
                zIndex: 3,
            },
            '&:hover:before': {
                content: `"${t('str_clickToChange')}"`,
                background: '#242424ab',
                color: '#ffffff',
                width: '100%',
                height: '100%',
                position: 'absolute',
                fontSize: '12px',
                textAlign: 'center',
                paddingTop: '75px',
                cursor: 'pointer',
            },
        },
        img: {
            padding: 12,
            borderRadius: 85,
        },
    }))

    const classesAvatar = useStyleAvatar()

    //redux
    const { showMessage, showError } = useNotifications()
        , { setOrestState } = useOrestAction()
        , token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
        , clientBase = useSelector((state) => state.orest.state && state.orest.state.client)
        , infoLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    //state
    const [isExpended, setIsExpended] = useState(true)
        , [isUpdateLoyaltyPoints, setIsUpdateLoyaltyPoints] = useState(false)
        , [bonusTransIsLoading, setBonusTransIsLoading] = useState(false)
        , [memcardIsLoading, setMemcardTransIsLoading] = useState(false)
        , [isClientLoyaltyCardLoading, setIsClientLoyaltyCardLoading] = useState(false)

    useEffect(() => {
        let active = true

        const updateLoyaltyData = async (active) => {
            await beforeUpdateLoyaltyData(active)
        }

        if (active) {
            if(!clientBase && token && infoLogin?.accgid){
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'client/view/get',
                    token,
                    params: {
                        gid: infoLogin.accgid,
                        chkselfish: false,
                        allhotels: true
                    }
                }).then((clientGetResponse) => {
                    if (clientGetResponse.status === 200 && clientGetResponse?.data?.data) {
                        const clientGetResponseData = clientGetResponse.data.data
                        setOrestState(['client'], objectTransliterate(clientGetResponseData, ['firstname', 'lastname', 'address1', 'note']))
                    }
                })
            }

            if (clientBase && clientBase?.id) {
                updateState('guest', 'clientReservIsLoading', true)
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'client/reservno',
                    token,
                    method: REQUEST_METHOD_CONST.GET,
                    params: {
                        clientid: clientBase.id,
                        isgapp: true,
                    },
                }).then((clientReservnoResponse) => {
                    if (active) {
                        if (clientReservnoResponse.status === 200 && clientReservnoResponse.data.count > 0) {
                            updateState('guest', 'changeHotelRefno', clientReservnoResponse.data.data.hotelrefno)
                            updateState('guest', 'changeHotelName', clientReservnoResponse.data.data.hotelname)
                            updateState('guest', 'clientReservation', clientReservnoResponse.data.data)
                            updateState('guest', 'totalPax', clientReservnoResponse.data.data.totalpax || 1)
                            updateState('guest', 'totalChd', clientReservnoResponse.data.data.totalchd || 0)
                            updateState('guest', 'clientReservIsLoading', false)
                        } else {
                            updateState('guest', 'clientReservation', null)
                            updateState('guest', 'clientReservIsLoading', false)
                        }
                    } else {
                        updateState('guest', 'clientReservIsLoading', false)
                    }
                }).catch(()=> {
                    updateState('guest', 'clientReservation', null)
                    updateState('guest', 'clientReservIsLoading', false)
                })

                if(!state.isSelectGift && clientBase && clientBase?.id && !bonusTransIsLoading && !memcardIsLoading){
                    updateLoyaltyData(active)
                }
            }
        }

        return () => {
            setIsUpdateLoyaltyPoints(false)
            setMemcardTransIsLoading(false)
            setIsClientLoyaltyCardLoading(false)
            active = false
        }

    }, [clientBase])

    useEffect(() => {
        let active = true
        if (active && !state.isSelectGift && !bonusTransIsLoading && !memcardIsLoading) {
            const updateLoyaltyData = async (active) => {
                await beforeUpdateLoyaltyData(active)
            }

            updateLoyaltyData(active)
        }
        return () => {
            setIsUpdateLoyaltyPoints(false)
            setMemcardTransIsLoading(false)
            setIsClientLoyaltyCardLoading(false)
            active = false
        }
    }, [state.isSelectGift])

    const accountBannerRef = useRef(null)

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const handleScroll = () => {
        const currentOffsetTop = accountBannerRef.current && accountBannerRef.current.getAttribute('lastOffsetTop') || accountBannerRef && accountBannerRef.current && accountBannerRef.current.offsetTop || false
        if (currentOffsetTop && window.pageYOffset > currentOffsetTop) {
            if (accountBannerRef.current && !accountBannerRef.current.getAttribute('lastOffsetTop')) {
                accountBannerRef.current.setAttribute('lastOffsetTop', accountBannerRef.current.offsetTop)
            }
            setIsExpended(false)
            accountBannerRef.current.setAttribute('style', `position: fixed; top: 60px; z-index:3; width: 100%;`)
        }else {
            if(accountBannerRef.current){
                accountBannerRef.current.removeAttribute('lastOffsetTop')
                accountBannerRef.current.removeAttribute('style')
            }
        }
    }

    const beforeUpdateLoyaltyData = async (active) => {
        if(!isUpdateLoyaltyPoints && clientBase && clientBase?.id){
            setIsClientLoyaltyCardLoading(true)
            setIsUpdateLoyaltyPoints(true)
            setBonusTransIsLoading(true)
            await UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.BONUSTRANS + '/' + OREST_ENDPOINT.STAT + '/' + OREST_ENDPOINT.ACC,
                token,
                method: REQUEST_METHOD_CONST.GET,
                params: {
                    limit: 1,
                    accid: clientBase.id,
                },
            }).then((r) => {
                if (active) {
                    if (r.status === 200) {
                        updateState('guest', 'bonusTransPoints', r.data.data[0])
                        setIsUpdateLoyaltyPoints(false)
                        setBonusTransIsLoading(false)
                    } else {
                        const retErr = isErrorMsg(r)
                        setIsUpdateLoyaltyPoints(false)
                        enqueueSnackbar(t(retErr.errorMsg), { variant: 'error' })
                        showError(retErr.errorMsg)
                        setBonusTransIsLoading(false)
                    }
                }
            })

            if(clientBase && clientBase?.id){
                setMemcardTransIsLoading(true)
                await UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.MEMCARD + '/' + OREST_ENDPOINT.NEXT + '/' + OREST_ENDPOINT.LIST,
                    token,
                    method: REQUEST_METHOD_CONST.GET,
                    params: {
                        accid: clientBase.id,
                    },
                }).then((r) => {
                    if (active) {
                        if (r.status === 200) {
                            updateState('guest', 'memCardNext', r.data.data[0])
                            if (r.data.data[0] && state.clientLoyaltyCard === false) {
                                UseOrest({
                                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                                    endpoint: OREST_ENDPOINT.RAFILE + '/' + OREST_ENDPOINT.LIST,
                                    token,
                                    params: {
                                        query: `code::${r.data.data[0].cardtypecode},contentype:${txtContentCode}`,
                                        limit: 1,
                                        allhotels: true,
                                    },
                                }).then((rafileResponse) => {
                                    if (rafileResponse.status === 200 && rafileResponse.data.count > 0) {
                                        updateState('guest', 'clientLoyaltyCard', rafileResponse.data.data[0].filedata)
                                        setIsUpdateLoyaltyPoints(false)
                                        setMemcardTransIsLoading(false)
                                        setIsClientLoyaltyCardLoading(false)
                                    } else {
                                        setIsUpdateLoyaltyPoints(false)
                                        setMemcardTransIsLoading(false)
                                        setIsClientLoyaltyCardLoading(false)
                                    }
                                }).catch(() => {
                                    setIsUpdateLoyaltyPoints(false)
                                    setMemcardTransIsLoading(false)
                                    setIsClientLoyaltyCardLoading(false)
                                })
                            } else {
                                setIsUpdateLoyaltyPoints(false)
                                setMemcardTransIsLoading(false)
                                setIsClientLoyaltyCardLoading(false)
                            }

                        } else {
                            const retErr = isErrorMsg(r)
                            setIsUpdateLoyaltyPoints(false)
                            setMemcardTransIsLoading(false)
                            setIsClientLoyaltyCardLoading(false)
                            enqueueSnackbar(t(retErr.errorMsg), { variant: 'error' })
                        }
                    }
                })
            }
        }
    }

    const handleChange = (event, isExpanded) => {
        setIsExpended(isExpanded)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const useStyleLoyaltyCard = makeStyles(() => ({
        root: {
            background: '#e4e4e4',
            borderRadius: 15,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            maxWidth: '374.66px',
            margin: '0 auto',
        },
        image: {
            backgroundSize: '100% 100%',
        },
    }))
    const classesLoyaltyCard = useStyleLoyaltyCard()

    const [profilePhotoUpload, setProfilePhotoUpload] = useState(false)
    const handleProfilePhotoUpload = (file) => {
        const uploadPhoto = () => {
            Upload({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                token,
                params: {
                    masterid: clientBase.mid,
                    code: 'PHOTO',
                    hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                },
                files: file,
            }).then((r) => {
                if (r.status === 200) {
                    let newFile = file[0]
                    let url = URL.createObjectURL(newFile)
                    updateState('guest', 'clientProfilePhoto', url)
                    setProfilePhotoUpload(false)
                    showMessage(t('str_updateIsSuccessfullyDone'))
                } else {
                    showMessage(t('str_unexpectedProblem'))
                    setProfilePhotoUpload(false)
                }
            })
        }

        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: token,
            params: {
                query: useOrestQuery({
                    masterid: clientBase.mid,
                    code: 'PHOTO'
                }),
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                allhotels: true
            },
        }).then((r) => {
            if (r.status === 200 && r.data.count > 0) {
                Delete({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token,
                    gid: r.data.data[0].gid,
                    params: {
                        hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                    },
                }).then((res) => {
                    if (res.status === 200) {
                        uploadPhoto()
                    } else {
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                    }
                })
            } else {
                uploadPhoto()
            }
        })
    }

    const cardPoints = state.memCardNext && Math.abs(((state.memCardNext.nextbonustotal - state.memCardNext.totalbonus) / state.memCardNext.totalbonus) * 100)

    if(isKiosk){
        return null
    }

    return (
        <Accordion expanded={isExpended} onChange={handleChange} ref={accountBannerRef}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls="panel1c-content" id="panel1c-header" classes={{ root: classes.rootCls, content: classes.contentCls }}>
                {!isExpended && (
                    <Grid container justify={'center'} alignItems={'center'}>
                        <Grid item xs={12}>
                            <Typography display={'block'} align={'center'} className={classes.memberFullName}>
                                {clientBase && (global.helper.capitalizeWord((clientBase.firstname).toLowerCase()) + ' ' + (clientBase.lastname).toUpperCase())}
                            </Typography>
                        </Grid>
                    </Grid>
                )}
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
                <Container maxWidth="lg">
                    <Grid container justify={'center'} alignItems={'center'} spacing={3}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Grid container justify={'center'} alignItems={'center'}>
                                <Grid item sm={6}>
                                    <Box position="relative" display="inline-flex">
                                        <AvatarCircularProgress value={cardPoints}/>
                                        <Box
                                            top={0}
                                            left={0}
                                            bottom={0}
                                            right={0}
                                            position="absolute"
                                            display="flex"
                                            alignItems="center"
                                            justify="center"
                                        >
                                            <Avatar
                                                src={state.clientProfilePhoto ? state.clientProfilePhoto : ''}
                                                classes={classesAvatar}
                                                onClick={() => setProfilePhotoUpload(true)}
                                            />
                                        </Box>
                                    </Box>
                                    <DropzoneDialog
                                        open={profilePhotoUpload}
                                        onSave={handleProfilePhotoUpload}
                                        acceptedFiles={['image/jpeg', 'image/png']}
                                        showPreviews={true}
                                        maxFileSize={5000000}
                                        filesLimit={1}
                                        onClose={() => setProfilePhotoUpload(false)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <List>
                                        {clientBase && clientBase.cardtypecode &&
                                        <ListItem>
                                            <Typography className={classes.memberType}>
                                                {(clientBase.cardtypecode + ' ' + t('str_member')).toUpperCase()}
                                            </Typography>
                                        </ListItem>
                                        }
                                        <ListItem>
                                            <Typography className={classes.memberFullName}>
                                                {clientBase && clientBase?.firstname && clientBase?.lastname && (global.helper.capitalizeWord((clientBase.firstname).toLowerCase()) + ' ' + (clientBase.lastname).toUpperCase())}
                                            </Typography>
                                        </ListItem>
                                    </List>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Grid container>
                                <Grid item xs={12}>
                                    {isClientLoyaltyCardLoading ? (
                                        <LoadingSpinner size={30}/>
                                    ) : state?.clientLoyaltyCard ? (
                                        (clientBase?.id ?
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: state.clientLoyaltyCard && Buffer.from(state.clientLoyaltyCard, 'base64').toString('utf-8')
                                                        .replaceAll('{fullname}', clientBase && clientBase.firstname + ' ' + clientBase.lastname)
                                                        .replaceAll('{point}', new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format((state.bonusTransPoints && state.bonusTransPoints.bonusleft) || '0'))
                                                        .replaceAll('{pts}', 'pts')
                                                        .replaceAll('{cardno}', clientBase && clientBase.cardno || clientBase && clientBase.id)
                                                        .replaceAll('{email}', clientBase && clientBase.email)
                                                        .replaceAll('{str_bonusExpired}', t('str_bonusExpired'))
                                                        .replaceAll('{bonusexpired}', new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format((state.bonusTransPoints && state.bonusTransPoints.bonusexpired) || '0'))
                                                        .replaceAll('{str_bonusGained}', t('str_bonusGained'))
                                                        .replaceAll('{bonusgained}', new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format((state.bonusTransPoints && state.bonusTransPoints.bonusgained) || '0'))
                                                        .replaceAll('{str_bonusLeft}', t('str_bonusLeft'))
                                                        .replaceAll('{bonusleft}', new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format((state.bonusTransPoints && state.bonusTransPoints.bonusleft) || '0'))
                                                        .replaceAll('{str_bonusUsed}', t('str_bonusUsed'))
                                                        .replaceAll('{bonusused}', new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format((state.bonusTransPoints && state.bonusTransPoints.bonusused) || '0'))
                                                        .replaceAll('{str_bonusLeftHc}', t('str_bonusLeftHc'))
                                                        .replaceAll('{bonuslefthc}', new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format((state.bonusTransPoints && state.bonusTransPoints.bonuslefthc) || '0'))
                                                }}
                                            /> : null)
                                    ) : (clientBase?.id ?
                                        <div className={classesLoyaltyCard.root}>
                                        <Grid container alignItems={'center'} className={classes.cardContainer}>
                                            <Grid item xs={12}>
                                                <Typography className={classes.cardBonus}>
                                                    <NumberFormat
                                                        value={(state.bonusTransPoints && state.bonusTransPoints.bonusgained) || '0'}
                                                        displayType={'text'}
                                                        decimalScale={2}
                                                        isNumericString={true}
                                                        thousandSeparator={true}
                                                    />
                                                    <span className={classes.cardPts}>{'pts'}</span>
                                                </Typography>
                                                <Typography className={classes.cardBonusLeft}>
                                                    {t('str_bonusLeftHc')}:
                                                    <span className={classes.cardBonusLeftPts}>
                                                       <NumberFormat
                                                           value={(state.bonusTransPoints && state.bonusTransPoints.bonusleft) || '0'}
                                                           displayType={'text'}
                                                           decimalScale={2}
                                                           isNumericString={true}
                                                           thousandSeparator={true}
                                                       /> {'pts'}
                                                    </span>
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Grid container justify={'space-between'}>
                                                    <Grid item xs={6}>
                                                        <Typography noWrap className={classes.cardClientName}>
                                                            {clientBase && clientBase.firstname} {clientBase && clientBase.lastname}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography noWrap className={classes.cardClientId}>
                                                            {clientBase && clientBase.id}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </div>: null)}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <MyLoyalty/>
                        </Grid>
                    </Grid>
                </Container>
            </AccordionDetails>
        </Accordion>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(AccountBanner)
