const initialState = {
  data: [],
};

const todos = (state = initialState, {type, payload}: any) => {
  switch (type) {
    case 'SET_TODOS':
      // const pendingData = state.data.filter((e: any) => e.isPendingAdd);
      // const newData = payload.filter((e: any) => !e.isPendingAdd);
      return {
        ...state,
        data: payload,
      };
    case 'ADD_TODO':
      return {
        ...state,
        data: [payload, ...state.data],
      };
    case 'UPDATE_TODO':
      return {
        ...state,
        data: state.data.map((e: any) =>
          e.id === payload?.id ? {...e, ...payload} : e,
        ),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        data: state.data.filter((e: any) => e.id !== payload?.id),
      };
    default:
      return state;
  }
};
export default todos;
