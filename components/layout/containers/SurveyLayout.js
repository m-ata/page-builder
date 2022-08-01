import React from 'react'
import Header from '../Header'
import Footer from '../Footer'
import Notifications from 'model/notification/components/Notifications'
import {makeStyles} from '@material-ui/core/styles'
import styles from '../style/RootLayout.style'
import {useRouter} from 'next/router'
import { useSelector } from 'react-redux'
const useStyles = makeStyles(styles)

export default function SurveyLayout(props) {
    const classes = useStyles()
    const router = useRouter()
    const iframe = router.query.iframe === 'true'
    const isLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth) ? true : false
    const surveyBgColor = useSelector((state) => state.survey.bgColor)

    return (
        <React.Fragment>
            {!iframe && <Header langSelect={true} loginButton={true}/>}
            <section style={ isLogin && surveyBgColor ? { backgroundColor: surveyBgColor, transition: 'background-color 500ms linear' } : { transition: 'background-color 500ms linear' }} className={classes.section}>{props.children}</section>
            {!iframe && <Footer/>}
            <Notifications/>
        </React.Fragment>
    )
}
