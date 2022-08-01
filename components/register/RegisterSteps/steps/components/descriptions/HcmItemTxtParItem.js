import React, { useContext, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import useNotifications from '../../../../../../model/notification/useNotifications'
import { Delete, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import Box from '@material-ui/core/Box'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../../model/orest/constants'
import EditHcmItemTxtPar from './EditHcmItemTxtPar'

const useStyles = makeStyles({
    root: {
        minWidth: 275,
        maxHeight: 300,
        height: '100%',
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
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
        "&:hover div[class*='isToolbar']": {
            display: 'block',
        },
    },
    isToolbar: {
        display: 'none',
    },
})

const HcmItemTxtParItem = (props) => {
    const cls = useStyles()
    const {
        state,
        setToState,
        categoryDescription,
        sectionDescription,
        title,
        itemText,
        itemGid,
        groupIndex,
        itemIndex,
    } = props
    const classes = useStyles()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [isDeleting, setIsDeleting] = useState(false)
    const [isToolbarHover, setIsToolbarHover] = useState(false)
    const { showSuccess, showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const handleDeleteItem = () => {
        setIsDeleting(true)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
            token: token,
            gid: itemGid,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                    token: token,
                    params: {
                        query: `itemid:${state.hcmItemTxt[groupIndex].id}`,
                        sort: 'seccode',
                        hotelrefno: Number(companyId),
                    },
                }).then((r) => {
                    if (r.status === 200) {
                        setIsDeleting(false)
                        if (state.hcmItemTxt[groupIndex].hcmItemTxtPar) {
                            setToState(
                                'registerStepper',
                                ['hcmItemTxt', state.descriptionTabIndex, 'hcmItemTxtPar'],
                                r.data.data
                            )
                        }
                    } else {
                        const retErr = isErrorMsg(r)
                        showError(retErr.errorMsg)
                        setIsDeleting(false)
                    }
                })

                showSuccess('Chosen item deleted!')
            } else {
                const retErr = isErrorMsg(res)
                showError(retErr.errorMsg)
                setIsDeleting(false)
            }
        })
    }

    return (
        <React.Fragment>
            <Grid
                container
                style={{
                    border: '1px solid #dadde9',
                    marginBottom: '10px',
                    padding: 10,
                    paddingBottom: 12,
                    borderRadius: 5,
                    boxShadow: '0 1px 0px rgba(0,0,0,0.10), 0 1px 1px rgba(0,0,0,0.20)',
                }}
                className={cls.editBoxWrapper}
            >
                <Grid item xs={12}>
                    <Grid container spacing={0}>
                        <Grid item md={4} xs={12}>
                            <Typography variant="subtitle1" color="textSecondary">
                                {sectionDescription}
                            </Typography>
                        </Grid>
                        <Grid item style={{ marginLeft: 'auto', marginRight: 5 }}>
                            <Box className={cls.isToolbar}>
                                <EditHcmItemTxtPar groupIndex={groupIndex} itemIndex={itemIndex} />
                                <IconButton disabled={isDeleting} size="small" onClick={() => handleDeleteItem()}>
                                    <DeleteIcon fontSize={'small'} />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={3} alignItems={'flex-end'}>
                        <Grid item xs={12} style={{ paddingTop: 5 }}>
                            <Typography variant="h6">{title}</Typography>
                            <Typography variant="subtitle2" color="textSecondary">
                                {categoryDescription}
                            </Typography>
                            <Typography variant="body1" noWrap={true} style={{ paddingTop: 5 }}>
                                <div dangerouslySetInnerHTML={{__html: itemText}}/>
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
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

export default connect(mapStateToProps, mapDispatchToProps)(HcmItemTxtParItem)
