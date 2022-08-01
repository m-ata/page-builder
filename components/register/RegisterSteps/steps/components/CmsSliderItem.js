import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { CmsSliderItemDelete } from '../../../../../model/orest/components/CmsSliderItem'
import { pushToState, setToState, updateState } from '../../../../../state/actions'
import { connect } from 'react-redux'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import DeleteIcon from '@material-ui/icons/Delete'
import IconButton from '@material-ui/core/IconButton'
import useNotifications from '../../../../../model/notification/useNotifications'
import Image from 'next/image'
import EditCmsSliderItem from './EditCmsSliderItem'
import Tooltip from '@material-ui/core/Tooltip'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../model/orest/constants'
import { ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: '100%',
        maxHeight: '365px',
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

const CmsSliderItem = (props) => {
    const classes = useStyles()
    const { setToState, slideId, state, imageUrl, imageGid, sliderId, sliderIndex, orderNo } = props
    const cls = useStyles()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [orderValue, setOrderValue] = useState(orderNo)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isCmsSliderItemHover, setIsCmsSliderItemHover] = useState(false)
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { showSuccess, showError } = useNotifications()

    const handleDeleteCmsSlideItem = (e) => {
        e.stopPropagation()
        setIsDeleting(true)
        CmsSliderItemDelete(GENERAL_SETTINGS.OREST_URL, token, companyId, imageGid).then((r) => {
            if (r.status === 200) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.CMSSLIDERITEM,
                    token: token,
                    params: {
                        query: 'sliderid:' + sliderId,
                        hotelrefno: companyId,
                    },
                }).then((res2) => {
                    if (res2.status === 200) {
                        setIsDeleting(false)
                        setToState('registerStepper', ['cmsSlider', String(sliderIndex), 'sliders'], res2.data.data)
                        showSuccess('Item deleted!')
                    } else {
                        const retErr = isErrorMsg(res2)
                        showError(retErr.errorMsg)
                    }
                })
            } else {
                setIsDeleting(false)
                const retErr = isErrorMsg(r)
                showError(retErr.errorMsg)
            }
        })
    }

    const slideIndex = state.cmsSlider[sliderIndex].sliders.findIndex((data) => data.id === slideId)

    return (
        <Card
            className={classes.card}
            onMouseEnter={() => {
                setIsCmsSliderItemHover(true)
            }}
            onMouseLeave={() => {
                setIsCmsSliderItemHover(false)
            }}
        >
            <Image
                src={imageUrl}
                layout="responsive"
                width={700}
                height={475}
            />
            <CardActions disableSpacing style={{ padding: 5 }}>
                {isCmsSliderItemHover && <EditCmsSliderItem sliderIndex={sliderIndex} slideIndex={slideIndex} />}
                {isCmsSliderItemHover && (
                    <Tooltip title="Delete Category Item">
                        <IconButton
                            style={{ marginLeft: 5 }}
                            size="small"
                            disabled={isDeleting}
                            onClick={handleDeleteCmsSlideItem}
                        >
                            <DeleteIcon fontSize={'small'} />
                        </IconButton>
                    </Tooltip>
                )}

                <div style={{ marginLeft: 'auto', paddingRight: 5 }}>
                    <span style={{ fontSize: 16, paddingTop: 3 }}>#{slideIndex}</span>
                </div>
            </CardActions>
        </Card>
    )
}
CmsSliderItem.propTypes = {
    imageURL: PropTypes.string,
    slideId: PropTypes.number,
    imageGid: PropTypes.string,
    sliderId: PropTypes.number,
    sliderIndex: PropTypes.number,
    orderNo: PropTypes.number,
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

export default connect(mapStateToProps, mapDispatchToProps)(CmsSliderItem)
