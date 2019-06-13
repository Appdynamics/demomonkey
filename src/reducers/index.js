import {combineReducers} from 'redux'
import configurations from './configurations'
import currentView from './currentView'
import connectionState from './connectionState'
import settings from './settings'
import monkeyID from './monkeyID'

const reducers = combineReducers({configurations, currentView, connectionState, settings, monkeyID})

export default reducers
