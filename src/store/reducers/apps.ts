const initialState = {
  isSplashing: true,
  isOffline: false,
};

const apps = (state = initialState, {type}: any) => {
  switch (type) {
    case 'SET_DONE_SPLASH':
      return {
        ...state,
        isSplashing: false,
      };
    case 'SET_ONLINE':
      return {
        ...state,
        isOffline: false,
      };
    case 'SET_OFFLINE':
      return {
        ...state,
        isOffline: true,
      };
    default:
      return state;
  }
};

export default apps;
