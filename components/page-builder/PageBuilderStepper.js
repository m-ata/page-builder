//imports from react
import React, { useEffect, useState, useContext } from 'react'
//redux imports
import { connect } from 'react-redux'
import { pushToState, deleteFromState, setToState, updateState } from '../../state/actions'
//material imports
import { makeStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepConnector from '@material-ui/core/StepConnector'
import FormControl from '@material-ui/core/FormControl'
import WebAssetIcon from '@material-ui/icons/WebAsset'
import WebIcon from '@material-ui/icons/Web'
import EmailIcon from '@material-ui/icons/Email'
import HomeIcon from '@material-ui/icons/Home'
import BrushIcon from '@material-ui/icons/Brush'
import VisibilityIcon from '@material-ui/icons/Visibility'
import HelpIcon from '@material-ui/icons/Help'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import clsx from 'clsx'
//custom components imports
import Page from './PageBuilderSteps/steps/webpage/Page'
import Style from './PageBuilderSteps/steps/assets/Style'
import Asset from './PageBuilderSteps/steps/assets/Asset'
import Final from './PageBuilderSteps/steps/webpage/Final'
import Preview from './PageBuilderSteps/steps/webpage/Preview'
import Home from './PageBuilderSteps/steps/home/Home'
import WebsitePage from './PageBuilderSteps/steps/website/Page'
import WebsitePreview from './PageBuilderSteps/steps/website/Preview'
import WebsiteFinal from './PageBuilderSteps/steps/website/Final'
import EmailDesign from './PageBuilderSteps/steps/email/EmailDesign'
import EmailPreview from './PageBuilderSteps/steps/email/EmailPreview'
import EmailSave from './PageBuilderSteps/steps/email/EmailSave'
import LoadingSpinner from '../LoadingSpinner'
import GenericSlider from './PageBuilderSteps/components/slider'
import FAQDesign from './PageBuilderSteps/steps/faq/FaqDesign'
import FAQPreview from './PageBuilderSteps/steps/faq/FAQPreview'
import FAQSave from './PageBuilderSteps/steps/faq/FAQSave'
// imports for toaster
import { ToastContainer, toast } from 'react-toastify'
//constants imports
import { COLORS, SAVED_SUCCESS, PB_OPTIONS } from './PageBuilderSteps/constants/index'
import WebCmsGlobal from 'components/webcms-global'
import { isErrorMsg, OREST_ENDPOINT } from '../../model/orest/constants'
import { ViewList, Insert, Patch, UseOrest } from '@webcms/orest'
import { useRouter } from 'next/router'
import axios from 'axios'
import RedirectsEditor from '../redirects'

const useStyles = makeStyles((theme) => ({
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: theme.spacing(2),
    },
    actionButton: {
        borderRadius: 20,
        marginBottom: 16,
        backgroundColor: COLORS?.secondary,
    },
    newButton: {
        marginTop: theme.spacing(2),
        float: 'right',
        backgroundColor: COLORS?.secondary,
    },
    assetButton: {
        borderRadius: 20,
        float: 'right',
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(1),
        // backgroundColor: COLORS.secondary
    },
    backButton: {
        borderRadius: 20,
        marginBottom: 16,
    },
    disabled: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
}))

const theme = createMuiTheme({
    palette: {
        primary: {
            main: COLORS?.secondary,
            dark: COLORS?.primary,
            light: COLORS?.secondary,
            contrastText: 'white',
        },
    },
})

const useColorStepIconStyle = makeStyles(() => ({
    root: {
        backgroundColor: '#ccc',
        zIndex: 1,
        color: '#fff',
        width: 65,
        height: 65,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        '& img': {
            width: 35,
        },
    },
    iconSize: {
        height: 50,
        width: 50,
    },
    active: {
        backgroundColor: COLORS?.secondary,
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    },
    completed: {
        backgroundColor: COLORS?.primary,
        color: '#fff',
    },
}))

const ColorlibConnector = withStyles({
    alternativeLabel: {
        top: 30,
        left: 'calc(-50% + 10px)',
        right: 'calc(50% + 10px)',
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
})(StepConnector)

function getStepsIcons(step, isActive, isCompleted, pageBuilderType) {
    const icon_classes = useColorStepIconStyle()
    let icons = {}
    switch (pageBuilderType) {
        case 'webPage':
            icons = {
                0: <HomeIcon className={icon_classes.iconSize} />,
                1: <MenuBookIcon className={icon_classes.iconSize} />,
                2: <VisibilityIcon className={icon_classes.iconSize} />,
            }
            break
        case 'website':
            icons = {
                0: <HomeIcon className={icon_classes.iconSize} />,
                1: <WebIcon className={icon_classes.iconSize} />,
                2: <VisibilityIcon className={icon_classes.iconSize} />,
            }
            break
        case 'email':
            icons = {
                0: <HomeIcon className={icon_classes.iconSize} />,
                1: <EmailIcon className={icon_classes.iconSize} />,
                2: <VisibilityIcon className={icon_classes.iconSize} />,
            }
            break
        case 'faqOnly':
            icons = {
                0: <HelpIcon className={icon_classes.iconSize} />,
                1: <VisibilityIcon className={icon_classes.iconSize} />,
            }
            break
        case 'assets':
            icons = {
                0: <HomeIcon className={icon_classes.iconSize} />,
                1: <BrushIcon className={icon_classes.iconSize} />,
                2: <WebAssetIcon className={icon_classes.iconSize} />,
            }
            break
        case 'assetOnly':
            icons = {
                0: <BrushIcon className={icon_classes.iconSize} />,
                1: <WebAssetIcon className={icon_classes.iconSize} />,
            }
            break
        default:
            return icons
    }

    return (
        <div
            className={clsx(icon_classes.root, {
                [icon_classes.active]: isActive,
                [icon_classes.completed]: isCompleted,
            })}
        >
            {icons[step]}
        </div>
    )
}

const PageBuilderStepper = (props) => {
    const { state, updateState, deleteFromState, pushToState } = props

    const classes = useStyles()

    //local state
    const [renderFinal, setRenderFinal] = useState('')
    const [pageBuilderType, setPageBuilderType] = useState('')
    const [isWebPageSelected, setWebPageSelected] = useState(false)
    const [isWebsiteSelected, setWebsiteSelected] = useState(false)
    const [isEmailSelected, setEmailSelected] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isRequestSend, setRequestSend] = useState(false)
    const [url, setUrl] = useState('')
    const [openRedirectEditor, setOpenRedirectEditor] = useState(false)
    const steps = state.steps
    const pageStep = state.pageStep
    const emptyPage = {
        id: '',
        sections: [],
    }

    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal)
    const router = useRouter()
    const companyId = router?.query?.companyID
    const authToken = token || router.query.authToken

    useEffect(() => {
        //setting url
        if (window && window.location && window.location.port) {
            setUrl(`${window.location.protocol}//${window.location.hostname}:${window.location.port}`)
        } else {
            setUrl(`${window.location.protocol}//${window.location.hostname}`)
        }
        if (router?.query?.emailOnly) {
            updateState('pageBuilder', 'previousStep', 0)
            updateState('pageBuilder', 'pageStep', 1)
        }
    }, [])

    useEffect(() => {
        setRequestSend(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            params: {
                query: `code:HCMASSET`,
                hotelrefno: Number(companyId),
            },
        }).then(async (res) => {
            setRequestSend(false)
            if (res.data && res.data.data && res.data.data.length > 0) {
                const assetsData = JSON.parse(Buffer.from(res.data.data[0].filedata, 'base64').toString('utf-8'))
                if (!assetsData?.colors?.slider) {
                    assetsData.colors['slider'] = {
                        main: '',
                        light: '',
                        dark: '',
                        contrastText: '',
                    }
                }
                if (!assetsData?.icons) {
                    assetsData['icons'] = {
                        phone: '',
                        email: '',
                        facebook: '',
                        twitter: '',
                        instagram: '',
                        linkedin: '',
                    }
                }
                updateState('pageBuilder', 'assets', assetsData)
                const assets = await handleAssetLogoUrlChange(
                    JSON.parse(Buffer.from(res.data.data[0].filedata, 'base64').toString('utf-8'))
                )
                const images = assets?.images;
                const icons = assets?.icons;
                if (Object.keys(images).length > 0) {
                    updateState('pageBuilder', 'logoUrl', images?.logo);
                    updateState('pageBuilder', 'altLogoUrl', images?.altLogo);
                    updateState('pageBuilder', 'logoBanner', images?.logoBanner);
                    updateState('pageBuilder', 'faviconUrl', images?.favIcon);
                    updateState('pageBuilder', 'backgroundUrl', images?.background);
                    updateState('pageBuilder', 'poweredByUrl', images?.poweredBy);
                    updateState('pageBuilder', 'thumbnailUrl', images?.thumbnail);
                }
                if (icons && Object.keys(icons).length > 0) {
                    updateState('pageBuilder', 'phoneIconUrl', icons?.phone);
                    updateState('pageBuilder', 'emailIconUrl', icons?.email);
                    updateState('pageBuilder', 'facebookIconUrl', icons?.facebook);
                    updateState('pageBuilder', 'twitterIconUrl', icons?.twitter);
                    updateState('pageBuilder', 'instagramIconUrl', icons?.instagram);
                    updateState('pageBuilder', 'linkedinIconUrl', icons?.linkedin);
                }
            }
        })

        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.INFO + '/' + OREST_ENDPOINT.LOGIN,
            token: authToken,
            method: 'get',
        }).then((res) => {
            if (res.status === 200 && res.data && res.data.data && res.data.data.hotelmid) {
                updateState('pageBuilder', 'hotelMid', res.data.data.hotelmid)
            } else {
                const retErr = isErrorMsg(res)
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
        //for default language
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'sett/lang/local',
            token: authToken,
            method: 'get',
        }).then((res) => {
            if (res.status === 200 && res.data && res.data.success && res.data.data) {
                if (res?.data?.data?.code && res?.data?.data?.id) {
                    updateState('pageBuilder', 'defaultLang', res.data.data?.code?.toLowerCase())
                    updateState('pageBuilder', 'defaultLangId', res.data.data?.id)
                } else
                    toast.error('Default language is not set yet!', {
                        position: toast.POSITION.TOP_RIGHT,
                    })
            } else {
                const retErr = isErrorMsg(res)
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
        //request for logininfo to get super hotel
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'info/login',
            token: authToken,
            method: 'get',
        }).then((res) => {
            if (res?.status === 200 && res?.data?.data) {
                updateState('pageBuilder', 'isSuperHotel', res.data.data?.issuperhotel)
                updateState('pageBuilder', 'isSuperUser', res.data.data?.issuperuser)
            } else {
                const retErr = isErrorMsg(res)
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }, [])

    useEffect(() => {
        // getting languages from service
        if (state.defaultLang) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RALANG,
                token: authToken,
                params: {
                    query:'gcode:notnull,gcode!"",isactive:true',
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                if (res?.status === 200 && res?.data?.data?.length > 0) {
                    res.data.data.map((lang) => {
                        pushToState(
                            'pageBuilder',
                            ['languages'],
                            [
                                {
                                    id: lang?.id,
                                    code: lang?.code?.toLowerCase(),
                                    description: lang?.description,
                                },
                            ]
                        )
                        if (lang.code.toLowerCase() === state.defaultLang) {
                            updateState('pageBuilder', 'langId', lang.id)
                            updateState('pageBuilder', 'langCode', lang.code.toLowerCase())
                        }
                    })
                }
            })
        }
    }, [state.defaultLang])

    useEffect(() => {
        if (pageStep === 0) {
            if (router?.query?.sliderOnly) {
                updateState('pageBuilder', 'type', 'generic-slider')
            } else if (router?.query?.emailOnly) {
                updateState('pageBuilder', 'type', 'emailOnly')
                setPageBuilderType('email')
            } else if (router?.query?.assetOnly) {
                updateState('pageBuilder', 'type', 'assetOnly')
                setPageBuilderType('assetOnly')
            } else if (router?.query?.faqOnly) {
                updateState('pageBuilder', 'type', 'faqOnly')
                setPageBuilderType('faqOnly')
            } else {
                updateState('pageBuilder', 'type', 'webPage')
                setPageBuilderType('webPage')
            }
        }
    }, [pageStep])

    useEffect(() => {
        setIsLoaded(true)
        resetSteps(pageBuilderType)
        setSteps(pageBuilderType)
    }, [pageBuilderType])

    const resetSteps = () => {
        const steps = [2, 1, 0]
        steps.map((index) => deleteFromState('pageBuilder', ['steps'], [index, 1]))
    }

    const setSteps = (pageBuilderType) => {
        switch (pageBuilderType) {
            case 'webPage':
                const webPageSteps = ['Home', 'Page', 'Preview']
                webPageSteps.map((element) => {
                    pushToState('pageBuilder', ['steps'], [element])
                })
                break
            case 'email':
                const emailSteps = ['Home', 'Design', 'Preview']
                emailSteps.map((element) => {
                    pushToState('pageBuilder', ['steps'], [element])
                })
                break
            case 'website':
                const websiteSteps = ['Home', 'Design', 'Preview']
                websiteSteps.map((element) => {
                    pushToState('pageBuilder', ['steps'], [element])
                })
                break
            case 'assets':
                const assetSteps = ['Home', 'Style', 'Assets']
                assetSteps.map((element) => {
                    pushToState('pageBuilder', ['steps'], [element])
                })
                break
            case 'assetOnly':
                const assetOnlySteps = ['Style', 'Assets']
                assetOnlySteps.map((element) => {
                    pushToState('pageBuilder', ['steps'], [element])
                })
                break
            case 'faq':
                const faqSteps = ['Home', "FAQ's", 'Preview']
                faqSteps.map((element) => {
                    pushToState('pageBuilder', ['steps'], [element])
                })
                break
            case 'faqOnly':
                const faqOnlySteps = ['Design', 'Preview']
                faqOnlySteps.map((element) => {
                    pushToState('pageBuilder', ['steps'], [element])
                })
                break
            default:
                return
        }
    }

    const handleNext = () => {
        if (pageStep === steps.length - 1) {
            handleSave()
        } else {
            updateState('pageBuilder', 'previousStep', pageStep)
            updateState('pageBuilder', 'pageStep', pageStep + 1)
        }
    }

    const handleBack = () => {
        updateState('pageBuilder', 'previousStep', pageStep)
        updateState('pageBuilder', 'pageStep', pageStep - 1)
    }

    const handleNextDisable = () => {
        switch (state.type) {
            case 'assets':
                if (pageStep === 1) {
                    const colors = hasColors()
                    if (colors) return false
                    else return true
                } else if (pageStep === 2) {
                    const assets = hasAssets()
                    if (assets) return false
                    else return true
                }
            case 'webPage':
                if (pageStep === 0) {
                    if (isWebPageSelected) {
                        return false
                    } else {
                        return true
                    }
                } else if (pageStep === 1) {
                    if (state.page.sections.length === 0) {
                        return true
                    } else {
                        return false
                    }
                } else {
                    return false
                }
            case 'email':
                if (pageStep === 0) {
                    if (isEmailSelected) return false
                    else return true
                }
                if (pageStep === 1) {
                    if (state.email.body.length === 0) return true
                    else return false
                }
                return false
            case 'emailOnly':
                if (pageStep === 1) {
                    if (state.email.body.length === 0) return true
                    else return false
                }
                return false
            case 'website':
                if (pageStep === 0) {
                    if (isWebsiteSelected) return false
                    else return true
                }
                if (pageStep === 1) {
                    if (state.footerOnly) {
                        if (Object.keys(state.website.footer).length === 0) return true
                        else return false
                    } else {
                        if (
                            Object.keys(state.website.header).length === 0 ||
                            Object.keys(state.website.footer).length === 0 ||
                            state.website.pages.length === 0
                        )
                            return true
                        else return false
                    }
                }
                return false
            case 'faqOnly':
                if (state.faq.length > 0) return false
                else return true
            default:
                return
        }
    }

    const hasColors = () => {
        for (const color in state?.assets?.colors) {
            for (const type in state?.assets?.colors[color]) {
                if (!state?.assets?.colors[color][type]) return false
            }
        }
        return true
    }

    const hasAssets = () => {
        if (!state?.assets?.meta?.title || !state?.assets?.images?.logo) {
            return false
        }
        return true
    }

    const setPageBuilderType_ = (value) => {
        setPageBuilderType(value)
        updateState('pageBuilder', 'type', value)
        updateState('pageBuilder', 'code', '')
        if (value === 'webPage') {
            updateState('pageBuilder', 'page', emptyPage)
        } else if (value === 'website') {
            const website = {
                header: {},
                footer: {},
                pages: [],
            }
            updateState('pageBuilder', 'website', website)
        } else if (value === 'email') {
            const emptyEmail = {
                header: {},
                footer: {},
                body: [],
            }
            updateState('pageBuilder', 'email', emptyEmail)
        }
    }

    const handleNew = () => {
        updateState('pageBuilder', 'langCode', state.defaultLang)
        updateState('pageBuilder', 'langsFile', {})
        updateState('pageBuilder', 'isTemplate', false)
        updateState('pageBuilder', 'previousStep', pageStep)
        updateState('pageBuilder', 'pageStep', pageStep + 1)
        if (pageBuilderType === 'webPage') {
            updateState('pageBuilder', 'code', 'NEW PAGE')
            updateState('pageBuilder', 'page', emptyPage)
            setWebPageSelected(false)
        }
        if (pageBuilderType === 'website') {
            const website = {
                header: {},
                footer: {},
                pages: [],
            }
            updateState('pageBuilder', 'code', 'NEW WEBSITE')
            updateState('pageBuilder', 'footerOnly', false)
            updateState('pageBuilder', 'website', website)
            setWebsiteSelected(false)
        }
        if (pageBuilderType === 'email') {
            const email = {
                header: {},
                footer: {},
                body: [],
            }
            updateState('pageBuilder', 'email', email)
            updateState('pageBuilder', 'code', 'NEW EMAIL')
            setEmailSelected(false)
        }
    }

    const resetFinal = () => {
        setRenderFinal('')
    }

    const handleSave = () => {
        if (state.type === 'assets' || state.type === 'assetOnly') {
            handleSaveAssets()
        } else if (state.type === 'webPage') {
            setRenderFinal(<Final isWebPageSelected={isWebPageSelected} dialogTitle={'Save'} resetFinal={resetFinal} />)
        } else if (state.type === 'website') {
            setRenderFinal(
                <WebsiteFinal isWebsiteSelected={isWebsiteSelected} dialogTitle={'Save'} resetFinal={resetFinal} />
            )
        } else if (state.type === 'email') {
            setRenderFinal(
                <EmailSave
                    dialogTitle={'Save'}
                    resetFinal={resetFinal}
                    isEmailSelected={isEmailSelected}
                    onSelectEmail={onSelectEmail}
                />
            )
        } else if (state.type === 'emailOnly') {
            if (isEmailSelected) {
                setRenderFinal(
                    <EmailSave
                        dialogTitle={'Save'}
                        resetFinal={resetFinal}
                        isEmailSelected={!isEmailSelected}
                        onSelectEmail={onSelectEmail}
                    />
                )
            } else {
                if (router?.query?.masterid) {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RAFILE,
                        token: authToken,
                        params: {
                            hotelrefno: Number(companyId),
                            query: `masterid::${router?.query?.masterid},filetype::PB-EMAIL`,
                        },
                    }).then((res) => {
                        if (res?.status === 200 && res?.data) {
                            if (res?.data?.data?.length > 0) {
                                setRenderFinal(
                                    <EmailSave
                                        dialogTitle={'Save'}
                                        resetFinal={resetFinal}
                                        isEmailSelected={true}
                                        onSelectEmail={onSelectEmail}
                                    />
                                )
                            } else {
                                setRenderFinal(
                                    <EmailSave
                                        dialogTitle={'Save'}
                                        resetFinal={resetFinal}
                                        isEmailSelected={false}
                                        onSelectEmail={onSelectEmail}
                                    />
                                )
                            }
                        } else {
                            const retErr = isErrorMsg(res)
                            toast.error(retErr.errorMsg, {
                                position: toast.POSITION.TOP_RIGHT,
                            })
                        }
                    })
                }
            }
        } else if (state.type === 'faqOnly') {
            setRenderFinal(<FAQSave resetFinal={resetFinal} />)
        }
    }

    const handleSaveAssets = () => {
        setRequestSend(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            params: {
                query: `code:HCMASSET`,
                hotelrefno: Number(companyId),
            },
        }).then((res1) => {
            if (res1.data && res1.data.data && res1.data.data.length === 0) {
                Insert({
                    // insert header into rafile
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: authToken,
                    data: {
                        code: `HCMASSET`,
                        masterid: GENERAL_SETTINGS.HOTELMID,
                        filename: 'HCMASSET',
                        filetype: 'HCMASSET',
                        filedata: Buffer.from(JSON.stringify(state?.assets)).toString('base64'),
                        isorsactive: true,
                        hotelrefno: Number(companyId),
                    },
                }).then(async (res2) => {
                    setRequestSend(false)
                    if (res2.status === 200 && res2.data.data) {
                        const redisStdJson = state.redisStdJson
                        redisStdJson.assets = await handleAssetLogoUrlChange(
                            JSON.parse(Buffer.from(res2.data.data.filedata, 'base64').toString('utf-8'))
                        )
                        toast.success(SAVED_SUCCESS, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                        updateState('pageBuilder', 'previousStep', 0)
                        updateState('pageBuilder', 'pageStep', 0)
                    }
                })
            } else {
                Patch({
                    // update header into rafile
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: authToken,
                    gid: res1.data.data[0].gid,
                    params: {
                        hotelrefno: Number(companyId),
                    },
                    data: {
                        filedata: Buffer.from(JSON.stringify(state?.assets)).toString('base64'),
                        isorsactive: true,
                        hotelrefno: Number(companyId),
                    },
                }).then(async (res2) => {
                    setRequestSend(false)
                    if (res2.status === 200 && res2.data.data) {
                        const redisStdJson = state.redisStdJson
                        redisStdJson.assets = await handleAssetLogoUrlChange(
                            JSON.parse(Buffer.from(res2.data.data.filedata, 'base64').toString('utf-8'))
                        )
                        toast.success(SAVED_SUCCESS, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                        updateState('pageBuilder', 'previousStep', 0)
                        updateState('pageBuilder', 'pageStep', 0)
                    }
                })
            }
        })
    }

    const handleAssetLogoUrlChange = async (assets) => {
        setRequestSend(true)
        const images = assets?.images;
        const icons = assets?.icons;
        for (const logo in images) {
            if (images[logo]) {
                const REQUEST_OPTIONS = {
                    url: GENERAL_SETTINGS.OREST_URL + '/rafile/view/list',
                    method: 'get',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        query: 'gid::' + images[logo],
                        chkselfish: false,
                        hotelrefno: Number(companyId),
                    },
                }
                const image = await getImageData(REQUEST_OPTIONS)
                let url = image?.url?.replace('/var/otello', '').replace('/public', '')
                assets.images[logo] = url
            }
        }
        for (const icon in icons) {
            if (icons[icon]) {
                const REQUEST_OPTIONS = {
                    url: GENERAL_SETTINGS.OREST_URL + '/rafile/view/list',
                    method: 'get',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        query: 'gid::' + icons[icon],
                        chkselfish: false,
                        hotelrefno: Number(companyId),
                    },
                }
                const image = await getImageData(REQUEST_OPTIONS)
                let url = image?.url?.replace('/var/otello', '').replace('/public', '')
                assets.icons[icon] = url
            }
        }
        setRequestSend(false)
        return assets
    }

    const getImageData = (option) => {
        return new Promise(async (resv) => {
            return await axios(option)
                .then(async (response) => {
                    if (response.status === 200) {
                        if (response?.data?.data?.length > 0) {
                            resv(response.data.data[0])
                        } else {
                            resv(null)
                        }
                    } else {
                        const retErr = isErrorMsg(response)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                        resv(null)
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const onSelectPage = (isSelected) => {
        setWebPageSelected(isSelected)
    }

    const handleAssets = () => {
        const website = {
            header: {},
            footer: {},
            pages: [],
        }
        setPageBuilderType_('assets')
        updateState('pageBuilder', 'code', '')
        updateState('pageBuilder', 'page', emptyPage)
        updateState('pageBuilder', 'website', website)
        updateState('pageBuilder', 'previousStep', pageStep)
        updateState('pageBuilder', 'pageStep', pageStep + 1)
    }

    const onSelectWebsite = (isSelected) => {
        setWebsiteSelected(isSelected)
    }

    const onSelectEmail = (isSelected) => {
        setEmailSelected(isSelected)
    }

    const handleClearCache = () => {
        // clear cache from redis
        setRequestSend(true)
        axios.get(url + '/?clearall=true').then((res) => {
            setRequestSend(false)
            if (res.status === 200) {
                toast.success('Cache cleared', {
                    position: toast.POSITION.TOP_RIGHT,
                })
            } else {
                toast.error('The is no data available', {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    if (!isLoaded) {
        return <LoadingSpinner />
    }

    return (
        <React.Fragment>
            <MuiThemeProvider theme={theme}>
                <Typography component={'div'}>
                    {router?.query?.sliderOnly && <GenericSlider />}
                    {steps && steps.length > 0 && (
                        <Stepper activeStep={pageStep} alternativeLabel connector={<ColorlibConnector />}>
                            {steps.map((label, index) => {
                                return (
                                    <Step key={`step-${index}`}>
                                        <StepLabel
                                            color="secondary"
                                            StepIconComponent={() =>
                                                getStepsIcons(
                                                    index,
                                                    pageStep === index,
                                                    pageStep > index,
                                                    pageBuilderType
                                                )
                                            }
                                        >
                                            {label}
                                        </StepLabel>
                                    </Step>
                                )
                            })}
                        </Stepper>
                    )}
                    {pageStep === 0 &&
                        !router?.query?.sliderOnly &&
                        !router?.query?.assetOnly &&
                        !router?.query?.faqOnly && (
                            <Container>
                                <Grid container direction="row" justify={'flex-start'}>
                                    <Grid item xs={4}>
                                        <Grid container justify={'flex-start'}>
                                            <Grid item xs={12}>
                                                <FormControl
                                                    variant="outlined"
                                                    style={{ marginTop: 16 }}
                                                    disabled={router?.query?.emailOnly}
                                                    size={'small'}
                                                >
                                                    <Select
                                                        value={pageBuilderType}
                                                        onChange={(e) => setPageBuilderType_(e.target.value)}
                                                        label="Select PB Options"
                                                    >
                                                        {PB_OPTIONS.map((option, index) => {
                                                            return (
                                                                <MenuItem value={option.code} key={index}>
                                                                    {' '}
                                                                    {option.description}{' '}
                                                                </MenuItem>
                                                            )
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={8}>
                                        {!router?.query?.emailOnly && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="primary"
                                                aria-label="add"
                                                onClick={handleNew}
                                                className={clsx({
                                                    [classes.actionButton]: true,
                                                    [classes.newButton]: true,
                                                })}
                                            >
                                                +NEW
                                            </Button>
                                        )}
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="primary"
                                            aria-label="add"
                                            className={classes.assetButton}
                                            onClick={handleAssets}
                                        >
                                            ASSETS
                                        </Button>
                                        {state.type === 'webPage' && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="primary"
                                                aria-label="add"
                                                onClick={()=> setOpenRedirectEditor(true)}
                                                className={classes.assetButton}
                                            >
                                                REDIRECTS
                                            </Button>
                                        )}
                                        {!router?.query?.emailOnly && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="primary"
                                                aria-label="add"
                                                onClick={handleClearCache}
                                                className={classes.assetButton}
                                            >
                                                CLEAR CACHE
                                            </Button>
                                        )}
                                    </Grid>
                                </Grid>
                            </Container>
                        )}
                    {isRequestSend && !router?.query?.sliderOnly ? (
                        <LoadingSpinner style={{ color: COLORS.secondary }} />
                    ) : (
                        <>
                            {state.type === 'assets' && (
                                <div>
                                    {pageStep === 0 && (
                                        <Home
                                            onSelectPage={onSelectPage}
                                            onSelectWebsite={onSelectWebsite}
                                            onSelectEmail={onSelectEmail}
                                        />
                                    )}
                                    {pageStep === 1 && <Style />}
                                    {pageStep === 2 && <Asset />}
                                </div>
                            )}
                            {state.type === 'webPage' && (
                                <div>
                                    {pageStep === 0 && <Home onSelectPage={onSelectPage} />}
                                    {pageStep === 1 && <Page />}
                                    {pageStep === 2 && <Preview />}
                                </div>
                            )}
                            {state.type === 'website' && (
                                <div>
                                    {pageStep === 0 && <Home onSelectWebsite={onSelectWebsite} />}
                                    {pageStep === 1 && <WebsitePage />}
                                    {pageStep === 2 && <WebsitePreview />}
                                </div>
                            )}
                            {(state.type === 'email' || state.type === 'emailOnly') && (
                                <div>
                                    {pageStep === 0 && <Home onSelectEmail={onSelectEmail} />}
                                    {pageStep === 1 && <EmailDesign />}
                                    {pageStep === 2 && <EmailPreview />}
                                </div>
                            )}
                            {state.type === 'assetOnly' && (
                                <div>
                                    {pageStep === 0 && <Style />}
                                    {pageStep === 1 && <Asset />}
                                </div>
                            )}
                            {state.type === 'faqOnly' && (
                                <div>
                                    {pageStep === 0 && <FAQDesign />}
                                    {pageStep === 1 && <FAQPreview />}
                                </div>
                            )}
                            {!router?.query?.sliderOnly && (
                                <Grid container direction="row" justify="flex-end" alignItems="flex-end">
                                    <div className={classes.actionButtons}>
                                        {pageStep !== 0 && (
                                            <Button
                                                onClick={handleBack}
                                                variant="contained"
                                                size="small"
                                                aria-label="add"
                                                className={classes.backButton}
                                                style={{ marginRight: 8 }}
                                            >
                                                BACK
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handleNext}
                                            variant="contained"
                                            size="small"
                                            color="primary"
                                            aria-label="add"
                                            className={classes.actionButton}
                                            style={{ marginRight: 24 }}
                                            disabled={handleNextDisable()}
                                        >
                                            {pageStep === steps.length - 1 ? 'SAVE' : 'NEXT'}
                                        </Button>
                                        {renderFinal}
                                    </div>
                                </Grid>
                            )}
                        </>
                    )}
                </Typography>
                <RedirectsEditor open={openRedirectEditor} onClose={()=> setOpenRedirectEditor(false)}/>
            </MuiThemeProvider>
            <ToastContainer autoClose={8000} />
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(PageBuilderStepper)
