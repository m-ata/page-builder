import React, {useContext, useState, useEffect} from 'react';
import { connect } from 'react-redux';
import WebCmsGlobal from "components/webcms-global";
import { Email, Item, Span, A, renderEmail, Box, Image } from 'react-html-email'

const EmailHeader = (props) => {

    const {
        state,
    } = props;

    const [header, setHeader] = useState('');
    const [leftItems, setLeftItems] = useState([]);
    const [rightItems, setRightItems] = useState([]);
    const [centerItems, setCenterItems] = useState([]);
    const [otherLeftItems, setOtherLeftItems] = useState([]);
    const [otherRightItems, setOtherRightItems] = useState([]);
    const [otherCenterItems, setOtherCenterItems] = useState([]);
    const tpl = state.email.header.tpl;
    const [items, setItems] = useState([]);
    const [otherItems, setOtherItems] = useState([]);

    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);

    useEffect(() => {
        if (state?.email?.header?.items?.length > 0) {
            setItems(state.email.header.items);
        }
        if (state?.langsFile?.header?.[state.langCode]?.items.length > 0) {
         setOtherItems(state.langsFile.header[state.langCode].items);
        }
    }, [state.langsFile, state.email]);

    useEffect(() => {
        if (items.length > 0) {
            setLeftItems(items.filter(item => item.alignment === 'left'));
            setRightItems(items.filter(item => item.alignment === 'right'));
            setCenterItems(items.filter(item => item.alignment === 'center'));
        }
    }, [items]);

    useEffect(() => {
        if (state.langCode !== state.defaultLang) {
            let updatedOtherLeftItems = [];
            let updatedOtherCenterItems = [];
            let updatedOtherRightItems = [];
            Promise.all(leftItems.map(item => {
                const index = items.indexOf(item);
                updatedOtherLeftItems.push(otherItems[index]);
            }))
            Promise.all(centerItems.map(item => {
                const index = items.indexOf(item);
                updatedOtherCenterItems.push(otherItems[index]);
            }))
            Promise.all(rightItems.map(item => {
                const index = items.indexOf(item);
                updatedOtherRightItems.push(otherItems[index]);
            }))
            setOtherLeftItems(updatedOtherLeftItems);
            setOtherCenterItems(updatedOtherCenterItems);
            setOtherRightItems(updatedOtherRightItems);
        }
    }, [leftItems, centerItems, rightItems]);

    useEffect(() => { // set email header for preview
        if (tpl === 'template-1') {

            setHeader (
                renderEmail(
                    <Email title={"Email Header"}>
                        <Box width={'100%'}
                             style={{
                                 minHeight: 70,
                                 backgroundColor: state?.email?.header?.backgroundColor ? state?.email?.header?.backgroundColor :
                                state?.assets?.colors?.primary?.main
                             }}
                        >
                            {
                                state.langCode !== state.defaultLang &&
                                    otherItems?.length > 0 && otherItems.map((item, index) => {

                                    return (<Item key={index} align={items[index].alignment}
                                                  style={{
                                                      borderCollapse: 'collapse',
                                                      borderSpacing: 0,
                                                      marginLeft: item.alignment === 'left' ? 10 : 0,
                                                      padding: 0,
                                                      paddingTop: 10,
                                                      paddingBottom: 10,
                                                      display: 'block',
                                                  }}
                                    >
                                        {
                                            items[index]?.type === 'logo' && <Image
                                                data-mc-bar="bar"
                                                data-mc-baz="baz"
                                                alt="react"
                                                src={GENERAL_SETTINGS.STATIC_URL + state.logoUrl}
                                                style={{
                                                    backgroundSize: 'contain',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center ',
                                                    width: 120,
                                                    height: 50,
                                                }}
                                            />
                                        }
                                        {
                                            items[index]?.type === 'social-link' &&
                                            items[index]?.value?.length > 0 &&
                                            items[index].value.map((v, i) => {
                                                return(
                                                    <A key={i} href={v?.link}
                                                       style={{color: state?.email?.header?.textColor ? state?.email?.header?.textColor :
                                                               state?.assets?.colors?.primary?.light
                                                       }}
                                                       textDecoration="none"
                                                    >
                                                        {
                                                            v?.link?.includes('facebook.com') && <Image
                                                                data-mc-bar="bar"
                                                                data-mc-baz="baz"
                                                                alt="react"
                                                                src={'imgs/icons/facebook.png'}
                                                                style={{
                                                                    backgroundSize: 'contain',
                                                                    backgroundRepeat: 'no-repeat',
                                                                    backgroundPosition: 'center ',
                                                                    width: 30,
                                                                    height: 30,
                                                                    display: 'inline-block',
                                                                    marginRight: 8
                                                                }}
                                                            />
                                                        }
                                                        {
                                                            v?.link?.includes('instagram.com') && <Image
                                                                data-mc-bar="bar"
                                                                data-mc-baz="baz"
                                                                alt="react"
                                                                src={'imgs/icons/instagram.png'}
                                                                style={{
                                                                    backgroundSize: 'contain',
                                                                    backgroundRepeat: 'no-repeat',
                                                                    backgroundPosition: 'center ',
                                                                    width: 30,
                                                                    height: 30,
                                                                    marginRight: 8
                                                                }}
                                                            />
                                                        }
                                                        {
                                                            v?.link?.includes('linkedin.com') && <Image
                                                                data-mc-bar="bar"
                                                                data-mc-baz="baz"
                                                                alt="react"
                                                                src={'imgs/icons/linkedin.png'}
                                                                style={{
                                                                    backgroundSize: 'contain',
                                                                    backgroundRepeat: 'no-repeat',
                                                                    backgroundPosition: 'center ',
                                                                    width: 30,
                                                                    height: 30,
                                                                    marginRight: 8
                                                                }}
                                                            />
                                                        }
                                                        {
                                                            v?.link?.includes('twitter.com') && <Image
                                                                data-mc-bar="bar"
                                                                data-mc-baz="baz"
                                                                alt="react"
                                                                src={'imgs/icons/twitter.png'}
                                                                style={{
                                                                    backgroundSize: 'contain',
                                                                    backgroundRepeat: 'no-repeat',
                                                                    backgroundPosition: 'center ',
                                                                    width: 30,
                                                                    height: 30,
                                                                    marginRight: 8
                                                                }}
                                                            />
                                                        }
                                                    </A>
                                                )
                                            })
                                        }
                                        {
                                            items[index]?.type === 'link' && <Span>
                                                {
                                                    item?.value?.length > 0 && item.value.map((v, i) => {
                                                        return (
                                                            <A key={i} href={items[index]?.value[i].link}
                                                               style={{color: state?.email?.header?.textColor ? state?.email?.header?.textColor :
                                                                       state?.assets?.colors?.primary?.light}}
                                                               textDecoration="none"
                                                            >
                                                                {
                                                                    v?.value
                                                                }
                                                            </A>
                                                        )
                                                    })
                                                }
                                            </Span>
                                        }
                                    </Item> )
                                })
                            }
                            {
                                state.langCode === state.defaultLang && items?.length > 0 && items.map((item, index) => {
                                    return (<Item key={index} align={item.alignment}
                                                  style={{
                                                      borderCollapse: 'collapse',
                                                      borderSpacing: 0,
                                                      marginLeft: item.alignment === 'left' ? 10 : 0,
                                                      padding: 0,
                                                      paddingTop: 10,
                                                      paddingBottom: 10,
                                                      display: 'block',
                                                  }}
                                    >
                                        {
                                            item?.type === 'logo' && <Image
                                                alt="logo"
                                                src={GENERAL_SETTINGS.STATIC_URL + state.logoUrl}
                                                style={{
                                                    backgroundSize: 'contain',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center ',
                                                    width: 120,
                                                    height: 50,
                                                }}
                                            />
                                        }
                                        {
                                            item?.type === 'social-link' &&
                                                    item?.value?.length > 0 &&
                                                    item.value.map((v, i) => {
                                                        return(
                                                            <A key={i} href={v?.link}
                                                               style={{color: state?.email?.header?.textColor ? state?.email?.header?.textColor :
                                                                       state?.assets?.colors?.primary?.light,
                                                               }}
                                                               textDecoration="none"
                                                            >
                                                                {
                                                                    v?.link?.includes('facebook.com') && <Image
                                                                        data-mc-bar="bar"
                                                                        data-mc-baz="baz"
                                                                        alt="react"
                                                                        src={'imgs/icons/facebook.png'}
                                                                        style={{
                                                                            backgroundSize: 'contain',
                                                                            backgroundRepeat: 'no-repeat',
                                                                            backgroundPosition: 'center ',
                                                                            width: 30,
                                                                            height: 30,
                                                                            marginRight: 8
                                                                        }}
                                                                    />
                                                                }
                                                                {
                                                                    v?.link?.includes('instagram.com') && <Image
                                                                        data-mc-bar="bar"
                                                                        data-mc-baz="baz"
                                                                        alt="react"
                                                                        src={'imgs/icons/instagram.png'}
                                                                        style={{
                                                                            backgroundSize: 'contain',
                                                                            backgroundRepeat: 'no-repeat',
                                                                            backgroundPosition: 'center ',
                                                                            width: 30,
                                                                            height: 30,
                                                                            marginRight: 8
                                                                        }}
                                                                    />
                                                                }
                                                                {
                                                                    v?.link?.includes('linkedin.com') && <Image
                                                                        data-mc-bar="bar"
                                                                        data-mc-baz="baz"
                                                                        alt="react"
                                                                        src={'imgs/icons/linkedin.png'}
                                                                        style={{
                                                                            backgroundSize: 'contain',
                                                                            backgroundRepeat: 'no-repeat',
                                                                            backgroundPosition: 'center ',
                                                                            width: 30,
                                                                            height: 30,
                                                                            marginRight: 8
                                                                        }}
                                                                    />
                                                                }
                                                                {
                                                                    v?.link?.includes('twitter.com') && <Image
                                                                        data-mc-bar="bar"
                                                                        data-mc-baz="baz"
                                                                        alt="react"
                                                                        src={'imgs/icons/twitter.png'}
                                                                        style={{
                                                                            backgroundSize: 'contain',
                                                                            backgroundRepeat: 'no-repeat',
                                                                            backgroundPosition: 'center ',
                                                                            width: 30,
                                                                            height: 30,
                                                                            marginRight: 8
                                                                        }}
                                                                    />
                                                                }
                                                            </A>
                                                        )
                                                    })
                                        }
                                        {
                                            item?.type === 'link' && <Span>
                                                {
                                                    item?.value?.length > 0 && item.value.map((v, i) => {
                                                        return (
                                                            <A key={i} href={v?.link}
                                                               style={{color: state?.email?.header?.textColor ? state?.email?.header?.textColor :
                                                                       state?.assets?.colors?.primary?.light}}
                                                               textDecoration="none"
                                                            >
                                                                {v?.title}
                                                            </A>
                                                        )
                                                    })
                                                }
                                            </Span>
                                        }
                                    </Item> )
                                })
                            }
                        </Box>
                    </Email>
                )
            )
        }
         else if (tpl === 'template-2' || tpl === 'template-3') {
            setHeader(
                renderEmail(
                    <Email title={"Email Header"}>
                        <Box width="100%"
                             style={{
                                 minHeight: 70,
                                 backgroundColor: state?.email?.header?.backgroundColor ? state?.email?.header?.backgroundColor :
                                     state?.assets?.colors?.primary?.main
                             }}
                        >
                            <tr>
                                {
                                    state.langCode === state.defaultLang && items.map((item, index) => {
                                        return (
                                            <td align={item.alignment}>
                                                {
                                                    item?.type === 'logo' &&
                                                    <Image key={index}
                                                           alt="logo"
                                                           src={GENERAL_SETTINGS.STATIC_URL + state.logoUrl}
                                                           style={{
                                                               backgroundSize: 'contain',
                                                               backgroundRepeat: 'no-repeat',
                                                               backgroundPosition: 'center ',
                                                               width: 120,
                                                               height: 50,
                                                               margin: 8
                                                           }}
                                                    />
                                                }
                                                {
                                                    item?.type === 'social-link' &&
                                                    <Span key={index} style={{margin: 8}}>
                                                        {
                                                            item?.value?.length > 0 &&
                                                            item.value.map((v, i) => {
                                                                return (
                                                                    <A key={i} href={v?.link}
                                                                       style={{color: state?.email?.header?.textColor ? state?.email?.header?.textColor :
                                                                               state?.assets?.colors?.primary?.light}}
                                                                       textDecoration="none"
                                                                    >
                                                                        {
                                                                            v?.link?.includes('facebook.com') && <Image
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
                                                                        }
                                                                        {
                                                                            v?.link?.includes('instagram.com') && <Image
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
                                                                        }
                                                                        {
                                                                            v?.link?.includes('linkedin.com') && <Image
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
                                                                        }
                                                                        {
                                                                            v?.link?.includes('twitter.com') && <Image
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
                                                                        }
                                                                    </A>
                                                                )
                                                            })
                                                        }
                                                    </Span>
                                                }
                                                {
                                                    item?.type === 'link' &&
                                                    <Span key={index} style={{margin: 8}}>
                                                        {
                                                            item?.value?.length > 0 &&
                                                            item.value.map((v, i) => {
                                                                return (
                                                                    <A key={i} href={v?.link}
                                                                       style={{color: state?.email?.header?.textColor ? state?.email?.header?.textColor :
                                                                               state?.assets?.colors?.primary?.light}}
                                                                       textDecoration="none"
                                                                    >
                                                                        {
                                                                            v?.title
                                                                        }
                                                                    </A>
                                                                )
                                                            })
                                                        }
                                                    </Span>
                                                }
                                            </td>
                                        )
                                    })
                                }
                                {
                                    state.langCode !== state.defaultLang && otherItems.map((item, index) => {
                                        return (
                                            <td align={items[index].alignment}>
                                                {
                                                    items[index]?.type === 'logo' && <Image key={index}
                                                                                    data-mc-bar="bar"
                                                                                    data-mc-baz="baz"
                                                                                    alt="react"
                                                                                    src={GENERAL_SETTINGS.STATIC_URL + state.logoUrl}
                                                                                    style={{
                                                                                        backgroundSize: 'contain',
                                                                                        backgroundRepeat: 'no-repeat',
                                                                                        backgroundPosition: 'center ',
                                                                                        width: 120,
                                                                                        height: 50,
                                                                                        margin: 8
                                                                                    }}
                                                    />
                                                }
                                                {
                                                    items[index]?.type === 'social-link' &&
                                                    <Span key={index} style={{margin: 8}}>
                                                        {
                                                            items[index]?.value?.length > 0 &&
                                                            items[index].value.map((v, i) => {
                                                                return (
                                                                    <A key={i} href={v?.link}
                                                                       style={{color: state?.email?.header?.textColor ? state?.email?.header?.textColor :
                                                                               state?.assets?.colors?.primary?.light}}
                                                                       textDecoration="none"
                                                                    >
                                                                        {
                                                                            v?.link?.includes('facebook.com') && <Image
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
                                                                        }
                                                                        {
                                                                            v?.link?.includes('instagram.com') && <Image
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
                                                                        }
                                                                        {
                                                                            v?.link?.includes('linkedin.com') && <Image
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
                                                                        }
                                                                        {
                                                                            v?.link?.includes('twitter.com') && <Image
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
                                                                        }
                                                                    </A>
                                                                )
                                                            })
                                                        }
                                                    </Span>
                                                }
                                                {
                                                    items[index]?.type === 'link' &&
                                                    <Span key={index} style={{margin: 8}}>
                                                        {
                                                            item?.value?.length > 0 &&
                                                            item.value.map((v, i) => {
                                                                return (
                                                                    <A key={i} href={items[index]?.value[i].link}
                                                                       style={{color: state?.email?.header?.textColor ? state?.email?.header?.textColor :
                                                                               state?.assets?.colors?.primary?.light}}
                                                                       textDecoration="none"
                                                                    >
                                                                        {
                                                                             v?.value
                                                                        }
                                                                    </A>
                                                                )
                                                            })
                                                        }
                                                    </Span>
                                                }
                                            </td>
                                        )
                                    })
                                }
                            </tr>
                        </Box>
                    </Email>
                )
            )
        }
    }, [tpl, leftItems, centerItems, rightItems, otherItems, otherRightItems,
        otherLeftItems, otherCenterItems, state.logoUrl, state?.email?.header?.backgroundColor, state?.email?.header?.textColor]);

    return(
        <div
            style={{
                backgroundColor: state?.email?.header?.backgroundColor ? state?.email?.header?.backgroundColor :
                    state?.assets?.colors?.primary?.main,
            }}>
            <div dangerouslySetInnerHTML={{__html: header}}></div>
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
)(EmailHeader);

