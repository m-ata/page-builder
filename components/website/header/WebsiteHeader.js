import React, { useContext, useState, useEffect, memo } from 'react'
import WebCmsGlobal from 'components/webcms-global'
import PhoneIcon from '@material-ui/icons/Phone'
import EmailIcon from '@material-ui/icons/Email'
import RoomIcon from '@material-ui/icons/Room'
import FacebookIcon from '@material-ui/icons/Facebook'
import InstagramIcon from '@material-ui/icons/Instagram'
import GitHubIcon from '@material-ui/icons/GitHub'
import TwitterIcon from '@material-ui/icons/Twitter'
import LinkedInIcon from '@material-ui/icons/LinkedIn'
import MenuIcon from '@material-ui/icons/Menu'
import PublicIcon from '@material-ui/icons/Public';
import CancelIcon from '@material-ui/icons/Cancel'
import {
    Container,
    Grid,
    Button,
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    Typography,
    Divider,
    FormControl,
    Select,
    MenuItem,
} from '@material-ui/core'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector, useDispatch } from 'react-redux'
import { updateState } from '../../../state/actions'
import { useRouter } from 'next/router'


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        backgroundColor: (props) => props?.assets?.colors?.primary?.main,
        zIndex: theme.zIndex.drawer + 1,
    },
    horizontalLi: {
        display: 'inline',
    },
    externalLink: {
        padding: '28px 20px 28px 0',
        letterSpacing: 1,
        color: (props) => props?.assets?.colors?.primary?.light,
        '&:hover': {
            color: (props) => props?.assets?.colors?.primary?.dark,
        },
        fontSize: 15,
        fontWeight: 'bold',
        cursor: 'pointer',
        fontFamily: (props) => props?.assets?.font?.name || 'Roboto',
    },
    internalLink: {
        textAlign: 'center',
        letterSpacing: 1,
        padding: '28px 20px 28px 0',
        color: (props) => props?.assets?.colors?.primary?.light,
        '&:hover': {
            color: (props) => props?.assets?.colors?.primary?.dark,
            borderRadius: 5,
        },
        fontSize: 16,
        cursor: 'pointer',
        fontWeight: 'bold',
        fontFamily: (props) => props?.assets?.font?.name || 'Roboto',
        '@media (min-width: 1278px) and (max-width: 1400px)': {
            fontSize: 14,
        },
        '@media (min-width: 1024px) and (max-width: 1279px)': {
            fontSize: 12,
        },
    },
    button: {
        borderRadius: 5,
        color: (props) => props?.assets?.colors?.button?.contrastText,
        backgroundColor: (props) => props?.assets?.colors?.button?.main,
        '&:hover': {
            backgroundColor: (props) => props?.assets?.colors?.button?.dark,
        },
        letterSpacing: 1,
        fontFamily: (props) => props?.assets?.font?.name || 'Roboto',
    },
    phone: {
        color: (props) => props?.assets?.colors?.primary?.light,
        '&:hover': {
            color: (props) => props?.assets?.colors?.primary?.dark,
            textDecoration: 'none',
        },
        cursor: 'pointer',
        marginRight: 8,
        fontSize: 16,
        '@media (min-width: 1278px) and (max-width: 1400px)': {
            fontSize: 14,
        },
        '@media (min-width: 1024px) and (max-width: 1279px)': {
            fontSize: 12,
        },
        fontFamily: (props) => props?.assets?.font?.name || 'Roboto',
    },
    text: {
        color: (props) => props?.assets?.colors?.primary?.contrastText,
        marginLeft: 8,
    },
    imagePreview: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        width: 140,
        cursor: 'pointer',
        minWidth: '100%',
        height: 'auto',
        ['@media (min-width: 1278px) and (max-width: 1400px)']: {
            width: 120,
        },
        '@media (min-width: 1024px) and (max-width: 1279px)': {
            width: 100,
        },
    },
    dropDownGrid: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    closeMenuButton: {
        marginRight: 'auto',
        marginLeft: 0,
        color: (props) => props?.assets?.colors?.button?.main,
    },
    icon: {
        height: 35,
        width: 35,
        marginRight: 8,
    },
    whatsappButton: {
        display: 'block',
        bottom: 20,
        left: 40,
        position: 'fixed',
        zIndex: 999999,
        height: 60,
        width: 60,
    },
    dropDownStyle: {
        color: (props) => props?.assets?.colors?.primary?.light || 'black',
        border: (props) =>  `1px solid ${props?.assets?.colors?.primary?.light || 'black'}`,
        borderRadius: 19,
        opacity: 1,
        "& .MuiSelect-icon": {
            color: (props) => props?.assets?.colors?.primary?.light
        },
        display: 'flex',
        flexDirection: 'row-reverse'
    }
}))

const mobileUseStyle = makeStyles(() => ({
    button: {
        borderRadius: 5,
        color: (props) => props?.assets?.colors?.button?.contrastText,
        backgroundColor: (props) => props?.assets?.colors?.button?.main,
        '&:hover': {
            backgroundColor: (props) => props?.assets?.colors?.button?.dark,
        },
        letterSpacing: 1,
        fontFamily: (props) => props?.assets?.font?.name || 'Roboto',
    },
    listRoot: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    link: {
        color: (props) => props?.assets?.colors?.primary?.light,
        '&:hover': {
            color: (props) => props?.assets?.colors?.primary?.dark,
        },
        fontFamily: (props) => props?.assets?.font?.name || 'Roboto',
    },
    imagePreview: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        width: 70,
        height: 25,
        marginLeft: 16,
    },
    logoRoot: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    text: {
        color: (props) => props?.assets?.colors?.primary?.contrastText,
    },
    paper: {
        background: (props) => props?.assets?.colors?.primary?.main,
    },
    mrgin4p: {
        margin: 4,
    },
    icon: {
        display: 'flex',
        justifyContent: 'center',
        margin: 4
    }
}))

const WebSiteHeader = (props) => {
    const { assets } = props

    const [header, setHeader] = useState('')
    const dispatch = useDispatch()
    const website = useSelector((state) => state?.formReducer?.website)
    const [mobileStates, setMobileStates] = useState({
        mobileView: false,
        drawerOpen: false,
        menuItems: [],
        otherLangMenuItems: [],
    })
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const textColor = assets?.colors?.primary?.contrastText
    const { mobileView, drawerOpen, menuItems, otherLangMenuItems } = mobileStates
    const router = useRouter()
    const { code } = router.query
    const [appBarOpacity, setAppBarOpacity] = useState(1)

    //css classes
    const classes = useStyles(props)
    const mobileClasses = mobileUseStyle(props)

    const compare = (a, b) => {
        // sort header items with alignment
        const bandA = a.alignment
        const bandB = b.alignment

        let comparison = 0
        if (bandA > bandB) {
            comparison = 1
        } else if (bandA < bandB) {
            comparison = -1
        }
        return comparison
    }

    useEffect(() => {
        const handleScroll = () => {
            const show = window.scrollY > 210
            if (show) {
                setAppBarOpacity(0.8)
            } else {
                setAppBarOpacity(1)
            }
        }
        document.addEventListener('scroll', handleScroll)
        return () => {
            document.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => {
        const setResponsiveness = () => {
            return window.innerWidth < 767
                ? setMobileStates((prevState) => ({ ...prevState, mobileView: true }))
                : setMobileStates((prevState) => ({ ...prevState, mobileView: false }))
        }
        setResponsiveness()
        window.addEventListener('resize', () => setResponsiveness())
    }, [])

    useEffect(() => {
        website?.defaultHeader?.items?.length > 0 && website?.defaultHeader?.items.sort(compare)
        let updatedMenuItems = []
        website?.defaultHeader?.items?.length > 0 &&
            website?.defaultHeader?.items.map((row) => {
                row?.items?.length > 0 &&
                    row.items.map((col) => {
                        col?.value?.length > 0 &&
                            col.value.map((val) => {
                                updatedMenuItems.push({
                                    type: val?.type,
                                    value: val?.value,
                                })
                            })
                    })
            })
        setMobileStates((prevState) => ({ ...prevState, menuItems: updatedMenuItems }))
    }, [website?.defaultHeader?.items])

    useEffect(() => {
        let otherLangMenuItems = []
        website?.otherLangHeader[website?.selectedLangCode]?.items?.length > 0 &&
            website?.otherLangHeader[website?.selectedLangCode]?.items.map((row) => {
                row?.items?.length > 0 &&
                    row.items.map((col) => {
                        col?.value?.length > 0 &&
                            col.value.map((val) => {
                                otherLangMenuItems.push({
                                    value: val?.value,
                                })
                            })
                    })
            })
        setMobileStates((prevState) => ({ ...prevState, otherLangMenuItems: otherLangMenuItems }))
    }, [website?.otherLangHeader, website?.selectedLangCode])

    const handleInternalLink = (gid, title) => {
        const { defaultPages } = { ...website }
        const selectedPage = defaultPages.find((x) => x?.id === gid)
        if (selectedPage?.currentCode) {
            router.push(`/${selectedPage?.currentCode?.toLowerCase()}`)
        } else {
            if (typeof selectedPage?.code === 'string') {
                router.push(`/${selectedPage?.code?.toLowerCase()}`)
            } else {
                router.push(`/${selectedPage?.code[0]?.toLowerCase()}`)
            }
        }
        if (title) {
            dispatch(updateState('website', 'selectedHeaderLink', title))
        } else {
            dispatch(updateState('website', 'selectedHeaderLink', ''))
        }
    }

    useEffect(() => {
        setHeader(
            <Container>
                {website?.selectedLangCode !== website?.defaultLangCode &&
                    website?.otherLangHeader &&
                    website?.otherLangHeader[website?.selectedLangCode]?.items?.length > 0 &&
                    website.otherLangHeader[website?.selectedLangCode].items.map((row, rowIndex) => {
                        return (
                            <Grid container={true} key={rowIndex} style={{ marginTop: rowIndex === 0 ? 0 : -32 }}>
                                {row?.items?.length > 0 &&
                                    row.items.map((col, colIndex) => {
                                        let align = ''
                                        if (
                                            website?.defaultHeader?.items[rowIndex]?.items[colIndex]?.alignment ===
                                            'left'
                                        ) {
                                            align = 'flex-start'
                                        } else if (
                                            website?.defaultHeader?.items[rowIndex]?.items[colIndex]?.alignment ===
                                            'right'
                                        ) {
                                            align = 'flex-end'
                                        } else {
                                            align = 'center'
                                        }
                                        return (
                                            <Grid
                                                key={colIndex}
                                                item={true}
                                                style={{
                                                    width:
                                                        website?.defaultHeader?.items[rowIndex]?.items[colIndex]
                                                            ?.width + '%',
                                                    display: 'inline-flex',
                                                    justifyContent: align,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <ul style={{ marginTop: 16, padding: 0 }}>
                                                    {col.value.length > 0 &&
                                                        col.value.map((val, i) => {
                                                            return (
                                                                <li className={classes.horizontalLi} key={i}>
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'logo' && (
                                                                            <Link href={'/'}>
                                                                                <img
                                                                                    src={
                                                                                        GENERAL_SETTINGS.STATIC_URL +
                                                                                        val.value
                                                                                    }
                                                                                    alt={'logo'}
                                                                                    className={classes.imagePreview}
                                                                                    onClick={() => {
                                                                                        dispatch(
                                                                                            updateState(
                                                                                                'website',
                                                                                                'selectedHeaderLink',
                                                                                                ''
                                                                                            )
                                                                                        )
                                                                                    }}
                                                                                />
                                                                            </Link>
                                                                        )}
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'external-link' && (
                                                                            <a
                                                                                className={classes.externalLink}
                                                                                target="_blank"
                                                                                href={website.defaultHeader.items[
                                                                                        rowIndex
                                                                                    ].items[colIndex].value[i]?.value
                                                                                        ?.value
                                                                                }
                                                                            >
                                                                                {val?.value}
                                                                            </a>
                                                                        )}
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'button' && (
                                                                            <Button
                                                                                variant="contained"
                                                                                size="small"
                                                                                aria-label="add"
                                                                                className={classes.button}
                                                                                onClick={() => {
                                                                                    const shortLangCode = website?.languages.find((langItem) => langItem.code.toLowerCase() === website?.selectedLangCode?.toLowerCase()).shortcode
                                                                                    window.open(`${website.defaultHeader.items[
                                                                                            rowIndex
                                                                                            ].items[colIndex].value[i]
                                                                                            ?.value?.value}?lang=${shortLangCode}`,
                                                                                        '_blank'
                                                                                    )
                                                                                }
                                                                                }
                                                                            >
                                                                                {val.value}
                                                                            </Button>
                                                                        )}
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'internal-link' && (
                                                                            <a
                                                                                onClick={() =>
                                                                                    handleInternalLink(
                                                                                        website.defaultHeader.items[
                                                                                            rowIndex
                                                                                        ].items[colIndex].value[i]
                                                                                            ?.value?.value,
                                                                                        val?.value
                                                                                    )
                                                                                }
                                                                                className={classes.internalLink}
                                                                            >
                                                                                {' '}
                                                                                {val?.value}{' '}
                                                                            </a>
                                                                        )}
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'phone' && (
                                                                            <span className={classes.text}>
                                                                                <PhoneIcon /> {val?.value}
                                                                            </span>
                                                                        )}
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'email' && (
                                                                            <span className={classes.text}>
                                                                                <EmailIcon /> {val?.value}
                                                                            </span>
                                                                        )}
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'address' && (
                                                                            <a
                                                                                className={classes.externalLink}
                                                                                href={val?.value}
                                                                            >
                                                                                <RoomIcon /> {val?.value}
                                                                            </a>
                                                                        )}
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'social-link' &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.value?.value?.includes(
                                                                            'facebook.com'
                                                                        ) && (
                                                                            <a
                                                                                style={{ color: textColor }}
                                                                                title="facebook"
                                                                                target="_blank"
                                                                                href={
                                                                                    website.defaultHeader.items[
                                                                                        rowIndex
                                                                                    ].items[colIndex].value[i]?.value
                                                                                        ?.value
                                                                                }
                                                                            >
                                                                                <FacebookIcon />{' '}
                                                                                {
                                                                                    website.defaultHeader.items[
                                                                                        rowIndex
                                                                                    ].items[colIndex].value[i]?.value
                                                                                        ?.title
                                                                                }
                                                                            </a>
                                                                        )}
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'social-link' &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.value?.value?.includes(
                                                                            'instagram.com'
                                                                        ) && (
                                                                            <a
                                                                                style={{ color: textColor }}
                                                                                title="facebook"
                                                                                target="_blank"
                                                                                href={
                                                                                    website.defaultHeader.items[
                                                                                        rowIndex
                                                                                    ].items[colIndex].value[i]?.value
                                                                                        ?.value
                                                                                }
                                                                            >
                                                                                <InstagramIcon />{' '}
                                                                                {
                                                                                    website.defaultHeader.items[
                                                                                        rowIndex
                                                                                    ].items[colIndex].value[i]?.value
                                                                                        ?.title
                                                                                }
                                                                            </a>
                                                                        )}
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'social-link' &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.value?.value?.includes(
                                                                            'github.com'
                                                                        ) && (
                                                                            <a
                                                                                style={{ color: textColor }}
                                                                                title="facebook"
                                                                                target="_blank"
                                                                                href={
                                                                                    website.defaultHeader.items[
                                                                                        rowIndex
                                                                                    ].items[colIndex].value[i]?.value
                                                                                        ?.value
                                                                                }
                                                                            >
                                                                                <GitHubIcon />{' '}
                                                                                {
                                                                                    website.defaultHeader.items[
                                                                                        rowIndex
                                                                                    ].items[colIndex].value[i]?.value
                                                                                        ?.title
                                                                                }
                                                                            </a>
                                                                        )}
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'social-link' &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.value?.value?.includes(
                                                                            'twitter.com'
                                                                        ) && (
                                                                            <a
                                                                                style={{ color: textColor }}
                                                                                title="facebook"
                                                                                target="_blank"
                                                                                href={
                                                                                    website.defaultHeader.items[
                                                                                        rowIndex
                                                                                    ].items[colIndex].value[i]?.value
                                                                                        ?.value
                                                                                }
                                                                            >
                                                                                <TwitterIcon />{' '}
                                                                                {
                                                                                    website.defaultHeader.items[
                                                                                        rowIndex
                                                                                    ].items[colIndex].value[i]?.value
                                                                                        ?.title
                                                                                }
                                                                            </a>
                                                                        )}
                                                                    {website?.defaultHeader?.items?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex] &&
                                                                        website.defaultHeader.items[rowIndex]?.items
                                                                            ?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ] &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ]?.value?.length > 0 &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.type === 'social-link' &&
                                                                        website.defaultHeader.items[rowIndex].items[
                                                                            colIndex
                                                                        ].value[i]?.value?.value?.includes(
                                                                            'linkedin.com'
                                                                        ) && (
                                                                            <a
                                                                                style={{ color: textColor }}
                                                                                title="facebook"
                                                                                target="_blank"
                                                                                href={
                                                                                    website.defaultHeader.items[
                                                                                        rowIndex
                                                                                    ].items[colIndex].value[i]?.value
                                                                                        ?.value
                                                                                }
                                                                            >
                                                                                <LinkedInIcon />{' '}
                                                                                {
                                                                                    website.defaultHeader.items[
                                                                                        rowIndex
                                                                                    ].items[colIndex].value[i]?.value
                                                                                        ?.title
                                                                                }
                                                                            </a>
                                                                        )}
                                                                </li>
                                                            )
                                                        })}
                                                </ul>
                                            </Grid>
                                        )
                                    })}
                            </Grid>
                        )
                    })}
                {website.selectedLangCode === website.defaultLangCode &&
                    // || !otherLangHeader || !(otherLangHeader[selectedLang])
                    website?.defaultHeader?.items?.length > 0 &&
                    website.defaultHeader.items.map((row, rowIndex) => {
                        return (
                            <Grid container={true} key={rowIndex} style={{ marginTop: rowIndex === 0 ? 0 : -32 }}>
                                {row?.items?.length > 0 &&
                                    row.items.map((col, colIndex) => {
                                        let align = ''
                                        if (col.alignment === 'left') {
                                            align = 'flex-start'
                                        } else if (col.alignment === 'right') {
                                            align = 'flex-end'
                                        } else {
                                            align = 'center'
                                        }
                                        return (
                                            <Grid
                                                key={colIndex}
                                                item={true}
                                                style={{
                                                    width: col?.width + '%',
                                                    display: 'inline-flex',
                                                    justifyContent: align,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <ul style={{ marginTop: 16 }}>
                                                    {col.value.length > 0 &&
                                                        col.value.map((val, i) => {
                                                            return (
                                                                <li className={classes.horizontalLi} key={i}>
                                                                    {val.type === 'logo' && (
                                                                        <Link href={'/'}>
                                                                            <img
                                                                                src={
                                                                                    GENERAL_SETTINGS.STATIC_URL +
                                                                                    val.value
                                                                                }
                                                                                alt={'logo'}
                                                                                className={classes.imagePreview}
                                                                                onClick={() => {
                                                                                    dispatch(
                                                                                        updateState(
                                                                                            'website',
                                                                                            'selectedHeaderLink',
                                                                                            ''
                                                                                        )
                                                                                    )
                                                                                }}
                                                                            />
                                                                        </Link>
                                                                    )}
                                                                    {val.type === 'external-link' && (
                                                                        <a
                                                                            className={classes.externalLink}
                                                                            target="_blank"
                                                                            href={val.value.value}
                                                                        >
                                                                            {val.value.title}
                                                                        </a>
                                                                    )}
                                                                    {val.type === 'button' && (
                                                                        <Button
                                                                            variant="contained"
                                                                            size="small"
                                                                            className={classes.button}
                                                                            onClick={() =>
                                                                                window.open(val.value.value, '_blank')
                                                                            }
                                                                        >
                                                                            {val.value.title}
                                                                        </Button>
                                                                    )}
                                                                    {val.type === 'internal-link' && (
                                                                        <a
                                                                            onClick={() => {
                                                                                dispatch(
                                                                                    updateState(
                                                                                        'website',
                                                                                        'pageNotFound',
                                                                                        false
                                                                                    )
                                                                                )
                                                                                handleInternalLink(
                                                                                    val.value.value,
                                                                                    val.value.title
                                                                                )
                                                                            }}
                                                                            className={classes.internalLink}
                                                                        >
                                                                            {val.value.title}
                                                                        </a>
                                                                    )}
                                                                    {val.type === 'phone' && (
                                                                        <span className={classes.text}>
                                                                            <PhoneIcon className={classes.text} />{' '}
                                                                            {val.value}
                                                                        </span>
                                                                    )}
                                                                    {val.type === 'email' && (
                                                                        <span className={classes.text}>
                                                                            <EmailIcon className={classes.text} />{' '}
                                                                            {val.value}
                                                                        </span>
                                                                    )}
                                                                    {val.type === 'address' && (
                                                                        <a
                                                                            className={classes.externalLink}
                                                                            href={val.value.value}
                                                                        >
                                                                            <RoomIcon /> {val.value.title}
                                                                        </a>
                                                                    )}
                                                                    {val.type === 'social-link' &&
                                                                        val.value.value.includes('facebook.com') && (
                                                                            <a
                                                                                style={{ color: textColor }}
                                                                                title="facebook"
                                                                                target="_blank"
                                                                                href={val.value.value}
                                                                            >
                                                                                <FacebookIcon /> {val.value.title}
                                                                            </a>
                                                                        )}
                                                                    {val.type === 'social-link' &&
                                                                        val.value.value.includes('instagram.com') && (
                                                                            <a
                                                                                style={{ color: textColor }}
                                                                                title="facebook"
                                                                                target="_blank"
                                                                                href={val.value.value}
                                                                            >
                                                                                <InstagramIcon /> {val.value.title}
                                                                            </a>
                                                                        )}
                                                                    {val.type === 'social-link' &&
                                                                        val.value.value.includes('github.com') && (
                                                                            <a
                                                                                style={{ color: textColor }}
                                                                                title="facebook"
                                                                                target="_blank"
                                                                                href={val.value.value}
                                                                            >
                                                                                <GitHubIcon /> {val.value.title}
                                                                            </a>
                                                                        )}
                                                                    {val.type === 'social-link' &&
                                                                        val.value.value.includes('twitter.com') && (
                                                                            <a
                                                                                style={{ color: textColor }}
                                                                                title="facebook"
                                                                                target="_blank"
                                                                                href={val.value.value}
                                                                            >
                                                                                <TwitterIcon /> {val.value.title}
                                                                            </a>
                                                                        )}
                                                                    {val.type === 'social-link' &&
                                                                        val.value.value.includes('linkedin.com') && (
                                                                            <a
                                                                                style={{ color: textColor }}
                                                                                title="facebook"
                                                                                target="_blank"
                                                                                href={val.value.value}
                                                                            >
                                                                                <LinkedInIcon /> {val.value.title}
                                                                            </a>
                                                                        )}
                                                                </li>
                                                            )
                                                        })}
                                                </ul>
                                            </Grid>
                                        )
                                    })}
                            </Grid>
                        )
                    })}
            </Container>
        )
    }, [
        website?.defaultHeader?.items,
        website?.otherLangHeader,
        website?.selectedLangCode,
        website?.defaultLangCode,
        code,
        classes,
    ])

    const getDrawerChoices = () => {
        return (
            menuItems?.length > 0 &&
            menuItems.map((item, index) => {
                return (
                    <Typography component={'div'} key={index} className={mobileClasses.listRoot}>
                        {(item?.type === 'external-link' || item?.type === 'address') && (
                            <a href={item?.value?.value} target={'_blank'} className={mobileClasses.link}>
                                <span>
                                    {website?.selectedLangCode === website?.defaultLangCode
                                        ? item?.value?.title
                                        : otherLangMenuItems[index]?.value}
                                </span>
                            </a>
                        )}
                        {item?.type === 'internal-link' && (
                            <a onClick={() => handleInternalLink(item?.value?.value, otherLangMenuItems[index]?.value)}>
                                <span
                                    onClick={() => {
                                        setMobileStates((prevState) => ({ ...prevState, drawerOpen: false }))
                                    }}
                                    className={mobileClasses.link}
                                >
                                    {website?.selectedLangCode === website?.defaultLangCode
                                        ? item?.value?.title
                                        : otherLangMenuItems[index]?.value}
                                </span>
                            </a>
                        )}
                        {item?.type === 'phone' && (
                            <span className={mobileClasses.text}>
                                <PhoneIcon />
                                {website?.selectedLangCode === website?.defaultLangCode
                                    ? item?.value
                                    : otherLangMenuItems[index]?.value}
                            </span>
                        )}
                        {item?.type === 'email' && (
                            <span className={mobileClasses.text}>
                                <EmailIcon />
                                {website?.selectedLangCode === website?.defaultLangCode
                                    ? item?.value
                                    : otherLangMenuItems[index]?.value}
                            </span>
                        )}
                        {item.type === 'button' && (
                            <Button
                                variant="contained"
                                size="small"
                                className={mobileClasses.button}
                                onClick={() => window.open(item?.value?.value, '_blank')}
                            >
                                {website?.selectedLangCode === website?.defaultLangCode
                                    ? item?.value?.title
                                    : otherLangMenuItems[index]?.value}
                            </Button>
                        )}
                        {item?.type === 'social-link' && item?.value.value.includes('facebook.com') && (
                            <a style={{ color: textColor }} title="facebook" target="_blank" href={item?.value?.value}>
                                <FacebookIcon /> {item?.value?.title}
                            </a>
                        )}
                        {item?.type === 'social-link' && item?.value.value.includes('instagram.com') && (
                            <a style={{ color: textColor }} title="facebook" target="_blank" href={item?.value?.value}>
                                <InstagramIcon /> {item?.value?.title}
                            </a>
                        )}
                        {item?.type === 'social-link' && item?.value.value.includes('linkedin.com') && (
                            <a style={{ color: textColor }} title="facebook" target="_blank" href={item?.value?.value}>
                                <LinkedInIcon /> {item?.value?.title}
                            </a>
                        )}
                        {item?.type === 'social-link' && item?.value.value.includes('twitter.com') && (
                            <a style={{ color: textColor }} title="facebook" target="_blank" href={item?.value?.value}>
                                <TwitterIcon /> {item?.value?.title}
                            </a>
                        )}
                        <Divider />
                    </Typography>
                )
            })
        )
    }

    const handleLocaleChange = (langCode) => {
        const shortLangCode = website?.languages.find((langItem) => langItem.code.toLowerCase() === langCode).shortcode
        const basePath = router.asPath.split('?')[0] || router.asPath
        const query = router.query
        query.lang = shortLangCode

        Object.keys(query).map(function (k) {
            if (router.pathname.includes(`[${k}]`)) {
                delete query[k]
            }
        })

        const url = { pathname: router.pathname, query }
        const urlAs = { pathname: basePath, query }
        dispatch(updateState('website', 'selectedLangCode', langCode))
        router.push(url, urlAs)
        document.documentElement.lang = shortLangCode
    }

    const handleDesktopView = () => {
        return (
            <Grid container spacing={1}>
                <Grid item xs={website?.ccTel ? 10 : 11}>
                    {header}
                </Grid>
                <Grid item xs={website?.ccTel ? 2 : 1} className={classes.dropDownGrid}>
                    {website?.ccTel && (
                        <span>
                            {website?.assets?.icons?.phone ? (
                                <a href={`tel:${website.ccTel}`}>
                                    {' '}
                                    <img
                                        className={classes.icon}
                                        src={GENERAL_SETTINGS.STATIC_URL + website.assets.icons.phone}
                                    />{' '}
                                </a>
                            ) : (
                                <>
                                    {' '}
                                    <PhoneIcon />{' '}
                                    <a className={classes.phone} href={`tel:${website.ccTel}`}>
                                        {' '}
                                        {website.ccTel}{' '}
                                    </a>{' '}
                                </>
                            )}
                        </span>
                    )}
                    <FormControl variant="outlined" style={{ marginRight: 8, minWidth: 105 }} size={'small'}>
                        <Select className={classes.dropDownStyle}
                            value={website?.selectedLangCode}
                            onChange={(e) => handleLocaleChange(e.target.value)}
                                IconComponent={() => <PublicIcon /> }
                        >
                            {website?.languages?.length > 0 &&
                                website.languages.map((lang, index) => {
                                    return (
                                        <MenuItem value={lang?.code?.toLowerCase()} key={index}>
                                            {' '}
                                            {lang?.description}{' '}
                                        </MenuItem>
                                    )
                                })}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        )
    }

    const handleMobileView = () => {
        const handleDrawerOpen = () => setMobileStates((prevState) => ({ ...prevState, drawerOpen: true }))
            , handleDrawerClose = () => setMobileStates((prevState) => ({ ...prevState, drawerOpen: false }))
        return (
            <Grid container spacing={1}>
                <Grid item xs={10} className={mobileClasses.logoRoot}>
                    {menuItems?.length > 0 &&
                        menuItems.map((menu, i) => {
                            return (
                                <a key={i}>
                                    {menu.type === 'logo' && (
                                        <Link href={'/'}>
                                            <img
                                                src={GENERAL_SETTINGS.STATIC_URL + menu.value}
                                                alt={'logo'}
                                                className={mobileClasses.imagePreview}
                                            />
                                        </Link>
                                    )}
                                </a>
                            )
                        })}
                </Grid>
                <Grid item xs={2}>
                    <Toolbar>
                        <IconButton
                            onClick={handleDrawerOpen}
                            edge={'start'}
                            style={{ color: assets?.colors?.button?.main }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Drawer
                            anchor={'right'}
                            open={drawerOpen}
                            onClose={handleDrawerClose}
                            classes={{ paper: mobileClasses.paper }}
                        >
                            <IconButton onClick={handleDrawerClose} className={classes.closeMenuButton}>
                                <CancelIcon />
                            </IconButton>
                            <Typography component={'div'} className={mobileClasses.mrgin4p}>
                                {getDrawerChoices()}
                                {website?.ccTel && (
                                    <span className={mobileClasses.icon}>
                                        {website?.assets?.icons?.phone ? (
                                            <a href={`tel:${website.ccTel}`}>
                                                {' '}
                                                <img
                                                    className={classes.icon}
                                                    src={GENERAL_SETTINGS.STATIC_URL + website.assets.icons.phone}
                                                />{' '}
                                            </a>
                                        ) : (
                                            <>
                                                {' '}
                                                <PhoneIcon />{' '}
                                                <a className={classes.phone} href={`tel:${website.ccTel}`}>
                                                    {' '}
                                                    {website.ccTel}{' '}
                                                </a>{' '}
                                            </>
                                        )}
                                    </span>
                                )}
                            </Typography>
                            <Typography component={'div'} className={mobileClasses.listRoot}>
                                <FormControl variant="outlined" size={'small'}>
                                    <Select
                                        value={website?.selectedLangCode}
                                        onChange={(e) =>
                                            dispatch(updateState('website', 'selectedLangCode', e.target.value))
                                        }
                                        label="Language"
                                        IconComponent={() => <PublicIcon /> }
                                        className={classes.dropDownStyle}
                                    >
                                        {website?.languages?.length > 0 &&
                                            website.languages.map((lang, index) => {
                                                return (
                                                    <MenuItem value={lang?.code?.toLowerCase()} key={index}>
                                                        {' '}
                                                        {lang?.description}{' '}
                                                    </MenuItem>
                                                )
                                            })}
                                    </Select>
                                </FormControl>
                            </Typography>
                        </Drawer>
                    </Toolbar>
                </Grid>
            </Grid>
        )
    }

    return (
        <AppBar position="sticky" className={classes.root} style={{ opacity: appBarOpacity }}>
            {mobileView ? handleMobileView() : handleDesktopView()}
            {GENERAL_SETTINGS.HOTELREFNO === 1041 ?
                <div className={classes.whatsappButton}>
                    <a
                        href="https://wa.me/902266758200?text=Thermalium%20Wellness&Spa%20Hotel%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.">
                        <img src="imgs/whatsapp.png" alt="Bize Whatsapptan Ulasin" height="60" width="60" />
                    </a>
                </div>: null
            }
        </AppBar>
    )
}

const memorizedWebSiteHeader = memo(WebSiteHeader)

export default memorizedWebSiteHeader