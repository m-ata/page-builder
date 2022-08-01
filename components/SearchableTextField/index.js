import React, { useEffect, useState, useContext, useRef } from "react";
import { makeStyles } from '@material-ui/core/styles'
import {
    TextField,
    FormControl,
    ClickAwayListener,
    InputAdornment,
    MenuItem,
    Paper
} from '@material-ui/core'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClearIcon from '@material-ui/icons/Clear';
import { UseOrest } from '@webcms/orest'
import WebCmsGlobal from "../webcms-global";
import useTranslation from "../../lib/translations/hooks/useTranslation";
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import LoadingSpinner from "../LoadingSpinner";

const useStyles = makeStyles( theme => ({
    paperMenuOpen: {
        width: '100%',
        marginTop:"2px",
        position:"absolute",
        maxHeight: "300px",
        overflow: "auto",
        zIndex:"2",
        visibility:"hidden"
    },
    textField: {
        "& input": {
            textTransform: 'uppercase'
        },
        "&:hover $clearIconContainer": {
            visibility: 'visible'
        }
    },
    clearIconContainer: {
        zIndex: 3,
        visibility: 'hidden'
    }

}));


function SearchableTextField(props) {
    const classes = useStyles();

    //props
    const { value, triggerValue, variant, label, endpoint, params, querySearchParam, onChange, id, name, onSelect, showOptionLabel, originalValue, className, onClear } = props

    //context
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);

    //state
    const [open, setOpen] = useState(false);
    const [isSelect, setIsSelect] = useState(true);
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState([]);
    const [filterList, setFilterList] = useState([]);
    const [localStateTriggerValue, setLocalStateTriggerValue] = useState('');
    const [selectedValue, setSelectedValue] = useState('');

    //ref
    const inputRef = useRef();
    const formControlRef = useRef();


    useEffect(() => {
        if(endpoint) {
            if(localStateTriggerValue !== triggerValue && triggerValue !== '') {
                setLocalStateTriggerValue(triggerValue);
                setLoading(true);
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: endpoint,
                    token,
                    params: params
                }).then(res => {
                    if(res.status === 200) {
                        setLoading(false);
                        setList(res.data.data);
                        setFilterList(res.data.data);
                    } else {
                        setLoading(false);
                    }
                })
            }
        }
    }, [triggerValue])

    useEffect(() => {
        if(!isSelect) {
            if(value.length > 0 ) {
                const timer = setTimeout(() => {
                    params.text = `*${value}`;
                    params.field = querySearchParam
                    setLoading(true);
                    UseOrest({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: endpoint,
                        token,
                        params: params
                    }).then(res => {
                        if(res.status === 200) {
                            setFilterList(res.data.data);
                            setLoading(false);
                        } else {
                            setLoading(false);
                        }
                    })
                }, 700)
                return () => clearTimeout(timer);
            } else {
                setFilterList(list);
            }
        } else {
            setFilterList(list);
        }

    }, [value, isSelect])

    useEffect(() => {
        if(list.length > 0) {
            const findValue = list.find(e => e.longdesc === value)
            setSelectedValue(findValue ? findValue.longdesc : '');
        }
    }, [list.length])


    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOnChange = (e) => {
        onChange(e);
        setIsSelect(false);
    }

    const handleOnSelect = (renderValue, itemValue) => {
        onSelect(renderValue, itemValue);
        setIsSelect(true);
        setSelectedValue(renderValue);

    }

    const handleKeyboardKeyPress = (event, key) => {
        if(event.keyCode === 13){
            if(key === 'formControl') {
                setOpen(true);
                event.preventDefault();
            }
        }
    }

    const handleOnClear = (event) => {
        inputRef.current?.focus();
        event.preventDefault();
        event.stopPropagation();
        setSelectedValue('');
        onClear()
    }

    return(
        <div style={{position: 'relative'}}>
            <ClickAwayListener onClickAway={handleClose}>
                <FormControl
                    ref={formControlRef}
                    onClick={handleClick}
                    fullWidth
                    onKeyDown={(e) => handleKeyboardKeyPress(e, 'formControl')}
                    onBlur={(e) => {
                        if (e.currentTarget === e.target) {
                            setOpen(false);
                        }
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                            if(e.relatedTarget?.id !== `${id}-menu`) {
                                setOpen(false);
                            }
                        }
                    }}
                >
                    <TextField
                        className={classes.textField || className}
                        inputRef={inputRef}
                        id={id}
                        name={name}
                        value={value}
                        onChange={(e) => {
                            handleOnChange(e)
                        }}
                        fullWidth
                        variant={variant || 'outlined'}
                        label={label || ''}
                        inputProps={{
                            autoComplete: 'off',
                        }}
                        InputProps={{
                            endAdornment: (
                                <React.Fragment>
                                    <InputAdornment position="center">
                                        <div id={'clearButton'} className={classes.clearIconContainer}>
                                            <ClearIcon onClick={handleOnClear} fontSize="small" style={{cursor: 'pointer'}}/>
                                        </div>

                                        {
                                            loading ? <LoadingSpinner size={24} /> : <ArrowDropDownIcon style={{cursor: 'pointer'}} onClick={() => !open && setOpen(true)}/>
                                        }
                                    </InputAdornment>
                                </React.Fragment>

                            ),
                        }}
                    />
                </FormControl>
            </ClickAwayListener>
            <Paper
                className={classes.paperMenuOpen}
                style={{visibility: open ? 'visible' : 'hidden' }}
            >
                {
                    filterList.length > 0 ? (
                        filterList.map((item,ind) => {
                            return(
                                <MenuItem
                                    selected={open && selectedValue === item.longdesc}
                                    id={`${id}-menu`}
                                    name={`${name}-menu`}
                                    key={ind}
                                    value={JSON.stringify({renderValue: item[showOptionLabel], value: item[originalValue]} )}
                                    onClick={() => handleOnSelect(item[showOptionLabel], item[originalValue], ind)}
                                >
                                    {item[showOptionLabel]}
                                </MenuItem>
                            )
                        })
                        ) :(
                        <MenuItem key={'no-data'} value={'none'} >{t('str_notFound')}</MenuItem>
                    )
                }
            </Paper>
        </div>
    )

}



export default SearchableTextField;


SearchableTextField.propTypes = {
    endpoint: PropTypes.isRequired,

}