import React, {useState, useEffect, useContext} from 'react';
import {connect} from 'react-redux';
import {Col, Container, Row} from "react-bootstrap";
import Button from "@material-ui/core/Button";
import FacebookIcon from '@material-ui/icons/Facebook';
import YouTubeIcon from '@material-ui/icons/YouTube';
import TwitterIcon from '@material-ui/icons/Twitter';
import InstagramIcon from '@material-ui/icons/Instagram';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import GitHubIcon from '@material-ui/icons/GitHub';
import RoomIcon from '@material-ui/icons/Room';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import WebCmsGlobal from "../../../../../webcms-global";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    link: {
        color: props => props?.colors?.secondary?.light,
        '&:hover' : {
            color: props => props?.colors?.secondary?.dark,
        },
        cursor: "pointer"
    },
    button: {
        backgroundColor: props => props?.colors?.button?.main,
        borderRadius: 5
    },
    text: {
        color: props => props?.colors?.secondary?.contrastText,
        '& span' : {
            display: 'block',
            height: 1,
            marginTop: 10,
            marginBottom: 10,
            position: 'relative',
            width: '50%',
            background: props => props?.colors?.secondary?.contrastText
        }
    },
    socialIcon: {
        width: 30,
        height: 30
    }
}))

const Footer = (props) => {

    const {
        footerItems,
        state,
        handleSelectedLink
    } = props

    const [footer, setFooter] = useState('');
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);
    const classes = useStyles({colors: state?.assets?.colors});

    const handleInternalLinkClick = (link) => {
        handleSelectedLink(link);
    }

    useEffect(() => {
        if (footerItems?.length > 0) {
            setFooter(
                <Container>
                    {
                        state.langCode !== state.defaultLang &&
                        footerItems.length > 0 &&
                        footerItems.map((footerItem, row) => {
                            return(
                                <Row key={row} style={{marginTop: row === 0 ? 0 : -48}}>
                                    {
                                        footerItem.items.length > 0 && footerItem.items.map((item, col) => {
                                            const isItemExist = Object.keys(state.website.footer).length > 0 &&
                                                state.website.footer.items.length > 0 &&
                                                state.website.footer.items[row] &&
                                                state.website.footer.items[row].items.length > 0 &&
                                                state.website.footer.items[row].items[col];
                                            let align = '';
                                            if (isItemExist && state.website.footer.items[row].items[col].alignment === 'left') {
                                                align = 'flex-start';
                                            } else if (isItemExist && state.website.footer.items[row].items[col].alignment === 'right') {
                                                align = 'flex-end';
                                            } else {
                                                align = 'center';
                                            }
                                            return(
                                                <Col key={col}>
                                                    <div className="widget no-box" style={{
                                                        display: 'flex',
                                                        justifyContent: align,
                                                    }}>
                                                        <ul className="thumbnail-widget">
                                                            {
                                                                item.value.length > 0 && item.value.map((value, index) => {
                                                                    const isValueExist = Object.keys(state.website.footer).length > 0 &&
                                                                        state.website.footer.items.length > 0 &&
                                                                        state.website.footer.items[row] &&
                                                                        state.website.footer.items[row].items.length > 0 &&
                                                                        state.website.footer.items[row].items[col] &&
                                                                        state.website.footer.items[row].items[col].value.length > 0 &&
                                                                        state.website.footer.items[row].items[col].value[index];
                                                                    return (
                                                                        <li key={index}
                                                                            className={isValueExist &&
                                                                            state.website.footer.items[row].items[col].value[index].type === 'social-link' &&
                                                                            !state.website.footer.items[row].items[col].value[index].value.title ? 'horizontal-li' : ''}>
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'logo' &&
                                                                                <div
                                                                                    style={{
                                                                                        backgroundImage: `url(${
                                                                                            GENERAL_SETTINGS.STATIC_URL + state.altLogoUrl
                                                                                        })`,
                                                                                        backgroundSize: 'contain',
                                                                                        backgroundRepeat: 'no-repeat',
                                                                                        height: 100,
                                                                                        width: 200,
                                                                                        marginTop: 16,
                                                                                        cursor: 'pointer'
                                                                                    }}
                                                                                    onClick={() => handleInternalLinkClick(null)}
                                                                                ></div>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'image' &&
                                                                                <a href={state.website.footer?.items[row]?.items[col]?.value[index]?.value?.link} target={"_blank"}>
                                                                                    <div
                                                                                        style={{
                                                                                            backgroundImage: `url(${
                                                                                                GENERAL_SETTINGS.STATIC_URL + state.website.footer?.items[row]?.items[col]?.value[index]?.value?.image
                                                                                            })`,
                                                                                            backgroundSize: 'contain',
                                                                                            backgroundRepeat: 'no-repeat',
                                                                                            height: 100,
                                                                                            width: 200,
                                                                                        }}
                                                                                    ></div>
                                                                                </a>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'heading' &&
                                                                                <h5 className={classes.text}>
                                                                                    {
                                                                                        value.value
                                                                                    }
                                                                                    <span></span>
                                                                                </h5>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'paragraph' &&
                                                                                <p className={classes.text}>{value.value}</p>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'address' &&
                                                                                <a
                                                                                    className={classes.link}
                                                                                    href={state.website.footer.items[row].items[col].value[index].value.value}
                                                                                    target="_blank">
                                                                                    <RoomIcon/>
                                                                                    {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'phone' &&
                                                                                <p className={classes.link}>
                                                                                    <PhoneIcon/> {value.value} </p>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'email' &&
                                                                                <a className={classes.link}
                                                                                   target="_blank"
                                                                                   href={`mailto:${value.value}`}>
                                                                                    <EmailIcon/> {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'link' &&
                                                                                <div>
                                                                                    <a className={classes.link}
                                                                                       href={state.website.footer.items[row].items[col].value[index].value.value}
                                                                                       target="_blank">
                                                                                        {value.value}
                                                                                    </a>
                                                                                </div>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'internal-link' &&
                                                                                <div>
                                                                                    <span className={classes.link} onClick={() => handleInternalLinkClick(value.value.value)}>
                                                                                        {value.value}
                                                                                    </span>
                                                                                </div>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'button' &&
                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    aria-label="add"
                                                                                    className={classes.button}
                                                                                    onClick={() => window.open(state.website.footer.items[row].items[col].value[index].value.value, "_blank")}
                                                                                >
                                                                                    {value.value}
                                                                                </Button>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'social-link' &&
                                                                                state.website.footer.items[row].items[col].value[index].value.value.includes('facebook.com') &&
                                                                                <a className={classes.link}
                                                                                   title="facebook"
                                                                                   target="_blank"
                                                                                   href={state.website.footer.items[row].items[col].value[index].value.value}>
                                                                                    {
                                                                                        state.facebookIconUrl ? <img src={GENERAL_SETTINGS.STATIC_URL + state.facebookIconUrl}alt={'facebook'} className={classes.socialIcon} /> : <FacebookIcon/>
                                                                                    }
                                                                                    {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'social-link' &&
                                                                                state.website.footer.items[row].items[col].value[index].value.value.includes('instagram.com') &&
                                                                                <a className={classes.link}
                                                                                   title="instagram"
                                                                                   target="_blank"
                                                                                   href={state.website.footer.items[row].items[col].value[index].value.value}>
                                                                                    {
                                                                                        state.instagramIconUrl ? <img src={GENERAL_SETTINGS.STATIC_URL + state.instagramIconUrl} alt={'instagram'} className={classes.socialIcon} /> : <InstagramIcon/>
                                                                                    }
                                                                                    {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'social-link' &&
                                                                                state.website.footer.items[row].items[col].value[index].value.value.includes('github.com') &&
                                                                                <a className={classes.link}
                                                                                   title="github"
                                                                                   target="_blank"
                                                                                   href={state.website.footer.items[row].items[col].value[index].value.value}>
                                                                                    <GitHubIcon/> {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'social-link' &&
                                                                                state.website.footer.items[row].items[col].value[index].value.value.includes('twitter.com') &&
                                                                                <a className={classes.link}
                                                                                   title="twitter"
                                                                                   target="_blank"
                                                                                   href={state.website.footer.items[row].items[col].value[index].value.value}>
                                                                                    {
                                                                                        state.twitterIconUrl ? <img src={GENERAL_SETTINGS.STATIC_URL + state.twitterIconUrl} alt={'twitter'} className={classes.socialIcon} /> : <TwitterIcon/>
                                                                                    }
                                                                                    {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'social-link' &&
                                                                                state.website.footer.items[row].items[col].value[index].value.value.includes('youtube.com') &&
                                                                                <a className={classes.link}
                                                                                   title="youtube"
                                                                                   target="_blank"
                                                                                   href={state.website.footer.items[row].items[col].value[index].value.value}>
                                                                                    <YouTubeIcon/> {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                isValueExist &&
                                                                                state.website.footer.items[row].items[col].value[index].type === 'social-link' &&
                                                                                state.website.footer.items[row].items[col].value[index].value.value.includes('linkedin.com') &&
                                                                                <a className={classes.link}
                                                                                   title="linkedin"
                                                                                   target="_blank"
                                                                                   href={state.website.footer.items[row].items[col].value[index].value.value}>
                                                                                    {
                                                                                        state.linkedinIconUrl ? <img src={GENERAL_SETTINGS.STATIC_URL + state.linkedinIconUrl} alt={'linkedin'} className={classes.socialIcon} /> : <LinkedInIcon/>
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
                        state.langCode === state.defaultLang &&
                        footerItems.length > 0 && footerItems.map((footerItem, row) => {
                            return (
                                <Row key={row} style={{marginTop: row === 0 ? 0 : -48}}>
                                    {
                                        footerItem.items.length > 0 && footerItem.items.map((item, col) => {
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
                                                        <ul className="thumbnail-widget">
                                                            {
                                                                item.value.length > 0 && item.value.map((value, index) => {
                                                                    return (
                                                                        <li key={index}
                                                                            className={value.type === 'social-link' && !value.value.title ? 'horizontal-li' : ''}>
                                                                            {
                                                                                value.type === 'logo' &&
                                                                                <div
                                                                                    style={{
                                                                                        backgroundImage: `url(${
                                                                                            GENERAL_SETTINGS.STATIC_URL + state.altLogoUrl
                                                                                        })`,
                                                                                        backgroundSize: 'contain',
                                                                                        backgroundRepeat: 'no-repeat',
                                                                                        height: 100,
                                                                                        width: 200,
                                                                                        marginTop: 16,
                                                                                        cursor: 'pointer'
                                                                                    }}
                                                                                    onClick={() => handleInternalLinkClick(null)}
                                                                                ></div>
                                                                            }
                                                                            {
                                                                                value.type === 'image' &&
                                                                                <a href={value?.value?.link} target={'_blank'}>
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
                                                                                    ></div>
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'heading' &&
                                                                                <h5 className={classes.text}>
                                                                                    {
                                                                                        value.value
                                                                                    }
                                                                                    <span></span>
                                                                                </h5>
                                                                            }
                                                                            {
                                                                                value.type === 'paragraph' &&
                                                                                <p className={classes.text}>
                                                                                    {value.value}
                                                                                </p>
                                                                            }
                                                                            {
                                                                                value.type === 'address' &&
                                                                                <a
                                                                                    className={classes.link}
                                                                                    href={value.value.value}
                                                                                    target="_blank">
                                                                                    <RoomIcon/>
                                                                                    {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'phone' &&
                                                                                <p className={classes.link}>
                                                                                    <PhoneIcon/> {value.value} </p>
                                                                            }
                                                                            {
                                                                                value.type === 'email' &&
                                                                                <a className={classes.link}
                                                                                   target="_blank"
                                                                                   href={`mailto:${value.value}`}>
                                                                                    <EmailIcon/> {value.value}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'link' &&
                                                                                <a
                                                                                    className={classes.link}
                                                                                    href={value.value.value}
                                                                                    target="_blank">
                                                                                    {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'internal-link' &&
                                                                                <span className={classes.link} onClick={() => handleInternalLinkClick(value.value.value)}>
                                                                                    {value.value.title}
                                                                                </span>
                                                                            }
                                                                            {
                                                                                value.type === 'button' &&
                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    aria-label="add"
                                                                                    className={classes.button}
                                                                                    onClick={() => window.open(value.value.value, "_blank")}
                                                                                >
                                                                                    {value.value.title}
                                                                                </Button>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('facebook.com') &&
                                                                                <a className={classes.link}
                                                                                   title="facebook"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>
                                                                                    {
                                                                                        state.facebookIconUrl ? <img src={GENERAL_SETTINGS.STATIC_URL + state.facebookIconUrl}alt={'facebook'} className={classes.socialIcon} /> : <FacebookIcon/>
                                                                                    }
                                                                                     {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('instagram.com') &&
                                                                                <a className={classes.link}
                                                                                   title="instagram"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>
                                                                                    {
                                                                                        state.instagramIconUrl ? <img src={GENERAL_SETTINGS.STATIC_URL + state.instagramIconUrl} alt={'instagram'} className={classes.socialIcon} /> : <InstagramIcon/>
                                                                                    }
                                                                                    {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('github.com') &&
                                                                                <a className={classes.link}
                                                                                   title="github"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>

                                                                                    <GitHubIcon/> {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('twitter.com') &&
                                                                                <a className={classes.link}
                                                                                   title="twitter"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>
                                                                                    {
                                                                                        state.twitterIconUrl ? <img src={GENERAL_SETTINGS.STATIC_URL + state.twitterIconUrl} alt={'twitter'} className={classes.socialIcon} /> : <TwitterIcon/>
                                                                                    }
                                                                                    {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('youtube.com') &&
                                                                                <a className={classes.link}
                                                                                   title="youtube"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>
                                                                                    <YouTubeIcon/> {value.value.title}
                                                                                </a>
                                                                            }
                                                                            {
                                                                                value.type === 'social-link' &&
                                                                                value.value.value.includes('linkedin.com') &&
                                                                                <a className={classes.link}
                                                                                   title="linkedin"
                                                                                   target="_blank"
                                                                                   href={value.value.value}>
                                                                                    {
                                                                                        state.linkedinIconUrl ? <img src={GENERAL_SETTINGS.STATIC_URL + state.linkedinIconUrl} alt={'linkedin'} className={classes.socialIcon} /> : <LinkedInIcon/>
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
    }, [footerItems, classes]);

    return (
        <div style={{backgroundColor: state?.assets?.colors?.secondary?.main, padding: 20}}>
            {
                footer
            }
        </div>
    )
};

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

export default connect(
    mapStateToProps
)(Footer);