import React, { useContext } from 'react';

import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import Layout from './layout';


import ChatProfile from '../client/chat-components/ChatProfile';
import ChatMain from '../client/chat-components/ChatMain';
import ChatActions from '../client/chat-components/ChatActions';


import Rating from '../client/feedback-components/Rating';
import FeedBackStepperA from '../client/feedback-components/FeedbackStepperA';
import FeedBackStepperB from '../client/feedback-components/FeedBackStepperB';
import EmailDialogue from '..//client/chat-components/EmailDialogue';
import WebCmsGlobal from '../../webcms-global'
import useTranslation from '../../../lib/translations/hooks/useTranslation'


const useStyles = makeStyles(() => ({
	root: {
		display: 'flex',
		minHeight: '100%',
		alignItems: 'center',
		justifyContent: 'center'
	},
}));


const renderContent = ({ initialScreen, previousChatMessages }, chatIsAvailable) => {

	const { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal)
	const { t } = useTranslation()
	const classes = useStyles()

	if (!initialScreen) {
		return (
			<Layout
				isLoading={chatIsAvailable}
				profile={
					<ChatProfile
						imageSrc={WEBCMS_DATA.assets.images.logo ? GENERAL_SETTINGS.STATIC_URL + WEBCMS_DATA.assets.images.logo : ''}
						name={WEBCMS_DATA.assets.meta.title}
						occupation={t('str_liveSupport')}
					/>
				}
				stemContent={
					<React.Fragment>
						{previousChatMessages ?
							<ChatMain /> :
							<div className={classes.root}>
								<CircularProgress />
							</div>
						}
					</React.Fragment>
				}
				footerContent={
					<ChatActions />
				}
			/>
		)
	} else if (initialScreen == 1) {
		return <Rating />
	}
	else if (initialScreen == 2) {
		return <FeedBackStepperA />
	}
	else if (initialScreen == 3) {
		return <FeedBackStepperB />
	}
	else if (initialScreen == "dialogue") {
		return <EmailDialogue />
	}
	else {
		return (
			<Layout
				isLoading={chatIsAvailable}
				stemContent={
					<React.Fragment>
						<ChatProfile
							imageSrc={WEBCMS_DATA.assets.images.logo ? GENERAL_SETTINGS.STATIC_URL + WEBCMS_DATA.assets.images.logo : ''}
							name={WEBCMS_DATA.assets.meta.title}
							occupation={t('str_liveSupport')}
						/>
						<ChatMain />
					</React.Fragment>
				}
				footerContent={
					<ChatActions />
				}
			/>
		)
	}
}

const ConditionalRenderedComponent = (props) => {
	const { state, chatIsAvailable } = props
	return renderContent(state, chatIsAvailable)
}

const mapStateToProps = (state) => {
	return {
		state: state.formReducer.oLiveChat,
	}
}


export default connect(mapStateToProps, null)(ConditionalRenderedComponent)
