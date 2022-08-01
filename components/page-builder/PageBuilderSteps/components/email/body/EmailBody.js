import React, {useContext, useEffect, useState} from 'react';
import { renderEmail } from 'react-html-email'
import {isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST} from "../../../../../../model/orest/constants";
import {connect} from "react-redux";
import {useRouter} from "next/router";
import WebCmsGlobal from "../../../../../webcms-global";
import axios from "axios";
import {toast} from "react-toastify";

const EmailBody = (props) => {

    const { items, otherLangItems, state } = props;
    const [updatedItems, setUpdatedItems] = useState([]);
    const router = useRouter();
    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const companyId = router.query.companyID;
    const authToken = token || router.query.authToken;

    const [render, setRender] = useState('');

    const getData = async (options) => { // get data according to options provided
        return new Promise(async (resv, rej) => {
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

    useEffect( () => {
        items.length > 0 && handleItems();
    }, [items, otherLangItems]);

    const handleItems = async () => {
        let req = [];
        for (let item of items) {
            const index = items.indexOf(item);
            if (item?.type === 'image') {
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
                        query: `gid:${item?.gid}`,
                        hotelrefno: Number(companyId),
                    },
                }
                const img = await getData(HCMITEMIMG_REQUEST_OPTIONS);
                if (img.status === 200) {
                    const newItem = {
                        id: item?.id,
                        service: item?.service,
                        type: item?.type,
                        width: item?.width,
                        gid: item?.gid
                    };
                    newItem.gid = img?.data?.data[0];
                    if (state.langCode !== state.defaultLang && otherLangItems &&
                        otherLangItems.length > 0
                    ) {
                        newItem.gid.title = otherLangItems[index].image.title;
                        newItem.gid.description = otherLangItems[index].image.description;
                    }
                    req.push({
                        status: 200,
                        data: newItem
                    });
                }
            }
            if (item?.type === 'paragraph') {
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
                        query: `gid:${item?.gid}`,
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
                        gid: item?.gid
                    };
                    if (state.langCode === state.defaultLang) {
                        newItem.gid = txt?.data?.data[0]?.itemtext;
                    } else {
                        if (otherLangItems && otherLangItems.length > 0) {
                            newItem.gid = otherLangItems[index].text;
                        }
                    }
                    req.push({
                        status: 200,
                        data: newItem
                    });
                }
            }
        }
        await Promise.all(req).then(async (res) => {
            const newItems = [];
            await res.map((r) => {
                if (r.status == 200) {
                    newItems.push(r.data);
                    return
                }
            })
            setUpdatedItems(newItems)
        })
    }

    useEffect(() => { // set render for preview each email body
        setRender(
            renderEmail(
                <div >
                    {/*<Box width={'100%'} style={{marginTop: 8, marginBottom: 8,}}>*/}
                        {/*<Item style={{display: 'flex', justifyContent: 'center'}}>*/}
                            {
                                updatedItems.length > 0 && updatedItems.map((item) => {
                                    return(
                                        <>
                                            {
                                                item?.type === 'image' &&
                                                    <div style={{
                                                        height: item?.width + '%',
                                                        position: 'relative',
                                                        width: item?.width + '%',
                                                        marginLeft: 8,
                                                        marginRight: 8
                                                    }}>
                                                        <img
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
                                                            }}
                                                        />
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
                                                            }} > {item?.gid?.title} </h2>
                                                            <p style={{
                                                                fontSize: 15,
                                                                fontFamily: "monospace",
                                                                color: 'white'
                                                            }} > {item?.gid?.description} </p>
                                                        </div>
                                                    </div>
                                            }
                                            {
                                                item?.type === 'paragraph' &&
                                                    <div
                                                        style={{
                                                            width: item?.width + '%',
                                                            marginLeft: 8,
                                                            marginRight: 8
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
                        {/*</Item>*/}
                    {/*</Box>*/}
                </div>
            )
        )
    },[updatedItems]);

    return (
        <div dangerouslySetInnerHTML={{__html: render}}></div>
    )

}
const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

export default connect(
    mapStateToProps,
)(EmailBody);