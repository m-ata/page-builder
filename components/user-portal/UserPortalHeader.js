import React, {useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {ViewList} from "@webcms/orest";
import {setToState} from "../../state/actions";
import Button from '@material-ui/core/Button';
import {DEFAULT_OREST_TOKEN, OREST_ENDPOINT} from "../../model/orest/constants";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import useNotifications from "../../model/notification/useNotifications";
import WebCmsGlobal from "../webcms-global";
import Avatar from "@material-ui/core/Avatar";
import {useOrestAction} from "../../model/orest";
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    item1: {
        flexGrow: 1,
    },
    item2: {
        marginRight: theme.spacing(2),
    }
}));

export default function UserPortalHeader() {
    const { t } = useTranslation()
    const classes = useStyles();
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);

    //state
    const [profilePicture, setProfilePicture] = useState(null);

    //redux
    const {showError} = useNotifications();
    const {deleteOrestCurrentUserInfo} = useOrestAction();
    const loginfo = useSelector(state => state.orest.currentUser && state.orest.currentUser.loginfo);
    const token = useSelector(state => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN);
    const isLoggedIn = useSelector(state => state.orest.currentUser && state.orest.currentUser.auth);


    useEffect(() => {
        let active = true;
        if (active) {
            if (loginfo && loginfo.refid) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.EMPLOYEE,
                    token,
                    params: {
                        query: 'id:' + loginfo.refid
                    },
                }).then(r => {
                    if (active) {
                        if (r.status === 200 && r.data.count > 0) {
                            setToState(r.data.data[0])
                        } else {
                            showError('Something went wrong!');
                        }
                    }
                });

            }

        }
        return () => {
            active = false;
        };
    }, []);

    function handleClickLogout() {
        deleteOrestCurrentUserInfo()
    }

    return (
        <React.Fragment>
            <AppBar position="static" color="inherit">
                <Toolbar>
                    <Typography>
                        {t('str_userPortal')}
                    </Typography>
                </Toolbar>
            </AppBar>
        </React.Fragment>
    )
};
