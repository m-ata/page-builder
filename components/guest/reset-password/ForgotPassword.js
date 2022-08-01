import React, { useContext } from 'react'
import GuestLayout from '../../layout/containers/GuestLayout'
import LoginBanner from '../../layout/components/LoginBanner'
import WebCmsGlobal from '../../webcms-global'
import { NextSeo } from 'next-seo'
import GuestForgotPasswordAction from "./GuestForgotPasswordAction"


export default function ForgotPassword() {
    const { WEBCMS_DATA } = useContext(WebCmsGlobal)

    return (
        <GuestLayout>
            <NextSeo title={'Forgot Password - ' + WEBCMS_DATA.assets.meta.title} />
            <LoginBanner />
            <GuestForgotPasswordAction />
        </GuestLayout>
    )
}
