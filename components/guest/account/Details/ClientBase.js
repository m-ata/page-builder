import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import * as global from '@webcms-globals'
import { helper } from '@webcms-globals'
import { makeStyles } from '@material-ui/core/styles'
import SelectAutoComplete from '@webcms-ui/core/select-autocomplete'
import FileUploadAndShow from '@webcms-ui/core/file-upload-and-show'
import SignerPad from '@webcms-ui/core/signer-pad'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import stylesTabPanel from '../style/TabPanel.style'
import { required } from 'state/utils/form'
import { emailValidation, mobileTelNoFormat, OREST_ENDPOINT, TRANSTYPES } from 'model/orest/constants'
import PhoneInput from '@webcms-ui/core/phone-input'
import TabHeader from 'components/layout/components/TabHeader'
import { Button, Grid, Icon, TextField } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import { DatePicker, LocalizationProvider } from '@material-ui/pickers'
import moment from 'moment'
import MomentAdapter from '@date-io/moment'
import {
    fieldGroupAccordions,
    fieldGroups,
    otherGuestMandatoryFields,
    primaryGuestMandatoryFields,
} from './clientInitialState'
import RoomSelection from './RoomSelection'
import CheckInConfirmation from './CheckInConfirmation'
import OtherGuests from './OtherGuests'
import { Insert, List, Patch, UseOrest, ViewList } from '@webcms/orest'
import { useSnackbar } from 'notistack'
import FrameCheckbox from '@webcms-ui/core/frame-checkbox'
import { sendGuestChangeNotifyMail } from '../Base/helper'
import { useOrestAction } from 'model/orest'
import { fieldOptions, fieldTypes } from 'constants/form-elements'
import { employeeFieldGroups, employeeMandatoryFields } from 'components/emp-portal/employeeInitialState'
import LoadingSpinner from 'components/LoadingSpinner'
import { useRouter } from 'next/router'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import utfTransliteration from '@webcms-globals/utf-transliteration'

const useStylesTabPanel = makeStyles(stylesTabPanel())

const ClientBase = ({ isPrimaryGuest, useClientInitialState, setUseClientInitialState, useClientOrestState, useClientReservation, usePrimaryClientReservation, isEmpPortal, isGuest }) =>{
    const router = useRouter()
        , { t } = useTranslation()
        , { transliteration } = utfTransliteration()
        , classesTabPanel = useStylesTabPanel()
        , { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
        , fieldGroupArray = isEmpPortal ? employeeFieldGroups : fieldGroups

    const useHotelWorkDateTime = useSelector((state) => state?.orest?.state?.hotelWorkDateTime || false)
        , useToken = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false)
        , useOtherGuestResname = useSelector((state) => state?.orest?.currentUser?.otherGuestResname || false)
        , { enqueueSnackbar } = useSnackbar()
        , { setOrestState } = useOrestAction()

    //For Component
    const [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
        , [isUpdating, setIsUpdating] = useState(true)
        , [isCheckinConfirmationDialog, setIsCheckinConfirmationDialog] = useState(false)
        , [isRoomSelectionDialog, setIsRoomSelectionDialog] = useState(false)
        , [isOtherGuestsDialog, setIsOtherGuestsDialog] = useState(false)
        , [usePrivacyTransactions, setUsePrivacyTransactions] = useState({
        datapolicy: {
            value: isPrimaryGuest && !useOtherGuestResname,
            isRequired: true,
            isUpdate: false
        },
        pref: {
            value: isPrimaryGuest && !useOtherGuestResname,
            isRequired: true,
            isUpdate: false
        },
    })

    useEffect(() => {
        let isEffect = true
        if (isEffect && useClientOrestState && !isInitialStateLoad) {
            const newClientInitialState = helper.objectMapper(useClientInitialState, useClientOrestState, getMandatoryFields(GENERAL_SETTINGS.hotelSettings.cireqflds))
            setUseClientInitialState(newClientInitialState)
            setIsInitialStateLoad(true)
            setIsUpdating(false)
        }

        return () => {
            isEffect = false
        }
    }, [useClientOrestState])

    useEffect(() => {
        let isEffect = true

        if (isEffect && isInitialStateLoad && GENERAL_SETTINGS?.hotelSettings?.cireqsign && (useClientReservation || useOtherGuestResname)) {
            setUseClientInitialState({
                ...useClientInitialState,
                [useClientInitialState.signature.key]: {
                    ...useClientInitialState[useClientInitialState.signature.key],
                    isRequired: true
                },
            })
        }

        return () => {
            isEffect = false
        }
    }, [isInitialStateLoad])

    const getEmOrTelFieldCheck = (useMandatoryFields) => {
        if (GENERAL_SETTINGS?.hotelSettings?.profileemortelok) {
            if ((router?.query?.telno || router?.query?.mobile) && !router?.query?.email) {
                const itemIndex = useMandatoryFields.indexOf('email')
                if (itemIndex >= 0) {
                    useMandatoryFields.splice(itemIndex, 1)
                }
            } else if (router?.query?.email && (!router?.query?.telno && !router?.query?.mobile)) {
                const itemIndex = useMandatoryFields.indexOf('mobiletel')
                if (itemIndex >= 0) {
                    useMandatoryFields.splice(itemIndex, 1)
                }
            }
        }

        return useMandatoryFields
    }

    const getMandatoryFields = (settMandatoryFields) => {
        let defaultMandatoryFields = !isPrimaryGuest || useOtherGuestResname ? otherGuestMandatoryFields : isEmpPortal ? employeeMandatoryFields : primaryGuestMandatoryFields
        if (GENERAL_SETTINGS?.hotelSettings?.regbirthdate) {
            defaultMandatoryFields.push(useClientInitialState.birthdate.key)
        }

        if (settMandatoryFields) {
            const getCiReqFlds = helper.makeArrayWithComma(settMandatoryFields)
            if (Array.isArray(getCiReqFlds)) {
                defaultMandatoryFields = [...new Set([...defaultMandatoryFields, ...getCiReqFlds])]
                return getEmOrTelFieldCheck(defaultMandatoryFields)
            } else {
                return getEmOrTelFieldCheck(defaultMandatoryFields)
            }
        } else {
            return getEmOrTelFieldCheck(defaultMandatoryFields)
        }
    }

    const createClientLoginId = (clientId) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/loginid',
            method: 'PUT',
            token: useToken,
            params: {
                id: clientId,
                pref: true,
                datapolicy: true,
                force: true
            }
        }).then((clientLoginIdResponse) => {
            return !!(clientLoginIdResponse.status === 200 && clientLoginIdResponse?.data?.data)
        }).catch(() => {
            return false
        })
    }

    const clientPatch = (clientData, clientGid) => {
        return Patch({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: isEmpPortal ? OREST_ENDPOINT.EMPLOYEE :  OREST_ENDPOINT.CLIENT,
            token: useToken,
            gid: clientGid,
            params: {
                hotelrefno: useClientOrestState.hotelrefno
            },
            data: clientData,
        }).then((clientPatchResponse) => {
            if (clientPatchResponse.status === 200 && clientPatchResponse?.data?.data) {
                return clientPatchResponse.data.data
            }else{
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const clientView = (clientPatch) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: isEmpPortal ? 'employee/view/get' : 'client/view/get',
            token: useToken,
            params: {
                gid: clientPatch.gid,
                chkselfish: false,
                allhotels: true
            },
        }).then((clientViewGetResponse) => {
            if (clientViewGetResponse.status === 200 && clientViewGetResponse?.data?.data) {
                return clientViewGetResponse.data.data
            }else{
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const clientInfoUpdate = async (clientData, clientGid) => {
        const isClientPatch = await clientPatch(clientData, clientGid)
        if(isClientPatch && isPrimaryGuest){
            return await clientView(isClientPatch)
        }else return !!isClientPatch
    }

    const getOnChangeValue = (type, value, isRequired) => {
        switch (type) {
            case fieldTypes.date:
                const newValue = moment(value).format(OREST_ENDPOINT.DATEFORMAT)
                return {
                    value: newValue,
                    isError: newValue === 'Invalid date',
                    errorText: newValue === 'Invalid date' ? `*${t('str_invalidDate')}` : false,
                    isRequired: isRequired
                }
            default:
                return {
                    value: value,
                    isError: isRequired && !!required(value),
                    errorText: isRequired && !!required(value),
                    isRequired: isRequired
                }
        }
    }

    const handleOnChangeCallBack = (key, useData) => {
        switch (key) {
            case useClientInitialState.maritalstatus.key:
                const isVisible = !!(useData?.value && useData?.value[useClientInitialState.maritalstatus.defValKey] === TRANSTYPES.MARRIED)
                setUseClientInitialState({
                    ...useClientInitialState,
                    [key]: {
                        ...useClientInitialState[key],
                        value: useData.value,
                        isError: useData.isError,
                        isRequired: useData.isRequired,
                        errorText: useData.errorText,
                    },
                    [useClientInitialState.weddingdate.key]: {
                        ...useClientInitialState[useClientInitialState.weddingdate.key],
                        isVisible: isVisible
                    },
                })
               return true
            case useClientInitialState.nationid.key:
                const isActive = !!(useData?.value && useData?.value?.reqtrid)
                setUseClientInitialState({
                    ...useClientInitialState,
                    [key]: {
                        ...useClientInitialState[key],
                        value: useData.value,
                        isError: useData.isError,
                        isRequired: useData.isRequired,
                        errorText: useData.errorText,
                    },
                    [useClientInitialState.tridno.key]: {
                        ...useClientInitialState[useClientInitialState.tridno.key],
                        isVisible: isActive,
                        isRequired: isActive && useClientInitialState.nationid.isRequired
                    },
                    [useClientInitialState.healthcode.key]: {
                        ...useClientInitialState[useClientInitialState.healthcode.key],
                        isVisible: isActive && GENERAL_SETTINGS.hotelSettings.reghealthcode,
                        isRequired: isActive && useClientInitialState.healthcode.isRequired
                    },
                    [useClientInitialState.idtypeid.key]: {
                        ...useClientInitialState[useClientInitialState.idtypeid.key],
                        isVisible: !isActive,
                        isRequired: !isActive && useClientInitialState.nationid.isRequired
                    },
                    [useClientInitialState.idno.key]: {
                        ...useClientInitialState[useClientInitialState.idno.key],
                        isVisible: !isActive,
                        isRequired: !isActive && useClientInitialState.nationid.isRequired
                    }
                })
                return true
            case useClientInitialState.email.key:
                setUseClientInitialState({
                    ...useClientInitialState,
                    [key]: {
                        ...useClientInitialState[key],
                        value: useData.value,
                        isError: useData.isError,
                        errorText: useData.errorText
                    },
                    [useClientInitialState.mobiletel.key]: {
                        ...useClientInitialState[useClientInitialState.mobiletel.key],
                        isError: false,
                        errorText: '',
                        isRequired: !useOtherGuestResname && GENERAL_SETTINGS.hotelSettings.profileemortelok ? !useData.value : useClientInitialState.mobiletel.isRequired,
                    }
                })
                return true
            case useClientInitialState.mobiletel.key:
                setUseClientInitialState({
                    ...useClientInitialState,
                    [key]: {
                        ...useClientInitialState[key],
                        value: useData.value,
                        isError: useData.isError,
                        errorText: useData.errorText
                    },
                    [useClientInitialState.email.key]: {
                        ...useClientInitialState[useClientInitialState.email.key],
                        isError: false,
                        errorText: '',
                        isRequired: !useOtherGuestResname && GENERAL_SETTINGS.hotelSettings.profileemortelok ? !useData.value : useClientInitialState.email.isRequired,
                    }
                })
                return true
            default:
                return false
        }
    }

    const handleOnChange = (key, value, type = 'text') => {
        const useData = getOnChangeValue(type, value, useClientInitialState[key].isRequired)
        const isCallback = handleOnChangeCallBack(key, useData)
        if (!isCallback) {
            setUseClientInitialState({
                ...useClientInitialState,
                [key]: {
                    ...useClientInitialState[key],
                    value: useData.value,
                    isError: useData.isError,
                    isRequired: useData.isRequired,
                    errorText: useData.errorText,
                },
            })
        }
    }

    const getFormComponent = (field) => {
        switch (field.type) {
            case fieldTypes.trid:
            case fieldTypes.email:
            case fieldTypes.text:
                return (
                    <TextField
                        id={field.key}
                        name={field.key}
                        label={t(field.label)}
                        required={field.isRequired}
                        disabled={isUpdating}
                        fullWidth={fieldOptions.fullWidth.textField}
                        size={fieldOptions.size.textField}
                        variant={fieldOptions.variant.textField}
                        value={field.value}
                        onChange={(e) => handleOnChange(field.key, e.target.value)}
                        error={field.isError}
                        helperText={field.isError && field.errorText}
                        onBlur={field.isVerifyRequired ? () => handleOnVerify(field.key, field.value, field.type) : undefined}
                    />
                )
            case fieldTypes.select:
                return (
                    <SelectAutoComplete
                        required={field.isRequired}
                        label={t(field.label)}
                        isInitialStateLoad={isInitialStateLoad}
                        disabled={isUpdating}
                        id={field.key}
                        name={field.key}
                        selectApi={field.selectApi}
                        value={field.value}
                        error={field.isError}
                        variant={fieldOptions.variant.textField}
                        onCallback={(newValue) => handleOnChange(field.key, newValue)}
                        onChange={(newValue) => handleOnChange(field.key, newValue)}
                        optionLabel={field.optionLabel}
                        optionKey={field.optionKey}
                        defValKey={field.defValKey}
                        defValue={field.defValKey && field.value || false}
                        trgValKey={field.trgValKey}
                        trgQueryKey={field.trgQueryKey}
                        trgValue={field.trgValue && useClientInitialState[field.trgValue].value || false}
                    />
                )
            case fieldTypes.tel:
                return (
                    <PhoneInput
                        defaultCountry={locale === 'en' ? 'us': locale}
                        preferredCountries={['it', 'ie', 'de', 'fr', 'es', 'gb']}
                        regions={['america', 'europe', 'asia', 'oceania', 'africa',]}
                        id={field.key}
                        name={field.key}
                        label={t(field.label)}
                        required={field.isRequired}
                        disabled={isUpdating}
                        fullWidth={fieldOptions.fullWidth.textField}
                        size={fieldOptions.size.textField}
                        variant={fieldOptions.variant.textField}
                        value={field.value}
                        onChange={(newValue) => handleOnChange(field.key, newValue)}
                        error={field.isError}
                        helperText={field.isError && field.errorText}
                        onBlur={field.isVerifyRequired ? () => handleOnVerify(field.key, field.value, field.type) : undefined}
                    />
                )
            case fieldTypes.date:
                return (
                    <LocalizationProvider dateLibInstance={moment} dateAdapter={MomentAdapter}>
                        <DatePicker
                            required={field.isRequired}
                            allowKeyboardControl
                            disabled={isUpdating}
                            autoOk
                            id={field.key}
                            name={field.key}
                            label={t(field.label)}
                            inputFormat={fieldOptions.dateFormatForView}
                            disableFuture
                            openTo={'date'}
                            views={['year', 'month', 'date']}
                            value={field.value || null}
                            onChange={(newValue) => handleOnChange(field.key, newValue, field.type)}
                            renderInput={(props) => {
                                return (
                                    <TextField
                                        {...props}
                                        fullWidth={fieldOptions.fullWidth.textField}
                                        size={fieldOptions.size.textField}
                                        variant={fieldOptions.variant.textField}
                                        required={field.isRequired}
                                        error={field.isError}
                                        helperText={field.isError && field.errorText}
                                    />
                                )
                            }}
                        />
                    </LocalizationProvider>
                )
            case fieldTypes.upload:
                return (
                    <FileUploadAndShow
                        id={field.key}
                        name={field.key}
                        label={t(field.label)}
                        required={field.isRequired}
                        disabled={!useClientOrestState || isUpdating || !useClientOrestState.id}
                        fullWidth={fieldOptions.fullWidth.textField}
                        size={fieldOptions.size.textField}
                        variant={fieldOptions.variant.textField}
                        error={field.isError}
                        helperText={field.isError && field.errorText}
                        optionKey={field.optionKey}
                        defValKey={field.defValKey}
                        defValue={field.defValKey && useClientOrestState[field.defValKey]}
                        trgQueryKey={field.defValKey && useClientOrestState[field.trgQueryKey]}
                    />
                )
            case fieldTypes.sign:
                return(
                    <SignerPad
                        id={field.key}
                        name={field.key}
                        label={t(field.label)}
                        required={field.isRequired}
                        disabled={isUpdating}
                        fullWidth={fieldOptions.fullWidth.textField}
                        size={fieldOptions.size.textField}
                        variant={fieldOptions.variant.textField}
                        error={field.isError}
                        helperText={field.isError && field.errorText}
                        optionLabel={field.optionLabel}
                        optionKey={field.optionKey}
                        defValKey={field.defValKey}
                        defValue={field.defValKey && useOtherGuestResname ? useOtherGuestResname[field.defValKey] : useClientReservation[field.defValKey]}
                        trgQueryKey={field.defValKey && useOtherGuestResname ? useOtherGuestResname[field.trgQueryKey] : useClientReservation[field.trgQueryKey]}
                        onUpdateCallBack={()=> {
                            setUseClientInitialState({
                                ...useClientInitialState,
                                [useClientInitialState.signature.key]: {
                                    ...useClientInitialState[useClientInitialState.signature.key],
                                    isError: false,
                                    errorText: ''
                                },
                            })
                        }}
                    />
                )
            default:
                return
        }
    }

    const handleOnVerify = (key, value, type) => {
        switch (type) {
            case fieldTypes.email:
                isEmailExists(key, value)
                break
            case fieldTypes.tel:
                isPhoneExists(key, value)
                break
            case fieldTypes.trid:
                isTrIdValid(key, value)
                break
            default:
                return false
        }
    }

    const isCheckInDay = () =>{
        return !useOtherGuestResname && useClientReservation && useHotelWorkDateTime.workdate === useClientReservation.checkin
    }

    const isRoomSelectionPossible = () => {
        return !useOtherGuestResname && useClientReservation && useClientReservation.canroom && !useClientReservation.roomno && GENERAL_SETTINGS.hotelSettings.roomno
    }

    const isReservationStatusAccepted = () => {
        const acceptedStatus = ['A', 'I']
        return !useOtherGuestResname && usePrimaryClientReservation && acceptedStatus.includes(usePrimaryClientReservation.status)
    }

    const isCheckInPossible = () => {
        if(useClientReservation && !useClientReservation.canroom && !useClientReservation.roomno && GENERAL_SETTINGS.hotelSettings.roomno){
            return false
        }
        return !useOtherGuestResname && useClientReservation && useClientReservation.canci && isCheckInDay() && GENERAL_SETTINGS.hotelSettings.cienable
    }

    const isEmailExists = (key, val) => {
        if (val) {
            if(emailValidation(val)){
                setIsUpdating(true)
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'client/email/exists',
                    token: useToken,
                    params: {
                        email: val,
                        allhotels: true
                    },
                }).then((response) => {
                    if (response.status === 200 && response?.data?.data?.res) {
                        if (useClientOrestState?.id !== response.data.data.id) {
                            setUseClientInitialState({
                                ...useClientInitialState,
                                [key]: {
                                    ...useClientInitialState[key],
                                    isError: true,
                                    errorText: t('str_emailAlreadyExist'),
                                },
                            })
                        }
                        setIsUpdating(false)
                        return true
                    } else {
                        setIsUpdating(false)
                        return false
                    }
                }).catch(() => {
                    setIsUpdating(false)
                    return false
                })
            }else{
                setUseClientInitialState({
                    ...useClientInitialState,
                    [key]: {
                        ...useClientInitialState[key],
                        isError: true,
                        errorText: t('str_invalidEmail'),
                    },
                })
            }
        }
    }

    const isPhoneExists = (key, val) => {
        if(String(val).length > 5){
            setIsUpdating(true)
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'client/phone/exists',
                token: useToken,
                params: {
                    tel: mobileTelNoFormat(val),
                    allhotels: true
                },
            }).then((response) => {
                if (response.status === 200 && response?.data?.data?.res) {
                    if(useClientOrestState?.id !== response.data.data.id){
                        setUseClientInitialState({
                            ...useClientInitialState,
                            [key]: {
                                ...useClientInitialState[key],
                                isError: true,
                                errorText: t('str_mobileAlreadyExist'),
                            },
                        })
                    }
                    setIsUpdating(false)
                    return true
                } else {
                    setIsUpdating(false)
                    return false
                }
            }).catch(() => {
                setIsUpdating(false)
                return false
            })
        }
    }

    const isTrIdValid = (key, val) => {
        if(val){
            setIsUpdating(true)
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: 'tools/validate/tridno',
                token: useToken,
                params: {
                    idno: val,
                    allhotels: true
                },
            }).then((response) => {
                if (response.status === 200 && response?.data?.data?.res) {
                    setIsUpdating(false)
                    return true
                } else {
                    setUseClientInitialState({
                        ...useClientInitialState,
                        [key]: {
                            ...useClientInitialState[key],
                            isError: true,
                            errorText: t('str_pleaseEnterAValidTRIdNo'),
                        },
                    })
                    setIsUpdating(false)
                    return false
                }
            }).catch(() => {
                setIsUpdating(false)
                return false
            })
        }
    }

    const getNotecatDataself = (hotelrefno) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'notecat/dataself',
            token: useToken,
            params: {
                hotelrefno: hotelrefno
            }
        }).then((response) => {
            if (response.status === 200 && response.data && response.data.data.res) {
                return response.data.data.res
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const getNotetypeData = (hotelrefno) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'notetype/data',
            token: useToken,
            params: {
                hotelrefno: hotelrefno
            }
        }).then((response) => {
            if (response.status === 200 && response.data && response.data.data.res) {
                return response.data.data.res
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const defNoteData = (hotelrefno) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'ranote/def',
            token: useToken,
            params: {
                hotelrefno: hotelrefno
            }
        }).then((response) => {
            if (response.status === 200 && response.data && response.data.data) {
                return response.data.data
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const setNoteData = (data, hotelrefno) => {
        return Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'ranote',
            token: useToken,
            params: {
                hotelrefno: hotelrefno
            },
            data
        }).then((response) => {
            return response.status === 200 && response.data && response.data.data;
        }).catch(() => {
            return false
        })
    }

    const handleRequestProfileInfoChange = async (clientDataDifferences) => {
        let noteValue = ''
        clientDataDifferences.map((item) => noteValue += `${item.label}: ${item.oldval} >>> ${item.newval};;;`)

        const noteCatDataselfId = await getNotecatDataself(useClientOrestState.hotelrefno)
        const noteTypeDataId = await getNotetypeData(useClientOrestState.hotelrefno)

        let getDefaultNote = await defNoteData(useClientOrestState.hotelrefno)
        getDefaultNote.notecatid = noteCatDataselfId
        getDefaultNote.notetypeid = noteTypeDataId
        getDefaultNote.note = noteValue
        getDefaultNote.masterid = useClientOrestState.mid

        return await setNoteData(getDefaultNote, useClientOrestState.hotelrefno)
    }

    const isSignatureAvailable = async (code, mid) => {
        return List({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: useToken,
            params: {
                query: `code::${code},masterid::${mid}`,
                limit: 1,
                allhotels: true,
            },
        }).then((rafileListResponse) => {
            return rafileListResponse.status === 200 && rafileListResponse?.data?.data.length > 0
        }).catch(() => {
            return false
        })
    }

    const sendHotelNotifyMail = async (changes) => {
        return await sendGuestChangeNotifyMail(
            'client',
            'upd',
            useClientOrestState.id,
            useClientOrestState.gid,
            useClientReservation.gid,
            useClientReservation.reservno,
            {
                roomno: isReservationStatusAccepted() && usePrimaryClientReservation?.roomno || '',
                clientname: transliteration(useClientOrestState.clientname) || '',
                reservno: isReservationStatusAccepted() && usePrimaryClientReservation?.reservno || '',
                changes: JSON.stringify({ changeItems: changes }),
            },
            GENERAL_SETTINGS.HOTELREFNO,
        )
    }

    const primaryGuestRequiredFieldCheck = async () => {
        if(!usePrivacyTransactions.datapolicy.value || !usePrivacyTransactions.pref.value){
            enqueueSnackbar(t('str_pleaseCheckMandatoryFields'), { variant: 'warning' })
            setIsUpdating(false)
            return false
        }

        let isRequiredFieldMistake = false
        const newUseClientInitialState = {...useClientInitialState}

        for (let key of Object.keys(newUseClientInitialState)) {
            const getField = newUseClientInitialState[key]
            if (getField.isBase && getField.isRequired && !getField.value || getField.isError) {
                isRequiredFieldMistake = true
                newUseClientInitialState[key].isError = true
            }
        }

        if (useClientInitialState.signature.isRequired) {
            const signatureAvailable = await isSignatureAvailable(useClientInitialState.signature.optionKey,  useOtherGuestResname ? useOtherGuestResname[useClientInitialState.signature.defValKey] : useClientReservation[useClientInitialState.signature.defValKey])
            if (!signatureAvailable) {
                isRequiredFieldMistake = true
                newUseClientInitialState[useClientInitialState.signature.key].isError = true
            }
        }

        if(isRequiredFieldMistake){
            enqueueSnackbar(t('str_pleaseCheckMandatoryFields'), { variant: 'warning' })
            setUseClientInitialState(newUseClientInitialState)
            setIsUpdating(false)
            return false
        }

        return true
    }

    const getOtherGuestsClientIdList = (reservno) => {
        return ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RESNAME,
            token: useToken,
            params: {
                query: `reservno:${reservno}`,
                allhotels: true,
            },
        }).then((resnameResponse) => {
            if (resnameResponse.status === 200 && resnameResponse?.data?.data && resnameResponse?.data?.data.length > 0) {
                return resnameResponse.data.data.map((resname) => resname.clientid)
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const getOtherGuestsClientList = (otherGuestsClientIdList) => {
        return UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'client/view/list/get/id',
            method: 'POST',
            token: useToken,
            params: {
                allhotels: true,
            },
            data: otherGuestsClientIdList,
        }).then((clientViewListGetIdResponse) => {
            if (clientViewListGetIdResponse.status === 200 && clientViewListGetIdResponse?.data?.data) {
                return clientViewListGetIdResponse.data.data
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const otherGuestRequiredFieldCheck = async (numberOfOtherGuest) => {
        const otherGuestsClientIdList = await getOtherGuestsClientIdList(useClientReservation.reservno)
        const otherGuestsClientList = await getOtherGuestsClientList(otherGuestsClientIdList)

        if (GENERAL_SETTINGS.hotelSettings.cichkallcards && otherGuestsClientList && otherGuestsClientList.length !== numberOfOtherGuest) {
            enqueueSnackbar(t('str_otherGuestsInformationIsMandatoryPleaseCheckOtherGuestInformationAndFillInTheRequiredFields'), { variant: 'warning' })
            setIsOtherGuestsDialog(true)
            return false
        }

        let isRequiredFieldMistake = false
        otherGuestsClientList.map((otherGuest) => {
            if (!otherGuest.firstname || !otherGuest.lastname || !otherGuest.birthdate || !otherGuest.nationid || !otherGuest.idno && !otherGuest.tridno) {
                isRequiredFieldMistake = true
            }
        })

        if (GENERAL_SETTINGS.hotelSettings.cichkallcards && isRequiredFieldMistake) {
            enqueueSnackbar(t('str_otherGuestsInformationIsMandatoryPleaseCheckOtherGuestInformationAndFillInTheRequiredFields'), { variant: 'warning' })
            setIsOtherGuestsDialog(true)
            return false
        }

        return true
    }

    const handleClientUpdate = async (showNotificationMessages = true) => {
        setIsUpdating(true)

        const getPrimaryGuestRequiredFieldCheck = await primaryGuestRequiredFieldCheck()
        if(!getPrimaryGuestRequiredFieldCheck){
            return false
        }

        const newClientData = helper.objectValueEqualizer({ obj1: useClientInitialState })
        const newClientDataDifferences = helper.objectDifferences({ obj1: newClientData, obj2: useClientOrestState, labelKeys: useClientInitialState, translate: t, langcode: GENERAL_SETTINGS.hotelLocalLangGCode })

        if(newClientDataDifferences.length > 0 || usePrivacyTransactions.pref.isUpdate || usePrivacyTransactions.datapolicy.isUpdate) {
            if (GENERAL_SETTINGS.hotelSettings.profileupdate || isEmpPortal) {
                const isClientInfoUpdate = await clientInfoUpdate(newClientData, useClientOrestState.gid)
                if(!isEmpPortal) {
                    if (useOtherGuestResname) {
                        await createClientLoginId(useClientOrestState.id)
                    }
                    if(useClientOrestState && useClientOrestState?.id){
                        await sendHotelNotifyMail(newClientDataDifferences)
                    }
                }
                setUsePrivacyTransactions({
                    ...usePrivacyTransactions,
                    datapolicy: { ...usePrivacyTransactions.datapolicy, isUpdate: false },
                    pref: { ...usePrivacyTransactions.pref, isUpdate: false }
                })
                if (isClientInfoUpdate) {
                    if (isPrimaryGuest) {
                        setOrestState([isEmpPortal ? 'emp' : 'client'], isClientInfoUpdate)
                    }
                    if(showNotificationMessages){
                        enqueueSnackbar(t('str_clientInfoUpdateSuccess'), { variant: 'success' })
                    }
                    setIsUpdating(false)
                    return true
                } else {
                    if(showNotificationMessages){
                        enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                    }
                    setIsUpdating(false)
                    return false
                }
            } else {
                if(useClientOrestState && useClientOrestState.mid){
                    const isRequestProfileInfoSave = await handleRequestProfileInfoChange(newClientDataDifferences)
                    await sendHotelNotifyMail(newClientDataDifferences)
                    setUsePrivacyTransactions({
                        ...usePrivacyTransactions,
                        datapolicy: { ...usePrivacyTransactions.datapolicy, isUpdate: false },
                        pref: { ...usePrivacyTransactions.pref, isUpdate: false }
                    })
                    if (isRequestProfileInfoSave) {
                        if(showNotificationMessages){
                            enqueueSnackbar(t('str_contactMailSendMsg'), { variant: 'success' })
                        }
                        setIsUpdating(false)
                        return true
                    } else {
                        if(showNotificationMessages){
                            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'warning' })
                        }
                        setIsUpdating(false)
                        return false
                    }
                } else {
                    enqueueSnackbar(t('str_clientRecordNotFound'), { variant: 'warning' })
                    setIsUpdating(false)
                    return true
                }
            }
        }else{
            if(showNotificationMessages){
                enqueueSnackbar(t('str_noChangesYet'), { variant: 'warning' })
            }
            setIsUpdating(false)
            return false
        }
    }

    const getNumberOfOtherGuest = (useClientReservation) => {
        return Number((useClientReservation.totalpax + useClientReservation.totalchd) - 1)
    }

    const handleCheckinConfirmationDialog = async () => {

        if(isRoomSelectionPossible() && GENERAL_SETTINGS.hotelSettings.roomno){
            setIsRoomSelectionDialog(true)
            enqueueSnackbar(t('str_youMustChooseARoomBeforeCheckIn'), { variant: 'warning' })
            return false
        }

        const numberOfOtherGuest = getNumberOfOtherGuest(useClientReservation)
        if(numberOfOtherGuest > 0){
            const getPrimaryGuestRequiredFieldCheck = await primaryGuestRequiredFieldCheck()
            if (!getPrimaryGuestRequiredFieldCheck) {
                return false
            }

            const getOtherGuestRequiredFieldCheck = await otherGuestRequiredFieldCheck(numberOfOtherGuest)
            if (!getOtherGuestRequiredFieldCheck) {
                return false
            }
        }

        await handleClientUpdate(false)
        setIsCheckinConfirmationDialog(true)
        return true
    }

    const [fieldGroupAccordionExpanded, setFieldGroupAccordionExpanded] = useState(false)

    const handleFieldGroupAccordionChange = (panel) => (event, newExpanded) => {
        setFieldGroupAccordionExpanded(newExpanded ? panel : false)
    }

    const useFieldGroupLabel = (label, isGuest) => {
        if (isGuest) {
            switch (label) {
                case 'str_personalInfo':
                    return 'str_guestInfo'
                case 'str_id':
                    return 'str_guestID'
                default :
                    return label
            }
        }

        return label
    }

    return (
        <React.Fragment>
            {isPrimaryGuest && (isRoomSelectionPossible() || isReservationStatusAccepted()) ?
                <Grid className={classesTabPanel.gridContainerToolbar} container spacing={1} direction='row' justify='flex-end' alignItems='center'>
                    {isRoomSelectionPossible() ? (
                        <Grid item style={{marginRight: 'auto'}}>
                            <Alert style={{padding: '0px 10px'}} severity="info" variant="outlined">
                                {isRoomSelectionPossible() && t('str_youMustChooseARoomBeforeCheckIn')}
                            </Alert>
                        </Grid>
                    ): null}
                    {isRoomSelectionPossible() ?
                        <Grid item>
                            <Button
                                className={classesTabPanel.proceedButton}
                                startIcon={<Icon>meeting_room</Icon>}
                                variant='outlined'
                                disableElevation
                                size={fieldOptions.size.button}
                                onClick={() => setIsRoomSelectionDialog(true)}
                            >
                                {t('str_selectRoomToStay')}
                            </Button>
                            <RoomSelection
                                confirmClassName={classesTabPanel.proceedButton}
                                open={isRoomSelectionDialog}
                                onClose={()=> setIsRoomSelectionDialog(false)}
                                useClientOrestState={useClientOrestState}
                                useClientReservation={useClientReservation}
                            />
                        </Grid> : null}
                    {(isReservationStatusAccepted() && getNumberOfOtherGuest(useClientReservation) > 0) ?
                        <Grid item>
                            <Button
                                startIcon={<Icon>people</Icon>}
                                variant='outlined'
                                color='primary'
                                disableElevation
                                size={fieldOptions.size.button}
                                onClick={() => setIsOtherGuestsDialog(true)}
                            >
                                {t('str_otherGuests')}
                            </Button>
                            <OtherGuests
                                confirmClassName={classesTabPanel.proceedButton}
                                open={isOtherGuestsDialog}
                                onClose={()=> setIsOtherGuestsDialog(false)}
                                useClientOrestState={useClientOrestState}
                                useClientReservation={useClientReservation}
                                otherGuestRequiredFieldCheck={otherGuestRequiredFieldCheck}
                                isCheckInPossible={isCheckInPossible()}
                                onCallBackCheckInButton={() => handleCheckinConfirmationDialog()}
                            />
                        </Grid> : null}
                </Grid> : null
            }
            {fieldGroupAccordions.map((fieldGroupAccordion, i) => {
                return (
                    <Accordion
                        key={i}
                        expanded={fieldGroupAccordion.defExpand || fieldGroupAccordion.key === fieldGroupAccordionExpanded}
                        onChange={handleFieldGroupAccordionChange(fieldGroupAccordion.key)}
                        style={{
                            marginLeft: 8,
                            marginRight: 8
                        }}
                    >
                        {fieldGroupAccordion.label !== '' ?
                            <AccordionSummary
                                style={{
                                    borderBottom: '1px solid #ebebeba3'
                                }}
                                expandIcon={!fieldGroupAccordion.defExpand ? <ExpandMoreIcon />: null}
                                aria-controls={`${fieldGroupAccordion.key}-content`}
                                id={`${fieldGroupAccordion.key}-header`}
                            >
                                <Typography style={{
                                    textAlign: 'left',
                                    fontSize: 20,
                                    fontWeight: 300,
                                    color: '#2F3434',
                                    lineHeight: 1.2,
                                    paddingTop: 3,
                                }}>
                                    {t(fieldGroupAccordion.label)}
                                </Typography>
                            </AccordionSummary> : null}
                        <AccordionDetails>
                            <Grid item xs={12}>
                                {fieldGroupArray.filter(fieldGroup => fieldGroup.accordionKey === fieldGroupAccordion.key).map((fieldGroup, keyIndex) => {
                                    return (
                                        <React.Fragment key={keyIndex}>
                                            {fieldGroup.labelShow ? <TabHeader title={t(useFieldGroupLabel(fieldGroup.label, isGuest))} /> : null}
                                            <Grid className={classesTabPanel.gridContainer} container spacing={2} direction='row' justify='flex-start' alignItems='center'>
                                                {Object.keys(useClientInitialState).map((fieldItem, keyIndex) => {
                                                    const useField = useClientInitialState[fieldItem]
                                                    const useRequired = fieldGroup.key === useField.groupKey && useField.isVisible
                                                    if (!useClientReservation && useRequired && !useField.isResRequired || useClientReservation && useRequired) {
                                                        return (
                                                            <Grid item xs={useField.gridBreakpoints.xs} sm={useField.gridBreakpoints.sm} md={useField.gridBreakpoints.md} key={keyIndex}>
                                                                {getFormComponent(useField)}
                                                            </Grid>
                                                        )
                                                    }
                                                })}
                                            </Grid>
                                        </React.Fragment>
                                    )
                                })}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                )
            })}
            <Grid className={classesTabPanel.gridContainer} container spacing={1} direction='row' justify='flex-start' alignItems='center' style={{marginTop: 20, marginLeft: 8}}>
                <Grid item xs={12}>
                    <FrameCheckbox
                        disabled={isUpdating}
                        required={usePrivacyTransactions.datapolicy.isRequired}
                        value={usePrivacyTransactions.datapolicy.value}
                        title="str_privacyAndPersonalDataProtectionPolicies"
                        linkText="str_iAcceptDataPolicy"
                        linkTextADesc="str_privacyAndPersonalDataProtectionPolicies"
                        iframePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strDataPolicy}?iframe=true`}
                        isCheck={(e) => setUsePrivacyTransactions({...usePrivacyTransactions, datapolicy: { ...usePrivacyTransactions.datapolicy, value: e, isUpdate: true }})}
                    />
                </Grid>
                {!isEmpPortal && (
                    <Grid item xs={12}>
                        <FrameCheckbox
                            disabled={isUpdating}
                            required={usePrivacyTransactions.pref.isRequired}
                            value={usePrivacyTransactions.pref.value}
                            title="str_hygieneAndTravelPolicies"
                            linkText="str_iAcceptTravelPolicy"
                            linkTextADesc="str_hygieneAndTravelPolicies"
                            ifamePageUrl={GENERAL_SETTINGS.BASE_URL + `info/${locale || global.common.strDefShortLangCode}/${global.guestWeb.strTravelPolicy}?iframe=true`}
                            isCheck={(e) => setUsePrivacyTransactions({...usePrivacyTransactions, pref: { ...usePrivacyTransactions.pref, value: e, isUpdate: true }})}
                        />
                    </Grid>
                )}
            </Grid>
            <Grid className={classesTabPanel.gridContainerToolbar} container spacing={2} direction='row' justify='flex-end' alignItems='center'>
                <Grid item>
                    {isPrimaryGuest && isCheckInPossible() ?
                        <Grid item>
                            <Button
                                disabled={isUpdating || !isCheckInDay()}
                                className={classesTabPanel.proceedButton}
                                startIcon={<Icon>done</Icon>}
                                variant='outlined'
                                disableElevation
                                size={fieldOptions.size.button}
                                onClick={() => handleCheckinConfirmationDialog()}
                            >
                                {t('str_proceedToCheckin')}
                            </Button>
                            <CheckInConfirmation
                                confirmClassName={classesTabPanel.proceedButton}
                                open={isCheckinConfirmationDialog}
                                onClose={()=> setIsCheckinConfirmationDialog(false)}
                                useClientOrestState={useClientOrestState}
                                useClientReservation={useClientReservation}
                            />
                        </Grid> : <Button disabled={isUpdating} variant="contained" color="primary" disableElevation size={fieldOptions.size.button} onClick={() => handleClientUpdate()}><span style={{paddingRight: '4px'}}>{isUpdating && <LoadingSpinner size={18}/>}</span>{t('str_update')}</Button>
                    }
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

export default ClientBase