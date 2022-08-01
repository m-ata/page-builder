import React, {useContext, useEffect, useState} from "react";
import UserPortalWrapper from "../../components/user-portal/UserPortalWrapper";
import {Button, Grid, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import useTranslation from "../../lib/translations/hooks/useTranslation";
import WebCmsGlobal from "../../components/webcms-global";
import {formatMoney, OREST_ENDPOINT} from "../../model/orest/constants";
import {ViewList, List} from "@webcms/orest";
import {connect, useSelector} from "react-redux";
import InformationCard from "../../components/emp-portal/InformationCard";
import {NextSeo} from "next-seo";
import {setToState, updateState} from "../../state/actions";
import NewCvStepper from "../../components/emp-portal/NewCvStepper";
import {getCvInfo} from "./home";
import {useSnackbar} from "notistack";
import NewCvDialog from "../../components/emp-portal/NewCvDailog";
import getSymbolFromCurrency from "../../model/currency-symbol";

const useStyles = makeStyles(theme => ({
    mainTitle: {
        //paddingBottom: "48px",
        fontSize: "42px",
        fontWeight: "600",
        color: theme.palette.text.ultraDark
    },
    subTitle: {
        paddingBottom: "8px",
        fontSize: "25px",
        fontWeight: "600",
        color: theme.palette.text.light
    },
    space48: {
        paddingBottom: "48px",
        [theme.breakpoints.down("sm")]: {
            paddingBottom: "24px",
        },
    }
}))

const employeeCvInitialState = {
    empEduData: {
        edutypeid: {value: '', isError: false, required: true, helperText: ''},
        graddate: {value: '', isError: false, required: false, helperText: ''},
        schoolname: {value: '', isError: false, required: false, helperText: ''},
        gradlevel: {value: "", isError: false, required: false, helperText: ''},
        schoolplace: {value: '', isError: false, required: false, helperText: ''},
        note: {value: '', isError: false, required: false, helperText: ''},
    },
    empWorkData: {
        company: {value: '', isError: false, required: true, helperText: ''},
        startdate: {value: '', isError: false, required: false, helperText: ''},
        enddate: {value: '', isError: false, required: false, helperText: ''},
        workpos: {value: '', isError: false, required: false, helperText: ''},
        worksalary: {value: '', isError: false, required: false, helperText: ''},
        leavereason: {value: '', isError: false, required: false, helperText: ''},
        workrefallowed: {value: '', isError: false, required: false, helperText: ''},
    },
    empRefData: {
        reftypeid: {value: '', isError: false, required: true, helperText: ''},
        refname: {value: '', isError: false, required: false, helperText: ''},
        tel: {value: '', isError: false, required: false, helperText: ''},
        email: {value: '', isError: false, required: false, helperText: ''},
        note: {value: '', isError: false, required: false, helperText: ''},
    },
    empAbilityData: {
        abilityid: {value: '', isError: false, required: true, helperText: ''},
        abilitylevel: {value: '', isError: false, required: false, helperText: ''},
        edudesc: {value: '', isError: false, required: false, helperText: ''},
        description: {value: '', isError: false, required: false, helperText: ''},
    },
    empLangData: {
        langid: {value: '', isError: false, required: true, helperText: ''},
        verbalevel: {value: '', isError: false, required: false, helperText: ''},
        writenlevel: {value: '', isError: false, required: false, helperText: ''},
        readlevel: {value: '', isError: false, required: false, helperText: ''},
        description: {value: '', isError: false, required: false, helperText: ''},
    },
}


function CvPage(props) {
    const classes = useStyles();
    const {t} = useTranslation()
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);

    const {enqueueSnackbar} = useSnackbar();

    const {state, setToState} = props;

    //redux
    const token = useSelector(state => state?.orest?.currentUser?.auth?.access_token || false);
    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false);
    const initialPersonalData = useSelector((state) => state?.formReducer?.employeePortal.personalData)
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || null);

    const [personalInfo, setPersonalInfo] = useState(false);
    const [educationInfo, setEducationInfo] = useState([]);
    const [workExpInfo, setWorkExpInfo] = useState([]);
    const [refInfo, setRefInfo] = useState([]);
    const [abilityInfo, setAbilityInfo] = useState([]);
    const [languageInfo, setLanguageInfo] = useState([]);

    const [isPersonalInfoLoading, setIsPersonalInfoLoading] = useState(false);
    const [isEduInfoLoading, setIsEduInfoLoading] = useState(false);
    const [isWorkExpLoading, setIsWorkExpLoading] = useState(false);
    const [isRefInfoLoading, setIsRefInfoLoading] = useState(false);
    const [isAbilityInfoLoading, setIsAbilityInfoLoading] = useState(false);
    const [isLangInfoLoading, setIsLangInfoLoading] = useState(false);

    const personalInfoCardData = [
        {
            title: t('str_name'),
            value: personalInfo?.firstname,
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_lastName'),
            value: personalInfo?.lastname,
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_trIdNo'),
            value: personalInfo?.tridno,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            title: t('str_gender'),
            value: personalInfo?.genderdesc,
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_email'),
            value: personalInfo?.email,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            title: t('str_birthDate'),
            value: personalInfo?.birthdate,
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_birthPlace'),
            value: personalInfo?.birthplace,
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_phone'),
            value: personalInfo?.mobiletel || personalInfo?.tel || personalInfo?.tel2,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            title: t('str_nation'),
            value: personalInfo?.nationdesc,
            gridProps: {xs: 12, sm: 6, md: 5}
        },
        {
            title: t('str_address'),
            value: personalInfo?.address1,
            gridProps: {xs: 12, sm: 6, md: 7}
        },
        {
            title: t('str_city'),
            value: personalInfo?.city,
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_town'),
            value: personalInfo?.town,
            gridProps: {xs: 12, sm: 6, md: 3}
        },

    ]

    const eduInfoCardData = [
        {
            title: t('str_educationType'),
            field: 'edutype',
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            title: t('str_graduationDate'),
            field: 'graddate',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_schoolName'),
            field: 'schoolname',
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            title: t('str_graduationLevel'),
            field: 'gradlevel',
            align: 'right',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_schoolPlace'),
            field: 'schoolplace',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_note'),
            field: 'note',
            gridProps: {xs: 12}
        },


    ]

    const workExpCardData = [
        {
            title: t('str_company'),
            field: 'company',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_startDate'),
            field: 'startdate',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_endDate'),
            field: 'enddate',
            gridProps: {xs: 12, sm: 6, md: 8}
        },
        {
            title: t('str_position'),
            field: 'workpos',
            align: 'right',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_salary'),
            field: 'worksalary',
            align: 'right',
            gridProps: {xs: 12, sm: 6, md: 10}
        },
        {
            title: 'Reason For Quit',
            field: 'leavereason',
            align: 'right',
            gridProps: {xs: 12, sm: 6, md: 12}
        },
    ]

    const refInfoCardData = [
        {
            title: t('str_referenceType'),
            field: 'reftype',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: 'References Name',
            field: 'refname',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: 'References Tel',
            field: 'tel',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: 'References Mail',
            field: 'email',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_note'),
            field: 'note',
            gridProps: {xs: 12, sm: 6, md: 12}
        },
    ]

    const abilityInfoCardData = [
        {
            title: t('str_ability'),
            field: 'ability',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_level'),
            field: 'abilitylevel',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_educationDesc'),
            field: 'edudesc',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_description'),
            field: 'description',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
    ]

    const languageInfoCardData = [
        {
            title: t('str_language'),
            field: 'langcode',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_verbalLevel'),
            field: 'verbalevel',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_writtenLevel'),
            field: 'writenlevel',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_readLevel'),
            field: 'readlevel',
            gridProps: {xs: 12, sm: 6, md: 2}
        },
        {
            title: t('str_description'),
            field: 'description',
            gridProps: {xs: 12, sm: 6, md: 4}
        },
    ]

    const cvInfoCardData = [
        {
            title: t('str_introduction'),
            value: state.empCv?.description,
            gridProps: {xs: 12, sm: 6, md: 12}
        },
        {
            title: t('str_maritalStatus'),
            value: state.empCv?.maritalstatusdesc,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            title: t('str_militaryStatus'),
            value: state.empCv?.militarystatusdesc,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            title: t('str_healthNote'),
            value: state.empCv?.healthinfo,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
        {
            title: t('str_hobbies'),
            value: state.empCv?.hobby,
            gridProps: {xs: 12, sm: 6, md: 3}
        },
    ]

    /*const cardList = [
        {
            title: t('str_personalInformation'),
            render: <InformationCard data={personalInfoCardData} name={'personalInfo'}
                                     isLoading={isPersonalInfoLoading}/>
        },
        {
            title: t('str_educationInformation'),
            render: <InformationCard data={eduInfoCardData} isArray array={educationInfo} name={'eduInfo'}
                                     isLoading={isEduInfoLoading}/>
        },
        {
            title: t('str_workExperience'),
            render: <InformationCard data={workExpCardData} isArray array={workExpInfo} name={'workInfo'}
                                     isLoading={isWorkExpLoading}/>
        },
        {
            title: t('str_references'),
            render: <InformationCard data={refInfoCardData} isArray array={refInfo} name={'referenceInfo'}
                                     isLoading={isRefInfoLoading}/>
        },
        {
            title: t('str_abilities'),
            render: <InformationCard data={abilityInfoCardData} isArray array={abilityInfo} name={'abilityInfo'}
                                     isLoading={isAbilityInfoLoading}/>
        },
        {
            title: t('str_languages'),
            render: <InformationCard data={languageInfoCardData} isArray array={languageInfo} name={'languageInfo'}
                                     isLoading={isLangInfoLoading}/>
        }
    ]*/

    const cardList = [
        {
            title: t(''),
            render: <InformationCard data={cvInfoCardData} name={'cvInfo'} isLoading={false}/>
        },
    ]


    useEffect(() => {
        handleGetList()
        setToState('employeePortal', ['initialPersonalData'], initialPersonalData)
        setToState('employeePortal', ['initialEmpEduData'], employeeCvInitialState.empEduData)
        setToState('employeePortal', ['initialEmpWorkData'], employeeCvInitialState.empWorkData)
        setToState('employeePortal', ['initialEmpRefData'], employeeCvInitialState.empRefData)
        setToState('employeePortal', ['initialEmpAbilityData'], employeeCvInitialState.empAbilityData)
        setToState('employeePortal', ['initialEmpLangData'], employeeCvInitialState.empLangData)
    }, [])

    const handleObjectToArray = (list, stateName) => {
        let array = []
        if (list.length > 0) {
            list.map((item) => {
                const data = {}
                Object.keys(employeeCvInitialState[stateName]).map((key) => {
                    data[key] = {
                        ...employeeCvInitialState[stateName][key],
                        value: item[key],
                    }
                })
                array = [...array, data]
            })
            setToState('employeePortal', [stateName], array)
        } else {
            setToState('employeePortal', [stateName], [employeeCvInitialState[stateName]])
        }
    }

    const handleGetList = async () => {
        setIsPersonalInfoLoading(true)
        setIsEduInfoLoading(true);
        setIsWorkExpLoading(true);
        setIsRefInfoLoading(true);
        setIsAbilityInfoLoading(true);
        setIsLangInfoLoading(true);
        await ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPLOYEE,
            token,
            params: {
                query: `gid:${loginfo.gid}`
            }
        }).then(res => {
            setIsPersonalInfoLoading(false);
            if (res.status === 200 && res.data.count > 0) {
                setPersonalInfo(res.data.data[0])
                const resData = res.data.data[0]
                setToState('employeePortal', ['personalDataBase'], resData)
            }
        })

        await ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPEDU,
            token,
            params: {
                query: `empid:${loginfo?.id},isacademic:true`
            }
        }).then(res => {
            setIsEduInfoLoading(false);
            if (res.status === 200) {
                if (res.data.data.length > 0) {
                    setEducationInfo(res.data.data)
                    setToState('employeePortal', ['educationList'], res.data.data)
                    handleObjectToArray(res.data.data, 'empEduData')
                } else {
                    handleObjectToArray([], 'empEduData')
                }
            }
        })

        await ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPWORK,
            token,
            params: {
                query: `empid:${loginfo?.id}`
            }
        }).then(res => {
            setIsWorkExpLoading(false);
            if (res.status === 200 && res.data.count > 0) {
                setWorkExpInfo(res.data.data)
                setToState('employeePortal', ['workExpList'], res.data.data)
                handleObjectToArray(res.data.data, 'empWorkData')
            } else {
                handleObjectToArray([], 'empWorkData')
            }
        })

        await ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPREF,
            token,
            params: {
                query: `empid:${loginfo?.id}`
            }
        }).then(res => {
            setIsRefInfoLoading(false);
            if (res.status === 200 && res.data.count > 0) {
                setRefInfo(res.data.data)
                setToState('employeePortal', ['empRefList'], res.data.data)
                handleObjectToArray(res.data.data, 'empRefData')
            } else {
                handleObjectToArray([], 'empRefData')
            }
        })

        await ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPABILITY,
            token,
            params: {
                query: `empid:${loginfo?.id}`
            }
        }).then(res => {
            setIsAbilityInfoLoading(false)
            if (res.status === 200 && res.data.count > 0) {
                setAbilityInfo(res.data.data)
                handleObjectToArray(res.data.data, 'empAbilityData')
            } else {
                handleObjectToArray([], 'empAbilityData')
            }
        })

        await ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPLANG,
            token,
            params: {
                query: `empid:${loginfo?.id}`
            }
        }).then(res => {
            setIsLangInfoLoading(false)
            if (res.status === 200 && res.data.count > 0) {
                setLanguageInfo(res.data.data)
                handleObjectToArray(res.data.data, 'empLangData')
            } else {
                handleObjectToArray([], 'empLangData')
            }
        })
        getCvInfo({
            GENERAL_SETTINGS: GENERAL_SETTINGS,
            token: token,
            empId: loginfo?.id,
            setToState: setToState,
            hotelRefNo: hotelRefNo,
            enqueueSnackbar: enqueueSnackbar,
            loginInfo: loginfo,
        })
    }


    return (
        <React.Fragment>
            <NextSeo
                title={`Hotech - ${t('str_cv')}`}
            />
            <UserPortalWrapper isEmpPortal>
                <Grid container alignItems={'center'}>
                    <Grid item xs={8}>
                        <Typography className={classes.mainTitle}>{t("str_cv")}</Typography>
                    </Grid>
                    <Grid item xs={4} style={{textAlign: 'right'}}>
                        {<Button color={'primary'} variant={'contained'}
                                 onClick={() => setToState('employeePortal', ['openCvDialog'], true)}>Edit CV</Button>}
                    </Grid>
                    <Grid item xs={12}>
                        <div className={classes.space48}/>
                    </Grid>
                    {
                        cardList.map((item, i) => (
                            <Grid item xs={12} key={`grid-${i}`}>
                                <Typography className={classes.subTitle}>{item.title}</Typography>
                                <div key={`padding-div-${i}`} style={{paddingBottom: "24px"}}/>
                                {item.render}
                                <div key={`padding-div-child${i}`} className={classes.space48}/>
                            </Grid>
                        ))
                    }
                </Grid>
            </UserPortalWrapper>
            <NewCvDialog />
            {/*<NewCvStepper refreshList={() => handleGetList()}/>*/}
        </React.Fragment>
    )
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

const mapStateToProps = state => {
    return {
        state: state.formReducer.employeePortal,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CvPage)