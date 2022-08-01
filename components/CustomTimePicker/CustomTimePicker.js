import React  from "react";
import { TextField } from '@material-ui/core'
import { TimePicker, LocalizationProvider} from '@material-ui/pickers'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import PropTypes from 'prop-types'
import useTranslation from "../../lib/translations/hooks/useTranslation";

function CustomTimePicker(props) {

    const { value, onChange, onError, label, ampm, helperText } = props;

    //context
    const { t } = useTranslation();

    const handleOnChange = (newTime) => {
        onChange(newTime)
    }

    const handleOnError = (error) => {
        onError(error)
    }

    return(
        <div>
            <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                <TimePicker
                    ampm={ampm}
                    inputFormat="HH:mm"
                    mask="__:__"
                    value={value}
                    onChange={(newTime) => typeof handleOnChange === 'function' && handleOnChange(newTime)}
                    onError={(e) => typeof handleOnError === 'function' && handleOnError(e)}
                    label={label || t('str_time')}
                    renderInput={(props) => (
                        <TextField
                            id={'time'}
                            name={'time'}
                            variant={'outlined'}
                            {...props}
                            InputProps={{
                                ...props.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        <span/>
                                    </React.Fragment>
                                ),
                            }}
                            helperText={helperText || props?.error && props.inputProps.placeholder}
                        />
                    )
                    }
                />
            </LocalizationProvider>
        </div>
    )
}

export default CustomTimePicker;

CustomTimePicker.defaultProps = {
    ampm: false
}

CustomTimePicker.propTypes = {
    label: PropTypes.string,
    onError: PropTypes.func,
    onChange: PropTypes.func,
    value: PropTypes.object,
    ampm: PropTypes.bool
}