import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Email, Item, Span, A, renderEmail, Image } from 'react-html-email'

const EmailFooterTemplates = (props) => {
    const {
        state,
        onSelectFooter
    } = props;

    //local states
    const [footerTemplates, setFooterTemplates] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);

    useEffect(() => { // set all footer templates
        setFooterTemplates([
            {
                tpl: 'template-1',
                items: [
                    {
                        id: 'item-1',
                        alignment: 'center',
                        items: [
                            {
                                id: 'item-1',
                                type: 'social-link',
                                value: {
                                    title: '',
                                    value: 'https://www.facebook.com/HotechEco'
                                }
                            },
                            {
                                id: 'item-2',
                                type: 'social-link',
                                value: {
                                    title: '',
                                    value: 'https://www.instagram.com/accounts/login/?next=/hotech_ecosystem/'
                                }
                            },
                            {
                                id: 'item-3',
                                type: 'social-link',
                                value: {
                                    title: '',
                                    value: 'https://www.linkedin.com/company/hotech-software'
                                }
                            },
                            {
                                id: 'item-4',
                                type: 'social-link',
                                value: {
                                    title: '',
                                    value: 'https://twitter.com/Hotech_Official'
                                }
                            },
                        ]
                    },
                    {
                        id: 'item-2',
                        alignment: 'center',
                        items: [
                            {
                                id: 'item-1',
                                type: 'heading',
                                value: 'Hotech Yazilim A.S.'
                            }
                        ]
                    },
                    {
                        id: 'item-3',
                        alignment: 'center',
                        items: [
                            {
                                id: 'item-1',
                                type: 'address',
                                value: [
                                    {
                                        title: 'ISTANBUL',
                                        value: 'https://www.google.com/maps/place/Antalya/@36.8978553,30.5780206,11z/data=!3m1!4b1!4m5!3m4!1s0x14c39aaeddadadc1:0x95c69f73f9e32e33!8m2!3d36.8968908!4d30.7133233'
                                    },
                                    {
                                        title: 'ANTALYA',
                                        value: 'https://www.google.com/maps/place/Antalya/@36.8978553,30.5780206,11z/data=!3m1!4b1!4m5!3m4!1s0x14c39aaeddadadc1:0x95c69f73f9e32e33!8m2!3d36.8968908!4d30.7133233'
                                    },
                                    {
                                        title: 'BERLIN',
                                        value: 'https://www.google.com/maps/place/Antalya/@36.8978553,30.5780206,11z/data=!3m1!4b1!4m5!3m4!1s0x14c39aaeddadadc1:0x95c69f73f9e32e33!8m2!3d36.8968908!4d30.7133233'
                                    },
                                    {
                                        title: 'MEXICO',
                                        value: 'https://www.google.com/maps/place/Antalya/@36.8978553,30.5780206,11z/data=!3m1!4b1!4m5!3m4!1s0x14c39aaeddadadc1:0x95c69f73f9e32e33!8m2!3d36.8968908!4d30.7133233'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'item-4',
                        alignment: 'center',
                        items: [
                            {
                                id: 'item-1',
                                type: 'link',
                                value: {
                                    title: 'Ana Sayfa',
                                    value: 'https://hotech.com.tr/'
                                }
                            },
                            {
                                id: 'item-2',
                                type: 'link',
                                value: {
                                    title: 'RaWiki',
                                    value: 'https://hotech.com.tr/'
                                }
                            },
                            {
                                id: 'item-3',
                                type: 'link',
                                value: {
                                    title: 'Blog',
                                    value: 'https://www.linkedin.com/company/hotech-software'
                                }
                            },
                            {
                                id: 'item-4',
                                type: 'link',
                                value: {
                                    title: 'ilitesim',
                                    value: 'https://hotech.com.tr/'
                                }
                            },
                        ]
                    },
                ],
                value: renderEmail(
                    <Email style={{pointerEvents: 'none'}} title="Footer">
                        <Item align={'center'} style={{display: 'flex',justifyContent: 'center'}}>
                            <Span style={{
                                marginTop: 16
                            }}>
                                <A href="https://www.facebook.com/HotechEco"
                                   style={{color: state?.assets?.colors?.primary?.light}}
                                   textDecoration="none"
                                >
                                    <Image
                                        data-mc-bar="bar"
                                        data-mc-baz="baz"
                                        alt="react"
                                        src={'imgs/icons/facebook.png'}
                                        style={{
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center ',
                                            width: '30px',
                                            height: '30px',
                                            display: 'inline-block',
                                            marginRight: 8
                                        }}
                                    />
                                </A>
                                <A href="https://www.instagram.com/accounts/login/?next=/hotech_ecosystem/"
                                   style={{color: state?.assets?.colors?.primary?.light}}
                                   textDecoration="none"
                                >
                                    <Image
                                        data-mc-bar="bar"
                                        data-mc-baz="baz"
                                        alt="react"
                                        src={'imgs/icons/instagram.png'}
                                        style={{
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center ',
                                            width: '30px',
                                            height: '30px',
                                            display: 'inline-block',
                                            marginRight: 8
                                        }}
                                    />
                                </A>
                                <A href="https://www.linkedin.com/company/hotech-software"
                                   style={{color: state?.assets?.colors?.primary?.light}}
                                   textDecoration="none"
                                >
                                    <Image
                                        data-mc-bar="bar"
                                        data-mc-baz="baz"
                                        alt="react"
                                        src={'imgs/icons/linkedin.png'}
                                        style={{
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center ',
                                            width: '30',
                                            height: '30px',
                                            display: 'inline-block',
                                            marginRight: 8
                                        }}
                                    />
                                </A>
                                <A href="https://twitter.com/Hotech_Official"
                                   style={{color: state?.assets?.colors?.primary?.light}}
                                   textDecoration="none"
                                >
                                    <Image
                                        data-mc-bar="bar"
                                        data-mc-baz="baz"
                                        alt="react"
                                        src={'imgs/icons/twitter.png'}
                                        style={{
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center ',
                                            width: '30',
                                            height: '30px',
                                            display: 'inline-block',
                                            // marginRight: 8
                                        }}
                                    />
                                </A>
                            </Span>
                        </Item>
                        <Item align={'center'} style={{display: 'flex',justifyContent: 'center'}}>
                            <Span style={{marginTop: 16, fontSize: 15, fontWeight: 'bold'}}>
                                HOTECH Yazilim A.S
                            </Span>
                        </Item>
                        <Item align={'center'} style={{display: 'flex',justifyContent: 'center'}}>
                            <Span style={{marginTop: 16}}>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href={''}
                                >
                                    ISTANBUL
                                </A>
                                <A textDecoration="none"
                                   style={{color: state.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href={''}
                                >
                                    BERLIN
                                </A>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href={''}
                                >
                                    ANTALYA
                                </A>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href={''}
                                >
                                    CANCUN
                                </A>
                            </Span>
                        </Item>
                        <Item align={'center'} style={{display: 'flex',justifyContent: 'center'}}>
                            <Span style={{marginTop: 16}}>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href={''}
                                >
                                    Ana Sayfa
                                </A>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href={'https://hotech.com.tr/'}
                                >
                                    RaWiki
                                </A>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href={'https://hotech.com.tr/'}
                                >
                                    Blog
                                </A>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href={'https://hotech.com.tr/'}
                                >
                                    iletisim
                                </A>
                            </Span>
                        </Item>
                    </Email>
                )
            },
            {
                tpl: 'template-2',
                items: [
                    {
                        id: 'item-1',
                        alignment: 'left',
                        items: [
                            {
                                id: 'item-1',
                                type: 'heading',
                                value: 'HOTECH YAZILIM A.S.'
                            }
                        ]
                    },
                    {
                        id: 'item-2',
                        alignment: 'left',
                        items: [
                            {
                                id: 'item-1',
                                type: 'address',
                                value: [
                                    {
                                        title: 'ISTANBUL',
                                        value: 'https://www.google.com/maps/place/Antalya/@36.8978553,30.5780206,11z/data=!3m1!4b1!4m5!3m4!1s0x14c39aaeddadadc1:0x95c69f73f9e32e33!8m2!3d36.8968908!4d30.7133233'
                                    },
                                    {
                                        title: 'ANTALYA',
                                        value: 'https://www.google.com/maps/place/Antalya/@36.8978553,30.5780206,11z/data=!3m1!4b1!4m5!3m4!1s0x14c39aaeddadadc1:0x95c69f73f9e32e33!8m2!3d36.8968908!4d30.7133233'
                                    },
                                    {
                                        title: 'BERLIN',
                                        value: 'https://www.google.com/maps/place/Antalya/@36.8978553,30.5780206,11z/data=!3m1!4b1!4m5!3m4!1s0x14c39aaeddadadc1:0x95c69f73f9e32e33!8m2!3d36.8968908!4d30.7133233'
                                    },
                                    {
                                        title: 'MEXICO',
                                        value: 'https://www.google.com/maps/place/Antalya/@36.8978553,30.5780206,11z/data=!3m1!4b1!4m5!3m4!1s0x14c39aaeddadadc1:0x95c69f73f9e32e33!8m2!3d36.8968908!4d30.7133233'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'item-3',
                        alignment: 'left',
                        items: [
                            {
                                id: 'item-1',
                                type: 'paragraph',
                                value: 'Web / Tel: '
                            },
                            {
                                id: 'item-2',
                                type: 'link',
                                value: {
                                    title: 'www.hotech.systems /',
                                    value: 'https://hotech.com.tr/'
                                }
                            },
                            {
                                id: 'item-1',
                                type: 'paragraph',
                                value: '0850 777 0 212'
                            }
                        ]
                    },
                    {
                        id: 'item-4',
                        alignment: 'center',
                        items: [
                            {
                                id: 'item-1',
                                type: 'paragraph',
                                value: 'Eğer e-postanımızı Junk-mail/Spam olarak alıyorsanız, ' +
                                    'lütfen "Spam değil" olarak işaretleyin ya da "Güvenli Kullanıcı" ' +
                                    'listesine alın. Bizden e-bülten alamk istemiyorsanız lütfen buraya ' +
                                    'tıklayınız.'
                            },
                        ]
                    }
                ],
                value: renderEmail(
                    <Email style={{display: 'flex', pointerEvents: 'none'}} title="Footer">
                        <Item align={'left'} style={{display: 'flex',justifyContent: 'flex-start', }}>
                            <Span style={{marginTop: 16, fontSize: 15, fontWeight: 'bold', marginLeft: -120}}>
                                HOTECH Yazilim A.S
                            </Span>
                        </Item>
                        <Item align={'left'} style={{display: 'flex',justifyContent: 'flex-start'}}>
                            <Span style={{marginTop: 16, marginLeft: -120}}>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, }}
                                   href={''}
                                >
                                    ISTANBUL
                                </A>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href={''}
                                >
                                    BERLIN
                                </A>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href={''}
                                >
                                    ANTALYA
                                </A>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href={''}
                                >
                                    CANCUN
                                </A>
                            </Span>
                        </Item>
                        <Item align={'left'} style={{display: 'flex',justifyContent: 'flex-start'}}>
                            <Span style={{marginTop: 16, marginLeft: -120}} >
                                <Span>
                                    Web / Tel:
                                </Span>
                                <A textDecoration="none"
                                   style={{color: state?.assets?.colors?.secondary?.light, marginLeft: 8}}
                                   href="https://hotech.com.tr/"
                                >
                                    www.hotech.systems/
                                </A>
                                <Span style={{marginLeft: 8}}>
                                    0850 777 0 212
                                </Span>
                            </Span>
                        </Item>
                        <Item align={'center'} style={{display: 'flex',justifyContent: 'flex-start'}}>
                            <Span style={{marginTop: 16,}}>
                                Eğer e-postanımızı Junk-mail/Spam olarak alıyorsanız, lütfen
                                "Spam değil" olarak işaretleyin ya da "Güvenli Kullanıcı" listesine
                                alın. Bizden e-bülten alamk istemiyorsanız lütfen buraya tıklayınız.
                            </Span>
                        </Item>
                    </Email>
                )
            }
        ]);
    }, []);

    const handleSelectedFooter = (index) => { // set footer when user select footer
        const updatedFooterTemplates = [...footerTemplates];
        setSelectedIndex(index);
        onSelectFooter({
            tpl: updatedFooterTemplates[index].tpl,
            backgroundColor: state?.assets?.colors?.secondary?.main,
            textColor: state?.assets?.colors?.secondary?.light,
            items: updatedFooterTemplates[index].items
        });
    }

    return (
        <React.Fragment>
            {
                footerTemplates.map((footer, index) => {
                    return (
                        <div
                            key={index}
                            style={{ backgroundColor: state?.assets?.colors?.secondary?.main,
                                border: selectedIndex === index ? '3px solid red' : '3px solid silver',
                                cursor: 'pointer',
                                marginTop: 8,
                                minHeight: 160,
                            }}
                            onClick={() => handleSelectedFooter(index)}
                        >
                            <div dangerouslySetInnerHTML={{__html: footer.value}}></div>
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
)(EmailFooterTemplates)