//react import
import React, {useState, useEffect, useContext} from 'react';
//material imports
import Container from '@material-ui/core/Container';
import Grid from "@material-ui/core/Grid";
import Paper from '@material-ui/core/Paper'
import {makeStyles} from '@material-ui/core';
import WebIcon from '@material-ui/icons/Web';
import Typography from "@material-ui/core/Typography";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import EmailIcon from '@material-ui/icons/Email'
import IconButton from "@material-ui/core/IconButton";
//router import
import {useRouter} from "next/router";
//redux imports
import {connect} from "react-redux";
import {setToState, updateState} from "../../../../../state/actions";

import {Delete, ViewList} from "@webcms/orest";

import clsx from 'clsx'

import {toast} from "react-toastify";
//custom imports
import Image from "../../components/page/sections/image/Image";
import Paragraph from "../../components/page/sections/paragraph/Paragraph";
import EmailHeader from "../../components/email/header/EmailHeader";
import EmailFooter from "../../components/email/footer/EmailFooter";
import WebCmsGlobal from "components/webcms-global";
import {COLORS, DELETE_SUCCESS} from "../../constants";
import Header from "../../components/website/header/Header";
import Page from "../../components/website/pages/Page";
import Footer from "../../components/website/footer/Footer";
import LoadingSpinner from "../../../../LoadingSpinner";
import {isErrorMsg, OREST_ENDPOINT} from "model/orest/constants";
import {AlertDialog} from "../../components/alert";
import RenderWebPage from '../RenderWebPage';
//font awsome imports
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faWeebly} from '@fortawesome/free-brands-svg-icons'
import {faTextHeight} from '@fortawesome/free-solid-svg-icons'

const useStyles = makeStyles(() => ({
    pageRoot: {
        flexGrow: 1
    },
    pageBlock: {
        border: `2px solid ${COLORS?.secondary}`,
    },
    pagePaperUl: {
        listStyleType: 'none',
        minHeight: 50,
    },
    pagePaperLi: {
        cursor: 'pointer',
        color: COLORS?.secondary,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    disableEvent: {
        pointerEvents: "none",
        opacity: 0.5
    },
}));

const Home = (props) => {

    const {
        state,
        onSelectPage,
        updateState,
        onSelectWebsite,
        onSelectEmail
    } = props;

    const cls = useStyles();
    const router = useRouter();
    const companyId = router?.query?.companyID;

    const [description, setDescription] = useState('');
    const [selectedIndex, setSelectedIndex] = useState();
    const [url, setUrl] = useState('');
    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const [isLoaded, setIsLoaded] = useState(false);
    const [data, setData] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAlert, setAlert] = React.useState(false);
    const [alertDialogType, setAlertDialogType] = useState('');
    const [deletedGID, setDeletedGID] = useState('');
    const [isDeleteIconShow, setDeleteIconShow] = useState(false);
    const [hoverIndex, setHoverIndex] = useState(null);
    const authToken = token || router.query.authToken;

    useEffect(() => {
        let fileType;
        setIsLoaded(false);
        switch (state.type) {
            case 'webPage':
                fileType = 'WEBPAGE';
                break;
            case 'website':
                fileType = 'WEBSITE';
                break;
            case 'email':
                fileType = 'PB-EMAIL';
                break;
            case 'emailOnly':
                fileType = 'PB-EMAIL';
                break;
            default:
                fileType = '';
        }
        if (state.type === 'webPage' || state.type === 'website' ||
            state.type === 'email' || state.type === 'emailOnly') {
            //getting data from rafile
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token: authToken,
                params: {
                    hotelrefno: Number(companyId),
                    query: `filetype::${fileType},${(state?.type === 'emailOnly') ? 'istemplate::true' : ''}`,
                }
            }).then(res => {
                setIsLoaded(true);
                if (res.status === 200 && res.data && res.data.data) {
                    setData(res.data.data);
                }
            })
        } else {
            setIsLoaded(true);
            setData([]);
        }

    }, [state.type]);

    useEffect(() => { //setting url
        if (window && window.location && window.location.port) {
            setUrl(`${window.location.protocol}//${window.location.hostname}:${window.location.port}`);
        } else {
            setUrl(`${window.location.protocol}//${window.location.hostname}`);
        }
        updateState('pageBuilder', 'langCode', state.defaultLang);
        updateState('pageBuilder', 'langId', state.defaultLangId);
        updateState('pageBuilder', 'isTemplate', false);
    }, []);

    useEffect(() => {
        if (state.pageStep === 0) {
            updateState('pageBuilder', 'code', '');
            if (state.type === 'webPage') {
                updateState('pageBuilder', 'page', {id: '', sections: []});
            }
            if (state.type === 'website') {
                updateState('pageBuilder', 'website', {
                    header: {},
                    footer: {},
                    pages: []
                });
            }
            if (state.type === 'email' || state.type === 'emailOnly') {
                updateState('pageBuilder', 'email', {
                    header: {},
                    footer: {},
                    body: []
                });
            }
        }
    }, [state.pageStep]);

    const handleSelect = (data, index) => {
        if (selectedIndex === index) {
            updateState('pageBuilder', 'langsFile', {});
            updateState('pageBuilder', 'isTemplate', false);
            updateState('pageBuilder', 'code', '');
            setSelectedIndex(null);
            setDescription('');
            if (state.type === 'webPage') {
                updateState('pageBuilder', 'page', {
                    id: '',
                    sections: []
                });
                onSelectPage(false);
            }
            if (state.type === 'website') {
                const website = {
                    header: {},
                    footer: {},
                    pages: [],
                }
                updateState('pageBuilder', 'footerOnly', false);
                updateState('pageBuilder', 'website', website);
                onSelectWebsite(false);
            }
            if (state.type === 'email' || state.type === 'emailOnly') {
                const email = {
                    header: {},
                    footer: {},
                    body: []
                }
                updateState('pageBuilder', 'email', email);
                onSelectEmail(false);
            }
        } else {
            updateState('pageBuilder', 'isTemplate', data?.istemplate);
            if (state.type === 'webPage') {
                const page = JSON.parse(Buffer.from(data.filedata, 'base64').toString('utf-8'));
                updateState('pageBuilder', 'page', page);
                onSelectPage(true);
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: authToken,
                    params: {
                        hotelrefno: Number(companyId),
                        query: `filetype:LANG.WEBPAGE,code::${data.code}`,
                    }
                }).then(res => {
                    if (res.status === 200 && res.data && res.data.data.length > 0) {
                        const langFile = JSON.parse(Buffer.from(res.data.data[0].filedata, 'base64').toString('utf-8'));
                        updateState('pageBuilder', 'langsFile', langFile);
                    }
                })
            }
            if (state.type === 'website') {
                const website = JSON.parse(Buffer.from(data.filedata, 'base64').toString('utf-8'));
                updateState('pageBuilder', 'website', website);
                onSelectWebsite(true);
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: authToken,
                    params: {
                        hotelrefno: Number(companyId),
                        query: `filetype:LANG.WEBSITE,code::${data.code}`,
                    }
                }).then(res => {
                    if (res.status === 200 && res.data && res.data.data.length > 0) {
                        const langFile = JSON.parse(Buffer.from(res.data.data[0].filedata, 'base64').toString('utf-8'));
                        updateState('pageBuilder', 'langsFile', langFile);
                    }
                })
            }
            if (state.type === 'email' || state.type === 'emailOnly') {
                const email = JSON.parse(Buffer.from(data.filedata, 'base64').toString('utf-8'));
                updateState('pageBuilder', 'email', email);
                onSelectEmail(true);
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: authToken,
                    params: {
                        hotelrefno: Number(companyId),
                        query: `filetype:LANG.EMAIL,code:${data.code}`,
                    }
                }).then(res => {
                    if (res.status === 200 && res.data && res.data.data.length > 0) {
                        const langFile = JSON.parse(Buffer.from(res.data.data[0].filedata, 'base64').toString('utf-8'));
                        updateState('pageBuilder', 'langsFile', langFile);
                    }
                })
            }
            updateState('pageBuilder', 'code', data.code);
            setDescription(data.description);
            setSelectedIndex(index);
        }
    }

    const handleDeletePage = (gid) => {
        setIsDeleting(true);
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            gid: gid,
            params: {
                hotelrefno: Number(companyId)
            }
        }).then(res => {
            setIsDeleting(false);
            if (res.status === 200) {
                toast.success(DELETE_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT
                });
                setIsLoaded(false);
                let fileType = '';
                if (state.type === 'website') {
                    fileType = 'WEBSITE';
                }
                if (state.type === 'webPage') {
                    fileType = 'WEBPAGE';
                }
                if (state.type === 'email') {
                    fileType = 'PB-EMAIL';
                }
                //getting web page from rafile
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: authToken,
                    params: {
                        hotelrefno: Number(companyId),
                        query: `filetype:${fileType}`,
                    }
                }).then(res1 => {
                    setIsLoaded(true);
                    if (res1.status === 200 && res1?.data?.data) {
                        if (state.type === 'website') {
                            const website = {
                                header: {},
                                footer: {},
                                pages: []
                            }
                            updateState('pageBuilder', 'website', website);
                            onSelectWebsite(false);
                        }
                        if (state.type === 'webPage') {
                            const webPage = {
                                id: '',
                                sections: []
                            }
                            updateState('pageBuilder', 'page', webPage);
                            onSelectPage(false);
                        }
                        if (state.type === 'email') {
                            const email = {
                                header: {},
                                footer: {},
                                body: []
                            }
                            updateState('pageBuilder', 'email', email);
                        }
                        setData(res1.data.data);
                        setSelectedIndex(null);
                        updateState('pageBuilder', 'code', '');
                        setDescription('');
                    } else {
                        const retErr = isErrorMsg(res1);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
            } else {
                const retErr = isErrorMsg(res);
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        })
    }

    const handleDelete = (type, isDelete) => {
        if (isDelete) {
            handleDeletePage(deletedGID);
        }
        setAlert(false);
        setAlertDialogType('');
    }

    return (
        <Container>
            <Grid container spacing={6} className={clsx(cls.pageRoot, {
                [cls.disableEvent]: isDeleting
            })} style={{height: '60vh'}}>
                {
                    !isLoaded ? <LoadingSpinner style={{color: COLORS.secondary, margin: 'auto'}}/> :
                        <>
                            <Grid item xs={6}>
                                <Paper className={cls.pageBlock} style={{
                                    height: '50vh',
                                    overflow: 'auto',
                                }}>
                                    <div className={cls.pagePaperUl}>
                                        {
                                            data.length > 0 && data.map((d, index) => {
                                                return (
                                                    <li key={index} style={{
                                                        color: (index === selectedIndex) ? '#ffffff' : COLORS?.secondary,
                                                        backgroundColor: (index === selectedIndex) ? COLORS?.primary : '#ffffff',
                                                    }}
                                                        onMouseEnter={() => {
                                                            setHoverIndex(index);
                                                            setDeleteIconShow(true);
                                                        }}
                                                        onMouseLeave={() => {
                                                            setHoverIndex(null);
                                                            setDeleteIconShow(false);
                                                        }}
                                                    >
                                                        <Grid
                                                            container
                                                            justify={'flex-start'}
                                                            className={cls.pagePaperLi}
                                                            onClick={() => handleSelect(d, index)}
                                                            alignItems={'center'}
                                                        >
                                                            <Grid item xs={1}>
                                                                {
                                                                    d.istemplate ?
                                                                        <FontAwesomeIcon
                                                                            style={{color: (index === selectedIndex) ? '#ffffff' : COLORS?.secondary,}}
                                                                            icon={faTextHeight}
                                                                        /> : <>
                                                                            {
                                                                                state.type === 'website' &&
                                                                                <WebIcon/>
                                                                            }
                                                                            {
                                                                                state.type === 'email' && <EmailIcon/>
                                                                            }
                                                                            {
                                                                                state.type === 'webPage' &&
                                                                                <FontAwesomeIcon
                                                                                    icon={faWeebly}
                                                                                    style={{color: (index === selectedIndex) ? '#ffffff' : COLORS?.secondary,}}
                                                                                />
                                                                            }
                                                                        </>
                                                                }
                                                            </Grid>
                                                            <Grid item xs={9}>
                                                                <span
                                                                    style={{color: (index === selectedIndex) ? '#ffffff' : COLORS?.secondary}}>{d.code}</span>
                                                            </Grid>
                                                            <Grid item xs={1} style={{margin: -10}}>
                                                                {
                                                                    isDeleteIconShow && (index === hoverIndex) ?
                                                                        <IconButton
                                                                            style={{color: (index === selectedIndex) ? '#ffffff' : COLORS?.secondary,}}
                                                                            onClick={() => {
                                                                                setAlert(true);
                                                                                setDeletedGID(d.gid);
                                                                                if (state.type === 'webPage') {
                                                                                    setAlertDialogType('webPage');
                                                                                }
                                                                                if (state.type === 'website') {
                                                                                    setAlertDialogType('website');
                                                                                }
                                                                                if (state.type === 'email') {
                                                                                    setAlertDialogType('email');
                                                                                }
                                                                            }}
                                                                            className={router?.query?.emailOnly ? cls.disableEvent : (d.hotelrefno === -1 && (!state.isSuperHotel || !state.isSuperUser)) ? cls.disableEvent : ''}
                                                                            color="default"
                                                                            aria-label="delete template"
                                                                            component="span">
                                                                            <RemoveCircleIcon
                                                                                style={{color: (index === selectedIndex) ? '#ffffff' : COLORS?.secondary}}/>
                                                                        </IconButton>
                                                                        : <></>
                                                                }
                                                            </Grid>
                                                        </Grid>
                                                    </li>
                                                )
                                            })
                                        }
                                    </div>
                                </Paper>
                                {
                                    <Paper className={cls.pageBlock} style={{minHeight: '5vh'}}>
                                        {
                                            state.type === 'website' && url &&
                                            <div style={{margin: 8}}>
                                                <a target='_blank'
                                                   href={url}
                                                   style={{marginLeft: 8,}}
                                                > {url} </a>
                                            </div>
                                        }
                                        {
                                            description && <div style={{margin: 8}}>
                                                <span
                                                    style={{color: COLORS.primary, marginLeft: 8}}>{description}</span>
                                            </div>
                                        }


                                        {
                                            state.type === 'website' && !url && <LoadingSpinner/>
                                        }
                                    </Paper>
                                }
                            </Grid>
                            <Grid item xs={6}>
                                <Paper className={cls.pageBlock} style={{
                                    height: '55vh',
                                    overflow: 'auto',
                                }}>
                                    <div style={{pointerEvents: 'none'}}>
                                        {
                                            state.type === 'webPage' && state.page.sections.length > 0 && (
                                                <RenderWebPage sections={state.page.sections}/>
                                            )
                                        }
                                        {
                                            state.type === 'website' && Object.keys(state.website).length > 0 &&
                                            <React.Fragment>
                                                {
                                                    Object.keys(state.website.header).length > 0 &&
                                                    <Header
                                                        headerType={state.website.header.tpl}
                                                        headerItems={state.website.header.items}
                                                    />
                                                }
                                                {
                                                    state.website.pages.length > 0 && <Container>
                                                        <Page
                                                            gid={state.website.pages.length > 0 ? state.website.pages[0].gid : ''}/>
                                                    </Container>
                                                }
                                                {
                                                    Object.keys(state.website.footer).length > 0 &&
                                                    <Footer
                                                        footerType={state.website.footer.type}
                                                        footerItems={state.website.footer.items}
                                                    />
                                                }
                                            </React.Fragment>
                                        }
                                        {
                                            (state?.type === 'email' || state?.type === 'emailOnly') &&
                                            state?.email &&
                                            <React.Fragment>
                                                <Typography component={'div'}>
                                                    {
                                                        state.email?.header?.tpl && state?.email?.header?.items?.length > 0 &&
                                                        <EmailHeader
                                                            tpl={state.email.header.tpl}
                                                            items={state.email.header.items}
                                                        />
                                                    }
                                                </Typography>
                                                <Typography component={'div'} style={{marginTop: 8}}>
                                                    {
                                                        state.email?.body?.length > 0 && state.email.body.map((body, index) => {
                                                            return (
                                                                <Grid key={index} container spacing={3}>
                                                                    {
                                                                        body?.items?.length > 0 && body.items.map((item, i) => {
                                                                            return (
                                                                                <Grid
                                                                                    item
                                                                                    style={{width: item.width + '%'}}
                                                                                    key={i}
                                                                                >
                                                                                    {
                                                                                        item?.type === 'image' &&
                                                                                        <Image
                                                                                            imageComponent={item}
                                                                                        />
                                                                                    }
                                                                                    {
                                                                                        item?.type === 'paragraph' &&
                                                                                        <div
                                                                                            style={{
                                                                                                backgroundColor: item?.useBgColor ? state?.assets?.colors?.message?.main : 'white',
                                                                                                height: '100%'
                                                                                            }}
                                                                                        >
                                                                                            <Paragraph
                                                                                                paragraph={item}/>
                                                                                        </div>
                                                                                    }
                                                                                </Grid>
                                                                            )
                                                                        })
                                                                    }
                                                                </Grid>
                                                            )
                                                        })
                                                    }
                                                </Typography>
                                                <Typography component={'div'} style={{marginTop: 8}}>
                                                    {
                                                        Object.keys(state.email.footer).length > 0 &&
                                                        <EmailFooter
                                                            items={state.email.footer.items}
                                                        />
                                                    }
                                                </Typography>
                                            </React.Fragment>
                                        }
                                    </div>
                                </Paper>
                            </Grid>
                        </>
                }
            </Grid>
            {
                isAlert && <AlertDialog
                    handleDelete={handleDelete}
                    alertDialogType={alertDialogType}
                />
            }
        </Container>
    )
}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

const mapDispatchToProps = dispatch => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
