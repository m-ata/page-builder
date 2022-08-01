import React from 'react'
import Notifications from '../../../model/notification/components/Notifications'
import CssBaseline from '@material-ui/core/CssBaseline'

export default function UserPortalLayout(props) {
    return (
        <React.Fragment>
            <CssBaseline />
            <React.Fragment>{props.children}</React.Fragment>
            <Notifications />
        </React.Fragment>
    )
}
