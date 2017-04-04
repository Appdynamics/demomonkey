const optionalFeatures = function (state, action) {
  switch (action.type) {
    case 'TOGGLE_OPTIONAL_FEATURE':
      state[action.optionalFeature] = !state[action.optionalFeature]
      console.log(state)
      return state
    default:
      return state
  }
}

const settings = function (state = '', action) {
  console.log(state, action)
  switch (action.type) {
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
    default:
      return state
  }
}

export default settings
