import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from '../../../../../state/actions'
import { connect } from 'react-redux'
import Fab from '@material-ui/core/Fab'
import 'regenerator-runtime/runtime'
import { DropzoneDialog } from 'material-ui-dropzone'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import { CmsSliderItemFullIns } from '../../../../../model/orest/components/CmsSliderItem'
import useNotifications from '../../../../../model/notification/useNotifications'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../model/orest/constants'
import { ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from '../../../../../lib/translations/hooks/useTranslation'

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

const NewCmsSliderItem = (props) => {
    const cls = useStyles()
    const { t } = useTranslation()
    const { setToState, updateState, sliderIndex, sliderID } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [stateDialog, setStateDialog] = useState(false)
    const { showSuccess, showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const openDialog = () => {
        setStateDialog(true)
    }

    const closeDialog = () => {
        setStateDialog(false)
    }

    const saveDialog = (files) => {
        updateState('registerStepper', 'backDropStatus', true)
        let proc = 0
        files.forEach(function (element, index) {
            CmsSliderItemFullIns(GENERAL_SETTINGS.OREST_URL, token, sliderID, element, companyId).then((r) => {
                proc++
                if (proc === files.length) {
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.CMSSLIDERITEM,
                        token: token,
                        params: {
                            query: 'sliderid:' + sliderID,
                            hotelrefno: companyId,
                        },
                    }).then((res) => {
                        if (res.status === 200) {
                            setToState('registerStepper', ['cmsSlider', String(sliderIndex), 'sliders'], res.data.data)
                            showSuccess('Slide items added!')
                            closeDialog()
                            updateState('registerStepper', 'backDropStatus', false)
                        } else {
                            const retErr = isErrorMsg(res)
                            showError(retErr.errorMsg)
                            updateState('registerStepper', 'backDropStatus', false)
                        }
                    })
                }
            })
        })
    }

    return (
        <React.Fragment>
            <Fab
                variant="extended"
                size="small"
                onClick={openDialog}
                color="primary"
                style={{ marginLeft: 10, marginTop: -2 }}
            >
                <CloudUploadIcon className={cls.extendedIcon} />
                {t('str_upload')}
            </Fab>
            <DropzoneDialog
                open={stateDialog}
                onSave={saveDialog}
                acceptedFiles={['image/jpeg', 'image/png', 'image/bmp']}
                showPreviews={true}
                maxFileSize={5000000}
                onClose={closeDialog}
                filesLimit={10}
            />
        </React.Fragment>
    )
}

NewCmsSliderItem.propTypes = {
    sliderIndex: PropTypes.number,
    sliderID: PropTypes.number,
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

export default connect(mapStateToProps, mapDispatchToProps)(NewCmsSliderItem)
