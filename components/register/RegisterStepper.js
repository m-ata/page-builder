import React, {useContext, useEffect, useRef, useState} from 'react'
import {makeStyles, withStyles} from '@material-ui/core/styles'
import {connect} from 'react-redux'
import {setToState, updateState} from 'state/actions'
import axios from 'axios'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import StepConnector from '@material-ui/core/StepConnector'
import Check from '@material-ui/icons/Check'
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Basics from './RegisterSteps/steps/Basics'
import Address from './RegisterSteps/steps/Address'
import Layout from './RegisterSteps/steps/Layout'
import Photos from './RegisterSteps/steps/Photos'
import Videos from './RegisterSteps/steps/Videos'
import Facilities from './RegisterSteps/steps/Facilities'
import Descriptions from './RegisterSteps/steps/Descriptions'
import CircularProgress from '@material-ui/core/CircularProgress'
import {useRouter} from 'next/router'
import Final from './RegisterSteps/steps/Final'
import {
    CHCK_EMAIL,
    getBrowserName,
    isErrorMsg,
    isObjectEmpty,
    isObjectEqual,
    REQUEST_METHOD_CONST
} from 'model/orest/constants'
import useNotifications from 'model/notification/useNotifications'
import {
    VALIDATE_HELPER_TEXT_EMAIL,
    VALIDATE_HELPER_TEXT_EMAIL_NOT_VALID,
    VALIDATE_HELPER_TEXT_FIRST_NAME,
    VALIDATE_HELPER_TEXT_LAST_NAME,
    VALIDATE_HELPER_TEXT_PHONE,
    VALIDATE_HELPER_TEXT_PRIVACY_POLICY,
    VALIDATE_HELPER_TEXT_PROFILE,
    VALIDATE_HELPER_TEXT_RECAPTCHA,
} from './constants'
import WebCmsGlobal from 'components/webcms-global'
import {_newHcmImgOrderUtil} from './RegisterSteps/steps/components/photos/photosUtils'
import {
    DescriptionOutlined,
    HomeOutlined,
    KingBedOutlined,
    LocationOnOutlined,
    MovieOutlined,
    PhotoSizeSelectActualOutlined,
    StyleOutlined,
    ViewModule,
} from '@material-ui/icons'
import SlideshowIcon from '@material-ui/icons/Slideshow';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import Modules from './RegisterSteps/steps/Modules'
import useTranslation from 'lib/translations/hooks/useTranslation'
import RoomTypeSliderFrame from "./RegisterSteps/steps/components/rooms/roomtype-slider-frame";
import FaqEditStep from "./RegisterSteps/steps/FaqEditStep";
import {useSnackbar} from 'notistack'

const COLORS = {
    primary: '#0F4571',
    secondary: '#269DD4',
    contrastText: '#fff',
    backButton: '#CCCCCC',
}

const styles = (theme) => ({
    root: {
        primary: '#FF6D69',
        flexGrow: 1,
        backgroundColor: theme.palette.primary['A100'],
        overflow: 'hidden',
        backgroundSize: 'cover',
        marginTop: 10,
        padding: 20,
    },
    '@global': {
        'body': {
            backgroundColor: '#ffffff'
        },
        'button:focus': {
            outline: 'none',
        },
    },
    grid: {
        width: 1200,
        marginTop: 30,
        [theme.breakpoints.down('md')]: {
            marginTop: 10,
        },
        [theme.breakpoints.down('sm')]: {
            marginTop: 5,
        },
    },
    stepContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    stepGrid: {
        width: '80%',
    },
    backButton: {
        marginRight: theme.spacing(1),
        color: COLORS.backButton,
    },
    nextButton: {
        marginRight: theme.spacing(1),
        background: '#FF6D69 0% 0% no-repeat padding-box!important',
        border: 0,
        borderRadius: 20,
        boxShadow: '0px 2px 2px #0000003D',
        color: COLORS.contrastText,
        height: 40,
        padding: '0 30px',
    },
    cmgLinks: {
        fontSize: '1.20rem',
    },
    outlinedButton: {
        textTransform: 'uppercase',
        margin: theme.spacing(1),
    },
    stepper: {
        backgroundColor: 'transparent',
        alignItems: 'center',
        [theme.breakpoints.down('md')]: {
            padding: 6,
        },
    },
    paper: {
        padding: theme.spacing(3),
        textAlign: 'left',
        color: theme.palette.text.secondary,
        borderRadius: '10px',
    },
    topInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 42,
    },
    formControl: {
        width: '100%',
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    borderColumn: {
        borderBottom: `1px solid #CCCCCC`,
        paddingBottom: 24,
        marginBottom: 24,
    },
    flexBar: {
        marginTop: 32,
        display: 'flex',
        justifyContent: 'flex-end',
    },
    circleDiv: {
        top: '-105%',
        left: '-25%',
        width: '150%',
        height: '150%',
        display: 'flex',
        position: 'fixed',
        background: COLORS.primary,
        zIndex: '-99',
        alignItems: 'center',
        borderRadius: '50%',
        justifyContent: 'center',
    },
    logo: {
        position: 'absolute',
        width: '100%',
        textAlign: 'left',
        [theme.breakpoints.down('sm')]: {
            textAlign: 'center',
        },
        paddingLeft: 40,
        paddingRight: 40,
    },
    topText: {
        color: COLORS.contrastText,
        fontSize: 40,
        [theme.breakpoints.down('md')]: {
            fontSize: 35,
        },
        [theme.breakpoints.down('sm')]: {
            fontSize: 20,
        },
        fontWeight: 400,
        marginTop: 100,
    },
})

const useQontoStepIconStyles = makeStyles({
    root: {
        color: '#eaeaf0',
        display: 'flex',
        height: 22,
        alignItems: 'center',
    },
    active: {
        color: '#784af4',
    },
    circle: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
    },
    completed: {
        color: '#784af4',
        zIndex: 1,
        fontSize: 18,
    },
})

const QontoStepIcon = (props) => {
    const classes = useQontoStepIconStyles()
    const { active, completed } = props

    return (
        <div className={clsx(classes.root, { [classes.active]: active })}>
            {completed ? <Check className={classes.completed}/> : <div className={classes.circle}/>}
        </div>
    )
}

QontoStepIcon.propTypes = {
    active: PropTypes.bool,
    completed: PropTypes.bool,
}

const ColorlibConnector = withStyles((theme) => ({
    alternativeLabel: {
        top: 40,
        left: 'calc(-50% + 10px)',
        right: 'calc(50% + 10px)',
        [theme.breakpoints.down('sm')]: {
            top: 20,
        },
    },
    active: {
        '& $line': {
            background: 'transparent linear-gradient(270deg, #269DD4 0%, #0F4571 100%) 0% 0% no-repeat padding-box',
        },
    },
    completed: {
        '& $line': {
            backgroundColor: COLORS.primary,
        },
    },
    line: {
        height: 4,
        border: 0,
        backgroundColor: '#eaeaf0',
        borderRadius: 1,
    },
}))(StepConnector)

const useColorlibStepIconStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: '#ccc',
        zIndex: 1,
        color: '#269DD4',
        padding: 20,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        [theme.breakpoints.down('sm')]: {
            padding: 5,
        },
        '& img': {
            width: 35,
        },
    },
    active: {
        color: '#ffffff',
        backgroundColor: COLORS.secondary,
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
        '& img': {
            filter: 'brightness(0) invert(1)',
        },
    },
    completed: {
        backgroundColor: COLORS.primary,
        '& img': {
            filter: 'brightness(0) invert(1)',
        },
        color: '#ffffff',
    },
}))

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    stepperLabel: {
        cursor: 'pointer',
        [theme.breakpoints.down('sm')]: {
            fontSize: 10,
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: 9,
        },
    },
    stepWrapper: {
        [theme.breakpoints.up(1300)]: {
            width: 1300,
        },
        [theme.breakpoints.down(1300)]: {
            minWidth: 'calc(100vw - 12px)',
        },
        [theme.breakpoints.down('xs')]: {
            padding: 6,
        },
        padding: 20,
        borderRadius: 10,
        margin: '10px 5px',
    },
    stepWrapperPreRegister: {
        [theme.breakpoints.up(750)]: {
            width: 750,
        },
        [theme.breakpoints.down('xs')]: {
            padding: '20px 6px',
        },
        padding: '40px 20px',
        borderRadius: 10,
        margin: '10px 5px',
    },
    stepWrapperIsOweb: {
        width: '100%',
        height: '100vh',
        margin: 0,
        borderRadius: 0,
        padding: 20,
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: 25
    },
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    },
    actionNextButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
        minWidth: 105,
    },
    contentGrid: {
        [theme.breakpoints.up('sm')]: {
            minHeight: 515,
            marginTop: 35,
        },
    },
    hrLine: {
        width: 100,
        height: 3,
        display: 'block',
        backgroundColor: '#ff6e19',
        margin: '0 auto',
        marginTop: 10,
        marginBottom: 5,
    },
    preRegisterGrid: {
        maxWidth: 550,
        margin: 'auto',
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}))

const RegisterStepper = (props) => {
    const { state, setToState, updateState, pageStep, classes } = props
    const cls = useStyles()
    const router = useRouter()
    const token = router.query.authToken
    const isOnlyBasics = router.query.isOnlyBasics === '1'
    const preRegister = router.query.preRegister === '1'
    const runInit = router.query.runInit === '1'
    const isOweb = router.query.isOweb === '1'
    const masterid = router.query.masterid
    const companyId = router.query.companyID;
    const { showSuccess, showError } = useNotifications()
    const { enqueueSnackbar } = useSnackbar()
    const [isBasicsSaving, setIsBasicsSaving] = useState(false)
    const [isAddressSaving, setIsAddressSaving] = useState(false)
    const [isModuleListSaving, setIsModuleListSaving] = useState(false)
    const [openSliderDialog, setOpenSliderDialog] = useState(true);
    const [noRoom, setNoRoom] = useState(false);

    const { t } = useTranslation()
    const reCaptchaRef = useRef({})

    useEffect(() => {
        if(token) {
            axios({
                url: GENERAL_SETTINGS.OREST_URL + '/info/hotel',
                method: REQUEST_METHOD_CONST.GET,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    hotelrefno: companyId
                }
            }).then(res => {
                if(res.status === 200) {
                    setNoRoom(res.data.data.noroom)
                }
            }).catch((err) => {
                const retErr = isErrorMsg(err)
                enqueueSnackbar(retErr.errorMsg, { variant: 'error' })
            })
        }
    }, [])

    const getSteps = (isOnlyBasics, preRegister, isOweb) => {
        if (isOnlyBasics) {
            return ['Register', 'Address', 'Module Selection']
        } else if (preRegister) {
            return ['Register']
        } else if (isOweb) {
            if (!runInit) {
                if(state.isAdvanced) {
                    if(noRoom) {
                        return ['Facilities', 'Texts', 'Images', 'Videos', "Address", "Main-Slider", "FAQ"]
                    } else {
                        return ['Room Types', 'Facilities', 'Texts', 'Images', 'Videos', "Address", "Main-Slider", "FAQ"]
                    }
                } else {
                    if(noRoom) {
                        return ['Facilities', 'Texts', 'Images', 'Videos']
                    } else {
                        return ['Room Types', 'Facilities', 'Texts', 'Images', 'Videos']
                    }
                }
            } else {
                if(state.isAdvanced) {
                    if(noRoom) {
                        return ['Facilities', 'Texts', 'Images', "Address", "Main-Slider", "FAQ"]
                    } else {
                        return ['Room Types', 'Facilities', 'Texts', 'Images', "Address", "Main-Slider", "FAQ"]
                    }
                } else {
                    if(noRoom) {
                        return ['Facilities', 'Texts', 'Images']
                    } else {
                        return ['Room Types', 'Facilities', 'Texts', 'Images']
                    }

                }
            }

        } else {
            if (!runInit) {
                return ['Basics', 'Address', 'Room Types', 'Facilities', 'Texts', 'Images', 'Videos']
            } else {
                return ['Basics', 'Address', 'Room Types', 'Facilities', 'Texts', 'Images']
            }
        }
    }

    let STEPPER = {}
    if (isOweb) {
        if(noRoom) {
            STEPPER.BASIC = -2
            STEPPER.FACILITIES = 0
            STEPPER.DESCRIPTION = 1
            STEPPER.PHOTOS = 2
            STEPPER.ADDRESS = 4
            STEPPER.MAIN_SLIDER = 5
            STEPPER.FAQ = 6
        } else {
            STEPPER.BASIC = -2
            STEPPER.LAYOUT = 0
            STEPPER.FACILITIES = 1
            STEPPER.DESCRIPTION = 2
            STEPPER.PHOTOS = 3
            STEPPER.ADDRESS = 5
            STEPPER.MAIN_SLIDER = 6
            STEPPER.FAQ = 7
        }
        if (!runInit) {
            if(noRoom) {
                STEPPER.VIDEOS = 3
            } else {
                STEPPER.VIDEOS = 4
            }

        }
    } else {
        STEPPER.BASIC = 0
        STEPPER.ADDRESS = 1
        STEPPER.LAYOUT = 2
        STEPPER.FACILITIES = 3
        STEPPER.DESCRIPTION = 4
        STEPPER.PHOTOS = 5

        if (!runInit) {
            STEPPER.VIDEOS = 6
        }
    }

    function ColorlibStepIcon(props) {
        const classes = useColorlibStepIconStyles()
        const { active, completed } = props

        let icons
        if (isOweb) {
            if(noRoom) {
                icons = {
                    0: <HomeOutlined fontSize="large" color="inherit"/>,
                    1: <StyleOutlined fontSize="large" color="inherit"/>,
                    2: <DescriptionOutlined fontSize="large" color="inherit"/>,
                    3: <PhotoSizeSelectActualOutlined fontSize="large" color="inherit"/>,
                }
                if (!runInit) {
                    icons[4] = <MovieOutlined fontSize="large" color="inherit"/>
                }
                if(state.isAdvanced) {
                    icons[5] = <LocationOnOutlined fontSize="large" color="inherit"/>
                    icons[6] = <SlideshowIcon fontSize="large" color="inherit"/>
                    icons[7] = <HelpOutlineOutlinedIcon fontSize="large" color="inherit"/>
                }
            } else {
                icons = {
                    0: <HomeOutlined fontSize="large" color="inherit"/>,
                    1: <KingBedOutlined fontSize="large" color="inherit"/>,
                    2: <StyleOutlined fontSize="large" color="inherit"/>,
                    3: <DescriptionOutlined fontSize="large" color="inherit"/>,
                    4: <PhotoSizeSelectActualOutlined fontSize="large" color="inherit"/>,
                }
                if (!runInit) {
                    icons[5] = <MovieOutlined fontSize="large" color="inherit"/>
                }
                if(state.isAdvanced) {
                    icons[6] = <LocationOnOutlined fontSize="large" color="inherit"/>
                    icons[7] = <SlideshowIcon fontSize="large" color="inherit"/>
                    icons[8] = <HelpOutlineOutlinedIcon fontSize="large" color="inherit"/>
                }
            }

        } else if (isOnlyBasics) {
            icons = {
                1: <HomeOutlined fontSize="large" color="inherit"/>,
                2:
                    state.moduleUseType !== 'demo' ? (
                        <LocationOnOutlined fontSize="large" color="inherit"/>
                    ) : (
                        <ViewModule fontSize="large" color="inherit"/>
                    ),
                3: <ViewModule fontSize="large" color="inherit"/>,
                4: <StyleOutlined fontSize="large" color="inherit"/>,
                5: <DescriptionOutlined fontSize="large" color="inherit"/>,
                6: <PhotoSizeSelectActualOutlined fontSize="large" color="inherit"/>,
            }

            if (!runInit) {
                icons[7] = <MovieOutlined fontSize="large" color="inherit"/>
            }
        } else {
            icons = {
                1: <HomeOutlined fontSize="large" color="inherit"/>,
                2: <LocationOnOutlined fontSize="large" color="inherit"/>,
                3: <KingBedOutlined fontSize="large" color="inherit"/>,
                4: <StyleOutlined fontSize="large" color="inherit"/>,
                5: <DescriptionOutlined fontSize="large" color="inherit"/>,
                6: <PhotoSizeSelectActualOutlined fontSize="large" color="inherit"/>,
            }

            if (!runInit) {
                icons[7] = <MovieOutlined fontSize="large" color="inherit"/>
            }
        }

        return (
            <div
                className={clsx(classes.root, {
                    [classes.active]: active,
                    [classes.completed]: completed,
                })}
            >
                {icons[String(props.icon)]}
            </div>
        )
    }

    ColorlibStepIcon.propTypes = {
        active: PropTypes.bool,
        completed: PropTypes.bool,
        icon: PropTypes.node,
    }

    const steps = getSteps(isOnlyBasics, preRegister, isOweb)

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const nextStep = () => {

        if (pageStep !== steps.length) {
            if (pageStep === STEPPER.BASIC) {
                handleBasicsSave()
            } else if (pageStep === STEPPER.ADDRESS) {
                handleAddressSave();
                if(state.isAdvanced) {
                    updateState('registerStepper', 'pageStep', pageStep + 1)
                }
            } else if (pageStep === STEPPER.LAYOUT && isOnlyBasics) {
                handleModuleSave()
            } else if (pageStep === STEPPER.PHOTOS) {
                _newHcmImgOrderUtil(GENERAL_SETTINGS.OREST_URL, token, state.photosNewOrderList, updateState)

                if (!runInit) {
                    updateState('registerStepper', 'pageStep', pageStep + 1)
                }else{
                    if(state.isAdvanced) {
                        updateState('registerStepper', 'pageStep', pageStep + 1)
                    } else {
                        updateState('registerStepper', 'pageStep', 100)
                    }
                }
            } else if (STEPPER.VIDEOS && pageStep === STEPPER.VIDEOS) {
                if(state.isAdvanced) {
                    updateState('registerStepper', 'pageStep', pageStep + 1)

                } else {
                    updateState('registerStepper', 'pageStep', 100)
                }

            }  else if(pageStep === STEPPER.MAIN_SLIDER) {
                updateState('registerStepper', 'pageStep', pageStep + 1)
            } else if(pageStep === STEPPER.FAQ) {
                updateState('registerStepper', 'pageStep', 100)
            }
            else {
                updateState('registerStepper', 'pageStep', pageStep + 1)
            }
        }
    }

    const backStep = () => {
        if (pageStep > steps.length) {
            updateState('registerStepper', 'pageStep', steps.length - 1)
        } else if (pageStep !== 0) {
            updateState('registerStepper', 'pageStep', pageStep - 1)
        }
    }

    const handleSave = () => {
        if (pageStep === steps.length - 1) {
            updateState('registerStepper', 'pageStep', 100)
        }
    }

    const handleModuleSave = () => {
        let moduleList = []
        let currencyID = 0

        Object.keys(state.moduleGroupList).map((groupName) => {
            state.moduleGroupList[groupName].map((modules) => {
                if (modules.ischecked) {
                    if (currencyID === 0) {
                        currencyID = modules.currencyid
                    }
                    moduleList.push({ id: modules.id, qtyamount: modules.qtyamount, currencyid: modules.currencyid })
                }
            })
        })

        let discountID = 0
        for (let discount of state.salesDiscounts) {
            if (discount.ischecked) {
                discountID = discount.id
            }
        }

        if (moduleList.length > 0) {
            setIsModuleListSaving(true)
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/self-register/products/save',
                method: 'post',
                params: {
                    token: state.cacheToken,
                    id: state.cacheHotelID,
                    discountid: discountID,
                    currencyid: currencyID,
                    usetype: state.moduleUseType,
                    email: state.basics.agency.email,
                },
                data: moduleList,
            }).then((productsResponse) => {
                const productsData = productsResponse.data
                if (productsData.success) {
                    setIsModuleListSaving(false)
                    updateState('registerStepper', 'pageStep', 100)
                } else {
                    setIsModuleListSaving(false)
                    showError(t('str_moduleNotSavedError'))
                }
            })
        } else {
            setIsModuleListSaving(false)
            showError(t('str_selectOneModuleError'))
        }
    }

    const emailValidation = (email) => {
        return axios({
            url: `${GENERAL_SETTINGS.BASE_URL}api/ors/guest/email/valid`,
            method: 'post',
            data: {
                email: email
            }
        }).then((response)=> {
            return response.data
        })
    }

    const handleBasicsSave = async () => {
        if (state.basics.agency) {
            setIsBasicsSaving(true)
            let data = {}

            if (state.basics.agency.code !== state.basics.agencyBase.code) {
                data.code = String(state.basics.agency.code)
            }

            if (state.basics.agency.contact !== state.basics.agencyBase.contact) {
                data.contact = String(state.basics.agency.contact)
            }

            if (state.basics.agency.tel !== state.basics.agencyBase.tel) {
                data.tel = String(state.basics.agency.tel)
            }

            if (state.basics.agency.email !== state.basics.agencyBase.email) {
                const contactEmail = await emailValidation(state.basics.agency.email)
                if(contactEmail.exits){
                    setToState('registerStepper', ['basics', 'agency', 'validateEmail', 'helperText'], t('str_emailAlreadyExist'))
                    setToState('registerStepper', ['basics', 'agency', 'validateEmail', 'error'], true)
                    setIsBasicsSaving(false)
                    return;
                }else{
                    data.email = String(state.basics.agency.email)
                }
            }

            if (state.basics.agency.chainid !== state.basics.agencyBase.chainid) {
                data.chainid = state.basics.agency.chainid
                if (data.chainid === null) {
                    data.chainid = 0
                }
            }

            if (state.basics.agency.agencytypeid !== state.basics.agencyBase.agencytypeid) {
                data.agencytypeid = String(state.basics.agency.agencytypeid)
            }

            if (state.basics.agency.web !== state.basics.agencyBase.web) {
                data.web = String(state.basics.agency.web)
            }

            if (state.basics.agency.country !== state.basics.agencyBase.country) {
                data.country = String(state.basics.agency.country)
            }

            if (isOnlyBasics) {
                const agency = state.basics.agency
                if (!agency.code) {
                    setIsBasicsSaving(false)
                    showError('Please do not leave the property name field empty!')
                } else if (!agency.contact) {
                    setIsBasicsSaving(false)
                    showError('Please do not leave the contact field empty!')
                } else if (!agency.tel) {
                    setIsBasicsSaving(false)
                    showError('Please do not leave the tel field empty!')
                } else if (!agency.email) {
                    setIsBasicsSaving(false)
                    showError('Please do not leave the email field empty!')
                } else if (!CHCK_EMAIL.test(agency.email)) {
                    setIsBasicsSaving(false)
                    showError('Please enter a valid email address!')
                } /* else if (!agency.agencytypeid) {
                    setIsBasicsSaving(false);
                    showError('Please select a company type!');
                }*/ else if (
                    !agency.targetroom ||
                    (agency.targetroom && 0 > agency.targetroom)
                ) {
                    setIsBasicsSaving(false)
                    showError('Please enter a valid number of rooms!')
                } else if (state.moduleUseType === '') {
                    setIsBasicsSaving(false)
                    showError('Please choose a register type!')
                } else if (!state.isPrivacyPolicy) {
                    setIsBasicsSaving(false)
                    showError('Please verify Privacy Policy!')
                } else if (!state.reCaptcha) {
                    setIsBasicsSaving(false)
                    showError('Please verify recaptcha!')
                } else {
                    let code = agency.code.toUpperCase()

                    let data = {
                        code: code,
                        description: agency.code,
                        contact: agency.contact,
                        tel: agency.tel,
                        web: agency.web,
                        email: agency.email,
                        // "agencytypeid": Number(agency.agencytypeid),
                        country: agency.country,
                        countryid: agency.countryid,
                        targetroom: agency.targetroom,
                        recaptcha: state.reCaptcha,
                    }

                    return axios({
                        url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/self-register/save',
                        method: 'post',
                        data: data,
                    }).then((hotelResponse) => {
                        if (hotelResponse.status === 200) {
                            const hotelData = hotelResponse.data
                            if (hotelData.success) {
                                setIsBasicsSaving(false)
                                updateState('registerStepper', 'cacheToken', hotelData.token)
                                updateState('registerStepper', 'cacheHotelID', hotelData.data.id)
                                if (state.moduleUseType === 'demo') {
                                    updateState('registerStepper', 'pageStep', pageStep + 2)
                                } else {
                                    updateState('registerStepper', 'pageStep', pageStep + 1)
                                }

                                axios({
                                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/self-register/notify',
                                    method: 'post',
                                    params: {
                                        token: hotelData.token,
                                        notifytoken: hotelData.notifytoken,
                                    },
                                    data: {
                                        id: hotelData.data.id,
                                        code: hotelData.data.code,
                                        email: hotelData.data.email,
                                        contact: hotelData.data.contact,
                                        tel: hotelData.data.tel,
                                        browser: getBrowserName(window),
                                    },
                                }).then(() => {})
                            } else {
                                showError(t('str_propertyNameError'))
                                reCaptchaRef.current.reset()
                                setIsBasicsSaving(false)
                            }
                        }
                    })
                }
            } else if (preRegister) {
                const agency = state.basics.agency
                let isError = false
                if (!agency.firstName) {
                    isError = true
                    setToState('registerStepper', ['basics', 'agency', 'validateFirstName', 'error'], true)
                    setToState(
                        'registerStepper',
                        ['basics', 'agency', 'validateFirstName', 'helperText'],
                        VALIDATE_HELPER_TEXT_FIRST_NAME,
                    )
                }
                if (!agency.lastName) {
                    isError = true
                    setToState('registerStepper', ['basics', 'agency', 'validateLastName', 'error'], true)
                    setToState(
                        'registerStepper',
                        ['basics', 'agency', 'validateLastName', 'helperText'],
                        VALIDATE_HELPER_TEXT_LAST_NAME,
                    )
                }
                if (!agency.tel) {
                    isError = true
                    setToState('registerStepper', ['basics', 'agency', 'validatePhone', 'error'], true)
                    setToState(
                        'registerStepper',
                        ['basics', 'agency', 'validatePhone', 'helperText'],
                        VALIDATE_HELPER_TEXT_PHONE,
                    )
                }
                if (!agency.email) {
                    isError = true
                    setToState('registerStepper', ['basics', 'agency', 'validateEmail', 'error'], true)
                    setToState(
                        'registerStepper',
                        ['basics', 'agency', 'validateEmail', 'helperText'],
                        VALIDATE_HELPER_TEXT_EMAIL,
                    )
                }
                if (agency.email && !CHCK_EMAIL.test(agency.email)) {
                    isError = true
                    setToState('registerStepper', ['basics', 'agency', 'validateEmail', 'error'], true)
                    setToState(
                        'registerStepper',
                        ['basics', 'agency', 'validateEmail', 'helperText'],
                        VALIDATE_HELPER_TEXT_EMAIL_NOT_VALID,
                    )
                }
                if (!agency.agencytype) {
                    isError = true
                    setToState('registerStepper', ['basics', 'agency', 'validateProfile', 'error'], true)
                    setToState(
                        'registerStepper',
                        ['basics', 'agency', 'validateProfile', 'helperText'],
                        VALIDATE_HELPER_TEXT_PROFILE,
                    )
                }

                if (!agency.privacyPolicy) {
                    isError = true
                    showError(VALIDATE_HELPER_TEXT_PRIVACY_POLICY)
                } else if (!state.reCaptcha) {
                    isError = true
                    showError(VALIDATE_HELPER_TEXT_RECAPTCHA)
                }

                if (!isError) {
                    const url = GENERAL_SETTINGS.BASE_URL + ''
                    let data = {
                        fullname: agency.firstName + ' ' + agency.lastName,
                        tel: agency.tel,
                        web: agency.web,
                        email: agency.email,
                        country: agency.country,
                        note: agency.agencytype,
                        recaptcha: state.reCaptcha,
                    }

                    const options = {
                        url: url,
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        data: data,
                    }

                    return axios(options)
                        .then((response) => {
                            if (response.status === 200) {
                                updateState('registerStepper', 'pageStep', 100)
                            } else {
                                setIsBasicsSaving(false)
                            }
                        })
                        .catch((error) => {
                            setIsBasicsSaving(false)
                            return error.response || { status: 0 }
                        })
                } else {
                    setIsBasicsSaving(false)
                }
            }
        }
    }

    const handleBasicsCancel = () => {
        setToState('registerStepper', ['basics', 'agency'], state.basics.agencyBase)
    }

    const handleAddressSave = async () => {
        if (state.address.agency) {
            setIsAddressSaving(true)
            let data = {}

            if (state.address.agency.rescountryid !== state.address.agencyBase.rescountryid) {
                data.rescountryid = String(state.address.agency.rescountryid || '')
            }
            if (state.address.agency.country !== state.address.agencyBase.country) {
                data.country = String(state.address.agency.country || '')
            }
            if (state.address.agency.city !== state.address.agencyBase.city) {
                data.city = String(state.address.agency.city || '')
            }
            if (state.address.agency.town !== state.address.agencyBase.town) {
                data.town = String(state.address.agency.town || '')
            }
            if (state.address.agency.district !== state.address.agencyBase.district) {
                data.district = String(state.address.agency.district || '')
            }
            if (state.address.agency.zip !== state.address.agencyBase.zip) {
                data.zip = String(state.address.agency.zip || 0)
            }
            if (state.address.agency.address1 !== state.address.agencyBase.address1) {
                data.address1 = String(state.address.agency.address1 || '')
            }
            if (state.address.agency.address2 !== state.address.agencyBase.address2) {
                data.address2 = String(state.address.agency.address2 || '')
            }
            if (
                state.address.agency.lat !== state.address.agencyBase.lat ||
                state.address.agency.lng !== state.address.agencyBase.lng
            ) {
                if (!state.address.agencyBase.lat && !state.address.agencyBase.lng) {
                    await axios({
                        url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/self-register/address/geoloc/save',
                        method: 'post',
                        data: {
                            lat: Number(state.address.agency.lat),
                            lng: Number(state.address.agency.lng),
                            masterid: state.isAdvanced ? Number(masterid) : Number(state.address.agency.mid),
                        },
                    }).then((geoLocResponse) => {
                        if (geoLocResponse.status === 200) {
                            const geoLocData = geoLocResponse.data
                            if (geoLocData.success) {
                                showSuccess('New map coordinates saved!')
                                setToState(
                                    'registerStepper',
                                    ['address', 'agencyBase', 'lat'],
                                    state.address.agency.lat,
                                )
                                setToState(
                                    'registerStepper',
                                    ['address', 'agencyBase', 'lng'],
                                    state.address.agency.lng,
                                )
                            }
                        }
                    })
                } else {
                    await axios({
                        url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/self-register/address/geoloc/upd',
                        method: 'post',
                        data: {
                            lat: Number(state.address.agency.lat),
                            lng: Number(state.address.agency.lng),
                            masterid: state.isAdvanced ? Number(masterid) : Number(state.address.agency.mid),
                        },
                    }).then((geoLocResponse) => {
                        if (geoLocResponse.status === 200) {
                            const geoLocData = geoLocResponse.data
                            if (geoLocData.success) {
                                showSuccess('New map coordinates saved!')
                                setToState(
                                    'registerStepper',
                                    ['address', 'agencyBase', 'lat'],
                                    state.address.agency.lat,
                                )
                                setToState(
                                    'registerStepper',
                                    ['address', 'agencyBase', 'lng'],
                                    state.address.agency.lng,
                                )
                            }
                        }
                    })
                }
            }
            if(state.isAdvanced) {
                if(!isObjectEqual(state.address.agency, state.address.agencyBase)) {
                    axios({
                        url: GENERAL_SETTINGS.OREST_URL + '/hotel/lic/contact/save',
                        method: REQUEST_METHOD_CONST.POST,
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            address1: state.address.agency.address1,
                            address2: state.address.agency.address2 ? state.address.agency.address2 : "",
                            city: state.address.agency.city,
                            contact: "Licence Contact",
                            invtitle: "Invoice Title",
                            taxno: "11111111111",
                            country: state.address.agency.country,
                            district: state.address.agency.district,
                            town: state.address.agency.town,
                            zip: state.address.agency.zip,
                            web: state.address.agency.contactweb ? state.address.agency.contactweb : "",
                            email: "default@default.com",
                            hotelrefno: companyId
                        }
                    }).then(res => {
                        if(res.status === 200) {
                            enqueueSnackbar("success", { variant: 'success' })
                        }
                    }).catch(err => {
                        const retErr = isErrorMsg(err)
                        enqueueSnackbar(retErr.errorMsg, { variant: 'error' })
                    })
                }
             setIsAddressSaving(false);
            } else {
                if (!isObjectEmpty(data)) {
                    await axios({
                        url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/self-register/address/upd',
                        method: 'post',
                        params: {
                            token: state.cacheToken,
                            id: state.cacheHotelID,
                            gid: state.address.agency.gid,
                        },
                        data: data,
                    }).then((hotelRegisterResponse) => {
                        const hotelRegisterData = hotelRegisterResponse.data
                        if (hotelRegisterData.success) {
                            setToState('registerStepper', ['address', 'agency'], hotelRegisterData.data)
                            setToState('registerStepper', ['address', 'agencyBase'], hotelRegisterData.data)
                            setIsAddressSaving(false)
                            updateState('registerStepper', 'pageStep', pageStep + 1)
                        } else {
                            showError('Not Saved!')
                            setIsAddressSaving(false)
                        }
                    })
                } else {
                    showError('Please do not leave the required fields blank!')
                    setIsAddressSaving(false)
                }
            }


        }
    }

    const handleAddressCancel = () => {
        setToState('registerStepper', ['address', 'agency'], state.address.agencyBase)
    }

    return (
        <React.Fragment>
            <Grid container className={cls.root} justify={'center'}>
                <Grid item style={isOweb || isOnlyBasics ? { width: '100%' } : { margin: 'auto', marginTop: 50 }}>
                    {preRegister && (
                        <Typography
                            component="h1"
                            variant="h4"
                            align={'center'}
                            style={{ paddingTop: 10, marginBottom: '5vh' }}
                        >
                            {t('str_register').toUpperCase()}
                            <span className={cls.hrLine}/>
                        </Typography>
                    )}
                    <Paper
                        className={
                            preRegister
                                ? cls.stepWrapperPreRegister
                                : isOweb || isOnlyBasics
                                ? cls.stepWrapperIsOweb
                                : cls.stepWrapper
                        }
                        elevation={0}
                    >
                        {!preRegister && (
                            <React.Fragment>
                                <div style={{textAlign: "right"}}>
                                    <FormControlLabel
                                        color={"primary"}
                                        style={{opacity: (isOweb && pageStep === STEPPER.LAYOUT || isOweb && noRoom && pageStep === STEPPER.FACILITIES) ? "1" : "0"}}
                                        value={state.isAdvanced}
                                        onChange={(e) => setToState('registerStepper', ['isAdvanced'], e.target.checked)}
                                        label={t("str_advanced")}
                                        control={<Checkbox />}
                                    />
                                </div>
                                <Stepper
                                    classes={{ root: classes.stepper }}
                                    activeStep={state.pageStep}
                                    alternativeLabel
                                    connector={<ColorlibConnector/>}
                                >
                                    {steps.map((label, i) => {
                                        if (isOnlyBasics) {
                                            if (state.moduleUseType === '' || state.moduleUseType !== 'demo') {
                                                return (
                                                    <Step key={label}>
                                                        <StepLabel
                                                            classes={{ label: cls.stepperLabel }}
                                                            StepIconComponent={ColorlibStepIcon}
                                                        >
                                                            {label}
                                                        </StepLabel>
                                                    </Step>
                                                )
                                            } else {
                                                if (i !== 1) {
                                                    return (
                                                        <Step key={label}>
                                                            <StepLabel
                                                                classes={{ label: cls.stepperLabel }}
                                                                StepIconComponent={ColorlibStepIcon}
                                                            >
                                                                {label}
                                                            </StepLabel>
                                                        </Step>
                                                    )
                                                }
                                            }
                                        } else {
                                            return (
                                                <Step key={label}>
                                                    <StepLabel
                                                        classes={{ label: cls.stepperLabel, alternativeLabel: cls.stepperLabel }}
                                                        StepIconComponent={ColorlibStepIcon}
                                                        onClick={() => {
                                                            if(pageStep === STEPPER.ADDRESS) {
                                                                handleAddressSave()
                                                            }
                                                            updateState('registerStepper', 'pageStep', i);
                                                        }}
                                                    >
                                                        {label}
                                                    </StepLabel>
                                                </Step>
                                            )
                                        }
                                    })}
                                </Stepper>
                            </React.Fragment>
                        )}
                        <Grid container className={clsx(cls.contentGrid, preRegister && cls.preRegisterGrid)}>
                            <Grid item xs={12} style={{ height: '100%', minHeight: 250 }}>
                                {pageStep === STEPPER.BASIC && (
                                    <Basics reCaptchaRef={reCaptchaRef} pageStep={pageStep}/>
                                )}
                                {pageStep === STEPPER.ADDRESS && <Address isAdvanced={state.isAdvanced}/>}
                                {pageStep === STEPPER.LAYOUT && !isOnlyBasics && !noRoom ? (
                                    <Layout/>
                                ) : pageStep === STEPPER.LAYOUT && isOnlyBasics ? (
                                    <Modules/>
                                ) : (
                                    ''
                                )}
                                {pageStep === STEPPER.FACILITIES && <Facilities/>}
                                {pageStep === STEPPER.DESCRIPTION && <Descriptions/>}
                                {pageStep === STEPPER.PHOTOS && <Photos/>}
                                {pageStep === STEPPER.VIDEOS && <Videos/>}
                                {pageStep === STEPPER.MAIN_SLIDER &&
                                    <React.Fragment>
                                        <div style={{textAlign: "center"}}>
                                            <Button color={"primary"} variant={"contained"} onClick={() => setOpenSliderDialog(true)}>Edit Slider</Button>
                                        </div>
                                        <RoomTypeSliderFrame open={openSliderDialog} masterid={masterid || false} onClose={(status) => setOpenSliderDialog(status)} />
                                    </React.Fragment>
                                }
                                {pageStep === STEPPER.FAQ && <FaqEditStep />

                               }
                                {/*{pageStep === 5 && (*/}
                                {/*    <Policies/>*/}
                                {/*)}*/}
                                {/*{pageStep === 6 && (*/}
                                {/*    <Payment/>*/}
                                {/*)}*/}
                                {pageStep === 100 && <Final/>}
                            </Grid>
                        </Grid>
                        <Grid container direction="row" justify="center" alignItems="flex-end">
                            {preRegister ? (
                                pageStep !== steps.length - 1 ||
                                (preRegister && pageStep !== 100 && (
                                    <Grid item xs={12} style={{ textAlign: 'center' }}>
                                        <Button
                                            variant="contained"
                                            disabled={isBasicsSaving}
                                            style={{
                                                width: '100%',
                                                maxWidth: 550,
                                                borderRadius: 50,
                                                marginTop: 30,
                                                marginBottom: 0,
                                                height: 50,
                                            }}
                                            onClick={nextStep}
                                            color="primary"
                                        >
                                            {'Register'}
                                        </Button>
                                    </Grid>
                                ))
                            ) : (
                                <React.Fragment>
                                    <Grid item xs={12}>
                                        <div className={cls.actionButtons}>
                                            {!isOnlyBasics &&
                                            pageStep === 1 &&
                                            state.address.agency &&
                                            state.address.agencyBase &&
                                            (state.address.agency.country !== state.address.agencyBase.country ||
                                                state.address.agency.city !== state.address.agencyBase.city ||
                                                state.address.agency.town !== state.address.agencyBase.town ||
                                                state.address.agency.district !==
                                                state.address.agencyBase.district ||
                                                state.address.agency.zip !== state.address.agencyBase.zip ||
                                                state.address.agency.address1 !==
                                                state.address.agencyBase.address1 ||
                                                state.address.agency.address2 !==
                                                state.address.agencyBase.address2 ||
                                                state.address.agency.lat !== state.address.agencyBase.lat ||
                                                state.address.agency.lng !== state.address.agencyBase.lng) && (
                                                <Button
                                                    variant="outlined"
                                                    disabled={isAddressSaving}
                                                    onClick={handleAddressCancel}
                                                    className={cls.actionButton}
                                                >
                                                    {t('str_cancel')}
                                                </Button>
                                            )}
                                            {pageStep !== 0 && !isOnlyBasics && !preRegister && (
                                                <Button
                                                    className={cls.actionButton}
                                                    disabled={isAddressSaving}
                                                    onClick={backStep}
                                                >
                                                    {t('str_back')}
                                                </Button>
                                            )}
                                            {!isOnlyBasics &&
                                            !preRegister &&
                                            pageStep === 0 &&
                                            state.basics.agency &&
                                            state.basics.agencyBase &&
                                            (state.basics.agency.code !== state.basics.agencyBase.code ||
                                                state.basics.agency.contact !== state.basics.agencyBase.contact ||
                                                state.basics.agency.tel !== state.basics.agencyBase.tel ||
                                                state.basics.agency.email !== state.basics.agencyBase.email ||
                                                state.basics.agency.chainid !== state.basics.agencyBase.chainid ||
                                                state.basics.agency.agencytypeid !==
                                                state.basics.agencyBase.agencytypeid ||
                                                state.basics.agency.web !== state.basics.agencyBase.web) && (
                                                <Button
                                                    variant="outlined"
                                                    disabled={isBasicsSaving}
                                                    onClick={handleBasicsCancel}
                                                    className={cls.actionButton}
                                                >
                                                    {t('str_cancel')}
                                                </Button>
                                            )}
                                            {pageStep === steps.length - 1 && !isOweb && !isOnlyBasics && !preRegister && (
                                                <Button
                                                    variant="contained"
                                                    className={cls.actionNextButton}
                                                    onClick={handleSave}
                                                    color="primary"
                                                >
                                                    {' '}
                                                    {t('str_finish')}{' '}
                                                </Button>
                                            )}
                                            {((pageStep !== steps.length - 1 || isOnlyBasics || preRegister) &&
                                                pageStep !== 100 &&
                                                state.isCheckCompany) ||
                                            (pageStep !== 100 && isOweb && !state.isCheckCompany && (
                                                <Button
                                                    variant="contained"
                                                    disabled={isBasicsSaving || isAddressSaving}
                                                    className={cls.actionNextButton}
                                                    onClick={nextStep}
                                                    color="primary"
                                                >
                                                    {isOnlyBasics || preRegister ? 'Register' : 'Continue'}
                                                </Button>
                                            ))}

                                            {isOnlyBasics && state.isCheckCompany && pageStep === 0 && (
                                                <Button
                                                    disabled={isBasicsSaving || isAddressSaving || isModuleListSaving}
                                                    onClick={() =>
                                                        updateState('registerStepper', 'isCheckCompany', false)
                                                    }
                                                >
                                                    {t('str_back')}
                                                </Button>
                                            )}

                                            {isOnlyBasics && state.isCheckCompany && pageStep !== 100 && (
                                                <div className={cls.wrapper}>
                                                    <Button
                                                        variant="contained"
                                                        disabled={
                                                            isBasicsSaving || isAddressSaving || isModuleListSaving
                                                        }
                                                        className={cls.actionNextButton}
                                                        onClick={nextStep}
                                                        color="primary"
                                                    >
                                                        {t('str_continue')}
                                                    </Button>
                                                    {(isBasicsSaving || isAddressSaving || isModuleListSaving) && (
                                                        <CircularProgress size={24} className={cls.buttonProgress}/>
                                                    )}
                                                </div>
                                            )}

                                            {isOnlyBasics && !state.isCheckCompany && pageStep !== 100 && (
                                                <Button
                                                    variant="contained"
                                                    disabled={
                                                        state.agencyListSearch.isInitialized ||
                                                        state.agencyListSearch.isContinue ||
                                                        state.agencyListSearch.inputAgencyValue.length === 0 ||
                                                        (state.agencyListSearch.inputAgencyValue &&
                                                            3 > state.agencyListSearch.inputAgencyValue.length)
                                                            ? true
                                                            : false
                                                    }
                                                    color={
                                                        state.agencyListSearch.isInitialized ||
                                                        state.agencyListSearch.isContinue ||
                                                        state.agencyListSearch.inputAgencyValue.length === 0 ||
                                                        (state.agencyListSearch.inputAgencyValue &&
                                                            3 > state.agencyListSearch.inputAgencyValue.length)
                                                            ? 'inherit'
                                                            : 'primary'
                                                    }
                                                    onClick={() =>
                                                        updateState('registerStepper', 'isCheckCompany', true)
                                                    }
                                                    className={cls.actionNextButton}
                                                >
                                                    {t('str_continue')}
                                                </Button>
                                            )}
                                        </div>
                                    </Grid>
                                </React.Fragment>
                            )}
                        </Grid>
                    </Paper>
                    {preRegister && (
                        <Typography variant="subtitle2" align={'center'} style={{ marginTop: 20, marginBottom: 20 }}>
                            © 2020 hotech, {t('str_allRightsReserved')}
                        </Typography>
                    )}
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RegisterStepper))
