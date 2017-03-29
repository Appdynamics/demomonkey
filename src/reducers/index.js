import {combineReducers} from 'redux'
import configurations from './configurations'
import currentView from './currentView'
import settings from './settings'

const reducers = combineReducers({configurations, currentView, settings})

export default reducers
