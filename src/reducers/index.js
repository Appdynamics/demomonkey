import {combineReducers} from 'redux'
import configurations from './configurations'
import currentView from './currentView'

const reducers = combineReducers({configurations, currentView})

export default reducers
