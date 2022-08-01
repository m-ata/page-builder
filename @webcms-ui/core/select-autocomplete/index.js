import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { TextField } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import LoadingSpinner from 'components/LoadingSpinner'
import WebCmsGlobal from 'components/webcms-global'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { UseOrest } from '@webcms/orest'

const SelectAutoComplete = ({ trgQueryKey, trgValKey, trgValue, optionLabel, optionKey, isInitialStateLoad, defValKey, defValue, disabled, id, name, selectApi, variant, label, value, required, onChange, onCallback, helperText, error }) => {

    //context
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false)

    //state
    const [isLoading, setIsLoading] = useState(false)
    const [selectList, setSelectList] = useState([])
    const [useFreeSolo, setUseFreeSolo] = useState(false)
    const [prevTrgVal, setPrevTrgVal] = useState(false)

    useEffect(() => {
        if((!isLoading && isInitialStateLoad && !selectList.length > 0) || (trgValKey && trgValue && typeof trgValue === 'object' && trgValue[trgValKey] !== prevTrgVal)){
            setIsLoading(true)
            if(trgValKey && trgQueryKey){
                if(trgValue && typeof trgValue === 'object'){
                    trgValue = trgValue[trgValKey]
                    setPrevTrgVal(trgValue)
                }else {
                    onCallback(defValue || value || '')
                    setSelectList([])
                    setUseFreeSolo(true)
                    setIsLoading(false)
                    return
                }
            }

            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: selectApi,
                token,
                params: Object.assign(trgValKey && trgValue && { query: `${trgQueryKey}::${trgValue}` } || {}, { limit: 0, chkselfish: false, allhotels: true }),
            }).then(endPointResponse => {
                if (endPointResponse.status === 200 && endPointResponse?.data?.data && endPointResponse?.data?.data.length > 0) {
                    const endPointResponseData = endPointResponse?.data?.data || false
                    setSelectList(endPointResponseData)
                    setUseFreeSolo(false)
                    setIsLoading(false)
                } else {
                    if(defValue && typeof defValue !== 'object'){
                        onCallback(defValue)
                    }else{
                        onCallback('')
                    }
                    setSelectList([])
                    setUseFreeSolo(true)
                    setIsLoading(false)
                }
            })
        }
    }, [isInitialStateLoad, trgValue])

    useEffect(() => {
        if(!isLoading && isInitialStateLoad && selectList && selectList.length > 0 && defValue && typeof defValue !== 'object'){
            if (defValue) {
                let newInitialValue
                if (defValKey) {
                    newInitialValue = selectList.find(item => String(item[defValKey]) === String(defValue))
                    onCallback(newInitialValue)
                } else {
                    newInitialValue = selectList.find(item => String(item.id) === String(defValue))
                    onCallback(newInitialValue)
                }
            } else {
                const getDefVal = selectList.find(item => item.isdef === true)
                if (getDefVal && typeof onCallback === 'function') {
                    onCallback(getDefVal)
                }
            }
        }else if(!isLoading && isInitialStateLoad && selectList && selectList.length > 0 && defValue){
            if(trgValKey && trgQueryKey && trgValue && typeof trgValue === 'object' && defValue){
                const filterList = selectList.find(item => String(item[trgQueryKey]) === String(defValue[trgQueryKey]))
                if(!filterList){
                   onCallback('')
                }
            }else if(trgValKey && trgQueryKey && !trgValue){
                setUseFreeSolo(true)
                setSelectList([])
                onCallback('')
            }
        }
    }, [isLoading, selectList, defValue, trgValue])

    if(useFreeSolo){
        return (
            <TextField
                disabled={isLoading || !isInitialStateLoad || disabled}
                value={value}
                required={required}
                error={error}
                fullWidth={true}
                label={label || ''}
                variant={variant}
                helperText={helperText}
                onChange={(event) => onChange(event.target.value)}
            />
        )
    }

    return (
        <Autocomplete
            id={id}
            name={name}
            disabled={isLoading || !isInitialStateLoad || disabled}
            loading={isLoading}
            noOptionsText={t('str_notFound')}
            value={value}
            variant={variant || 'outlined'}
            onChange={(event, newValue) => onChange(newValue)}
            options={selectList}
            getOptionSelected={optionKey ? (option, value) => option && value && option[optionKey] && option[optionKey] === value[optionKey] || "" : ""}
            getOptionLabel={(option) => option && optionLabel && option[optionLabel] || ""}
            renderInput={(params) => (
                <TextField
                    {...params}
                    required={required}
                    error={error}
                    fullWidth={true}
                    label={label || ''}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {params.InputProps.endAdornment}
                                {isLoading ? <LoadingSpinner size={18} style={{ marginTop: -20 }} /> : params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                    variant={variant}
                    helperText={helperText}
                />
            )}
        />
    )
}

export default SelectAutoComplete