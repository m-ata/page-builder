//ReactJS and Hooks
import React, { useCallback, useEffect, useState, useContext, useMemo } from 'react'
React.useLayoutEffect = React.useEffect

//NextJS Compenents
import { useRouter } from 'next/router'

//WebCMS Helpers
import { ViewList, Insert, UseOrest } from '@webcms/orest'
import { DEFINED_HOTEL_REF_NO, OREST_ENDPOINT, REQUEST_METHOD_CONST } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'

//External Compenents
import { Container, Grid, Paper, Box, Button, Icon, TextField, Dialog, DialogActions, DialogContent, DialogTitle, ListItemIcon , Typography, ButtonGroup } from '@material-ui/core'
import DataGrid, { SelectColumn, Row as GridRow } from 'react-data-grid'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import MuiMenu from '@material-ui/core/Menu'
import MuiMenuItem from '@material-ui/core/MenuItem'

//Notify Compenents
import { useSnackbar } from 'notistack'

//Base Compenents
import ModuleSelection from 'components/editor/components/module-selection'
import LanguageSelect from 'components/editor/components/language-select'
import useTranslation from 'lib/translations/hooks/useTranslation'

//Styles
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import styleFile from 'components/editor/components/styles'
import TextFilter from 'components/editor/components/text-filter'
const useStyles = makeStyles(styleFile)

//Proptype Helpers
String.prototype.htmlEntityToText = function() {
    let txt = document.createElement('textarea')
    txt.innerHTML = this
    return txt.value
}

String.prototype.htmlToText = function() {
    return this?.replace(/(<([^>]+)>)/ig, '').htmlEntityToText()
}

String.prototype.trCharFormat = function() {
    return this?.replace(/Ğ/gim, "g").replace(/Ü/gim, "U").replace(/Ş/gim, "S").replace(/İ/gim, "I").replace(/Ö/gim, "O").replace(/Ç/gim, "C").replace(/ğ/gim, "g").replace(/ü/gim, "u").replace(/ş/gim, "s").replace(/ı/gim, "i").replace(/ö/gim, "o").replace(/ç/gim, "c").replace(" ", ".").replace("-", ".")
}

String.prototype.base64Decode = function() {
    return this && JSON.parse(Buffer.from(this, 'base64').toString('utf-8')) || ''
}

String.prototype.base64Encode = function() {
    return this && Buffer.from(this).toString('base64') || ''
}

//Helper Function
const getModuleCode = (moduleList, selectModule) => {
    const module = moduleList && moduleList.length > 0 && moduleList.find(item => Number(item.id) === Number(selectModule)) || false
    const srcModuleName = module &&  'SRC.' + module.description || false
    return srcModuleName
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

const getLanguageDataCaceKey = (selectedModule) => {
    return `LANGUAGE_DATA_${selectedModule}`
}

//Target Components
const TargetFormatter = ({ column, row }) => {
    return (<div dangerouslySetInnerHTML={{ __html: row[column.key] }}></div>)
}

//Component Names
const componentNames = {
    ModuleSelect: 'ModuleSelect',
    LanguageSelect: 'LanguageSelect',
    SyncLanguageFilesForSelectedModuleButton: 'SyncLanguageFilesForSelectedModuleButton',
    AvailableLanguageSelect: 'AvailableLanguageSelect',
    AddNewSourceButton: 'AddNewSourceButton',
    GetLocalBackupButton: 'GetLocalBackupButton',
    DeleteSelectedItemsButton: 'DeleteSelectedItemsButton',
    SaveChangesButton: 'SaveChangesButton'
}

//Render Function
const LanguageEditor = () => {

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const router = useRouter()
    const classes = useStyles()
    const { t } = useTranslation()

    //Routers
    const token = router.query.authToken
    const companyId = Number(GENERAL_SETTINGS?.HOTELREFNO)

    //General Settings
    const [isLoading, setIsLoading] = useState(false)
    const [addNewSrc, setAddNewSrc] = useState(false)
    const [isHasBeenAChange, setIsHasBeenAChange] = useState(false)
    const [useLocalMenuCtx, setUseLocalMenuCtx] = useState(null);


    //Load State
    const [isFirstSync, setIsFirstSync] = useState(false)
    const [isSyncComplete, setIsSyncComplete] = useState(false)
    const [isModuleListLoading, setIsModuleListLoading] = useState(false)
    const [isLanguageListLoading, setIsLanguageListLoading] = useState(false)
    const [isSavingEdits, setIsSavingEdits] = useState(false)
    const [isSynchronize, setIsSynchronize] = useState(false)
    const [isChooseLanguageForModule, setIsChooseLanguageForModule] = useState(false)

    //List State
    const [moduleList, setModuleList] = useState([])
    const [languageList, setLanguageList] = useState([])
    const [srcFileList, setSrcFile] = useState([])
    const [srcFileGid, setSrcFileGid] = useState(false)
    const [trgFileList, setTrgFile] = useState([])

    //Selection State
    const [selectedModule, setSelectedModule] = useState('')
    const [selectedLanguage, setSelectedLanguage] = useState([])
    const [filterLanguage, setFilterLanguage] = useState([])
    const [filterLangSelected, setLangSelected] = useState([])
    const [languageData, setLanguageData] = useState([])
    const [selectedRows, setSelectedRows] = useState(() => new Set())
    const [filters, setFilters] = useState({ search: '', checked: false })
    const [useLocalBackupActive, setUseLocalBackupActive] = useState(false)
    const [useLocalBackup, setUseLocalBackup] = useState(false)
    const [useLocalCompare, setUseLocalCompare] = useState(false)

    //languageData Callback
    const getCheckDataList = useCallback(() => {
        return languageData
    }, [languageData])

    //Cell Edit Compenents for Source
    const AddSource = (props) => {
        const { open, onClose } = props
        const checkDataList = getCheckDataList()
        const [value, setValue] = useState('')
        const minLimit = 3, maxLimit = 100

        const onSave = () => {
            const checkIndex = checkDataList.findIndex(item => String(item.src) === String(value))
            if(!(value.length >= minLimit)){
                enqueueSnackbar(t('str_mustBeGreaterThanCharacters', {minLimit: minLimit}), { variant: 'warning' })
            }else if(value.length > maxLimit){
                enqueueSnackbar(t('str_iTMustBeLessThanCharacters', {maxLimit: maxLimit}), { variant: 'warning' })
            }else if(value !== '' && checkIndex === -1){
                const newVal = { src: value }
                setLanguageData([...languageData, newVal])
                setIsHasBeenAChange(true)
                onClose(true)
            }else{
                enqueueSnackbar(t('str_thisRecordIsAvailablePleaseTryANewOne'), { variant: 'warning' })
            }
        }

        return (
            <Dialog
                fullWidth
                maxWidth="sm"
                open={open}
                onClose={() => onClose(true)}
                aria-labelledby='add-new-source-title'
                aria-describedby='add-new-source-description'
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.stopPropagation()
                    }
                }}
            >
                <DialogTitle id='add-new-source-title'>{t('str_newSourceCode')}</DialogTitle>
                <DialogContent dividers>
                    <Box p={3}>
                        <TextField
                            FormHelperTextProps={{ classes: { root: classes.textFieldFormHelper } }}
                            id="add-new-source"
                            label={t('str_sourceWord')}
                            variant="outlined"
                            fullWidth
                            autoFocus
                            value={value}
                            onChange={(e) => {
                                if (((e.target.value.length > maxLimit) || e.key === 'Enter') && e.key !== 'Backspace' && !e.ctrlKey) {
                                    e.preventDefault()
                                    e.stopPropagation()
                                } else {
                                    setValue(e.target.value.trCharFormat())
                                }
                            }}
                            helperText={`${value.length}/${maxLimit}`}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => onSave()} startIcon={<Icon>save</Icon>} color='primary' disableElevation>
                        {t('str_add')}
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    const EditSource = (props) => {
        const {column, row, onRowChange, onClose} = props
        const [value, setValue] = useState(row[column.key])
        const checkDataList = getCheckDataList()
        const minLimit = 3, maxLimit = 100

        const onSave = () => {
            const checkIndex = checkDataList.findIndex(item => String(item[column.key]) === String(value))
            if(!(value.length >= minLimit)){
                enqueueSnackbar(t('str_mustBeGreaterThanCharacters', {minLimit: minLimit}), { variant: 'warning' })
            }else if(value.length > maxLimit){
                enqueueSnackbar(t('str_iTMustBeLessThanCharacters', {maxLimit: maxLimit}), { variant: 'warning' })
            }else if(value !== '' && (checkIndex === -1 || row[column.key] === value)){
                row[column.key] = value
                setIsHasBeenAChange(true)
                onRowChange(row, onClose)
            }else{
                enqueueSnackbar(t('str_thisRecordIsAvailablePleaseTryANewOne'), { variant: 'warning' })
            }
        }

        return (
            <Dialog
                fullWidth
                maxWidth="sm"
                open
                onClose={() => onClose()}
                aria-labelledby='edit-source-title'
                aria-describedby='edit-source-description'
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.stopPropagation()
                    }
                }}
            >
                <DialogTitle id='edit-source-title'>{t('str_editSourceCode')}</DialogTitle>
                <DialogContent dividers>
                    <Box p={3}>
                        <TextField
                            FormHelperTextProps={{ classes: { root: classes.textFieldFormHelper } }}
                            id="edit-source"
                            label={t('str_sourceWord')}
                            variant="outlined"
                            fullWidth
                            autoFocus
                            value={value}
                            onChange={(e)=>  {
                                if (((e.target.value.length > maxLimit) || e.key === "Enter") && e.key !== "Backspace" && !e.ctrlKey) {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }else{
                                    setValue(e.target.value.trCharFormat())}
                                }
                            }
                            helperText={`${value.length}/${maxLimit}`}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => onSave()} startIcon={<Icon>edit</Icon>} color='primary' disableElevation>
                        {t('str_edit')}
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    const EditTarget = (props) => {
        const {column, row, onRowChange, onClose} = props
        const [value, setValue] = useState(row[column.key])
        const getTextCounter = value?.length || 0
        const limit = 3000

        const classes = useStyles()
        const { enqueueSnackbar } = useSnackbar()
        const { t } = useTranslation()

        const onChange = (e) => {
            setValue(e.target.value)
        }

        const onSave = () => {
            if(limit >= getTextCounter){
                setIsHasBeenAChange(true)
                row[column.key] = value
                onRowChange(row, onClose)
            }else{
                enqueueSnackbar(t('str_maxLengthPassed'), { variant: 'warning' })
            }
        }

        return (
            <Dialog
                fullWidth
                maxWidth="md"
                onClose={() => onClose(true)}
                open
                aria-labelledby='add-new-target-title'
                aria-describedby='add-new-target-description'
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.stopPropagation()
                    }
                }}
            >
                <DialogTitle id='add-new-target-title'>{t('str_editTarget')}</DialogTitle>
                <DialogContent dividers>
                    <Box p={3}>
                        <TextField
                            className={classes.targetEditor}
                            id="add-new-target-textarea"
                            multiline
                            rows={10}
                            variant="outlined"
                            value={value}
                            onChange={onChange}
                            onKeyDown={e => {
                                if ((getTextCounter >= limit) && e.key !== "Backspace" && !e.ctrlKey) {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }
                            }}
                        />
                        <span className={classes.wordCounter}>
                        <span className={clsx(null, { [classes.overLimit]: (getTextCounter > limit) })}>{getTextCounter} {(getTextCounter > limit) && (`(+${getTextCounter-limit})`)}</span> / {limit}
                    </span>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => onSave()} startIcon={<Icon>save</Icon>} color='primary' disableElevation>
                        {t('str_edit')}
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    const GetLocalBackupDialog = (props) => {
        const { open, onClose } = props

        const getBackupData = () => {
            const languageDataCaceKey = getLanguageDataCaceKey(selectedModule)
            const languageDataCaceData = localStorage.getItem(languageDataCaceKey)
            if (languageDataCaceData) {
                const getLocalData = JSON.parse(languageDataCaceData)
                if (useLocalCompare) {
                    let useCompareData
                    getLocalData.map((compareItem) => {
                        const useIndex = languageData.findIndex(languageDataItem => languageDataItem.src === compareItem.src)
                        if (useIndex === -1) {
                            useCompareData = [...languageData, compareItem]
                        }
                    })

                    if(useCompareData?.length > 0){
                        setLanguageData(useCompareData)
                        setIsHasBeenAChange(true)
                        enqueueSnackbar(t('str_processCompletedSuccessfully'), { variant: 'success' })
                    }else{
                        enqueueSnackbar(t('str_recordNotFound'), { variant: 'warning' })
                    }

                } else {
                    setLanguageData(getLocalData)
                    setIsHasBeenAChange(true)
                    enqueueSnackbar(t('str_processCompletedSuccessfully'), { variant: 'success' })
                }
            } else {
                enqueueSnackbar(t('str_recordNotFound'), { variant: 'warning' })
            }
            onClose(true)
        }

        return (
            <Dialog
                fullWidth
                maxWidth='sm'
                open={open}
                onClose={() => onClose(true)}
                aria-labelledby='get-local-backup-title'
                aria-describedby='get-local-backup-description'
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.stopPropagation()
                    }
                }}
            >
                <DialogTitle id='edit-source-title'>{!useLocalCompare ? t('str_getLocalBackup') : t('str_getLocalCompare')}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant='body1' gutterBottom>
                        {!useLocalCompare ? t('str_withThisOperationYouWillGetBackTheDataYouLastSavedForTheRelevantModuleOnThisLocalStorageFromBrowser') : t('str_withThisProcessYourExistingDataWillBeComparedWithTheDataInLocalStorageIfThereAreMissingDataTheyWillBeAdded')}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={() => onClose(true)} startIcon={<Icon>close</Icon>} color='primary' disableElevation>
                        {t('str_cancel')}
                    </Button>
                    <Button variant='contained' onClick={() => getBackupData()} startIcon={<Icon>restore</Icon>} color='primary' disableElevation>
                        {t('str_revert')}
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    //Default column definitions and State
    const defaultColumns = [
        SelectColumn,
        {
            key: 'src',
            name: 'Source',
            frozen: true,
            editable: true,
            editor: EditSource
        }
    ]

    const [dataGridColums, setDataGridColums] = useState(defaultColumns)

    //When the page is loaded, it works once
    useEffect(() => {
        let active = true
        if(active && moduleList !== null && moduleList.length === 0 && !isModuleListLoading){
            setIsModuleListLoading(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEM,
                token,
                params: {
                    query: `description:HCMLANG.`,
                    sort: 'note',
                    hotelrefno: companyId
                },
            }).then((hcmItemViewListResponse) => {
                if (active) {
                    if (hcmItemViewListResponse.data.success && hcmItemViewListResponse.data.count > 0) {
                        setIsModuleListLoading(false)
                        setModuleList(hcmItemViewListResponse.data.data)
                    } else {
                        setIsModuleListLoading(false)
                        setModuleList(null)
                    }
                } else {
                    setIsModuleListLoading(false)
                    setModuleList(null)
                }
            }).catch(() => {
                setIsModuleListLoading(false)
                setModuleList(null)
                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
            })
        }

        if(active && languageList !== null && languageList.length === 0 && !isLanguageListLoading) {
            setIsLanguageListLoading(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RALANG,
                token,
                params: {
                    query:'gcode:notnull,gcode!"",isactive:true',
                    hotelrefno: DEFINED_HOTEL_REF_NO,
                },
            }).then((ralangViewListResponse) => {
                if (active) {
                    if (ralangViewListResponse.data.success && ralangViewListResponse.data.count > 0) {
                        setIsLanguageListLoading(false)
                        setLanguageList(ralangViewListResponse.data.data)
                    } else if (ralangViewListResponse.status === 401) {
                        enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                    }else {
                        setIsLanguageListLoading(false)
                        setLanguageList(null)
                    }
                } else {
                    setIsLanguageListLoading(false)
                    setLanguageList(null)
                    enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                }
            }).catch(() => {
                setIsLanguageListLoading(false)
                setLanguageList(null)
                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
            })
        }

        return () => {
            active = false
        }
    },[])

    //Works if there is a change at `selectedModule`
    useEffect(() => {
        let active = true
        if(active && selectedModule && !isLoading){
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMLANG,
                token,
                params: {
                    query: `itemid:${selectedModule}`,
                    hotelrefno: companyId
                },
            }).then((hcmItemLangResponse) => {
                if (active) {
                    if (hcmItemLangResponse.data.success && hcmItemLangResponse.data.count > 0) {
                        let filterLanguageList = languageList.filter((langListItem) => hcmItemLangResponse.data.data.some((hcmItemLangItem) => hcmItemLangItem.langid === langListItem.id))

                        let selectLanguageData = []
                        const newLangs = {}

                        filterLanguageList.map(item => {
                            Object.assign(newLangs, { [item.gcode]: item.description })
                            selectLanguageData.push(item.description)
                        })

                        setFilterLanguage(filterLanguageList)
                        setSelectedLanguage(selectLanguageData)
                        setIsLoading(false)
                    } else if (hcmItemLangResponse.status === 401) {
                        enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                    }else {
                        setIsLoading(false)
                    }
                }
            }).catch(() => {
                setIsLoading(false)
                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
            })
        }

        return () => {
            active = false
        }
    },[selectedModule])

    //Works if there is a change at `filterLangSelected`
    useEffect(()=> {
        let active = true
        if(active && filterLangSelected){
            //Creates columns for selected languages
            if(filterLangSelected.length > 0){
                const newDataGridColums = []
                filterLangSelected.map((filterDesc) => {
                    const useFilterData = filterLanguage.filter(filterData => filterData.description === filterDesc) || false
                    if (useFilterData && useFilterData.length > 0){
                        newDataGridColums.push({
                            key: useFilterData[0].gcode,
                            name: useFilterData[0].description,
                            editable: true,
                            editor: EditTarget,
                            formatter: TargetFormatter,
                            getRowMetaData: (row) => row
                        })
                    }
                })
                setDataGridColums(defaultColumns.concat(...newDataGridColums))
            }else{
                setDataGridColums(defaultColumns)
            }
        }

        return () => {
            active = false
        }
    },[filterLangSelected])

    //Works if there is a change at `trgFileList`
    useEffect(()=> {
        let active = true
        if(active && trgFileList){
            handleMergeSourceAndTargetFiles()
        }

        return () => {
            active = false
        }
    },[trgFileList])

    //Harmonize and Merge for Source And Target
    const handleHarmonizeSourceAndTargetFiles = (sourceFileData, targetFileData) => {
        let newData = []
        sourceFileData.map(item => {
            let newItemObj = {}
            const groupData = targetFileData.filter(targetItem => targetItem.src === item.src)
            groupData.map(dataItem => Object.assign(newItemObj, { [dataItem.lng]: dataItem.trg }))
            newData.push(Object.assign(newItemObj, { src: item.src }))
        })
        return newData
    }

    const handleMergeSourceAndTargetFiles = () => {
        let targetMergeData = []
        trgFileList.map(trgFile => {
            const mergeData = trgFile.filedata && trgFile.filedata.base64Decode() || []
            targetMergeData = targetMergeData.concat(...mergeData)
        })
        setLanguageData(handleHarmonizeSourceAndTargetFiles(srcFileList, targetMergeData))
    }

    //Component Call to actions
    const handleSyncLanguageFilesForSelectedModule = async () => {
        const syncInfoKey = enqueueSnackbar(t('str_syncingPleaseWait'), { variant: 'info' })
        setIsSyncComplete(true)
        const moduleCode = await getModuleCode(moduleList, selectedModule) || false
        if(moduleCode){
            await handleSyncSourceFiles(moduleCode)
        }

        const moduleNameCode = moduleCode?.replace('SRC.', '') || false
        if(moduleNameCode){
            await handleSyncTargetFiles(moduleNameCode, filterLanguage)
        }else{
            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
        }

        closeSnackbar(syncInfoKey)
        setIsSynchronize(false)
        setIsFirstSync(true)
        setIsSyncComplete(false)
        setIsChooseLanguageForModule(false)
    }

    const handleChooseLanguageForModule = async (selectData) => {
        setIsChooseLanguageForModule(true)
        setSelectedLanguage(selectData)
        const dataForNewSelection = []
        Object.keys(selectData).map((index)=> {
            const langData = languageList.filter(item => item.description === selectData[index])[0]
            dataForNewSelection.push({
                itemid: selectedModule,
                langid: langData.id,
                hotelrefno: companyId,
            })
        })

        await UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMLANG + '/' + OREST_ENDPOINT.LISTDEL,
            method: REQUEST_METHOD_CONST.DELETE,
            token,
            params: {
                query: `itemid:${selectedModule}`,
                hotelrefno: companyId,
            },
        }).then(async (hcmItemLangListDelResponse) => {
            if (hcmItemLangListDelResponse.status === 200) {
                await UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMLANG + '/' + OREST_ENDPOINT.LISTINS,
                    method: REQUEST_METHOD_CONST.POST,
                    token,
                    params: {
                        hotelrefno: companyId,
                    },
                    data: dataForNewSelection,
                }).then((hcmItemLangResponse) => {
                    if (hcmItemLangResponse.data.success && hcmItemLangResponse.data.count > 0) {
                        let filterLanguageList = languageList.filter((langListItem) => hcmItemLangResponse.data.data.some((hcmItemLangItem) => hcmItemLangItem.langid === langListItem.id))

                        let selectLanguageData = []
                        const newLangs = {}

                        filterLanguageList.map(item => {
                            Object.assign(newLangs, { [item.gcode]: item.description })
                            selectLanguageData.push(item.description)
                        })

                        setFilterLanguage(filterLanguageList)
                        setSelectedLanguage(selectLanguageData)

                        let useSelectLanguageData = []
                        selectLanguageData.map((item) => {
                            if(filterLangSelected.includes(item)){
                                useSelectLanguageData.push(item)
                            }
                        })
                        setLangSelected(useSelectLanguageData)
                        setIsChooseLanguageForModule(false)
                        setIsSynchronize(true)
                    } else if (hcmItemLangResponse.status === 401) {
                        enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'warning' })
                    }else {
                        setFilterLanguage([])
                        setLangSelected([])
                        setIsSynchronize(true)
                        setIsChooseLanguageForModule(false)
                    }
                })
            } else {
                setFilterLanguage([])
                setLangSelected([])
                setIsChooseLanguageForModule(false)
            }
        }).catch(() => {
            setFilterLanguage([])
            setLangSelected([])
            setIsChooseLanguageForModule(false)
            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
        })
    }

    const handleSaveChanges = async () => {
        setIsSavingEdits(true)
        const savingEditsKey = enqueueSnackbar(t('str_savingChangesPleaseWait'), { variant: 'info' })

        let fullUpdData = []
        //for src
        let srcFileData = []
        languageData.map((item) => srcFileData.push({ 'src': item.src }))
        fullUpdData = [{ gid: srcFileGid, filedata: JSON.stringify(srcFileData).base64Encode() }]

        //for trg
        languageList.map((langsListItem) => {
            const trgFileData = trgFileList.filter(filterItem => filterItem.langcode === langsListItem.gcode) || false
            if(trgFileData && trgFileData.length > 0 && filterLangSelected.includes(trgFileData[0].langdesc)){
                const filterLangData = languageData.filter(filterItem => filterItem[langsListItem.gcode]) || false
                if(filterLangData && filterLangData.length > 0){
                    let useDataGridData = []
                    filterLangData.map((filterLangItem) => { useDataGridData = [...useDataGridData, { 'src': filterLangItem.src, 'trg': filterLangItem[langsListItem.gcode], 'lng': langsListItem.gcode }]})
                    fullUpdData = [...fullUpdData, { gid: trgFileData[0].gid, filedata: JSON.stringify(useDataGridData).base64Encode() }]
                }
            }
        })

        await patchTargetHcmLangFile(fullUpdData)
            .then(()=> {
                closeSnackbar(savingEditsKey)
                enqueueSnackbar(t('str_theChangesHaveBeenSaved'), { variant: 'success' })
                setIsHasBeenAChange(false)
                setIsSavingEdits(false)
                const languageDataCaceKey = getLanguageDataCaceKey(selectedModule)
                localStorage.setItem(languageDataCaceKey, JSON.stringify(languageData))
                setUseLocalBackupActive(true)
            }).catch(()=> {
                closeSnackbar(savingEditsKey)
                enqueueSnackbar(t('str_theChangesHaveBeenNotSaved'), { variant: 'error' })
                setIsHasBeenAChange(false)
                setIsSavingEdits(false)
        })
    }

    const handleDeleteSelectedItems = () => {
        let newLangData = [...languageData]
        selectedRows.forEach(function (key) {
            const getIndex = newLangData.findIndex(indexItem => String(indexItem.src) === String(key))
            selectedRows.delete(key)
            newLangData.splice(getIndex, 1)
            setIsHasBeenAChange(true)
        })
        setLanguageData(newLangData)
    }

    const handleSyncTargetFiles = async (moduleNameCode, filterLanguage) => {
        return getTargetLangFile(moduleNameCode)
            .then(async (getTrgHcmLangResponse) => {
                if (getTrgHcmLangResponse.status === 200 && getTrgHcmLangResponse.data.count > 0) {
                    const trgHcmLangData = getTrgHcmLangResponse.data.data

                    //For trg file create
                    const crtTrgFileLangs = []
                    await filterLanguage.map(item => {
                        const chckData = trgHcmLangData.filter(trgItem => trgItem.langcode === item.gcode)[0] || false
                        if (!chckData) {
                            crtTrgFileLangs.push(item)
                        }
                    })

                    const delTrgFileLangs = []
                    await trgHcmLangData.map(item => {
                        const chckData = filterLanguage.filter(fltr => fltr.gcode === item.langcode)[0] || false
                        if (!chckData) {
                            delTrgFileLangs.push({
                                gid: item.gid,
                            })
                        }
                    })

                    if (filterLanguage?.length > 0 && delTrgFileLangs.length > 0) {
                        await deleteTargetHcmLangFile(delTrgFileLangs)
                    }

                    const trgData = await getCreatingTargetFiles(moduleNameCode, crtTrgFileLangs)
                    if (filterLanguage?.length > 0 && trgData.length > 0) {
                        return await createTargetHcmLangFile(trgData)
                            .then((createTrgHcmLangResponse) => {
                                if (createTrgHcmLangResponse.status === 200) {
                                    return handleSyncTargetFiles(moduleNameCode, filterLanguage)
                                } else if(createTrgHcmLangResponse.status === 401){
                                    enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'error' })
                                }else {
                                    enqueueSnackbar(t('str_synchronizationCouldNotBeCompleted'), { variant: 'warning' })
                                }
                            }).catch(()=> {
                                enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                            })
                    } else {
                        setTrgFile(trgHcmLangData)
                        enqueueSnackbar(t('str_synchronizationIsComplete'), { variant: 'success' })
                    }

                } else {
                    const trgData = await getCreatingTargetFiles(moduleNameCode, filterLanguage)
                    return await createTargetHcmLangFile(trgData)
                        .then((createTrgHcmLangResponse) => {
                            if (createTrgHcmLangResponse.status === 200) {
                                return handleSyncTargetFiles(moduleNameCode, filterLanguage)
                            } else if (createTrgHcmLangResponse.status === 401) {
                                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'error' })
                            }else {
                                enqueueSnackbar(t('str_synchronizationCouldNotBeCompleted'), { variant: 'warning' })
                            }
                        }).catch(()=> {
                            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                        })
                }
            })
    }

    //Requests for Hcm Source File
    const getSourceHcmLangFile = (code) => {
        return ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token,
            params: {
                query: `code::${code}`,
                limit: 1,
                hotelrefno: companyId
            },
        })
    }

    const createSourceHcmLangFile = (code) => {
        return Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token,
            data: {
                code: code,
                description: code + ' - HcmLang Source File',
                filetype: 'HCMLANG.SRC',
                contentype: '0000525',
                hotelrefno: companyId
            },
        })
    }

    const handleSyncSourceFiles = async (moduleCode) => {
        return getSourceHcmLangFile(moduleCode)
            .then((getSrcHcmLangResponse) => {
                if (getSrcHcmLangResponse.status === 200 && getSrcHcmLangResponse.data.count > 0) {
                    let dataEncode = getSrcHcmLangResponse?.data?.data[0]?.filedata?.base64Decode() || false
                    const dataOutput = dataEncode && dataEncode || []
                    setSrcFileGid(getSrcHcmLangResponse?.data?.data[0]?.gid)
                    setSrcFile(dataOutput)
                } else if(getSrcHcmLangResponse.status === 401){
                    enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'error' })
                }else {
                    return createSourceHcmLangFile(moduleCode)
                        .then((createSrcHcmLangResponse) => {
                            if (createSrcHcmLangResponse.status === 200) {
                                enqueueSnackbar(t('str_sourceFileCreated'), { variant: 'success' })
                            } else if(createSrcHcmLangResponse.status === 401){
                                enqueueSnackbar(t('str_sessionTimeoutLoginAgain'), { variant: 'error' })
                            }else {
                                enqueueSnackbar(t('str_sourceFileCouldNotBeCreated'), { variant: 'warning' })
                            }
                        }).catch(()=> {
                            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                        })
                }
            })
    }

    //Requests for Hcm Target File
    const getCreatingTargetFiles = (moduleNameCode, filterLanguage) =>{
        const newCrtList = []
        filterLanguage.map((item) => {
            newCrtList.push({
                code: moduleNameCode,
                description: moduleNameCode + ` - HcmLang Target File For ${item.code}`,
                langid: item.id,
                filetype: 'HCMLANG.TARGET',
                contentype: '0000525',
                hotelrefno: companyId,
            })
        })

        return newCrtList
    }

    const getTargetLangFile = (moduleNameCode) => {
        return ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token,
            params: {
                query: `code::${moduleNameCode}`,
                hotelrefno: companyId
            },
        })
    }

    const createTargetHcmLangFile = (data) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE + '/' + OREST_ENDPOINT.LISTINS,
            method: REQUEST_METHOD_CONST.POST,
            token,
            params: {
                hotelrefno: companyId
            },
            data: data,
        })
    }

    const deleteTargetHcmLangFile = (data) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE + '/' + OREST_ENDPOINT.LISTDEL,
            method: REQUEST_METHOD_CONST.DELETE,
            token,
            params: {
                hotelrefno: companyId
            },
            data: data,
        })
    }

    const patchTargetHcmLangFile = (data) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE + '/' + OREST_ENDPOINT.LISTPATCH,
            method: REQUEST_METHOD_CONST.PATCH,
            token,
            params: {
                hotelrefno: companyId
            },
            data: data,
        })
    }

    const onRowDelete = (e, { rowIdx }) => {
        setIsHasBeenAChange(true)
        setLanguageData([...languageData.slice(0, rowIdx), ...languageData.slice(rowIdx + 1)])
    }

    const onCellEdit = (e,  { selectedCellProps }) => {
        selectedCellProps.onKeyDown(e)
    }

    const onCellCopy = (e, { row, viewportColumns, selectedCellProps }) => {
        const useKey = viewportColumns[selectedCellProps.idx].key
        let description = row[useKey]
        if(description){
            if(description.length > 50){
                description = row[useKey].substring(0, 50) + '...'
            }else{
                description = row[useKey]
            }

            navigator.clipboard.writeText(row[useKey]).then(() => {
                enqueueSnackbar(t('str_copiedToClipboard').replace('%s', `"${description}"`), {
                    variant: 'success',
                    autoHideDuration: 2000,
                })
            })
        }else{
            enqueueSnackbar(t('str_noRecordSelectedBecauseItIsEmpty'), {
                variant: 'warning',
                autoHideDuration: 2000,
            })
        }
    }

    const isDisabledComponent = (componentName) => {
        const commonRulles = isLoading || isSyncComplete || isModuleListLoading || isSavingEdits || isChooseLanguageForModule
        const allCommonRulles =  !Boolean(selectedModule) || commonRulles

        switch (componentName) {
            case componentNames.ModuleSelect:
                return commonRulles
                break
            case componentNames.LanguageSelect:
                return allCommonRulles
                break
            case componentNames.SyncLanguageFilesForSelectedModuleButton:
                return allCommonRulles || !Boolean(languageList.length)
                break
            case componentNames.AvailableLanguageSelect:
                return allCommonRulles || !isFirstSync || !Boolean(selectedLanguage.length) || isSynchronize
                break
            case componentNames.AddNewSourceButton:
                return allCommonRulles || !isFirstSync || !Boolean(selectedLanguage.length)
                break
            case componentNames.DeleteSelectedItemsButton:
                return allCommonRulles || !(selectedRows.size > 0) || !isFirstSync
                break
            case componentNames.SaveChangesButton:
                return allCommonRulles || !isHasBeenAChange || !isFirstSync
                break
            case componentNames.GetLocalBackupButton:
                return allCommonRulles || !isFirstSync || !Boolean(selectedLanguage.length) && !useLocalBackupActive
                break
            default:
                return false
        }
    }

    const EmptyRowMsg = () => {
        if(!isFirstSync){
            if(!Boolean(selectedModule)){
                return {
                    icon: "sync",
                    txt: t('str_selectModuleForSync')
                }
            }else if(!Boolean(selectedLanguage.length)){
                return {
                    icon: "sync",
                    txt: t('str_selectLanguageForSync')
                }
            }else{
                return {
                    icon: "sync",
                    txt: t('str_clickSyncToSync')
                }
            }

        }else{
            return {
                icon: "add",
                txt: t('str_noRecordYouCanAddNewRecord')
            }
        }
    }

    const EmptyRowsRenderer = () => {
        return (
            <div className={classes.emptyMsgWrapper}>
                <div className={classes.emptyMsg}>
                    <Icon className={classes.emptyMsgIcon}>{EmptyRowMsg().icon}</Icon>
                    <span className={classes.emptyMsgTxt}>
                        {EmptyRowMsg().txt}
                    </span>
                </div>
            </div>
        )
    }

    const filteredRows = useMemo(() => {
        if(filters.search === '')
        return languageData
        return languageData.filter(filter => {
            if(filters.checked){
                return (JSON.stringify(filter).includes(filters.search))
            }
            return (JSON.stringify(filter).toLowerCase().includes(filters.search.toLowerCase()))
        })
    }, [languageData, filters.search, filters.checked])

    return (
        <Container maxWidth='xl' className={classes.rootContainer}>
            <Grid container justify='center' spacing={2}>
                <Grid item xs={12} sm={3}>
                    <Paper variant='outlined' square style={{ paddingTop: 10, paddingBottom: 10 }}>
                        <Box p={2}>
                            <Grid container justify='flex-start' spacing={2}>
                                <Grid item xs={12}>
                                    <ModuleSelection size="small" label={t('str_modules')} list={moduleList} value={selectedModule} onChange={(e)=> {
                                        if(isHasBeenAChange){
                                            const callBack = () => {
                                                setSelectedModule(e.target.value)
                                                setLanguageData([])
                                                setLangSelected([])
                                                setIsFirstSync(false)
                                                setIsSynchronize(false)
                                                setIsHasBeenAChange(false)
                                            }

                                            const action = key => (
                                                <React.Fragment>
                                                    <Button onClick={() => {
                                                        callBack()
                                                        closeSnackbar(key)
                                                    }}>
                                                        {t('str_no')}
                                                    </Button>
                                                    <Button onClick={async () => {
                                                        await handleSaveChanges()
                                                        callBack()
                                                        closeSnackbar(key)
                                                    }}>
                                                        {t('str_yes')}
                                                    </Button>
                                                </React.Fragment>
                                            )

                                            enqueueSnackbar(t('str_thereAreChangesYouHaventSavedWouldYouLikeToSave'), {
                                                variant: 'warning',
                                                autoHideDuration: 3000,
                                                action,
                                            })

                                        }else{
                                            setSelectedModule(e.target.value)
                                            setLanguageData([])
                                            setLangSelected([])
                                            setIsFirstSync(false)
                                            setIsSynchronize(false)
                                        }

                                        if(e.target.value){
                                            const languageDataCaceKey = getLanguageDataCaceKey(e.target.value)
                                            const languageDataCaceData = localStorage.getItem(languageDataCaceKey)
                                            if(languageDataCaceData){
                                                setUseLocalBackupActive(true)
                                            }else{
                                                setUseLocalBackupActive(false)
                                            }
                                        }

                                    }} disabled={isDisabledComponent(componentNames.ModuleSelect)}/>
                                </Grid>
                                <Grid item xs={12}>
                                    <LanguageSelect size="small" label={t('str_languages')} list={languageList} value={selectedLanguage} onChange={(e)=> handleChooseLanguageForModule(e.target.value)} inputCls={classes.inputCls} limit={2} disabled={isDisabledComponent(componentNames.LanguageSelect)} isSynchronize={isSynchronize}/>
                                </Grid>
                                <Grid item>
                                    <Button variant="outlined" color="primary" startIcon={<Icon>sync</Icon>} onClick={() => handleSyncLanguageFilesForSelectedModule()} disabled={isDisabledComponent('SyncLanguageFilesForSelectedModuleButton')}>{t('str_sync')}</Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <Paper variant='outlined' square style={{ paddingTop: 10, paddingBottom: 10 }}>
                        <Grid container>
                            <Grid item xs={6}>
                                <Grid container direction="row" justify="flex-start" alignItems="center">
                                    <Grid item>
                                        <Box p={1}>
                                            <TextFilter label={t('str_search')} onChange={(e)=> setFilters({ ...filters, search: e.target.value })}  onCheck={()=> setFilters({ ...filters, checked: !filters.checked })} checked={filters.checked} value={filters.search}/>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                <Grid container direction="row" justify="flex-end" alignItems="center">
                                    <Grid item xs={4}>
                                        <Box p={1}>
                                            <LanguageSelect size="small" label={t('str_availableLanguages')} list={filterLanguage} value={filterLangSelected} onChange={(e)=> setLangSelected(e.target.value)} inputCls={classes.inputCls} limit={2} disabled={isDisabledComponent(componentNames.AvailableLanguageSelect)}/>
                                        </Box>
                                    </Grid>
                                    <Grid item>
                                        <Box p={1}>
                                            <Button variant="outlined" color="primary" fullWidth startIcon={<Icon>add</Icon>} onClick={()=> setAddNewSrc(true)} disabled={isDisabledComponent(componentNames.AddNewSourceButton)}>
                                                {t('str_source')}
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                            <DataGrid
                                rowKey="src"
                                columns={dataGridColums}
                                rows={filteredRows}
                                rowKeyGetter={(row) => row.src || ''}
                                onRowsChange={(rows) => setLanguageData(rows)}
                                selectedRows={selectedRows}
                                onSelectedRowsChange={setSelectedRows}
                                rowRenderer={RowRenderer}
                                emptyRowsRenderer={EmptyRowsRenderer}
                            />
                        <ContextMenu id="grid-context-menu">
                            <MenuItem onClick={onCellEdit}>
                                <ListItemIcon className={classes.contextMenuIcon}>
                                    <Icon>edit</Icon>
                                </ListItemIcon>
                                <Typography variant="inherit" className={classes.contextMenuText}>
                                    {t('str_edit')}
                                </Typography>
                            </MenuItem>
                            <MenuItem onClick={onCellCopy}>
                                <ListItemIcon className={classes.contextMenuIcon}>
                                    <Icon>file_copy</Icon>
                                </ListItemIcon>
                                <Typography variant="inherit" className={classes.contextMenuText}>
                                    {t('str_copy')}
                                </Typography>
                            </MenuItem>
                            <MenuItem onClick={onRowDelete}>
                                <ListItemIcon className={classes.contextMenuIcon}>
                                    <Icon>delete</Icon>
                                </ListItemIcon>
                                <Typography variant="inherit" className={classes.contextMenuText}>
                                    {t('str_delete')}
                                </Typography>
                            </MenuItem>
                        </ContextMenu>
                        <Grid container direction="row" justify="flex-end" alignItems="center">
                            <Grid item>
                                <Box p={1}>
                                    <Button aria-controls="simple-menu" aria-haspopup="true"  className={classes.backupButton} startIcon={<Icon>restore</Icon>}  disabled={isDisabledComponent(componentNames.GetLocalBackupButton)}  onClick={(e)=> setUseLocalMenuCtx(e.currentTarget)}>Get Local Data</Button>
                                    <MuiMenu
                                        id="simple-menu"
                                        anchorEl={useLocalMenuCtx}
                                        keepMounted
                                        open={Boolean(useLocalMenuCtx)}
                                        onClose={()=> setUseLocalMenuCtx(false)}
                                    >
                                        <MuiMenuItem onClick={()=> setUseLocalBackup(true)}> {t('str_getLocalBackup')} </MuiMenuItem>
                                        <MuiMenuItem onClick={()=> [setUseLocalCompare(true), setUseLocalBackup(true)]}> {t('str_getLocalCompare')} </MuiMenuItem>
                                    </MuiMenu>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box p={1}>
                                    <Button variant="contained" className={classes.deleteButton} startIcon={<Icon>delete</Icon>} disableElevation disabled={isDisabledComponent(componentNames.DeleteSelectedItemsButton)} onClick={() => handleDeleteSelectedItems()}>{t('str_deleteSelected', { selected: selectedRows.size })}</Button>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box p={1}>
                                    <Button variant="contained" color="primary" startIcon={<Icon>save</Icon>} disableElevation onClick={() => handleSaveChanges()} disabled={isDisabledComponent(componentNames.SaveChangesButton)}>{t('str_saveChanges')}</Button>
                                </Box>
                            </Grid>
                        </Grid>
                        <AddSource open={addNewSrc} onClose={(status)=> setAddNewSrc(!status)} />
                        <GetLocalBackupDialog open={useLocalBackup} onClose={(status)=> {
                            setUseLocalCompare(!status)
                            setUseLocalBackup(!status)
                        }}/>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    )
}

export default LanguageEditor