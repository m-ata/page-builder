import React, { useContext } from 'react'
import {setToState, updateState} from "../../../../../../state/actions";
import {connect} from "react-redux";
import {Grid, FormControlLabel, Radio, RadioGroup} from '@material-ui/core'
import WebCmsGlobal from "../../../../../webcms-global";
import {useSnackbar} from "notistack";
import useTranslation from "../../../../../../lib/translations/hooks/useTranslation";
import LoadingSpinner from "../../../../../LoadingSpinner";
import {makeStyles} from "@material-ui/core/styles";
import Fieldset from "../../../../../../@webcms-ui/core/fieldset";
import Legend from "../../../../../../@webcms-ui/core/legend";

const useStyles = makeStyles((theme) => ({
    dialogSubTitle: {
        fontSize: '18px',
        fontWeight: '600'
    },
    fieldSetStyle: {
        border: `1px solid rgba(0, 0, 0, 0.23)`,
        padding: '8px 14px',
        borderRadius: '4px'
    },
    legendStyle: {
        padding: '0 4px',
        marginLeft: '4px',
        marginBottom: '0',
        fontSize: '14px',
        width: 'unset'
    }
}))


function RequestTypeSelection(props){
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()
    const { t } = useTranslation()

    const classes = useStyles()

    const { state, setToState, isTsTypeLoading} = props


    return(
        <Grid container>
            <Grid item xs={12} >
                {
                    isTsTypeLoading ? (
                        <LoadingSpinner size={64}/>
                    ) : (
                        <React.Fragment>
                            <Fieldset>
                                <Legend>{t('str_requestType') + '*'}</Legend>
                                <RadioGroup
                                    aria-label="req-types"
                                    name="req-types"
                                    value={state.requestData?.tstypeid?.value || ''}
                                    onChange={(e) => {
                                        const data = {...state.requestData}
                                        data['tstypeid'].value = e.target.value
                                        setToState(
                                            'guest',
                                            ['myRequest', 'requestData'],
                                            {
                                                ...state.requestData,
                                                ['tstypeid']: {
                                                    ...state.requestData['tstypeid'],
                                                    value: Number(e.target.value)
                                                }
                                            }
                                        )
                                    }}
                                >
                                    {
                                        state.requestTypeList.length > 0 && state.requestTypeList.map((item) => (
                                            <FormControlLabel
                                                value={item.id}
                                                control={<Radio color={'primary'} disabled={!state.requestData || state.isSaving} required/>}
                                                label={item.description}
                                            />
                                        ))
                                    }
                                </RadioGroup>
                            </Fieldset>
                        </React.Fragment>

                    )
                }
            </Grid>
        </Grid>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest.myRequest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RequestTypeSelection)