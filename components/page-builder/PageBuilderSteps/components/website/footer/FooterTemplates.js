import React, {useContext, useEffect, useState} from 'react';
import { connect } from 'react-redux';
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import InstagramIcon from '@material-ui/icons/Instagram';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import { Container, Row, Col } from 'react-bootstrap';
import WebCmsGlobal from "../../../../../webcms-global";
import RoomIcon from "@material-ui/icons/Room";
import PhoneIcon from "@material-ui/icons/Phone";
import EmailIcon from "@material-ui/icons/Email";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    link: {
        color: props => props.colors.secondary.light,
        '&:hover' : {
            color: props => props.colors.secondary.dark,
        }
    },
    button: {
        backgroundColor: props => props.colors.button.main,
        borderRadius: 20
    },
    text: {
        color: props => props.colors.secondary.contrastText,
        '& span' : {
            display: 'block',
            height: 1,
            marginTop: 10,
            marginBottom: 10,
            position: 'relative',
            width: '50%',
            background: props => props.colors.secondary.contrastText
        }
    }
}))

const FooterTemplates = (props) => {

    //local states
    const { state, onSelectedFooter } = props;
    const [footerTemplates, setFooterTemplate] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const classes = useStyles({colors: state?.assets?.colors});

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);

    const footerStyle = {
        link: {
            color: state?.assets?.colors?.secondary?.contrastText
        },
        buttonStyle: {
            backgroundColor: state?.assets?.colors?.button?.main,
            borderRadius: 20
        },
        paragraphStyle: {
            color: state?.assets?.colors?.secondary?.color3
        }
    }

    useEffect(() => {
        setFooterTemplate([
            {
                tpl: 'footer-1',
                items: [
                    {
                        id: 'row-1',
                        items: [
                            {
                                id: 'item-1',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'logo',
                                        value: state.altLogoUrl
                                    }
                                ]
                            },
                            {
                                id: 'item-2',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'heading',
                                        value: 'Our Services'
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'link',
                                        value: {
                                            title: 'Vima Hotel',
                                            value: 'https://hotech.com.tr/'
                                        }
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'link',
                                        value: {
                                            title: 'IBE',
                                            value: 'https://hotech.com.tr/'
                                        }
                                    },
                                    {
                                        id: 'value-4',
                                        type: 'link',
                                        value: {
                                            title: 'QM',
                                            value: 'https://hotech.com.tr/'
                                        }
                                    },
                                ]
                            },
                            {
                                id: 'item-3',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'heading',
                                        value: 'ADDRESS'
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'address',
                                        value: {
                                            title: 'Akdeniz Univ. Campus Technopolis R&D 3 Building No: 758/2 Kat. 1 Konyaalti / ANTALYA',
                                            value: 'https://www.google.com/maps/d/viewer?msa=0&mid=1WHIJ5to-okN-Fqywzlr7poqFyLQ&ll=36.89746899999999%2C30.66511600000002&z=17'
                                        }
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'address',
                                        value: {
                                            title: 'Hacımimi Mah. Bogazkesen Cad. No: 23 Kat: 2 Beyoğlu / ISTANBUL',
                                            value: 'https://www.google.com/maps/d/viewer?msa=0&mid=1WHIJ5to-okN-Fqywzlr7poqFyLQ&ll=41.0278149%2C28.980121999999987&z=18'
                                        }
                                    },
                                    {
                                        id: 'value-4',
                                        type: 'address',
                                        value: {
                                            title: 'Prinzessinenstr. 14-18 10969 Berlin / GERMANY',
                                            value: 'https://www.google.com/maps/place/Prinzessinnenstra%C3%9Fe+14,+10969+Berlin,+Germany/@52.5026178,13.4108556,17z/data=!3m1!4b1!4m5!3m4!1s0x47a84e2dec027435:0x32bd6a2be77fe5be!8m2!3d52.5026178!4d13.4130443'
                                        }
                                    },
                                    {
                                        id: 'value-4',
                                        type: 'address',
                                        value: {
                                            title: 'Av. Uxmal # 39 Smz. 3 Cancun, Quintana Roo. 77500 MEXICO',
                                            value: 'https://www.google.com/maps/place/Centro+De+Env%C3%ADo+FedEx+Express+Uxmal/@21.1632161,-86.8270387,17z/data=!3m1!4b1!4m5!3m4!1s0x8f4c2c010f4262cf:0x93202f5963b10f35!8m2!3d21.1632161!4d-86.82485'
                                        }
                                    },
                                ]
                            },
                            {
                                id: 'item-4',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'heading',
                                        value: 'Contact Us'
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'phone',
                                        value: '+905375642134'
                                    },
                                    {
                                        id: 'value-3',
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
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'paragraph',
                                        value: 'PRIVACY POLICY'
                                    }
                                ]
                            },
                            {
                                id: 'item-2',
                                alignment: 'right',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'social-link',
                                        value: {
                                            title: '',
                                            value: 'https://www.facebook.com/'
                                        }
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'social-link',
                                        value: {
                                            title: '',
                                            value: 'https://twitter.com'
                                        }
                                    },
                                    {
                                        id: 'value-4',
                                        type: 'social-link',
                                        value: {
                                            title: '',
                                            value: 'https://www.instagram.com/'
                                        }
                                    },
                                    {
                                        id: 'value-5',
                                        type: 'social-link',
                                        value: {
                                            title: '',
                                            value: 'https://www.linkedin.com/'
                                        }
                                    },
                                ]
                            },
                        ]
                    }],
                value: <Container>
                    <Row>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <div
                                            style={{
                                                backgroundImage: `url(${
                                                    GENERAL_SETTINGS.STATIC_URL + state.altLogoUrl
                                                })`,
                                                backgroundSize: 'contain',
                                                backgroundRepeat: 'no-repeat',
                                                height: 300,
                                                marginTop: 16
                                            }}
                                        ></div>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <h5 className={classes.text}>
                                            Our Services
                                            <span></span>
                                        </h5>
                                    </li>
                                    <li>
                                        <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                            Vima Hotel
                                        </a>
                                    </li>
                                    <li>
                                        <div className="thumb-content">
                                            <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                                IBE
                                            </a>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="thumb-content">
                                            <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                                QM
                                            </a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <h5 className={classes.text}>
                                            ADDRESS
                                            <span></span>
                                        </h5>
                                    </li>
                                    <li>
                                        <div className="thumb-content">
                                            <p className={classes.link}>
                                                <RoomIcon/> Akdeniz Univ. Campus Technopolis R&D 3 Building No: 758/2 Kat. 1 Konyaalti / ANTALYA
                                            </p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="thumb-content">
                                            <p className={classes.link}>
                                                <RoomIcon/>  Hacımimi Mah. Bogazkesen Cad. No: 23 Kat: 2 Beyoğlu / ISTANBUL
                                            </p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="thumb-content">
                                            <p className={classes.link}>
                                                <RoomIcon/>  Prinzessinenstr. 14-18 10969 Berlin / GERMANY
                                            </p>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="thumb-content">
                                            <p className={classes.link}>
                                                <RoomIcon/> Av. Uxmal # 39 Smz. 3 Cancun, Quintana Roo. 77500 MEXICO
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <h5 className={classes.text}>
                                            Contact Us
                                            <span></span>
                                        </h5>
                                    </li>
                                    <li>
                                        <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                            <PhoneIcon/> +905375642134
                                        </a>
                                    </li>
                                    <li>
                                        <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                            <EmailIcon/> example@hotech.systems
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                    <Row style={{marginTop: -40}}>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <p className={classes.text}>
                                            PRIVACY POLICY
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col>
                            <div className="widget no-box" style={{float: 'right'}}>
                                <ul className="thumbnail-widget">
                                    <li className={'horizontal-li'}>
                                        <a className={classes.link} title="facebook" target="_blank"
                                           href="https://www.facebook.com/">
                                            <FacebookIcon/>
                                        </a>
                                    </li>
                                    <li className={'horizontal-li'}>
                                        <a className={classes.link}  title="twitter" target="_blank"
                                           href="https://twitter.com">
                                            <TwitterIcon/>
                                        </a>
                                    </li>
                                    <li className={'horizontal-li'}>
                                        <a className={classes.link}  title="instagram" target="_blank"
                                           href="https://www.instagram.com/">
                                            <InstagramIcon/>
                                        </a>
                                    </li>
                                    <li className={'horizontal-li'}>
                                        <a className={classes.link} title="linkedin" target="_blank"
                                           href="https://www.linkedin.com/">
                                            <LinkedInIcon/>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                </Container>
            },
            {
                tpl: 'footer-2',
                items: [
                    {
                        id: 'row-1',
                        items: [
                            {
                                id: 'item-2',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'heading',
                                        value: 'Our Services'
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'link',
                                        value: {
                                            title: 'OTELLO',
                                            value: 'https://beta.hotech.systems/otello/#tstranslist'
                                        }
                                    },
                                    {
                                        id: 'value-4',
                                        type: 'button',
                                        value: {
                                            title: 'Register Now',
                                            value: 'https://portal.hotech.systems/hup'
                                        }
                                    },
                                ]
                            },
                            {
                                id: 'item-2',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'heading',
                                        value: 'ANTALYA'
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'address',
                                        value: {
                                            title: 'Akdeniz Univ. Campus Technopolis R&D 3 Building No: 758/2 Kat. 1 Konyaalti / ANTALYA',
                                            value: 'https://www.google.com/maps/d/viewer?msa=0&mid=1WHIJ5to-okN-Fqywzlr7poqFyLQ&ll=36.89746899999999%2C30.66511600000002&z=17'
                                        }
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'heading',
                                        value: 'ISTANBUL'
                                    },
                                    {
                                        id: 'value-4',
                                        type: 'address',
                                        value: {
                                            title: 'Hacımimi Mah. Bogazkesen Cad. No: 23 Kat: 2 Beyoğlu / ISTANBUL',
                                            value: 'https://www.google.com/maps/d/viewer?msa=0&mid=1WHIJ5to-okN-Fqywzlr7poqFyLQ&ll=41.0278149%2C28.980121999999987&z=18'
                                        }
                                    },
                                ]
                            },
                            {
                                id: 'item-3',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'heading',
                                        value: 'Contact Us'
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'phone',
                                        value: '+905375642134'
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'email',
                                        value: 'example@hotech.systems'
                                    },
                                ]
                            },
                        ]
                    }],
                value: <Container>
                    <Row>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <h5 className={classes.text}>
                                            Our Services
                                            <span></span>
                                        </h5>
                                    </li>
                                    <li>
                                        <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                            OTELLO
                                        </a>
                                    </li>
                                    <li>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            aria-label="add"
                                            className={classes.button}
                                        >
                                            Register Now
                                        </Button>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <h5 className={classes.text}>
                                            ANTALYA
                                            <span></span>
                                        </h5>
                                    </li>
                                    <li>
                                        <p className={classes.link}>
                                            <RoomIcon/> Akdeniz Univ. Campus Technopolis R&D 3 Building No: 758/2 Kat. 1
                                            Konyaalti / ANTALYA
                                        </p>
                                    </li>
                                    <li>
                                        <h5 className={classes.link}>
                                            ISTANBUL
                                            <span></span>
                                        </h5>
                                    </li>
                                    <li>
                                        <p className={classes.link}>
                                            <RoomIcon/> Hacımimi Mah. Bogazkesen Cad. No: 23 Kat: 2 Beyoğlu / ISTANBUL
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <h5 className={classes.text}>
                                            Contact Us
                                            <span></span>
                                        </h5>
                                    </li>
                                    <li>
                                        <div className="thumb-content">
                                            <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                                <PhoneIcon/> +905375642134
                                            </a>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="thumb-content">
                                            <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                                <EmailIcon/>  example@hotech.systems
                                            </a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                </Container>
            },
            {
                tpl: 'footer-3',
                items: [
                    {
                        id: 'row-1',
                        items: [
                            {
                                id: 'item-1',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'logo',
                                        value: state.altLogoUrl
                                    }
                                ]
                            },
                            {
                                id: 'item-2',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'heading',
                                        value: 'Our Services'
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'link',
                                        value: {
                                            title: 'Vima Hotel',
                                            value: 'https://hotech.com.tr/'
                                        }
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'link',
                                        value: {
                                            title: 'IBE',
                                            value: 'https://hotech.com.tr/'
                                        }
                                    },
                                    {
                                        id: 'value-4',
                                        type: 'link',
                                        value: {
                                            title: 'QM',
                                            value: 'https://hotech.com.tr/'
                                        }
                                    },
                                ]
                            },
                            {
                                id: 'item-3',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'heading',
                                        value: 'ADDRESS'
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'address',
                                        value: {
                                            title: 'Akdeniz Univ. Campus Technopolis R&D 3 Building No: 758/2 Kat. 1 Konyaalti / ANTALYA',
                                            value: 'https://www.google.com/maps/d/viewer?msa=0&mid=1WHIJ5to-okN-Fqywzlr7poqFyLQ&ll=36.89746899999999%2C30.66511600000002&z=17'
                                        }
                                    },
                                ]
                            },
                            {
                                id: 'item-4',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'heading',
                                        value: 'Contact Us'
                                    },
                                    {
                                        id: 'value-2',
                                        type: 'phone',
                                        value: '+905375642134'
                                    },
                                    {
                                        id: 'value-3',
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
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'paragraph',
                                        value: 'PRIVACY POLICY'
                                    }
                                ]
                            },
                            {
                                id: 'item-2',
                                alignment: 'right',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'social-link',
                                        value: {
                                            title: '',
                                            value: 'https://www.facebook.com/'
                                        }
                                    },
                                    {
                                        id: 'value-3',
                                        type: 'social-link',
                                        value: {
                                            title: '',
                                            value: 'https://twitter.com'
                                        }
                                    },
                                    {
                                        id: 'value-4',
                                        type: 'social-link',
                                        value: {
                                            title: '',
                                            value: 'https://www.instagram.com/'
                                        }
                                    },
                                    {
                                        id: 'value-5',
                                        type: 'social-link',
                                        value: {
                                            title: '',
                                            value: 'https://www.linkedin.com/'
                                        }
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        id: 'row-3',
                        items: [
                            {
                                id: 'item-1',
                                alignment: 'left',
                                value: [
                                    {
                                        id: 'value-1',
                                        type: 'paragraph',
                                        value: 'Copyright 2020 HOTECH'
                                    }
                                ]
                            },
                        ]
                    }],
                value: <Container>
                    <Row>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <div
                                            style={{
                                                backgroundImage: `url(${
                                                    GENERAL_SETTINGS.STATIC_URL + state.altLogoUrl
                                                })`,
                                                backgroundSize: 'contain',
                                                backgroundRepeat: 'no-repeat',
                                                height: 100,
                                                marginTop: 16
                                            }}
                                        ></div>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <h5 className={classes.text}>
                                            Our Services
                                            <span></span>
                                        </h5>
                                    </li>
                                    <li>
                                        <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                            Vima Hotel
                                        </a>
                                    </li>
                                    <li>
                                        <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                            IBE
                                        </a>
                                    </li>
                                    <li>
                                        <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                            QM
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <h5 className={classes.text}>
                                            ADDRESS
                                            <span></span>
                                        </h5>
                                    </li>
                                    <li>
                                        <p className={classes.link}>
                                            <RoomIcon/> Akdeniz Univ. Campus Technopolis R&D 3 Building No: 758/2 Kat. 1
                                            Konyaalti / ANTALYA
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <h5 className={classes.text}>
                                            Contact Us
                                            <span></span>
                                        </h5>
                                    </li>
                                    <li>
                                        <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                            <PhoneIcon/> +905375642134
                                        </a>
                                    </li>
                                    <li>
                                        <a className={classes.link} href="https://hotech.com.tr/" target="_blank">
                                            <EmailIcon/> example@hotech.systems
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <div className="thumb-content">
                                            <p className={classes.text}>
                                                PRIVACY POLICY
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                        <Col>
                            <div className="widget no-box" style={{float: 'right'}}>
                                <ul className="thumbnail-widget">
                                    <li className={'horizontal-li'}>
                                        <a className={classes.link} title="facebook" target="_blank"
                                           href="https://www.facebook.com/">
                                            <FacebookIcon/>
                                        </a>
                                    </li>
                                    <li className={'horizontal-li'}>
                                        <a className={classes.link} title="twitter" target="_blank"
                                           href="https://twitter.com">
                                            <TwitterIcon/>
                                        </a>
                                    </li>
                                    <li className={'horizontal-li'}>
                                        <a className={classes.link} title="instagram" target="_blank"
                                           href="https://www.instagram.com/">
                                            <InstagramIcon/>
                                        </a>
                                    </li>
                                    <li className={'horizontal-li'}>
                                        <a className={classes.link} title="linkedin" target="_blank"
                                           href="https://www.linkedin.com/">
                                            <LinkedInIcon/>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="widget no-box">
                                <ul className="thumbnail-widget">
                                    <li>
                                        <p className={classes.text}>
                                            Copyright 2020 HOTECH
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                </Container>
            }
        ])
    }, []);

    const handleClick = (index) => {
        setSelectedIndex(index);
        onSelectedFooter({
            tpl: footerTemplates[index].tpl,
            items: footerTemplates[index].items
        });
    }

    return (
        <React.Fragment>
            {
                footerTemplates.map((each, index) => {
                    return (
                        <div
                            className="footer-border"
                            style={{border: selectedIndex === index ? '3px solid red' : '3px solid silver',
                                backgroundColor: state?.assets?.colors?.secondary?.main}}
                            key={index}
                            onClick={() => handleClick(index)}
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
)(FooterTemplates)