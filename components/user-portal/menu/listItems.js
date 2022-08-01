import React, { useEffect, useContext } from 'react';
import { connect, useSelector } from 'react-redux'
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import DescriptionIcon from '@material-ui/icons/Description';
import HelpIcon from '@material-ui/icons/Help';
import ReceiptIcon from '@material-ui/icons/Receipt';
import WebIcon from '@material-ui/icons/Web';
import WorkIcon from '@material-ui/icons/Work';
import { useRouter } from 'next/router';
import useTranslation from '../../../lib/translations/hooks/useTranslation';
import WebCmsGlobal from "../../webcms-global";

function MainListItems(props){
    const {isEmpPortal, isSupplierPortal} = props;
    const router = useRouter();
    const { locale } = useContext(WebCmsGlobal);
    const { t } = useTranslation();
    const licenceMenuStatus = (useSelector(state => state.hotelinfo.licenceMenuStatus) === 'true');

    const wikiOpen = () => {
        const win = window.open(`https://docs.hotech.systems/userdoc`, "_blank");
        win.focus();
    }

    const guideOpen = () => {
        if (locale === "tr") {
            const win = window.open(`https://docs.hotech.systems/userdoc?page=1O1LDvJLY50SMKDSIyqlLgFy4mKgTLWpAN01YON2VoZE&q=1-H2atl6cvMZgBqrG-SrpaJpnvev22_G8&lang=tr`, "_blank");
            win.focus();
        } else if (locale === "en") {
            const win = window.open(`https://docs.hotech.systems/userdoc?page=1_-RQDtH6b12T-I69KuoioiHTy25uD2M1jZH6JjGLUr8&q=1vvTTsebT1sRcKVVfiZhegKV2XvvY_o-d&lang=en`, "_blank");
            win.focus();
        }
    }
    
    useEffect(() => {
        if(!licenceMenuStatus && router.pathname.includes("my-licences")) {
            router.push("/hup/request")
        }
    },[licenceMenuStatus])

    const handleChangeRoute = (redirectUrl) => {
        const routerQuery = router.query
        router.push({
            pathname: redirectUrl,
            query: routerQuery
        })
    }

    if(isSupplierPortal){
        return (
            <React.Fragment>
                <ListItem button onClick={() => handleChangeRoute('/supplier/home')}>
                    <ListItemIcon>
                        <WebIcon style={{color:"#C2D8DA"}} />
                    </ListItemIcon>
                    <ListItemText  primary={t("str_dashboard")} />
                </ListItem>
                <ListItem button onClick={() => handleChangeRoute('/supplier/requests')}>
                    <ListItemIcon>
                        <WorkIcon style={{color:"#C2D8DA"}} />
                    </ListItemIcon>
                    <ListItemText  primary={t("str_requests")} />
                </ListItem>
                <ListItem button onClick={() => handleChangeRoute('/supplier/stats')}>
                    <ListItemIcon>
                        <DescriptionIcon style={{color:"#C2D8DA"}} />
                    </ListItemIcon>
                    <ListItemText  primary={t("str_stat")} />
                </ListItem>
            </React.Fragment>
        )
    } else if(isEmpPortal) {
        return (
            <React.Fragment>
                <ListItem button onClick={() => handleChangeRoute('/emp/home')}>
                    <ListItemIcon>
                        <WebIcon style={{color:"#C2D8DA"}} />
                    </ListItemIcon>
                    <ListItemText  primary={t("str_home")} />
                </ListItem>
                <ListItem button onClick={() => handleChangeRoute('/emp/applications')}>
                    <ListItemIcon>
                        <WorkIcon style={{color:"#C2D8DA"}} />
                    </ListItemIcon>
                    <ListItemText  primary={t("str_jobApplications")} />
                </ListItem>
                <ListItem button onClick={() => handleChangeRoute('/emp/cv')}>
                    <ListItemIcon>
                        <DescriptionIcon style={{color:"#C2D8DA"}} />
                    </ListItemIcon>
                    <ListItemText  primary={t("str_cv")} />
                </ListItem>
            </React.Fragment>
        )
    } else {
        return(
            <div>
                <ListItem button onClick={() => router.push("/hup/dashboard")}>
                    <ListItemIcon>
                        <EqualizerIcon style={{color:"#A5A4BF"}} />
                    </ListItemIcon>
                    <ListItemText  primary={t("str_dashboard")} />
                </ListItem>
                <ListItem button onClick={() => router.push("/hup/request")}>
                    <ListItemIcon>
                        <NoteAddIcon style={{color:"#A5A4BF"}} />
                    </ListItemIcon>
                    <ListItemText  primary={t("str_request")} />
                </ListItem>
                <ListItem button onClick={wikiOpen}>
                    <ListItemIcon>
                        <DescriptionIcon style={{color:"#A5A4BF"}} />
                    </ListItemIcon>
                    <ListItemText  primary={t("str_userDocs")} />
                </ListItem>
                {
                    licenceMenuStatus ? (
                        <ListItem button onClick={() => router.push("/hup/my-licences")}>
                            <ListItemIcon>
                                <img src="imgs/icons/id-badge-solid.png" style={{marginLeft:"4px", width:"16px"}}/>
                            </ListItemIcon>
                            <ListItemText  primary={t("str_myLicences")} />
                        </ListItem>
                    ) : null
                }
                <ListItem button onClick={() => router.push("/hup/billing")}>
                    <ListItemIcon>
                        <ReceiptIcon style={{color:"#A5A4BF"}} />
                    </ListItemIcon>
                    <ListItemText  primary={t("str_billing")} />
                </ListItem>
                <ListItem button onClick={guideOpen}>
                    <ListItemIcon>
                        <HelpIcon style={{color:"#A5A4BF"}} />
                    </ListItemIcon>
                    <ListItemText  primary={t("str_userGuide")} />
                </ListItem>
            </div>
        );
    }

}

export default MainListItems;


export const secondaryListItems = (
    <div>
    </div>
);