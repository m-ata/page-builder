import React from 'react'
import Header from '../Header'
import Footer from '../Footer'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../style/RootLayout.style'

const useStyles = makeStyles(styles)

export default function ReviewsLayout(props) {
    const classes = useStyles()

    return (
        <React.Fragment>
            <Header langSelect={true} loginButton={true} />
            <section className={classes.section}>{props.children}</section>
            <Footer />
        </React.Fragment>
    )
}
