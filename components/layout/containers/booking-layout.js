import React, { useEffect, useState } from 'react'
import Header from 'components/layout/Header'
import Footer from 'components/layout/Footer'
import { useRouter } from 'next/router'

export default function BookingLayout(props) {
    const router = useRouter()
        , iframe = router.query.iframe === 'true'

    return (
        <React.Fragment>
            {!iframe ? <Header langSelect={true} loginButton={true} />: null}
            {props.children}
            {!iframe ? <Footer /> : null}
        </React.Fragment>
    )
}
