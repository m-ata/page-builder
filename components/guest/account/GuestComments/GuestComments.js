import React, {useEffect, useState, useContext} from "react";
import {connect, useSelector} from 'react-redux'
import { ViewList, Insert, UseOrest, Patch } from '@webcms/orest'
import moment from 'moment'
import {
    Collapse,
    Grid,
    Typography,
} from '@material-ui/core'

import EditIcon from '@material-ui/icons/Edit';
import {useSnackbar} from 'notistack'
import WebCmsGlobal from "../../../webcms-global";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../model/orest/constants";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import {SLASH} from "../../../../model/globals";
import TrackedChangesDialog from "../../../TrackedChangesDialog";
import {required} from "../../../../state/utils/form";
import renderFormElements, {ELEMENT_TYPES} from "../../../render-form-elements";
import {helper} from "../../../../@webcms-globals";
import MTableColumnSettings from "../../../MTableColumnSettings";
import CustomTable from "../../../CustomTable";
import TableColumnText from "../../../TableColumnText";
import DataFormDialog from "../../../DataFormDialog";
import RequestDetail from "../../../user-portal/components/RequestDetail";
import {setToState} from "../../../../state/actions";
import utfTransliteration from '../../../../@webcms-globals/utf-transliteration'
import { sendGuestChangeNotifyMail } from '../Base/helper'


const VARIANT = 'outlined'

function GuestComments(props) {

    const { state, setToState } = props

    const { enqueueSnackbar } = useSnackbar()

    //context
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { t } = useTranslation()
        , { transliteration } = utfTransliteration()

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || null)
        , loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false)
        , clientReservation = useSelector((state) => state?.formReducer?.guest?.clientReservation || false)
        , panelStatus = useSelector(state => state?.formReducer?.userPortal?.panelStatus)
        , panels = useSelector(state => state?.formReducer?.userPortal?.panels || false)
        , reservBase = state.clientReservation || false

    //state
    const initialState = {
        commentype: { value: '', isError: false, required: false },
        priorityid: { value: '', isError: false, required: true },
        refinfo: { value: '', isError: false, required: false },
        note: { value: '', isError: false, required: false },
        transdate: { value: moment(), isError: false, required: false },
        transtime: { value: moment(), isError: false, required: false },
    }
        , [commentList, setCommentList] = useState([])
        , [isLoading, setIsLoading] = useState(false)
        , [isSaving, setIsSaving] = useState(false)
        , [isLoadingCommentData, setIsLoadingCommentData] = useState(false)
        , [openAddDialog, setOpenAddDialog] = useState(false)
        , [openTrackedDialog, setOpenTrackedDialog] = useState(false)
        , [commentData, setCommentData] = useState(initialState)
        , [commentDataBase, setCommentDataBase] = useState(initialState)
        , [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
        , [selectedCommentInfo, setSelectedCommentInfo] = useState(false)
        , [getData, setGetData] = useState(null)

    const [columns, setColumns] = useState([
        {
            title: t('str_date'),
            field: 'transdate',
            render: (props) => <TableColumnText>{props.transdate && moment(props.transdate).format('L') || ''}</TableColumnText>
        },
        {
            title: t('str_time'),
            field: 'transtime',
            render: (props) => <TableColumnText>{props.transtime && moment(props.transtime, "HH:mm:ss").format("HH:mm")}</TableColumnText>
        },
        {
            title: t('str_guestNo'),
            field: 'clientid',
            align: 'right',
            render: (props) => <TableColumnText textAlign={'right'}>{props.clientid}</TableColumnText>
        },
        {
            title: t('str_guest'),
            field: 'clientname',
            minWidth: 160,
            render: (props) => <TableColumnText minWidth={255} maxWidth={255} showToolTip>{transliteration(props?.clientname)}</TableColumnText>
        },
        {
            title: t('str_roomNo'),
            field: 'roomno',
            render: (props) => (
                <div style={{textAlign: 'center', backgroundColor: '#FF69B4', borderRadius: '4px'}}>
                    <Typography style={{fontSize: 'inherit', color: '#FFF'}}>{props.roomno}</Typography>
                </div>
            )
        },
        {
            title: t('str_commentType'),
            field: t('commentypelocal') || 'commentypedesc'
        },
        {
            title: t('str_subject'),
            field: 'typecodelist',
            minWidth: 255,
            render: (props) => <TableColumnText minWidth={255} maxWidth={255} showToolTip>{props?.typecodelist}</TableColumnText>
        },
        {
            title: t('str_category'),
            field: 'catcodelist',
            render: (props) => <TableColumnText minWidth={255} maxWidth={255} showToolTip>{props?.catcodelist}</TableColumnText>
        },
        {
            title: t('str_group'),
            field: 'grpcodelist',
            render: (props) => <TableColumnText minWidth={255} maxWidth={255} showToolTip>{props?.grpcodelist}</TableColumnText>
        },
        {
            title: t('str_source'),
            field: 'sourcecode',
        },
        {
            title: t('str_priority'),
            field: 'prioritycode'
        },
        {
            title: t('str_surveyNo'),
            field: 'surveyid',
            align: 'right',
            render: (props) => <TableColumnText>{props?.surveyid}</TableColumnText>
        },
        {
            title: t('str_survey'),
            field: 'surveydesc',
            render: (props) => <TableColumnText minWidth={255} maxWidth={255} showToolTip>{props?.surveydesc}</TableColumnText>
        },
        {
            title: t('str_comment'),
            field: 'notelist',
            render: (props) => <TableColumnText minWidth={255} maxWidth={255} showToolTip>{props?.notelist}</TableColumnText>
        },
        {
            title: t('str_hotelComment'),
            field: 'refinfolist',
        },
        {
            title: t('str_resHotelRefno'),
            field: 'reshotelrefno',
            align: 'right',
            render: (props) => <TableColumnText textAlign={'right'}>{props.reshotelrefno}</TableColumnText>
        },
        {
            title: t('str_resHotelName'),
            field: 'reshotelname'
        },
        {
            title: `${t('str_trans')}#`,
            field: 'transno',
            align: 'right',
            render: (props) => <TableColumnText textAlign={'right'}>{props.transno}</TableColumnText>
        }


    ])

    const formElements = [
        {
            type: ELEMENT_TYPES.textField,
            id: 'clientid',
            name: 'clientid',
            value: transliteration(clientBase?.fullname),
            disabled: true,
            label: t('str_guest'),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'roomno',
            name: 'roomno',
            value: clientReservation?.roomno || clientBase?.resroomno,
            disabled: true,
            label: t('str_roomNo'),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'commentype',
            name: 'commentype',
            value: commentData.commentype?.value || null,
            error: commentData.commentype?.isError,
            required: commentData.commentype?.required,
            disabled: isSaving,
            label: t('str_commentType'),
            onChange: (newValue, name) => handleTextFieldChange(newValue, name),
            onLoad: (initialValue) => {
                const data = {...commentData}
                data.commentype.value = initialValue
                setCommentData(data)
            },
            endpoint: 'transtype/view/commentlinetype',
            params: {code: '', text: ''},
            initialId: isInitialStateLoad && typeof commentData.commentype?.value !== 'object' ? commentData.commentype?.value : false,
            searchInitialParam: 'code',
            showOptionLabel: 'description',
            showOption: 'description',
            useDefaultFilter: true,
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.datePicker,
            id: 'transdate',
            name: 'transdate',
            value: commentData.transdate?.value,
            error: commentData.transdate?.isError,
            required: commentData.transdate?.required,
            disabled: isSaving,
            label: t('str_date'),
            onChange: (newValue, name) => handleTextFieldChange(newValue, name),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 3}
        },
        {
            type: ELEMENT_TYPES.timePicker,
            id: 'transtime',
            name: 'transtime',
            value: commentData.transtime?.value,
            error: commentData.transtime?.isError,
            required: commentData.transtime?.required,
            disabled: isSaving,
            label: t('str_time'),
            onChange: (newValue, name) => handleTextFieldChange(newValue, name),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 3}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'insuserid',
            name: 'insuserid',
            value: transliteration(loginfo?.fullname),
            disabled: true,
            label: t('str_employee'),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'priorityid',
            name: 'priorityid',
            value: commentData.priorityid?.value || null,
            error: commentData.priorityid?.isError,
            required: commentData.priorityid?.required,
            disabled: isSaving,
            label: t('str_priority'),
            onChange: (newValue, name) => handleTextFieldChange(newValue, name),
            onLoad: (initialValue) => {
                const data = {...commentData}
                data.priorityid.value = initialValue
                setCommentData(data)
            },
            endpoint: 'tspriority/list',
            params: {query: 'isactive:true', code: '', text: ''},
            initialId: isInitialStateLoad && typeof commentData.priorityid?.value !== 'object' ? commentData.priorityid?.value : false,
            showOptionLabel: 'description',
            showOption: 'description',
            variant: VARIANT,
            useDefaultFilter: true,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'note',
            name: 'note',
            value: commentData.note?.value,
            error: commentData.note?.isError,
            required: commentData.note?.required,
            disabled: isSaving,
            label: t('str_note'),
            onChange: (e) => handleTextFieldChange(e),
            variant: VARIANT,
            fullWidth: true,
            multiLine: true,
            rows: 4,
            rowsMax: 4,
            gridProps: {xs: 12}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'refinfo',
            name: 'refinfo',
            value: commentData.refinfo?.value,
            error: commentData.refinfo?.isError,
            required: commentData.refinfo?.required,
            disabled: isSaving,
            label: t('str_refInfo'),
            onChange: (e) => handleTextFieldChange(e),
            variant: VARIANT,
            fullWidth: true,
            multiLine: true,
            rows: 4,
            rowsMax: 4,
            gridProps: {xs: 12}
        },
    ]

    useEffect(() => {
       getCommentLineList();
    }, [])

    useEffect(() => {
        let isEffect = true
        if (isEffect && commentData && getData) {
            getData.transtime = moment(getData.transtime, 'HH:mm:ss').toDate()
            const newInitialState = helper.objectMapper(commentData, getData, ['priorityid'])
            setCommentData(newInitialState)
            setCommentDataBase(newInitialState)
            setIsInitialStateLoad(true)
        }

        return () => {
            isEffect = false
        }

    }, [getData])


    const handleTextFieldChange = (event, key) => {
        const  name = key ? key : event.target.name
            , value = event?.target ? transliteration(event.target.value) : event
        setCommentData({
            ...commentData,
            [name]: {
                ...commentData[name],
                value: value,
                isError: commentData[name]?.isRequired && !!required(value),
                errorText: commentData[name]?.isRequired && !!required(value),
            }
        })
    }

    const getCommentLineList = () => {
        setIsLoading(true);
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.CLNTCOMM,
            token,
            params: {
                query: `clientid:${clientBase?.id}`,
                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO

            }
        }).then(res => {
            if (res.status === 200) {
                setCommentList(res.data.data)
            } else if(res.status === 401){
                enqueueSnackbar('401 Unauthorized', { variant: 'error' })
            } else if(res.status === 403) {
                enqueueSnackbar('403 Forbidden', { variant: 'error' })
            } else {
                const retErr = isErrorMsg(res)
                enqueueSnackbar(t(retErr.errorMsg), {variant: 'error'})
            }
            setIsLoading(false);
        })
    }

    const handleCommentDef = () => {
        setIsLoadingCommentData(true)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.CLNTCOMM + SLASH +  OREST_ENDPOINT.DEF,
            token,
            params: {
                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
            }
        }).then(res => {
            if(res.status === 200) {
                const data = Object.assign({}, res.data.data, commentData)
                setCommentData(data)
                setCommentDataBase(data)
            }
            setIsLoadingCommentData(false)
        })
    }

    const handleOpenDialog = () => {
        setOpenAddDialog(true)
        handleCommentDef()
    }

    const handleOpenDetailPanel = (commentInfo) => {
        setSelectedCommentInfo(commentInfo)
        setToState('userPortal', ['panelStatus'], panels.requestDetail)
        setToState('userPortal', ['currentTask'], commentInfo)
    }

    const handleSave = () => {
        const data = {...commentData};
        Object.keys(initialState).map((key) => {
            if(typeof data[key]?.value === 'object') {
                if(key === 'commentype') {
                    data[key] = data[key]?.value?.code
                } else if(key === 'priorityid') {
                    data[key] = data[key]?.value?.id
                } else if(key === 'transdate' || key === 'transtime') {
                    data[key] = moment(data[key]?.value).format(key === 'transtime' ? 'HH:mm' : OREST_ENDPOINT.DATEFORMAT)
                }
            } else {
                data[key] = data[key]?.value
            }
        })
        data.clientid = clientBase?.id
        data.hotelrefno = hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
        if(clientReservation?.res) {
            data.reservno = clientReservation.res;
        }
        setIsSaving(true);

        let notifyValues = {
            "roomno":reservBase?.roomno || "",
            "clientname": transliteration(clientBase.clientname) || "",
            "description": ""
        }

        if(getData?.gid) {
            Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.CLNTCOMM,
                token,
                gid: getData.gid,
                params: {
                    hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO
                },
                data: data
            }).then(async res => {
                setIsSaving(false);
                if(res.status === 200) {
                    notifyValues.description = res?.data?.data?.note || ""
                    await sendGuestChangeNotifyMail('clntcomm','upd', clientBase.id, clientBase.gid, reservBase.gid, reservBase.reservno, null, reservBase?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO)
                    getCommentLineList();
                    setTimeout(() => {
                        handleReset();
                    }, 50)
                    setOpenAddDialog(false);
                    enqueueSnackbar(t('str_updateIsSuccessfullyDone'), {variant: 'success'});
                } else {
                    const retErr = isErrorMsg(res)
                    enqueueSnackbar(t(retErr.errorMsg), {variant: 'error'});
                }
            })
        } else {
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.CLNTCOMM,
                token,
                data: data
            }).then(async res => {
                setIsSaving(false);
                if(res.status === 200) {
                    notifyValues.description = res?.data?.data?.note || ""
                    await sendGuestChangeNotifyMail('clntcomm','upd', clientBase.id, clientBase.gid, reservBase.gid, reservBase.reservno, notifyValues, reservBase?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO)
                    getCommentLineList();
                    setTimeout(() => {
                        handleReset();
                    }, 200)
                    enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'});
                    setOpenAddDialog(false);
                } else {
                    const retErr = isErrorMsg(res)
                    enqueueSnackbar(t(retErr.errorMsg), {variant: 'error'});
                }
            })
        }
    }

    const handleGetComment = (gid) => {
        setIsLoadingCommentData(true);
        setOpenAddDialog(true)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.CLNTCOMM + SLASH + OREST_ENDPOINT.GET + SLASH + gid,
            token,
            params: {
                allhotels: true
            }
        }).then(res => {
            if(res.status === 200) {
                const data = res.data.data;
                setGetData(data)
            }
        }).then(() => {
            setIsLoadingCommentData(false)
        })
    }

    const handleReset = () => {
        setCommentData(initialState);
        setGetData(null)
    }

    return(
      <div>
          <Grid container spacing={1}>
              <Grid item xs={12}>
                  <Collapse in={panelStatus === panels.requestDetail}>
                      {selectedCommentInfo && <RequestDetail taskmid={selectedCommentInfo?.mid} taskHotelRefNo={selectedCommentInfo?.hotelrefno} tableName={OREST_ENDPOINT.CLNTCOMM} gid={selectedCommentInfo?.gid}/>}
                  </Collapse>
                  <Collapse in={panelStatus === panels.requestList}>
                      <CustomTable
                          isHoverFirstColumn
                          showMoreActionButton
                          showEditIcon
                          loading={isLoading}
                          getColumns={columns}
                          getRows={commentList}
                          onRefresh={() => getCommentLineList()}
                          onAdd={() => handleOpenDialog()}
                          onClickEditIcon={(rowData) => handleGetComment(rowData?.gid)}
                          onClickDetailIcon={(rowData) => handleOpenDetailPanel(rowData)}
                          onDoubleClickRow={(rowData) => handleGetComment(rowData?.gid)}
                          moreActionList={[
                              {
                                  icon: <EditIcon />,
                                  title: t('str_edit'),
                                  onClick: (popupState, rowData) => {
                                      popupState.close()
                                      handleGetComment(rowData?.gid)
                                  },
                              }
                          ]}
                          filterComponentAlign={'right'}
                          filterComponent={
                              <React.Fragment>
                                  <Grid container spacing={3} alignItems={'center'}>
                                      <Grid item xs={12} sm={true}>
                                          <MTableColumnSettings tableId="historyReservation" columns={columns} setColumns={setColumns}/>
                                      </Grid>
                                  </Grid>
                              </React.Fragment>
                          }
                          options={{
                              selection: true
                          }}
                      />
                  </Collapse>
              </Grid>
          </Grid>
          <DataFormDialog
              fullWidth
              maxWidth={'md'}
              title={!isLoadingCommentData ? getData ? t('str_edit') : t('str_addComments') : ''}
              open={openAddDialog}
              loadingDialog={isLoadingCommentData}
              loadingAction={isSaving}
              disabledActions={isSaving}
              disabledSave={isSaving || !commentData.priorityid.value || commentData.priorityid.value?.length <= 0}
              toolTipTitle={
                  <div>
                      <Typography
                          style={{
                              fontWeight: '600',
                              fontSize: 'inherit'
                          }}
                      >
                          {t('str_invalidFields')}
                      </Typography>
                      {
                          (required(commentData.priorityid.value) || commentData.priorityid.isError) && (
                              <Typography style={{fontSize: 'inherit'}}>{t('str_priority')}</Typography>
                          )
                      }
                  </div>
              }
              render={
                  <Grid container spacing={3}>
                      {
                          formElements.map((item, index) => (
                              <Grid item {...item?.gridProps} key={index}>
                                  {renderFormElements(item)}
                              </Grid>
                          ))
                      }
                  </Grid>
              }
              onCancelClick={() => {
                  const data = JSON.stringify(commentData)
                  const baseData = JSON.stringify(commentDataBase)
                  if(data !== baseData) {
                      setOpenTrackedDialog(true)
                  } else {
                      setOpenAddDialog(false)
                      handleReset()
                  }
              }}
              onSaveClick={() => handleSave()}
          />
          <TrackedChangesDialog
              open={openTrackedDialog}
              onPressNo={(e) => setOpenTrackedDialog(e)}
              onPressYes={(e) => {
                  setOpenTrackedDialog(e);
                  setOpenAddDialog(false);
                  setTimeout(() => {
                      handleReset()
                  }, 100)
              }}
          />
      </div>
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(GuestComments);