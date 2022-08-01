import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import InputLabel from '@material-ui/core/InputLabel'
import { Select } from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl'
import { REQUEST_METHOD_CONST } from '../../../../model/orest/constants'
import WebCmsGlobal from '../../../webcms-global'
import axios from 'axios'
import { showError } from '../../../../model/notification/actions'
import FormHelperText from '@material-ui/core/FormHelperText'
import useTranslation from 'lib/translations/hooks/useTranslation'

export default function CountrySelect(props) {
    const { id, name, inputLabel, value, onChange, disabled, variant, error, helperText } = props
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const {t} = useTranslation()
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    let clientParams = {}
    clientParams.hotelrefno = loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    if(loginfo && loginfo.hotelgidstr){
        clientParams.hoteltoken = loginfo && loginfo.hotelgidstr
    }

    //state
    const [countries, setCountries] = useState(null)

    useEffect(() => {
        let active = true
        if (active) {
            axios({
                url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/content/info/country',
                method: REQUEST_METHOD_CONST.POST,
                params: clientParams
            })
                .then((r) => {
                    if (active) {
                        if (r.status === 200) {
                            setCountries(r.data.data)
                        }
                    }
                })
                .catch(() => {
                    showError('Something went wrong!')
                })
        }
        return () => {
            active = false
        }
    }, [])

    return (
        <FormControl variant={variant} fullWidth disabled={disabled} error={error}>
            <InputLabel htmlFor={name} shrink={!!value}>
                {inputLabel}
            </InputLabel>
            <Select
                native
                value={value}
                onChange={onChange}
                inputProps={{
                    name: name,
                    id: id,
                }}
            >
                <option aria-label="None" value="" />
                {countries &&
                    countries.map((country, index) => {
                        return (
                            <option key={index} value={country.description}>
                                {t(country.descineng || country.description)}
                            </option>
                        )
                    })}
            </Select>
            <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
    )
}
