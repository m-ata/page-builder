import React, {
    useEffect,
    useState,
    useContext,
} from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { resetState, setToState } from '../../../state/actions';
import {
    connect,
    useSelector
} from 'react-redux';
import {
    CheckPermissionFiles,
    DriveExportFileToHtml,
    DriveFilesFindById
} from '../../../model/google/components/DriveFiles/DriveFiles';
import LoadingSpinner from '../../LoadingSpinner';
import {useRouter} from 'next/router';
import Typography from '@material-ui/core/Typography';
import WikiMain from '../WikiMain/WikiMain';
import useTranslation from '../../../lib/translations/hooks/useTranslation';
import useNotifications from 'model/notification/useNotifications';
import { useSnackbar } from 'notistack';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MuiExpansionPanel from '@material-ui/core/Accordion';
import MuiExpansionPanelSummary from '@material-ui/core/AccordionSummary';
import MuiExpansionPanelDetails from '@material-ui/core/AccordionDetails';

const useStyles = makeStyles(theme => ({
    editButton: {
        color: "#FFF",
        "&:hover": {
            backgroundColor: "#151b26",
        },
        backgroundColor: "#151b26",
    },
    mainDiv: {
        "& p": {
            border: "none!important",
            //marginTop: "1em!important",
            marginBottom: "0!important"
        },
        "&  h1, h2, h3, h5, h6": {
            paddingTop: "64px!important",
        },
        '& h2': {
            fontSize: 'inherit'
        }
    }
}))

const Accordion = withStyles({
    root: {
        border: '1px solid #e0e0e0',
        boxShadow: 'none',
        maxWidth: 400,
        borderRadius: 3,
    },
    expanded: {},
})(MuiExpansionPanel)

const AccordionSummary = withStyles({
    root: {
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: "#cfd8dc",
        minHeight: 40,
        '&$expanded': {
            minHeight: 40,
        },
    },
    content: {
        '&$expanded': {
            margin: '0',
        },
    },
    expanded: {},
})(MuiExpansionPanelSummary)

const AccordionDetails = withStyles((theme) => ({
    root: {
        color: "#455a64",
        backgroundColor: "#eceff1",
    },
}))(MuiExpansionPanelDetails)


function WikiDoc(props){
    const classes = useStyles();
    
    // REDUX
    const { t } = useTranslation();
    const { showSuccess } = useNotifications();
    const { enqueueSnackbar } = useSnackbar()
    const { state, setToState } = props;
    const googleUser = useSelector(state => state.google !== null ? state.google : null);
    const loginfo = useSelector(state => state.orest.currentUser && state.orest.currentUser.loginfo);
    
    //HOOK STATE
    const router = useRouter();
    const [docHtml, setDocHtml] = useState(null);
    const [isDocLoading, setIsDocLoading] = useState(true);
    const [docName, setDocName] = useState(null);
    const [routerId, setRouterId] = useState("");
    const [userHaveAuthorization, setUserHaveAuthorization] = useState(false);
    const [googleToken, setGoogleToken] = useState("");
    const [fileInfo, setFileInfo] = useState(null);
    const [openContextMenu, setOpenContextMenu] = useState(false);
    const [mouseX, setMouseX] = useState(null);
    const [mouseY, setMouseY] = useState(null);
    const [newTabId, setNewTabId] = useState(null);
    const [headerId, setHeaderId] = useState(false);
    const [titleText, setTitleText] = useState("");
    let page = router.query.page;

    const [expanded, setExpanded] = useState('panel1')
    const handleChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false)
    }

    function handleEditButton(docId, fileInfo) {
        if(fileInfo.mimeType === "application/vnd.google-apps.shortcut") {
            const win = window.open('https://docs.google.com/document/d/' + fileInfo.shortcutDetails.targetId, '_blank');
            if (win != null) {
                win.focus();
            }
        } else {
            const win = window.open('https://docs.google.com/document/d/' + docId, '_blank');
            if (win != null) {
                win.focus();
            }
        }

    }

    const handleCopyLinkClipBoard = () => {
        if(window.location.href && window.location.href !== "") {
            navigator.clipboard.writeText(window.location.href).then( () => {
                enqueueSnackbar(t("str_linkSuccessfullyCopied"), { variant: 'success', autoHideDuration: 1000 })
            })
        }
    }

    String.prototype.deentitize = function() {
        let ret = this.replace(/&gt;/g, '>');
        ret = ret.replace(/&lt;/g, '<');
        ret = ret.replace(/&quot;/g, '"');
        ret = ret.replace(/&apos;/g, "'");
        ret = ret.replace(/&amp;/g, '&');
        return ret;
    };

    const handleIdFinder = (url) => {
        const docIdRegex = /id=(.*?)&/;
        const docIdRegex2 = /page=(.*?)&/;
        const docIdRegex3 = /d\/(.*)\//

        const decodeUrl = decodeURIComponent(url);

        let urlId;
        urlId = docIdRegex.exec(decodeUrl) || docIdRegex2.exec(decodeUrl) || docIdRegex3.exec(decodeUrl);
        return urlId ? urlId : null

    }

    const handleFindHeaderId = (url) => {
        const regexHeader1 = /#heading=(.*?)&/
        const regexHeader2 = /#(.*)/g

        const decodeUrl = decodeURIComponent(url);
        const titleId = regexHeader1.exec(decodeUrl) || regexHeader2.exec(decodeUrl)

        return titleId ? titleId : null
    }

    const handleAnchorClick = (e) => {
        const targetLink = e.target.closest('a')
        if (targetLink && targetLink.href) {
            const url = targetLink.href
            const urlId = handleIdFinder(url);
            const headerId = handleFindHeaderId(url)

            if(urlId) {
                if(headerId) {
                    router.push(`/userdoc?page=${urlId[1]}&q=${router.query.q}&lang=${router.query.lang}#${headerId[1]}`)
                } else {
                    router.push(`/userdoc?page=${urlId[1]}&q=${router.query.q}&lang=${router.query.lang}`)
                }
            } else {
                if(headerId?.[1]) {
                    router.push(`/userdoc?page=${router.query.page}&q=${router.query.q}&lang=${router.query.lang}#${headerId[1]}`)
                } else {
                    router.push(`/userdoc?page=${router.query.page}&q=${router.query.q}&lang=${router.query.lang}`)
                }
            }

        } else {
            return
        }

        if (!targetLink) return
        e.preventDefault()
    }

    const handleRightClick = (e) => {
        const targetLink = e.target.closest('a')
        if (targetLink && targetLink.href) {
            const url = targetLink.href
            const urlId = handleIdFinder(url);
            const headerId = handleFindHeaderId(url);
            if(urlId) {
                setMouseX(e.clientX - 2);
                setMouseY(e.clientY - 4);
                setOpenContextMenu(true);
                setNewTabId(urlId[1])
                setHeaderId(headerId);
            } else {
                if(headerId?.[1]) {
                    setMouseX(e.clientX - 2);
                    setMouseY(e.clientY - 4);
                    setOpenContextMenu(true);
                    setNewTabId(router.query.page)
                    setHeaderId(headerId);
                }
            }

        } else {
            return
        }

        if (!targetLink) return
        e.preventDefault()
    }

    const handleItemClick = (e) => {
        const targetLink = e.target.closest('li')
        if(targetLink) {
            const elementKey = targetLink.getAttribute("key")
            router.push(`/userdoc?page=${router.query.page}&q=${router.query.q}&lang=${router.query.lang}#${elementKey}`)
        }
    }

    const handleOpenInternalLinkNewTab = () => {
        setOpenContextMenu(false)
        if (newTabId) {
            if(headerId) {
                window.open(`/userdoc?page=${newTabId}&q=${router.query.q}&lang=${router.query.lang}#${headerId[1]}`, '_blank')
            } else {
                window.open(`/userdoc?page=${newTabId}&q=${router.query.q}&lang=${router.query.lang}`, '_blank')
            }
        }
    }
    const handleMouseThirdClick = (e) => {
        const targetLink = e.target.closest('a')
        if (targetLink && targetLink.href) {
            const url = targetLink.href
            const urlId = handleIdFinder(url)
            const headerId = handleFindHeaderId(url)
            if (e.button === 1) {
                if (urlId) {
                    if(headerId?.[1]) {
                        window.open(`/userdoc?page=${urlId[1]}&q=${router.query.q}&lang=${router.query.lang}#${headerId[1]}`, '_blank')
                    } else {
                        window.open(`/userdoc?page=${urlId[1]}&q=${router.query.q}&lang=${router.query.lang}`, '_blank')
                    }
                } else {
                    if(headerId?.[1]) {
                        window.open(`/userdoc?page=${router.query.page}&q=${router.query.q}&lang=${router.query.lang}#${headerId[1]}`, '_blank')
                    } else {
                        window.open(`/userdoc?page=${router.query.page}&q=${router.query.q}&lang=${router.query.lang}`, '_blank')
                    }
                }
            }
        } else {
            return
        }

        if (!targetLink) return
        e.preventDefault()
    }

    const handleCopyInternalLink = () => {
        setOpenContextMenu(false);
        if(newTabId) {
            navigator.clipboard.writeText(`${window.location.host}/userdoc?page=${newTabId}&q=${router.query.q}&lang=${router.query.lang}`).then( () => {
                enqueueSnackbar(t("str_linkSuccessfullyCopied"), { variant: 'success', autoHideDuration: 1000 })
            })
        }
    }

    const handleFindTitle = (docData) => {
        const headReg =  /<h(.*?)<\/h(.*?)>/gm;
        const spanReg = /<span(.*?)>(.*?)<\/span>/;
        const idReg = /id="(.*?)"/;
        const imgReg = /<img/m;
        const spanRegx = /<span>(.*?)<\/span><span(.*?)>(.*?)<\/span>/gm;
        let list;
        let text = "";
        let styleText = "";
        while ((list = headReg.exec(docData)) !== null) {
            let result1 = idReg.exec(list[0])
            let result2 = spanReg.exec(list[0])
            let imgResult = imgReg.exec(list[0])
            let spanResult = spanRegx.exec(list[0])

            if (result1 && result2) {
                let headers = {}
                if (!imgResult && result2[2] !== "") {
                    headers.id = result1[1]
                    if (spanResult) {
                        headers.title = spanResult[1] + spanResult[3];
                    } else {
                        const aRegex = /<a(.*?)>(.*?)<\/a>/
                        const findAElement = aRegex.exec(result2?.[2])
                        headers.title = findAElement && findAElement?.[2] ? findAElement[2] :  result2[2]
                    }

                    if(result2.input.includes("h1")) {
                        headers.title = `- ${headers.title}`
                        styleText = "list-style-type:none"
                    } else if(result2.input.includes("h2")) {
                        styleText = "padding-left:8px;"
                    } else if(result2.input.includes("h3")) {
                        styleText = "padding-left:24px;list-style-type:square"
                    } else if(result2.input.includes("h4")) {
                        styleText = "padding-left:32px;list-style-type:circle"
                    } else if(result2.input.includes("h5")) {
                        styleText = "padding-left:40px"
                    } else if(result2.input.includes("h6")) {
                        styleText = "padding-left:48px"
                    }
                    text = text + `<li key=${headers.id.toString()} style=${styleText};cursor:pointer;padding-top:8px;>${headers.title}</li>`
                }
            }
        }
        setTitleText(text)
    }

    const handleStyle = (docData) => {
        let replacedData = docData

        //p element
        const regex = /<p(.*?)>/gm
        const styleRegex = /font-family:(.*)"/
        const lineHeightRegex = /line-height:(.*?);/
        const heightRegex = /;height:(.*?);/
        let data;
        let replacedText;
        while ((data = regex.exec(docData)) !== null) {
            let style = "";
            replacedText = styleRegex.exec(data[0])
            if(replacedText) {
                if(replacedText[0].includes("line-height")) {
                    let lineHeight = lineHeightRegex.exec(replacedText[1])
                    if(lineHeight) {
                        style = `line-height:${lineHeight[1]}`
                    }
                }
                if(replacedText[0].includes(";height")) {
                    let height = heightRegex.exec((replacedText[1]))
                    if(height) {
                        if(style !== "") {
                            style = style + `;height:${height[1]}`
                        } else {
                            style = style + `height:${height[1]}`
                        }
                    }

                }
                if(style !== "") {
                    style = `${style}"`
                    replacedData = replacedData.replace(replacedText[0], style)
                }

            }
        }

        //span element
        const spanRegex = /<span(.*?)>/gm
        const fontStyleRegex = /font-style:(.*?)"/
        let spanData;
        let replacedSpanText = "";
        let spanStyle = "";
        while ((spanData = spanRegex.exec(replacedData)) !== null) {
            replacedSpanText = styleRegex.exec(spanData[0]);
            if(replacedSpanText) {
                const getFontStyleText = fontStyleRegex.exec(replacedSpanText[0])
                if(getFontStyleText) {
                    const fontStyle = getFontStyleText[1];
                    spanStyle = `font-style:${fontStyle}"`
                    replacedData = replacedData.replace(replacedSpanText[0], spanStyle)
                }
            }
        }

        // li element
        const liBeforeRegex = /<li(.*?)<\/li>/gm;
        const liStyleRegex = /style="(.*?)"/;
        const liFontSizeRegex = /font-size:(.*?);/;
        const liSpanRegex = /<span(.*)font-size:(.*?)"/;
        let liBeforeData;
        while ((liBeforeData = liBeforeRegex.exec(replacedData)) !== null) {
            const styleText = liStyleRegex.exec(liBeforeData[0])
            let replacedText = "";
            if(styleText) {
                const newFontSize = liSpanRegex.exec(liBeforeData[0])
                const oldFontSize = liFontSizeRegex.exec(styleText[0])
                if(newFontSize) {
                    if(oldFontSize) {
                        if(styleText[1]) {
                            replacedText = styleText[1].replace(oldFontSize[0], `font-size:${newFontSize[2]};`)
                            replacedData = replacedData.replace(styleText[1], replacedText)
                        }

                    }
                }

            }

        }

        return replacedData

    }

    useEffect(() => {
        if(!isDocLoading) {
            if (router.asPath.includes('#')) {
                let headerId = router.asPath.split('#');
                router.push(`/userdoc?page=${router.query.page}&q=${router.query.q}&lang=${router.query.lang}#${headerId[1]}`)
            }
        }
    }, [isDocLoading])


    useEffect(() => {
        setIsDocLoading(true);
        let googleDocId;
        googleDocId = page;
        setRouterId(page);
        setToState('cloudWiki', ['googleDocId'], googleDocId);
        const token =  googleUser?.currentUser?.auth?.token_type + ' ' + googleUser?.currentUser?.auth?.access_token || false ;
        if(token) {
            setGoogleToken(token);
        }
        if(googleDocId) {
            DriveFilesFindById(null,  googleDocId).then(res => {
                if(res.status === 200) {
                    let fileData = res.data;
                    setFileInfo(res.data);
                    setDocName(res.data.name);
                    if(fileData.mimeType === "application/vnd.google-apps.shortcut") {
                        DriveExportFileToHtml(null, fileData.shortcutDetails.targetId).then(res => {
                            if(res.status === 200) {
                                let docData = res.data && res.data.deentitize() || null
                                setDocHtml(docData)
                                handleFindTitle(docData)

                            } else {
                                setDocHtml(null);
                            }
                            setIsDocLoading(false)
                        })
                    } else {
                        DriveExportFileToHtml(null, googleDocId).then(res => {
                            if(res.status === 200) {
                                let docData = res.data && res.data.deentitize() || null
                                setDocHtml(docData)
                                handleFindTitle(docData)
                                setDocHtml(handleStyle(docData))
                            } else {
                                setDocHtml(null);
                            }
                            setIsDocLoading(false)
                        })
                    }
                }
            })
        } else {
            setIsDocLoading(false);
        }
    }, [page, googleUser.isInitialized])

    useEffect(() => {
        if(googleUser.isInitialized && googleToken) {
            if(routerId) {
                CheckPermissionFiles(googleToken, routerId).then(res => {
                    if(res.status === 200) {
                        setUserHaveAuthorization(true);
                    } else {
                        setUserHaveAuthorization(false);
                    }
                })
            }
        } else {
            setUserHaveAuthorization(false);
        }
       
    }, [googleUser.isInitialized, routerId, googleToken])
    
    
    if(isDocLoading) {
        return <LoadingSpinner />
    } else {
        if(docHtml !== null) {
            if(page) {
                return(
                    <Grid container>
                        <Menu
                            open={openContextMenu}
                            onClose={() => setOpenContextMenu(false)}
                            anchorReference="anchorPosition"
                            anchorPosition={
                                mouseY !== null && mouseX !== null
                                    ? { top: mouseY, left: mouseX }
                                    : undefined
                            }
                        >
                            <MenuItem onClick={handleOpenInternalLinkNewTab}>{t("str_openInNewTab")}</MenuItem>
                            <MenuItem onClick={handleCopyInternalLink}>{t("str_copyLink")}</MenuItem>

                        </Menu>
                        <Grid item xs={12}>
                        <div style={{float: "right", paddingBottom: "16px"}}>
                            {
                                loginfo && loginfo.hotelrefno === 999999 ? (
                                    <Button
                                        className={classes.editButton}
                                        style={{marginRight: "24px"}}
                                        variant="contained"
                                        onClick={handleCopyLinkClipBoard}
                                    >
                                        {t("str_copyLink")}
                                    </Button>
                                ) : null
                            }
                            {
                                userHaveAuthorization ? (
                                        <React.Fragment>
                                            <Button
                                                className={classes.editButton}
                                                variant="contained"
                                                onClick={() => {handleEditButton(state.googleDocId !== "home" ? state.googleDocId : routerId, fileInfo)}}
                                            >
                                                {t("str_edit")}
                                            </Button>
                                        </React.Fragment>
                                    ) : null
                            }
                        </div>
                        </Grid>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography style={{fontSize:"36px", fontWeight:"600",textAlign:"center"}}>{docName}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <div style={{width:"100%",height:"20px", backgroundColor:"#F0F0F7"}}/>
                        <Grid item xs={12}>
                            <Card style={{marginBottom: "24px"}}>
                                <CardContent>
                                    <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')} >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1d-content"
                                            id="panel1d-header"
                                        >
                                            <Typography style={{color:"#455a64", fontWeight:"bold"}}>{t("str_contents")}</Typography>
                                        </AccordionSummary>
                                            <AccordionDetails>
                                                <div onClick={handleItemClick} dangerouslySetInnerHTML={{__html: titleText}} />
                                            </AccordionDetails>
                                    </Accordion>
                                    <div
                                        onClick={handleAnchorClick}
                                        onKeyPress={handleAnchorClick}
                                        onContextMenu={handleRightClick}
                                        onMouseDown={handleMouseThirdClick}
                                        className={classes.mainDiv}
                                        dangerouslySetInnerHTML={{__html: docHtml}}/>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                );
            } else {
                return (
                    <WikiMain />
                );
            }
        } else {
            return (
                <WikiMain />
            );
        }
    }
    
   
    
    
    
}

const mapDispatchToProps = (dispatch) => ({
    resetState: () => dispatch(resetState()),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

const mapStateToProps = state => {
    return {
        state: state.formReducer.cloudWiki,
    }
}


export default connect(mapStateToProps, mapDispatchToProps,)(WikiDoc)