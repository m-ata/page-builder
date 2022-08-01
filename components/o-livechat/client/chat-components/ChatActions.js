import React, { useEffect, useState, useContext } from 'react'
import { connect } from 'react-redux'
import { updateState } from 'state/actions'

import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import SendIcon from '@material-ui/icons/Send'
import InputBase from '@material-ui/core/InputBase'
import InputAdornment from '@material-ui/core/InputAdornment'


import { makeStyles } from '@material-ui/core/styles'
import { COLORS } from '../../constants'


import ImageIcon from '@material-ui/icons/Image'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import Fab from '@material-ui/core/Fab'
import socket from '@webcms-socket'

const iconsStyles = {
    fontSize: '28px',
}

const useStyles = makeStyles(() => ({
    root: {
        padding: '8px 10px',
    },
    addEmoji: {
        padding: '16px',
        background: '#FAFAFA',
    },
    addAttachment: {
        padding: '8px 0',
        background: '#FAFAFA',
        textAlign: 'center',
    },
    addAttachmentIcons: {
        color: COLORS.whiteColor,
    },
    textDesc: {
        fontSize: '11px',
        color: COLORS.secondaryDark,
    },
    textAlignL: {
        textAlign: 'left',
    },
    textAlignR: {
        textAlign: 'right',
    },
    footerActions: {
        color: COLORS.backgroundLight,
        display: 'inline-block',
        cursor: 'pointer',
        '&:active': {
            color: COLORS.primary,
        },
    },
    tilt40: {
        transform: 'rotate(40deg)',
    },
    txtInput: {
        fontSize: '14px',
        color: COLORS.secondaryDark,

    },
    txtPlaceholder: {
        fontSize: '14px',
        color: COLORS.secondary,
        textAlign: 'center',
    },
}))


const ChatActions = (props) => {
    const classes = useStyles()
    const { state, updateState } = props
    const [message, setMessage] = useState("")

    const sendMessages = (message) => {
        socket.emit('newMessage', {
            text: message,
        })
    }

    const renderNext = () => {
        // updateState(
        // 	'oLiveChat',
        // 	'userAuthDialogueVisbility',
        // 	true
        // )
        updateState(
            'oLiveChat',
            'initialChatRenderState',
            false,
        )
    }

    const renderEmojiFunc = () => {
        updateState(
            'oLiveChat',
            'renderChatEmoji',
            !state.renderChatEmoji,
        )
        updateState(
            'oLiveChat',
            'renderChatAttachment',
            false,
        )
        updateState(
            'oLiveChat',
            'initialChatRenderState',
            false,
        )
    }

    const renderAttachmentFunc = () => {
        updateState(
            'oLiveChat',
            'renderChatAttachment',
            !state.renderChatAttachment,
        )
        updateState(
            'oLiveChat',
            'renderChatEmoji',
            false,
        )
        updateState(
            'oLiveChat',
            'initialChatRenderState',
            false,
        )
    }


    const renderInitialState = () => {
        return (
            <Grid container spacing={3} alignItems="center" onClick={renderNext}>
                {/* <Grid item xs={3}
					className={classes.textAlignL}>
					<InsertEmoticonIcon
						className={classes.footerActions}
						style={iconsStyles}
						onClick={renderEmojiFunc}
					/>
				</Grid> */}
                <Grid item xs={12}>
                    <Typography
                        component="h2"
                        variant="subtitle1"
                        className={classes.txtPlaceholder}>
                        Type your message here...
                    </Typography>
                </Grid>
                {/* <Grid item xs={3}
					className={classes.textAlignR}>
					<AttachFileIcon
						className={
							`${classes.footerActions}
                         ${classes.tilt40}
                         `
						}
						onClick={renderAttachmentFunc}
						style={iconsStyles} />
			</Grid> */}

            </Grid>
        )
    }
    const handleInputChange = (event) => {
        setMessage(event.target.value)
    }

    const handleSubmit = () => {
        if (message.length && message.trim().length) {
            sendMessages(message)
            setMessage('')
        }
    }

    const handleKeySubmit = async (e) => {
        if(event.keyCode == 13){
            e.preventDefault()
            handleSubmit()
        }
    }

    const renderNextState = () => {

        return (
            <Grid container alignItems="center">
                <InputBase
                    autoFocus
                    fullWidth
                    onChange={(e)=> handleInputChange(e)}
                    onKeyDown={(e) => handleKeySubmit(e)}
                    value={message}
                    placeholder="Start typing here"
                    id="input-with-icon-textfield"
                    className={classes.txtInput}
                    // startAdornment={
                    //     <InputAdornment position="start">
                    //         {/* <InsertEmoticonIcon
					// 			className={classes.footerActions}
					// 			style={iconsStyles}
					// 			onClick={renderEmojiFunc}
					// 		/>
					// 		<AttachFileIcon
					// 			className={
					// 				`${classes.footerActions}
					// 				 ${classes.tilt40}`
					// 			}
					// 			onClick={renderAttachmentFunc}
					// 			style={iconsStyles} /> */}
                    //     </InputAdornment>
                    // }
                    endAdornment={
                        <InputAdornment position="end">
                            <SendIcon
                                style={{
                                    ...iconsStyles,
                                    color: '#4666B0',
                                }}
                                onClick={()=> handleSubmit()}
                                className={classes.footerActions}
                            />
                        </InputAdornment>
                    }
                />
            </Grid>
        )
    }

    return (
        <React.Fragment>
            {/* upper footer */}
            <section className={classes.root}>
                {state.initialChatRenderState ?
                    renderInitialState() :
                    renderNextState()
                }
            </section>
            {/* upper footer ends */}

            {/* addional footer */}
            <section>
                {state.renderChatEmoji &&
                !state.renderChatAttachment && (
                    <section className={classes.addEmoji}>
                        Emojis Libarary goes here
                    </section>
                )}
                {!state.renderChatEmoji &&
                state.renderChatAttachment && (
                    <section className={classes.addAttachment}>
                        <Grid container>
                            <Grid item lg={3} md={3} sm={3} xs={6}>
                                <Fab
                                    size="small"
                                    style={{ background: '#439CF3' }}>
                                    <ImageIcon
                                        style={iconsStyles}
                                        className={classes.addAttachmentIcons}
                                    />
                                </Fab>
                                <Typography
                                    component="h2"
                                    variant="subtitle1"
                                    className={classes.textDesc}>
                                    Image
                                </Typography>
                            </Grid>
                            <Grid item lg={3} md={3} sm={3} xs={6}>
                                <Fab
                                    size="small"
                                    style={{ background: '#2FBBF0' }}
                                >
                                    <InsertDriveFileIcon
                                        style={iconsStyles}
                                        className={classes.addAttachmentIcons}
                                    />
                                </Fab>
                                <Typography
                                    component="h2"
                                    variant="subtitle1"
                                    className={classes.textDesc}>
                                    File
                                </Typography>
                            </Grid>
                            <Grid item lg={3} md={3} sm={3} xs={6}>
                                <Fab
                                    size="small"
                                    style={{ background: '#5CC54E' }}>
                                    <LocationOnIcon
                                        style={iconsStyles}
                                        className={classes.addAttachmentIcons}
                                    />
                                </Fab>
                                <Typography
                                    component="h2"
                                    variant="subtitle1"
                                    className={classes.textDesc}>
                                    Location
                                </Typography>
                            </Grid>
                            <Grid item lg={3} md={3} sm={3} xs={6}>
                                <Fab
                                    size="small"
                                    style={{ background: '#EA605E' }}>
                                    <PlayArrowIcon
                                        style={iconsStyles}
                                        className={classes.addAttachmentIcons}
                                    />
                                </Fab>
                                <Typography
                                    component="h2"
                                    variant="subtitle1"
                                    className={classes.textDesc}>
                                    Music
                                </Typography>
                            </Grid>
                        </Grid>
                    </section>
                )}
            </section>
            {/* additioanl footer ends */}
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

export default connect(mapStateToProps, mapDispatchToProps)(ChatActions)