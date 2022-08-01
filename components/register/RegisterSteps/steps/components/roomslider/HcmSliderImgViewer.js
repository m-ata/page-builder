import React, { useContext, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import useNotifications from 'model/notification/useNotifications'
import Image from 'next/image'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import Chip from '@material-ui/core/Chip'
import { isErrorMsg, OREST_ENDPOINT } from 'model/orest/constants'
import { Delete, Insert, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from '../../../../../../lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: '100%',
        maxHeight: '365px',
    },
    dialogPaper: {
        padding: 10,
    },
    tagChip: {
        margin: 5,
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    card: {
        maxWidth: 345,
        width: '100%',
        cursor: 'grab',
    },
    media: {
        height: 0,
        paddingTop: '56.25%',
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    margin: {
        margin: theme.spacing(1),
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    Image: {
        userDrag: 'none',
        userSelect: 'none',
        objectFit: 'contain',
    },
}))

const HcmItemImgViewer = (props) => {
    const classes = useStyles()
    const {
        setToState,
        updateState,
        state,
        imageUrl,
        itemIndex,
        itemGid,
        categoryID,
        groupIndex,
        itemTags,
        itemMid,
    } = props
    const { t } = useTranslation()
    const cls = useStyles()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [isDeleting, setIsDeleting] = useState(false)
    const [newItemTagVal, setNewItemTagVal] = useState('')
    const [itemTagList, setItemTagList] = useState([])
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { showSuccess, showError } = useNotifications()
    const [open, setOpen] = useState(false)

    const _getItemTagCommonData = () => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RATAG,
            token: token,
            params: {
                query: 'masterid:' + itemMid,
                sort: 'id',
                hotelrefno: Number(companyId),
            },
        }).then((res1) => {
            if (res1.status === 200 && res1.data.data) {
                setToState(
                    'registerStepper',
                    [
                        'hcmItemImgCategory',
                        String(groupIndex),
                        'hcmItemImgItems',
                        String(itemIndex),
                        'hcmItemImgItemTags',
                    ],
                    res1.data.data
                )
            }
        })
    }

    useEffect(() => {
        if (typeof itemTags === 'object') {
            setItemTagList(itemTags)
        }
    }, [itemTags])

    const handleHcmItemImgDel = (itemGid) => {
        setIsDeleting(true)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMIMG,
            token: token,
            gid: itemGid,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMIMG,
                    token: token,
                    params: {
                        query: `catid:${categoryID}`,
                        sort: 'orderno',
                        hotelrefno: Number(companyId),
                    },
                }).then((res) => {
                    if (res.status === 200) {
                        setIsDeleting(false)
                        setToState(
                            'registerStepper',
                            ['hcmItemImgCategory', String(groupIndex), 'hcmItemImgItems'],
                            res.data.data
                        )
                    } else {
                        setIsDeleting(false)
                        const retErr = isErrorMsg(res)
                        showError(retErr.errorMsg)
                    }
                })
            } else {
                setIsDeleting(false)
            }
        })
    }

    const handleImgTagIns = () => {
        if (newItemTagVal === '') {
            showError('Value field cannot be empty!')
        } else {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RATAG,
                token: token,
                params: {
                    query: 'masterid:' + itemMid + ',tagstr:' + newItemTagVal,
                    hotelrefno: Number(companyId),
                },
            }).then((res1) => {
                if (res1.status === 200 && res1.data.data.length > 0) {
                    showError('This tag is used, try a new tag.')
                } else {
                    Insert({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RATAG,
                        token: token,
                        data: {
                            tagstr: newItemTagVal,
                            masterid: itemMid,
                            hotelrefno: Number(companyId),
                        },
                    }).then((res1) => {
                        if (res1.status === 200) {
                            _getItemTagCommonData()
                            setNewItemTagVal('')
                            showSuccess('New tag added!')
                        } else {
                            const retErr = isErrorMsg(res1)
                            showError(retErr.errorMsg)
                        }
                    })
                }
            })
        }
    }

    const handleImgTagDel = (gid) => {
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RATAG,
            token: token,
            gid: gid,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200) {
                _getItemTagCommonData()
            }
        })
    }

    const handleOpen = () => {
        setOpen(true)
        updateState('registerStepper', 'photosGridDragAndDrop', true)
    }

    const handleClose = () => {
        setOpen(false)
        updateState('registerStepper', 'photosGridDragAndDrop', false)
    }

    return (
        <React.Fragment>
            <Card className={classes.card}>
                <Image
                    src={imageUrl}
                    layout="responsive"
                    width={700}
                    height={475}
                />
                <CardActions disableSpacing style={{ padding: 5 }}>
                    <Tooltip title="Edit Item Tag">
                        <IconButton style={{ marginLeft: 5 }} size="small" onClick={() => handleOpen()}>
                            <EditIcon fontSize={'small'} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Category Item">
                        <IconButton
                            style={{ marginLeft: 5 }}
                            size="small"
                            disabled={isDeleting}
                            onClick={() => handleHcmItemImgDel(itemGid)}
                        >
                            <DeleteIcon fontSize={'small'} />
                        </IconButton>
                    </Tooltip>
                    <div style={{ marginLeft: 'auto', paddingRight: 5 }}>
                        <span style={{ fontSize: 16, paddingTop: 3 }}>#{parseInt(itemIndex + 1)}</span>
                    </div>
                </CardActions>
            </Card>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
                fullWidth={true}
                maxWidth="sm"
            >
                <DialogTitle id="form-dialog-title">{t('str_editTags')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} direction="row" justify="center" alignItems="center">
                        <Grid item xs={12} sm={8}>
                            <TextField
                                name="value"
                                label="Tag Value"
                                type="text"
                                fullWidth
                                value={newItemTagVal}
                                onChange={(e) => setNewItemTagVal(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button fullWidth variant="contained" color="primary" onClick={() => handleImgTagIns()}>
                                {t('str_addTag')}
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid container spacing={3} direction="row" justify="center" alignItems="center">
                        <Grid item xs={12}>
                            <Paper className={classes.dialogPaper}>
                                {itemTagList && itemTagList.length > 0 ? (
                                    itemTagList.map((tagItem, tagIndex) => (
                                        <Chip
                                            key={tagIndex}
                                            size="small"
                                            className={classes.tagChip}
                                            onDelete={() => handleImgTagDel(tagItem.gid)}
                                            label={`${tagItem.tagstr}`}
                                        />
                                    ))
                                ) : (
                                    <span>{t('str_tagNotDefined')}</span>
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
        </React.Fragment>
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
})

export default connect(mapStateToProps, mapDispatchToProps)(HcmItemImgViewer)
