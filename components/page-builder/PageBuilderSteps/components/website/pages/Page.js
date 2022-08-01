import React, {useContext, useEffect, useState} from 'react';
import {ViewList} from "@webcms/orest";
import {OREST_ENDPOINT} from "../../../../../../model/orest/constants";
import WebCmsGlobal from "../../../../../webcms-global";
import {useRouter} from "next/router";
import { connect } from 'react-redux';
import PageItemList from "./PageItemList";

const Page = (props) => {

    const { gid, state, handleSelectedLink } = props;

    const [page, setPage] = useState(null);
    const [otherLangsPage, setOtherLangsPage] = useState(null);

    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const router = useRouter();
    const companyId = router.query.companyID;
    const authToken = token || router.query.authToken;

    useEffect(() => {
        if(gid) {
            //getting web page from rafile for default language
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token: authToken,
                params: {
                    hotelrefno: Number(companyId),
                    query: `gid:${gid}`,
                }
            }).then(res => {
                if (res.status === 200 && res.data && res.data.data) {
                    setPage(res.data.data[0]);
                    if (state.langCode !== state.defaultLang) {
                        //getting web page from rafile for other languages
                        ViewList({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.RAFILE,
                            token: authToken,
                            params: {
                                hotelrefno: Number(companyId),
                                query: `code::${res.data.data[0].code},filetype::LANG.WEBPAGE`,
                            }
                        }).then(res1 => {
                            if (res1.status === 200 && res1?.data?.data) {
                                setOtherLangsPage(JSON.parse(Buffer.from(res1.data.data[0].filedata, 'base64').toString('utf-8')));
                            }
                        })
                    }
                }
            })
        }
    }, [gid]);

    return(
        <React.Fragment>
            {
                page && <PageItemList
                    pageData={JSON.parse(Buffer.from(page.filedata, 'base64').toString('utf-8'))}
                    otherLangsPage={otherLangsPage}
                    handleSelectedLink={handleSelectedLink}
                />
            }
        </React.Fragment>
    )
}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
}

export default connect(mapStateToProps)(Page);
