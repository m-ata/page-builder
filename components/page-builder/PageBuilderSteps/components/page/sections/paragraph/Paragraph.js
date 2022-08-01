import React, { useContext, useEffect, useState } from 'react'
import { ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import { useRouter } from 'next/router'
import { OREST_ENDPOINT } from '../../../../../../../model/orest/constants'
import { connect, useSelector } from 'react-redux'

const Paragraph = (props) => {
    const { paragraph, state } = props
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal)
    const router = useRouter()
    const clientToken = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : router?.query?.authToken)
    const companyId = router?.query?.companyID || GENERAL_SETTINGS.HOTELREFNO
    const [data, setData] = useState('');
    const authToken = token || clientToken || router.query.authToken;

    useEffect(() => {
        if (paragraph?.gid) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                token: authToken,
                params: {
                    query: `gid:${paragraph.gid}`,
                    chkselfish: false,
                    hotelrefno: Number(companyId)
                },
            }).then((res) => {
                if (res.status === 200 && res.data.data.length > 0) {
                    setData(res.data.data[0].itemtext)
                }
            })
        } else {
            state.langCode !== state.defaultLang && setData(paragraph);
        }
    }, [paragraph])

    return <React.Fragment>
        {
            data && <div dangerouslySetInnerHTML={{__html: data}}></div>
        }
    </React.Fragment>
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

export default connect(mapStateToProps)(Paragraph)
