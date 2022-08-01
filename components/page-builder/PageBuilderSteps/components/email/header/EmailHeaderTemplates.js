import React, {useContext, useState, useEffect} from 'react';
import { connect } from 'react-redux';
import WebCmsGlobal from "components/webcms-global";
import { Email, Item, Span, A, renderEmail, Box, Image } from 'react-html-email'

const EmailHeaderTemplates = (props) => {

    const {onSelectHeader, state} = props
    const [headerTemplates, setHeaderTemplates] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);

    useEffect(() => { // set all email header templates
        setHeaderTemplates([
            {
                tpl: 'template-1',
                items: [
                    {
                        id: 'item-1',
                        type: 'link',
                        alignment: 'center',
                        value: [
                            {
                                title: 'View email in your browser',
                                link: 'https://hotech.com.tr/'
                            }
                        ]
                    },
                    {
                        id: 'item-2',
                        type: 'logo',
                        alignment: 'center',
                        value: {
                            title: '',
                            link: GENERAL_SETTINGS.STATIC_URL + state.logoUrl
                        }
                    }
                ],
                value: renderEmail(
                    <Email title={"Email Header"}>
                            <Box width={'100%'} style={{pointerEvents: 'none',}}
                                                        
                                                        >
                                <Item align="center" style={{ display: 'flex', justifyContent: 'center'}}>
                                    <A href="https://hotech.com.tr/"
                                       style={{color: state?.assets?.colors?.primary?.light}}
                                       textDecoration="none"
                                    >
                                        View email in your browser
                                    </A>
                                </Item>
                                <Item align="center" 
                                    style={{ display: 'flex', 
                                            justifyContent: 'center',
                                            }}
                                >
                                    <Image
                                        data-mc-bar="bar"
                                        data-mc-baz="baz"
                                        alt="react"
                                        src={GENERAL_SETTINGS.STATIC_URL + state?.logoUrl}
                                        style={{
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center ',
                                            width: 200,
                                            height: 50,
                                            marginTop: 12,
                                            marginBottom: 8
                                        }}
                                    />

                                </Item>
                            </Box>
                    </Email>
                )
            },
            {
                tpl: 'template-2',
                items: [
                    {
                        id: 'item-1',
                        type: 'logo',
                        alignment: 'left',
                        value: {
                            title: '',
                            link: GENERAL_SETTINGS.STATIC_URL + state.logoUrl
                        }
                    },
                    {
                        id: 'item-2',
                        type: 'social-link',
                        alignment: 'right',
                        value: [
                            {
                                title: '',
                                link: 'https://www.facebook.com/HotechEco'
                            },
                            {
                                title: '',
                                link: 'https://www.instagram.com/accounts/login/?next=/hotech_ecosystem/'
                            },
                            {
                                title: '',
                                link: 'https://www.linkedin.com/company/hotech-software'
                            },
                            {
                                title: '',
                                link: 'https://twitter.com/Hotech_Official'
                            }
                        ]
                    },
                ],
                value: renderEmail(
                    <Email title={"Email Header"}>
                        <Box style={{pointerEvents: 'none'}} width="100%">
                            <Item style={{display: 'flex', flexDirection: 'row',
                                justifyContent : 'space-between'}}>
                                <Image
                                    data-mc-bar="bar"
                                    data-mc-baz="baz"
                                    alt="react"
                                    src={GENERAL_SETTINGS.STATIC_URL + state?.logoUrl}
                                    style={{
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center ',
                                        width: 200,
                                        height: 50,
                                        marginLeft: 16,
                                        marginTop: 24,
                                    }}
                                />
                                <Span
                                    style={{marginTop: 32,
                                        justifyContent: 'flex-end',
                                        flexDirection: 'row',
                                        marginRight: 16
                                    }}
                                >
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
                                            }}
                                        />
                                    </A>
                                </Span>
                            </Item>
                        </Box>
                    </Email>
                )
            },
            // {
            //     tpl: 'template-3',
            //     items: [
            //         {
            //             id: 'item-1',
            //             type: 'logo',
            //             alignment: 'left',
            //             value: {
            //                 title: '',
            //                 link: GENERAL_SETTINGS.STATIC_URL + state.logoUrl
            //             }
            //         },
            //         {
            //             id: 'item-2',
            //             type: 'social-link',
            //             alignment: 'center',
            //             value: [
            //                 {
            //                     title: '',
            //                     link: 'https://www.facebook.com/HotechEco'
            //                 },
            //                 {
            //                     title: '',
            //                     link: 'https://www.instagram.com/accounts/login/?next=/hotech_ecosystem/'
            //                 },
            //                 {
            //                     title: '',
            //                     link: 'https://www.linkedin.com/company/hotech-software'
            //                 },
            //                 {
            //                     title: '',
            //                     link: 'https://twitter.com/Hotech_Official'
            //                 }
            //             ]
            //         },
            //         {
            //             id: 'item-3',
            //             type: 'link',
            //             alignment: 'right',
            //             value: [
            //                 {
            //                     title: 'View email in your browser',
            //                     link: 'https://hotech.com.tr/'
            //                 },
            //             ]
            //         },
            //     ],
            //     value: renderEmail(
            //         <Email title={"Email Header"}>
            //             <Box style={{pointerEvents: 'none'}} width="100%">
            //                 <Item style={{display: 'flex',
            //                     flexDirection: 'row',
            //                     justifyContent : 'space-between'
            //                 }}
            //                 >
            //                     <Image
            //                         data-mc-bar="bar"
            //                         data-mc-baz="baz"
            //                         alt="react"
            //                         src={GENERAL_SETTINGS.STATIC_URL + state?.logoUrl}
            //                         style={{
            //                             backgroundSize: 'contain',
            //                             backgroundRepeat: 'no-repeat',
            //                             backgroundPosition: 'center ',
            //                             width: 200,
            //                             height: 50,
            //                             marginLeft: 16,
            //                             marginTop: 24,
            //                         }}
            //                     />
            //                     <Span style={{marginTop: 32,
            //                         justifyContent: 'center',
            //                         flexDirection: 'row',
            //                     }}>
            //                         <A href="https://www.facebook.com/HotechEco"
            //                            style={{color: state?.assets?.colors?.primary?.light}}
            //                            textDecoration="none"
            //                         >
            //                             <Image
            //                                 data-mc-bar="bar"
            //                                 data-mc-baz="baz"
            //                                 alt="react"
            //                                 src={'imgs/icons/facebook.png'}
            //                                 style={{
            //                                     backgroundSize: 'contain',
            //                                     backgroundRepeat: 'no-repeat',
            //                                     backgroundPosition: 'center ',
            //                                     width: '30px',
            //                                     height: '30px',
            //                                     display: 'inline-block',
            //                                     marginRight: 8
            //                                 }}
            //                             />
            //                         </A>
            //                         <A href="https://www.instagram.com/accounts/login/?next=/hotech_ecosystem/"
            //                            style={{color: state?.assets?.colors?.primary?.light}}
            //                            textDecoration="none"
            //                         >
            //                             <Image
            //                                 data-mc-bar="bar"
            //                                 data-mc-baz="baz"
            //                                 alt="react"
            //                                 src={'imgs/icons/instagram.png'}
            //                                 style={{
            //                                     backgroundSize: 'contain',
            //                                     backgroundRepeat: 'no-repeat',
            //                                     backgroundPosition: 'center ',
            //                                     width: '30px',
            //                                     height: '30px',
            //                                     display: 'inline-block',
            //                                     marginRight: 8
            //                                 }}
            //                             />
            //                         </A>
            //                         <A href="https://www.linkedin.com/company/hotech-software"
            //                            style={{color: state?.assets?.colors?.primary?.light}}
            //                            textDecoration="none"
            //                         >
            //                             <Image
            //                                 data-mc-bar="bar"
            //                                 data-mc-baz="baz"
            //                                 alt="react"
            //                                 src={'imgs/icons/linkedin.png'}
            //                                 style={{
            //                                     backgroundSize: 'contain',
            //                                     backgroundRepeat: 'no-repeat',
            //                                     backgroundPosition: 'center ',
            //                                     width: '30',
            //                                     height: '30px',
            //                                     display: 'inline-block',
            //                                     marginRight: 8
            //                                 }}
            //                             />
            //                         </A>
            //                         <A href="https://twitter.com/Hotech_Official"
            //                            style={{color: state?.assets?.colors?.primary?.light}}
            //                            textDecoration="none"
            //                         >
            //                             <Image
            //                                 data-mc-bar="bar"
            //                                 data-mc-baz="baz"
            //                                 alt="react"
            //                                 src={'imgs/icons/twitter.png'}
            //                                 style={{
            //                                     backgroundSize: 'contain',
            //                                     backgroundRepeat: 'no-repeat',
            //                                     backgroundPosition: 'center ',
            //                                     width: '30',
            //                                     height: '30px',
            //                                     display: 'inline-block',
            //                                     marginRight: 8
            //                                 }}
            //                             />
            //                         </A>
            //                     </Span>
            //                     <Span
            //                         style={{marginTop: 40,
            //                             justifyContent: 'flex-end',
            //                             flexDirection: 'row',
            //                             marginRight: 16
            //                         }}
            //                     >
            //                         <A href="https://hotech.com.tr/"
            //                            style={{color: state?.assets?.colors?.primary?.light}}
            //                            textDecoration="none"
            //                         >
            //                             View email in your browser
            //                         </A>
            //                     </Span>
            //                 </Item>
            //             </Box>
            //         </Email>
            //     )
            // }
        ])
    }, [state?.logoUrl]);

    const handleSelectedHeader = (index) => {
        const updatedHeaderTemplates = [...headerTemplates];
        setSelectedIndex(index);
        onSelectHeader({
            tpl: updatedHeaderTemplates[index]?.tpl,
            backgroundColor: state?.assets?.colors?.primary?.main,
            textColor: state?.assets?.colors?.primary?.light,
            items: updatedHeaderTemplates[index]?.items
        });
    }

    return (
        <React.Fragment>
            {
                headerTemplates.map((each, index) => {
                    return (
                        <div
                            style={{cursor: "pointer", marginTop: 8,
                                border: selectedIndex === index ? '3px solid red' : '3px solid silver',
                                backgroundColor: state?.assets?.colors?.primary?.main,
                                minHeight: 100
                        }}
                             key={index}
                             onClick={() => handleSelectedHeader(index)}
                        >
                            <div dangerouslySetInnerHTML={{__html: each?.value}} >

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
)(EmailHeaderTemplates);