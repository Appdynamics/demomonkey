const uuidV4 = require('uuid/v4')

const optionalFeatures = function (state, action) {
  switch (action.type) {
    case 'TOGGLE_OPTIONAL_FEATURE':
      state[action.optionalFeature] = !state[action.optionalFeature]
      return state
    default:
      return state
  }
}

const connections = function (state, action) {
  switch (action.type) {
    case 'ADD_CONNECTION':
      if (action.connection.key === false) {
        return [
          ...state,
          Object.assign(action.connection, {key: uuidV4()})
        ]
      }
      return state.map(c => {
        if (c.key === action.connection.key) {
          return action.connection
        }
        return c
      })
    case 'REMOVE_CONNECTION':
      return state.filter(c => c.key !== action.key)
    default:
      return state
  }
}

const settings = function (state = '', action) {
  switch (action.type) {
    case 'SET_MONKEY_INTERVAL':
      return {
        ...state,
        monkeyInterval: action.monkeyInterval
      }
    case 'SET_BASE_TEMPLATE':
      return {
        ...state,
        baseTemplate: action.baseTemplate
      }
    case 'TOGGLE_DEBUG_MODE':
      return {
        ...state,
        debugMode: !state.debugMode
      }
    case 'TOGGLE_OPTIONAL_FEATURE':
      return {
        ...state,
        optionalFeatures: optionalFeatures(state.optionalFeatures, action)
      }
    case 'ADD_CONNECTION':
    case 'REMOVE_CONNECTION':
      return {
        ...state,
        remoteConnections: connections(state.remoteConnections, action)
      }
    default:
      return state
  }
}

export default settings
