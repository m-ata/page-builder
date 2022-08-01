import React, {useState, useEffect, useContext} from 'react';
import {Insert, UseOrest, ViewList, Patch, Delete} from "@webcms/orest";
import WebCmsGlobal from "../../../webcms-global";
import {useSelector} from "react-redux";
import {isErrorMsg, mobileTelNoFormat, OREST_ENDPOINT} from "../../../../model/orest/constants";
import {
    Grid,
    Typography,
    Dialog,
    Checkbox, FormControlLabel
} from "@material-ui/core";
import {useSnackbar} from "notistack";
import {SLASH} from "../../../../model/globals";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import renderFormElements, {ELEMENT_TYPES} from "../../../render-form-elements";
import {required} from "../../../../state/utils/form";
import AddDialogActions from "../../../AddDialogActions";
import {LocaleContext} from "../../../../lib/translations/context/LocaleContext";
import LoadingSpinner from "../../../LoadingSpinner";
import {helper} from "../../../../@webcms-globals";
import TrackedChangesDialog from "../../../TrackedChangesDialog";
import TableColumnText from "../../../TableColumnText";
import CustomTable from "../../../CustomTable";
import {EditOutlined} from "@material-ui/icons";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";

const VARIANT = 'outlined'

function Contacts(props) {

    //props
    const {mid, empId} = props

    //snackbar
    const {enqueueSnackbar} = useSnackbar();

    //context
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal)
    const {locale} = useContext(LocaleContext)
    const {t} = useTranslation()


    //redux state
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const hotelRefNo = useSelector((state) => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || false)

    //locale state
    const initialState = {
        contacttypeid: {value: null, isError: false, isRequired: false, helperText: false},
        tel: {value: '', isError: false, isRequired: false, helperText: false},
        email: {value: '', isError: false, isRequired: false, helperText: false},
        mobiletel: {value: '', isError: false, isRequired: false, helperText: false},
        note: {value: '', isError: false, isRequired: false, helperText: false},
        isblack: {value: false, isError: false, isRequired: false, helperText: false},
        title: {value: '', isError: false, isRequired: false, helperText: false},
        address1: {value: '', isError: false, isRequired: false, helperText: false},
        country: {value: '', isError: false, isRequired: false, helperText: false},
        city: {value: '', isError: false, isRequired: false, helperText: false},
        town: {value: '', isError: false, isRequired: false, helperText: false},
        zip: {value: '', isError: false, isRequired: false, helperText: false},
        district: {value: '', isError: false, isRequired: false, helperText: false},
        fullname: {value: '', isError: false, isRequired: false, helperText: false},
    }

    const [isLoadingList, setIsLoadingList] = useState(false)
    const [allHotels, setAllHotels] = useState(false)
    const [contactList, setContactList] = useState([])
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedContactData, setSelectedContactData] = useState(null)
    const [selectedGid, setSelectedGid] = useState(false)
    const [getData, setGetData] = useState(null)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    const [isDef, setIsDef] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [contactData, setContactData] = useState(initialState)
    const [contactDataBase, setContactDataBase] = useState(initialState)
    const [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [emailNotValid, setEmailNotValid] = useState(false);
    const [hasRightData, setHasRightData] = useState(false);
    const [deleteOpenDialog, setDeleteOpenDialog] = useState(false);

    const openTrackDialog = (popupState, gid) => {
        setSelectedGid(gid)
        setDeleteOpenDialog(true)
        popupState.close()
    }

    const formElements = [
        {
            type: ELEMENT_TYPES.textField,
            id: 'fullname',
            name: 'fullname',
            value: contactData.fullname?.value,
            error: contactData.fullname?.isError,
            required: contactData.fullname?.isRequired,
            disabled: isSaving,
            label: t('str_fullName'),
            helperText: contactData.fullname?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12}
        },
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'contacttypeid',
            name: 'contacttypeid',
            value: contactData.contacttypeid?.value || null,
            disabled: isSaving,
            label: t('str_contactType'),
            variant: VARIANT,
            required: contactData.contacttypeid?.isRequired,
            error: contactData.contacttypeid?.isError,
            helperText: contactData.contacttypeid?.helperText,
            onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
            onBlur: (e, name) => handleOnBlurFormElements(e, name),
            onLoad: (initialValue, name) => {
                const data = {...contactData}
                data[name].value = initialValue ? initialValue : null
                setContactData(data)
            },
            endpoint: 'contactype/view/list',
            params: {text: '', limit: 5, field: 'code', query: 'isactive:true', hotelrefno: hotelRefNo},
            initialId: isInitialStateLoad && selectedContactData?.contacttypeid || false,
            showOptionLabel: 'code',
            showOption: 'code',
            searchParam: 'code,description',
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'title',
            name: 'title',
            value: contactData.title?.value,
            error: contactData.title?.isError,
            required: contactData.title?.isRequired,
            disabled: isSaving,
            label: t('str_description'),
            helperText: contactData.title?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12}
        }
    ]

    if (contactData.contacttypeid?.value?.isemail) {
        formElements.push({
            type: ELEMENT_TYPES.textField,
            id: 'email',
            name: 'email',
            value: contactData.email?.value,
            error: contactData.email?.isError,
            required: contactData.email?.isRequired,
            disabled: isSaving,
            label: t('str_email'),
            helperText: contactData.email?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        })
    }

    if (contactData.contacttypeid?.value?.isaddress) {
        formElements.push(
            {
                type: ELEMENT_TYPES.autoComplete,
                id: 'country',
                name: 'country',
                value: contactData.country?.value || null,
                disabled: isSaving,
                label: t('str_country'),
                variant: VARIANT,
                required: contactData.country?.isRequired,
                error: contactData.country?.isError,
                helperText: contactData.country?.helperText,
                onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
                onBlur: (e, name) => handleOnBlurFormElements(e, name),
                onLoad: (initialValue, name) => {
                    const data = {...contactData}
                    data[name].value = initialValue ? initialValue : null
                    setContactData(data)
                },
                endpoint: 'country/view/list',
                params: {text: '', limit: 25, field: 'code'},
                initialId: isInitialStateLoad && selectedContactData?.country || false,
                showOptionLabel: 'descineng',
                showOption: 'descineng',
                searchParam: 'descineng',
                fullWidth: true,
                gridProps: {xs: 12, sm: 6}
            },
            {
                type: ELEMENT_TYPES.autoComplete,
                id: 'city',
                name: 'city',
                value: contactData.city?.value || null,
                disabled: isSaving,
                label: t('str_city'),
                variant: VARIANT,
                required: contactData.city?.isRequired,
                error: contactData.city?.isError,
                helperText: contactData.city?.helperText,
                onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
                onBlur: (e, name) => handleOnBlurFormElements(e, name),
                onLoad: (initialValue, name) => {
                    const data = {...contactData}
                    data[name].value = initialValue ? initialValue : null
                    setContactData(data)
                },
                endpoint: 'city/view/list',
                params: {text: '', limit: 25, field: 'code'},
                initialId: isInitialStateLoad && selectedContactData?.city || false,
                showOptionLabel: 'description',
                showOption: 'description',
                searchParam: 'description',
                fullWidth: true,
                gridProps: {xs: 12, sm: 6}
            },
            {
                type: ELEMENT_TYPES.autoComplete,
                id: 'town',
                name: 'town',
                value: contactData.town?.value || null,
                disabled: isSaving,
                label: t('str_town'),
                variant: VARIANT,
                required: contactData.town?.isRequired,
                error: contactData.town?.isError,
                helperText: contactData.town?.helperText,
                onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
                onBlur: (e, name) => handleOnBlurFormElements(e, name),
                onLoad: (initialValue, name) => {
                    const data = {...contactData}
                    data[name].value = initialValue ? initialValue : null
                    setContactData(data)
                },
                endpoint: 'town/view/list',
                params: {text: '', limit: 25, field: 'code'},
                initialId: isInitialStateLoad && selectedContactData?.town || false,
                showOptionLabel: 'description',
                showOption: 'description',
                searchParam: 'description',
                fullWidth: true,
                gridProps: {xs: 12, sm: 6}
            },
            {
                type: ELEMENT_TYPES.autoComplete,
                id: 'district',
                name: 'district',
                value: contactData.district?.value || null,
                disabled: isSaving,
                label: t('str_district'),
                variant: VARIANT,
                required: contactData.district?.isRequired,
                error: contactData.district?.isError,
                helperText: contactData.district?.helperText,
                onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
                onBlur: (e, name) => handleOnBlurFormElements(e, name),
                onLoad: (initialValue, name) => {
                    const data = {...contactData}
                    data[name].value = initialValue ? initialValue : null
                    setContactData(data)
                },
                endpoint: 'district/view/list',
                params: {text: '', limit: 25, field: 'code'},
                initialId: isInitialStateLoad && selectedContactData?.district || false,
                showOptionLabel: 'description',
                showOption: 'description',
                searchParam: 'description',
                fullWidth: true,
                gridProps: {xs: 12, sm: 6}
            },
            {
                type: ELEMENT_TYPES.textField,
                id: 'zip',
                name: 'zip',
                value: contactData.zip?.value,
                error: contactData.zip?.isError,
                required: contactData.zip?.isRequired,
                disabled: isSaving,
                label: t('str_zip'),
                helperText: contactData.zip?.helperText,
                onChange: (e) => handleOnChangeFormElements(e),
                onBlur: (e) => handleOnBlurFormElements(e),
                variant: VARIANT,
                fullWidth: true,
                gridProps: {xs: 12, sm: 6}
            },
            {
                type: ELEMENT_TYPES.textField,
                id: 'address1',
                name: 'address1',
                value: contactData.address1?.value,
                error: contactData.address1?.isError,
                required: contactData.address1?.isRequired,
                disabled: isSaving,
                label: t('str_address'),
                helperText: contactData.address1?.helperText,
                onChange: (e) => handleOnChangeFormElements(e),
                onBlur: (e) => handleOnBlurFormElements(e),
                variant: VARIANT,
                fullWidth: true,
                gridProps: {xs: 12, sm: 12}
            }
        )
    }

    if (contactData.contacttypeid?.value?.istel) {
        formElements.push(
            {
                type: ELEMENT_TYPES.phoneInput,
                id: 'mobiletel',
                name: 'mobiletel',
                value: contactData.mobiletel?.value,
                required: contactData.mobiletel.isRequired,
                disabled: isSaving,
                error: contactData.mobiletel.isError,
                label: t('str_mobile'),
                helperText: contactData.mobiletel.helperText,
                onChange: (e, name) => handleOnChangeFormElements(e, name),
                onBlur: (e, name) => handleOnBlurFormElements(e, name),
                defaultCountry: locale === 'en' ? 'us' : locale,
                fullWidth: true,
                gridProps: {xs: 12, sm: 6}
            },
            {
                type: ELEMENT_TYPES.phoneInput,
                id: 'tel',
                name: 'tel',
                value: contactData.tel?.value,
                required: contactData.tel.isRequired,
                disabled: isSaving,
                error: contactData.tel.isError,
                label: t('str_tel'),
                helperText: contactData.tel.helperText,
                onChange: (e, name) => handleOnChangeFormElements(e, name),
                onBlur: (e, name) => handleOnBlurFormElements(e, name),
                defaultCountry: locale === 'en' ? 'us' : locale,
                fullWidth: true,
                gridProps: {xs: 12, sm: 6}
            }
        )
    }

    const formElementsNote = [
        {
            type: ELEMENT_TYPES.textField,
            id: 'note',
            name: 'note',
            value: contactData.note?.value,
            error: contactData.note?.isError,
            required: contactData.note?.isRequired,
            disabled: isSaving,
            label: t('str_note'),
            helperText: contactData.note?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            multiLine: true,
            rows: 4,
            rowsMax: 4,
            fullWidth: true,
            gridProps: {xs: 12}
        }
    ]

    const contactColumns = [
        {
            title: t('str_fullName'),
            field: 'fullname',
            render: (props) => <TableColumnText minWidth={150}>{props?.fullname}</TableColumnText>
        },
        {
            title: t('str_tel'),
            field: 'tel',
            render: (props) => <TableColumnText>{props?.tel}</TableColumnText>
        },
        {
            title: t('str_mobile'),
            field: 'mobiletel',
            render: (props) => <TableColumnText minWidth={150}>{props?.mobiletel}</TableColumnText>
        },
        {
            title: t('str_email'),
            field: 'email',
            render: (props) => <TableColumnText minWidth={150}>{props?.email}</TableColumnText>
        },
        {
            title: t('str_address'),
            field: 'address1',
            render: (props) => <TableColumnText minWidth={150}>{props?.address1}</TableColumnText>
        },
        {
            title: t('str_description'),
            field: 'description',
            render: (props) => <TableColumnText minWidth={150}>{props?.title}</TableColumnText>
        },
        {
            title: t('str_note'),
            field: 'note',
            render: (props) => <TableColumnText minWidth={150}>{props?.note}</TableColumnText>
        },
        {
            title: t('str_country'),
            field: 'country',
            render: (props) => <TableColumnText>{props?.country}</TableColumnText>
        },
        {
            title: t('str_city'),
            field: 'city',
            render: (props) => <TableColumnText>{props?.city}</TableColumnText>
        },
        {
            title: t('str_town'),
            field: 'town',
            render: (props) => <TableColumnText>{props?.town}</TableColumnText>
        },
        {
            title: t('str_district'),
            field: 'district',
            render: (props) => <TableColumnText>{props?.district}</TableColumnText>
        },
        {
            title: t('str_zip'),
            field: 'zip',
            render: (props) => <TableColumnText>{props?.zip}</TableColumnText>
        },
        {
            title: t('str_contactType'),
            field: 'contacttypecode',
            render: (props) => <TableColumnText>{props?.contacttypecode}</TableColumnText>
        },
        {
            title: t('str_masterCode'),
            field: 'mastercode',
            render: (props) => <TableColumnText>{props?.mastercode}</TableColumnText>
        },
        {
            title: t('str_accId'),
            field: 'accid',
            headerStyle: {
                textAlign: 'right'
            },
            render: (props) => <TableColumnText textAlign={'right'}>{props?.accid}</TableColumnText>
        },
        {
            title: t('str_empId'),
            field: 'empid',
            headerStyle: {
                textAlign: 'right'
            },
            render: (props) => <TableColumnText textAlign={'right'}>{props?.empid}</TableColumnText>
        },
        {
            title: t('str_id'),
            field: 'id',
            headerStyle: {
                textAlign: 'right'
            },
            render: (props) => <TableColumnText textAlign={'right'}>{props?.id}</TableColumnText>
        },
    ]

    useEffect(() => {
        if (token && mid) {
            getContactList()
        }
        if (token && empId && !hasRightData) {
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.USER + SLASH + OREST_ENDPOINT.HASRIGHT,
                params: {
                    empid: empId,
                    submoduleid: 9921,
                },
                token
            }).then(res => {
                if (res.status === 200) {
                    setHasRightData(res.data.data)
                } else {
                    setHasRightData(false)
                }
            })
        }
    }, [token, mid, empId])


    useEffect(() => {
        let isEffect = true
        if (isEffect && contactData && getData) {
            const newClientInitialState = helper.objectMapper(contactData, getData, ['contacttypeid'])
            setContactData(newClientInitialState)
            setContactDataBase(newClientInitialState)
            setIsInitialStateLoad(true)
        }
        return () => {
            isEffect = false
        }
    }, [getData])

    const handleDeleteItem = (gid) => {
        setIsDeleting(true)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.CONTACT,
            gid: gid,
            token,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            }
        }).then((res) => {
            if (res.status === 200) {
                getContactList()
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
                setIsDeleting(false)
            }
        })
    }

    const getContactList = () => {
        setIsLoadingList(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.CONTACT,
            token,
            params: {
                query: `masterid:${mid}`,
                allhotels: allHotels,
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            setIsLoadingList(false)
            if (res.status === 200) {
                if (res.data.count > 0) {
                    setContactList(res.data.data)
                }
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
        })
    }

    const handleGetSelectedContact = (selectedContact) => {
        if (selectedContact) {
            setIsDef(true)
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.CONTACT + SLASH + OREST_ENDPOINT.VIEW + SLASH + 'get' + SLASH + selectedContact.gid,
                token
            }).then(res => {
                setIsDef(false)
                if (res.status === 200 && res.data.data) {
                    const data = res.data.data
                    setGetData(data)

                }
            })
        }
    }

    const handleDefRecord = () => {
        setIsDef(true)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.CONTACT + SLASH + OREST_ENDPOINT.DEF,
            token,
            params: {
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            if (res.status === 200 && res.data.count > 0) {
                const data = Object.assign({}, res.data.data, contactData)
                setContactData(data)
                setContactDataBase(data)
            }
            setIsDef(false)
        })
    }

    const handleSave = () => {
        const data = {...contactData}
        Object.keys(initialState).map((key) => {
            if (key === 'mobiletel' || key === 'tel') {
                data[key] = mobileTelNoFormat(data[key].value)
            } else {
                data[key] = typeof data[key].value === 'object' ? data[key].value ? data[key].value.id : null : data[key].value
            }

        })

        if (mid) {
            setIsSaving(true)
            if (selectedGid) {
                Patch({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.CONTACT,
                    gid: selectedGid,
                    data: data,
                    token
                }).then(res => {
                    if (res.status === 200) {
                        enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                        setOpenAddDialog(false)
                        getContactList()
                        handleReset()
                    } else {
                        const error = isErrorMsg(res)
                        enqueueSnackbar(error.errorMsg, {variant: 'error'})
                    }
                    setIsSaving(false)
                })
            } else {
                data.masterid = mid
                data.hotelrefno = hotelRefNo
                Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.CONTACT,
                    data: data,
                    token
                }).then(res => {
                    if (res.status === 200) {
                        enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                        setOpenAddDialog(false)
                        getContactList()
                        handleReset()
                    } else {
                        const error = isErrorMsg(res)
                        enqueueSnackbar(error.errorMsg, {variant: 'error'})
                    }
                    setIsSaving(false)
                })
            }
        }
    }

    const handleOnChangeFormElements = (event, key, isOnBlur) => {
        const name = key ? key : event.target.name
        const value = event?.target ? event.target.value : event

        if (name === 'email') {
            if (name.trim() !== "") {
                let lastAtPos = value.lastIndexOf('@');
                let lastDotPos = value.lastIndexOf('.');

                if (
                    !(lastAtPos < lastDotPos && lastAtPos > 0 &&
                        value.indexOf('@@') == -1 && lastDotPos > 2
                        && (value.length - lastDotPos) > 2)
                ) {
                    setEmailNotValid(true)
                } else
                    setEmailNotValid(false)
            }
        }
        else{
            setEmailNotValid(false)
        }

        if (isOnBlur) {
            setContactData({
                ...contactData,
                [name]: {
                    ...contactData[name],
                    isError: contactData[name]?.isRequired && !!required(value),
                    helperText: contactData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        } else {
            setContactData({
                ...contactData,
                [name]: {
                    ...contactData[name],
                    value: value,
                    isError: contactData[name]?.isRequired && !!required(value),
                    helperText: contactData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        }
    }

    const handleOnBlurFormElements = (event, key) => {
        handleOnChangeFormElements(event, key, true)
    }

    const handleOpenAddDialog = (selectedContact = false) => {
        if (selectedContact) {
            handleGetSelectedContact(selectedContact)
        } else {
            handleDefRecord()
        }
        setOpenAddDialog(true)
    }

    const handleCloseDialog = () => {
        if (JSON.stringify(contactData) !== JSON.stringify(contactDataBase)) {
            setOpenTrackedDialog(true)
        } else {
            setOpenAddDialog(false)
            handleReset()
        }
    }

    const handleReset = () => {
        setTimeout(() => {
            setIsInitialStateLoad(false)
            setGetData(null)
            setContactData(initialState)
            setContactDataBase(initialState)
            setSelectedContactData(null)
        }, 100)
    }

    return (
        <div>
            <React.Fragment>
                <Grid container>
                    <Grid item xs={12}>
                        <CustomTable
                            isHoverFirstColumn={false}
                            isActionFirstColumn
                            loading={isLoadingList}
                            getColumns={contactColumns}
                            getRows={contactList}
                            onRefresh={() => getContactList()}
                            onAdd={() => handleOpenAddDialog(false)}
                            isDisabledAdd={!hasRightData || !hasRightData?.cana}
                            disabledAddInfoText={(!hasRightData || !hasRightData?.cana) && t('str_accessDenied')}
                            firstColumnActions={[
                                {
                                    hidden: !hasRightData || !hasRightData.canu,
                                    icon: <EditOutlined/>,
                                    title: t('str_edit'),
                                    onClick: (popupState, rowData) => {
                                        setSelectedContactData(rowData)
                                        setSelectedGid(rowData?.gid || false)
                                        handleOpenAddDialog(rowData)
                                        popupState.close();
                                    }
                                },
                                {
                                    hidden: !hasRightData || !hasRightData.cand,
                                    icon: <DeleteOutlinedIcon style={{color: 'red'}}/>,
                                    title: t('str_delete'),
                                    onClick: (popupState, rowData) => openTrackDialog(popupState, rowData?.gid)
                                }
                            ]}
                        />
                    </Grid>
                </Grid>
                <Dialog open={openAddDialog} maxWidth={'sm'} fullWidth>
                    <div style={{padding: 24}}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography style={{
                                    fontWeight: '600',
                                    fontSize: '18px'
                                }}>{selectedContactData ? t('str_editContact') : t('str_addContact')}</Typography>
                            </Grid>
                            {
                                isDef ? (
                                    <Grid item xs={12}>
                                        <LoadingSpinner/>
                                    </Grid>
                                ) : (
                                    <React.Fragment>
                                        {
                                            formElements.map((item, index) => (
                                                <Grid key={index} item {...item.gridProps}>
                                                    {renderFormElements(item)}
                                                </Grid>
                                            ))
                                        }
                                        {
                                            formElementsNote.map((item, index) => (
                                                <Grid key={index} item {...item.gridProps}>
                                                    {renderFormElements(item)}
                                                </Grid>
                                            ))
                                        }
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={contactData.isblack.value}
                                                        onChange={e => {
                                                            setContactData({
                                                                ...contactData,
                                                                ['isblack']: {
                                                                    ...contactData['isblack'],
                                                                    value: e.target.checked
                                                                }
                                                            })
                                                        }}
                                                    />
                                                }
                                                label={t('str_blacklist')}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <AddDialogActions
                                                disabled={isSaving}
                                                loading={isSaving}
                                                disabledSave={emailNotValid ||  !contactData.contacttypeid.value || contactData.contacttypeid.value?.length <= 0}
                                                toolTipTitle={
                                                    <div>
                                                        <Typography style={{
                                                            fontWeight: '600',
                                                            fontSize: 'inherit'
                                                        }}>{t('str_invalidFieldsOrEmail')}</Typography>
                                                        {
                                                            contactData.contacttypeid.isError || required(contactData.contacttypeid.value) && (
                                                                <Typography
                                                                    style={{fontSize: 'inherit'}}>{t('str_contactType')}</Typography>
                                                            )
                                                        }
                                                    </div>
                                                }
                                                onCancelClick={handleCloseDialog}
                                                onSaveClick={handleSave}
                                            />
                                        </Grid>
                                    </React.Fragment>
                                )
                            }
                        </Grid>
                    </div>
                </Dialog>
                <TrackedChangesDialog
                    open={openTrackedDialog || deleteOpenDialog}
                    onPressNo={(e) => {
                        setOpenTrackedDialog(e);
                        setDeleteOpenDialog(e)
                    }}
                    dialogTitle={deleteOpenDialog ? t('str_delete') : false}
                    dialogDesc={deleteOpenDialog ? t('str_alertDeleteTitle') : false}
                    onPressYes={(e) => {
                        if (deleteOpenDialog) {
                            handleDeleteItem(selectedGid)
                        } else {
                            setOpenTrackedDialog(e);
                            setOpenAddDialog(false)
                            setDeleteOpenDialog(e)
                            handleReset()
                        }
                    }}
                />
            </React.Fragment>
        </div>
    )
}

export default Contacts