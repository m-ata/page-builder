import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Box, IconButton, TextField } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'

export default function SpinEdit(props) {

  let {required, disabled, label, max, min, defaultValue, helpText, size, padding, onChange, className, isWritableText, error, style} = props;
  const [inputType, setInputType] = useState('')
  const [inputValue, setInputValue] = useState(defaultValue)

  useEffect(() => {
    if (inputValue !== defaultValue && typeof onChange === 'function') {
      onChange(inputValue, inputType)
    }
  }, [inputValue])

  useEffect(() => {
    if (inputValue !== defaultValue) {
      setInputValue(defaultValue)
    }
  }, [defaultValue])

  const handleInc = () => {
    if (max > inputValue)
      setInputType('inc')
    setInputValue(inputValue + 1)
  }

  const handleDec = () => {

    if (inputValue > min) {
      setInputType('dec')
      setInputValue(inputValue - 1)
    }
    if (inputValue > max) {
      setInputValue(max)
    }
  }

  return (
    <React.Fragment>
      <Box p={padding} style={style && style || {}}>
        <TextField
          required={required || false}
          error={error}
          disabled={disabled}
          className={className || ""}
          label={label}
          value={inputValue}
          variant="outlined"
          helperText={helpText}
          onChange={(e) => {
            if(isWritableText) {
              const reg = /^[0-9\b]+$/
              if (e.target.value === '' || reg.test(e.target.value)) {
                setInputValue(Number(e.target.value))
              }
            }
          }}
          fullWidth
          size={size}
          FormHelperTextProps={{
            style:  {opacity: error ? '1' : '0'}
          }}
          inputProps={{ style: { textAlign: 'center' }, pattern:"[0-9]*" }}
          InputProps={{
            readOnly: !isWritableText,
            startAdornment: (
              <IconButton style={{padding: '4px'}} size={size} onClick={()=> handleDec()} disabled={disabled || inputValue <= min}>
                <RemoveIcon fontSize={size}/>
              </IconButton>
            ),
            endAdornment: (
              <IconButton style={{padding: '4px'}} size={size} onClick={()=> handleInc()} disabled={disabled || inputValue >= max}>
                <AddIcon fontSize={size}/>
              </IconButton>
            ),
          }}
        />
      </Box>
    </React.Fragment>
  );
}

SpinEdit.defaultProps = {
  label: "",
  max: 99,
  min: 0,
  defaultValue: 0,
  padding: 3,
  size: "medium",
  helpeText: '',
  disabled: false,
  isWritableText: false
}

SpinEdit.propTypes = {
  onChange: PropTypes.func,
  label: PropTypes.string,
  helpText: PropTypes.object,
  max: PropTypes.number,
  min: PropTypes.number,
  defaultValue: PropTypes.number,
  padding: PropTypes.number,
  size: PropTypes.string,
  disabled: PropTypes.bool,
  isWritableText: PropTypes.bool,
  style: PropTypes.object
}