import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles'
import WebCmsGlobal from 'components/webcms-global';
import axios from 'axios'

import { updateState, setToState } from 'state/actions';
import useTranslation from 'lib/translations/hooks/useTranslation'
import socket from '@webcms-socket'

const ValidationTextField = withStyles({
	root: {
		'& input:valid + fieldset': {
			borderColor: 'green',
			borderWidth: 2,
		},
		'& input:invalid + fieldset': {
			borderColor: 'red',
			borderWidth: 2,
		},
		'& input:valid:focus + fieldset': {
			borderLeftWidth: 6,
			padding: '4px !important', // override inline-style
		},
	},
})(TextField)

const EmailDialogue = (props) => {
	const { state, updateState, setToState } = props;
	const { email, name } = state.userAuthData;
	const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
	const { t } = useTranslation()

	const handleDialogueClose = () => {
		updateState(
			'oLiveChat',
			'widgetVisibility',
			!state.widgetVisibility
		)
		updateState(
			'oLiveChat',
			'userAuthDialogueVisbility',
			!state.userAuthDialogueVisbility
		)
	}

	const handleValidation = () => {
		let errors = {};
		//Name
		if (name) {
			if (!name.trim()) {
				errors["name"] = "Cannot be empty";
			}

			if (name.trim() !== "") {
				if (!name.match(/^[a-zA-Z]+$/)) {
					errors["name"] = "Only letters";
				}
			}
		}
		//Email

		if (email) {
			if (!email.trim()) {
				errors["email"] = "Cannot be empty";
			}

			if (email.trim() !== "") {
				let lastAtPos = email.lastIndexOf('@');
				let lastDotPos = email.lastIndexOf('.');

				if (
					!(lastAtPos < lastDotPos && lastAtPos > 0 &&
						email.indexOf('@@') == -1 && lastDotPos > 2
						&& (email.length - lastDotPos) > 2)
				) {
					errors["email"] = "Email is not valid";
				}
			}
		}
		return errors;
	}

	const handleSubmit = (e) => {
		e.preventDefault();
		const errors = handleValidation();
		const formInvalid = Object.values(errors).length;
		if (!formInvalid) {
			axios({
				url: GENERAL_SETTINGS.BASE_URL + 'api/validation/email?',
				method: 'post',
				params: {
					email
				}
			}).then((emailValidResponse) => {
				if (emailValidResponse.data.success) {
					socket.emit("join", {
						"name": name,
						"email": encodeURI(email),
						"room": encodeURI(email),
						"isloggedin": false,
						"hotelrefno": GENERAL_SETTINGS.HOTELREFNO,
						"hotelpid": GENERAL_SETTINGS.HOTELPID || null
					})
					updateState(
						'oLiveChat',
						'initialScreen',
						0
					)
					updateState(
						'oLiveChat',
						'widgetVisibility',
						true
					)
					updateState(
						'oLiveChat',
						'userAuthDialogueVisbility',
						false
					)
				}
			})
		}
	}

	const handleInputChange = (e) => {
		if (e.target.id == "name") {
			setToState(
				'oLiveChat',
				['userAuthData', 'name'],
				e.target.value
			)
		} else {
			setToState(
				'oLiveChat',
				['userAuthData', 'email'],
				e.target.value
			)
		}
	}

	return (
		<React.Fragment>
			<form id="getmail_form" onSubmit={handleSubmit}>
				<Dialog open={state.userAuthDialogueVisbility} onClose={handleDialogueClose} aria-labelledby="form-dialog-title">
					<DialogTitle id="form-dialog-title">{t('str_logInHere')}</DialogTitle>
					<DialogContent>
						<ValidationTextField
							id="name"
							onChange={handleInputChange}
							error={Object.keys(
								handleValidation())
								.filter(val => val == "name").length
								? true : false
							}
							helperText={handleValidation().name}
							value={name}
							type="text"
							label={t('str_fullName')}
							margin="dense"
							variant="outlined"
							fullWidth
						/>
						<ValidationTextField
							id="email"
							onChange={handleInputChange}
							error={Object.keys(
								handleValidation())
								.filter(val => val == "email").length
								? true : false
							}
							helperText={handleValidation().email}
							value={email}
							type="email"
							label={t('str_email')}
							margin="dense"
							variant="outlined"
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={handleDialogueClose}
							color="primary">
							{t('str_cancel')}
					  </Button>
						<Button
							type="submit"
							form="getmail_form"
							disabled={!(name && email)}
							color="primary">
							{t('str_login')}
					  </Button>
					</DialogActions>
				</Dialog>
			</form >
		</React.Fragment>
	)
}


const mapStateToProps = (state) => {
	return {
		state: state.formReducer.oLiveChat,
	}
}

const mapDispatchToProps = (dispatch) => ({
	updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
	setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(EmailDialogue)