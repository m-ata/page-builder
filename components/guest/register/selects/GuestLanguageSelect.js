import React, {useEffect, useState, useContext} from "react";
import {
    FormControl,
    InputLabel,
    Select,
} from '@material-ui/core'
import WebCmsGlobal from "../../../webcms-global";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import { useSelector } from 'react-redux'
import { ViewList } from '@webcms/orest'
import {useSnackbar} from 'notistack'
import {isErrorMsg} from "../../../../model/orest/constants";


function GuestLanguageSelect(props) {
    const { id, name, value, variant, disabled, error, required, onChange, inputLabel } = props

    const { enqueueSnackbar } = useSnackbar()

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO);

    //state
    const [languageList, setLanguageList] = useState([]);

    useEffect(() => {
        let active = true
        if (active) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL ,
                endpoint: 'ralang',
                token,
                params: {
                    query: 'isactive:true',
                    hotelrefno: hotelRefNo,

                }
            }).then((r) => {
                if (active) {
                    if (r.status === 200) {
                        setLanguageList(r.data.data)
                    } else {
                        const error = isErrorMsg(r)
                        enqueueSnackbar(t(error.errorMsg), {variant: 'error'});
                    }
                }
            })
        }
        return () => {
            active = false
        }
    }, [])


    return(
        <FormControl variant={variant} fullWidth disabled={disabled} error={error} required={required || false}>
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
                {languageList &&
                languageList.map((language, index) => {
                    return (
                        <option key={index} value={language.id}>
                            {language.description}
                        </option>
                    )
                })}
            </Select>
        </FormControl>
    );
}

export default GuestLanguageSelect