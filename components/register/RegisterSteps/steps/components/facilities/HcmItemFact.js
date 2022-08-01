import React, { useContext, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { useRouter } from 'next/router'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Edit from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import useNotifications from 'model/notification/useNotifications'
import Paper from '@material-ui/core/Paper'
import { Delete, Insert, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import Box from '@material-ui/core/Box'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import { DEFINED_HOTEL_REF_NO, FIELDTYPE, isErrorMsg, OREST_ENDPOINT } from 'model/orest/constants'
import LoadingSpinner from 'components/LoadingSpinner'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Chip from '@material-ui/core/Chip'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import { DatePicker, LocalizationProvider } from '@material-ui/pickers'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles({
    root: {
        minWidth: 275,
        maxHeight: 200,
        height: '100%',
    },
    dialogPaper: {
        padding: 10,
    },
    attrChip: {
        margin: 5,
    },
    formControl: {
        width: '100%',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    itemText: {
        maxHeight: 60,
        height: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    editBoxWrapper: {
        "&:hover $isToolbar": {
            display: 'block',
        },
    },
    isToolbar: {
        display: 'none',
    },
})

const HcmItemFact = (props) => {
    const { t } = useTranslation()
    const cls = useStyles()
    const {
        state,
        setToState,
        deleteFromState,
        pushToState,
        hotelFactItem,
        groupIndex,
        hcmItemID,
        itemID,
        itemIndex,
        sectionDescription,
        factDescription,
        hotelRefNo,
        itemGid,
    } = props
    const classes = useStyles()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [isTransaction, setTransaction] = useState(false)
    const [isDelete, setIsDelete] = useState(false)
    const [selectItemAttrList, setSelectItemAttrList] = useState([])
    const [itemAttrList, setItemAttrList] = useState([])
    const [newItemAttr, setNewItemAttr] = useState('')
    const [newItemAttrVal, setNewItemAttrVal] = useState('')
    const [newItemAttrFieldType, setNewItemAttrFieldType] = useState('')
    const { showSuccess, showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const [open, setOpen] = useState(false)

    let isChecked = false,
        hotelFactItemID,
        hotelFactItemGID
    if (typeof hotelFactItem === 'object') {
        isChecked = hotelFactItem.id !== null ? true : false
        hotelFactItemID = hotelFactItem.id
        hotelFactItemGID = hotelFactItem.gid
    }

    const _getFacilitiesItemAttrCommonData = () => {
        if (typeof hotelFactItem === 'object') {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMFACTATTR,
                token: token,
                params: {
                    query: 'factid:' + itemID,
                    allhotels: true
                },
            }).then((r1) => {
                if (r1.status === 200) {
                    if (r1.data.data && r1.data.data.length > 0) {
                        setSelectItemAttrList(r1.data.data)
                        ViewList({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.HCMITEMATTR,
                            token: token,
                            params: {
                                query: 'itemfactid:' + hotelFactItemID,
                                hotelrefno: Number(companyId),
                            },
                        }).then((r2) => {
                            if (r2.status === 200) {
                                if (r2.data.data && r2.data.data.length > 0) {
                                    let newItemAttrList = []
                                    r1.data.data.map((itemList, itemListIndex) => {
                                        if (!r2.data.data.some((item) => item.factattrid === itemList.id)) {
                                            newItemAttrList.push(itemList)
                                        }
                                    })
                                    setSelectItemAttrList(newItemAttrList)
                                    setItemAttrList(r2.data.data)

                                    //fieldtype
                                    setNewItemAttr(newItemAttrList && newItemAttrList[0] && newItemAttrList[0].id || '')
                                    setNewItemAttrFieldType(newItemAttrList && newItemAttrList[0] && newItemAttrList[0].fieldtype || '')

                                } else {
                                    setSelectItemAttrList(r1.data.data)
                                    setItemAttrList([])
                                }
                            }
                        })
                    }
                } else {
                    const retErr = isErrorMsg(r1)
                    showError(retErr.errorMsg)
                }
            })
        }
    }

    useEffect(() => {
        _getFacilitiesItemAttrCommonData()
    }, [hotelFactItem])

    const handleFactItemCheck = async () => {
        let isViewList = false
        let newID = 0
        setTransaction(true)
        if (isChecked) {
            await Delete({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMFACT,
                token: token,
                gid: hotelFactItemGID,
                params: {
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                if (res.status === 200) {
                    setTransaction(false)
                } else {
                    setTransaction(false)
                }
            })
        } else {
            await Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMFACT,
                token: token,
                data: {
                    itemid: hcmItemID,
                    factid: itemID,
                    hotelrefno: Number(companyId),
                },
            }).then((r1) => {
                if (r1.status === 200) {
                    isViewList = true
                    newID = r1.data.data.id
                } else {
                    setTransaction(true)
                }
            })
        }

        if (isViewList && newID !== 0) {
            await ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMFACT,
                token: token,
                params: {
                    query: `factid:${itemID}`,
                    hotelrefno: Number(companyId),
                },
            }).then((r2) => {
                if (r2.status === 200) {
                    setToState(
                        'registerStepper',
                        [
                            'hcmFacilities',
                            String(groupIndex),
                            'hcmFactCategoryItems',
                            String(itemIndex),
                            'hcmFactCategoryItem',
                        ],
                        r2.data.data[0]
                    )
                    setTransaction(false)
                    _getFacilitiesItemAttrCommonData()
                }
            })
        } else {
            setToState(
                'registerStepper',
                ['hcmFacilities', String(groupIndex), 'hcmFactCategoryItems', String(itemIndex), 'hcmFactCategoryItem'],
                { id: null, gid: null }
            )
            setTransaction(false)
            setSelectItemAttrList([])
            setItemAttrList([])
        }
    }

    const handleFactAttrIns = () => {

        if (newItemAttr === '' || newItemAttr === null) {
            showError('Please select a attribute!')
        } else if (newItemAttrVal === '' || newItemAttrVal === null) {
            showError('Value field cannot be empty!')
        } else {
            let data = {
                itemfactid: hotelFactItemID,
                factattrid: newItemAttr,
                hotelrefno: Number(companyId),
            }

            switch (String(newItemAttrFieldType)) {
                case String(FIELDTYPE.INT):
                    data.valueint = parseInt(newItemAttrVal)
                    break;
                case String(FIELDTYPE.FLOAT):
                    data.valueflt = parseFloat(newItemAttrVal)
                    break;
                case String(FIELDTYPE.CODE):
                    data.valuetxt = String(newItemAttrVal).toUpperCase()
                    break;
                case String(FIELDTYPE.DESCRIPTION):
                    data.valuetxt = String(newItemAttrVal)
                    break;
                case String(FIELDTYPE.DATEYEAR):
                    data.valuedate = newItemAttrVal
                    break;
                case String(FIELDTYPE.DATEMONTH):
                    data.valuedate = newItemAttrVal
                    break;
                case String(FIELDTYPE.DATEDAY):
                    data.valuedate = newItemAttrVal
                    break;
                case String(FIELDTYPE.YESNO):
                    data.valuetxt = String(newItemAttrVal)
                    break;
                default:
                    data.valuetxt = String(newItemAttrVal)
            }

            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMATTR,
                token: token,
                data,
            }).then((hcmItemAttrInsResponse) => {
                if (hcmItemAttrInsResponse.status === 200) {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMITEMATTR,
                        token: token,
                        params: {
                            query: 'itemfactid:' + hotelFactItemID,
                            hotelrefno: Number(companyId),
                        },
                    }).then((hcmItemAttrViewResponse) => {
                        if (hcmItemAttrViewResponse.status === 200) {
                            _getFacilitiesItemAttrCommonData()
                        }
                    })
                    setNewItemAttrVal('')
                    showSuccess('New attr added!')
                } else {
                    const retErr = isErrorMsg(hcmItemAttrInsResponse)
                    showError(retErr.errorMsg)
                }
            })
        }
    }

    const handleFactDel = (gid) => {
        setIsDelete(true)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMFACT,
            token: token,
            gid: gid,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200) {
                setIsDelete(false)
                deleteFromState('registerStepper', ['hcmFacilities', String(groupIndex), 'hcmFactCategoryItems'], [String(itemIndex), 1])
            } else {
                setIsDelete(false)
            }
        })
    }

    const handleFactAttrDel = (gid) => {
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMATTR,
            token: token,
            gid: gid,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200) {
                _getFacilitiesItemAttrCommonData()
            }
        })
    }

    const handleSelectAttr = (id) => {
        setNewItemAttr(Number(id))
        if (selectItemAttrList.length > 0) {
            const fieldType = selectItemAttrList.find((item) => item.id === id).fieldtype
            if (fieldType) {
                setNewItemAttrFieldType(fieldType)
            }
        }
    }

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const getAttrValue = (value) => {
        switch (String(value.fieldtype)) {
            case String(FIELDTYPE.INT):
                return value.valueint
                break;
            case String(FIELDTYPE.FLOAT):
                return value.valueflt
                break;
            case String(FIELDTYPE.CODE):
                return value.valuetxt
                break;
            case String(FIELDTYPE.DESCRIPTION):
                return value.valuetxt
                break;
            case String(FIELDTYPE.DATEYEAR):
                return moment(value.valuedate).format('YYYY')
                break;
            case String(FIELDTYPE.DATEMONTH):
                return moment(value.valuedate).format('MM')
                break;
            case String(FIELDTYPE.DATEDAY):
                return moment(value.valuedate).format('DD')
                break;
            case String(FIELDTYPE.YESNO):
                return value.valuetxt === 'No' ? 'No' : 'Yes'
                break;
            default:
                return value.valuetxt
        }
    }

    return (
        <Grid item xs={4} className={cls.editBoxWrapper}>
            <Card className={classes.root} variant="outlined">
                <CardContent>
                    <Grid container spacing={0}>
                        <Grid item xs={9}>
                            <Tooltip title="Section Description">
                                <Typography variant="subtitle1" color="textSecondary" noWrap>
                                    {sectionDescription}
                                </Typography>
                            </Tooltip>
                        </Grid>
                        <Grid item style={{ marginLeft: 'auto', marginRight: 5 }}>
                            <Box className={cls.isToolbar}>
                                <Tooltip title={!isChecked ? 'You must first activate.' : 'Click to add attribute'}>
                                    <span>
                                        <IconButton disabled={!isChecked} size="small" onClick={handleOpen}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip
                                    title={
                                        Number(hotelRefNo) !== Number(companyId)
                                            ? 'Std definition cannot be deleted'
                                            : 'Delete Item'
                                    }
                                >
                                    <span>
                                        <IconButton
                                            disabled={Number(hotelRefNo) !== Number(companyId) || isDelete || false}
                                            size="small"
                                            onClick={() => handleFactDel(itemGid)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                        </Grid>
                    </Grid>
                    <FormControlLabel
                        control={
                            isTransaction ? (
                                <span style={{ paddingTop: 3, paddingLeft: 10, paddingRight: 9 }}>
                                    <LoadingSpinner size={18}/>
                                </span>
                            ) : (
                                <Checkbox
                                    color="primary"
                                    checked={isChecked}
                                    onChange={handleFactItemCheck}
                                    name={factDescription}
                                />
                            )
                        }
                        label={
                            <React.Fragment>
                                <Tooltip title="Facility Description">
                                    <span>
                                    {factDescription}
                                    </span>
                                </Tooltip>
                            </React.Fragment>
                        }
                    />
                    <Typography variant="caption" display="block">
                        {itemAttrList && itemAttrList.length > 0 ? (
                            itemAttrList.map((attrItem, attrIndex) => (
                                <React.Fragment key={attrIndex}>
                                    {(attrIndex ? ', ' : '') + (attrItem.factattrname + ': ' + getAttrValue(attrItem))}
                                </React.Fragment>
                            ))
                        ) : (
                            <Tooltip title="You can add attribute by clicking Edit.">
                                <span>{t('str_attributeNotDefined')}.</span>
                            </Tooltip>
                        )}
                    </Typography>
                </CardContent>
            </Card>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
                fullWidth={true}
                maxWidth="sm"
                disableEnforceFocus
            >
                <DialogTitle id="form-dialog-title">{t('str_editAttribute')}</DialogTitle>
                <DialogContent>
                    {selectItemAttrList && selectItemAttrList.length > 0 ? (
                        <Grid container spacing={3} direction="row" justify="center" alignItems="center">
                            <Grid item xs={12} sm={4}>
                                <FormControl margin="dense" className={cls.formControl}>
                                    <InputLabel id="hcmFactAttr-label">{t('str_attribute')}</InputLabel>
                                    <Select
                                        labelId="hcmFactAttr-label"
                                        id="hcmFactAttr-select"
                                        onChange={(e) => handleSelectAttr(e.target.value)}
                                        value={newItemAttr && String(newItemAttr) || ''}
                                    >
                                        {selectItemAttrList &&
                                            selectItemAttrList.length > 0 &&
                                            selectItemAttrList.map((itemAttr, itemAttrIndex) => {
                                                return (
                                                    <MenuItem key={itemAttrIndex} value={Number(itemAttr.id)}>
                                                        {itemAttr.attrname}
                                                    </MenuItem>
                                                )
                                            })}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                {String(newItemAttrFieldType) === String(FIELDTYPE.INT) ?
                                    <TextField margin="dense" name="value" label="Integer" type="number" fullWidth disabled={!newItemAttr} value={newItemAttrVal} onChange={(e) => {setNewItemAttrVal(e.target.value)}}/> :
                                String(newItemAttrFieldType) === String(FIELDTYPE.FLOAT) ?
                                    <TextField margin="dense" name="value" label="Float" type="number" fullWidth disabled={!newItemAttr} value={newItemAttrVal} onChange={(e) => {setNewItemAttrVal(e.target.value)}}/> :
                                String(newItemAttrFieldType) === String(FIELDTYPE.CODE) ?
                                    <TextField margin="dense" name="value" label="Code" fullWidth disabled={!newItemAttr} value={newItemAttrVal} onChange={(e) => {setNewItemAttrVal(e.target.value)}}/> :
                                String(newItemAttrFieldType) === String(FIELDTYPE.DESCRIPTION) ?
                                    <TextField margin="dense" name="value" label="Description" type="text" fullWidth disabled={!newItemAttr} value={newItemAttrVal} onChange={(e) => {setNewItemAttrVal(e.target.value)}}/> :
                                String(newItemAttrFieldType) === String(FIELDTYPE.DATEYEAR) ?
                                    <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                        <DatePicker
                                            autoOk
                                            id="value"
                                            name="value"
                                            label="Year"
                                            inputFormat="YYYY"
                                            openTo={'year'}
                                            views={['year']}
                                            value={newItemAttrVal || null}
                                            onChange={(date) => setNewItemAttrVal(date)}
                                            renderInput={(props) => <TextField {...props} fullWidth margin="dense" helperText="" />}
                                        />
                                    </LocalizationProvider> :
                                String(newItemAttrFieldType) === String(FIELDTYPE.DATEMONTH) ?
                                    <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                        <DatePicker
                                            autoOk
                                            id="value"
                                            name="value"
                                            label="Month"
                                            inputFormat="MM"
                                            openTo={'month'}
                                            views={['month']}
                                            value={newItemAttrVal || null}
                                            onChange={(date) => setNewItemAttrVal(date)}
                                            renderInput={(props) => <TextField {...props} fullWidth margin="dense" helperText="" />}
                                        />
                                    </LocalizationProvider> :
                                String(newItemAttrFieldType) === String(FIELDTYPE.DATEDAY) ?
                                    <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                                        <DatePicker
                                            autoOk
                                            id="value"
                                            name="value"
                                            inputFormat="DD"
                                            label="Day"
                                            openTo={'date'}
                                            views={['date']}
                                            value={newItemAttrVal || null}
                                            onChange={(date) => setNewItemAttrVal(date)}
                                            renderInput={(props) => <TextField {...props} fullWidth margin="dense" helperText="" />}
                                        />
                                    </LocalizationProvider> :
                                    String(newItemAttrFieldType) === String(FIELDTYPE.YESNO) ?
                                        <TextField id="select" label="Yes / No" onChange={(e) => setNewItemAttrVal(e.target.value)} value={String(newItemAttrVal) || ''} select fullWidth>
                                            <MenuItem value="No">No</MenuItem>
                                            <MenuItem value="Yes">Yes</MenuItem>
                                        </TextField> :
                                    <TextField margin="dense" name="value" label="Description" type="text" fullWidth disabled={!newItemAttr} value={newItemAttrVal} onChange={(e) => {setNewItemAttrVal(e.target.value)}}/>
                                }
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleFactAttrIns()}
                                >
                                    {t('str_addAttr')}
                                </Button>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper className={classes.dialogPaper}>{t('str_noAttributeToSelect')}</Paper>
                            </Grid>
                        </Grid>
                    )}
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper className={classes.dialogPaper}>
                                {itemAttrList && itemAttrList.length > 0 ? (
                                    itemAttrList.map((attrItem, attrIndex) => (
                                        <Chip
                                            key={attrIndex}
                                            size="small"
                                            className={classes.attrChip}
                                            onDelete={() => handleFactAttrDel(attrItem.gid)}
                                            label={`${attrItem.factattrname}: ${getAttrValue(attrItem)}`}
                                        />
                                    ))
                                ) : (
                                    <Tooltip title="You can add attribute by clicking Edit.">
                                        <span>{t('str_attributeNotDefined')}</span>
                                    </Tooltip>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t('str_close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HcmItemFact)
