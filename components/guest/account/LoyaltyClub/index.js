import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard'
import HistoryIcon from '@material-ui/icons/History'
import Container from '@material-ui/core/Container'
import useTranslation from 'lib/translations/hooks/useTranslation'
import ReceivableGifts from './receivable-gifts'
import ReceivedGifts from './received-gifts'

function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-force-tabpanel-${index}`}
            aria-labelledby={`scrollable-force-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={2}>{children}</Box>}
        </div>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
}

function a11yProps(index) {
    return {
        id: `scrollable-force-tab-${index}`,
        'aria-controls': `scrollable-force-tabpanel-${index}`,
    }
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
}))

export default function LoyaltyClub(props) {
    const { t } = useTranslation()

    const classes = useStyles()
    const [value, setValue] = useState(0)

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    const loyaltyClubTabMenu = [
        {
            code: 'RECEIVABLE_GIFTS',
            title: 'str_receivableGifts',
            icon: <CardGiftcardIcon />,
        },
        {
            code: 'RECEIVED_GIFTS',
            title: 'str_receivedGifts',
            icon: <HistoryIcon />,
        },
    ]

    const renderEventComponent = (profileItem) => {
        let component
        switch (profileItem.code) {
            case 'RECEIVABLE_GIFTS':
                component = <ReceivableGifts />
                break
            case 'RECEIVED_GIFTS':
                component = <ReceivedGifts />
                break
        }

        return component
    }

    return (
        <Container maxWidth="md">
            <div className={classes.root}>
                <AppBar position="static" color="default">
                    <Tabs
                        variant="fullWidth"
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        {loyaltyClubTabMenu.map((item, i) => (
                            <Tab label={t(item.title)} icon={item.icon} {...a11yProps(i)} key={i} />
                        ))}
                    </Tabs>
                </AppBar>
                {loyaltyClubTabMenu.map((item, i) => (
                    <TabPanel value={value} index={i} key={i}>
                        {renderEventComponent(item)}
                    </TabPanel>
                ))}
            </div>
        </Container>
    )
}
