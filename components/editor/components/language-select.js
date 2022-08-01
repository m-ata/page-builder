import React from 'react'
import PropTypes from 'prop-types'
import { FormControl, InputLabel, Select, Checkbox, ListItemText, MenuItem, FormHelperText } from '@material-ui/core'
import useTranslation from 'lib/translations/hooks/useTranslation'

const LanguageSelect = (props) => {
    const { list, label, value, onChange, limit, disabled, size, isSynchronize } = props
    const { t } = useTranslation()

    return (
        <FormControl variant="outlined" fullWidth disabled={disabled} size={size || 'medium'}>
            <InputLabel id="language-select">{label}</InputLabel>
            <Select
                size={size || 'medium'}
                inputProps={{ name: label, id: label }}
                label={label}
                multiple
                value={value}
                onChange={onChange}
                renderValue={(selected) => {
                    return (
                        <div>
                            {value && limit && selected.length > limit ?
                                selected.slice(0, limit).map((value, index) => (<span key={value} style={{ marginRight: 5 }}>{value}{(index < selected.length - 1) && (`,`)}</span>)) :
                                selected.map((value, index) => (<span key={value} style={{ marginRight: 5 }}>{value}{(index < selected.length - 1) && (`,`)}</span>))}
                            {value && limit && selected.length > limit && (`+${selected.length - limit}`)}
                        </div>
                    )
                }}
            >
                {list && list.length > 0 && list.map((item, index) => (
                    <MenuItem key={index} value={item.description} disabled={disabled}>
                        <Checkbox checked={value.indexOf(item.description) > -1} />
                        <ListItemText primary={item.description} />
                    </MenuItem>
                ))}
            </Select>
            {isSynchronize && (<FormHelperText style={{ color: '#f3b807', textAlign: 'end' }}>{t('str_clickSyncForTheLanguageSelectionToTakeEffect')}</FormHelperText>)}
        </FormControl>
    )
}

LanguageSelect.propTypes = {
    list: PropTypes.array,
    label: PropTypes.any,
    value: PropTypes.any,
    size: PropTypes.string,
    onChange: PropTypes.func,
    inputCls: PropTypes.string,
    limit: PropTypes.number,
    disabled: PropTypes.bool,
    isSynchronize: PropTypes.bool
}

export default LanguageSelect
