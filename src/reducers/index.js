import { combineReducers } from 'redux'
import configurations from './configurations'
import currentView from './currentView'
import connectionState from './connectionState'
import settings from './settings'
import monkeyID from './monkeyID'
import log from './log'

/*
This seems not to be the "way to go", but it fixes a lot of issues right now.
(https://github.com/reduxjs/redux/issues/580#issuecomment-133188511)
*/
const lastAction = function (state = '', action) {
  return action
}

const reducers = combineReducers({
  configurations,
  currentView,
  connectionState,
  settings,
  monkeyID,
  lastAction,
  log
})

export default reducers
