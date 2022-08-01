import React, { useContext, useRef, useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { ViewList } from '@webcms/orest'
import { connect } from 'react-redux'
import { useRouter } from 'next/router'
import { setToState, updateState } from 'state/actions'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import CloseIcon from '@material-ui/icons/Close';
import {OREST_ENDPOINT} from "../../../../model/orest/constants";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import WebCmsGlobal from "../../../webcms-global";
import LoadingSpinner from "../../../LoadingSpinner";
import { useSnackbar } from 'notistack'



const FaqEditStep = (props) => {
    const { setToState } = props
    const router = useRouter();

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();

    const [faqFileList, setFaqFileList] = useState(null);
    const [selectedFaqGid, setSelectedFaqGid] = useState(null);
    const [isNewFaq, setIsNewFaq] = useState(false);
    const [faqFrameUrl, setFaqFrameUrl] = useState()
    const [frameIsDisplay, setFrameIsDisplay] = useState(false)
    const [loading, setLoading] = useState(false);

    const token = router.query.authToken;
    const companyId = router.query.companyID
    const masterid = router.query.masterid

    useEffect(() => {
        if(!isNewFaq) {
            getFileList();
        }
    }, [isNewFaq])

    useEffect(() => {
        let active = true
        if (active && (isNewFaq || Boolean(selectedFaqGid)) && masterid) {
            setFaqFrameUrl(window.location.protocol + '//' + window.location.host + '/page-builder?' + `isOweb=1&companyID=${companyId}&authToken=${token}&faqOnly=true&masterid=${masterid}&filegid=${selectedFaqGid}`)
        }

        return () => {
            active = false
        }
    },[isNewFaq, selectedFaqGid])


    const getFileList = () => {
        setLoading(true);
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token,
            params: {
                query: `code:GUESTAPP.FAQ,isactive:true`,
            }
        }).then(res => {
            if(res.status === 200) {
                setLoading(false)
                if(res.data.data.length > 0) {
                    setFaqFileList(res.data.data);
                }
            } else {
                setLoading(false);
                enqueueSnackbar("Faq files failed to load", { variant: 'error' })
            }
        })
    }

    return(
        <React.Fragment>
            <Grid container>
                <Grid item xs={12}>
                    <div style={{textAlign: "center", paddingBottom: "16px"}}>
                        <Button
                            color={"primary"}
                            variant={"contained"}
                            onClick={() => {
                                setSelectedFaqGid("");
                                setIsNewFaq(true);
                                setToState('pageBuilder', ['faq'], []);

                            }}
                        >
                            {t("str_newLanguage")}
                        </Button>
                    </div>
                </Grid>
                <React.Fragment>
                    {
                        loading ?
                            <div style={{textAlign: "center", margin: "auto"}}>
                                <LoadingSpinner />
                            </div>
                            :
                            faqFileList && faqFileList.length > 0 ?
                                faqFileList.map((item) => (
                                    <Grid item xs={12}>
                                        <div style={{textAlign: "center", paddingBottom: "16px"}}>
                                            <Button
                                                onClick={() => {setSelectedFaqGid(item.gid)}}
                                                color={"primary"}
                                                variant={"contained"}
                                            >
                                                {t("str_edit") + " " + `(${item.langcode})`}
                                            </Button>
                                        </div>
                                    </Grid>
                                )) : <Typography style={{textAlign:"center"}}>{t("str_noDataToDisplay")}</Typography>
                    }
                </React.Fragment>
            </Grid>
            <Dialog
                open={Boolean(selectedFaqGid) || isNewFaq}
                onClose={() => {
                    setSelectedFaqGid("");
                    setIsNewFaq(false);
                }}
                fullWidth
                maxWidth={"lg"}
                PaperProps={{
                    style:{
                        width: '100%',
                        height: '100%'
                    }
                }}
            >
                <div style={{position: "absolute", right: "16px"}}>
                    <IconButton
                        onClick={() => {
                            setSelectedFaqGid("");
                            setIsNewFaq(false);
                            setFrameIsDisplay(false);
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
                <div style={{width: "100%", height: "100%"}}>
                    {!frameIsDisplay && (<LoadingSpinner style={{marginTop: '20%'}} size={60}/>)}
                    <iframe
                        onLoadCapture={()=> setFrameIsDisplay(true)}
                        style={{
                            width: '100%',
                            height: '100%',
                            display: frameIsDisplay ? 'block' : 'none'
                        }} src={faqFrameUrl} frameBorder="0" allowFullScreen></iframe>
                </div>
            </Dialog>
        </React.Fragment>
    )
}


const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(FaqEditStep)