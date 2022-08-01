import {useDispatch} from 'react-redux';
import {useMemo} from 'react';
import {bindActionCreators} from 'redux';
import * as actions from './actions';

export default function useHotelInfoAction() {
    const dispatch = useDispatch()
    return useMemo(() => {
        return bindActionCreators(actions, dispatch)
    }, [dispatch])
}
