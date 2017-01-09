const currentView = function(state = '', action) {
    switch (action.type) {
        case 'SET_CURRENT_VIEW':
            return action.view;
        default:
            return state;
    }
}

export default currentView
