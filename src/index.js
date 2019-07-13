import produce from 'immer';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects';

export const mjsApp = (function () {
  const se=sagaEffects;
  se.mSelect = (name) => se.select(s => s[name]);

  const loading = {
    name: 'loading',
    state: {
      global: false,
      effects: {},
      models: {},
    },
    reducers: {
      change(state, action) {
        return { ...state, ...action.payload };
      }
    }
  };

  const loadingChange = (type, bool) => {
    const { getState, dispatch } = conf.store;
    const model = type.split('/')[0];
    const { loading: { effects, models } } = getState();
    dispatch({
      type: 'loading/change',
      payload: { global: bool, effects: { ...effects, [type]: bool }, models: { ...models, [model]: bool } }
    });
  };

  const conf = {
    store: {},
    models: [loading],
  };

  const models = (models) => conf.models = [...conf.models, ...models];

  const plugins = () => { };

  let cbError;
  const onError = (func) => cbError = func;

  const start = () => {
    const reducers = {}, effects = [];
    conf.models.forEach(m => {
      handleModel(m);
      m.reducers && (reducers[m.name] = handleReducers(m.state || {}, m.reducers));
      m.effects && (effects.push(handleEffects(m.effects, cbError, loadingChange)));
    });

    const sagaMiddleware = createSagaMiddleware();
    conf.store = createStore(combineReducers(reducers), applyMiddleware(sagaMiddleware));
    effects.forEach(sagaMiddleware.run);
  };

  const handleReducersAndEffectsPrefix = (obj, name) => {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[`${name}/${key}`] = obj[key];
      return newObj;
    }, {});
  };

  const handleModel = (model) => {
    const { name, reducers, effects } = model;
    reducers && (model.reducers = handleReducersAndEffectsPrefix(reducers, name));
    effects && (model.effects = handleReducersAndEffectsPrefix(effects, name));
  };

  const handleReducers = (initState, reducers) => {
    return (state = initState, action) => {
      const { type } = action;
      const ret = produce(state, draft => {
        const handler = reducers[type];
        if (handler) {
          const compatiableRet = handler(draft, action);
          if (compatiableRet !== undefined) {
            return compatiableRet;
          }
        }
      });
      return ret === undefined ? {} : ret;
    };
  };

  const handleEffects = (effects, cbError, loadingChange) => {
    const sagas = Object.keys(effects).map(k =>
      se.takeEvery(k,
        handleSaga(k, effects[k], cbError, loadingChange),
        se));
    return function* () {
      yield se.all(sagas);
    };
  };

  const handleSaga = (type, effect, cbError, loadingChange) => {
    return function* (se, action) {
      const { call } = se;
      try {
        yield call(loadingChange, type, true);
        yield effect(se, action);
      } catch (e) {
        cbError && cbError(e);
      } finally {
        yield call(loadingChange, type, false);
      }
    }
  };

  return { conf, models, plugins, start, onError };
})();