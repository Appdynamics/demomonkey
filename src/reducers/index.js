import {combineReducers} from 'redux'
import configurations from './configurations'
import currentView from './currentView'
import settings from './settings'
import monkeyID from './monkeyID'

const reducers = combineReducers({configurations, currentView, settings, monkeyID})

export default reducers
