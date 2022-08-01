import React, {useContext, useEffect, useState, useRef} from "react";
import {connect, useSelector} from 'react-redux'
import {IconButton, TextField} from '@material-ui/core'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import LoadingSpinner from "../LoadingSpinner";
import WebCmsGlobal from "../webcms-global";
import useTranslation from "../../lib/translations/hooks/useTranslation";
import {UseOrest} from '@webcms/orest'
import PropTypes from 'prop-types'
import {useOrestAction} from "../../model/orest";
import { REQUEST_METHOD_CONST } from "../../model/orest/constants";
import { setToState } from "../../state/actions";
import AddIcon from "@material-ui/icons/Add";
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles((theme) => ({
    root: {
        '&.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"]': {
            paddingRight: '0',
        },
        '&.MuiAutocomplete-hasPopupIcon .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"]': {
            paddingRight: '0',
        },
        '&.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"]:hover $addIconContainer': {
            visibility: 'visible',
        },
        '& .MuiInputBase-root > .MuiAutocomplete-endAdornment': {
            position: 'initial',
        },
        '& .MuiAutocomplete-endAdornment > .MuiAutocomplete-clearIndicator': {
            fontSize: '1.125rem',
            padding: '3px'
        },
        '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"] .MuiAutocomplete-endAdornment': {
            right: '0',
            paddingRight: '8px'
        }
    },
    addIconContainer: {
        visibility: 'hidden'
    }
}))

const filter = createFilterOptions();

function CustomAutoComplete(props) {
    const classes = useStyles()

    const { id, name, endpoint, params, disabled, variant, searchParam, label, value, showOptionLabel, initialId, trgValKey, showOption, required, searchInitialParam, onChange, onLoad, freeSolo, helperText, error, triggerValue, onInputChange, useDefaultFilter, onBlur, withoutToken, setToState, withoutTokenData, fullWidth, showAddIcon, handleAddIconClick, fontSize, findDefaultValue } = props

    //context
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();

    const { setOrestState } = useOrestAction()

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const reduxList = useSelector((state) => state?.formReducer?.dynamicList?.[name] || false);

    //state
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [reason, setReason] = useState('');
    const [list, setList] = useState(reduxList || []);
    const [filterList, setFilterList] = useState(list)
    const [initialValue, setInitialValue] = useState('');
    const [localStateTriggerValue, setLocalStateTriggerValue] = useState(false);

    let baseUrl = GENERAL_SETTINGS?.BASE_URL
    if(withoutToken && baseUrl.length > 0) {
        if(baseUrl[baseUrl.length - 1] === '/') {
            baseUrl = baseUrl.substring(0, baseUrl.length - 1)
        }
    }

    //ref
    const ref = useRef();

    useEffect(() => {
        if(initialId && initialId !== '' && initialValue === 'find' && initialId !== initialValue) {
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: endpoint,
                token,
                params: {
                    query: `${searchInitialParam ? searchInitialParam : 'id'}:${initialId}`,
                    hotelrefno: params?.hotelrefno
                }
            }).then(r1 => {
                if(r1.status === 200) {
                    if(typeof onLoad === 'function') {
                        onLoad(r1.data.data[0])
                    }
                }
            })
        }
    }, [initialId, initialValue])

    useEffect(() => {
        if((endpoint && params && !reduxList) || (endpoint && withoutToken && !reduxList)) {
            setLoading(true);
            UseOrest({
                apiUrl: withoutToken ? baseUrl : GENERAL_SETTINGS.OREST_URL,
                endpoint: endpoint,
                method: withoutToken ? REQUEST_METHOD_CONST.POST : REQUEST_METHOD_CONST.GET,
                token: withoutToken ? false : token,
                params: params,
                data: withoutToken ? withoutTokenData : false
            }).then(res => {
                if(res.status === 200 && res.data.success) {
                    setLoading(false);
                    setList(res.data.data);
                    setFilterList(res.data.data);
                    setToState('dynamicList', [name], res.data.data)
                } else {
                    setLoading(false);
                }
            })
        } else if(reduxList && reduxList?.length > 0) {
            setList(reduxList);
        }
    }, [])

    useEffect(() => {
        if(initialId && list.length > 0) {
            handleFindInitialValue(list)
        }
    }, [initialId, list])




    useEffect(() => {
        if(localStateTriggerValue !== (typeof triggerValue === 'object' ? triggerValue[trgValKey] : triggerValue)  && triggerValue !== '' && triggerValue) {
            setLocalStateTriggerValue(triggerValue);
            setLoading(true);
            UseOrest({
                apiUrl: withoutToken ? baseUrl : GENERAL_SETTINGS.OREST_URL,
                endpoint: endpoint,
                method: withoutToken ? REQUEST_METHOD_CONST.POST : REQUEST_METHOD_CONST.GET,
                token: withoutToken ? false : token,
                params: params,
                data: withoutToken ? withoutTokenData && withoutTokenData : false
            }).then(res => {
                if(res.status === 200) {
                    setList(res.data.data)
                }
                setLoading(false);
            })
        }
    }, [triggerValue])

    const handleFindInitialValue = (list = []) => {
        if(list.length > 0) {
            if(initialId) {
                let initialValue;
                if(searchInitialParam) {
                    initialValue = list.find(e => e[searchInitialParam] === initialId)
                } else {
                    initialValue = list.find(e => e.id === initialId)
                }
                if(initialValue){
                    if(typeof onLoad === 'function') {
                        onLoad(initialValue)
                    }
                    setInitialValue(typeof initialValue === 'object' ? initialValue[searchInitialParam] : initialValue)
                } else {
                    setInitialValue('find')
                    if(findDefaultValue) {
                        const defaultValue = list.find(e => e.isdef === true);
                        if(defaultValue) {
                            if(typeof onLoad === 'function') {
                                onLoad(defaultValue && defaultValue)
                            }
                            setInitialValue(initialValue)
                        }
                    }                    
                }
            }
        }
    }




    useEffect(() => {
        if(!useDefaultFilter) {
            if(searchText.length > 0 && reason !== 'reset') {
                const timer = setTimeout(() => {
                    params.text = `*${searchText}`;
                    params.field = searchParam
                    setLoading(true);
                    UseOrest({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: endpoint,
                        token,
                        params: params
                    }).then(res => {
                        if(res.status === 200) {
                            setFilterList(res.data.data)
                            setLoading(false)
                        } else {
                            setLoading(false);
                        }
                    })
                }, 1000)
                return () => clearTimeout(timer);
            } else {
                setFilterList([])
            }
        }

    }, [searchText])

    const handleOnBlur = (event) => {
       if(typeof onBlur === 'function') onBlur(event)
    }

    return(
        <Autocomplete
            className={classes.root}
            id={id}
            name={name}
            ref={ref}
            loading={loading}
            disabled={disabled || loading}
            noOptionsText={t("str_notFound")}
            fullWidth={fullWidth}
            value={value}
            variant={variant || 'outlined'}
            onChange={(event, newValue) => {
                onChange(event, newValue, ref.current.getAttribute("name"))
            }}
            onInputChange={(e, newInputValue, reason) => {
                setSearchText(newInputValue.toUpperCase())
                setReason(reason)
                if(typeof onInputChange === 'function') {
                    onInputChange(newInputValue)
                }
            }}
            onBlur={(e) => handleOnBlur(e)}
            options={searchText.length > 0 && filterList.length > 0 ? filterList : list}
            filterOptions={(options, params) => useDefaultFilter ? list.length > 0 && filter(options, params) : options}
            getOptionLabel={(option) => {
                // Value selected with enter, right from the input
                if (typeof option === 'string') {
                    return option;
                }
                // Add "xxx" option created dynamically
                if (option[showOption]) {
                    return option[showOption];
                }
                // Regular option
                return option.code;
            }}
            //renderOption={(option) => option[showOption ? showOption : 'code']}
            getOptionSelected={(option, value) => option[showOption ? showOption : 'id'] === value[showOption ? showOption : 'id']}
            renderInput={(params) => (
                <TextField
                    {...params}
                    required={required}
                    error={error}
                    label={label || ''}
                    InputProps={{
                        ...params.InputProps,
                        style:{fontSize: fontSize || 'inherit'},
                        endAdornment: (
                            <React.Fragment>

                                {
                                    showAddIcon && (
                                        <div className={classes.addIconContainer}>
                                            <IconButton size={'small'} onClick={() => typeof handleAddIconClick === 'function' && handleAddIconClick()}>
                                                <AddIcon fontSize={'small'}/>
                                            </IconButton>
                                        </div>
                                    )
                                }
                                {
                                    loading ? (
                                        <div style={{paddingRight: '4px'}}>
                                            <LoadingSpinner size={18} />
                                        </div>
                                    ) : null
                                }
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                    variant={variant}
                    helperText={helperText}
                />
            )}
            freeSolo={freeSolo}
        />
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(CustomAutoComplete)

CustomAutoComplete.defaultProps = {
    showOptionLabel: 'code'
}

CustomAutoComplete.propTypes = {
    endpoint: PropTypes.string.isRequired,

}