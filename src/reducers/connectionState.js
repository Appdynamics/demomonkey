const connectionState = function (state = '', action) {
  switch (action.type) {
    case 'SET_CONNECTION_STATE':
      return action.connectionState
    default:
      return state
  }
}

export default connectionState
