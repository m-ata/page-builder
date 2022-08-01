import React from 'react'
import Register from 'components/guest/register/Register'
import axios from 'axios'

const Index = (props) => {
    const { maxAge, minAge } = props
    return <Register maxAge={maxAge} minAge={minAge}/>
}

export const getServerSideProps = async (ctx) => {
    const sett =  ctx.res.GENERAL_SETTINGS
    let maxAge = null, minAge = null

    if(!sett.hotelSettings.regenable){
        ctx.res.setHeader('location', '/guest/login')
        ctx.res.statusCode = 302
        ctx.res.end()
        return { props: {} }
    }

    if(sett.hotelSettings.regbirthdate){
        await axios({
            url: sett.BASE_URL + 'api/hotel/sett/crm/register/age',
            method: 'post',
        }).then((settCrmMaxAgeResponse) => {
            if(settCrmMaxAgeResponse.data.success){
                maxAge = settCrmMaxAgeResponse.data.maxage
                minAge = settCrmMaxAgeResponse.data.minage
            }
        })
    }

    return {
        props: {
            maxAge: maxAge,
            minAge: minAge
        },
    }
}

export default Index