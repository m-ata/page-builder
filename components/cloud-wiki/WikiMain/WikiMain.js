import React, { useContext, useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {DriveExportFileToHtml} from "../../../model/google/components/DriveFiles/DriveFiles";
import WebCmsGlobal from "../../webcms-global";
import LoadingSpinner from "../../LoadingSpinner";



function WikiMain(){

    const { locale } = useContext(WebCmsGlobal);

    const [isDocLoading, setIsDocLoading] = useState(true);
    const [homePageData, setHomePageData] = useState(null);

    const homePages = {
        en: "1J182HUgqE3XKCse40qETQWKFHeuCkMU9y3j2RAotBGI",
        es: "17MqJ-dZ1qDIvjDJO6ITtYWyiORzQU0jOt5mHrsYhhv0",
        tr: "1r3NUW_Ci562Ayor4t6J8tJRt4jHWOpZYmx51V1QqBHM"
    }

     useEffect(() => {
         let driveId = "";
         if(locale === "en") {
             driveId = homePages.en
         } else if(locale === "es") {
             driveId = homePages.es;
         } else if(locale === "tr") {
             driveId = homePages.tr
         }
         DriveExportFileToHtml(null, driveId).then(res => {
             if(res.status === 200) {
                 let docData = res.data
                 setHomePageData(docData);
                 setIsDocLoading(false);

             } else {
                 setHomePageData(null);
                 setIsDocLoading(false)
             }
         })
     }, [locale])

    if(isDocLoading) {
        return(
            <LoadingSpinner />
        );
    } else {
        return(
            <Grid container>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <div dangerouslySetInnerHTML={{__html: homePageData}}/>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    }
}

export default WikiMain;