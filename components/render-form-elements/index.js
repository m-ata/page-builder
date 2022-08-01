import React from 'react';
import {
    InputAdornment,
    TextField,
} from '@material-ui/core'
import CustomAutoComplete from "../CustomAutoComplete/CustomAutoComplete";
import CustomDatePicker from "../CustomDatePicker/CustomDatePicker";
import CustomTimePicker from "../CustomTimePicker/CustomTimePicker";
import PhoneInput from "../../@webcms-ui/core/phone-input";
import getSymbolFromCurrency from "../../model/currency-symbol";
import NumberFormat from "react-number-format";
import SpinEdit from "../../@webcms-ui/core/spin-edit";

export const ELEMENT_TYPES = {
    textField: 'textField',
    autoComplete: 'autoComplete',
    datePicker: 'datePicker',
    timePicker: 'timePicker',
    phoneInput: 'phoneInput',
    numberFormat: 'numberFormat',
    spinEdit: 'spinEdit'
}

const renderFormElements = (formElement) => {


    return(
        <React.Fragment>
            {
                formElement?.type === ELEMENT_TYPES.textField ? (
                    <TextField
                        id={formElement?.id}
                        name={formElement?.name}
                        value={formElement?.value}
                        error={formElement?.error}
                        required={formElement?.required}
                        disabled={formElement?.disabled}
                        label={formElement?.label}
                        onChange={e => typeof formElement?.onChange === 'function' && formElement.onChange(e)}
                        onBlur={e => typeof formElement?.onBlur === 'function' && formElement.onBlur(e)}
                        helperText={formElement?.helperText}
                        variant={formElement?.variant}
                        fullWidth={formElement?.fullWidth}
                        multiline={formElement?.multiLine}
                        rows={formElement?.rows}
                        rowsMax={formElement?.rowsMax}
                        inputProps={formElement?.inputProps}

                    />
                ): formElement?.type === ELEMENT_TYPES.autoComplete ? (
                    <CustomAutoComplete
                        id={formElement?.id}
                        name={formElement?.name}
                        value={formElement?.value}
                        error={formElement?.error}
                        required={formElement?.required}
                        disabled={formElement?.disabled}
                        label={formElement?.label}
                        onChange={(e, newValue) => typeof formElement?.onChange === 'function' && formElement.onChange(newValue, formElement?.name)}
                        onBlur={e => typeof formElement?.onBlur === 'function' && formElement.onBlur(e, formElement?.name)}
                        onInputChange={e => typeof formElement?.onInputChange === 'function' && formElement.onInputChange(e, formElement?.name)}
                        onLoad={initialValue => typeof formElement?.onLoad === 'function' && formElement.onLoad(initialValue, formElement?.name)}
                        endpoint={formElement?.endpoint}
                        params={formElement?.params}
                        showOptionLabel={formElement?.showOptionLabel}
                        showOption={formElement?.showOption}
                        searchParam={formElement?.searchParam}
                        initialId={formElement?.initialId}
                        searchInitialParam={formElement?.searchInitialParam}
                        useDefaultFilter={formElement?.useDefaultFilter}
                        freeSolo={formElement?.freeSolo}
                        triggerValue={formElement?.triggerValue || false}
                        helperText={formElement?.helperText}
                        variant={formElement?.variant}
                        fullWidth={formElement?.fullWidth}
                    />
                ): formElement?.type === ELEMENT_TYPES.datePicker ? (
                    <CustomDatePicker
                        views={formElement?.views}
                        id={formElement?.id}
                        name={formElement?.name}
                        value={formElement?.value}
                        label={formElement?.label}
                        minDate={formElement?.minDate}
                        maxDate={formElement?.maxDate}
                        onChange={(newValue, name) => typeof formElement?.onChange === 'function' && formElement?.onChange(newValue, formElement?.name)}
                        onError={(e) => typeof formElement?.onError === 'function' && formElement?.onError(e)}
                        disableFuture={formElement?.disableFuture}
                        disablePast={formElement?.disablePast}
                        fullWidth={formElement?.fullWidth}
                    />
                ) : formElement?.type === ELEMENT_TYPES.timePicker ? (
                    <CustomTimePicker
                        ampm={formElement?.ampm}
                        value={formElement?.value}
                        onChange={(newTime) => typeof formElement?.onChange === 'function' && formElement?.onChange(newTime, formElement?.name)}
                        onError={(e) => typeof formElement?.onError === 'function' && formElement?.onError(e)}
                        label={formElement?.label}
                    />
                ) : formElement?.type === ELEMENT_TYPES.phoneInput ? (
                    <PhoneInput
                        id={formElement?.id}
                        name={formElement?.name}
                        defaultCountry={formElement?.defaultCountry}
                        variant={'outlined'}
                        disabled={formElement?.disabled}
                        label={formElement?.label}
                        fullWidth={formElement?.fullWidth}
                        value={formElement?.value}
                        onChange={(e)=> typeof formElement?.onChange === 'function' && formElement?.onChange(e, formElement?.name)}
                        error={formElement?.error}
                        helperText={formElement?.helperText}
                        required={formElement?.required}
                        onBlur={(e) => typeof formElement?.onBlur === 'function' && formElement.onBlur(e, formElement?.name)}
                        preferredCountries={[
                            'it',
                            'ie',
                            'de',
                            'fr',
                            'es',
                            'gb',
                        ]}
                        regions={[
                            'america',
                            'europe',
                            'asia',
                            'oceania',
                            'africa',
                        ]}
                    />
                ) : formElement?.type === ELEMENT_TYPES.numberFormat ? (
                    <NumberFormat
                        id={formElement?.id}
                        name={formElement?.name}
                        value={formElement?.value}
                        required={formElement?.required}
                        displayType={formElement?.displayType || 'input'}
                        decimalScale={formElement?.decimalScale || 2}
                        fullWidth={formElement?.fullWidth}
                        inputMode={formElement?.inputMode || 'decimal'}
                        isNumericString
                        thousandSeparator
                        customInput={TextField}
                        onValueChange={( values) => typeof  formElement.onChange === 'function' && formElement.onChange(values, formElement?.name)}
                        onBlur={(e) => formElement.onBlur === 'function' && formElement.onBlur(e)}
                        variant={formElement?.variant}
                        label={formElement?.label}
                        inputProps={{ style: { textAlign: 'right', paddingRight: '8px' } }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="start">
                                    {getSymbolFromCurrency(formElement?.currencyCode || 'TL')}
                                </InputAdornment>
                            ),
                        }}
                    />
                ) : formElement?.type === ELEMENT_TYPES.spinEdit ? (
                    <SpinEdit
                        id={formElement?.id}
                        name={formElement?.name}
                        value={formElement?.value}
                        padding={formElement?.padding}
                        label={formElement?.label}
                        max={formElement?.max}
                        min={formElement?.min}
                        defaultValue={formElement?.defaultValue}
                        size={formElement?.size}
                        onChange={(value) => typeof formElement?.onChange === 'function' && formElement.onChange(value, formElement?.name)}
                    />
                ) : null
            }
        </React.Fragment>

    )

}

export default renderFormElements