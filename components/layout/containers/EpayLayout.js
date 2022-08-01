import React from 'react'
import Header from '../Header'
import Footer from '../Footer'
import Notifications from '../../../model/notification/components/Notifications'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../style/RootLayout.style'

const useStyles = makeStyles(styles)

export default function EpayLayout(props) {
    const classes = useStyles()

    return (
        <React.Fragment>
            <Header langSelect={true} loginButton={true} />
            <section className={classes.section}>{props.children}</section>
            <Footer />
            <Notifications />
        </React.Fragment>
    )
}
