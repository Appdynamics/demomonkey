const settings = function (state = '', action) {
  switch (action.type) {
    case 'SET_BASE_TEMPLATE':
      return {
        ...state,
        baseTemplate: action.baseTemplate
      }
    default:
      return state
  }
}

export default settings
