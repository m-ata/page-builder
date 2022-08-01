import React, { useContext, useEffect, useState } from 'react'
import { ViewList, Insert, Delete, Patch } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import { FIELDTYPE, isErrorMsg, OREST_ENDPOINT, OREST_UPLOAD } from '../../../../../../../model/orest/constants'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import Fab from '@material-ui/core/Fab'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import { DropzoneDialog } from 'material-ui-dropzone'
import { makeStyles } from '@material-ui/core/styles'
import axios from 'axios'
import { toast } from 'react-toastify'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import LoadingSpinner from '../../../../../../LoadingSpinner'
import { COLORS, UPLOAD_SUCCESS, DELETE_SUCCESS, SAVED_SUCCESS, PERCENTAGE_VALUES } from '../../../../constants';
import { toSelfName } from './../../../../../../../lib/helpers/useFunction';
import Typography from '@material-ui/core/Typography'
import CancelIcon from '@material-ui/icons/Cancel'
import IconButton from '@material-ui/core/IconButton'
import Divider from '@material-ui/core/Divider'
import validator from 'validator'
import { PercentageSlider } from '../../../../../../../model/slider'
import Checkbox from '@material-ui/core/Checkbox'
import { FormControlLabel } from '@material-ui/core'
import InputColor from 'react-input-color'
import TextEditor from '../text-editor'
import BorderColorSharpIcon from '@material-ui/icons/BorderColorSharp'

const useStyles = makeStyles((theme) => ({
    root: {
        card: {
            maxWidth: 345,
        },
        media: {
            height: 0,
            paddingTop: '56.25%',
        },
    },
    submit: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        borderRadius: 20,
        marginTop: theme.spacing(1),
        float: 'right',
    },
    fabBtn: {
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(1),
    },
    disableEvent: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
    paperBlock: {
        height: 250,
        border: `2px solid ${COLORS?.secondary}`,
        overflow: 'auto',
        position: 'relative',
    },
    card: {
        height: 245,
        width: 392,
        cursor: 'pointer',
    },
    heading: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(2),
        fontWeight: 'bold',
        fontSize: 15,
    },
    textField: {
        paddingRight: theme.spacing(1),
    },
    alignText: {
        textAlign: 'right',
        color: 'red',
    },
}))

const UploadImage = (props) => {
    const { state, component, handleSectionComponent, handleNextDisable } = props

    const router = useRouter()
    const companyId = router.query.companyID
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal)
    const authToken = token || router.query.authToken
    //local state
    const [isDialogOpen, setDialogOpen] = useState(false)
    const [images, setImages] = useState([])
    const [itemCount, setItemCount] = useState(1)
    const [imageTitle, setImageTitle] = useState('')
    const [imageDesc, setImageDesc] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteBtn, setShowDeleteBtn] = useState(false)
    const [cta, setCta] = useState('')
    const [isOptimizeImage, setOptimizeImage] = useState(false)
    const [quality, setQuality] = useState(100)
    const [isImageQualityChange, setImageQualityChange] = useState(false)
    const [textColor, setTextColor] = useState(
        state?.assets?.colors?.slider?.main ? state.assets.colors.slider.main : '#fff'
    )
    const [localState, setLocalState] = useState({
        isTextEditorDialogOpen: false,
        editorValue: '',
        dialogType: '',
    })

    const { isTextEditorDialogOpen, editorValue, dialogType } = localState

    let imageID = ''

    const classes = useStyles()

    useEffect(() => {
        if (images.length === 0) {
            handleNextDisable(true)
        } else {
            handleNextDisable(false)
        }
    }, [images])

    useEffect(() => {
        if (component?.gid) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMIMG,
                token: authToken,
                params: {
                    query: `gid:${component.gid}`,
                    sort: 'orderno',
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                if (res.status === 200) {
                    if (res?.data?.data?.length > 0) {
                        let updatedImages = []
                        res.data.data.map((data) => {
                            updatedImages.push(data)
                        })
                        setImages(updatedImages)
                        res.data.data[0]?.title && setImageTitle(res.data.data[0]?.title)
                        res.data.data[0]?.description && setImageDesc(res.data.data[0]?.description)
                        res.data.data[0]?.cta && setCta(res.data.data[0]?.cta)
                    }
                } else {
                    const retErr = isErrorMsg(res)
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            })
        }
    }, [component])

    useEffect(() => {
        handleSectionComponent &&
            images?.length &&
            handleSectionComponent({
                service: 'hcmitemimg',
                type: 'image',
                gid: images[0]?.gid,
                textColor: textColor,
            })
    }, [textColor])

    const openDialog = () => {
        //it opens dialog for image upload
        setDialogOpen(true)
    }

    const closeDialog = () => {
        //it closes dialog for image upload
        setDialogOpen(false)
    }

    const ImageUpload = (apiUrl, endPoint, token, masterID, file) => {
        const url = apiUrl + '/' + endPoint + OREST_UPLOAD
        let binaryData = []
        binaryData.push(file)
        let formData = new FormData()
        formData.append('file', new Blob(binaryData, { type: file.type }), toSelfName(file.name));

        const options = {
            url: url,
            method: 'post',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            params: {
                orsactive: true,
                masterid: masterID,
                hotelrefno: companyId,
                quality: quality / 100,
                scale: quality / 100,
            },
            data: formData,
        }

        return axios(options)
            .then((response) => {
                return response
            })
            .catch((error) => {
                return error.response || { status: 0 }
            })
    }

    function asyncUpload(file, itemTreated, callback) {
        if (state.hcmItemId) {
            setTimeout(() => {
                Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMIMG,
                    token: authToken,
                    data: {
                        itemid: state.hcmItemId,
                        imgtype: FIELDTYPE.IMG,
                        orderno: itemTreated,
                        hotelrefno: Number(companyId),
                        imgquality: quality / 100,
                        imgscale: quality / 100,
                    },
                }).then((r1) => {
                    if (r1.status === 200) {
                        imageID = r1.data.data.id
                        ImageUpload(
                            GENERAL_SETTINGS.OREST_URL,
                            OREST_ENDPOINT.RAFILE,
                            authToken,
                            r1.data.data.mid,
                            file
                        ).then((r) => {
                            if (r.status === 200) {
                                handleSectionComponent({
                                    service: 'hcmitemimg',
                                    type: 'image',
                                    gid: r1.data.data.gid,
                                    textColor: textColor,
                                })
                                callback()
                            } else {
                                callback()
                            }
                        })
                    } else {
                        callback()
                    }
                })
            }, 100)
        }
    }

    const saveImage = (files) => {
        setIsSaving(true)
        let req = files.map((file) => {
            return new Promise((resolve) => {
                asyncUpload(file, itemCount, resolve)
                setItemCount((itemCount) => itemCount + 1)
            })
        })
        Promise.all(req).then(() => {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMIMG,
                token: authToken,
                params: {
                    query: `id:${imageID}`,
                    sort: 'orderno',
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                setIsSaving(false)
                if (res.status === 200) {
                    let updatedImages = []
                    res.data.data.map((data) => {
                        updatedImages.push(data)
                    })
                    setImages(updatedImages)
                    toast.success(UPLOAD_SUCCESS, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                    closeDialog()
                } else {
                    const retErr = isErrorMsg(res)
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            })
        })
    }

    const deleteImage = () => {
        setIsDeleting(true)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMIMG,
            token: authToken,
            gid: images[0].gid,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            setIsDeleting(false)
            if (res.status === 200) {
                setImages([])
                toast.success(DELETE_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            } else {
                const retErr = isErrorMsg(res)
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    const handleUpdateImage = () => {
        setIsSaving(true)
        Patch({
            // update slider
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMIMG,
            token: authToken,
            gid: images[0].gid,
            params: {
                hotelrefno: Number(companyId),
            },
            data: {
                title: imageTitle,
                description: imageDesc,
                cta: cta,
            },
        }).then((res) => {
            setIsSaving(false)
            if (res.status === 200) {
                toast.success(SAVED_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            } else {
                const retErr = isErrorMsg(res)
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    const handleImageQualityChange = (value) => {
        if (value >= 10 && value <= 90 && value % 10 === 0) {
            if (images?.length) {
                Patch({
                    // update image
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMIMG,
                    token: authToken,
                    gid: images[0].gid,
                    params: {
                        hotelrefno: Number(companyId),
                    },
                    data: {
                        imgquality: isImageQualityChange ? value / 100 : quality / 100,
                        imgscale: isImageQualityChange ? value / 100 : quality / 100,
                    },
                }).then((res1) => {
                    if (res1?.status === 200 && res1?.data?.data) {
                        setQuality(value)
                    } else {
                        const retErr = isErrorMsg(res)
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
            } else {
                setQuality(value)
            }
        }
    }

    const handleDialogOpen = (type) => {
        if (type === 'title') {
            setLocalState((prev) => ({
                ...prev,
                isTextEditorDialogOpen: true,
                dialogType: type,
                editorValue: imageTitle,
            }))
        }
        if (type === 'description') {
            setLocalState((prev) => ({
                ...prev,
                isTextEditorDialogOpen: true,
                dialogType: type,
                editorValue: imageDesc,
            }))
        }
    }

    const handleTextEditorValue = (value) => {
        if (dialogType === 'title') {
            setImageTitle(value)
        }
        if (dialogType === 'description') {
            setImageDesc(value)
        }
        setLocalState((prev) => ({ ...prev, isTextEditorDialogOpen: false, dialogType: '', editorValue: '' }))
    }

    const handleCancelEditor = () => {
        setLocalState((prev) => ({ ...prev, isTextEditorDialogOpen: false, dialogType: '', editorValue: '' }))
    }

    if (isSaving) {
        return <LoadingSpinner />
    }

    return (
        <React.Fragment>
            {state.hcmItemId && (
                <>
                    <Grid container={true} justify={'space-between'}>
                        <Grid item xs={6}>
                            <FormControlLabel
                                className={classes.labelFont}
                                control={
                                    <Checkbox
                                        size={'small'}
                                        checked={isOptimizeImage}
                                        onChange={() => {
                                            !isImageQualityChange && setQuality(state?.assets?.meta?.imageQuality * 100)
                                            setOptimizeImage(!isOptimizeImage)
                                        }}
                                        color="primary"
                                    />
                                }
                                label="Optimize Images"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Grid container={true} justify={'flex-end'}>
                                <Grid item xs={1} style={{ marginTop: 8 }}>
                                    <Typography component={'span'}>Text</Typography>
                                </Grid>
                                <Grid item xs={2}>
                                    <InputColor
                                        onChange={(color) => setTextColor(color.hex)}
                                        placement="right"
                                        initialValue={textColor}
                                        style={{ marginTop: 8 }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs={12}>
                            {isOptimizeImage && (
                                <PercentageSlider
                                    marks={PERCENTAGE_VALUES}
                                    value={quality}
                                    onChange={(e, value) => {
                                        handleImageQualityChange(value)
                                        !isImageQualityChange && setImageQualityChange(true)
                                    }}
                                />
                            )}
                        </Grid>
                    </Grid>
                    <Grid container={true} justify={'flex-start'} spacing={3}>
                        <Grid item={true} xs={6}>
                            <Paper className={classes.paperBlock}>
                                {images.length > 0 &&
                                    images.map((value, index) => {
                                        return (
                                            <Grid container={true} key={index} justify={'center'}>
                                                <Grid item className={isDeleting ? classes.disableEvent : ''}>
                                                    <Card className={classes.card}>
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + value.fileurl
                                                                })`,
                                                                height: '100%',
                                                                width: '100%',
                                                                backgroundSize: 'cover',
                                                            }}
                                                            onMouseEnter={() => setShowDeleteBtn(true)}
                                                            onMouseLeave={() => setShowDeleteBtn(false)}
                                                        >
                                                            {showDeleteBtn && (
                                                                <IconButton
                                                                    onClick={deleteImage}
                                                                    disabled={isDeleting}
                                                                    aria-label="upload picture"
                                                                    component="span"
                                                                    style={{ float: 'right' }}
                                                                    color={'primary'}
                                                                >
                                                                    <CancelIcon style={{ width: 30, height: 30 }} />
                                                                </IconButton>
                                                            )}
                                                        </div>
                                                    </Card>
                                                </Grid>
                                            </Grid>
                                        )
                                    })}
                                {images.length === 0 && (
                                    <Typography
                                        component={'div'}
                                        style={{
                                            height: 250,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Fab
                                            onClick={openDialog}
                                            variant="extended"
                                            size="small"
                                            color="primary"
                                            aria-label="add"
                                            className={classes.fabBtn}
                                            disabled={images.length > 0}
                                        >
                                            <CloudUploadIcon />
                                            UPLOAD
                                        </Fab>
                                    </Typography>
                                )}
                                <DropzoneDialog
                                    open={isDialogOpen}
                                    onSave={saveImage}
                                    acceptedFiles={['image/jpeg', 'image/png', 'image/bmp', 'image/gif']}
                                    showPreviews={true}
                                    maxFileSize={5000000}
                                    onClose={closeDialog}
                                    filesLimit={1}
                                />
                            </Paper>
                        </Grid>
                        <Grid item={true} xs={6}>
                            <Paper className={classes.paperBlock}>
                                <Grid container justify={'flex-start'} spacing={3}>
                                    <Grid item xs={3}>
                                        <Typography
                                            component={'h6'}
                                            variant={'h6'}
                                            className={classes.heading}
                                            style={{ marginTop: 24 }}
                                        >
                                            Title
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <IconButton
                                            aria-label="Edit Title"
                                            color="primary"
                                            onClick={() => handleDialogOpen('title')}
                                            style={{ float: 'right' }}
                                        >
                                            <BorderColorSharpIcon color="primary" />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                                <Grid container justify={'flex-start'} spacing={3}>
                                    <Grid item xs={3}>
                                        <Typography
                                            component={'h6'}
                                            variant={'h6'}
                                            className={classes.heading}
                                            size={'small'}
                                        >
                                            Description
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <IconButton
                                            aria-label="Edit Title"
                                            color="primary"
                                            onClick={() => handleDialogOpen('description')}
                                            style={{ float: 'right' }}
                                        >
                                            <BorderColorSharpIcon color="primary" />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                                {(state.type === 'email' || state.type === 'emailOnly') && (
                                    <Grid container justify={'flex-start'} spacing={3}>
                                        <Grid item xs={3}>
                                            <Typography component={'h6'} variant={'h6'} className={classes.heading}>
                                                Link
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <TextField
                                                id="image-description"
                                                variant={'outlined'}
                                                fullWidth
                                                placeholder={'Please Link here'}
                                                onChange={(e) => setCta(e.target.value)}
                                                size={'small'}
                                                className={classes.textField}
                                                error={cta ? !validator.isURL(cta) : false}
                                                value={cta}
                                                helperText={
                                                    cta && (
                                                        <Typography
                                                            variant="caption"
                                                            className={classes.alignText}
                                                            display="block"
                                                        >
                                                            {`${cta?.length} < 100`}
                                                        </Typography>
                                                    )
                                                }
                                                inputProps={{ maxLength: 99 }}
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                                <Divider style={{ marginTop: 8 }} />
                                <Button
                                    onClick={handleUpdateImage}
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    aria-label="add"
                                    className={classes.submit}
                                    disabled={images.length === 0}
                                >
                                    SUBMIT
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
            {isTextEditorDialogOpen && (
                <TextEditor
                    handleSaveTextEditor={handleTextEditorValue}
                    handleCancelTextEditor={handleCancelEditor}
                    data={editorValue}
                />
            )}
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

export default connect(mapStateToProps)(UploadImage)
