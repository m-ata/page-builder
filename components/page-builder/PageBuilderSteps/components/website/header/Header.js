import React, {useContext, useState, useEffect} from 'react';
import { connect } from 'react-redux';
import WebCmsGlobal from "components/webcms-global";
//material ui imports
import {Container, Grid, Button, AppBar} from '@material-ui/core';
import PhoneIcon from "@material-ui/icons/Phone";
import EmailIcon from '@material-ui/icons/Email';
import RoomIcon from '@material-ui/icons/Room';
import InstagramIcon from '@material-ui/icons/Instagram';
import FacebookIcon from "@material-ui/icons/Facebook";
import GitHubIcon from '@material-ui/icons/GitHub';
import TwitterIcon from '@material-ui/icons/Twitter';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        backgroundColor: props =>  props?.assets?.colors?.primary?.main,
        zIndex: theme.zIndex.drawer + 1
    },
    horizontalLi: {
        display: "inline-flex",
    },
    externalLink: {
        marginLeft: 24,
        color: props =>  props?.assets?.colors?.primary?.light,
        '&:hover' : {
            color: props => props?.assets?.colors?.primary?.dark,
        },
        fontSize: 15,
        fontWeight: "bold"
    },
    socialIcons: {
        color: props =>  props?.assets?.colors?.primary?.light,
        '&:hover' : {
            color: props => props?.assets?.colors?.primary?.dark,
        },
        cursor: 'pointer',
        fontSize: 35
    },
    internalLink: {
        marginLeft: 24,
        color: props =>  props?.assets?.colors?.primary?.light,
        '&:hover' : {
            color: props => props?.assets?.colors?.primary?.dark,
        },
        fontSize: 15,
        cursor: "pointer",
        fontWeight: "bold"
    },
    button: {
        borderRadius: 5,
        color: props =>  props?.assets?.colors?.button?.contrastText,
        backgroundColor: props =>  props?.assets?.colors?.button?.main,
        '&:hover' : {
            backgroundColor: props => props?.assets?.colors?.button?.dark,
        },
        marginLeft: 24,
        fontWeight: "bold",
        fontSize: 15,
    },
    text: {
        color: props =>  props?.assets?.colors?.primary?.contrastText,
        marginLeft: 8,
    },
    imagePreview: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        height: 50,
        width: 150,
        cursor: 'pointer',
    },
}));

const Header = (props) => {

    const {
        headerItems,
        state,
        handleSelectedLink
    } = props;

    const [header, setHeader] = useState('');
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);
    const desktopClasses = useStyles(state);

    const compare = (a, b) => { // sort header items with alignment
        const bandA = a.alignment;
        const bandB = b.alignment;

        let comparison = 0;
        if (bandA > bandB) {
            comparison = 1;
        } else if (bandA < bandB) {
            comparison = -1;
        }
        return comparison;
    }

    useEffect(() => {
         headerItems?.sort(compare);
    }, [headerItems, desktopClasses]);

    const handleInternalLinkClick = (link) => {
        handleSelectedLink(link);
    }

    useEffect(() => {
        setHeader(
            <Container>
                {
                    state.langCode !== state.defaultLang &&
                    headerItems?.length > 0 &&
                    headerItems.map((row, rowIndex) => {
                        return(
                            <Grid container={true} key={rowIndex} style={{marginTop: rowIndex === 0 ? 0 : -32}}>
                                {
                                    row?.items?.length > 0 && row.items.map((col, colIndex) => {
                                        let align = '';
                                        if (state.website.header &&
                                            state.website.header.items &&
                                            state.website.header.items.length > 0 &&
                                            state.website.header.items[rowIndex] &&
                                            state.website.header.items[rowIndex].items.length > 0 &&
                                            state.website.header.items[rowIndex].items[colIndex] &&
                                            state.website.header.items[rowIndex].items[colIndex].alignment === 'left') {
                                            align = 'flex-start';
                                        } else if (state.website.header &&
                                            state.website.header.items &&
                                            state.website.header.items.length > 0 &&
                                            state.website.header.items[rowIndex] &&
                                            state.website.header.items[rowIndex].items.length > 0 &&
                                            state.website.header.items[rowIndex].items[colIndex] &&
                                            state.website.header.items[rowIndex].items[colIndex].alignment === 'right') {
                                            align = 'flex-end';
                                        } else {
                                            align = 'center';
                                        }
                                        return(
                                            <Grid key={colIndex}
                                                  item={true}
                                                  style={{  width: state.website?.header?.items[rowIndex]?.items[colIndex]?.width + '%',
                                                      display: "inline-flex",
                                                      justifyContent: align,
                                                      alignItems: 'center'
                                                  }}
                                            >
                                                <ul style={{marginTop: 16}}>
                                                    {
                                                        col.value.length > 0 && col.value.map((val, i) => {
                                                            return(
                                                                <li className={desktopClasses.horizontalLi} key={i}>
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items.length > 0 &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'logo' &&
                                                                        <span onClick={() => handleInternalLinkClick(null)}>
                                                                            <img src={state.logoUrl ? GENERAL_SETTINGS.STATIC_URL + state.logoUrl : 'imgs/icons/avatar.jpg'}
                                                                                 className={desktopClasses.imagePreview}
                                                                                 alt={'logo'}
                                                                            />
                                                                        </span>
                                                                    }
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'external-link' &&
                                                                        <a className={desktopClasses.externalLink}
                                                                           target="_blank"
                                                                           href={state.website.header.items[rowIndex].items[colIndex].value[i].value.value}
                                                                        >
                                                                            {val.value}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'button' &&
                                                                        <Button
                                                                            variant="contained"
                                                                            size="small"
                                                                            aria-label="add"
                                                                            className={desktopClasses.button}
                                                                            onClick={() => window.open(`${state.website.header.items[rowIndex].items[colIndex].value[i].value.value}?lang=${state.langCode}`, '_blank')}
                                                                        >
                                                                            {val.value}
                                                                        </Button>
                                                                    }
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items.length > 0 &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'internal-link' &&
                                                                        <span className={desktopClasses.internalLink}
                                                                           target="_blank"
                                                                           onClick={() => handleInternalLinkClick(state.website.header.items[rowIndex].items[colIndex].value[i].value.value)}
                                                                        >
                                                                            {val.value}
                                                                        </span>
                                                                    }
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items.length > 0 &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'phone' &&
                                                                        <span className={desktopClasses.text}>
                                                                            <PhoneIcon className={desktopClasses.text} /> {val.value}
                                                                        </span>
                                                                    }
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items.length > 0 &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'email' &&
                                                                        <span className={desktopClasses.text}>
                                                                            <EmailIcon className={desktopClasses.text} /> {val.value}
                                                                        </span>
                                                                    }
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items.length > 0 &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'address' &&
                                                                        <a className={desktopClasses.externalLink}
                                                                           href={val.value}
                                                                        >
                                                                            <RoomIcon/> {val.value}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items.length > 0 &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'social-link' &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].value.value.includes('facebook.com') &&
                                                                        <a title="facebook"
                                                                           target="_blank"
                                                                           href={state.website.header.items[rowIndex].items[colIndex].value[i].value.value}>
                                                                            <FacebookIcon className={desktopClasses.socialIcons}/>
                                                                                {state.website.header.items[rowIndex].items[colIndex].value[i].value.title}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items.length > 0 &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'social-link' &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].value.value.includes('instagram.com') &&
                                                                        <a title="instagram"
                                                                           target="_blank"
                                                                           href={state.website.header.items[rowIndex].items[colIndex].value[i].value.value}>
                                                                            <InstagramIcon className={desktopClasses.socialIcons}/>
                                                                                {state.website.header.items[rowIndex].items[colIndex].value[i].value.title}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items.length > 0 &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'social-link' &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].value.value.includes('github.com') &&
                                                                        <a title="github"
                                                                           target="_blank"
                                                                           href={state.website.header.items[rowIndex].items[colIndex].value[i].value.value}>
                                                                            <GitHubIcon className={desktopClasses.socialIcons} />
                                                                                {state.website.header.items[rowIndex].items[colIndex].value[i].value.title}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items.length > 0 &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'social-link' &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].value.value.includes('twitter.com') &&
                                                                        <a title="twitter"
                                                                           target="_blank"
                                                                           href={state.website.header.items[rowIndex].items[colIndex].value[i].value.value}>
                                                                            <TwitterIcon className={desktopClasses.socialIcons} />
                                                                                {state.website.header.items[rowIndex].items[colIndex].value[i].value.title}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        state.website.header &&
                                                                        state.website.header.items &&
                                                                        state.website.header.items.length > 0 &&
                                                                        state.website.header.items[rowIndex] &&
                                                                        state.website.header.items[rowIndex].items.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value.length > 0 &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i] &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].type === 'social-link' &&
                                                                        state.website.header.items[rowIndex].items[colIndex].value[i].value.value.includes('linkedin.com') &&
                                                                        <a title="linkedin"
                                                                           target="_blank"
                                                                           href={state.website.header.items[rowIndex].items[colIndex].value[i].value.value}>
                                                                            <LinkedInIcon className={desktopClasses.socialIcons}/>
                                                                                {state.website.header.items[rowIndex].items[colIndex].value[i].value.title}
                                                                        </a>
                                                                    }
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </Grid>
                                        )
                                    })
                                }
                            </Grid>
                        )
                    })
                }
                {
                    state.langCode === state.defaultLang &&
                    headerItems?.length > 0 &&
                    headerItems.map((row, rowIndex) => {
                        return(
                            <Grid container={true} key={rowIndex} style={{marginTop: rowIndex === 0 ? 0 : -32}}>
                                {
                                    row?.items?.length > 0 && row.items.map((col, colIndex) => {
                                        let align = '';
                                        if (col.alignment === 'left') {
                                            align = 'flex-start';
                                        } else if (col.alignment === 'right') {
                                            align = 'flex-end';
                                        } else {
                                            align = 'center';
                                        }
                                        return(
                                            <Grid key={colIndex}
                                                  item={true}
                                                  style={{  width: col?.width + '%',
                                                            display: "inline-flex",
                                                            justifyContent: align,
                                                            alignItems: 'center'
                                                            }}
                                            >
                                                <ul style={{marginTop: 16}}>
                                                    {
                                                        col.value.length > 0 && col.value.map((val, i) => {
                                                            return(
                                                                <li
                                                                    className={desktopClasses.horizontalLi}
                                                                    key={i}>
                                                                    {
                                                                        val.type === 'logo' &&
                                                                        <span onClick={() => handleInternalLinkClick(null)}>
                                                                            <img src={state.logoUrl ? GENERAL_SETTINGS.STATIC_URL + state.logoUrl : 'imgs/icons/avatar.jpg'}
                                                                                 className={desktopClasses.imagePreview}
                                                                                 alt={'logo'}
                                                                            />
                                                                        </span>
                                                                    }
                                                                    {
                                                                        val.type === 'external-link' &&
                                                                        <a className={desktopClasses.externalLink}
                                                                           target="_blank"
                                                                           href={val.value.value}
                                                                        >
                                                                            {val.value.title}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        val.type === 'button' &&
                                                                            <Button
                                                                                variant="contained"
                                                                                size="small"
                                                                                aria-label="add"
                                                                                className={desktopClasses.button}
                                                                                onClick={() => window.open(val.value.value, '_blank')}
                                                                            >
                                                                                {val.value.title}
                                                                            </Button>
                                                                    }
                                                                    {
                                                                        val.type === 'internal-link' &&
                                                                        <span className={desktopClasses.internalLink}
                                                                           onClick={() => handleInternalLinkClick(val.value.value)}
                                                                        >
                                                                            {val.value.title}
                                                                        </span>
                                                                    }
                                                                    {
                                                                        val.type === 'phone' &&
                                                                        <span className={desktopClasses.text}>
                                                                            <PhoneIcon className={desktopClasses.text}/> {val.value}
                                                                        </span>
                                                                    }
                                                                    {
                                                                        val.type === 'email' &&
                                                                        <span className={desktopClasses.text}>
                                                                            <EmailIcon className={desktopClasses.text}/> {val.value}
                                                                        </span>
                                                                    }
                                                                    {
                                                                        val.type === 'address' &&
                                                                        <a className={desktopClasses.externalLink}
                                                                           href={val.value.value}
                                                                        >
                                                                            <RoomIcon/> {val.value.title}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        val.type === 'social-link' &&
                                                                        val.value.value.includes('facebook.com') &&
                                                                        <a
                                                                           title="facebook"
                                                                           target="_blank"
                                                                           href={val.value.value}>
                                                                            <FacebookIcon className={desktopClasses.socialIcons} /> {val.value.title}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        val.type === 'social-link' &&
                                                                        val.value.value.includes('instagram.com') &&
                                                                        <a
                                                                           title="instagram"
                                                                           target="_blank"
                                                                           href={val.value.value}>
                                                                            <InstagramIcon className={desktopClasses.socialIcons} /> {val.value.title}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        val.type === 'social-link' &&
                                                                        val.value.value.includes('github.com') &&
                                                                        <a
                                                                           title="github"
                                                                           target="_blank"
                                                                           href={val.value.value}>
                                                                            <GitHubIcon className={desktopClasses.socialIcons} /> {val.value.title}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        val.type === 'social-link' &&
                                                                        val.value.value.includes('twitter.com') &&
                                                                        <a
                                                                           title="twitter"
                                                                           target="_blank"
                                                                           href={val.value.value}>
                                                                            <TwitterIcon className={desktopClasses.socialIcons} /> {val.value.title}
                                                                        </a>
                                                                    }
                                                                    {
                                                                        val.type === 'social-link' &&
                                                                        val.value.value.includes('linkedin.com') &&
                                                                        <a
                                                                           title="linkedin"
                                                                           target="_blank"
                                                                           href={val.value.value}>
                                                                            <LinkedInIcon className={desktopClasses.socialIcons} /> {val.value.title}
                                                                        </a>
                                                                    }
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </Grid>
                                        )
                                    })
                                }
                            </Grid>
                        )
                    })
                }
            </Container>
        )
    }, [headerItems]);

    return(
        <AppBar position="static" className={desktopClasses.root} >
            {
                header
            }
        </AppBar>
    )
};

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

export default connect(
    mapStateToProps
)(Header);