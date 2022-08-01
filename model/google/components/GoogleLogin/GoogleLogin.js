import React, {
    useEffect,
    useState
} from 'react';
import GoogleButton from '../../../../components/cloud-wiki/GoogleButton/GoogleButton';
import useGoogle from '../../useGoogle';
import {useSelector} from 'react-redux';
import useNotifications from '../../../notification/useNotifications';


function GoogleLogin(){
    // REDUX
    const {showSuccess} = useNotifications();
    const {setGoogleUserInfo, deleteGoogleUserInfo, deleteGoogleAuthInfo, setGoogleIsInitializing, setGoogleIsInitialized} = useGoogle();
    const isGoogleLoggedIn = useSelector(state => state.google.currentUser !== null);
    const currentUser = useSelector(state => state.google.currentUser !== null ? state.google.currentUser : null );
    const auth = useSelector(state => state.google.authInfo !== null ? state.google.authInfo : null)
    
    //HOOKS STATE
    const [isSignedIn, setIsSignedIn] = useState(false);
    
    useEffect(() => {
    },[])
    
    const handleSignIn = () => {
        if (auth) {
            setGoogleIsInitializing(true);
            auth.signIn().then(res => {
                const currentUser = {
                    auth: {
                        token_type: res.getAuthResponse().token_type,
                        access_token: res.getAuthResponse().access_token,
                        scope: res.getAuthResponse().scope,
                        login_hint: res.getAuthResponse().login_hint,
                        expires_in: res.getAuthResponse().expires_in,
                        id_token: res.getAuthResponse().id_token,
                        session_state: res.getAuthResponse().session_state,
                        first_issued_at: res.getAuthResponse().first_issued_at,
                        expires_at: res.getAuthResponse().expires_at,
                        idpId: res.getAuthResponse().idpId,
                    },
                    loginfo: {
                        id: res.getBasicProfile().getId(),
                        fullName: res.getBasicProfile().getName(0),
                        email: res.getBasicProfile().getEmail(),
                        profilePicture: res.getBasicProfile().getImageUrl()
                    }

                }
                setGoogleUserInfo(currentUser);
                setIsSignedIn(true);
                setGoogleIsInitialized(true);
                const userName = res.getBasicProfile().getName(0) || 'User';
                showSuccess('Welcome ' + userName);
                setGoogleIsInitializing(false);

            });
        }
    }
    
    const handleSignOut = () => {
        setGoogleIsInitializing(true);
        auth.signOut().then(() => {
            setIsSignedIn(false);
            deleteGoogleUserInfo();
            setGoogleIsInitialized(false);
            setGoogleIsInitializing(false);
            showSuccess('Signout Success');
        });
    };
    
    return(
        <>
            { isGoogleLoggedIn ?
                <GoogleButton
                    handleClick={handleSignOut}
                    label={`Sign Out From ${currentUser === null ? 'Google' :  currentUser?.loginfo?.fullName}`}
                />
                :
                <GoogleButton
                    handleClick={handleSignIn}
                    label={`Sign In With Google`}
                />
            }
        </>
    );

    
}

export default GoogleLogin;