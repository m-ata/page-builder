import React, { useEffect, useContext, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer'
import IconButton from '@material-ui/core/IconButton'
import { updateState, setToState, pushToState } from 'state/actions'
import ConditionalComponentRender from './index'
import socket from '@webcms-socket'
import WebCmsGlobal from '../../webcms-global'

const useStyles = makeStyles({
    root: {
        background: '#4666B0',
        color: 'white',
        padding: 16,
        position: 'fixed',
        bottom: 24,
        right: 24,
        '&:hover': {
            background: '#38518c'
        }
    },
    iconSize: {
        fontSize: 28
    }
});

const chatText = {
    validEmail: 'Valid Email',
    hasJoined: 'has joined the chat'
}

const OliveChatClient = (props) => {
    const { state, updateState, setToState, pushToState } = props
    const classes = useStyles()

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { email, name } = state.userAuthData
    const [ chatIsAvailable, setChatIsAvailable ] = useState(false)

    const [isClientJoin, setIsClientJoin] = useState({
        canUse: null,
        wait: false
    })

    const [chatHistory, setChatHistory] = useState({
        isLoad: null,
        wait: false
    })

    const isLogin = useSelector((state) => state.orest.currentUser && state.orest.currentUser.auth) ? true : false
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo);

    useEffect(() => {
        let active = true

        if(active && isClientJoin.canUse === null && isClientJoin.wait === false){
            getClientOnload()
        }

        if(active){
            catchMessageFromServer()
            catchNewMessageCatch()
        }

        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        let active = true

        if(
            active
            && isClientJoin.wait === false
            && isClientJoin.canUse === true
            && chatHistory.isLoad === null
            && chatHistory.wait === false
        ){
            getChatHistory()
        }

        if(
            active
            && isClientJoin.wait === false
            && isClientJoin.canUse === true
            && chatHistory.wait === false
        ){
            setChatIsAvailable(true)
        }

        return () => {
            active = false
        }
    }, [isClientJoin, chatHistory])

    const getClientOnload = () => {
        setIsClientJoin({ ...isClientJoin, wait: true})
        let loginData = {}
        if (!isLogin && (email && name)) {
            loginData = {
                "name": name,
                "email": encodeURI(email),
                "room": encodeURI(email),
                "isloggedin": false,
                "hotelrefno": GENERAL_SETTINGS.HOTELREFNO,
                "hotelpid": GENERAL_SETTINGS.HOTELPID || null
            }
        } else if (isLogin) {
            loginData = {
                "name": loginfo?.firstname,
                "email": encodeURI(loginfo?.email),
                "room":  encodeURI(loginfo?.email),
                "isloggedin": true,
                "hotelrefno": GENERAL_SETTINGS.HOTELREFNO,
                "hotelpid": GENERAL_SETTINGS.HOTELPID || null
            }
            setToState('oLiveChat', ['userAuthData', 'email'], loginfo?.email)
            setToState('oLiveChat', ['userAuthData', 'name'], `${loginfo?.firstname} ${loginfo?.lastname}`)
        }

        if(loginData.name && loginData.email){
            socket.emit("join", loginData)
        }
    }

    const catchNewMessageCatch = () => {
        socket.on('getNewMessage', (message) => {
            if(state.previousChatMessages && state.previousChatMessages.length > 0){
                setToState('oLiveChat', ['previousChatMessages'], [message])
            }else{
                pushToState('oLiveChat', ['previousChatMessages'], [message])
            }
        })
    }

    const getChatHistory = () => {
        setChatHistory({ ...chatHistory, wait: true})
        socket.emit('chatHistory')
        socket.on("getChatHistory", (messages) => {
            updateState('oLiveChat', 'previousChatMessages', messages)
            setChatHistory({ ...chatHistory, isLoad: true, wait: false})
        })
    }

    const catchMessageFromServer = () => {
        socket.on('messageFromServer', function(obj) {
            if (!obj.text.includes(chatText.validEmail)) {
                if (obj.text.includes(chatText.hasJoined) && obj.level === 1) {
                    setIsClientJoin({ wait: false, canUse: true })
                } else {
                    setIsClientJoin({ wait: false, canUse: false })
                }
            }
        })
    }

    const handleWidgetVisibility = () => {
        if (email || loginfo?.email) {
            updateState(
                'oLiveChat',
                'widgetVisibility',
                !state.widgetVisibility
            )
        }
        else {
            updateState(
                'oLiveChat',
                'initialScreen',
                "dialogue"
            )
            updateState(
                'oLiveChat',
                'widgetVisibility',
                !state.widgetVisibility
            )
            updateState(
                'oLiveChat',
                'userAuthDialogueVisbility',
                !state.widgetVisibility
            )
        }
    }

    return (
        <React.Fragment>
            {!state.widgetVisibility ?
                <IconButton
                    aria-label="widget-opener"
                    onClick={() => handleWidgetVisibility()}
                    className={classes.root}
                >
                    <QuestionAnswerIcon className={classes.iconSize} />
                </IconButton> :
                <ConditionalComponentRender
                    chatIsAvailable={chatIsAvailable}
                />
            }
        </React.Fragment>
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
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(OliveChatClient)