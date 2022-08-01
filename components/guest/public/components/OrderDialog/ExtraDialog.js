import React, { useEffect, useState, useContext } from 'react'; 
import { UseOrest } from '@webcms/orest'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from '../../../../../lib/translations/hooks/useTranslation';
import { setToState, updateState } from '../../../../../state/actions'
import { Button, Dialog, DialogContent, IconButton, Grid, TextField, Typography } from '@material-ui/core';
import { connect, useSelector } from 'react-redux'
import { REQUEST_METHOD_CONST } from '../../../../../model/orest/constants';
import WebCmsGlobal from '../../../../webcms-global';
import ClearIcon from "@material-ui/icons/Clear";
import CheckIcon from "@material-ui/icons/Check"
import InfoIcon from '@material-ui/icons/Info';
import LoadingSpinner from '../../../../LoadingSpinner';

const useStyles = makeStyles((theme) => ({
    buttonRoot: {
        whiteSpace: 'nowrap'
    }
    
}))

function ExtraDialog(props) {
    const classes = useStyles();

    const {state, setToState, open, onClose, product } = props;

    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const baseUrl = GENERAL_SETTINGS.BASE_URL[GENERAL_SETTINGS.BASE_URL.length - 1] === '/' ? GENERAL_SETTINGS.BASE_URL.substring(0, GENERAL_SETTINGS.BASE_URL.length - 1) : GENERAL_SETTINGS.BASE_URL

    const [propList, setPropList] = useState([])
    const [selectedProp, setSelectedProp] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const selectedProductIndex = state.selectGuestProductList.findIndex(e => e.productcodeid === product.id)

    useEffect(() => {
        if(product) {
            setIsLoading(true)
            UseOrest({
                apiUrl: baseUrl,
                method: REQUEST_METHOD_CONST.POST,
                endpoint: 'api/hotel/sprops/view/list',
                params: {
                    productcodeid: product?.id
                },
            }).then(res => {
                if(res.data.success) {
                    setPropList(res.data.data)
                }
                setIsLoading(false)
            })
        }        
    }, [product])

    const handleSelectProps = (productProp) => {
        const propList = { ...state.selectGuestProductPropList }
        const checkIndex = selectedProp.findIndex(e => e.propcodeid === productProp?.propcodeid) 
        const oldSelectPropList = [...selectedProp]
        if (checkIndex === -1) {   
            const array = propList[product.id] || []
            array.push(productProp)
            oldSelectPropList.push(productProp)
            const data = {
                ...state.selectGuestProductPropList,
                [product?.id]: array
            }
            setSelectedProp(oldSelectPropList)
            setToState('guest', ['selectGuestProductPropList'], data)
        } else {  
            propList[product.id].splice(checkIndex, 1)                      
            selectedProp.splice(checkIndex, 1)
            setToState('guest', ['selectGuestProductPropList'], propList)
        }    
    }

    const handleSave = () => {
        typeof onClose === 'function' && onClose();
    }

    const handleChangeNote = (e) => {
        const listData = [...state.selectGuestProductList]
        listData[selectedProductIndex].refcode = e.target.value
        setToState('guest', ['selectGuestProductList'], listData)
    }

    
    
    return(
        <Dialog
            open={open}
            fullWidth
            maxWidth={'sm'}
        >
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12}>                       
                        <Typography style={{ display: 'flex', alignItems: 'center'}}>
                            <InfoIcon color={'primary'} style={{paddingRight: '8px'}}/> {t('str_extras')}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            value={state.selectGuestProductList[selectedProductIndex]?.refcode || ''}
                            fullWidth
                            multiline
                            rows={4}
                            rowsMax={4}
                            variant={'outlined'}
                            label={t('str_note')}
                            onChange={(e) => handleChangeNote(e)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            { isLoading ? (
                                <div style={{textAlign:'center', width: '100%'}}>
                                    <LoadingSpinner size={30} />
                                </div>                               
                            ) : propList.length > 0 && propList.map((item) => (
                                <Grid item xs>
                                    <Button
                                        className={classes.buttonRoot}
                                        color={selectedProp.findIndex(e => e.propcodeid === item?.propcodeid) !== -1 ? 'primary' : 'default'}
                                        startIcon={selectedProp.findIndex(e => e.propcodeid === item?.propcodeid) !== -1 ? <CheckIcon /> : null}
                                        fullWidth
                                        variant={'outlined'}
                                        onClick={() => handleSelectProps(item)}
                                    >
                                        {item?.propcode}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} style={{textAlign: 'right'}}>
                        <Button
                            variant={'outlined'}
                            startIcon={<ClearIcon />}
                            color={"primary"}
                            onClick={() => typeof onClose === 'function' && onClose()}
                        >
                            {t('str_cancel')}
                        </Button>
                        <Button
                            style={{ marginLeft: '8px' }}
                            color={'primary'}
                            variant={'contained'}
                            startIcon={<CheckIcon />}
                            onClick={() => handleSave()}
                        >
                            {t('str_save')}
                        </Button>                                            
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value))
})

export default connect(mapStateToProps, mapDispatchToProps)(ExtraDialog)