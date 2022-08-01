import React from 'react'
import { useSelector } from 'react-redux'
import SurveyLoginPage from 'components/survey/login/SurveyLogin'
import SurveyTree from 'components/survey/surveytree'
import Router, { useRouter } from 'next/router'
import useTranslation from 'lib/translations/hooks/useTranslation'

export default function Index() {
    const { t } = useTranslation()
        , router = useRouter()
        , auth = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
        , isLogin = !!useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth)
        , reftoken = router.query.reftoken
        , refurl = router.query.refurl
        , clientGid =  router.query.clientGid
        , empGid =  router.query.empGid

    if (!auth && !reftoken && !clientGid && !empGid) {
        return <SurveyLoginPage />
    }

    if (isLogin && refurl) {
        Router.push(refurl)
        return <React.Fragment>{t('str_pleaseWait')}</React.Fragment>
    } else {
        return <SurveyTree />
    }
}
