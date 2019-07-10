
import produce from 'immer';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects';

export const mjsApp = (function () {
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

  const init = (initConf) => {
    let { plugin, models, onError } = initConf;
    models || (models = []);
    onError || (onError = () => { });
    const reducers = {}, effects = [];
    conf.models = [...conf.models, ...models];
    conf.models.forEach(m => {
      handleModel(m);
      m.reducers && (reducers[m.name] = handleReducers(m.state || {}, m.reducers));
      m.effects && (effects.push(handleEffects(m.effects, onError)));
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

  const handleEffects = (effects, onError) => {
    const sagas = Object.keys(effects).map(k => sagaEffects.takeEvery(k, handleSaga(k, effects[k], onError), sagaEffects));
    return function* () {
      yield sagaEffects.all(sagas);
    };
  };

  const handleSaga = (type, effect, onError) => {
    return function* (sagaEffects, action) {
      const { call } = sagaEffects;
      try {
        yield call(loadingChange, type, true);
        yield effect(sagaEffects, action); 
      } catch (e) {
        onError(e);
      } finally{
        yield call(loadingChange, type, false);
      }
    }
  };

  return { conf, init };
})();