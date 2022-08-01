import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import { connect, useSelector } from 'react-redux'
import { Menu, MenuItem }  from '@material-ui/core'
import { ViewList } from '@webcms/orest'
import WebCmsGlobal from "../../../webcms-global";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import {DEFAULT_OREST_TOKEN, OREST_ENDPOINT} from "../../../../model/orest/constants";


const useStyles = makeStyles((theme) => ({
    popoverStyle: {
        minWidth:"300px",
        "&.MuiPopover-paper": {
            //marginLeft: "-90px"
        },
    },
}))


function NotificationPanel(props) {
    const classes = useStyles();

    const { popupState, bindMenu } = props;

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const token = useSelector(state => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN)
    const { t } = useTranslation()

    const [statusList, setStatusList] = useState([]);


    useEffect(() => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: "ratasklog",
            token,
            params: {
                query: "transno:1475137"
            }
        }).then(res => {
            if(res.status === 200) {
                console.log(res.data.data);
                setStatusList(res.data.data);
            }
        })
    }, [])


    return(
        <Menu
            classes={{
                paper: classes.popoverStyle,
                list: classes.menuStyle
            }}
            {...bindMenu(popupState)}
            getContentAnchorEl={null}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right"
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right"
            }}
        >
            {
                statusList.length > 0  ?
                    statusList.map((item, index) => (
                        <MenuItem key={`item-${index}`}>{ `1475137 - ${item.note}`}</MenuItem>
                    ))
                    :
                    null
            }
        </Menu>
    );
}

export default NotificationPanel;