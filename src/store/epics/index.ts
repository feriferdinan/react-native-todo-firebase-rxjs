import {combineEpics} from 'redux-observable';

import {
  getTodosEpic,
  addTodoEpic,
  editTodoEpic,
  deleteTodoEpic,
  syncTodoEpic,
} from './todos';

export const rootEpic = combineEpics(
  getTodosEpic,
  addTodoEpic,
  editTodoEpic,
  deleteTodoEpic,
  syncTodoEpic,
);

export default rootEpic;
