import {useMemo} from 'react'
import {bindActionCreators} from 'redux'
import {useDispatch} from 'react-redux'
import * as actions from './actions'

export default function useGoogle() {
    const dispatch = useDispatch();
    return useMemo(() => {
        return bindActionCreators(actions, dispatch)
    }, [dispatch])
}
