import React, { useContext, useState, useEffect } from 'react'
//material imports
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Card from '@material-ui/core/Card'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
//dropzone import
import ReactDropzone from 'react-dropzone'
//redux imports
import { connect } from 'react-redux'
import { Upload, ViewList } from '@webcms/orest'
import WebCmsGlobal from '../../../../webcms-global'
import { useRouter } from 'next/router'

import { COLORS, PERCENTAGE_VALUES, UPLOAD_SUCCESS } from '../../constants'
import { setToState, updateState } from '../../../../../state/actions'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../model/orest/constants'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import { toast } from 'react-toastify'
import validator from 'validator'
import { PercentageSlider } from '../../../../../model/slider'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    block: {
        position: 'relative',
        width: 500,
        height: 300,
        border: 4,
        borderColor: 'silver',
        borderStyle: 'dashed',
        borderRadius: 5,
    },
    previewStyle: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center ',
        width: '100%',
        height: '100%',
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: theme.spacing(2),
    },
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    },
    icon: {
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        opacity: 0.3,
    },
    logoBlock: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'lightgray',
        margin: theme.spacing(1),
    },
    favIcon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'lightgray',
        borderRadius: 4,
        margin: theme.spacing(1),
        cursor: 'pointer',
    },
    previewBlock: {
        margin: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        borderColor: 'lightgray',
        borderRadius: 4,
    },
    card: {
        height: 480,
    },
    heading: {
        marginLeft: 8,
        marginTop: 8,
        color: COLORS?.secondary,
        fontWeight: 'bold',
    },
    formControl: {
        margin: 8,
    },
    textArea: {
        borderColor: 'silver',
        borderRadius: 5,
        margin: theme.spacing(1),
        overflow: 'auto',
        width: '100%'
    },
    infoText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF0000',
        marginLeft: 8,
    },
    asteric: {
        color: 'red'
    }
}))

const Asset = (props) => {
    const { state, setToState, updateState } = props

    const classes = useStyles()
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal)
    const router = useRouter()
    const companyId = router.query.companyID
    const authToken = token || router.query.authToken

    const [languages, setLanguages] = useState([])
    const [selectedLanguage, setSelectedLanguage] = useState('')
    const [quality, setQuality] = useState(
        state?.assets?.meta?.imageQuality ? state?.assets?.meta?.imageQuality * 100 : 0
    )

    useEffect(() => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RALANG,
            token: authToken,
            params: {
                query:'gcode:notnull,gcode!"",isactive:true',
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200 && res.data && res.data.data.length > 0) {
                setLanguages(res.data.data)
                if (!state?.assets?.meta?.lang) {
                    const preSelectedLanguage = res.data.data[0]
                    setToState('pageBuilder', ['assets', 'meta', 'lang'], preSelectedLanguage.code.toLowerCase())
                    setSelectedLanguage(preSelectedLanguage)
                } else {
                    res.data.data.some((lang) => {
                        if (state?.assets?.meta?.lang === lang.code.toLowerCase()) {
                            setSelectedLanguage(lang)
                            return true
                        }
                    })
                }
            }
        })
    }, [])

    const onDropLogo = (acceptedFile, logoType, gid) => {
        if (
            acceptedFile[0]?.type.toLowerCase() !== 'image/png' &&
            acceptedFile[0]?.type.toLowerCase() !== 'image/jpg' &&
            acceptedFile[0]?.type.toLowerCase() !== 'image/jpeg'
        ) {
            toast.error('Invalid Format', {
                position: toast.POSITION.TOP_RIGHT,
            })
            return;
        }
        let params = {};
        if (gid) {
            params = {
                code: logoType,
                masterid: state.hotelMid,
                orsactive: true,
                hotelrefno: companyId,
                gid: gid,
            }
        } else {
            params = {
                code: logoType,
                masterid: state.hotelMid,
                orsactive: true,
                hotelrefno: companyId
            }
        }
        Upload({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            token: authToken,
            params: params,
            files: acceptedFile,
        }).then((r) => {
            if (r.status === 200 && r.data.data) {
                let url = r.data.data.url.replace('/var/otello', '').replace('/public', '');
                console.log(url);
                toast.success(UPLOAD_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT,
                })
                const gid = r.data.data.gid
                if (logoType.toLowerCase() === 'logo') {
                    setToState('pageBuilder', ['assets', 'images', 'logo'], gid)
                    updateState('pageBuilder', 'logoUrl', url)
                }
                if (logoType.toLowerCase() === 'altlogo') {
                    setToState('pageBuilder', ['assets', 'images', 'altLogo'], gid)
                    updateState('pageBuilder', 'altLogoUrl', url)
                }
                if (logoType.toLowerCase() === 'logo-banner') {
                    setToState('pageBuilder', ['assets', 'images', 'logoBanner'], gid)
                    updateState('pageBuilder', 'logoBanner', url)
                }
                if (logoType.toLowerCase() === 'background') {
                    setToState('pageBuilder', ['assets', 'images', 'background'], gid)
                    updateState('pageBuilder', 'backgroundUrl', url)
                }
                if (logoType.toLowerCase() === 'powered-by') {
                    setToState('pageBuilder', ['assets', 'images', 'poweredBy'], gid)
                    updateState('pageBuilder', 'poweredByUrl', url)
                }
                if (logoType.toLowerCase() === 'thumbnail') {
                    setToState('pageBuilder', ['assets', 'images', 'thumbnail'], gid)
                    updateState('pageBuilder', 'thumbnailUrl', url)
                }
            } else {
                const retErr = isErrorMsg(r)
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    //handle upload icons
    const onDropIcon = (icons, type, gid) => {
        if (
            icons[0]?.type.toLowerCase() !== 'image/png' &&
            icons[0]?.type.toLowerCase() !== 'image/jpg' &&
            icons[0]?.type.toLowerCase() !== 'image/jpeg'
        ) {
            toast.error('Invalid Format', {
                position: toast.POSITION.TOP_RIGHT,
            })
            return
        }
        let params = {};
        if (gid) {
            params = {
                code: type,
                masterid: state.hotelMid,
                orsactive: true,
                hotelrefno: companyId,
                gid: gid
            }
        } else {
            params = {
                code: type,
                masterid: state.hotelMid,
                orsactive: true,
                hotelrefno: companyId,
            }
        }
        Upload({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            token: authToken,
            params: params,
            files: icons,
        }).then((r) => {
            if (r.status === 200 && r.data.data) {
                const gid = r.data.data.gid
                let url = r.data.data.url.replace('/var/otello', '').replace('/public', '');
                if (type.toLowerCase() === 'favicon') {
                    setToState('pageBuilder', ['assets', 'images', 'favIcon'], gid)
                    updateState('pageBuilder', 'faviconUrl', url)
                }
                if (type.toLowerCase() === 'phone') {
                    setToState('pageBuilder', ['assets', 'icons', 'phone'], gid)
                    updateState('pageBuilder', 'phoneIconUrl', url)
                }
                if (type.toLowerCase() === 'email') {
                    setToState('pageBuilder', ['assets', 'icons', 'email'], gid)
                    updateState('pageBuilder', 'emailIconUrl', url)
                }
                if (type.toLowerCase() === 'facebook') {
                    setToState('pageBuilder', ['assets', 'icons', 'facebook'], gid)
                    updateState('pageBuilder', 'facebookIconUrl', url)
                }
                if (type.toLowerCase() === 'twitter') {
                    setToState('pageBuilder', ['assets', 'icons', 'twitter'], gid)
                    updateState('pageBuilder', 'twitterIconUrl', url)
                }
                if (type.toLowerCase() === 'instagram') {
                    setToState('pageBuilder', ['assets', 'icons', 'instagram'], gid)
                    updateState('pageBuilder', 'instagramIconUrl', url)
                }
                if (type.toLowerCase() === 'linkedin') {
                    setToState('pageBuilder', ['assets', 'icons', 'linkedin'], gid)
                    updateState('pageBuilder', 'linkedinIconUrl', url)
                }
                toast.success(UPLOAD_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            } else {
                const retErr = isErrorMsg(r)
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    const handleTitleChange = (event) => {
        setToState('pageBuilder', ['assets', 'meta', 'title'], event.target.value)
    }

    const handleUrlChange = (event) => {
        setToState('pageBuilder', ['assets', 'meta', 'ibeurl'], event.target.value)
    }

    const handleLanguageChange = (event) => {
        const lang = event.target.value
        setSelectedLanguage(lang)
        setToState('pageBuilder', ['assets', 'meta', 'lang'], lang.code.toLowerCase())
        updateState('pageBuilder', 'langId', lang?.id)
    }

    return (
        <Container>
            <Grid container spacing={3} justify="center">
                <Grid item xs={12}>
                    <Card variant={'outlined'} raised={true}>
                        <Grid container>
                            <Grid item xs={12}>
                                <Typography component={'span'} className={classes.infoText}>
                                    Only png, jpg, jpeg formats are allowed for all the pictures.
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container justify={'flex-start'}>
                            <Grid item xs={6}>
                                <h5 className={classes.heading}>Logo <span className={classes.asteric}> * </span> </h5>
                                {!state?.assets?.images?.logo ? (
                                    <Paper variant={'outlined'} className={classes.logoBlock}>
                                        <ReactDropzone onDrop={(e) => onDropLogo(e, 'LOGO')} acceptedFile>
                                            {({ getRootProps, getInputProps }) => (
                                                <section>
                                                    <div {...getRootProps()} style={{ width: 572, height: 360 }}>
                                                        <input {...getInputProps()} />
                                                        <CloudUploadIcon className={classes.icon} />
                                                    </div>
                                                </section>
                                            )}
                                        </ReactDropzone>
                                    </Paper>
                                ) : (
                                    <Paper variant={'outlined'} className={classes.previewBlock}>
                                        <ReactDropzone onDrop={(e) => onDropLogo(e, 'LOGO', state?.assets?.images?.logo)} acceptedFile>
                                            {({ getRootProps, getInputProps }) => (
                                                <section>
                                                    <div
                                                        {...getRootProps()}
                                                        style={{ cursor: 'pointer', width: 572, height: 360 }}
                                                    >
                                                        <input {...getInputProps()} />
                                                        <div
                                                            className={classes.previewStyle}
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.logoUrl
                                                                })`,
                                                                width: '100%',
                                                                height: '100%',
                                                            }}
                                                        ></div>
                                                    </div>
                                                </section>
                                            )}
                                        </ReactDropzone>
                                    </Paper>
                                )}
                            </Grid>
                            <Grid item xs={6}>
                                <h5 className={classes.heading}>Alternate Logo </h5>
                                {!state?.assets?.images?.altLogo ? (
                                    <Paper variant={'outlined'} className={classes.logoBlock}>
                                        <ReactDropzone onDrop={(e) => onDropLogo(e, 'ALTLOGO')} acceptedFile>
                                            {({ getRootProps, getInputProps }) => (
                                                <section>
                                                    <div {...getRootProps()} style={{ width: 572, height: 360 }}>
                                                        <input {...getInputProps()} />
                                                        <CloudUploadIcon className={classes.icon} />
                                                    </div>
                                                </section>
                                            )}
                                        </ReactDropzone>
                                    </Paper>
                                ) : (
                                    <Paper variant={'outlined'} className={classes.previewBlock}>
                                        <ReactDropzone onDrop={(e) => onDropLogo(e, 'ALTLOGO', state?.assets?.images?.altLogo)} acceptedFile>
                                            {({ getRootProps, getInputProps }) => (
                                                <section>
                                                    <div
                                                        {...getRootProps()}
                                                        style={{ cursor: 'pointer', width: 550, height: 360 }}
                                                    >
                                                        <input {...getInputProps()} />
                                                        <div
                                                            className={classes.previewStyle}
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.altLogoUrl
                                                                })`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </section>
                                            )}
                                        </ReactDropzone>
                                    </Paper>
                                )}
                            </Grid>
                        </Grid>
                        <Grid item container justify={'flex-start'}>
                            <Grid item xs={6}>
                                <h5 className={classes.heading}>Background</h5>
                                {!state?.assets?.images?.background ? (
                                    <Paper variant={'outlined'} className={classes.logoBlock}>
                                        <ReactDropzone onDrop={(e) => onDropLogo(e, 'BACKGROUND')} acceptedFile>
                                            {({ getRootProps, getInputProps }) => (
                                                <section>
                                                    <div {...getRootProps()} style={{ width: 572, height: 360 }}>
                                                        <input {...getInputProps()} />
                                                        <CloudUploadIcon className={classes.icon} />
                                                    </div>
                                                </section>
                                            )}
                                        </ReactDropzone>
                                    </Paper>
                                ) : (
                                    <Paper variant={'outlined'} className={classes.previewBlock}>
                                        <ReactDropzone onDrop={(e) => onDropLogo(e, 'BACKGROUND', state?.assets?.images?.background)} acceptedFile>
                                            {({ getRootProps, getInputProps }) => (
                                                <section>
                                                    <div
                                                        {...getRootProps()}
                                                        style={{ cursor: 'pointer', width: 550, height: 360 }}
                                                    >
                                                        <input {...getInputProps()} />
                                                        <div
                                                            className={classes.previewStyle}
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.backgroundUrl
                                                                })`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </section>
                                            )}
                                        </ReactDropzone>
                                    </Paper>
                                )}
                            </Grid>
                            <Grid item xs={6}>
                                <h5 className={classes.heading}> Logo Banner </h5>
                                {!state?.assets?.images?.logoBanner ? (
                                    <Paper variant={'outlined'} className={classes.logoBlock}>
                                        <ReactDropzone onDrop={(e) => onDropLogo(e, 'LOGO-BANNER')} acceptedFile>
                                            {({ getRootProps, getInputProps }) => (
                                                <section>
                                                    <div {...getRootProps()} style={{ width: 572, height: 360 }}>
                                                        <input {...getInputProps()} />
                                                        <CloudUploadIcon className={classes.icon} />
                                                    </div>
                                                </section>
                                            )}
                                        </ReactDropzone>
                                    </Paper>
                                ) : (
                                    <Paper variant={'outlined'} className={classes.previewBlock}>
                                        <ReactDropzone onDrop={(e) => onDropLogo(e, 'LOGO-BANNER', state?.assets?.images?.logoBanner)} acceptedFile>
                                            {({ getRootProps, getInputProps }) => (
                                                <section>
                                                    <div
                                                        {...getRootProps()}
                                                        style={{ cursor: 'pointer', width: 550, height: 360 }}
                                                    >
                                                        <input {...getInputProps()} />
                                                        <div
                                                            className={classes.previewStyle}
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.logoBanner
                                                                })`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </section>
                                            )}
                                        </ReactDropzone>
                                    </Paper>
                                )}
                            </Grid>
                        </Grid>
                        <Grid item container justify={'flex-start'}>
                            <Grid item xs={4}>
                                <Typography component={'h6'} variant={'h6'} className={classes.heading}>
                                    Powered By
                                </Typography>
                                <Paper
                                    variant={'outlined'}
                                    className={classes.favIcon}
                                    style={{ backgroundColor: state?.assets?.images?.poweredBy ? '#fff' : 'lightgray' }}
                                >
                                    <ReactDropzone onDrop={(e) => onDropLogo(e, 'POWERED-BY', state?.assets?.images?.poweredBy)} acceptedFile>
                                        {({ getRootProps, getInputProps }) => (
                                            <section>
                                                <div {...getRootProps()} style={{ width: 150, height: 100 }}>
                                                    <input {...getInputProps()} />
                                                    {state?.assets?.images?.poweredBy ? (
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.poweredByUrl
                                                                })`,
                                                                backgroundSize: 'contain',
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'center',
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor: '#fff',
                                                            }}
                                                        ></div>
                                                    ) : (
                                                        <CloudUploadIcon className={classes.icon} />
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                    </ReactDropzone>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography component={'h6'} variant={'h6'} className={classes.heading}>
                                    Favicon
                                </Typography>
                                <Paper
                                    variant={'outlined'}
                                    className={classes.favIcon}
                                    style={{ backgroundColor: state?.assets?.images?.favIcon ? '#fff' : 'lightgray' }}
                                >
                                    <ReactDropzone onDrop={(e) => onDropIcon(e, 'FAVICON', state?.assets?.images?.favIcon)} acceptedFile>
                                        {({ getRootProps, getInputProps }) => (
                                            <section>
                                                <div {...getRootProps()} style={{ width: 200, height: 100 }}>
                                                    <input {...getInputProps()} />
                                                    {state?.assets?.images?.favIcon ? (
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.faviconUrl
                                                                })`,
                                                                backgroundSize: 'contain',
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'center',
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor: '#fff',
                                                            }}
                                                        ></div>
                                                    ) : (
                                                        <CloudUploadIcon className={classes.icon} />
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                    </ReactDropzone>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography component={'h6'} variant={'h6'} className={classes.heading}>
                                    Thumbnail
                                </Typography>
                                <Paper
                                    variant={'outlined'}
                                    className={classes.favIcon}
                                    style={{ backgroundColor: state?.assets?.images?.thumbnail ? '#fff' : 'lightgray' }}
                                >
                                    <ReactDropzone onDrop={(e) => onDropLogo(e, 'THUMBNAIL', state?.assets?.images?.thumbnail)} acceptedFile>
                                        {({ getRootProps, getInputProps }) => (
                                            <section>
                                                <div {...getRootProps()} style={{ width: 200, height: 100 }}>
                                                    <input {...getInputProps()} />
                                                    {state?.assets?.images?.thumbnail ? (
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.thumbnailUrl
                                                                })`,
                                                                backgroundSize: 'contain',
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'center',
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor: '#fff',
                                                            }}
                                                        ></div>
                                                    ) : (
                                                        <CloudUploadIcon className={classes.icon} />
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                    </ReactDropzone>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
            <Grid container={true} spacing={3}>
                <Grid item xs={12}>
                    <Card variant={'outlined'}>
                        <Grid container justify={'flex-start'} spacing={1}>
                        <Grid item xs={4}>
                                <Typography component={'h6'} variant={'h6'} className={classes.heading}>
                                    Phone
                                </Typography>
                                <Paper
                                    variant={'outlined'}
                                    className={classes.favIcon}
                                    style={{ backgroundColor: state?.assets?.icons?.phone ? '#fff' : 'lightgray' }}
                                >
                                    <ReactDropzone onDrop={(e) => onDropIcon(e, 'PHONE', state?.assets?.icons?.phone)} acceptedFile>
                                        {({ getRootProps, getInputProps }) => (
                                            <section>
                                                <div {...getRootProps()} style={{ width: 150, height: 100 }}>
                                                    <input {...getInputProps()} />
                                                    {state?.assets?.icons?.phone ? (
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.phoneIconUrl
                                                                })`,
                                                                backgroundSize: 'contain',
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'center',
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor: '#fff',
                                                            }}
                                                        ></div>
                                                    ) : (
                                                        <CloudUploadIcon className={classes.icon} />
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                    </ReactDropzone>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography component={'h6'} variant={'h6'} className={classes.heading}>
                                    Email
                                </Typography>
                                <Paper
                                    variant={'outlined'}
                                    className={classes.favIcon}
                                    style={{ backgroundColor: state?.assets?.icons?.email ? '#fff' : 'lightgray' }}
                                >
                                    <ReactDropzone onDrop={(e) => onDropIcon(e, 'EMAIL', state?.assets?.icons?.email)} acceptedFile>
                                        {({ getRootProps, getInputProps }) => (
                                            <section>
                                                <div {...getRootProps()} style={{ width: 150, height: 100 }}>
                                                    <input {...getInputProps()} />
                                                    {state?.assets?.icons?.email ? (
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.emailIconUrl
                                                                })`,
                                                                backgroundSize: 'contain',
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'center',
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor: '#fff',
                                                            }}
                                                        ></div>
                                                    ) : (
                                                        <CloudUploadIcon className={classes.icon} />
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                    </ReactDropzone>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography component={'h6'} variant={'h6'} className={classes.heading}>
                                    Facebook
                                </Typography>
                                <Paper
                                    variant={'outlined'}
                                    className={classes.favIcon}
                                    style={{ backgroundColor: state?.assets?.icons?.facebook ? '#fff' : 'lightgray' }}
                                >
                                    <ReactDropzone onDrop={(e) => onDropIcon(e, 'FACEBOOK', state?.assets?.icons?.facebook)} acceptedFile>
                                        {({ getRootProps, getInputProps }) => (
                                            <section>
                                                <div {...getRootProps()} style={{ width: 150, height: 100 }}>
                                                    <input {...getInputProps()} />
                                                    {state?.assets?.icons?.facebook ? (
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.facebookIconUrl
                                                                })`,
                                                                backgroundSize: 'contain',
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'center',
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor: '#fff',
                                                            }}
                                                        ></div>
                                                    ) : (
                                                        <CloudUploadIcon className={classes.icon} />
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                    </ReactDropzone>
                                </Paper>
                            </Grid>
                        </Grid>
                        <Grid container justify={'flex-start'} spacing={1}>
                        <Grid item xs={4}>
                                <Typography component={'h6'} variant={'h6'} className={classes.heading}>
                                    Twitter
                                </Typography>
                                <Paper
                                    variant={'outlined'}
                                    className={classes.favIcon}
                                    style={{ backgroundColor: state?.assets?.icons?.twitter ? '#fff' : 'lightgray' }}
                                >
                                    <ReactDropzone onDrop={(e) => onDropIcon(e, 'TWITTER', state?.assets?.icons?.twitter)} acceptedFile>
                                        {({ getRootProps, getInputProps }) => (
                                            <section>
                                                <div {...getRootProps()} style={{ width: 150, height: 100 }}>
                                                    <input {...getInputProps()} />
                                                    {state?.assets?.icons?.twitter ? (
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.twitterIconUrl
                                                                })`,
                                                                backgroundSize: 'contain',
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'center',
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor: '#fff',
                                                            }}
                                                        ></div>
                                                    ) : (
                                                        <CloudUploadIcon className={classes.icon} />
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                    </ReactDropzone>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>  </Grid>
                            <Grid item xs={4}>
                                <Typography component={'h6'} variant={'h6'} className={classes.heading}>
                                    LinkedIn
                                </Typography>
                                <Paper
                                    variant={'outlined'}
                                    className={classes.favIcon}
                                    style={{ backgroundColor: state?.assets?.icons?.linkedin ? '#fff' : 'lightgray' }}
                                >
                                    <ReactDropzone onDrop={(e) => onDropIcon(e, 'LINKEDIN')} acceptedFile>
                                        {({ getRootProps, getInputProps }) => (
                                            <section>
                                                <div {...getRootProps()} style={{ width: 150, height: 100 }}>
                                                    <input {...getInputProps()} />
                                                    {state?.assets?.icons?.linkedin ? (
                                                        <div
                                                            style={{
                                                                backgroundImage: `url(${
                                                                    GENERAL_SETTINGS.STATIC_URL + state.linkedinIconUrl
                                                                })`,
                                                                backgroundSize: 'contain',
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'center',
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor: '#fff',
                                                            }}
                                                        ></div>
                                                    ) : (
                                                        <CloudUploadIcon className={classes.icon} />
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                    </ReactDropzone>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
            <Grid container={true} spacing={3}>
                <Grid item xs={12}>
                    <Card variant={'outlined'}>
                        <Grid container justify={'flex-start'} spacing={1}>
                            <Grid item xs={6}>
                                <Typography component={'span'} className={classes.heading}>
                                    Google Tag Manager
                                </Typography>
                                <Typography component={'div'}>
                                    <FormControl fullWidth={true}>
                                        <TextField
                                            className={classes.formControl}
                                            size={'small'}
                                            fullWidth={true}
                                            variant={'outlined'}
                                            value={state?.assets?.meta?.googleTag}
                                            onChange={(e) =>
                                                setToState(
                                                    'pageBuilder',
                                                    ['assets', 'meta', 'googleTag'],
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </FormControl>
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography component={'span'} className={classes.heading}>
                                    Google Analytic Tag
                                </Typography>
                                <Typography component={'div'}>
                                    <TextField
                                        size={'small'}
                                        fullWidth={true}
                                        className={classes.formControl}
                                        variant={'outlined'}
                                        value={state?.assets?.meta?.googleAnalyticsTag}
                                        onChange={(e) =>
                                            setToState(
                                                'pageBuilder',
                                                ['assets', 'meta', 'googleAnalyticsTag'],
                                                e.target.value
                                            )
                                        }
                                    />
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container justify={'flex-start'} spacing={1}>
                            <Grid item xs={6}>
                                <Typography component={'span'} className={classes.heading}>
                                    Chat Box
                                </Typography>
                                <TextareaAutosize
                                    rows={5}
                                    rowsMax={5}
                                    value={state?.assets?.meta?.chatBox}
                                    className={classes.textArea}
                                    onChange={(e) =>
                                        setToState(
                                            'pageBuilder',
                                            ['assets', 'meta', 'chatBox'],
                                            e.target.value
                                        )
                                    }
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography component={'div'}>
                                    <Typography component={'span'} className={classes.heading}>
                                        IBE URL
                                    </Typography>
                                    <Typography component={'div'}>
                                        <FormControl fullWidth={true} style={{display: 'flex', justifyContent: 'center'}}>
                                            <TextField
                                                placeholder={'Enter URL here ..'}
                                                variant={'outlined'}
                                                className={classes.formControl}
                                                value={state?.assets?.meta?.ibeurl}
                                                onChange={handleUrlChange}
                                                size={'small'}
                                                error={
                                                    state?.assets?.meta?.ibeurl
                                                        ? validator.isURL(state?.assets?.meta?.ibeurl) === false
                                                        ? true
                                                        : false
                                                        : false
                                                }
                                            ></TextField>
                                        </FormControl>
                                    </Typography>
                                </Typography>
                                <Typography component={'div'}>
                                    <Typography component={'span'} className={classes.heading} style={{marginTop: 16}}>
                                        Facebook Verification Code
                                    </Typography>
                                    <Typography component={'div'}>
                                        <FormControl fullWidth={true} style={{display: 'flex', justifyContent: 'center'}}>
                                            <TextField
                                                placeholder={'Enter code here ..'}
                                                variant={'outlined'}
                                                className={classes.formControl}
                                                value={state?.assets?.meta?.fbVerificationCode}
                                                onChange={(e) => setToState('pageBuilder', ['assets', 'meta', 'fbVerificationCode'], e.target.value)}
                                                size={'small'}
                                            ></TextField>
                                        </FormControl>
                                    </Typography>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
            <Grid container={true} spacing={1}>
                <Grid item xs={12}>
                    <Card variant={'outlined'}>
                        <Grid container justify={'flex-start'} alignItems={'center'} spacing={1}>
                            <Grid item xs={6}>
                                <Typography component={'span'} className={classes.heading}>
                                    Image Quality
                                </Typography>
                                <Typography component={'div'}>
                                    <PercentageSlider
                                        marks={PERCENTAGE_VALUES}
                                        value={quality}
                                        onChange={(e, value) => {
                                            if (value >= 10 && value <= 100 && value % 10 === 0) {
                                                setToState(
                                                    'pageBuilder',
                                                    ['assets', 'meta', 'imageQuality'],
                                                    value / 100
                                                )
                                                setQuality(value)
                                            }
                                        }}
                                    />
                                </Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography component={'span'} className={classes.heading}>
                                    Language
                                </Typography>
                                <Typography component={'div'}>
                                    <FormControl
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth
                                        className={classes.formControl}
                                    >
                                        <Select
                                            style={{ marginLeft: 4 }}
                                            value={selectedLanguage}
                                            onChange={handleLanguageChange}
                                            label="Language"
                                        >
                                            {languages.map((lang, index) => {
                                                return (
                                                    <MenuItem value={lang} key={index}>
                                                        {' '}
                                                        {lang.description}{' '}
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </FormControl>
                                </Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography component={'span'} className={classes.heading}>
                                    Title <span className={classes.asteric}> * </span>
                                </Typography>
                                <Typography component={'div'}>
                                    <TextField
                                        placeholder={'Enter your Title here ...'}
                                        variant={'outlined'}
                                        value={state?.assets?.meta?.title}
                                        onChange={handleTitleChange}
                                        size={'small'}
                                        fullWidth
                                        style={{ paddingRight: 4 }}
                                    ></TextField>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Asset)
