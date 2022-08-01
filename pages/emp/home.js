import React, {useContext, useEffect, useState} from 'react'
import UserPortalWrapper from '../../components/user-portal/UserPortalWrapper'
import useTranslation from '../../lib/translations/hooks/useTranslation'
import WebCmsGlobal from '../../components/webcms-global'
import {useSnackbar} from 'notistack'
import {connect, useSelector} from 'react-redux'
import {setToState, updateState} from '../../state/actions'
import {UseOrest, ViewList} from '@webcms/orest'
import {isErrorMsg} from '../../model/orest/constants'
import {useOrestAction} from "../../model/orest";
import {Container, Grid} from "@material-ui/core";
import LoadingSpinner from "../../components/LoadingSpinner";
import MyProfile from "../../components/guest/account/MyProfile";
import TrackedChangesDialog from "../../components/TrackedChangesDialog";
import NewCvStepper from "../../components/emp-portal/NewCvStepper";
import NewCvDialog from "../../components/emp-portal/NewCvDailog";


export const getCvInfo = async ({ GENERAL_SETTINGS, token, empId, setToState, hotelRefNo, enqueueSnackbar, loginInfo }) => {
    return ViewList({
        apiUrl: GENERAL_SETTINGS.OREST_URL,
        endpoint: 'empcv',
        token,
        params: {
            query: `empid:${empId}`,
            hotelrefno: hotelRefNo
        }
    }).then(res => {
        if (res.status === 200) {
            if (res.data.count > 0) {
                setToState('employeePortal', ['empCv'], res.data.data[0])
                setToState('employeePortal', ['empCvData'], res.data.data[0])
                return true
            } else {
                return false
                /*ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: 'aptcompany',
                    token,
                    params: {
                        query: 'isdef:true'
                    }
                }).then(aptCompany => {
                    if(aptCompany.status === 200) {
                        if(aptCompany.data.count > 0) {
                            const branchId = aptCompany.data?.data[0].id
                            if(branchId) {
                                Insert({
                                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                                    endpoint: 'empcv',
                                    token,
                                    data: {
                                        empid: empId,
                                        empposid: loginInfo.empposid,
                                        empbranchid: branchId,
                                    }
                                }).then(cvData => {
                                    if(cvData.status === 200) {
                                        setToState('employeePortal', ['empCv'], cvData.data.data)
                                        setToState('employeePortal', ['empCvData'], cvData.data.data)
                                    }
                                })
                            }

                        }
                    }
                })*/

            }
        }
        if (res.status !== 200) {
            const error = isErrorMsg(res)
            enqueueSnackbar(error.errMsg, {variant: 'error'})
        }
    })
}

function HomePage(props) {
    const {t} = useTranslation()
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);

    const {state, setToState} = props;

    const {enqueueSnackbar} = useSnackbar();

    //redux
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo);
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || null);

    //orest state
    const {setOrestState} = useOrestAction()

    const [isEmployeeViewLoading, setIsEmployeeViewLoading] = useState(false)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);

    useEffect(() => {
        if (token) {
            getEmployeeView().then(res => {
                if (!res.empCv) {
                    setOpenTrackedDialog(true)
                }
            })
        }
    }, [token])

    const getEmployeeView = async () => {
        setIsEmployeeViewLoading(true)
        const employeeViewData = await UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'employee/view/get',
            token,
            params: {
                gid: loginfo?.gid,
                chkselfish: false,
                allhotels: true,
            },
        }).then((employeeGetResponse) => {
            setIsEmployeeViewLoading(false)
            if (employeeGetResponse?.data?.data) {
                setOrestState(['emp'], employeeGetResponse.data.data)
                return employeeGetResponse?.data?.data
            } else {
                return false
            }
        }).catch(() => {
            setIsEmployeeViewLoading(false)
            return false
        })

        const empCv = await getCvInfo({
            GENERAL_SETTINGS: GENERAL_SETTINGS,
            token: token,
            empId: loginfo?.id,
            setToState: setToState,
            hotelRefNo: hotelRefNo,
            enqueueSnackbar: enqueueSnackbar,
            loginInfo: loginfo,
        })
        return {employeeViewData, empCv}
    }


    return (
        <UserPortalWrapper isEmpPortal>
            {isEmployeeViewLoading ? (
                <Container maxWidth='sm'>
                    <Grid container direction='row' justify='center' alignItems='center'>
                        <Grid item style={{marginTop: 200}}>
                            <LoadingSpinner/>
                        </Grid>
                    </Grid>
                </Container>
            ) : (
                <React.Fragment>
                    {/* <AccountBanner />*/}
                    <div style={{marginTop: 40, marginBottom: 40}}>
                        <MyProfile isEmpPortal/>
                    </div>
                </React.Fragment>
            )}
            <TrackedChangesDialog
                open={openTrackedDialog}
                dialogTitle={t('str_information')}
                dialogDesc={t('str_homeDialogDesc')}
                onPressNo={(e) => {
                    setOpenTrackedDialog(e);
                }}
                onPressYes={(e) => {
                    setOpenTrackedDialog(e);
                    setToState('employeePortal', ['openCvDialog'], true)
                }}
            />
            <NewCvDialog/>
        </UserPortalWrapper>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.employeePortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomePage)