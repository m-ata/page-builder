import React, {useContext, useState} from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import { DatePicker, LocalizationProvider } from '@material-ui/pickers'
import useTranslation from 'lib/translations/hooks/useTranslation'
import {ClickAwayListener} from "@material-ui/core";
import {LocaleContext} from "../../lib/translations/context/LocaleContext";
import EventIcon from '@material-ui/icons/Event';

function CustomDatePicker(props) {
    const { minDate, value, onChange, onError, label, id, name, disablePast, disableFuture, helperText, fullWidth, required, error, variant, views } = props
        , { t } = useTranslation()

    const { locale } = useContext(LocaleContext)
    const inputFormat = moment.localeData(locale).longDateFormat('L')
    const mask = inputFormat.replaceAll('D', '_').replaceAll('M', '_').replaceAll('Y', '_')
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const handleOnChange = (newDate, name) => {
        if(typeof onChange === "function") onChange(newDate, name)
    }

    const handleOnError = (error) => {
        if(typeof onError === "function") onError(error)
    }

    return (
        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
            <ClickAwayListener onClickAway={() => setOpenDatePicker(false)}>
                <div>
                    <DatePicker
                        autoOk
                        id={id}
                        name={name}
                        open={openDatePicker}
                        label={label || t('str_date')}
                        minDate={minDate}
                        mask={mask}
                        value={value}
                        error={error}
                        allowKeyboardControl
                        inputFormat={moment.localeData(locale).longDateFormat('L')}
                        disableFuture={disableFuture}
                        disablePast={disablePast}
                        openTo={'date'}
                        views={views || ['year', 'month', 'date']}
                        onClose={() => {setOpenDatePicker(false)}}
                        onError={(e) => handleOnError(e)}
                        onChange={(newDate) => handleOnChange(newDate, name)}
                        renderInput={(props) => {
                            return (
                                <TextField
                                    {...props}
                                    id={id}
                                    name={name}
                                    fullWidth={fullWidth}
                                    required={required}
                                    variant={variant || 'outlined'}
                                    helperText={helperText && `(${helperText})` || props?.error && inputFormat && `(${inputFormat})` || ''}
                                    InputProps={{
                                        ...props.InputProps,
                                        endAdornment: (
                                            <React.Fragment>
                                             <span onClick={() => {setOpenDatePicker(true)}}>
                                                 {<EventIcon size={'small'} style={{color: 'inherit', cursor: 'pointer'}}/>}
                                             </span>
                                            </React.Fragment>
                                        ),
                                    }}
                                />
                            )
                        }}
                    />
                </div>
            </ClickAwayListener>
        </LocalizationProvider>
    )
}

CustomDatePicker.propTypes = {
    value: PropTypes.object,
    minDate: PropTypes.object,
    label: PropTypes.string,
    onError: PropTypes.func,
    onChange: PropTypes.func,
}

export default CustomDatePicker
