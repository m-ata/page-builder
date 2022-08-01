import React, { useContext, useEffect, useState } from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import { useSelector } from 'react-redux'
import { setToState, updateState } from "../../../../state/actions";
import useTranslation from 'lib/translations/hooks/useTranslation'
import { connect } from 'react-redux'
import Checkbox from "@material-ui/core/Checkbox";
import {TextField} from "@material-ui/core";
import utfTransliteration from '@webcms-globals/utf-transliteration'

const RemarkRadio = (props) => {
    const { state, remark, isDisabled, setRadioGroupValue, setToState } = props
        , [isLoading, setIsLoading] = useState(false)
        , { t } = useTranslation()
        , { transliteration } = utfTransliteration()

    //redux
    const clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , selectedRemarkList = useSelector((state) => state?.orest?.state?.selectedRemarkList || false);

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
                            setRadioGroupValue(String(remark.id))
                            let data = {
                                [remark.remarkgrid]: remark?.hasnote ? {
                                    canBeDelete: checkExistRemark.gid,
                                    canBeInsert: false,
                                    id: remark.id,
                                    note: checkExistRemark.note,
                                    isUpdateNote: false
                                } : {
                                    canBeDelete: checkExistRemark.gid,
                                    canBeInsert: false,
                                    id: remark.id,
                                }
                            }

                            setToState('guest', ['profile', 'radioGroupAllGid'], Object.assign(state.profile.radioGroupAllGid, data))
                            setToState('guest', ['profile', 'radioGroupAllGidBase'], Object.assign(state.profile.radioGroupAllGidBase, data))

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
        const value = event.target.value
        const group = state?.profile?.radioGroupAllGid || false;

        const obj = {
            [remark.remarkgrid]: {
                canBeDelete: group && group[remark.remarkgrid]?.canBeDelete || false,
                canBeInsert: oldValue ? false : Number(value),
                id: remark.id,
                note: group && group[remark.remarkgrid]?.note || null,
                hasNote: remark?.hasnote,
                isUpdateNote: group && group[remark.remarkgrid]?.isUpdateNote || false,
                info: {
                    remarkgr: remark.remarkgrdesc,
                    remark: remark.description
                }
            }
        }
        if(oldValue) {
            if(obj[remark.remarkgrid].info) {
                delete obj[remark.remarkgrid].info
            }
        }

        setToState('guest', ['profile', 'radioGroupAllGid'], Object.assign(state.profile.radioGroupAllGid, obj))
        setRadioGroupValue(value);
    }

    return (
    <div style={{display: 'flex'}}>
        <FormControlLabel
            onChange={handleChangeRemark}
            name={String(remark.id)}
            value={String(remark.id)}
            control={<Radio color="primary"/>}
            disabled={isDisabled || isLoading}
            label={t(remark.description)}
        />
        {
            remark?.hasnote && (
                <TextField
                    value={state.profile.radioGroupAllGid?.[remark.remarkgrid]?.note || ''}
                    disabled={remark.hasnote && state.profile.radioGroupAllGid?.[remark.remarkgrid]?.id !== remark.id}
                    onChange={(e) => {
                        setToState(
                            'guest',
                            ['profile', 'radioGroupAllGid', remark.remarkgrid],
                            {
                                ...state.profile.radioGroupAllGid?.[remark.remarkgrid],
                                note: transliteration(e.target.value),
                                isUpdateNote: state.profile.radioGroupAllGidBase?.[remark?.id]?.note !== e.target.value
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

export default connect(mapStateToProps, mapDispatchToProps)(RemarkRadio)
