const uuidV4 = require('uuid/v4')

const configuration = (state, action) => {
  if (state && state.id !== action.id) {
    return state
  }
  switch (action.type) {
    case 'TOGGLE_CONFIGURATION':
      return {
        ...state,
        enabled: !state.enabled
      }
    case 'ADD_CONFIGURATION':
      return Object.assign({}, action.configuration, { id: uuidV4() })
    case 'SAVE_CONFIGURATION':
      // the last array is a hot fix for issue #16
      // saving the configuration should currently not include overwriting the enabled state
      return Object.assign({}, state, action.configuration, { enabled: state.enabled })
    default:
      return state
  }
}

const configurations = function (state = [], action) {
  switch (action.type) {
    case 'TOGGLE_CONFIGURATION':
    case 'SAVE_CONFIGURATION':
      return state.map(i =>
        configuration(i, action)
      )
    case 'DELETE_CONFIGURATION':
      return state.filter(i =>
        i.id !== action.id
      )
    case 'ADD_CONFIGURATION':
      return [
        ...state,
        configuration(undefined, action)
      ]
    default:
      return state
  }
}

export default configurations
