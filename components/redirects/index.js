import React, { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import DataGrid, { SelectColumn, Row as GridRow } from 'react-data-grid'
import { ContextMenuTrigger } from 'react-contextmenu'
import {
    Grid,
    Button,
    Icon,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Popover,
    Box,
    TextField,
    InputAdornment,
} from '@material-ui/core'
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state'
import { List, Insert, Patch } from '@webcms/orest'
import { OREST_ENDPOINT } from 'model/orest/constants'
import { makeStyles } from '@material-ui/core/styles'
import { useSnackbar } from 'notistack'

String.prototype.base64Decode = function() {
    return this && JSON.parse(Buffer.from(this, 'base64').toString('utf-8')) || ''
}

String.prototype.base64Encode = function() {
    return this && Buffer.from(this).toString('base64') || ''
}

const RowRenderer = (props) => {
    if(props.selectedCellProps){
        return (
            <ContextMenuTrigger id="grid-context-menu" collect={() => ({ row: props.row, rowIdx: props.rowIdx, selectedCellProps: props.selectedCellProps, viewportColumns: props.viewportColumns })}>
                <GridRow {...props} />
            </ContextMenuTrigger>
        )
    }else{
        return <GridRow onContextMenu={e => e.preventDefault()} {...props}/>
    }
}

const useStyles = makeStyles((theme) => ({
    deleteButton: {
        background: '#ec1717',
        color: '#ffffff',
        "&:hover": {
            background: '#a31111',
        },
    },
    emptyMsgWrapper: {
        alignItems: "center",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "row",
        height: "calc(65vh)",
        justifyContent: "center",
        textAlign: "center",
        width: "100%"
    },
    emptyMsg: {
        textAlign: "center",
        padding: "10px",
        alignItems: "center",
        borderRadius: "50%",
        backgroundColor: "#f1f3f4",
        display: "flex",
        flexDirection: "column",
        height: "320px",
        justifyContent: "center",
        width: "320px",
        margin: "0 auto",
    },
    emptyMsgTxt: {
        fontSize: ".875rem",
        letterSpacing: ".25px",
        color: "#5f6368",
        fontWeight: 500
    },
    emptyMsgIcon: {
        color: 'rgb(154, 160, 166)',
        display: 'block',
        margin: '0 auto',
        fontSize: '6em',
        marginTop: -30,
        marginBottom: 10
    },
    textFieldFormHelper: {
        textAlign: 'end'
    },
    targetEditor: {
        width: '100%'
    }
}))

const EmptyRowsRenderer = () => {
    const classes = useStyles()
    const { t } = useTranslation()

    return (
        <div className={classes.emptyMsgWrapper}>
            <div className={classes.emptyMsg}>
                <Icon className={classes.emptyMsgIcon}>add</Icon>
                <span className={classes.emptyMsgTxt}>
                    {t('str_noRecordYouCanAddNewRecord')}
                </span>
            </div>
        </div>
    )
}

const LoadingRowsRenderer = () => {
    const classes = useStyles()
    const { t } = useTranslation()

    return (
        <div className={classes.emptyMsgWrapper}>
            <div className={classes.emptyMsg}>
                <Icon className={classes.emptyMsgIcon}>add</Icon>
                <span className={classes.emptyMsgTxt}>
                    {t('str_pleaseWait')}
                </span>
            </div>
        </div>
    )
}

const RedirectsEditor = ({ open, onClose }) => {
    const classes = useStyles()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()
    const router = useRouter()
    const { t } = useTranslation()

    //Routers
    const token = router.query.authToken
    const companyId = Number(GENERAL_SETTINGS?.HOTELREFNO)

    const [selectedRows, setSelectedRows] = useState(() => new Set())
    const [dataColums, setDataColums] = useState([
        SelectColumn,
        {
            key: 'oldpath',
            name: 'Old Path',
            editable: true,
            frozen: true
        },
        {
            key: 'newpath',
            name: 'New Path',
            editable: true,
            frozen: true
        }
    ])

    const [dataRows, setDataRows] = useState([])

    const [newOldPath, setNewOldPath] = useState('')
    const [oldPathHelperText, setOldPathHelperText] = useState('')

    const [newNewPath, setNewNewPath] = useState('')
    const [newPathHelperText, setNewPathHelperText] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const [updateFileGid, setUpdateFileGid] = useState(false)

    const webCmsPathRedirect = 'WEBCMS.PATH.REDIRECT'
    const fileType = 'WEBCMS.SETT'
    const contenType = '0000525'

    useEffect(() => {
        let active = true
        if(active && !isLoading) {
            setIsLoading(true)
            List({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token,
                params: {
                    query: `code::${webCmsPathRedirect}`,
                    hotelrefno: companyId,
                },
            }).then((rafileViewListResponse) => {
                if (active) {
                    if (rafileViewListResponse.data.success && rafileViewListResponse.data.count > 0) {
                        setIsLoading(false)
                        setDataRows(rafileViewListResponse?.data?.data[0]?.filedata?.base64Decode() || false)
                        setUpdateFileGid(rafileViewListResponse?.data?.data[0]?.gid || false)
                    } else {
                        setIsLoading(false)
                        setDataRows([])
                    }
                } else {
                    setIsLoading(false)
                    setDataRows([])
                }
            }).catch(() => {
                setIsLoading(false)
                setDataRows([])
                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
            })
        }
    }, [])

    const handleSave = () => {
        setIsLoading(true)

        const useData = {
            code: webCmsPathRedirect,
            filedata: JSON.stringify(dataRows).base64Encode(),
            filetype: fileType,
            contentype: contenType,
            hotelrefno: companyId,
        }

        if (updateFileGid) {
            Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token,
                gid: updateFileGid,
                params: {
                    hotelrefno: companyId
                },
                data: useData,
            }).then((rafilePatchResponse) => {
                if (rafilePatchResponse.status === 200) {
                    setDataRows(rafilePatchResponse?.data?.data?.filedata?.base64Decode() || false)
                    setUpdateFileGid(rafilePatchResponse?.data?.data?.gid || false)
                    enqueueSnackbar(t('str_dataSaveSuccessMsg'), { variant: 'success' })
                    setIsLoading(false)
                }else {
                    enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                    setIsLoading(false)
                }
            }).catch(()=> {
                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                setIsLoading(false)
            })
        } else {
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token,
                params: {
                    hotelrefno: companyId
                },
                data: useData,
            }).then((rafileInsertResponse) => {
                if (rafileInsertResponse.status === 200) {
                    setDataRows(rafileInsertResponse?.data?.data?.filedata?.base64Decode() || false)
                    setUpdateFileGid(rafileInsertResponse?.data?.data?.gid || false)
                    enqueueSnackbar(t('str_dataSaveSuccessMsg'), { variant: 'success' })
                    setIsLoading(false)
                }else {
                    enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                    setIsLoading(false)
                }
            }).catch(()=> {
                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                setIsLoading(false)
            })
        }
    }

    const handleDeleteSelectedItems = () => {
        let newDataRows = [...dataRows]
        selectedRows.forEach(function (key) {
            const getIndex = newDataRows.findIndex(indexItem => String(indexItem.oldpath) === String(key))
            selectedRows.delete(key)
            newDataRows.splice(getIndex, 1)
        })
        setDataRows(newDataRows)
    }

    const slashPrefix = (val) => {
        if (val) {
            return '/' + val
        }
        return val
    }

    const handleAddNewRow = async () =>{
        let isError = false, isOldPath = false

        if(newOldPath === ""){
            isError = true
            setOldPathHelperText(t('str_requiredField'))
        }

        if(newNewPath === ""){
            isError = true
            setNewPathHelperText(t('str_requiredField'))
        }

        if(newOldPath === newNewPath){
            isError = true
            setNewPathHelperText(t('str_theOldAndNewPathsCannotBeTheSame'))
        }

        Object.keys(dataRows).forEach(function(key) {console.log(dataRows[key].oldpath, ('/' + newOldPath), (dataRows[key].oldpath === ('/' + newOldPath)))
            if(dataRows[key].oldpath === slashPrefix(newOldPath)) {
                isOldPath = true
                isError = true
                return
            }
        })

        if(isOldPath){
            setOldPathHelperText(t('str_thisPathAlreadyExists'))
        }

        if(!isError){
            setDataRows([...dataRows, { oldpath: slashPrefix(newOldPath), newpath: slashPrefix(newNewPath) }])
            setNewOldPath("")
            setNewNewPath("")
        }
    }

    return (
            <Dialog fullWidth maxWidth="md" open={open} style={{maxHeight: '80%'}}>
                <DialogTitle>{t('str_pathRedirection')}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} justify='flex-end'>
                        <Grid item>
                            <Button variant="contained" className={classes.deleteButton} disabled={!(selectedRows.size > 0)} disableElevation onClick={() => handleDeleteSelectedItems()}  startIcon={<Icon>delete</Icon>}>
                                {t('str_deleteSelected', { selected: selectedRows.size })}
                            </Button>
                        </Grid>
                        <Grid item>
                            <PopupState variant="popover" popupId="demo-popup-popover">
                                {(popupState) => (
                                    <div>
                                        <Button color='primary' disableElevation variant='outlined' startIcon={<Icon>add</Icon>} {...bindTrigger(popupState)}>
                                            {t('str_newRedirection')}
                                        </Button>
                                        <Popover
                                            {...bindPopover(popupState)}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                        >
                                           <Box p={3} style={{maxWidth: 400}}>
                                               <Grid container spacing={2} justify='flex-end'>
                                                   <Grid item xs={12}>
                                                       <TextField
                                                           required={true}
                                                           helperText={oldPathHelperText}
                                                           value={newOldPath}
                                                           onChange={(e) => {
                                                               setOldPathHelperText("")
                                                               setNewOldPath(e.target.value)
                                                           }}
                                                           size="small"
                                                           fullWidth
                                                           id="old-path"
                                                           label={t('str_oldPath')}
                                                           variant="outlined"
                                                           InputProps={{
                                                               startAdornment: <InputAdornment position="start">/</InputAdornment>,
                                                               autoComplete: 'off'
                                                           }}
                                                       />
                                                   </Grid>
                                                   <Grid item xs={12}>
                                                       <TextField
                                                           required={true}
                                                           helperText={newPathHelperText}
                                                           value={newNewPath}
                                                           onChange={(e) => {
                                                               setNewPathHelperText("")
                                                               setNewNewPath(e.target.value)
                                                           }}
                                                           size="small"
                                                           fullWidth
                                                           id="new-path"
                                                           label={t('str_newPath')}
                                                           variant="outlined"
                                                           InputProps={{
                                                               startAdornment: <InputAdornment position="start">/</InputAdornment>,
                                                               autoComplete: 'off'
                                                           }}
                                                       />
                                                   </Grid>
                                                   <Grid item>
                                                       <Button disabled={(newOldPath === "" || newNewPath === "")} color='primary' disableElevation variant='outlined' startIcon={<Icon>add</Icon>} onClick={() => handleAddNewRow()}>
                                                           {t('str_add')}
                                                       </Button>
                                                   </Grid>
                                               </Grid>
                                           </Box>
                                        </Popover>
                                    </div>
                                )}
                            </PopupState>
                        </Grid>
                        <Grid item xs={12}>
                            <DataGrid
                                rowKey='oldpath'
                                columns={dataColums}
                                rows={dataRows}
                                rowKeyGetter={(row) => row.oldpath || ''}
                                onRowsChange={(rows) => setDataRows(rows)}
                                selectedRows={selectedRows}
                                onSelectedRowsChange={setSelectedRows}
                                rowRenderer={RowRenderer}
                                emptyRowsRenderer={isLoading ? LoadingRowsRenderer : EmptyRowsRenderer}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" color="secondary" disableElevation onClick={()=> onClose()}>{t('str_close')}</Button>
                    <Button variant="contained" color="primary" disableElevation onClick={()=> handleSave()}>{t('str_save')}</Button>
                </DialogActions>
            </Dialog>
    )
}

export default RedirectsEditor