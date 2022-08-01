import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { connect, useSelector } from 'react-redux'
import GuestLayout from 'components/layout/containers/GuestLayout'
import AccountBanner from 'components/layout/components/AccountBanner'
import MyProfile from 'components/guest/account/MyProfile'
import LoginComponent from 'components/LoginComponent/LoginComponent'
import { Card, CardContent, Container, Grid, Typography } from '@material-ui/core'
import LoadingSpinner from 'components/LoadingSpinner'
import { UseOrest } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import { useOrestAction } from 'model/orest'
import useTranslation from 'lib/translations/hooks/useTranslation'
import {mobileTelNoFormat, OREST_ENDPOINT} from '../../../model/orest/constants'
import { deleteFromState, setToState, updateState } from '../../../state/actions'
import {SLASH} from "../../../model/globals";

const Copyright = () => {
    return (
        <Typography align="center">
            <a href={'https://hotech.systems/'} target={'_blank'}>
                <img src={'imgs/powered-by.png'} style={{ width: 150 }} alt="powered by hotech" />
            </a>
        </Typography>
    )
}

const GuestProfile = (props) => {

    const { setToState, state } = props

    //context
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()

    //orest state
    const { setOrestState } = useOrestAction()

    //redux
    const token = useSelector(state => state?.orest?.currentUser?.auth?.access_token || false)
    const clientBase = useSelector((state) => state?.orest?.state?.client || false)

    //router
    const router = useRouter()

    //state
    const [ clientIsLoad, setClientIsLoad ] = useState(false)
    const [ clientIsLoading, setClientIsLoading ] = useState(true)

    let searchQuery = {
        id: router?.query?.id || false,
        code: router?.query?.code || false,
        refcode: router?.query?.refcode || false,
        firstname: router?.query?.firstname || false,
        lastname: router?.query?.lastname || false,
        email: router?.query?.email || false,
        mobile: router?.query?.telno || router?.query?.mobile || false,
        birthdate: router?.query?.birthdate || false,
        birthstr: router?.query?.birthstr || false,
        roomno: router?.query?.roomno || false,
        reservno: router?.query?.reservno || false,
        datestay: router?.query?.datestay || false,
        gid: router?.query?.gid || false
    }

    useEffect(() => {
        if(token && state.profile.loadGuest) {
            if(token){
                Object.keys(searchQuery).map((k) => {
                    if(!searchQuery[k]){
                        delete searchQuery[k]
                    }
                })

                if(searchQuery?.mobile){
                    searchQuery.mobile = mobileTelNoFormat(searchQuery.mobile)
                    if(!searchQuery.mobile.startsWith('00')) {
                        searchQuery.mobile = '00' + searchQuery.mobile
                    }
                }

                searchQuery.allhotels = true
                getClientLoadOrCreate(searchQuery)
            }else {
                setClientIsLoading(false)
            }
        }else{
            setClientIsLoading(false)
        }

    }, [token, state.profile.loadGuest])

    const getClientId = (searchQuery) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/id',
            token,
            params: searchQuery,
        }).then((clientIdResponse) => {
                if (clientIdResponse?.data?.data?.res) {
                    return clientIdResponse.data.data
                } else {
                    return false
                }
            }
        ).catch(() => {
            return false
        })
    }

    const getClientView = (useClient) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/view/get',
            token,
            params: {
                gid: useClient.gid,
                chkselfish: false,
                allhotels: true,
            },
        }).then((clientGetResponse) => {
            if (clientGetResponse?.data?.data) {
                return clientGetResponse.data.data
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const getDefClient = (clientData) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/def',
            method: 'GET',
            token
        }).then((clientListInsResponse) => {
            if (clientListInsResponse.status === 200 && clientListInsResponse?.data?.data) {
                clientListInsResponse.data.data.firstname = clientData.firstname
                clientListInsResponse.data.data.lastname = clientData.lastname
                clientListInsResponse.data.data.mobiletel = clientData.mobiletel
                clientListInsResponse.data.data.email = clientData.email
                return clientListInsResponse.data.data
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const getPhoneInfo = (mobileTel) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.PHONE + SLASH + OREST_ENDPOINT.INFO,
            token,
            params: {
                tel: mobileTel
            }
        }).then(res => {
            if(res.status === 200 && res.data.data) {
                return res.data.data
            } else {
                return false
            }
        })
    }

    const getClientLoadOrCreate = async (searchQuery) =>{
        setToState('userPortal', ['clientReservation'], false)
        let useClient = await getClientId(searchQuery)
        if(!useClient){
            useClient = await getDefClient({
                firstname: searchQuery.firstname || '',
                lastname: searchQuery.lastname || '',
                mobiletel: searchQuery.mobile || '',
                email: searchQuery.email || ''
            })
            if(searchQuery?.mobile) {
               const phoneInfo = await getPhoneInfo(searchQuery.mobile)
                if(phoneInfo) {
                    useClient.nationid = phoneInfo?.nationid
                    useClient.langid = phoneInfo?.langid
                    useClient.country = phoneInfo?.descineng
                }
            }
        }else{
            useClient = await getClientView(useClient)
        }

        if(useClient){
            setOrestState(['client'], useClient)
            setClientIsLoad(true)
            setClientIsLoading(false)
            setToState('guest', ['profile', 'loadGuest'], false)
        }else{
            setClientIsLoad(null)
            setClientIsLoading(false)
            setToState('guest', ['profile', 'loadGuest'], false)
        }
    }

    return (
        <GuestLayout isHideLoginButton={true} isShowFullName isGuestProfile>
            {clientIsLoading ? (
                <Container maxWidth='sm'>
                    <Grid container direction='row' justify='center' alignItems='center'>
                        <Grid item style={{ marginTop: 200 }}>
                            <LoadingSpinner />
                        </Grid>
                    </Grid>
                </Container>
            ) : (!clientIsLoading && !token) ? (
                <Container maxWidth="md" >
                    <Grid container direction="row" justify="center" alignItems="center">
                        <Grid item style={{ marginTop: 200, marginBottom: 200 }}>
                            <Card elevation={6}>
                                <CardContent>
                                    <Typography component="h1" variant="h5">
                                        {t('str_login')}
                                    </Typography>
                                    <div style={{ paddingTop: 15 }}/>
                                    <LoginComponent noQuery={true} isOnlyEmail={true}/>
                                    <div style={{ paddingTop: 15 }}/>
                                    <Copyright />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            ): (
                <React.Fragment>
                    <AccountBanner />
                    <div style={{ marginTop: 40, marginBottom: 40 }}>
                        <MyProfile isGuest isHistory clientParams={searchQuery}/>
                    </div>
                </React.Fragment>
            )}
        </GuestLayout>
    )

}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(GuestProfile)
