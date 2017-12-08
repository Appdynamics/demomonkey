const optionalFeatures = function (state, action) {
  switch (action.type) {
    case 'TOGGLE_OPTIONAL_FEATURE':
      state[action.optionalFeature] = !state[action.optionalFeature]
      return state
    default:
      return state
  }
}

const connectors = function (state, action) {
  switch (action.type) {
    case 'ADD_CONNECTOR':
      return Object.assign({}, state, action.connector)
    case 'REMOVE_CONNECTOR':
      var newState = state
      delete newState[action.connector]
      return newState
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
    case 'TOGGLE_OPTIONAL_FEATURE':
      return {
        ...state,
        optionalFeatures: optionalFeatures(state.optionalFeatures, action)
      }
    case 'ADD_CONNECTOR':
    case 'REMOVE_CONNECTOR':
      return {
        ...state,
        connectors: connectors(state.connectors, action)
      }
    default:
      return state
  }
}

export default settings
