const uuidV4 = require('uuid/v4')

const configuration = (state, action) => {
  if (state && state.id !== action.id) {
    return state
  }
  switch (action.type) {
    case 'TOGGLE_CONFIGURATION':
      return {
        ...state,
        enabled: typeof action.enabled !== 'undefined' ? action.enabled : !state.enabled
      }
    case 'ADD_CONFIGURATION':
      return Object.assign({}, action.configuration, { id: uuidV4(), created_at: Date.now(), updated_at: Date.now(), enabled: false })
    case 'SAVE_CONFIGURATION':
      // the last array is a hot fix for issue #16
      // saving the configuration should currently not include overwriting the enabled state
      return Object.assign({}, state, action.configuration, { enabled: state.enabled, updated_at: Date.now() })
    case 'DELETE_CONFIGURATION':
      return {
        ...state,
        enabled: false,
        updated_at: Date.now(),
        deleted_at: Date.now()
      }
    default:
      return state
  }
}

const configurations = function (state = [], action) {
  switch (action.type) {
    case 'TOGGLE_CONFIGURATION':
    case 'SAVE_CONFIGURATION':
    case 'DELETE_CONFIGURATION':
      return state.map(i =>
        configuration(i, action)
      )
    /* case 'DELETE_CONFIGURATION':
      return state.filter(i =>
        i.id !== action.id
      ) */
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
