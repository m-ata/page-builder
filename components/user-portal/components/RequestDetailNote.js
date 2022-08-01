import React, { useContext, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import { Patch, List, UseOrest, Delete } from '@webcms/orest'
import { makeStyles } from '@material-ui/core/styles'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import DoneIcon from '@material-ui/icons/Done'
import EditIcon from '@material-ui/icons/Edit'
import CardHeader from '@material-ui/core/CardHeader'
import Menu from '@material-ui/core/Menu'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'
import { OREST_ENDPOINT, REQUEST_METHOD_CONST } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import ReplyIcon from '@material-ui/icons/Reply'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import LoadingSpinner from '../../LoadingSpinner'
import useTranslation from 'lib/translations/hooks/useTranslation'
import {CustomToolTip} from './CustomToolTip/CustomToolTip';
import moment from 'moment';
import clsx from 'clsx';
import {PreviewFile} from "../../../model/orest/components/RaFile";
import {useSnackbar} from "notistack";
import MediaViewerDialog from "../../../@webcms-ui/core/media-viewer-dialog";
import AddNoteDialog from "../../CommonNotes/AddNoteDialog";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    field: {
        marginRight: theme.spacing(1),
    },
    replyNoteBox: props =>  ({
        width: props?.isreply ? 'calc(100% - ' + (props?.treeLevel * 25) + 'px)' : '100%' ,
        marginLeft: props?.isreply ? 'auto' : '',
        paddingTop: props?.isreply ? 0 : '',
    }),
    dateStyle: {
        fontSize: 13,
        color: '#565656',
        float: 'right',
        paddingRight: "8px",
    },
    listItem: {
        paddingTop: 0,
        paddingBottom: 0
    },
    iconButton: {
        textAlign: 'center',
        width: '100%',
        cursor: 'pointer',
        padding: '1px 12px',
        borderRadius: '4px',
        '&:hover': {
            backgroundColor: 'rgb(0,0,0,0.04)'
        }
    },
    icon: {
        margin: '4px 0'
    },
    disabledIcon: {
        color: 'rgba(0, 0, 0, 0.38)',
        cursor: 'standard',
        pointerEvents: 'none'
    },
    imageNote: {
        cursor: 'pointer',
        border: '1px solid #ddd',
        width: 150,
        height: 100,
        borderRadius: '4px',
        '&:hover': {
            boxShadow: '0 0 2px 1px rgb(0 140 186 / 50%)'
        },
    }
}))

const RequestDetailNote = (props) => {
    const { state, data, isreply, currentTaskNotes, setToState, updateState, treeLevel, getNoteList, handleGetScroll, raNoteUserAccess } = props

    const classes = useStyles({isreply, treeLevel})
    const { t } = useTranslation()

    const { enqueueSnackbar } = useSnackbar();

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false)
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)

    const [isMyRequestNoteReply, setIsMyRequestNoteReply] = useState(false)
    const [openMediaDialog, setOpenMediaDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [isMediaLoading, setIsMediaLoading] = useState(false);
    const [mediaUrl, setMediaUrl] = useState('');
    const [fileType, setFileType] = useState('');


    const handleRequestDetailNoteDone = (popupState, isDone) => {
        popupState.close();
        updateState('userPortal', 'currentTaskNotesLoading', true)
        handleGetScroll();
        Patch({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE,
            token,
            gid: data.gid,
            data: {
                isdone: !isDone,
            },
        }).then((r1) => {
            if (r1.status === 200) {
                getNoteList();
            } else {
                updateState('userPortal', 'currentTaskNotesLoading', false)
            }
        })
    }


    const handleDefRequestReplyNote = (noteid, userid, notemid) => {
        if (state.defMyRequestNoteReply.length > 0) {
            Delete({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RANOTE,
                token,
                gid: state.defMyRequestNoteReply.gid,
                params: {
                    hotelrefno: data.hotelrefno,
                },
            }).then((r) => {
                if (r.status === 200) {
                    setToState('userPortal', ['defMyRequestNoteReply'], [])
                } else {
                }
            })
        }

        setIsMyRequestNoteReply(true)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.REPLY,
            token,
            method: REQUEST_METHOD_CONST.POST,
            params: {
                id: noteid,
                userid: userid,
                hotelrefno: data.hotelrefno,
            },
        }).then((r1) => {
            const replyID = r1.data.data[0].res
            if (r1.status === 200 && replyID > 0) {
                getNoteList()
                List({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RANOTE,
                    token,
                    params: {
                        query: `id::${replyID},isprivate::false`,
                        start: 0,
                        hotelrefno: data.hotelrefno,
                    },
                }).then((r2) => {
                    setToState('userPortal', ['defMyRequestNoteReply'], r2.data.data[0])
                    setToState('userPortal', ['defMyRequestNoteReplyBase'], r2.data.data[0])
                    setIsMyRequestNoteReply(false)
                    setOpenAddDialog(true)
                })
            } else {
                setIsMyRequestNoteReply(false)
                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
            }
        })
    }
    
    const handleEditModalStatus = (popupState) => {
        popupState.close();
        setOpenAddDialog(true)
        setToState('userPortal', ['isEditNote'], true);
        setToState('userPortal', ['defMyRequestNote'], data)
        setToState('userPortal', ['defMyRequestNoteBase'], data)
    }

    const checkURL = (url) =>  {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    const handleFindLink = (data) => {
        const aElementRegex = /<a(.*?)<\/a>/gm
        const attributeRegex = /<a(.*?)>/g
        const regex = /href="(https?:\/\/[^\s]+)|(https?:\/\/[^\s]+)/g
        const imgRegex = /<img(.*?)>/gm
        const imgAltRegex = /alt="(.*?)"/
        let replaceData = data;
        let htmlHref;
        let list;
        let attributeString;
        let imgList

        while ((htmlHref = aElementRegex.exec(data)) !== null) {
            while((attributeString = attributeRegex.exec(htmlHref[0])) !== null) {
                if(!attributeString[1].includes('target')) {
                    const replacedText = `${attributeString[1]} target=_blank`
                    replaceData = replaceData.replace(attributeString[1], replacedText)
                }
            }
        }

        while ((list = regex.exec(data)) !== null){
            if(!list[0].includes('</a') && !list[0].includes('href')) {
                const replacedText = checkURL(list[0]) ? `<img class="${classes.imageNote}" title="${t('str_show')}" src="${list[0]}"/>` : `<a href=${list[0]} target=_blank style="color:#007bff ">${list[0]}</a>`
                replaceData = replaceData.replace(list[0], replacedText)
            }
        }

        while ((imgList = imgRegex.exec(data)) !== null){
            const imgAltText = imgAltRegex.exec(imgList[1])
            if(imgAltText) {
                const replacedText = `<img src="/imgs/empty_image.jpg" title="${t('str_show')}" class="${classes.imageNote}" alt="${imgAltText[1]}" />`
                replaceData = replaceData.replace(imgList[0], replacedText)
            }
        }

        replaceData = replaceData.replaceAll('\n', '</br>')

        return replaceData;
    }

    const handlePreviewMedia = (gid, fileUrl) => {
        setOpenMediaDialog(true)
        const key = fileUrl || gid
        let note
        if(state.noteImages) {
            if(state.noteImages[data.id]?.length > 0) {
                note = state.noteImages[data.id].find(e => e['key'] === key)
            }
        }
        if(note) {
            setMediaUrl(note?.url)
            setFileType(note?.fileType)
        } else {
            setIsMediaLoading(true)
            PreviewFile(GENERAL_SETTINGS, token, gid, fileUrl, data?.hotelrefno).then(res => {
                setIsMediaLoading(false);
                if(res.success) {
                    setMediaUrl(res?.url);
                    setFileType(res?.fileType)
                    const imageData = {...state.noteImages} || {}
                    const array = state.noteImages[data?.id] || []
                    array.push({url: res?.url, fileType: res?.fileType, key: key})
                    imageData[data.id] = array
                    setToState('userPortal', ['noteImages'], imageData)
                } else {
                    enqueueSnackbar(t(res?.errorText), { variant: res?.variant || 'error' })
                }
            })
        }

    }

    const handleAnchorClick = (e) => {
        const targetLink = e.target.closest('img')
        if (targetLink && targetLink.src) {
            const gid = targetLink?.alt?.length > 0 && targetLink.alt || false
            const url = gid ? false : targetLink?.src || false
            if(url || gid) {
                handlePreviewMedia(gid, url)
            } else {
                return;
            }
        } else {
            return
        }

        if (!targetLink) return
        e.preventDefault()
    }



    return (
        <React.Fragment key={data.gid}>
            <ListItem alignItems="flex-start" className={classes.replyNoteBox}>
                <Card variant="outlined" style={{ width: '100%' }}>
                    <CardHeader
                        title={
                            <Typography variant="subtitle2" style={{borderBottom: `1px solid ${data.isdone ? "green" : "red"}`}}>
                                {data.insusercode} {data.refcode ? ' - ' + data.refcode : ''}
                                <a style={{paddingLeft: '16px'}}>
                                    <CustomToolTip title={t('str_reply')}>
                                        <IconButton
                                            size="small"
                                            disabled={
                                                state.currentTaskNotesLoading || isMyRequestNoteReply ||
                                                (state.defMyRequestNoteReply && state.defMyRequestNoteReply.pid === data.id)
                                                    ? true
                                                    : false
                                            }
                                            onClick={() => handleDefRequestReplyNote(data?.id, loginfo?.id, data?.mid)}
                                        >
                                            {isMyRequestNoteReply ? (
                                                <LoadingSpinner size={20} />
                                            ) : (
                                                <ReplyIcon fontSize="small" />
                                            )}
                                        </IconButton>
                                    </CustomToolTip>
                                    <PopupState variant="popover" popupId={data.gid}>
                                        {(popupState) => (
                                            <React.Fragment>
                                                <IconButton
                                                    disabled={state.currentTaskNotesLoading}
                                                    size="small"
                                                    aria-label="context-menu"
                                                    {...bindTrigger(popupState)}
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                                <Menu {...bindMenu(popupState)}>
                                                    <ListItem className={classes.listItem} disableGutters>
                                                        {
                                                            loginfo.selfish ? (
                                                                data?.insuserid === loginfo?.id ? (
                                                                    <CustomToolTip title={data.isdone ? t('str_undone') : t('str_done')}>
                                                                        <div className={classes.iconButton} onClick={() => handleRequestDetailNoteDone(popupState, data.isdone)}>
                                                                            {
                                                                                data.isdone ? (
                                                                                    <SkipPreviousIcon className={classes.icon} fontSize="small"/>
                                                                                ) : (
                                                                                    <DoneIcon className={classes.icon} fontSize="small" />
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </CustomToolTip>
                                                                ) : (
                                                                    <CustomToolTip title={t('str_notAuthorizedToAccess')}>
                                                                    <span>
                                                                        <div className={clsx(classes.iconButton, classes.disabledIcon)}>
                                                                            {
                                                                                data.isdone ? (
                                                                                    <SkipPreviousIcon className={classes.icon} fontSize="small"/>
                                                                                ) : (
                                                                                    <DoneIcon className={classes.icon} fontSize="small" />
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </span>
                                                                    </CustomToolTip>
                                                                )
                                                            ) : raNoteUserAccess?.canu ? (
                                                                <CustomToolTip title={data.isdone ? t('str_undone') : t('str_done')}>
                                                                    <div className={classes.iconButton} onClick={() => handleRequestDetailNoteDone(popupState, data.isdone)}>
                                                                        {
                                                                            data.isdone ? (
                                                                                <SkipPreviousIcon className={classes.icon} fontSize="small"/>
                                                                            ) : (
                                                                                <DoneIcon className={classes.icon} fontSize="small" />
                                                                            )
                                                                        }
                                                                    </div>
                                                                </CustomToolTip>
                                                            ) : (
                                                                <CustomToolTip title={t('str_notAuthorizedToAccess')}>
                                                                 <span>
                                                                     <div className={clsx(classes.iconButton, classes.disabledIcon)}>
                                                                         {
                                                                             data.isdone ? (
                                                                                 <SkipPreviousIcon className={classes.icon} fontSize="small"/>
                                                                             ) : (
                                                                                 <DoneIcon className={classes.icon} fontSize="small" />
                                                                             )
                                                                         }
                                                                     </div>
                                                                 </span>
                                                                </CustomToolTip>
                                                            )
                                                        }
                                                    </ListItem>
                                                    <ListItem className={classes.listItem} disableGutters>
                                                        {
                                                            loginfo.selfish ? (
                                                                data?.insuserid === loginfo?.id ? (
                                                                    <CustomToolTip title={t('str_edit')}>
                                                                        <div className={classes.iconButton} onClick={() => handleEditModalStatus(popupState)}>
                                                                            <EditIcon className={classes.icon} fontSize="small" />
                                                                        </div>
                                                                    </CustomToolTip>
                                                                ) : (
                                                                    <CustomToolTip  title={t('str_notAuthorizedToAccess')}>
                                                                    <span>
                                                                        <div className={clsx(classes.iconButton, classes.disabledIcon)} >
                                                                            <EditIcon className={classes.icon} fontSize="small" />
                                                                        </div>
                                                                    </span>
                                                                    </CustomToolTip>
                                                                )
                                                            ) : raNoteUserAccess?.canu ? (
                                                                <CustomToolTip title={t('str_edit')}>
                                                                    <div className={classes.iconButton} onClick={() => handleEditModalStatus(popupState)}>
                                                                        <EditIcon className={classes.icon} fontSize="small" />
                                                                    </div>
                                                                </CustomToolTip>
                                                            ) : (
                                                                <CustomToolTip title={t('str_notAuthorizedToAccess')}>
                                                                 <span>
                                                                     <div className={clsx(classes.iconButton, classes.disabledIcon)}>
                                                                         <EditIcon className={classes.icon} fontSize="small" />
                                                                     </div>
                                                                 </span>
                                                                </CustomToolTip>
                                                            )
                                                        }
                                                    </ListItem>
                                                </Menu>
                                            </React.Fragment>
                                        )}
                                    </PopupState>
                                </a>
                                <a className={classes.dateStyle}>{moment(data.insdatetime).format('L  HH:mm:ss')}</a>
                            </Typography>
                        }
                        subheader={
                            data.listinfo ? (
                                <span
                                    onClick={handleAnchorClick}
                                    style={{ fontSize: 13, lineHeight: 1, color: '#565656' }}
                                    dangerouslySetInnerHTML={{ __html: handleFindLink(data.listinfo) }}
                                ></span>
                            ) : (
                                <span style={{ fontSize: 13, lineHeight: 1, color: '#565656' }}></span>
                            )
                        }
                    />
                </Card>
            </ListItem>
            {data.hasreply &&
                currentTaskNotes &&
                currentTaskNotes
                    .filter((note) => note.pid === data.id)
                    .map((reply, i) => (
                        <RequestDetailNote
                            handleGetScroll={handleGetScroll}
                            getNoteList={getNoteList}
                            raNoteUserAccess={raNoteUserAccess}
                            key={i}
                            state={state}
                            currentTaskNotes={currentTaskNotes}
                            setToState={setToState}
                            updateState={updateState}
                            data={reply}
                            notemasterid={reply.masterid}
                            isreply={true}
                            treeLevel={reply.treelevel}
                        />
                    ))}
            <MediaViewerDialog
                open={openMediaDialog}
                maxWidth={'md'}
                fullWidth
                loading={isMediaLoading}
                fileType={fileType}
                url={mediaUrl}
                t={t}
                onClose={() => {setOpenMediaDialog(false)}}
            />
            <AddNoteDialog
                isReply={!state.isEditNote}
                open={openAddDialog}
                onClose={() => {
                    setOpenAddDialog(false)
                    setIsMyRequestNoteReply(false)
                }}
                getNoteList={getNoteList}
            />
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RequestDetailNote)
