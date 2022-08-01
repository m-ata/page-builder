import React, {useContext, useState, useEffect} from 'react';
import { connect } from 'react-redux';
import WebCmsGlobal from "components/webcms-global";
//import from material ui
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    link: {
        color: props =>  props?.assets?.colors?.primary?.light,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8
    },
    button: {
        color: props =>  props?.assets?.colors?.button?.contrastText,
        backgroundColor: props => props?.assets?.colors?.button?.main,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
        borderRadius: 10,
        marginLeft: 8
    }
}))

const HeaderTemplates = (props) => {

    const { state, onSelectHeader } = props;
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);
    const [headerTemplates, setHeaderTemplates] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const classes = useStyles(state);

    useEffect(() => {
        setHeaderTemplates([
            {
                tpl: 'header-1',
                items: [
                    {
                        id: 'row-1',
                        items: [
                            {
                                id: 'item-1',
                                alignment: 'right',
                                width: 100,
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'social-link',
                                        value: {
                                            title: '',
                                            value: 'https://www.facebook.com/HotechEco'
                                        }
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'social-link',
                                        value: {
                                            title: '',
                                            value: 'https://twitter.com/Hotech_Official'
                                        }
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'social-link',
                                        value: {
                                            title: '',
                                            value: 'https://www.linkedin.com/company/hotech-software'
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'row-2',
                        items: [
                            {
                                id: 'item-1',
                                alignment: 'left',
                                width: 30,
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'logo',
                                        value: state.logoUrl
                                    }
                                ]
                            },
                            {
                                id: 'item-2',
                                alignment: 'right',
                                width: 70,
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'external-link',
                                        value: {
                                            title: 'Home',
                                            value: 'https://hotech.com.tr/'
                                        }
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'external-link',
                                        value: {
                                            title: 'Support',
                                            value: 'https://hotech.com.tr/support'
                                        }
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'external-link',
                                        value: {
                                            title: 'Contact Us',
                                            value: 'https://hotech.com.tr/contact-us'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
                value: <Container >
                    <Grid container={true} spacing={3}>
                        <Grid item={true}
                              xs={12}
                              style={{display: "flex",
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                              }}
                        >
                            <ul style={{marginTop: 16}}>
                                <li className={'horizontal-li'} style={{marginLeft: 8}}>
                                    <a
                                        style={{color: state?.assets?.colors?.primary?.light}}
                                        title="facebook"
                                        target="_blank"
                                        href="https://www.facebook.com/HotechEco">
                                        <FacebookIcon/>
                                    </a>
                                </li>
                                <li className={'horizontal-li'} style={{marginLeft: 8}}>
                                    <a style={{color: state?.assets?.colors?.primary?.light}}
                                       href="https://twitter.com/Hotech_Official"
                                       target="_blank"
                                       title="twitter"
                                    >
                                        <TwitterIcon/>
                                    </a>
                                </li>
                                <li className={'horizontal-li'} style={{marginLeft: 8}}>
                                    <a style={{color: state?.assets?.colors?.primary?.light}}
                                       title="linkedin"
                                       target="_blank"
                                       href="https://www.linkedin.com/company/hotech-software"
                                    >
                                        <LinkedInIcon/>
                                    </a>
                                </li>
                            </ul>
                        </Grid>
                    </Grid>
                    <Grid container={true} spacing={3} style={{marginTop: -40}}>
                        <Grid item={true} xs={6}
                              style={{display: "flex",
                                  justifyContent: "flex-start",
                                  alignItems: "center",
                                  marginBottom: 16
                              }}
                        >
                            <a target="_blank"
                               href={GENERAL_SETTINGS.STATIC_URL + state.logoUrl}>
                                <img alt={'logo'} src={state.logoUrl ? GENERAL_SETTINGS.STATIC_URL + state.logoUrl : 'imgs/icons/avatar.jpg'}
                                     style={{
                                         backgroundSize: 'contain',
                                         backgroundRepeat: 'no-repeat',
                                         height: 50,
                                         width: 100,
                                     }}
                                />
                            </a>
                        </Grid>
                        <Grid
                            item={true}
                            xs={6}
                            style={{display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center"
                            }}>
                            <ul>
                                <li className={'horizontal-li'} style={{marginLeft: 8}}>
                                    <a className={classes.link}
                                       target="_blank"
                                       href="https://hotech.com.tr/"
                                    >
                                        Home
                                    </a>
                                </li>
                                <li className={'horizontal-li'} style={{marginLeft: 8}}>
                                    <a className={classes.link}
                                       href="https://hotech.com.tr/support"
                                       target="_blank"
                                    >
                                        Support
                                    </a>
                                </li>
                                <li className={'horizontal-li'} style={{marginLeft: 8}}>
                                    <a className={classes.link}
                                       target="_blank"
                                       href="https://hotech.com.tr/contact-us"
                                    >
                                        Contact Us
                                    </a>
                                </li>
                            </ul>
                        </Grid>
                    </Grid>
                </Container>
            },
            {
                tpl: 'header-2',
                items: [
                    {
                        id: 'row-1',
                        items: [
                            {
                                id: 'item-1',
                                alignment: 'right',
                                width: 100,
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'phone',
                                        value: '+905372234244'
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'email',
                                        value: 'example@hotech.systems'
                                    },
                                ]
                            }
                        ]
                    },
                    {
                        id: 'row-2',
                        items: [
                            {
                                id: 'item-1',
                                alignment: 'left',
                                width: 30,
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'logo',
                                        value: state.logoUrl
                                    }
                                ]
                            },
                            {
                                id: 'item-2',
                                alignment: 'right',
                                width: 70,
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'external-link',
                                        value: {
                                            title: 'Home',
                                            value: 'https://hotech.com.tr/'
                                        }
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'external-link',
                                        value: {
                                            title: 'Support',
                                            value: 'https://hotech.com.tr/support'
                                        }
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'button',
                                        value: {
                                            title: 'Contact Us',
                                            value: 'https://hotech.com.tr/contact-us'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
                value: <Container>
                    <Grid container={true} spacing={3}>
                        <Grid item={true}
                              xs={12}
                              style={{display: "flex",
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                              }}
                        >
                            <ul style={{marginTop: 16}}>
                                <li className={'horizontal-li'} style={{marginLeft: 8}}>
                                    <a style={{color: state?.assets?.colors?.primary?.contrastText}}>
                                        <PhoneIcon/> +905372234244
                                    </a>
                                </li>
                                <li className={'horizontal-li'} style={{marginLeft: 8}}>
                                    <a style={{color: state?.assets?.colors?.primary?.contrastText}} >
                                        <EmailIcon/> example@hotech.systems
                                    </a>
                                </li>
                            </ul>
                        </Grid>
                    </Grid>
                    <Grid container={true} spacing={3} style={{marginTop: -40}}>
                        <Grid item={true} xs={6}
                              style={{display: "flex",
                                  justifyContent: "flex-start",
                                  alignItems: "center",
                                  marginBottom: 16
                              }}
                        >
                            <a target="_blank"
                               href={GENERAL_SETTINGS.STATIC_URL + state.logoUrl}>
                                <img alt={'logo'} src={state.logoUrl ? GENERAL_SETTINGS.STATIC_URL + state.logoUrl : 'imgs/icons/avatar.jpg'}
                                     style={{
                                         backgroundSize: 'contain',
                                         backgroundRepeat: 'no-repeat',
                                         height: 50,
                                         width: 100,
                                     }}
                                />
                            </a>
                        </Grid>
                        <Grid
                            item={true}
                            xs={6}
                            style={{display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center"
                            }}>
                            <ul>
                                <li className={'horizontal-li'} style={{marginLeft: 8}}>
                                    <a className={classes.link}
                                       target="_blank"
                                       href="https://hotech.com.tr/"
                                    >
                                        Home
                                    </a>
                                </li>
                                <li className={'horizontal-li'} style={{marginLeft: 8}}>
                                    <a className={classes.link}
                                       href="https://hotech.com.tr/support"
                                       target="_blank"
                                    >
                                        Support
                                    </a>
                                </li>
                                <li className={'horizontal-li'} style={{marginLeft: 8}}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        aria-label="add"
                                        className={classes.button}
                                    >
                                        Contact Us
                                    </Button>
                                </li>
                            </ul>
                        </Grid>
                    </Grid>
                </Container>
            },
            {
                tpl: 'header-3',
                items: [
                    {
                        id: 'row-1',
                        items: [
                            {
                                id: 'item-1',
                                alignment: 'left',
                                width: 20,
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'logo',
                                        value: state.logoUrl
                                    }
                                ]
                            },
                            {
                                id: 'item-2',
                                alignment: 'right',
                                width: 80,
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'external-link',
                                        value: {
                                            title: 'Home',
                                            value: 'https://hotech.com.tr/'
                                        }
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'external-link',
                                        value: {
                                            title: 'Support',
                                            value: 'https://hotech.com.tr/support'
                                        }
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'external-link',
                                        value: {
                                            title: 'Contact Us',
                                            value: 'https://hotech.com.tr/contact-us'
                                        }
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'button',
                                        value: {
                                            title: 'Register',
                                            value: 'https://hotech.com.tr/contact-us'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
                value: <Container>
                    <Grid container={true} >
                        <Grid item={true} xs={2}>
                            <a target="_blank"
                               href={GENERAL_SETTINGS.STATIC_URL + state.logoUrl}>
                                <img alt={'logo'} src={state.logoUrl ? GENERAL_SETTINGS.STATIC_URL + state.logoUrl : 'imgs/icons/avatar.jpg'}
                                     style={{
                                         backgroundSize: 'contain',
                                         backgroundRepeat: 'no-repeat',
                                         height: 50,
                                         width: 100,
                                         marginTop: 24
                                     }}
                                />
                            </a>
                        </Grid>
                        <Grid item={true} xs={10} >
                            <ul style={{float: 'right', marginTop: 32}}
                                // style={{display: "flex", width: '70%', justifyContent: "space-between", flexFlow: 'row wrap', alignItems: "center"}}
                            >
                                <li className={'horizontal-li'} >
                                    <a className={classes.link}
                                       target="_blank"
                                       href="https://hotech.com.tr/"
                                    >
                                        Home
                                    </a>
                                </li>
                                <li className={'horizontal-li'}>
                                    <a className={classes.link}
                                       href="https://hotech.com.tr/support"
                                       target="_blank"
                                    >
                                        Support
                                    </a>
                                </li>
                                <li className={'horizontal-li'} >
                                    <a className={classes.link}
                                       target="_blank"
                                       href="https://hotech.com.tr/contact-us"
                                    >
                                        Contact Us
                                    </a>
                                </li>
                                <li className={'horizontal-li'} style={{marginTop: 24}}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        aria-label="add"
                                        className={classes.button}
                                    >
                                        Register
                                    </Button>
                                </li>
                            </ul>
                        </Grid>
                    </Grid>
                </Container>
            },
        ]);
    }, []);

    const handleClick = (index) => {
        setSelectedIndex(index);
        onSelectHeader({
            tpl: headerTemplates[index].tpl,
            items: headerTemplates[index].items
        });
    };

    return(
        <React.Fragment>
            {
                headerTemplates.map((each, index) => {
                    return (
                        <div
                            key={index}
                            onClick={() => handleClick(index)}
                            style={{cursor: 'pointer',
                                border: selectedIndex === index ? '3px solid red' : '3px solid silver',
                                marginTop: 8,
                                backgroundColor: state?.assets?.colors?.primary?.main,
                                minHeight: 100
                            }}
                        >
                            <div style={{pointerEvents: 'none'}}>
                                {each.value}
                            </div>
                        </div>
                    )
                })
            }
        </React.Fragment>
    )
};

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

export default connect(
    mapStateToProps
)(HeaderTemplates);