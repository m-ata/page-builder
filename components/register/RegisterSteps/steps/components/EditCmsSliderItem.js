import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from '../../../../../state/actions'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { RaTagItemDelete } from '../../../../../model/orest/components/RaTag'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import useNotifications from 'model/notification/useNotifications'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import AddIcon from '@material-ui/icons/Add'
import Fab from '@material-ui/core/Fab'
import TagsIcon from '@material-ui/icons/LocalOffer'
import Badge from '@material-ui/core/Badge'
import { isErrorMsg, OREST_ENDPOINT } from 'model/orest/constants'
import { Insert, Patch, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { withStyles } from '@material-ui/core/styles'

const StyledBadge = withStyles((theme) => ({
    badge: {
        fontSize: 12,
        right: -3,
        top: 13,
        border: `2px solid ${theme.palette.background.paper}`,
        padding: '0 4px',
    },
}))(Badge)

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: '100%',
        maxHeight: '365px',
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}))

const EditCmsSliderItem = (props) => {
    const cls = useStyles()
    const { setToState, state, sliderIndex, slideIndex } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [caption, setCaption] = useState(state.cmsSlider[sliderIndex].sliders[slideIndex].caption)
    const [description, setDescription] = useState(state.cmsSlider[sliderIndex].sliders[slideIndex].description)
    const [tagList, setTagList] = useState([])
    const [newTag, setNewTag] = useState('')
    const { t } = useTranslation()
    const [open, setOpen] = React.useState(false)
    const { showSuccess, showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    if (open == false && caption !== state.cmsSlider[sliderIndex].sliders[slideIndex].caption) {
        setCaption(state.cmsSlider[sliderIndex].sliders[slideIndex].caption)
        setDescription(state.cmsSlider[sliderIndex].sliders[slideIndex].description)

        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RATAG,
            token: token,
            params: {
                query: 'masterid:' + state.cmsSlider[sliderIndex].sliders[slideIndex].mid,
                hotelrefno: companyId,
            },
        }).then((res1) => {
            if (res1.status === 200) {
                const retData = res1.data.data
                if (retData.length > 0) {
                    setTagList(retData)
                }
            } else {
                const retErr = isErrorMsg(res1)
                showError(retErr.errorMsg)
            }
        })
    }

    useEffect(() => {
        let active = true
        if (active) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RATAG,
                token: token,
                params: {
                    query: 'masterid:' + state.cmsSlider[sliderIndex].sliders[slideIndex].mid,
                    hotelrefno: companyId,
                },
            }).then((res1) => {
                if (active) {
                    if (res1.status === 200) {
                        const retData = res1.data.data
                        if (retData.length > 0) {
                            setTagList(retData)
                        }
                    } else {
                        const retErr = isErrorMsg(res1)
                        showError(retErr.errorMsg)
                    }
                }
            })
        }
        return () => {
            active = false
        }
    }, [])

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleCaptionChange = (e) => {
        if (description === '' || description === caption) {
            setDescription(e.target.value.toUpperCase())
        }
        setCaption(e.target.value.toUpperCase())
    }

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value)
    }

    const handleTagSave = () => {
        const tag = newTag
        if (tag !== '') {
            const mid = state.cmsSlider[sliderIndex].sliders[slideIndex].mid
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RATAG,
                token: token,
                data: {
                    mid,
                    tag,
                    hotelrefno: Number(companyId),
                },
            }).then((r) => {
                if (r.status === 200) {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RATAG,
                        token: token,
                        params: {
                            query: 'masterid:' + mid,
                            hotelrefno: companyId,
                        },
                    }).then((res1) => {
                        if (res1.status === 200) {
                            const retData = res1.data.data

                            if (retData.length > 0) {
                                setTagList(retData)
                            }

                            showSuccess('Tag was save!')
                            setNewTag('')
                        } else {
                            const retErr = isErrorMsg(res1)
                            showError(retErr.errorMsg)
                        }
                    })
                } else {
                    const retErr = isErrorMsg(r)
                    showError(retErr.errorMsg)
                }
            })
        } else {
            showError('To add tags, do not leave the tag input empty.')
        }
    }

    const handleTagDelete = (e) => {
        RaTagItemDelete(GENERAL_SETTINGS.OREST_URL, token, companyId, e).then((r) => {
            if (r.status === 200) {
                const mid = state.cmsSlider[sliderIndex].sliders[slideIndex].mid
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RATAG,
                    token: token,
                    params: {
                        query: 'masterid:' + mid,
                        hotelrefno: companyId,
                    },
                }).then((res1) => {
                    if (res1.status === 200) {
                        const retData = res1.data.data

                        if (retData.length > 0) {
                            setTagList(retData)
                        } else {
                            setTagList([])
                        }
                        showSuccess('Tag was deleted!')
                    } else {
                        const retErr = isErrorMsg(res1)
                        showError(retErr.errorMsg)
                    }
                })
            } else {
                const retErr = isErrorMsg(r)
                showError(retErr.errorMsg)
            }
        })
    }

    const handleSave = () => {
        const gid = state.cmsSlider[sliderIndex].sliders[slideIndex].gid
        if (caption === '') {
            showError('Caption field cannot be empty!')
        } else if (description === '') {
            showError('Description field cannot be empty!')
        } else {
            const checkCaption = state.cmsSlider[sliderIndex].sliders.filter((x) => x.caption === caption).length
            if (checkCaption !== 1 || caption === state.cmsSlider[sliderIndex].sliders[slideIndex].caption) {
                Patch({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.CMSSLIDERITEM,
                    token: token,
                    gid: gid,
                    params: {
                        hotelrefno: Number(companyId),
                    },
                    data: {
                        caption,
                        description,
                    },
                }).then((r1) => {
                    if (r1.status === 200) {
                        setToState(
                            'registerStepper',
                            ['cmsSlider', String(sliderIndex), 'sliders', String(slideIndex), 'caption'],
                            r1.data.data.caption
                        )
                        setToState(
                            'registerStepper',
                            ['cmsSlider', String(sliderIndex), 'sliders', String(slideIndex), 'description'],
                            r1.data.data.description
                        )
                        handleClose()
                        showSuccess('Category item has been updated!')
                    } else {
                        const retErr = isErrorMsg(r1)
                        showError(retErr.errorMsg)
                    }
                })
            } else {
                showError('The caption field must be unique!')
            }
        }
    }

    const handleTagChange = (e) => {
        const value = e.currentTarget.value
        setNewTag(value)
    }

    return (
        <React.Fragment>
            <Tooltip title="Edit Tags" style={{ marginLeft: 3, marginRight: 12 }}>
                <IconButton size={'small'} onClick={handleClickOpen}>
                    <Badge badgeContent={4} color="secondary">
                        <TagsIcon fontSize={'small'} />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Tooltip title="Edit Category Item" style={{ marginRight: 3 }}>
                <IconButton size={'small'} onClick={handleClickOpen}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_editCategoryItem')}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="caption"
                        label="Caption"
                        type="text"
                        fullWidth
                        value={caption || ''}
                        onChange={handleCaptionChange}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        value={description || ''}
                        onChange={handleDescriptionChange}
                    />

                    <Grid container spacing={1} style={{ marginTop: 3, marginBottom: 3 }} alignItems="flex-end">
                        <Grid item>
                            <TextField onChange={handleTagChange} value={newTag} label="Add Tag" />
                        </Grid>
                        <Grid item>
                            <Fab color="primary" size={'small'} aria-label="add">
                                <AddIcon onClick={handleTagSave} fontSize={'small'} />
                            </Fab>
                        </Grid>
                    </Grid>

                    {tagList &&
                        tagList.map((tag, tagInd) => (
                            <Chip
                                key={tagInd}
                                variant="outlined"
                                size="small"
                                style={{ marginLeft: 3 }}
                                label={tag.tagstr}
                                onDelete={() => handleTagDelete(tag.gid)}
                            />
                        ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t('str_cancel')}
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        {t('str_save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

EditCmsSliderItem.propTypes = {
    sliderIndex: PropTypes.number,
    slideIndex: PropTypes.number,
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

export default connect(mapStateToProps, mapDispatchToProps)(EditCmsSliderItem)
