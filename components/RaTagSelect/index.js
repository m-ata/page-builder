import React, {useContext, useEffect, useState} from "react";
import {useSelector} from 'react-redux'
import {Chip, TextField} from '@material-ui/core'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import LoadingSpinner from "../LoadingSpinner";
import WebCmsGlobal from "../webcms-global";
import useTranslation from "../../lib/translations/hooks/useTranslation";
import {UseOrest, ViewList} from '@webcms/orest'
import PropTypes from 'prop-types'
import {isErrorMsg, OREST_ENDPOINT} from "../../model/orest/constants";
import {SLASH} from "../../model/globals";
import {useSnackbar} from "notistack";


function RaTagSelect(props) {
    const filter = createFilterOptions();
    const { enqueueSnackbar } = useSnackbar()

    const { value, variant, chipVariant, label, mid, id, name, onLoad, onChange, disabled, required, error, helperText, tableName } = props

    //context
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const hotelRefNo = useSelector((state) => state?.hotelinfo?.currentHotelRefNo || state?.formReducer?.guest?.changeHotelRefno || GENERAL_SETTINGS.HOTELREFNO)


    const [isTagListLoading, setIsTaskListLoading] = useState(false);
    const [isTableTagLoading, setIsTableTagLoading] = useState(false);
    const [tableTagList, setTableTagList] = useState([]);

    useEffect(() => {
        if(tableName) {
            handleGetTableTagList(tableName)
        }
    }, [tableName])


    useEffect(() => {
        if(mid) {
            handleGetTagList(mid)
        }
    }, [mid])

    const handleGetTableTagList = (tableName) => {
        setIsTableTagLoading(true);
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RATAG + SLASH + 'taglist',
            token,
            params: {
                tablename: tableName.toUpperCase(),
                hotelrefno: hotelRefNo,
                limit: 25
            }
        }).then(res => {
            if(res.status === 200) {
                setTableTagList(res.data.data);

            } else {
                const error = isErrorMsg(res);
                enqueueSnackbar(t(error.errMsg), {variant: 'error'});

            }
            setIsTableTagLoading(false);
        })
    }

    const handleGetTagList = (mid) => {
        setIsTaskListLoading(true);
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RATAG,
            token,
            params: {
                query: `masterid:${mid}`,
                hotelrefno: hotelRefNo,
                limit: 1
            }
        }).then(res => {
            setIsTaskListLoading(false);
            if(res.status === 200 && res.data.count > 0) {
                let tempArray = []
                const array = res.data.data[0].tagstr.split(',')
                array.map((item) => {
                    const data = {
                        tagstr: item,
                    }
                    tempArray.push(data);
                })
                onLoad(res.data.data[0], tempArray)
            }
        })
    }

    const handleOnChange = (event, newValue) => {
        onChange(event, newValue)
    }


    return(
        <Autocomplete
            id={id}
            name={name}
            disabled={isTagListLoading || isTableTagLoading || disabled}
            value={value}
            onChange={(event, newValue) => {
                const tagRegex = /"(.*)"/
                let data;
               newValue.map((item, i) => {
                   data = tagRegex.exec(item.tagstr);
                   if(data) {
                       newValue[i].tagstr = data[1]
                   }
               })
                handleOnChange(event, newValue)
            }}
            options={tableTagList}
            getOptionLabel={(option) => option.tagstr}
            filterSelectedOptions
            filterOptions={(options, params) => {
                const filtered = filter(options, params);
                if (params.inputValue !== '') {
                    filtered.push({
                        tagstr: `${t('str_add')} "${params.inputValue}"`,
                    });
                }
                return filtered;
            }}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip variant={chipVariant} label={option.tagstr} {...getTagProps({ index })} />
                ))
            }
            renderInput={(params) => (
                <TextField
                    required={required}
                    error={error}
                    variant={variant}
                    {...params}
                    label={label}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {isTagListLoading || isTableTagLoading ? <LoadingSpinner size={18}/> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                    helperText={helperText}
                />
            )}
            multiple
            freeSolo
        />
    );
}

export default RaTagSelect;

RaTagSelect.defaultProps = {
    variant: 'outlined',
    chipVariant: 'outlined',
    value: [],
    label: '',
    id: 'raTag',
    name: 'raTag'
}

RaTagSelect.propTypes = {
    variant: PropTypes.string,

}