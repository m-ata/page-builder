import React, { useContext, useEffect, useState } from 'react'
import {
    TextField
} from '@material-ui/core'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { useSelector } from 'react-redux'
import Checkbox from '@material-ui/core/Checkbox'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import utfTransliteration from '@webcms-globals/utf-transliteration'

const RemarkCheckbox = (props) => {
    const { state, remark, isDisabled, setToState } = props
        , { t } = useTranslation()
        , { transliteration } = utfTransliteration()

    //redux
    const clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , selectedRemarkList = useSelector((state) => state?.orest?.state?.selectedRemarkList || false);

    //state
    const [isLoading, setIsLoading] = useState(false)
        , [isChecked, setIsChecked] = useState(false)

    useEffect(() => {
        let active = true
        if (active) {
            if (isLoading) {
                return undefined
            }

            setIsLoading(true)
            if (remark) {
                if (clientBase) {
                    if(selectedRemarkList) {
                        const checkExistRemark = selectedRemarkList.find(e => e.remarkid === remark.id)
                        if(checkExistRemark) {
                            const data = {
                                [remark.id]: remark.hasnote ? {
                                    canBeDelete: checkExistRemark.gid,
                                    canBeInsert: true,
                                    note: checkExistRemark.note,
                                    isUpdateNote: false
                                } : {
                                    canBeDelete: checkExistRemark.gid,
                                    canBeInsert: true,
                                }
                            }

                            setToState('guest', ['profile', 'checkboxGroupAll'], Object.assign(state.profile.checkboxGroupAll, data))
                            setToState('guest', ['profile', 'checkboxGroupAllBase'], Object.assign(state.profile.checkboxGroupAllBase, data))
                            setIsChecked(true);

                        }
                        setIsLoading(false);
                    } else {
                        setIsLoading(false);
                    }

                }
            } else {
                setIsLoading(false)
            }
        }

        return () => {
            active = false
        }
    }, [selectedRemarkList])

    const handleChangeRemark = (event) => {
        const oldValue = selectedRemarkList?.find(e => e.remarkid === remark.id)
        const checked = event.target.checked
        const value = checked ? selectedRemarkList.find(e => e.remarkid === remark.id) ? true : Number(event.target.value) : false
        const group = state?.profile?.checkboxGroupAll || false

        const obj = {
            [remark.id]: remark.hasnote ? {
                canBeDelete: group && group[remark.id]?.canBeDelete || false,
                canBeInsert: value,
                note: group && group[remark.id]?.note || null,
                isUpdateNote: group && group[remark.id]?.isUpdateNote || false,
                info: {
                    remarkgr: remark.remarkgrdesc,
                    remark: remark.description
                }
            } : {
                canBeDelete: group && group[remark.id]?.canBeDelete || false,
                canBeInsert: value,
                info: {
                    remarkgr: remark.remarkgrdesc,
                    remark: remark.description
                }
            }
        }

        if(oldValue) {
            if(obj[remark.id].info && checked) {
                delete obj[remark.id].info
            }
        }

        if(checked) {
            setToState('guest', ['profile', 'checkboxGroupAll'], Object.assign(group, obj))
        } else {
            if(!state.profile.checkboxGroupAll[event.target.value].canBeDelete) {
                delete group[event.target.value]
                setToState('guest', ['profile', 'checkboxGroupAll'], group)
            } else {
                setToState('guest', ['profile', 'checkboxGroupAll'], Object.assign(group, obj))
            }
        }
        setIsChecked(checked)
    }

    return (
        <div style={{display: 'flex'}}>

            <FormControlLabel
                checked={isChecked}
                onChange={handleChangeRemark}
                name={String(remark.id)}
                value={String(remark.id)}
                control={<Checkbox color="primary" />}
                disabled={isDisabled || isLoading}
                label={t(remark.description)}
            />
            {
                remark?.hasnote && (
                    <TextField
                        value={state.profile.checkboxGroupAll?.[remark?.id]?.note || ''}
                        disabled={remark.hasnote && !state.profile.checkboxGroupAll?.[remark?.id]?.canBeInsert}
                        onChange={(e) => {
                            setToState(
                                'guest',
                                ['profile', 'checkboxGroupAll', remark.id],
                                {
                                    ...state.profile.checkboxGroupAll?.[remark?.id],
                                    note: transliteration(e.target.value),
                                    isUpdateNote: state.profile.checkboxGroupAllBase?.[remark?.id]?.note !== e.target.value
                                }
                            )
                        }}
                        variant={'outlined'}
                        size={'small'}
                    />
                )
            }
        </div>

    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RemarkCheckbox)

