import React from 'react'
import PropTypes from 'prop-types'
import { FormControl, Select, InputLabel, MenuItem } from '@material-ui/core'

const ModuleSelection = (props) => {
    const { list, label, value, onChange, size, disabled } = props

    return (
        <FormControl variant="outlined" fullWidth disabled={disabled} size={size || 'medium'}>
            <InputLabel id={`${label}-label`}>{label}</InputLabel>
            <Select
                labelId={`${label}-label`}
                id={`${label}-select`}
                value={value}
                onChange={onChange}
                label={label}
            >
                {list && list.length > 0 && list.map((item, index) =>
                    <MenuItem key={index} value={item.id} disabled={disabled}>{item.note}</MenuItem>
                )}
            </Select>
        </FormControl>
    )
}

ModuleSelection.propTypes = {
    disabled: PropTypes.bool,
    list: PropTypes.array,
    label: PropTypes.any,
    value: PropTypes.any,
    size: PropTypes.string,
    onChange: PropTypes.func,
}

export default ModuleSelection
