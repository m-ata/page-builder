import React, {useState, useEffect, useContext} from 'react';
import { connect } from 'react-redux';
import { Email, Item, Span, A, renderEmail, Image, Box } from 'react-html-email'
import WebCmsGlobal from "../../../../../webcms-global";
import {useRouter} from "next/router";

const EmailFooter = (props) => {

    const {
        state,
        items
    } = props;

    const [footer, setFooter] = useState('');

    useEffect(() => { // set render for preview email footer
        setFooter(
            renderEmail(
                <Email title="Email Footer">
                    <Box width={'100%'} style={{
                        backgroundColor: state?.email?.footer?.backgroundColor ? state?.email?.footer?.backgroundColor : state?.assets?.colors?.secondary?.main,
                        minHeight: 70,
                    }}>
                        {
                            state.langCode !== state.defaultLang && items.length > 0 && items.map((item, index) => {

                                return(
                                    <Item key={index} align={state.email.footer.items[index].alignment}>
                                        {
                                            item.items.length > 0 && item.items.map((subItem, i) => {
                                                return (
                                                    <Span key={i} style={{margin: 8}}>
                                                        {
                                                            state?.email?.footer?.items[index]?.items[i]?.type === 'social-link' &&
                                                            state?.email?.footer?.items[index]?.items[i]?.value?.value?.includes('facebook.com') &&
                                                            <A href={state.email?.footer?.items[index]?.items[i]?.value?.value}
                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
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
                                                        }
                                                        {
                                                            state.email.footer.items[index].items[i].type === 'image' &&
                                                            <A href={state.email.footer.items[index].items[i].value.link}
                                                               textDecoration="none"
                                                            >
                                                                <Image
                                                                    data-mc-bar="bar"
                                                                    data-mc-baz="baz"
                                                                    alt="image"
                                                                    src={state.email.footer.items[index].items[i].value.image}
                                                                    style={{
                                                                        backgroundSize: 'contain',
                                                                        backgroundRepeat: 'no-repeat',
                                                                        backgroundPosition: 'center ',
                                                                        width: '135px',
                                                                        // height: '100%',
                                                                        display: 'inline-block',
                                                                        marginRight: 8
                                                                    }}
                                                                />
                                                            </A>
                                                        }
                                                        {
                                                            state?.email?.footer?.items[index]?.items[i]?.type === 'social-link' &&
                                                            state?.email?.footer?.items[index]?.items[i]?.value?.value?.includes('instagram.com') &&
                                                            <A href={state.email.footer.items[index].items[i].value.value}
                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
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
                                                        }
                                                        {
                                                            state?.email?.footer?.items[index]?.items[i]?.type === 'social-link' &&
                                                            state?.email?.footer?.items[index]?.items[i]?.value?.value?.includes('linkedin.com') &&
                                                            <A href={state.email.footer.items[index].items[i].value.value}
                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
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
                                                                        width: '30px',
                                                                        height: '30px',
                                                                        display: 'inline-block',
                                                                        marginRight: 8
                                                                    }}
                                                                />
                                                            </A>
                                                        }
                                                        {
                                                            state?.email?.footer?.items[index]?.items[i]?.type === 'social-link' &&
                                                            state?.email?.footer?.items[index]?.items[i]?.value?.value?.includes('twitter.com') &&
                                                            <A href={state.email.footer.items[index].items[i].value.value}
                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
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
                                                                        width: '30px',
                                                                        height: '30px',
                                                                        display: 'inline-block',
                                                                        marginRight: 8
                                                                    }}
                                                                />
                                                            </A>
                                                        }
                                                        {
                                                            state.email.footer.items[index].items[i].type === 'link' &&
                                                            <A textDecoration="none"
                                                               href={state.email.footer.items[index].items[i].value.value}
                                                            >
                                                                <Span style={{
                                                                    color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light,
                                                                }}>
                                                                    {subItem.value}
                                                                </Span>

                                                            </A>
                                                        }
                                                        {
                                                            state?.email?.footer?.items[index]?.items[i]?.type === 'heading' &&
                                                            <Span style={{fontSize: 15, fontWeight: 'bold', color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : 'black'}}>
                                                                {subItem.value}
                                                            </Span>
                                                        }
                                                        {
                                                            state?.email?.footer?.items[index]?.items[i]?.type === 'paragraph' &&
                                                            <Span style={{ color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : 'black'}}>
                                                                {subItem.value}
                                                            </Span>
                                                        }
                                                        {
                                                            state?.email?.footer?.items[index]?.items[i]?.type === 'address' &&
                                                            <Span>
                                                                {
                                                                    state?.email?.footer?.items[index]?.items[i]?.value?.length === subItem?.value?.length &&
                                                                    subItem?.value?.length > 0 && subItem.value.map((add, j) => {
                                                                        return (
                                                                            <A key={j}
                                                                               href={state.email.footer.items[index].items[i].value[j].value}
                                                                               textDecoration="none"
                                                                               style={{
                                                                                   color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light,
                                                                                   marginLeft: j === 0 ? 0 : 8
                                                                               }}
                                                                            >
                                                                                {add.value}
                                                                            </A>
                                                                        )
                                                                    })
                                                                }
                                                            </Span>
                                                        }
                                                    </Span>
                                                )
                                            })
                                        }
                                    </Item>
                                )
                            })
                        }
                        {
                            state.langCode === state.defaultLang && items.length > 0 && items.map((item, index) => {
                                return(
                                    <Item key={index}
                                          align={item.alignment}
                                    >
                                        {
                                            item.items.length > 0 && item.items.map((subItem, i) => {
                                                return(
                                                    <Span key={i} style={{margin: 8}} >
                                                        {
                                                            subItem.type === 'social-link' &&
                                                            subItem.value.value.includes('facebook.com') &&
                                                            <A href={subItem.value.value}
                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
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
                                                        }
                                                        {
                                                            subItem.type === 'image' &&
                                                            <A href={subItem.value.link}
                                                               textDecoration="none"
                                                            >
                                                                <Image
                                                                    data-mc-bar="bar"
                                                                    data-mc-baz="baz"
                                                                    alt="image"
                                                                    src={subItem.value.image}
                                                                    style={{
                                                                        backgroundSize: 'contain',
                                                                        backgroundRepeat: 'no-repeat',
                                                                        backgroundPosition: 'center ',
                                                                        width: '135px',
                                                                        // height: '100%',
                                                                        display: 'inline-block',
                                                                        marginRight: 8
                                                                    }}
                                                                />
                                                            </A>
                                                        }
                                                        {
                                                            subItem.type === 'social-link' &&
                                                            subItem.value.value.includes('instagram.com') &&
                                                            <A href={subItem.value.value}
                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
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
                                                        }
                                                        {
                                                            subItem?.type === 'social-link' &&
                                                            subItem?.value?.value?.includes('linkedin.com') &&
                                                            <A href={subItem?.value?.value}
                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
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
                                                                        width: '30px',
                                                                        height: '30px',
                                                                        display: 'inline-block',
                                                                        marginRight: 8
                                                                    }}
                                                                />
                                                            </A>
                                                        }
                                                        {
                                                            subItem.type === 'social-link' &&
                                                            subItem.value.value.includes('twitter.com') &&
                                                            <A href={subItem.value.value}
                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
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
                                                                        width: '30px',
                                                                        height: '30px',
                                                                        display: 'inline-block',
                                                                        marginRight: 8
                                                                    }}
                                                                />
                                                            </A>
                                                        }
                                                        {
                                                            subItem.type === 'link' &&
                                                            <A textDecoration="none"
                                                               href={subItem.value.value}
                                                            >
                                                                <Span style={{
                                                                    color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light,
                                                                }}>
                                                                    {
                                                                        state?.langCode === state?.defaultLang ?
                                                                            subItem?.value?.title :
                                                                            state?.langsFile?.footer?.[state.langCode]?.items[index].items[i].value
                                                                    }
                                                                </Span>

                                                            </A>
                                                        }
                                                        {
                                                            subItem.type === 'heading' &&
                                                            <Span style={{fontSize: 15, fontWeight: 'bold', color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : 'black'}}>
                                                                {
                                                                    state.langCode === state.defaultLang ?
                                                                        subItem.value :
                                                                        state?.langsFile?.footer?.[state.langCode]?.items[index].items[i].value
                                                                }
                                                            </Span>
                                                        }
                                                        {
                                                            subItem.type === 'paragraph' &&
                                                            <Span style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : 'black'}}>
                                                                {
                                                                    state.langCode === state.defaultLang ?
                                                                        subItem.value :
                                                                        state?.langsFile?.footer?.[state.langCode]?.items[index].items[i].value
                                                                }
                                                            </Span>
                                                        }
                                                        {
                                                            subItem.type === 'address' &&
                                                            <Span>
                                                                {
                                                                    subItem.value.length > 0 && subItem.value.map((add, j) => {
                                                                        return(
                                                                            <A key={j}
                                                                               href={add.value}
                                                                               textDecoration="none"
                                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light,
                                                                                   marginLeft: j === 0 ? 0 : 8
                                                                               }}
                                                                            >
                                                                                {
                                                                                    state.langCode === state.defaultLang ?
                                                                                    add.title :
                                                                                        state?.langsFile?.footer?.[state.langCode]?.items[index].items[i].value[j].value
                                                                                }
                                                                            </A>
                                                                        )
                                                                    })
                                                                }
                                                            </Span>
                                                        }
                                                    </Span>
                                                )
                                            })
                                        }
                                    </Item>
                                )
                            })
                        }
                    </Box>
                </Email>
            )
        )
    }, [items, state?.email?.footer?.backgroundColor, state?.email?.footer?.textColor]);

    return (
        <div>
            <div dangerouslySetInnerHTML={{__html: footer}}></div>
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
)(EmailFooter);