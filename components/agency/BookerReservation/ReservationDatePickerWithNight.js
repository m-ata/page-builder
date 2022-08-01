import { useState } from 'react'
import useTranslation from 'lib/translations/hooks/useTranslation'
import SpinEdit from '@webcms-ui/core/spin-edit'
import {
    DateRangePicker,
    LocalizationProvider,
} from '@material-ui/pickers'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import { TextField, Grid, ClickAwayListener } from '@material-ui/core'

export default function ReservationDatePickerWithNight(props) {
    const { t } = useTranslation()
        , { required, disabled, dateKey, nightKey, dates, night, onChange } = props
        , [openDatepicker, setOpenDatepicker] = useState(false)
        , [isFocusCheckOut, setIsFocusCheckOut] = useState(false)

    const handleChange = (value) => {
        let night = 0
        if (value && value[0] && value[1]) {
            night = value[1].diff(value[0], 'days')
        } else if (value && value[0] && value[1] === null) {
            value[1] = moment(value[0]).add(1, 'days')
            night = value[1].diff(value[0], 'days')
        }

        onChange({
            dateKey: dateKey,
            nightKey: nightKey,
            dates: value,
            night: night,
        })
    }

    const handleChangeNight = (value) => {
        const useNight = Number(value)
        if (dates && dates[0] && useNight >= 1) {
            dates[1] = moment(dates[0]).add(useNight, 'days')
            onChange({
                dateKey: dateKey,
                nightKey: nightKey,
                dates: dates,
                night: value
            })
        }
    }

    return (
        <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
            <ClickAwayListener onClickAway={() => setOpenDatepicker(false)}>
                <div>
                    <DateRangePicker
                        open={openDatepicker}
                        disablePast
                        value={dates}
                        onChange={(newValue) => handleChange(newValue)}
                        minDate={isFocusCheckOut && dates && dates[0] || null}
                        openTo='date'
                        views={['date', 'month', 'year']}
                        renderInput={(startProps, endProps) => (
                            <Grid container spacing={1}>
                                <Grid item xs>
                                    <TextField
                                        {...startProps}
                                        required={required || false}
                                        disabled={disabled}
                                        label={t('str_checkinDate')}
                                        size='small'
                                        fullWidth
                                        helperText=''
                                        onFocus={() => {
                                            setOpenDatepicker(true)
                                            setIsFocusCheckOut(false)
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <SpinEdit
                                        required={required || false}
                                        min={1}
                                        id='night'
                                        name='night'
                                        defaultValue={night || 0}
                                        padding={0}
                                        label={t('str_night')}
                                        onChange={(value) => handleChangeNight(value)}
                                        size='small'
                                        disabled={disabled}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <TextField
                                        {...endProps}
                                        required={required || false}
                                        label={t('str_checkoutDate')}
                                        size='small'
                                        fullWidth
                                        helperText=''
                                        onFocus={() => {
                                            setOpenDatepicker(true)
                                            setIsFocusCheckOut(true)
                                        }}
                                        disabled={disabled}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    />
                </div>
            </ClickAwayListener>
        </LocalizationProvider>
    )
}