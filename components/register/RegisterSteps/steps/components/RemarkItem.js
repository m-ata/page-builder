import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from '../../../../../state/actions'
import { RemarkItemDelete, RemarkItemStatusUpdate } from '../../../../../model/orest/components/Remark'
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import DeleteIcon from '@material-ui/icons/Delete'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Tooltip from '@material-ui/core/Tooltip'
import EditRemark from './EditRemark'
import IconButton from '@material-ui/core/IconButton'
import useNotifications from '../../../../../model/notification/useNotifications'
import Paper from '@material-ui/core/Paper'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../model/orest/constants'
import { ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import { withStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: '100%',
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    card: {
        maxWidth: 345,
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
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
    itemDesc: {
        width: '100%',
        maxWidth: '210px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    remarkItem: {
        paddingLeft: 10,
        paddingRight: 10,
        //backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}))

const LightTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}))(Tooltip)

const RemarkItem = (props) => {
    const cls = useStyles()
    const { setToState, itemID, remarkGrp, grpIndex, itemStatus, itemDescription, itemIndex } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [isDeleting, setIsDeleting] = useState(false)
    const { showSuccess, showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const handleRemarkCheck = (event, newValue) => {
        RemarkItemStatusUpdate(GENERAL_SETTINGS.OREST_URL, token, companyId, itemID, newValue).then((res1) => {
            if (res1.status === 200) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.REMARK,
                    token: token,
                    params: {
                        query: `remarkgrid:${remarkGrp}`,
                        hotelrefno: companyId,
                    },
                }).then((res2) => {
                    if (res2.status === 200) {
                        setToState('registerStepper', ['remarkGr', String(grpIndex), 'remarks'], res2.data.data)
                    } else {
                        const retErr = isErrorMsg(res2)
                        showError(retErr.errorMsg)
                    }
                })
                showSuccess('Chosen item status updated!')
            } else {
                const retErr = isErrorMsg(res1)
                showError(retErr.errorMsg)
            }
        })
    }

    const handleDeleteRemarkItem = () => {
        setIsDeleting(true)
        RemarkItemDelete(GENERAL_SETTINGS.OREST_URL, token, companyId, itemID).then((r) => {
            if (r.status === 200) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.REMARK,
                    token: token,
                    params: {
                        query: `remarkgrid:${remarkGrp}`,
                        hotelrefno: companyId,
                    },
                }).then((res2) => {
                    if (res2.status === 200) {
                        setIsDeleting(false)
                        setToState('registerStepper', ['remarkGr', String(grpIndex), 'remarks'], res2.data.data)
                    } else {
                        setIsDeleting(false)
                        const retErr = isErrorMsg(res2)
                        showError(retErr.errorMsg)
                    }
                })
                showSuccess('Chosen item deleted!')
            } else {
                setIsDeleting(false)
                const retErr = isErrorMsg(r)
                showError(retErr.errorMsg)
            }
        })
    }

    return (
        <Grid item xs={6} style={{ padding: 5 }}>
            <Paper className={cls.remarkItem} elevation={0}>
                <Typography component="div">
                    <Grid component="label" container alignItems="center">
                        <Grid item>
                            <FormControlLabel
                                control={<Switch size="medium" checked={itemStatus} onChange={handleRemarkCheck} />}
                                label={
                                    <LightTooltip title={itemDescription}>
                                        <Typography variant="subtitle1" className={cls.itemDesc}>
                                            {itemDescription}
                                        </Typography>
                                    </LightTooltip>
                                }
                            />
                        </Grid>
                        <Grid item style={{ marginLeft: 'auto' }}>
                            <EditRemark grIndex={grpIndex} grID={remarkGrp} itemIndex={itemIndex} />
                            <Tooltip title="Delete Item">
                                <IconButton size={'small'} disabled={isDeleting} onClick={handleDeleteRemarkItem}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Typography>
            </Paper>
        </Grid>
    )
}

RemarkItem.propTypes = {
    itemID: PropTypes.number,
    remarkGrp: PropTypes.number,
    grpIndex: PropTypes.number,
    itemStatus: PropTypes.number,
    itemDescription: PropTypes.string,
    itemIndex: PropTypes.number,
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

export default connect(mapStateToProps, mapDispatchToProps)(RemarkItem)
