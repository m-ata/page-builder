import React, { useState, useEffect, useContext, memo } from 'react'
import {Col, Row, Container} from "react-bootstrap";
import {Button} from "@material-ui/core";
import FacebookIcon from '@material-ui/icons/Facebook';
import YouTubeIcon from '@material-ui/icons/YouTube';
import TwitterIcon from '@material-ui/icons/Twitter';
import InstagramIcon from '@material-ui/icons/Instagram';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import GitHubIcon from '@material-ui/icons/GitHub';
import RoomIcon from '@material-ui/icons/Room';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import WebCmsGlobal from "../../webcms-global";
import {makeStyles} from "@material-ui/core/styles";
import {Typography, Grid} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import { useRouter } from 'next/router'
import {updateState} from "../../../state/actions";

const desktopStyles = makeStyles(() => ({
    root: {
        backgroundColor: props => props?.assets?.colors?.secondary?.main,
        padding: 20,
        paddingBottom: 0,
        marginTop: 0
    },
    link: {
        color: props => props?.assets?.colors?.secondary?.light,
        '&:hover' : {
            color: props => props?.assets?.colors?.secondary?.dark,
        },
        cursor: "pointer",
        fontFamily: (props) => props?.assets?.font?.name || 'Roboto'
    },
    button: {
        backgroundColor: props => props?.assets?.colors?.button?.main,
        fontFamily: (props) => props?.assets?.font?.name || 'Roboto',
        borderRadius: 5
    },
    text: {
        color: props => props?.assets?.colors?.secondary?.contrastText,
        fontFamily: (props) => props?.assets?.font?.name || 'Roboto',
        '& span' : {
            display: 'block',
            height: 1,
            marginTop: 10,
            marginBottom: 10,
            position: 'relative',
            width: '50%',
            background: props => props?.assets?.colors?.secondary?.contrastText
        }
    },
    socialIcon: {
        width: 30,
        height: 30,
        marginLeft: 4
    }
}))

const mobileStyles = makeStyles(() => ({
    root: {
        backgroundColor: props => props?.assets?.colors?.secondary?.main,
        padding: 20,
        paddingBottom: 0,
        marginTop: 0
    },
    list: {
        listStyle: "none"
    },
    text: {
        color: props => props?.assets?.colors?.secondary?.contrastText,
        fontFamily: (props) => props?.assets?.font?.name || 'Roboto',
        '& span' : {
            display: 'block',
            height: 1,
            marginTop: 10,
            marginBottom: 10,
            position: 'relative',
            width: '100%',
            background: props => props?.assets?.colors?.secondary?.contrastText,
        },
        marginTop: 8
    },
    alignCenterItem: {
        display: "block",
        textAlign: "center"
    },
    socialIcon: {
        width: 30,
        height: 30
    }
}))

const WebsiteFooter = (props) => {

    const {
        assets,
    } = props;

    //local states
    const [footer, setFooter] = useState('');
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);
    const [mobileView, setMobileView] = useState(false);
    const dispatch = useDispatch();
    const website = useSelector(state => state?.formReducer?.website);

    //import classes
    const desktopClasses = desktopStyles({assets: assets});
    const mobileClasses = mobileStyles({assets: assets});

    const router = useRouter();
    const { id, lang } = router.query

    useEffect(() => {
        const setResponsiveness = () => {
            return window.innerWidth <= 1024
                ? setMobileView(true)
                : setMobileView(false);
        };
        setResponsiveness();
        window.addEventListener("resize", () => setResponsiveness());
    }, []);

    const handleInternalLink = (gid) => {
        const { defaultPages } = {...website};
        const selectedPage = defaultPages.find(x => x?.id === gid);
        if (selectedPage?.currentCode) {
            router.push(`/${selectedPage?.currentCode?.toLowerCase()}`);
        } else {
            if (typeof selectedPage?.code === "string") {
                router.push(`/${selectedPage?.code?.toLowerCase()}`);
            } else {
                router.push(`/${selectedPage?.code[0]?.toLowerCase()}`);
            }
        }
    }

    useEffect(() => {
        if (website?.defaultFooter?.items?.length > 0) {
            setFooter(
                <Container>
                    {
                        website?.selectedLangCode !== website?.defaultLangCode &&
                        website?.otherLangFooter &&
                        website?.otherLangFooter[website?.selectedLangCode] &&
                        website?.otherLangFooter[website?.selectedLangCode].items.length > 0 &&
                        website?.otherLangFooter[website?.selectedLangCode].items.map((footerItem, rowIndex) => {
                            return(
                                <Row key={rowIndex} style={{marginTop: rowIndex === 0 ? 0 : -48}}>
                                    {
                                        footerItem.items && footerItem.items.length > 0 && footerItem.items.map((item, colIndex) => {
                                            let align = '';
                                            if (website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.alignment === 'left') {
                                                align = 'flex-start';
                                            } else if (website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.alignment === 'right') {
                                                align = 'flex-end';
                                            } else {
                                                align = 'center';
                                            }
                                            return (
                                                <Col key={colIndex}>
                                                    <div className="widget no-box" style={{
                                                        display: 'flex',
                                                        justifyContent: align,
                                                    }}>
                                                        <ul>
                                                            {
                                                                item?.value?.length > 0 && item.value.map((value, index) => {
                                                                    return (
                                                                        <li key={index}
                                                                            className={website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'social-link' &&
                                                                            !website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.title ? 'horizontal-li' : ''}
                                                                            style={{width: website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'email' ? 'max-content' : 'unset'}}
                                                                        >
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'logo' &&
                                                                                <div
                                                                                    style={{
                                                                                        backgroundImage: `url(${
                                                                                            GENERAL_SETTINGS.STATIC_URL + value.value
                                                                                        })`,
                                                                                        backgroundSize: 'contain',
                                                                                        backgroundRepeat: 'no-repeat',
                                                                                        height: 100,
                                                                                        width: 200,
                                                                                        marginTop: 16,
                                                                                    }}
                                                                                />
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'image' &&
                                                                                <a href={website.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.link}
                                                                                   target={'_blank'}>
                                                                                    <div
                                                                                        style={{
                                                                                            backgroundImage: `url(${
                                                                                                GENERAL_SETTINGS.STATIC_URL + website.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.image
                                                                                            })`,
                                                                                            backgroundSize: 'contain',
                                                                                            backgroundRepeat: 'no-repeat',
                                                                                            height: 100,
                                                                                            width: 200,
                                                                                        }}
                                                                                    />
                                                                                </a>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'heading' &&
                                                                                <h5 className={desktopClasses.text}>
                                                                                    {
                                                                                        value.value
                                                                                    }
                                                                                    <span/>
                                                                                </h5>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'paragraph' &&
                                                                                <p className={desktopClasses.text}>
                                                                                    {value.value}
                                                                                </p>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'address' &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="facebook"
                                                                                   target="_blank"
                                                                                   href={website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.value}>
                                                                                    <RoomIcon/> {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'phone' &&
                                                                                <a href={`tel:${value.value}`} className={desktopClasses.link}>
                                                                                    <PhoneIcon/> {value.value} </a>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'email' &&
                                                                                <a className={desktopClasses.link}
                                                                                   target="_blank"
                                                                                   href={`mailto:${value.value}`}>
                                                                                    <EmailIcon/> {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'link' &&
                                                                                <a className={desktopClasses.link}
                                                                                   href={website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.value}
                                                                                   target="_blank">
                                                                                    {value.value}</a>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'internal-link' &&
                                                                                <span
                                                                                    className={desktopClasses.link}
                                                                                    onClick={() => {
                                                                                        dispatch(updateState('website', 'pageNotFound', false))
                                                                                        handleInternalLink(website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.value)
                                                                                    }}>
                                                                                    {value.value}
                                                                                </span>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'button' &&
                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    aria-label="add"
                                                                                    className={desktopClasses.button}
                                                                                    onClick={() => window.open(website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.value, "_blank")}
                                                                                >
                                                                                    {value.value}
                                                                                </Button>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'social-link' &&
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.value?.includes('facebook.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="facebook"
                                                                                   target="_blank"
                                                                                   href={website?.defaultFooter?.items[rowIndex].items[colIndex].value[index].value.value}>
                                                                                    {
                                                                                        assets?.icons?.facebook ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.facebook} alt={'facebook'} className={desktopClasses.socialIcon} /> : <FacebookIcon/>
                                                                                    }
                                                                                    {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'social-link' &&
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.value?.includes('instagram.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="instagram"
                                                                                   target="_blank"
                                                                                   href={website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.value}>
                                                                                    {
                                                                                        assets?.icons?.instagram ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.instagram} alt={'instagram'} className={desktopClasses.socialIcon} /> : <InstagramIcon/>
                                                                                    }
                                                                                    {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'social-link' &&
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.value?.includes('github.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="github"
                                                                                   target="_blank"
                                                                                   href={website?.defaultFooter?.items[rowIndex].items[colIndex].value[index].value.value}>
                                                                                    <GitHubIcon/> {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'social-link' &&
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.value?.includes('twitter.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="twitter"
                                                                                   target="_blank"
                                                                                   href={website?.defaultFooter?.items[rowIndex].items[colIndex].value[index].value.value}>
                                                                                    {
                                                                                        assets?.icons?.twitter ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.twitter} alt={'twitter'} className={desktopClasses.socialIcon} /> : <TwitterIcon/>
                                                                                    }
                                                                                    {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'social-link' &&
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.value?.includes('youtube.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="youtube"
                                                                                   target="_blank"
                                                                                   href={website?.defaultFooter?.items[rowIndex].items[colIndex].value[index].value.value}>
                                                                                    <YouTubeIcon/> {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.type === 'social-link' &&
                                                                                website?.defaultFooter?.items[rowIndex]?.items[colIndex]?.value[index]?.value?.value?.includes('linkedin.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="linkedin"
                                                                                   target="_blank"
                                                                                   href={website?.defaultFooter?.items[rowIndex].items[colIndex].value[index].value.value}>
                                                                                    {
                                                                                        assets?.icons?.linkedin ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.linkedin} alt={'linkedin'} className={desktopClasses.socialIcon} /> : <LinkedInIcon/>
                                                                                    }
                                                                                    {value.value}
                                                                                </a>
                                                                            }
                                                                        </li>
                                                                    )
                                                                })
                                                            }
                                                        </ul>
                                                    </div>
                                                </Col>
                                            )
                                        })
                                    }
                                </Row>
                            )
                        })
                    }
                    {
                        (website?.selectedLangCode === website?.defaultLangCode) &&
                        website?.defaultFooter?.items?.length > 0 && website.defaultFooter.items.map((footerItem, row) => {
                            return (
                                <Row key={row} style={{marginTop: row === 0 ? 0 : -48}}>
                                    {
                                        footerItem.items && footerItem.items.length > 0 && footerItem.items.map((item, col) => {
                                            let align = '';
                                            if (item.alignment === 'left') {
                                                align = 'flex-start';
                                            } else if (item.alignment === 'right') {
                                                align = 'flex-end';
                                            } else {
                                                align = 'center';
                                            }
                                            return (
                                                <Col key={col}>
                                                    <div className="widget no-box" style={{
                                                        display: 'flex',
                                                        justifyContent: align,
                                                    }}>
                                                        <ul>
                                                            {
                                                                item.value && item.value.length > 0 && item.value.map((value, index) => {
                                                                    return (
                                                                        <li key={index}
                                                                            className={value.type === 'social-link' && !value.value.title ? 'horizontal-li' : ''}
                                                                            style={{width: value.type === 'email' ? 'max-content' : 'unset'}}
                                                                        >
                                                                            {
                                                                                value.type === 'logo' &&
                                                                                <div
                                                                                    style={{
                                                                                        backgroundImage: `url(${
                                                                                            GENERAL_SETTINGS.STATIC_URL + value.value
                                                                                        })`,
                                                                                        backgroundSize: 'contain',
                                                                                        backgroundRepeat: 'no-repeat',
                                                                                        height: 100,
                                                                                        width: 200,
                                                                                        marginTop: 16,
                                                                                    }}
                                                                                />
                                                                            }
                                                                            {
                                                                                value.type === 'image' &&
                                                                                <a href={value?.value?.link}
                                                                                   target={'_blank'}>
                                                                                    <div
                                                                                        style={{
                                                                                            backgroundImage: `url(${
                                                                                                GENERAL_SETTINGS.STATIC_URL + value?.value?.image
                                                                                            })`,
                                                                                            backgroundSize: 'contain',
                                                                                            backgroundRepeat: 'no-repeat',
                                                                                            height: 100,
                                                                                            width: 150,
                                                                                        }}
                                                                                    />
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'heading' &&
                                                                                <h5 className={desktopClasses.text}>
                                                                                    {
                                                                                        value.value
                                                                                    }
                                                                                    <span/>
                                                                                </h5>
                                                                            }
                                                                            {
                                                                                value.type === 'paragraph' &&
                                                                                <p className={desktopClasses.text}>{value.value}</p>
                                                                            }
                                                                            {
                                                                                value.type === 'address' &&
                                                                                <a className={desktopClasses.link}
                                                                                   href={value.value.value}
                                                                                   target="_blank">
                                                                                    <RoomIcon/>
                                                                                    {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'phone' &&
                                                                                <a href={`tel:${value.value}`} className={desktopClasses.link}>
                                                                                    <PhoneIcon/> {value.value} </a>
                                                                            }
                                                                            {
                                                                                value.type === 'email' &&
                                                                                <a className={desktopClasses.link}
                                                                                   target="_blank"
                                                                                   href={`mailto:${value.value}`}>
                                                                                    <EmailIcon/> {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'link' &&
                                                                                <a className={desktopClasses.link}
                                                                                   href={value.value.value}
                                                                                   target="_blank">
                                                                                    {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'internal-link' &&
                                                                                <span
                                                                                    onClick={() => {
                                                                                        dispatch(updateState('website', 'pageNotFound', false))
                                                                                        handleInternalLink(value.value.value)
                                                                                    }}
                                                                                    className={desktopClasses.link}>
                                                                                    {value.value.title}
                                                                                </span>
                                                                            }
                                                                            {
                                                                                value.type === 'button' &&
                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    aria-label="add"
                                                                                    className={desktopClasses.button}
                                                                                    onClick={() => window.open(value.value.value, "_blank")}
                                                                                >
                                                                                    {value.value.title}
                                                                                </Button>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('facebook.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="facebook"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>
                                                                                    {
                                                                                        assets?.icons?.facebook ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.facebook}alt={'facebook'} className={desktopClasses.socialIcon} /> : <FacebookIcon/>
                                                                                    }
                                                                                    {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('instagram.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="instagram"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>
                                                                                    {
                                                                                        assets?.icons?.instagram ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.instagram}alt={'instagram'} className={desktopClasses.socialIcon} /> : <InstagramIcon/>
                                                                                    }
                                                                                    {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('github.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="github"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>
                                                                                    <GitHubIcon/> {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('twitter.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="twitter"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>
                                                                                    {
                                                                                        assets?.icons?.twitter ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.twitter}alt={'instagram'} className={desktopClasses.socialIcon} /> : <TwitterIcon/>
                                                                                    }
                                                                                    {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('youtube.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="youtube"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>
                                                                                    <YouTubeIcon/> {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('linkedin.com') &&
                                                                                <a className={desktopClasses.link}
                                                                                   title="linkedin"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>
                                                                                    {
                                                                                        assets?.icons?.linkedin ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.linkedin}alt={'linkedin'} className={desktopClasses.socialIcon} /> : <LinkedInIcon/>
                                                                                    }
                                                                                    {value.value.title}
                                                                                </a>
                                                                            }
                                                                        </li>
                                                                    )
                                                                })
                                                            }
                                                        </ul>
                                                    </div>
                                                </Col>
                                            )
                                        })
                                    }
                                </Row>
                            )
                        })
                    }
                </Container>
            )
        }
    }, [website?.defaultFooter?.items, website?.otherLangFooter, website?.selectedLangCode, website?.defaultLangCode, id, lang, desktopClasses]);

    const handleDesktopView = () => {
        return (
            <Typography component={'div'} className={desktopClasses.root}>
                {footer}
            </Typography>
        )
    }

    const handleMobileView = () => {
        return (
            <Typography component={'div'} className={mobileClasses.root}>
                {
                    website?.defaultFooter?.items?.length > 0 &&
                        <>
                            {
                                (website?.selectedLangCode === website?.defaultLangCode ||
                                    !website?.otherLangFooter ||
                                    !website?.otherLangFooter[website?.selectedLangCode]) &&
                                website?.defaultFooter?.items?.length > 0 &&  website.defaultFooter.items.map((footerItem, rowIndex) => {
                                    return (
                                        <Typography component={'div'} key={rowIndex} >
                                            {
                                                rowIndex !== 0 && <hr />
                                            }
                                            {
                                                footerItem?.items?.length > 0 &&
                                                    footerItem.items.map((item, col) => {
                                                        return (
                                                            <Typography component={'div'} className={mobileClasses.alignCenterItem}  key={col} >
                                                                {
                                                                    item?.value?.length > 0 && item.value.map((value, index) => {
                                                                        return (
                                                                            <React.Fragment key={index}>
                                                                                {
                                                                                    value?.type === 'social-link' ?
                                                                                        <li className={`horizontal-li`}>
                                                                                            {
                                                                                                value?.value?.value?.includes('facebook.com') &&
                                                                                                <a className={desktopClasses.link}
                                                                                                   title="facebook"
                                                                                                   target="_blank"
                                                                                                   href={value.value.value}>
                                                                                                    {
                                                                                                        assets?.icons?.facebook ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.facebook} alt={'facebook'} className={desktopClasses.socialIcon} /> : <FacebookIcon/>
                                                                                                    }
                                                                                                    {value?.value?.title}
                                                                                                </a>
                                                                                            }
                                                                                            {
                                                                                                value?.value?.value?.includes('instagram.com') &&
                                                                                                <a className={desktopClasses.link}
                                                                                                   title="instagram"
                                                                                                   target="_blank"
                                                                                                   href={value.value.value}>
                                                                                                    {
                                                                                                        assets?.icons?.instagram ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.instagram} alt={'instagram'} className={desktopClasses.socialIcon} /> : <InstagramIcon/>
                                                                                                    }
                                                                                                    {value.value?.title}
                                                                                                </a>
                                                                                            }
                                                                                            {
                                                                                                value?.value?.value?.includes('twitter.com') &&
                                                                                                <a className={desktopClasses.link}
                                                                                                   title="twitter"
                                                                                                   target="_blank"
                                                                                                   href={value.value.value}>
                                                                                                    {
                                                                                                        assets?.icons?.twitter ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.twitter} alt={'twitter'} className={desktopClasses.socialIcon} /> : <TwitterIcon/>
                                                                                                    }
                                                                                                    {value.value?.title}
                                                                                                </a>
                                                                                            }
                                                                                            {
                                                                                                value?.value?.value?.includes('linkedin.com') &&
                                                                                                <a className={desktopClasses.link}
                                                                                                   title="linkedin"
                                                                                                   target="_blank"
                                                                                                   href={value.value.value}>
                                                                                                    {
                                                                                                        assets?.icons?.linkedin ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.linkedin} alt={'linkedin'} className={desktopClasses.socialIcon} /> : <LinkedInIcon/>
                                                                                                    }
                                                                                                    {value.value?.title}
                                                                                                </a>
                                                                                            }
                                                                                        </li>
                                                                                    :
                                                                                        <Grid container
                                                                                              justify={'center'}
                                                                                              key={index}>
                                                                                            <Grid item>
                                                                                                <li className={mobileClasses.list}>
                                                                                                    {
                                                                                                        value.type === 'image' &&
                                                                                                        <a href={value?.value?.link}
                                                                                                           target={'_blank'}>
                                                                                                            <div
                                                                                                                style={{
                                                                                                                    backgroundImage: `url(${
                                                                                                                        GENERAL_SETTINGS.STATIC_URL + value?.value?.image
                                                                                                                    })`,
                                                                                                                    backgroundSize: 'contain',
                                                                                                                    backgroundRepeat: 'no-repeat',
                                                                                                                    height: 100,
                                                                                                                    width: 150,
                                                                                                                }}
                                                                                                            />
                                                                                                        </a>
                                                                                                    }
                                                                                                    {
                                                                                                        value?.type === 'image' &&
                                                                                                        <div
                                                                                                            style={{
                                                                                                                backgroundImage: `url(${
                                                                                                                    GENERAL_SETTINGS.STATIC_URL + value?.value
                                                                                                                })`,
                                                                                                                backgroundSize: 'contain',
                                                                                                                backgroundRepeat: 'no-repeat',
                                                                                                                width: 100,
                                                                                                                height: 25,
                                                                                                            }}
                                                                                                        />
                                                                                                    }
                                                                                                    {
                                                                                                        value?.type === 'heading' &&
                                                                                                        <h5 className={mobileClasses.text}>
                                                                                                            {
                                                                                                                value?.value
                                                                                                            }
                                                                                                            <span></span>
                                                                                                        </h5>
                                                                                                    }
                                                                                                    {
                                                                                                        value?.type === 'paragraph' &&
                                                                                                        <p className={desktopClasses.text}>{value?.value}</p>
                                                                                                    }
                                                                                                    {
                                                                                                        value?.type === 'address' &&
                                                                                                        <a className={desktopClasses.link}
                                                                                                           href={value.value.value}
                                                                                                           target="_blank">
                                                                                                            <RoomIcon/>
                                                                                                            {value?.value?.title}
                                                                                                        </a>
                                                                                                    }
                                                                                                    {
                                                                                                        value?.type === 'phone' &&
                                                                                                        <a href={`tel:${value.value}`} className={desktopClasses.link}>
                                                                                                            <PhoneIcon/> {value?.value}
                                                                                                        </a>
                                                                                                    }
                                                                                                    {
                                                                                                        value?.type === 'email' &&
                                                                                                        <a className={desktopClasses.link}
                                                                                                           target="_blank"
                                                                                                           href={`mailto:${value.value}`}>
                                                                                                            <EmailIcon/> {value.value}
                                                                                                        </a>
                                                                                                    }
                                                                                                    {
                                                                                                        value?.type === 'link' &&
                                                                                                        <a className={desktopClasses.link}
                                                                                                           href={value?.value?.value}
                                                                                                           target="_blank">
                                                                                                            {value?.value?.title}
                                                                                                        </a>
                                                                                                    }
                                                                                                    {
                                                                                                        value.type === 'internal-link' &&
                                                                                                        <span
                                                                                                            onClick={() => {
                                                                                                                dispatch(updateState('website', 'pageNotFound', false))
                                                                                                                handleInternalLink(value.value.value)
                                                                                                            }}
                                                                                                            className={desktopClasses.link}>
                                                                                                                {value.value.title}
                                                                                                        </span>
                                                                                                    }
                                                                                                    {
                                                                                                        value?.type === 'button' &&
                                                                                                        <Button
                                                                                                            size="small"
                                                                                                            aria-label="add"
                                                                                                            className={desktopClasses.button}
                                                                                                            onClick={() => window.open(value?.value?.value, "_blank")}
                                                                                                        >
                                                                                                            {value.value.title}
                                                                                                        </Button>
                                                                                                    }
                                                                                                </li>
                                                                                            </Grid>
                                                                                        </Grid>
                                                                                }
                                                                            </React.Fragment>
                                                                        )
                                                                    })
                                                                }
                                                            </Typography>
                                                        )
                                                    })
                                            }
                                        </Typography>
                                    )
                                })
                            }
                            {
                                website?.selectedLangCode !== website?.defaultLangCode &&
                                website?.otherLangFooter &&
                                website?.otherLangFooter[website?.selectedLangCode] &&
                                website?.otherLangFooter[website?.selectedLangCode]?.items?.length > 0 &&
                                website?.otherLangFooter[website?.selectedLangCode].items.map((footerItem, rowIndex) => {
                                    return (
                                        <Typography component={'div'} key={rowIndex} >
                                            {
                                                rowIndex !== 0 && <hr />
                                            }
                                            {
                                                footerItem?.items?.length > 0 &&
                                                footerItem.items.map((item, col) => {
                                                    return (
                                                        <Typography component={'div'} key={col} >
                                                            {
                                                                item?.value?.length > 0 && item.value.map((value, index) => {
                                                                    return (
                                                                        <Grid container justify={'center'} key={index}>
                                                                            <Grid item>
                                                                                <ul>
                                                                                    <li
                                                                                        className={mobileClasses.list}>
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'logo' &&
                                                                                            <div
                                                                                                style={{
                                                                                                    backgroundImage: `url(${
                                                                                                        GENERAL_SETTINGS.STATIC_URL + value?.value
                                                                                                    })`,
                                                                                                    backgroundSize: 'contain',
                                                                                                    backgroundRepeat: 'no-repeat',
                                                                                                    width: 100,
                                                                                                    height: 25,
                                                                                                }}
                                                                                            />
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'image' &&
                                                                                            <a href={value?.value?.link}
                                                                                               target={'_blank'}>
                                                                                                <div
                                                                                                    style={{
                                                                                                        backgroundImage: `url(${
                                                                                                            GENERAL_SETTINGS.STATIC_URL + value?.value?.image
                                                                                                        })`,
                                                                                                        backgroundSize: 'contain',
                                                                                                        backgroundRepeat: 'no-repeat',
                                                                                                        height: 100,
                                                                                                        width: 150,
                                                                                                    }}
                                                                                                />
                                                                                            </a>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'heading' &&
                                                                                            <h5 className={mobileClasses.text}>
                                                                                                {value?.value}
                                                                                                <span/>
                                                                                            </h5>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'paragraph' &&
                                                                                            <p className={desktopClasses.text}>{value?.value}</p>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'address' &&
                                                                                            <a className={desktopClasses.link}
                                                                                               href={value?.value?.value}
                                                                                               target="_blank">
                                                                                                <RoomIcon/>
                                                                                                {value?.value}
                                                                                            </a>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'phone' &&
                                                                                            <a href={`tel:${value.value}`} className={desktopClasses.link}>
                                                                                                <PhoneIcon/> {value.value} </a>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'email' &&
                                                                                            <a className={desktopClasses.link}
                                                                                               target="_blank"
                                                                                               href={`mailto:${value.value}`}>
                                                                                                <EmailIcon/> {value.value}
                                                                                            </a>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'link' &&
                                                                                            <a className={desktopClasses.link}
                                                                                               href={value.value.value}
                                                                                               target="_blank">
                                                                                                {value?.value}
                                                                                            </a>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'internal-link' &&
                                                                                            <span
                                                                                                className={desktopClasses.link}
                                                                                                onClick={() => {
                                                                                                    dispatch(updateState('website', 'pageNotFound', false))
                                                                                                    handleInternalLink(website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value)
                                                                                                }}
                                                                                            >
                                                                                                {value.value}
                                                                                            </span>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'button' &&
                                                                                            <Button
                                                                                                variant="contained"
                                                                                                size="small"
                                                                                                aria-label="add"
                                                                                                className={desktopClasses.button}
                                                                                                onClick={() => window.open(value.value.value, "_blank")}
                                                                                            >
                                                                                                {value?.value}
                                                                                            </Button>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'social-link' &&
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value?.includes('facebook.com') &&
                                                                                            <a className={desktopClasses.link}
                                                                                               title="facebook"
                                                                                               target="_blank"
                                                                                               href={website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value}>
                                                                                                {
                                                                                                    assets?.icons?.facebook ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.facebook} alt={'facebook'} className={desktopClasses.socialIcon} /> : <FacebookIcon/>
                                                                                                }
                                                                                                {value?.value}
                                                                                            </a>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'social-link' &&
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value?.includes('instagram.com') &&
                                                                                            <a className={desktopClasses.link}
                                                                                               title="instagram"
                                                                                               target="_blank"
                                                                                               href={website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value}>
                                                                                                {
                                                                                                    assets?.icons?.instagram ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.instagram} alt={'instagram'} className={desktopClasses.socialIcon} /> : <InstagramIcon/>
                                                                                                }
                                                                                                {value.value}
                                                                                            </a>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'social-link' &&
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value?.includes('github.com') &&
                                                                                            <a className={desktopClasses.link}
                                                                                               title="github"
                                                                                               target="_blank"
                                                                                               href={website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value}>
                                                                                                <GitHubIcon/> {value.value}
                                                                                            </a>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'social-link' &&
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value?.includes('twitter.com') &&
                                                                                            <a className={desktopClasses.link}
                                                                                               title="twitter"
                                                                                               target="_blank"
                                                                                               href={website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value}>
                                                                                                {
                                                                                                    assets?.icons?.twitter ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.twitter} alt={'twitter'} className={desktopClasses.socialIcon} /> : <TwitterIcon/>
                                                                                                }
                                                                                                {value.value}
                                                                                            </a>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'social-link' &&
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value?.includes('youtube.com') &&
                                                                                            <a className={desktopClasses.link}
                                                                                               title="youtube"
                                                                                               target="_blank"
                                                                                               href={website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value}>
                                                                                                <YouTubeIcon/> {value.value}
                                                                                            </a>
                                                                                        }
                                                                                        {
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.type === 'social-link' &&
                                                                                            website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value?.includes('linkedin.com') &&
                                                                                            <a className={desktopClasses.link}
                                                                                               title="linkedin"
                                                                                               target="_blank"
                                                                                               href={website?.defaultFooter?.items[rowIndex]?.items[col]?.value[index]?.value?.value}>
                                                                                                {
                                                                                                    assets?.icons?.linkedin ? <img src={GENERAL_SETTINGS.STATIC_URL + assets?.icons?.linkedin} alt={'linkedin'} className={desktopClasses.socialIcon} /> : <LinkedInIcon/>
                                                                                                }
                                                                                                {value.value}
                                                                                            </a>
                                                                                        }
                                                                                    </li>
                                                                                </ul>
                                                                            </Grid>
                                                                        </Grid>
                                                                    )
                                                                })
                                                            }
                                                        </Typography>
                                                    )
                                                })
                                            }
                                        </Typography>
                                    )
                                })
                            }
                        </>
                }
            </Typography>
        )
    }

    return (
        <Typography component={'div'}>
            {mobileView ? handleMobileView() : handleDesktopView()}
        </Typography>
    )

}

const memorizedWebsiteFooter = memo(WebsiteFooter)

export default memorizedWebsiteFooter