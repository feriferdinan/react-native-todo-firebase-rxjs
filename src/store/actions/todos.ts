type Action = {
  type: string;
  payload?: any;
};

export const getTodos = (payload: any): Action => ({
  type: 'REQUEST_TODOS',
  payload,
});
export const addTodo = (payload: any): Action => ({
  type: 'ADD_TODO_REQ',
  payload,
});
export const editTodo = (payload: any): Action => ({
  type: 'UPDATE_TODO',
  payload,
});
export const deleteTodo = (payload: any): Action => ({
  type: 'DELETE_TODO',
  payload,
});
export const syncTodo = (): Action => ({
  type: 'SYNC_TODO',
});
