import React, {useContext, useEffect, useState} from 'react'
import {setToState} from "../../../../../../state/actions";
import {connect, useSelector} from "react-redux";
import {Button, Grid, IconButton} from '@material-ui/core'
import renderFormElements, {ELEMENT_TYPES} from "../../../../../render-form-elements";
import useTranslation from "../../../../../../lib/translations/hooks/useTranslation";
import {required} from "../../../../../../state/utils/form";
import Fieldset from "../../../../../../@webcms-ui/core/fieldset";
import Legend from "../../../../../../@webcms-ui/core/legend";
import {DropzoneDialog} from "material-ui-dropzone";
import {makeStyles} from "@material-ui/core/styles";
import { ViewList } from "@webcms/orest";
import DeleteIcon from "@material-ui/icons/Delete";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import {OREST_ENDPOINT, REQUEST_METHOD_CONST, useOrestQuery} from "../../../../../../model/orest/constants";
import WebCmsGlobal from "../../../../../webcms-global";
import axios from "axios";
import LoadingSpinner from "../../../../../LoadingSpinner";
import utfTransliteration from '@webcms-globals/utf-transliteration'

const useStyles = makeStyles(theme => ({
    previewImg: {
        width: 'initial',
        maxWidth: '150px',
        boxShadow: 'rgb(0 0 0 / 12%) 0 1px 6px, rgb(0 0 0 / 12%) 0 1px 4px'
    },
    imageContainer: {
        position: 'relative',
        '&:hover': {
            '& $deleteIconContainer': {
                visibility: 'visible'
            }
        }
    },
    deleteIconContainer: {
        top: -32,
        right: 0,
        position: 'absolute',
        visibility: 'hidden'
    }
}))

function RequestDescStep(props) {
    const classes = useStyles()
        , { state, setToState, getData } = props
        , { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { t } = useTranslation()
        , { transliteration } = utfTransliteration()
        , token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
        , loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false)
        , hotelRefNo = useSelector((state) => state?.formReducer?.guest?.changeHotelRefno || state?.formReducer?.guest?.clientReservation?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO )
        , [openUploadDialog, setOpenUploadDialog] = useState(false)
        , [isLoadingFile, setIsLoadingFile] = useState(false)


    const formElement = [
        {
            type: ELEMENT_TYPES.textField,
            id: 'note',
            name: 'note',
            value: state.requestData?.note?.value || '',
            required: state.requestData?.note?.isRequired,
            error: state.requestData?.note?.isError,
            disabled: state.isSaving,
            onChange: (e) => handleOnChange(e),
            onBlur: (e) => handleOnChange(e, false, true),
            label: t('str_description'),
            helperText: state.requestData?.note?.helperText,
            fullWidth: true,
            variant: 'outlined',
            gridProps: {xs: 12},
            multiLine: true,
            rows: 4,
            rowsMax: 4

        }
    ]

    useEffect( () => {
        if(getData?.mid && state.fileList.length <= 0) {
            setIsLoadingFile(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token,
                params: {
                    query: useOrestQuery({
                        masterid: getData?.mid,
                        isactive: true,
                        insuserid: loginfo?.id
                    }),
                    hotelrefno: hotelRefNo,
                },
            }).then(async (res)=> {
                if(res.status === 200) {
                    const fileList = res?.data?.data
                    if(fileList.length > 0) {
                        const fileObjectArray = []
                        for(let item of fileList) {
                            const downloadResponse = await downloadFile(item?.gid)
                            if(downloadResponse.status === 200) {
                                fileObjectArray.push(downloadResponse?.data)
                            }
                        }
                        setToState(
                            'guest',
                            ['myRequest', 'fileList'],
                            fileObjectArray
                        )
                    }
                    setIsLoadingFile(false)
                } else {
                    setIsLoadingFile(false)
                }
            })
        }
    }, [getData])

    const downloadFile = async (gid) => {
        return axios({
            url: `${GENERAL_SETTINGS.OREST_URL}/tools/file/download`,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            method: REQUEST_METHOD_CONST.GET,
            responseType: 'blob',
            params: {
                gid: gid,
                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
            },
        }).then(res => {
            return res
        })
    }

    const handleOnChange = (event, key, isOnBlur) => {
        const name = key ? key : event.target.name
            , value = event?.target ? transliteration(event.target.value) : event
            , data = {...state.requestData}

        data[name] = isOnBlur ? {
            ...data[name],
            isError: data[name]?.isRequired && !!required(value),
            helperText: data[name]?.isRequired && !!required(value) && t('str_mandatory'),
        } : {
            ...data[name],
            value: value,
            isError: data[name]?.isRequired && !!required(value),
            helperText: data[name]?.isRequired && !!required(value) && t('str_mandatory'),
        }

        setToState('guest', ['myRequest', 'requestData'], data)
    }

    const handleSelectFile = (file) => {
        setToState('guest', ['myRequest', 'fileList'], file)
        setOpenUploadDialog(false)
    }

    const handleRemoveFile = (index) => {
        const list = [...state.fileList]
        list.splice(index, 1)
        setToState('guest', ['myRequest', 'fileList'], list)
    }

    return(
        <React.Fragment>
            <Grid container spacing={3}>
                {
                    formElement.map((item) => (
                        <Grid item {...item.gridProps}>
                            {renderFormElements(item)}
                        </Grid>
                    ))
                }
                <Grid item xs={12}>
                    <Fieldset>
                        <Legend>{t('str_addPhoto')}</Legend>
                        <div style={{textAlign: 'center'}}>
                            <Button
                                color={'primary'}
                                disabled={state.isSaving}
                                endIcon={<OpenInNewIcon />}
                                variant={'contained'}
                                onClick={() => setOpenUploadDialog(true)}
                            >
                                {t('str_pleaseSelectFile')}
                            </Button>
                        </div>
                        <div style={{paddingTop: '32px', pointerEvents: state?.isSaving ? 'none' : 'unset'}}>
                            {
                                isLoadingFile ? (
                                    <LoadingSpinner size={24}/>
                                ) : (
                                    <Grid container spacing={3}>
                                        {state.fileList.length > 0 && state.fileList.map((item, index) => {
                                            const blob = new Blob([item], {type: item.type})
                                            const url = URL.createObjectURL(blob)
                                            return(
                                                <Grid item>
                                                    <div className={classes.imageContainer}>
                                                        <div className={classes.deleteIconContainer}>
                                                            <IconButton onClick={() => handleRemoveFile(index)} style={{color: 'red'}}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </div>
                                                        <img className={classes.previewImg} src={url} width={'100%'} height={'100px'} />
                                                    </div>
                                                </Grid>
                                            )
                                        })}
                                    </Grid>
                                )
                            }
                        </div>
                    </Fieldset>
                </Grid>
            </Grid>
            <DropzoneDialog
                open={openUploadDialog}
                onSave={(file) => handleSelectFile(file)}
                acceptedFiles={[
                    'image/jpeg',
                    'image/png',
                    'image/bmp',
                    'image/gif',
                    'video/mp4',
                ]}
                showPreviews={true}
                filesLimit={3}
                maxFileSize={5000000}
                onClose={() => setOpenUploadDialog(false)}
                submitButtonText={t('str_save')}
                cancelButtonText={t('str_cancel')}
                dialogTitle={t('str_uploadAFile')}
            />
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest.myRequest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RequestDescStep)