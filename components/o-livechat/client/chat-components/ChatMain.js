import React, { useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import { updateState } from 'state/actions'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import { COLORS } from '../../constants'
import useTranslation from 'lib/translations/hooks/useTranslation'

const managePadding = {
	padding: '2px 0'
}
const removeMargin = {
	margin: '0px'
}

const useStyles = makeStyles(() => ({
	root: {
		padding: '10px 0'
	},
	messageArea: {
		maxHeight: '100%',
		overflowY: 'auto',
		'& ul': {
			padding: 0
		}
	},
	chatBubbleRight: {
		padding: '10px',
		textAlign: 'right',
		borderRadius: '15px 15px 0px',
		fontSize: '12px',
		background: COLORS.primary,
		color: COLORS.whiteColor,
		display: 'inline-block',
		wordBreak: 'break-word'
	},
	chatBubbleLeft: {
		padding: '10px',
		textAlign: 'left',
		borderRadius: '15px 15px 15px 0px',
		fontSize: '12px',
		background: COLORS.chatClientBG,
		color: COLORS.backgroundDark,
		display: 'inline-block',
		wordBreak: 'break-word'
	},
	captionStyles: {
		fontSize: '10px',
		color: COLORS.secondaryDark
	},
	topDateChat: {
		textAlign: 'center',
		color: COLORS.backgroundDark,
		fontSize: '12px',
		"& > div": {
			background: '#DCF3FB',
			display: 'inline-block',
			padding: '5px 10px',
			margin: '10px 0',
			borderRadius: '5px'
		}
	}
}));

const ChatMain = (props) => {
	const { state, updateState } = props;
	const classes = useStyles();
	const messagesEndRef = useRef(null)
	const { t } = useTranslation()
	const scrollToBottom = () => {
		messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
	}
	const checkPacketType = (email) => decodeURIComponent(email) == state.userAuthData.email;
	let previousDate = null;

	useEffect(scrollToBottom, [state.previousChatMessages]);

	const validatePreviousDay = (index) => {
		const indexedDate = state.previousChatMessages[index].createdAt
		const isToday = moment(indexedDate).diff(+ new Date(), 'days');
		if (isToday == 0 && !moment(previousDate).isSame(indexedDate, 'day')) {
			previousDate = indexedDate;
			return (
				<div>
					{t('str_today')}
				</div>
			)
		}
		else if (isToday == -1 && !moment(previousDate).isSame(indexedDate, 'day')) {
			previousDate = indexedDate;
			return (
				<div>
					{t('str_yesterday')}
				</div>
			)
		}
		else if (index == 0) {
			previousDate = indexedDate
			return (
				<div>
					{moment(indexedDate).format("dddd, MMM DD")}
				</div>
			)
		}
		else if (moment(indexedDate).isAfter(previousDate, 'day')) {
			previousDate = indexedDate
			return (
				<div>
					{moment(indexedDate).format("dddd, MMM DD")}
				</div>
			)
		} else {
			return null
		}
	}

	return (
		<Grid container className={classes.root}>
			<Grid item xs={12} sm={12} lg={12} md={12} >
				<List className={classes.messageArea} disablePadding>
					{state.previousChatMessages && state.previousChatMessages.length > 0 && state.previousChatMessages.map((packet, index) => {
						return (
							<React.Fragment key={packet.createdAt}>
								<div className={classes.topDateChat}>
									{validatePreviousDay(index)}
								</div>
								<ListItem style={managePadding}>
									<Grid container justify={
										checkPacketType(packet.email) ?
											'flex-end' :
											'flex-start'
									}>
										<Grid item xs={12} sm={10} md={10} lg={10}>
											<ListItemText
												align={
													checkPacketType(packet.email) ?
														'right' : 'left'
												}
												primary={
													<React.Fragment>
														<Typography variant="body2" className={
															checkPacketType(packet.email) ?
																classes.chatBubbleRight :
																classes.chatBubbleLeft}
														>
															{packet.text}
														</Typography>
													</React.Fragment>
												}
												secondary={
													<Typography variant="caption"
														className={classes.captionStyles}>
														{moment(packet.createdAt).format("hh:mm A")}
													</Typography >
												}
											/>
										</Grid>
									</Grid>
								</ListItem>
							</React.Fragment>
						)
					})}
					<div ref={messagesEndRef} />
				</List>
			</Grid >
		</Grid >
	)
}

const mapStateToProps = (state) => {
	return {
		state: state.formReducer.oLiveChat
	}
}

const mapDispatchToProps = (dispatch) => ({
	updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
	setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ChatMain)
