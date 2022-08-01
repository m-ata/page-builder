import { applyMiddleware, combineReducers, createStore } from 'redux'
import thunkMiddleware from 'redux-thunk'
import FormReducer from '../reducers/formReducer'
import { reducer as notifications } from '../../model/notification'
import { reducer as orest } from '../../model/orest'
import { reducer as survey } from '../../model/survey'
import { reducer as hotelinfo} from '../../model/orest/components/ChangeHotel/redux_store'
import { reducer as google} from '../../model/google'
// import { offline } from '@redux-offline/redux-offline';
// import offlineConfig from '@redux-offline/redux-offline/lib/defaults';

const bindMiddleware = (middleware) => {
    if (process.env.PROJECT_ENV !== 'production') {
        const { composeWithDevTools } = require('redux-devtools-extension')
        return composeWithDevTools(applyMiddleware(...middleware))
    }
    return applyMiddleware(...middleware)
}

const initStore = () => {
    return createStore(
        combineReducers({
            formReducer: FormReducer,
            notifications: notifications,
            orest: orest,
            hotelinfo:hotelinfo,
            survey: survey,
            google: google
        }),
        bindMiddleware([thunkMiddleware])
        // compose(
        //     bindMiddleware([thunkMiddleware]),
        //     offline(offlineConfig)
        // )
    )
}

export default initStore
