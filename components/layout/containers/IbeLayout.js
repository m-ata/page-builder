import React, {useContext} from 'react'
import Header from '../Header'
import Footer from '../Footer'
import Notifications from '../../../model/notification/components/Notifications'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../style/RootLayout.style'
import { useRouter } from 'next/router'
import WebCmsGlobal from 'components/webcms-global'

const useStyles = makeStyles(styles)

export default function IbeLayout(props) {
    const classes = useStyles()
    const router = useRouter()
    const iframe = router.query.iframe === 'true'

    return (
        <React.Fragment>
            {!iframe && <Header langSelect={true} loginButton={true} />}
            <section className={classes.section}>{props.children}</section>
            {!iframe && <Footer />}
            <Notifications />
        </React.Fragment>
    )
}
