import React, { useState, useEffect} from 'react';
import { NextSeo } from 'next-seo'
import { Button } from '@material-ui/core';
import WikiDoc from '../../components/cloud-wiki/WikiDoc/WikiDoc';
import CloudWikiWrapper from '../../components/cloud-wiki/CloudWikiWrapper/CloudWikiWrapper';
import {connect, useSelector} from 'react-redux';
import useGoogle from "../../model/google/useGoogle";
import {GOOGLE_API_CLIENT_ID, GOOGLE_API_SCOPE} from "../../model/google/constants";
import { useSnackbar } from 'notistack';

const HomePage = () => {

    const { enqueueSnackbar } = useSnackbar();
    const {setGoogleUserInfo,  setGoogleIsInitializing, setGoogleIsInitialized, setGoogleAuthInfo} = useGoogle();
    const googleUser = useSelector(state => state?.google || false );
    const orestCurrentUser = useSelector(state => state?.orest?.currentUser || false);
    const loginfo = useSelector(state => state?.orest?.currentUser?.loginfo || false);

    const [isSignedIn, setIsSignedIn] = useState(false);

    const handleGoogleInit = () => {
        setGoogleIsInitializing(true);
        window.gapi.load('auth2', () => {
            window.gapi.auth2.init({
                clientId: GOOGLE_API_CLIENT_ID,
                scope: GOOGLE_API_SCOPE,
            }).then((onInit, onError) => {
                if(onInit) {
                    const auth = window.gapi.auth2.getAuthInstance();
                    setGoogleAuthInfo(auth);
                    setIsSignedIn(auth.isSignedIn.get());
                    if(auth.isSignedIn.get()) {
                        const currentUser = {
                            auth: window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(),
                            loginfo: {
                                id: window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getId(),
                                fullName: window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName(),
                                name: window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getGivenName(),
                                lastName: window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getFamilyName(),
                                email: window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail(),
                                profilePicture: window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getImageUrl()
                            }

                        }
                        setGoogleIsInitializing(false);
                        setGoogleUserInfo(currentUser);
                    } else {
                        setGoogleIsInitialized(false);
                        setGoogleIsInitializing(false);
                    }
                } else if(onError) {
                    enqueueSnackbar('Google auth library could not be loaded', { variant: 'error', autoHideDuration: 10000, action: tryAgainLoadingPage()})
                    setGoogleUserInfo(null);
                    console.log(onError);
                    setGoogleIsInitialized(false);
                    setGoogleIsInitializing(false);
                }
            })
        })
    }

    useEffect(() => {
        if(orestCurrentUser && (loginfo.hotelrefno === 999999 || loginfo.hotelrefno === 115445176)) {
            if (!isSignedIn) {
                const script = document.createElement("script")
                script.type = "text/javascript";
                if (script.readyState){  //IE
                    script.onreadystatechange = () => {
                        if (script.readyState === "loaded" ||
                            script.readyState === "complete"){
                            script.onreadystatechange = null;
                        }
                    };
                } else {  //Others
                    script.onload = () => {
                        handleGoogleInit()
                    };
                }

                script.src = 'https://apis.google.com/js/platform.js';
                document.getElementsByTagName("head")[0].appendChild(script);
            }
        } else {
            setGoogleIsInitialized(false);
        }
    },[orestCurrentUser])

    useEffect(() => {
        if(googleUser.currentUser) {
            setGoogleIsInitialized(true);
        }
    }, [googleUser.currentUser])

    const tryAgainLoadingPage = () =>  {
        return (
            <React.Fragment>
                <Button variant={'outlined'} style={{textTransform: "none"}} onClick={() => window.location.reload()} color="inherit">
                    Reload the page ?
                </Button>
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            <NextSeo title={"User Docs"}/>
            <CloudWikiWrapper>
                <WikiDoc />
            </CloudWikiWrapper>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.cloudWiki,
    }
}

export default connect(mapStateToProps, null)(HomePage)
