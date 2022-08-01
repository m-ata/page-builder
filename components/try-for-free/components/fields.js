import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'
import {TextField, Typography} from '@material-ui/core'
import PhoneInput from '@webcms-ui/core/phone-input'

export const useStylesTc = makeStyles((theme) => ({
    root: {
        border: '1px solid #e2e2e1',
        overflow: 'hidden',
        borderRadius: 4,
        backgroundColor: '#fcfcfb',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        '&:hover': {
            backgroundColor: '#fff',
        },
        '&$focused': {
            backgroundColor: '#fff',
            boxShadow: `rgb(25 118 210 / 25%) 0 0 0 2px`,
            borderColor: theme.palette.primary.main,
        },
    },
    focused: {},
    input: {
        padding: '21px 12px 8px',
    },
}))

export const CustomInputProps = () => {
    const classes = useStylesTc()
    return { classes, disableUnderline: true }
}

export const TcTextField = (props) => {
    const classes = useStylesTc()
    return <TextField {...props} InputProps={{ classes, disableUnderline: true , ...props.InputProps}} InputLabelProps={{ shrink: props.value ? true : undefined }}/>
}

export const TcPhoneField = (props) => {
    const classes = useStylesTc()
    return <PhoneInput InputProps={{ classes, disableUnderline: true }} {...props} />
}

export const TcAutocomplete = (props) => {
    const classes = useStylesTc()
    const [open, setOpen] = useState(false)
    const [isLoading, setLoading] = useState(false)
    const [dataList, setDataList] = useState([])

    useEffect(() => {
        let active = true
        if (active) {
            setLoading(true)
            axios({
                url: props.optionApi,
                method: 'post',
                data: Object.assign((props.queryKey && props.queryValue) ? {[props.queryKey]: props.queryValue}: {})
            }).then((dataResponse) => {
                if (active) {
                    const useResponse = dataResponse.data
                    if (useResponse.success) {
                        setDataList(useResponse.data)
                    }else{
                        setDataList([])
                    }
                    setLoading(false)
                }else{
                    setDataList([])
                    setLoading(false)
                }
            })
        }
        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        let active = true
        if (active && props.defValueKey && props.defValue && dataList && dataList.length > 0) {
            const defValue = dataList.find(data => data[props.defValueKey] === props.defValue)
            if(defValue){
                props.onChange(defValue)
            }
        }

        return () => {
            active = false
        }
    }, [dataList, props.defValue])

    useEffect(() => {
        let active = true
        if (active && props.queryKey && props.queryValue) {
            setLoading(true)
            axios({
                url: props.optionApi,
                method: 'post',
                data: Object.assign((props.queryKey && props.queryValue) ? {[props.queryKey]: props.queryValue}: {})
            }).then((dataResponse) => {
                if (active) {
                    const useResponse = dataResponse.data
                    if (useResponse.success) {
                        setDataList(useResponse.data)
                    }else{
                        setDataList([])
                    }
                    setLoading(false)
                }else{
                    setDataList([])
                    setLoading(false)
                }
            })
        }else{
            setDataList([])
        }

        return () => {
            active = false
        }
    }, [props.queryValue])

    if(!props.noSelect && dataList && dataList.length > 0){
        return (
            <Autocomplete
                id={props.optionApi}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                onChange={(e, option) => props.onChange(option)}
                getOptionSelected={(option, value) => option[props.optionKey] === value[props.optionKey]}
                getOptionLabel={(option) => option && option[props.optionLabel] || ""}
                value={props.value}
                options={dataList}
                loading={isLoading}
                disableClearable={true}
                renderOption={(option) => (
                    <Typography variant="button" display="block" noWrap>
                        {option[props.optionLabel]}
                    </Typography>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        {...props.TextFieldProps}
                        InputProps={{
                            ...params.InputProps,
                            classes,
                            disableUnderline: true,
                            endAdornment: (
                                <React.Fragment>
                                    {isLoading ? <CircularProgress color="inherit" size={20} style={{marginTop: '-20px'}}/> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                    />
                )}
            />
        )
    }else{
        return (
            <TextField
                {...props.TextFieldProps}
                onChange={(e)=> props.onChange(e.target.value)}
                InputProps={{
                    classes,
                    disableUnderline: true,
                }}
                InputLabelProps={{ shrink: props.value ? true : undefined }}
            />
        )
    }
}