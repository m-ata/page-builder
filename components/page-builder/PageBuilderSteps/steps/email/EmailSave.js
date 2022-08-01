import React, {useState, useContext, useEffect} from 'react';
//material imports
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {makeStyles} from "@material-ui/core/styles";
import {Checkbox, FormControlLabel, Typography} from "@material-ui/core";
//redux imports
import { connect } from 'react-redux';
import {updateState} from "../../../../../state/actions";
// imports for toaster
import { ToastContainer, toast } from 'react-toastify';
//imports configs
import WebCmsGlobal from "components/webcms-global";
import {isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST} from "../../../../../model/orest/constants";
import {Insert, Patch, ViewList} from "@webcms/orest";
//router import
import { useRouter } from "next/router";

import { Email, Item, Span, A, renderEmail, Box, Image } from 'react-html-email'
import axios from "axios";
import {SAVED_SUCCESS, UPDATE_SUCCESS} from "../../constants";
import LoadingSpinner from "../../../../LoadingSpinner";
import {getEncodeHtml} from "../../../../../lib/helpers/useEncodeHtml";

const useStyles = makeStyles(theme => ({
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    },
    disableEvent: {
        pointerEvents: "none",
        opacity: 0.5
    },
}));

const EmailSave = (props) => {

    const { state,
        dialogTitle,
        resetFinal,
        updateState,
        isEmailSelected,
        onSelectEmail
    } = props;

    const [isOpen, setOpen] = useState(true);
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [emailGID, setEmailGID] = useState('');
    const [xhtmlGID, setXhtmlGID] = useState('');
    const [langFileGID, setLangFileGID] = useState('');
    const [isTemplate, setIsTemplate] = useState(false);
    const [html, setHtml] = useState('');
    const [updatedBody, setUpdatedBody] = useState([]);
    const [isLoaded, setIsLoaded] = useState(true);
    const [isRequestSend, setRequestSend] = useState(false);
    const [emailData, setEmailData] = useState(null);
    const classes = useStyles();

    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);

    const router = useRouter();
    const companyId = router.query.companyID;
    const authToken = token || router.query.authToken;

    const getData = async (options) => { // get data according to options provided
        return new Promise(async (resv) => {
            return await axios(options)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.success) {
                        resv(response)
                    } else {
                        const retErr = isErrorMsg(response);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        });
    }

    const handleItems = async () => { // set items in body object
        const newBody = [];
        for(let body of state.email.body) {
            let req = [];
            let newItem = [];
            let bodyReq = [];

            for (let item of body.items) {
                if (item.type === 'image') {
                    const HCMITEMIMG_REQUEST_OPTIONS = {
                        url:
                            GENERAL_SETTINGS.OREST_URL +
                            OREST_ENDPOINT.SLASH +
                            OREST_ENDPOINT.HCMITEMIMG +
                            OREST_ENDPOINT.SLASH +
                            'view/list/',
                        method: REQUEST_METHOD_CONST.GET,
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                        params: {
                            query: `gid:${item.gid}`,
                            hotelrefno: Number(companyId),
                        },
                    }
                    const img = await getData(HCMITEMIMG_REQUEST_OPTIONS);
                    if (img.status === 200 && img?.data?.data?.length > 0) {
                        const newItem = {
                            id: item.id,
                            service: item.service,
                            type: item.type,
                            width: item.width,
                            gid: item.gid
                        };
                        newItem.gid = img.data.data[0];
                        req.push({
                            status: 200,
                            data: newItem
                        });
                    }
                }
                if (item.type === 'paragraph') {
                    const HCMITEMTXTPAR_REQUEST_OPTIONS = {
                        url:
                            GENERAL_SETTINGS.OREST_URL +
                            OREST_ENDPOINT.SLASH +
                            OREST_ENDPOINT.HCMITEMTXTPAR +
                            OREST_ENDPOINT.SLASH +
                            'view/list/',
                        method: REQUEST_METHOD_CONST.GET,
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                        params: {
                            query: `gid:${item.gid}`,
                            hotelrefno: Number(companyId),
                        },
                    }
                    const txt = await getData(HCMITEMTXTPAR_REQUEST_OPTIONS);

                    if (txt.status === 200 && txt?.data?.data?.length > 0) {
                        const newItem = {
                            id: item?.id,
                            service: item?.service,
                            type: item?.type,
                            width: item?.width,
                            gid: item.gid,
                            useBgColor: item?.useBgColor
                        };
                        newItem.gid = txt.data.data[0]?.itemtext;
                        req.push({
                            status: 200,
                            data: newItem
                        });
                    }
                }
            }

            await Promise.all(req).then(async (res) => {
                await res.map((r) => {
                    if (r.status === 200) {
                        newItem.push(r.data)
                    }
                })
                // return
            })
            bodyReq.push(
                {
                    id: body.id,
                    type: body.type,
                    items: newItem
                }
            )
            await Promise.all(bodyReq).then(async (res) => {
                await res.map((r) => {
                    if (r) {
                        newBody.push(r);
                    }
                })
            })
        }
        setUpdatedBody(newBody)
    }

    useEffect(() => {
       handleItems();
    }, []);

    useEffect(() => { // handling export html
        setHtml(
            renderEmail(
                <Email title={"Email"}>
                    {
                        state?.email?.header?.items?.length &&
                        <Box width={'100%'}
                             style={{
                                 backgroundColor: state?.email?.header?.backgroundColor ? state?.email?.header?.backgroundColor : state?.assets?.colors?.primary?.main,
                                 width: state?.emailWidth,
                             }}
                        >
                            {
                                state?.email?.header?.tpl === 'template-1' && <>
                                    {
                                        state?.email?.header?.items?.length > 0 &&
                                        state.email.header.items.map((item, index) => {

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
                                                        data-mc-bar="bar"
                                                        data-mc-baz="baz"
                                                        alt="logo"
                                                        src={GENERAL_SETTINGS.STATIC_URL + state.logoUrl}
                                                        style={{
                                                            backgroundSize: 'contain',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'center ',
                                                            width: 120,
                                                            height: 50,
                                                            marginTop: 8
                                                        }}
                                                    />
                                                }
                                                {
                                                    item?.type === 'social-link' &&
                                                    item?.value?.length > 0 &&
                                                    item.value.map((v, i) => {
                                                        return (
                                                            <A key={i} href={v.link}
                                                               style={{color: state?.email?.header?.textColor ? state?.email?.header?.textColor :
                                                                       state?.assets?.colors?.primary?.light}}
                                                               textDecoration="none"
                                                            >
                                                                {
                                                                    v?.link?.includes('facebook.com') && <Image
                                                                        data-mc-bar="bar"
                                                                        data-mc-baz="baz"
                                                                        alt="facebook"
                                                                        src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/facebook.png`}
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
                                                                        alt="instagram"
                                                                        src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/instagram_2021-06-02T18_28_57.874708.png`}
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
                                                                        alt="linkedin"
                                                                        src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/linkedin.png`}
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
                                                                        alt="twitter"
                                                                        src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/twitter.png`}
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
                                            </Item>)
                                        })
                                    }
                                </>
                            }
                            {
                                (state?.email?.header?.tpl === 'template-2' || state?.email?.header?.tpl === 'template-3') &&
                                <tr>
                                    {
                                        state?.email?.header?.items?.map((item, index) => {

                                            return (
                                                <td align={item.alignment}>
                                                    {
                                                        item?.type === 'logo' && <Image key={index}
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
                                                                                    src={'https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/facebook.png'}
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
                                                                                    src={'https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/instagram_2021-06-02T18_28_57.874708.png'}
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
                                                                                    alt="linkedin"
                                                                                    src={'https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/linkedin.png'}
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
                                                                                    src={'https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/twitter.png'}
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
                                </tr>
                            }
                        </Box>
                    }
                    {
                        updatedBody?.length > 0 && updatedBody.map((body, index) => {
                            return (
                                <Box key={index} width={'100%'}>
                                    <Item
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            flexDirection: 'row',
                                            width: state?.emailWidth,
                                            marginTop: 4
                                        }}
                                    >
                                        {
                                            body?.items?.length > 0 && body.items.map((item, i) => {
                                                let imageHeight = '';
                                                if (body?.type === 'threecol') imageHeight = 150;
                                                else if (body?.type === 'twocol') imageHeight = 200;
                                                else imageHeight = 'auto'
                                                return (
                                                    <>
                                                        {
                                                            item?.type === 'image' &&
                                                            <div style={{
                                                                position: 'relative',
                                                                width: item?.width + '%',
                                                                height: imageHeight,
                                                                marginLeft: i !==0 ? 8 : 0
                                                            }}>
                                                                {
                                                                    item?.gid?.cta ?
                                                                        <A href={item?.gid?.cta} target={'_blank'}>
                                                                            <Image
                                                                                data-mc-bar="bar"
                                                                                data-mc-baz="baz"
                                                                                alt="image"
                                                                                src={GENERAL_SETTINGS.STATIC_URL + item?.gid?.fileurl}
                                                                                style={{
                                                                                    backgroundSize: 'contain',
                                                                                    backgroundRepeat: 'no-repeat',
                                                                                    backgroundPosition: 'center ',
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    borderRadius: 5
                                                                                }}
                                                                            />
                                                                        </A> :
                                                                        <Image
                                                                            data-mc-bar="bar"
                                                                            data-mc-baz="baz"
                                                                            alt="image"
                                                                            src={GENERAL_SETTINGS.STATIC_URL + item?.gid?.fileurl}
                                                                            style={{
                                                                                backgroundSize: 'contain',
                                                                                backgroundRepeat: 'no-repeat',
                                                                                backgroundPosition: 'center ',
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                borderRadius: 5
                                                                            }}
                                                                        />
                                                                }
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    left: '50%',
                                                                    top: '50%',
                                                                    transform: 'translate(-50%, -50%)',
                                                                    zIndex: 999,
                                                                }}>
                                                                    <h2 style={{
                                                                        fontSize: 24,
                                                                        fontWeight: "bold",
                                                                        fontFamily: 'monospace',
                                                                        color: 'white'
                                                                    }}> {item?.gid?.title} </h2>
                                                                    <p style={{
                                                                        fontSize: 15,
                                                                        fontFamily: "monospace",
                                                                        color: 'white'
                                                                    }}> {item?.gid?.description} </p>
                                                                </div>
                                                            </div>
                                                        }
                                                        {
                                                            item?.type === 'paragraph' &&
                                                            <div
                                                                style={{
                                                                    width: item?.width + '%',
                                                                    backgroundColor: item?.useBgColor ? state?.assets?.colors?.message?.main : 'white',
                                                                    marginLeft: i !==0 ? 8 : 0
                                                                }}
                                                            >
                                                                <div
                                                                    dangerouslySetInnerHTML={{__html: item?.gid}}
                                                                ></div>
                                                            </div>
                                                        }
                                                    </>
                                                )
                                            })
                                        }
                                    </Item>
                                </Box>
                            )
                        })
                    }
                    {
                        state?.email?.footer?.items?.length > 0 &&
                        <Box width={'100%'}
                             style={{
                                 backgroundColor: state?.email?.footer?.backgroundColor ? state?.email?.footer?.backgroundColor : state?.assets?.colors?.secondary?.main,
                                 width: state?.emailWidth,
                                 marginTop: 4,
                                 minHeight: 70,
                             }}>
                            {
                                state.email.footer.items.map((item, index) => {
                                    return (
                                        <Item key={index}
                                              align={item?.alignment}
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
                                                item?.items?.length > 0 && item.items.map((subItem, i) => {
                                                    return (
                                                        <Span key={i} style={{margin: 8}}>
                                                            {
                                                                subItem?.type === 'social-link' &&
                                                                subItem?.value?.value?.includes('facebook.com') &&
                                                                <A href={subItem?.value?.value}
                                                                   style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
                                                                   textDecoration="none"
                                                                >
                                                                    <Image
                                                                        data-mc-bar="bar"
                                                                        data-mc-baz="baz"
                                                                        alt="facebook"
                                                                        src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/facebook.png`}
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
                                                                subItem?.type === 'image' &&
                                                                <A href={subItem?.value?.link}
                                                                   textDecoration="none"
                                                                >
                                                                    <Image
                                                                        data-mc-bar="bar"
                                                                        data-mc-baz="baz"
                                                                        alt="image"
                                                                        src={subItem?.value?.image}
                                                                        style={{
                                                                            backgroundSize: 'contain',
                                                                            backgroundRepeat: 'no-repeat',
                                                                            backgroundPosition: 'center ',
                                                                            width: '135px',
                                                                            // height: 50,
                                                                            display: 'inline-block',
                                                                            marginRight: 8
                                                                        }}
                                                                    />
                                                                </A>
                                                            }
                                                            {
                                                                subItem?.type === 'social-link' &&
                                                                subItem?.value?.value?.includes('instagram.com') &&
                                                                <A href={subItem?.value?.value}
                                                                   style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
                                                                   textDecoration="none"
                                                                >
                                                                    <Image
                                                                        data-mc-bar="bar"
                                                                        data-mc-baz="baz"
                                                                        alt="instagram"
                                                                        src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/instagram_2021-06-02T18_28_57.874708.png`}
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
                                                                        alt="linkedin"
                                                                        src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/linkedin.png`}
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
                                                                subItem?.value?.value?.includes('twitter.com') &&
                                                                <A href={subItem?.value?.value}
                                                                   style={{color: state?.assets?.colors?.primary?.light}}
                                                                   textDecoration="none"
                                                                >
                                                                    <Image
                                                                        data-mc-bar="bar"
                                                                        data-mc-baz="baz"
                                                                        alt="twitter"
                                                                        src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/twitter.png`}
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
                                                                subItem?.type === 'link' &&
                                                                <A textDecoration="none"
                                                                   href={subItem?.value?.value}
                                                                >
                                                                    <Span
                                                                        style={{
                                                                            color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light,
                                                                        }}>
                                                                        {subItem?.value?.title}
                                                                    </Span>

                                                                </A>
                                                            }
                                                            {
                                                                subItem?.type === 'heading' &&
                                                                <Span style={{fontSize: 15, fontWeight: 'bold', color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : 'black'}}>
                                                                    {
                                                                        subItem?.value
                                                                    }
                                                                </Span>
                                                            }
                                                            {
                                                                subItem?.type === 'paragraph' &&
                                                                <Span style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : 'black'}}>
                                                                    {
                                                                        subItem?.value
                                                                    }
                                                                </Span>
                                                            }
                                                            {
                                                                subItem?.type === 'address' &&
                                                                <Span>
                                                                    {
                                                                        subItem?.value.length > 0 && subItem.value.map((add, addIndex) => {
                                                                            return (
                                                                                <A key={addIndex}
                                                                                   href={add?.value}
                                                                                   textDecoration="none"
                                                                                   style={{
                                                                                       color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light,
                                                                                       marginLeft: addIndex === 0 ? 0 : 8
                                                                                   }}
                                                                                >
                                                                                    {add.title}
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
                    }
                    {
                        state?.poweredByUrl &&
                        <Box width={'100%'}
                             style={{
                                 backgroundColor: state?.email?.footer?.backgroundColor ? state?.email?.footer?.backgroundColor : state?.assets?.colors?.secondary?.main,
                                 width: state?.emailWidth,
                             }}>
                            <Item
                                align={'center'}
                                style={{
                                    borderCollapse: 'collapse',
                                    borderSpacing: 0,
                                    marginLeft: 0,
                                    padding: 0,
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                    display: 'block',
                                }}
                            >
                                <A href={GENERAL_SETTINGS.STATIC_URL + state?.poweredByUrl}
                                   textDecoration="none"
                                >
                                    <Image
                                        data-mc-bar="bar"
                                        data-mc-baz="baz"
                                        alt="image"
                                        src={GENERAL_SETTINGS.STATIC_URL + state?.poweredByUrl}
                                        style={{
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center ',
                                            width: '135px',
                                            display: 'inline-block',
                                            marginRight: 8
                                        }}
                                    />
                                </A>
                            </Item>
                        </Box>
                    }
                </Email>
        )
        )
    }, [updatedBody]);

    useEffect(() => { // getting data for update email case
        if (isEmailSelected) {
            setIsLoaded(false);
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token: authToken,
                params: {
                    query: `code::${state.code},filetype:PB-EMAIL${router?.query?.emailOnly ? ',masterid:' + router?.query?.masterid : ''}`,
                    hotelrefno:  Number(companyId)
                }
            }).then(res1 => {
                if (res1?.status === 200 && res1?.data) {
                    if (res1?.data?.data?.length > 0) {
                        setEmailData(res1.data.data[0]);
                        setEmailGID(res1.data.data[0].gid);
                        setIsTemplate(res1.data.data[0].istemplate);
                        setCode(res1.data.data[0].code);
                        setDescription(res1.data.data[0].description);
                        ViewList({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.RAFILE,
                            token: authToken,
                            params: {
                                query: `refid::${res1.data.data[0].id},filetype:HTML`,
                                hotelrefno:  Number(companyId)
                            }
                        }).then(res2 => {
                            if (res2?.status === 200) {
                                if (res2?.data?.data?.length > 0) {
                                    setXhtmlGID(res2.data.data[0].gid);
                                    ViewList({
                                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                                        endpoint: OREST_ENDPOINT.RAFILE,
                                        token: authToken,
                                        params: {
                                            query: `refid::${res1.data.data[0].id},filetype:LANG.EMAIL`,
                                            hotelrefno: Number(companyId),
                                        },
                                    }).then(res3 => {
                                        setIsLoaded(true);
                                        if (res3?.status === 200 && res3?.data?.data?.length > 0) {
                                            setLangFileGID(res3.data.data[0].gid);
                                        }
                                    })
                                } else {
                                    setIsLoaded(true);
                                    toast.error('HTML template is not exist', {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                }
                            } else {
                                setIsLoaded(true);
                                const retErr = isErrorMsg(res2);
                                toast.error(retErr.errorMsg, {
                                    position: toast.POSITION.TOP_RIGHT
                                });
                            }
                        })
                    } else {
                        setIsLoaded(true);
                        toast.error('Email data is not exist', {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                } else {
                    setIsLoaded(true);
                    const retErr = isErrorMsg(res1);
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            })
        }
    }, [isEmailSelected]);

    const handleReset = () => { // reset everything for this component
        setCode('');
        setDescription('');
        setOpen(false);
        resetFinal('');
    }

    const handleSave = () => { // save and update email
        const encodedHtml = getEncodeHtml(html)
        const base64Html = window.btoa(unescape(encodeURIComponent(encodedHtml)));
        if (isEmailSelected) {
            emailData?.istemplate ? handleEmailInsert(base64Html) : handleEmailPatch(base64Html);
        } else {
            handleEmailInsert(base64Html);
        }
    }

    const handleLangFileHtml = (langCode) => { // handling html for language file
        const selectedLangFile = {
            header: state?.langsFile?.header?.[langCode],
            body: state?.langsFile?.body?.[langCode],
            footer: state?.langsFile?.footer?.[langCode]
        }
        const langHtml = renderEmail(
            <Email title={"Email"}>
                <Box width={'100%'}
                     style={{
                         backgroundColor: state?.email?.header?.backgroundColor ? state?.email?.header?.backgroundColor : state?.assets?.colors?.primary?.main,
                         width: state?.emailWidth,
                     }}
                >
                    {
                        state?.email?.header?.tpl === 'template-1' && <>
                            {
                                state?.email?.header?.items?.length > 0 &&
                                state.email.header.items.map((item, index) => {
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
                                                data-mc-bar="bar"
                                                data-mc-baz="baz"
                                                alt="logo"
                                                src={GENERAL_SETTINGS.STATIC_URL + state.logoUrl}
                                                style={{
                                                    backgroundSize: 'contain',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center ',
                                                    width: 120,
                                                    height: 50,
                                                    marginTop: 8
                                                }}
                                            />
                                        }
                                        {
                                            item?.type === 'social-link' &&
                                            item?.value?.length > 0 &&
                                            item.value.map((v, i) => {
                                                return(
                                                    <A key={i} href={v.link}
                                                       style={{color: state?.assets?.colors?.primary?.light}}
                                                       textDecoration="none"
                                                    >
                                                        {
                                                            v?.link?.includes('facebook.com') && <Image
                                                                data-mc-bar="bar"
                                                                data-mc-baz="baz"
                                                                alt="facebook"
                                                                src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/facebook.png`}
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
                                                                alt="instagram"
                                                                src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/instagram_2021-06-02T18_28_57.874708.png`}
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
                                                                alt="linkedin"
                                                                src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/linkedin.png`}
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
                                                                alt="twitter"
                                                                src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/twitter.png`}
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
                                        {
                                            item?.type === 'link' && <Span>
                                                {
                                                    item?.value?.length > 0 && item.value.map((v, i) => {
                                                        return (
                                                            <A key={i} href={v?.link}
                                                               style={{color: state?.assets?.colors?.primary?.light}}
                                                               textDecoration="none"
                                                            >
                                                                {selectedLangFile?.header.items[index]?.value[i]?.value}
                                                            </A>
                                                        )
                                                    })
                                                }
                                            </Span>
                                        }
                                    </Item> )
                                })
                            }
                        </>
                    }
                    {
                        (state?.email?.header?.tpl === 'template-2' || state?.email?.header?.tpl === 'template-3') &&
                        <tr>
                            {
                                selectedLangFile?.header?.items?.map((item, index) => {
                                    return (
                                        <td align={state?.email?.header?.items[index]?.alignment}>
                                            {
                                                state?.email?.header?.items[index]?.type === 'logo' && <Image key={index}
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
                                                state?.email?.header?.items[index]?.type === 'social-link' &&
                                                <Span key={index} style={{margin: 8}}>
                                                    {
                                                        state?.email?.header?.items[index]?.value?.length > 0 &&
                                                        state?.email?.header?.items[index].value.map((v, i) => {
                                                            return (
                                                                <A key={i} href={v?.link}
                                                                   style={{color: state?.assets?.colors?.primary?.light}}
                                                                   textDecoration="none"
                                                                >
                                                                    {
                                                                        v?.link?.includes('facebook.com') && <Image
                                                                            data-mc-bar="bar"
                                                                            data-mc-baz="baz"
                                                                            alt="react"
                                                                            src={'https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/facebook.png'}
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
                                                                            alt="instagram"
                                                                            src={'https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/instagram_2021-06-02T18_28_57.874708.png'}
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
                                                                            src={'https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/linkedin.png'}
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
                                                                            src={'https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/twitter.png'}
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
                                                state?.email?.header?.items[index]?.type === 'link' &&
                                                <Span key={index} style={{margin: 8}}>
                                                    {
                                                        item?.value?.length > 0 &&
                                                        item.value.map((v, i) => {
                                                            return (
                                                                <A key={i} href={state?.email?.header?.items[index]?.value[i].link}
                                                                   style={{color: state?.assets?.colors?.primary?.light}}
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
                    }
                </Box>
                {
                    updatedBody?.length > 0 && updatedBody.map((body, index) => {

                        return(
                            <Box key={index} width={'100%'}>
                                <Item
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                        width: state?.emailWidth,
                                        marginTop: 4
                                    }}
                                >
                                    {
                                        body?.items?.length > 0 && body.items.map((item, i) => {
                                            let imageHeight = '';
                                            if (body?.type === 'threecol') imageHeight = 150;
                                            else if (body?.type === 'twocol') imageHeight = 200;
                                            else imageHeight = 'auto'
                                            return(
                                                <>
                                                    {
                                                        item?.type === 'image' &&
                                                        <div style={{
                                                            position: 'relative',
                                                            width: item?.width + '%',
                                                            height: imageHeight,
                                                            marginLeft: i !==0 ? 8 : 0
                                                        }}>
                                                            {
                                                                item?.gid?.cta ?
                                                                    <A href={item?.gid?.cta} target={'_blank'}>
                                                                        <Image
                                                                            data-mc-bar="bar"
                                                                            data-mc-baz="baz"
                                                                            alt="image"
                                                                            src={GENERAL_SETTINGS.STATIC_URL + item?.gid?.fileurl}
                                                                            style={{
                                                                                backgroundSize: 'contain',
                                                                                backgroundRepeat: 'no-repeat',
                                                                                backgroundPosition: 'center ',
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                borderRadius: 5
                                                                            }}
                                                                        />
                                                                    </A> :
                                                                    <Image
                                                                        data-mc-bar="bar"
                                                                        data-mc-baz="baz"
                                                                        alt="image"
                                                                        src={GENERAL_SETTINGS.STATIC_URL + item?.gid?.fileurl}
                                                                        style={{
                                                                            backgroundSize: 'contain',
                                                                            backgroundRepeat: 'no-repeat',
                                                                            backgroundPosition: 'center ',
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            borderRadius: 5
                                                                        }}
                                                                    />
                                                            }
                                                            <div style={{
                                                                position: 'absolute',
                                                                left: '50%',
                                                                top: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                                zIndex: 999,
                                                            }}>
                                                                <h2 style={{
                                                                    fontSize: 24,
                                                                    fontWeight: "bold",
                                                                    fontFamily: 'monospace',
                                                                    color: 'white'
                                                                }}>
                                                                    {selectedLangFile?.body?.items[index]?.items[i]?.image?.title}
                                                                </h2>
                                                                <p style={{
                                                                    fontSize: 15,
                                                                    fontFamily: "monospace",
                                                                    color: 'white'
                                                                }}>
                                                                    {selectedLangFile?.body?.items[index]?.items[i]?.image?.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    }
                                                    {
                                                        item?.type === 'paragraph' &&
                                                        <div
                                                            style={{
                                                                width: item?.width + '%',
                                                                backgroundColor: item?.useBgColor ? state?.assets?.colors?.message?.main : 'white',
                                                                marginLeft: i !==0 ? 8 : 0
                                                            }}
                                                        >
                                                            <div dangerouslySetInnerHTML={{__html: selectedLangFile?.body?.items[index]?.items[i]?.text}}></div>
                                                        </div>
                                                    }
                                                </>
                                            )
                                        })
                                    }
                                </Item>
                            </Box>
                        )
                    })
                }
                {
                    state?.email?.footer?.items?.length > 0 &&
                    <Box width={'100%'}
                         style={{
                             backgroundColor: state?.email?.footer?.backgroundColor ? state?.email?.footer?.backgroundColor : state?.assets?.colors?.secondary?.main,
                             width: state?.emailWidth,
                             marginTop: 4,
                             minHeight: 70,
                         }}>
                        {
                            state.email.footer.items.map((item, index) => {
                                return(
                                    <Item key={index}
                                          align={item?.alignment}
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
                                            item?.items?.length > 0 && item.items.map((subItem, i) => {
                                                return(
                                                    <Span key={i} style={{margin: 8}}>
                                                        {
                                                            subItem?.type === 'social-link' &&
                                                            subItem?.value?.value?.includes('facebook.com') &&
                                                            <A href={subItem?.value?.value}
                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
                                                               textDecoration="none"
                                                            >
                                                                <Image
                                                                    data-mc-bar="bar"
                                                                    data-mc-baz="baz"
                                                                    alt="facebook"
                                                                    src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/facebook.png`}
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
                                                            subItem?.value?.value?.includes('instagram.com') &&
                                                            <A href={subItem?.value?.value}
                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
                                                               textDecoration="none"
                                                            >
                                                                <Image
                                                                    data-mc-bar="bar"
                                                                    data-mc-baz="baz"
                                                                    alt="instagram"
                                                                    src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/instagram_2021-06-02T18_28_57.874708.png`}
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
                                                            subItem?.type === 'image' &&
                                                            <A href={subItem?.value?.link}
                                                               textDecoration="none"
                                                            >
                                                                <Image
                                                                    data-mc-bar="bar"
                                                                    data-mc-baz="baz"
                                                                    alt="image"
                                                                    src={GENERAL_SETTINGS.STATIC_URL + subItem?.value?.image}
                                                                    style={{
                                                                        backgroundSize: 'contain',
                                                                        backgroundRepeat: 'no-repeat',
                                                                        backgroundPosition: 'center ',
                                                                        width: '135px',
                                                                        // height: 50,
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
                                                                    alt="linkedin"
                                                                    src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/linkedin.png`}
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
                                                            subItem?.value?.value?.includes('twitter.com') &&
                                                            <A href={subItem?.value?.value}
                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light}}
                                                               textDecoration="none"
                                                            >
                                                                <Image
                                                                    data-mc-bar="bar"
                                                                    data-mc-baz="baz"
                                                                    alt="twitter"
                                                                    src={`https://dev.hotech.dev/files//EA6EB310-5CE4-4106-AA7C-D9D67B1F7A66/twitter.png`}
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
                                                            subItem?.type === 'link' &&
                                                            <A textDecoration="none"
                                                               href={subItem?.value?.value}
                                                            >
                                                                <Span
                                                                    style={{
                                                                        color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light,
                                                                    }}>
                                                                    {selectedLangFile?.footer?.items[index]?.items[i]?.value}
                                                                </Span>

                                                            </A>
                                                        }
                                                        {
                                                            subItem?.type === 'heading' &&
                                                            <Span style={{fontSize: 15, fontWeight: 'bold', color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : 'black'}}>
                                                                {selectedLangFile?.footer?.items[index]?.items[i]?.value}
                                                            </Span>
                                                        }
                                                        {
                                                            subItem?.type === 'paragraph' &&
                                                            <Span style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : 'black'}}>
                                                                {selectedLangFile?.footer?.items[index]?.items[i]?.value}
                                                            </Span>
                                                        }
                                                        {
                                                            subItem?.type === 'address' &&
                                                            <Span>
                                                                {
                                                                    subItem?.value.length > 0 && subItem.value.map((add, addIndex) => {
                                                                        return(
                                                                            <A key={addIndex}
                                                                               href={add?.value}
                                                                               textDecoration="none"
                                                                               style={{color: state?.email?.footer?.textColor ? state?.email?.footer?.textColor : state?.assets?.colors?.secondary?.light,
                                                                                   marginLeft: addIndex === 0 ? 0 : 8
                                                                               }}
                                                                            >
                                                                                {add.title}
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
                }
                {
                    state?.poweredByUrl &&
                    <Box width={'100%'}
                         style={{
                             backgroundColor: state?.email?.footer?.backgroundColor ? state?.email?.footer?.backgroundColor : state?.assets?.colors?.secondary?.main,
                             width: state?.emailWidth,
                         }}>
                        <Item
                            align={'center'}
                            style={{
                                borderCollapse: 'collapse',
                                borderSpacing: 0,
                                marginLeft: 0,
                                padding: 0,
                                paddingTop: 10,
                                paddingBottom: 10,
                                display: 'block',
                            }}
                        >
                            <A href={GENERAL_SETTINGS.STATIC_URL + state?.poweredByUrl}
                               textDecoration="none"
                            >
                                <Image
                                    data-mc-bar="bar"
                                    data-mc-baz="baz"
                                    alt="image"
                                    src={GENERAL_SETTINGS.STATIC_URL + state?.poweredByUrl}
                                    style={{
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center ',
                                        width: '135px',
                                        display: 'inline-block',
                                        marginRight: 8
                                    }}
                                />
                            </A>
                        </Item>
                    </Box>
                }
            </Email>
        )
        return langHtml;
    }

    const handleEmailPatch = (encodedHtml) => { //update email into rafile with html content and language file
        setRequestSend(true);
        Patch({ // update email into rafile
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            gid: emailGID,
            data: {
                code: code,
                description: description,
                filetype: 'PB-EMAIL',
                contentype: '0000525',
                filedata: Buffer.from(JSON.stringify(state.email)).toString("base64"),
                masterid: router.query.masterid ? router.query.masterid: null,
                istemplate: isTemplate,
                hotelrefno: Number(companyId)
            },
        }).then(res => {
            if (res?.status === 200 && res?.data?.data) {
                Patch({ // update xhtml into rafile
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: authToken,
                    gid: xhtmlGID,
                    data: {
                        code: code,
                        contentype: '0000530',
                        filetype: 'HTML',
                        filedata: encodedHtml,
                        masterid: router.query.masterid ? router.query.masterid : res.data.data.mid,
                        refid: res?.data?.data?.id,
                        isbase64: true,
                        hotelrefno: Number(companyId)
                    },
                }).then(res1 => {
                    if (res1?.status === 200 && res1?.data?.data) {
                        Patch({ // update lang file for email
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.RAFILE,
                            token: authToken,
                            gid: langFileGID,
                            data: {
                                code: code,
                                filetype: 'LANG.EMAIL',
                                contentype: '0000525',
                                filedata: Buffer.from(JSON.stringify(state.langsFile)).toString("base64"),
                                masterid: router.query.masterid ? router.query.masterid : res.data.data.mid,
                                refid: res?.data?.data?.id,
                                hotelrefno: Number(companyId)
                            },
                        }).then(async res2 => {
                            if (res2?.status === 200 && res2?.data?.data) {
                                if (state.translatedLanguages.length > 0) {
                                    for (const lang of state.translatedLanguages) {
                                        const langHtml = handleLangFileHtml(lang.code.toLowerCase());
                                        const encodedHtml = getEncodeHtml(langHtml)
                                        const encodedLangHtml = window.btoa(unescape(encodeURIComponent(encodedHtml)));

                                        const langFileData = await handleLangRafileData({
                                            url: GENERAL_SETTINGS.OREST_URL + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.RAFILE + '/view/list',
                                            headers: {
                                                Authorization: `Bearer ${authToken}`,
                                                'Content-Type': 'application/json',
                                            },
                                            method: REQUEST_METHOD_CONST.GET,
                                            params: {
                                                query: `code::${state.code},filetype::LANG.HTML,refid:${res?.data?.data?.id},langid::${lang.id}`,
                                                chkselfish: false,
                                                hotelrefno:  Number(companyId)
                                            }
                                        })
                                        if (langFileData?.data?.data?.length > 0) {
                                            const langFilePatch = await handleLangRafileData({
                                                url: GENERAL_SETTINGS.OREST_URL + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.RAFILE +
                                                    `/patch/${langFileData?.data?.data[0]?.gid}`,
                                                headers: {
                                                    Authorization: `Bearer ${authToken}`,
                                                    'Content-Type': 'application/json',
                                                },
                                                method: REQUEST_METHOD_CONST.PATCH,
                                                data: {
                                                    code: code,
                                                    contentype: '0000530',
                                                    filetype: `LANG.HTML`,
                                                    filedata: encodedLangHtml,
                                                    masterid: router.query.masterid ? router.query.masterid : res.data.data.mid,
                                                    refid: res?.data?.data?.id,
                                                    isbase64: true,
                                                    langid: lang.id,
                                                    langcode: lang.code,
                                                    hotelrefno: Number(companyId)
                                                },
                                            });
                                            (langFilePatch?.status !== 200 || !langFilePatch?.data?.data) &&
                                            toast.error('Something went wrong while updating LANG.HTML. Please check network tab.', {position: toast.POSITION.TOP_RIGHT});
                                        }
                                        if (langFileData?.data?.data?.length === 0) {
                                            const langFileInsert = await handleLangRafileData({
                                                url: GENERAL_SETTINGS.OREST_URL + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.RAFILE +
                                                    `/ins`,
                                                headers: {
                                                    Authorization: `Bearer ${authToken}`,
                                                    'Content-Type': 'application/json',
                                                },
                                                method: REQUEST_METHOD_CONST.POST,
                                                data: {
                                                    contentype: '0000530',
                                                    filetype: `LANG.HTML`,
                                                    filedata: encodedLangHtml,
                                                    masterid: router.query.masterid ? router.query.masterid : res.data.data.mid,
                                                    refid: res?.data?.data?.id,
                                                    isbase64: true,
                                                    langid: lang.id,
                                                    langcode: lang.code,
                                                    hotelrefno: Number(companyId)
                                                },
                                            });
                                            (langFileInsert?.status !== 200 || !langFileInsert?.data?.data) &&
                                            toast.error('Something went wrong while inserting LANG.HTML. Please check network tab.', {position: toast.POSITION.TOP_RIGHT});
                                        }
                                    }
                                }
                                setRequestSend(false);
                                updateState('pageBuilder', 'previousStep', 0);
                                updateState('pageBuilder', 'isTemplate', false);
                                toast.success(UPDATE_SUCCESS, {
                                    position: toast.POSITION.TOP_RIGHT
                                });
                                if (router.query.emailOnly) {
                                    setTimeout(() => {
                                        window?.top?.postMessage("closePageBuilder", "*");
                                    }, 2000);
                                } else {
                                    updateState('pageBuilder', 'pageStep', 0);
                                }
                                handleReset();
                            }
                        })
                    } else {
                        setRequestSend(false);
                        if (res1?.data?.message) {
                            toast.error('Something went wrong while updating HTML. Please check network tab.', {
                                position: toast.POSITION.TOP_RIGHT
                            });
                        }
                    }
                })
            } else {
                setRequestSend(false);
                if (res?.data?.message) {
                    toast.error('Something went wrong while inserting PB-EMAIL. Please check network tab.', {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            }
        })
    }

    const handleLangRafileData = (options) => {
        return new Promise(async (resv) => {
            return await axios(options)
                .then(async (response) => {
                    resv(response);
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const handleEmailInsert = (encodedHtml) => { //insert email into rafile with html content and language file
        setRequestSend(true);
        Insert({ // insert email to rafile
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            data: {
                code: code,
                description: description,
                filetype: 'PB-EMAIL',
                contentype: '0000525',
                filedata: Buffer.from(JSON.stringify(state.email)).toString("base64"),
                istemplate: router?.query?.emailOnly ? false :  isTemplate,
                masterid: router?.query?.masterid ? router?.query?.masterid: null,
                hotelrefno: Number(companyId),
            },
        }).then(res => {
            if (res?.status === 200 && res?.data?.data) {
                Insert({ // insert html to rafile
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: authToken,
                    data: {
                        code: code,
                        contentype: '0000530',
                        filetype: 'HTML',
                        masterid: router?.query?.masterid ? router?.query?.masterid : res?.data?.data?.mid,
                        refid: res?.data?.data?.id,
                        filedata: encodedHtml,
                        isbase64: true,
                        hotelrefno: Number(companyId),
                    },
                }).then(res1 => {
                    if (res1?.status === 200 && res1?.data?.data) {
                        Insert({ // insert lang file to rafile
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.RAFILE,
                            token: authToken,
                            data: {
                                code: code,
                                filetype: 'LANG.EMAIL',
                                contentype: '0000525',
                                masterid: router?.query?.masterid ? router?.query?.masterid : res?.data?.data?.mid,
                                filedata: Buffer.from(JSON.stringify(state.langsFile)).toString("base64"),
                                isbase64: true,
                                refid: res?.data?.data?.id,
                                hotelrefno: Number(companyId),
                            },
                        }).then(async res2 => {
                            if (res2?.status === 200 && res2?.data?.data) {
                                if (state.translatedLanguages.length > 0) {
                                    for (const lang of state.translatedLanguages) {
                                        const langHtml = handleLangFileHtml(lang.code.toLowerCase());
                                        const encodedHtml = getEncodeHtml(langHtml);
                                        const encodedLangHtml = window.btoa(unescape(encodeURIComponent(encodedHtml)));
                                        const langFileInsert = await handleLangRafileData({
                                            url: GENERAL_SETTINGS.OREST_URL + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.RAFILE +
                                                `/ins`,
                                            headers: {
                                                Authorization: `Bearer ${authToken}`,
                                                'Content-Type': 'application/json',
                                            },
                                            method: REQUEST_METHOD_CONST.POST,
                                            data: {
                                                code: code,
                                                contentype: '0000530',
                                                filetype: `LANG.HTML`,
                                                filedata: encodedLangHtml,
                                                masterid: router.query.masterid ? router.query.masterid : res.data.data.mid,
                                                refid: res?.data?.data?.id,
                                                isbase64: true,
                                                langid: lang.id,
                                                langcode: lang.code,
                                                hotelrefno: Number(companyId)
                                            },
                                        });
                                        (langFileInsert?.status !== 200 || !langFileInsert?.data?.data) &&
                                        toast.error('Something went wrong while inserting LANG.HTML. Please check network tab.', {position: toast.POSITION.TOP_RIGHT});
                                    }
                                }
                                setRequestSend(false);
                                updateState('pageBuilder', 'previousStep', 0);
                                updateState('pageBuilder', 'isTemplate', false);
                                toast.success(SAVED_SUCCESS, {
                                    position: toast.POSITION.TOP_RIGHT
                                });
                                if (router?.query?.emailOnly) {
                                    setTimeout(() => {
                                        window?.top?.postMessage("closePageBuilder", "*");
                                    }, 2000);
                                } else {
                                    updateState('pageBuilder', 'pageStep', 0);
                                    updateState('pageBuilder', 'langsFile', {});
                                    updateState('pageBuilder', 'email', {
                                        header: {},
                                        body: [],
                                        footer: {}
                                    });
                                }
                                onSelectEmail(false);
                                handleReset();
                            }
                        })
                    } else {
                        setRequestSend(false);
                        if (res1?.data?.message) {
                            toast.error(res1?.data?.message, {
                                position: toast.POSITION.TOP_RIGHT
                            });
                        }
                    }
                })
            } else {
                setRequestSend(false);
                if (res?.data?.message) {
                    toast.error(res?.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            }
        })
    }

    return (
        <React.Fragment>
            <Dialog
                disableBackdropClick
                disableEnforceFocus
                fullWidth={true}
                maxWidth="md"
                open={isOpen}
                onClose={handleReset}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle color="secondary" > {dialogTitle} <hr /> </DialogTitle>
                <DialogContent className={isRequestSend ? classes.disableEvent : ''}>
                    {
                        !isLoaded ? <LoadingSpinner/> :
                            <Typography component={'div'}>
                                <Typography component={'div'} >
                                    <TextField
                                        label='Code'
                                        placeholder="Please enter code here ..."
                                        value={code}
                                        style={{minWidth: 500}}
                                        onChange={(e) => setCode(e.target.value)}
                                        variant="outlined"
                                    >
                                    </TextField>
                                </Typography>
                                <Typography component={'div'} style={{marginTop: 30}}>
                                    <TextField
                                        label='Description'
                                        placeholder="Please enter description here ..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        multiline
                                        style={{minWidth: 500}}
                                        rows={1}
                                        rowsMax={4}
                                        variant="outlined"
                                    />
                                </Typography>
                                {
                                    !router.query.emailOnly &&
                                    <Typography component={'div'}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isTemplate}
                                                    onChange={() => setIsTemplate(!isTemplate)}
                                                    name="istemplate"
                                                    color="primary"
                                                />
                                            }
                                            label="Save as Template"
                                        />
                                    </Typography>
                                }
                            </Typography>
                    }
                </DialogContent>
                <DialogActions className={isRequestSend ? classes.disableEvent : ''}>
                    <Button
                        onClick={handleReset}
                        variant="contained"
                        size="small"
                        aria-label="add"
                        className={classes.actionButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className={classes.actionButton}
                        variant="contained"
                        size="small"
                        aria-label="add"
                        color="primary"
                        disabled={!(description && code) || !isLoaded}
                    >
                        APPLY
                    </Button>
                </DialogActions>
            </Dialog>
            <ToastContainer autoClose={8000} />
        </React.Fragment>
    )
}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

const mapDispatchToProps = dispatch => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EmailSave);
