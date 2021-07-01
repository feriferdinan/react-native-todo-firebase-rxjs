import firestore from '@react-native-firebase/firestore';
import {switchMap} from 'rxjs/operators';
import {ofType} from 'redux-observable';
import {of} from 'rxjs';

export const getTodosEpic = (action$: any, store: any) =>
  action$.pipe(
    ofType('REQUEST_TODOS'),
    switchMap(() =>
      firestore()
        .collection('users')
        .doc(store.value.auth.user?.uid)
        .collection('todos')
        .orderBy('createAt', 'desc')
        .get()
        .then(response => {
          let payload: any = [];
          response.forEach(doc =>
            payload.push({
              ...doc.data(),
              fireId: doc.id,
            }),
          );
          return {type: 'SET_TODOS', payload};
        }),
    ),
  );

export const addTodoEpic = (action$: any, store: any) =>
  action$.pipe(
    ofType('ADD_TODO_REQ'),
    switchMap(({payload}: any) => {
      const isPending = payload?.isPendingAdd;
      if (store.value.apps.isOffline) {
        Object.assign(payload, {
          isPendingAdd: true,
        });
        return Promise.resolve({type: 'ADD_TODO', payload});
      } else {
        return firestore()
          .collection('users')
          .doc(store.value.auth.user?.uid)
          .collection('todos')
          .add(payload)
          .then(({id: fireId}: any) => {
            Object.assign(payload, {
              fireId,
            });
            if (isPending) {
              Object.assign(payload, {
                isPendingAdd: false,
              });
              return {type: 'UPDATE_TODO', payload};
            } else {
              return {type: 'ADD_TODO', payload};
            }
          });
      }
    }),
  );

export const editTodoEpic = (action$: any, store: any) =>
  action$.pipe(
    ofType('UPDATE_TODO'),
    switchMap(async ({payload}: any) => {
      if (store.value.apps.isOffline) {
        Object.assign(payload, {
          isPendingEdit: true,
        });
        return Promise.resolve({type: 'UPDATE_TODO_SUCCESS', payload});
      } else {
        const {exists} = await firestore()
          .collection('users')
          .doc(store.value.auth.user?.uid)
          .collection('todos')
          .doc(payload?.fireId)
          .get();
        if (exists) {
          return firestore()
            .collection('users')
            .doc(store.value.auth.user?.uid)
            .collection('todos')
            .doc(payload?.fireId)
            .update(payload)
            .then(() => {
              Object.assign(payload, {
                isPendingEdit: false,
                isPendingAdd: false,
              });
              return {type: 'UPDATE_TODO_SUCCESS'};
            });
        } else {
          return {type: 'UPDATE_TODO_SUCCESS', payload};
        }
      }
    }),
  );

export const deleteTodoEpic = (action$: any, store: any) =>
  action$.pipe(
    ofType('DELETE_TODO'),
    switchMap(({payload}: any) =>
      firestore()
        .collection('users')
        .doc(store.value.auth.user?.uid)
        .collection('todos')
        .doc(payload.fireId)
        .delete()
        .then(() => ({type: 'SUCCESS_DELETE_TODO'})),
    ),
  );

export const syncTodoEpic = (action$: any, store: any) =>
  action$.pipe(
    ofType('SYNC_TODO'),
    switchMap(async () => {
      const pendingData = store.value.todos.data.filter(
        (e: any) => e.isPendingAdd || e.pendingEdit,
      );
      if (pendingData.length > 0) {
        const promise = await pendingData.reduce((p: any, x: any) => {
          if (x.isPendingAdd) {
            return Promise.resolve({type: 'ADD_TODO_REQ', payload: x});
          }
          if (x.pendingEdit) {
            return Promise.resolve({type: 'UPDATE_TODO_REQ', payload: x});
          }
        }, Promise.resolve({type: 'SYNC1'}));
        console.warn(promise);
        return promise;
      }
      return Promise.resolve({type: 'SYNC2'});
    }),
  );
