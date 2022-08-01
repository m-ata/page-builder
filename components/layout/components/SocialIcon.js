import React from 'react'
import styles from './style/SocialIcon.style'
import { makeStyles } from '@material-ui/core/styles'
import { Facebook, Instagram, Link, LinkedIn, Twitter, YouTube } from '@material-ui/icons'
import PropTypes from 'prop-types'

const useStyles = makeStyles(styles)

export default function SocialIcon(props) {
    const { iconName } = props
    const classes = useStyles()

    if (iconName === 'linkedin') {
        return <LinkedIn className={classes.footerSocialIcon} fontSize="inherit" />
    } else if (iconName === 'instagram') {
        return <Instagram className={classes.footerSocialIcon} fontSize="inherit" />
    } else if (iconName === 'facebook') {
        return <Facebook className={classes.footerSocialIcon} fontSize="inherit" />
    } else if (iconName === 'twitter') {
        return <Twitter className={classes.footerSocialIcon} fontSize="inherit" />
    } else if (iconName === 'youtube') {
        return <YouTube className={classes.footerSocialIcon} fontSize="inherit" />
    } else {
        return <Link className={classes.footerSocialIcon} fontSize="inherit" />
    }
}

SocialIcon.propTypes = {
    iconName: PropTypes.string.isRequired,
}
