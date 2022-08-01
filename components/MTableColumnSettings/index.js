import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { IconButton, Menu, Typography } from '@material-ui/core'
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import ViewColumnIcon from '@material-ui/icons/ViewColumn'
import SaveIcon from '@material-ui/icons/Save'
import { CustomToolTip } from '../user-portal/components/CustomToolTip/CustomToolTip'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { Insert, Patch, UseOrest } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import { CONTENTYPE, FILETYPE, LOCAL_STORAGE_WEBCMS_COLUMNS_SETTINGS, OREST_ENDPOINT } from 'model/orest/constants'
import { useSnackbar } from 'notistack'
import CircularProgress from '@material-ui/core/CircularProgress'

function MTableColumnSettings(props) {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { tableId, columns, setColumns, iconColor } = props
    const [isSaving, setIsSaving] = useState(false)
    const useToken = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const useInfoLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const { t } = useTranslation()
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        let storageColumnsSettings = localStorage.getItem(LOCAL_STORAGE_WEBCMS_COLUMNS_SETTINGS)
        if (storageColumnsSettings) {
            storageColumnsSettings = JSON.parse(storageColumnsSettings)
            const columnsSettings = storageColumnsSettings[tableId] || false
            if (columnsSettings) {
                const newColumns = [...columns]
                for (let columnSetting of columnsSettings) {
                    const columnIndex = newColumns.findIndex((columnItem => columnItem.field === columnSetting.field))
                    if(columnIndex > -1){
                        newColumns[columnIndex].hidden = columnSetting.hidden
                    }
                }
                setColumns([...newColumns])
            }
        }
    }, [])

    const handleColumnStatus = (colIndex, columnStatus) => {
        const newColumns = [...columns]
        newColumns[colIndex].hidden = !columnStatus
        setColumns([...newColumns])
    }

    const handleColumnStatusSave = () => {
        setIsSaving(true)
        let columnSettings = []
        for (let column of columns) {
            columnSettings.push({
                field: column.field,
                hidden: column.hidden,
            })
        }

        const tableSettings = {
            [tableId]: columnSettings,
        }

        let storageColumnsSettings = localStorage.getItem(LOCAL_STORAGE_WEBCMS_COLUMNS_SETTINGS)
        if (storageColumnsSettings) {
            storageColumnsSettings = JSON.parse(storageColumnsSettings)
        } else {
            storageColumnsSettings = {}
        }

        const allColumnsSettings = { ...storageColumnsSettings, ...tableSettings }
        localStorage.setItem(LOCAL_STORAGE_WEBCMS_COLUMNS_SETTINGS, JSON.stringify(allColumnsSettings))

        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'tools/file/find',
            token: useToken,
            params: {
                code: LOCAL_STORAGE_WEBCMS_COLUMNS_SETTINGS,
                masterid: useInfoLogin.mid,
                contentype: CONTENTYPE.JSON
            },
        }).then((toolsFileFindResponse) => {
            const useFileGid = toolsFileFindResponse?.data?.data?.gid || null
            if (useFileGid) {
                return Patch({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: useToken,
                    gid: useFileGid,
                    params: {
                        hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                    },
                    data: JSON.stringify({
                        filedata: allColumnsSettings && Buffer.from(JSON.stringify(allColumnsSettings)).toString('base64') || "",
                    }),
                }).then((raFileResponse) => {
                    if (raFileResponse.status === 200 && raFileResponse.data && raFileResponse.data.data) {
                        enqueueSnackbar(t('str_dataSaveSuccessMsg'), { variant: 'success' })
                        setIsSaving(false)
                    }else{
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                        setIsSaving(false)
                    }
                }).catch(() => {
                    enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                    setIsSaving(false)
                })
            } else {
                return Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: useToken,
                    params: {
                        hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                    },
                    data: JSON.stringify({
                        code: LOCAL_STORAGE_WEBCMS_COLUMNS_SETTINGS,
                        masterid: useInfoLogin.mid,
                        contentype: CONTENTYPE.JSON,
                        filetype: FILETYPE.TEXT,
                        filedata: allColumnsSettings && Buffer.from(JSON.stringify(allColumnsSettings)).toString('base64') || "",
                    }),
                }).then((raFileResponse) => {
                    if (raFileResponse.status === 200 && raFileResponse.data && raFileResponse.data.data) {
                        enqueueSnackbar(t('str_dataSaveSuccessMsg'), { variant: 'success' })
                        setIsSaving(false)
                    }else{
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                        setIsSaving(false)
                    }
                }).catch(() => {
                    enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                    setIsSaving(false)
                })
            }
        })
    }

    return (
        <PopupState variant="popover" popupId={`${tableId}-column-status`}>
            {(popupState) => (
                <React.Fragment>
                    <CustomToolTip title={t('str_columns')}>
                        <IconButton{...bindTrigger(popupState)}>
                            <ViewColumnIcon style={{color: iconColor || '#F16A4B'}}/>
                        </IconButton>
                    </CustomToolTip>
                    <Menu {...bindMenu(popupState)}>
                        <Typography variant="overline" display="block" style={{ padding: '0 15px' }} gutterBottom>
                            {t('str_columns')}
                        </Typography>
                        <div style={{ padding: '0 15px', maxHeight: '250px', overflowX: 'hidden', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
                            <FormControl component="fieldset" size="small" margin="dense">
                                <FormGroup>
                                    {columns && columns.length > 0 && columns.map((column, colIndex) => {
                                        return (
                                            <FormControlLabel
                                                key={colIndex}
                                                control={<Switch disabled={isSaving} size="small" color="primary" checked={!column.hidden} onChange={()=> handleColumnStatus(colIndex, column.hidden)} name={column.field} />}
                                                label={column.title}
                                            />
                                        )
                                    }) || null}
                                </FormGroup>
                            </FormControl>
                        </div>
                        <div style={{padding: '10px 10px 0 0', textAlign: 'right' }}>
                            <Button disabled={isSaving} startIcon={isSaving ? <CircularProgress size={15} /> : <SaveIcon />} size="small" variant="contained" color="primary" disableElevation onClick={()=> handleColumnStatusSave()}>
                                {t('str_save')}
                            </Button>
                        </div>
                    </Menu>
                </React.Fragment>
            )}
        </PopupState>
    )

}

export default MTableColumnSettings