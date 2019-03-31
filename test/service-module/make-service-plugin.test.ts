/*
eslint
@typescript-eslint/explicit-function-return-type: 0,
@typescript-eslint/no-explicit-any: 0
*/
import { assert } from 'chai'
import Vue from 'vue'
import Vuex from 'vuex'
import { clearModels } from '../../src/service-module/global-models'
import { feathersRestClient as feathers } from '../../test/fixtures/feathers-client'
import feathersVuex from '../../src/index'
import { pick as _pick, omit as _omit } from 'lodash'

Vue.use(Vuex)

describe('makeServicePlugin', function() {
  beforeEach(() => {
    clearModels()
  })

  it('registers the vuex module with options', function() {
    interface RootState {
      todos: {}
    }

    const serverAlias = 'default'
    const { makeServicePlugin, BaseModel } = feathersVuex(feathers, {
      serverAlias
    })
    const servicePath = 'todos'
    class Todo extends BaseModel {
      public servicePath = servicePath
    }
    const todosPlugin = makeServicePlugin({
      servicePath,
      Model: Todo,
      service: feathers.service(servicePath)
    })
    const store = new Vuex.Store<RootState>({ plugins: [todosPlugin] })

    const keys = Object.keys(store.state.todos)
    const received = _pick(store.state.todos, keys)
    const expected = {
      addOnUpsert: false,
      autoRemove: false,
      debug: false,
      copiesById: {},
      diffOnPatch: true,
      enableEvents: true,
      errorOnCreate: null,
      errorOnFind: null,
      errorOnGet: null,
      errorOnPatch: null,
      errorOnRemove: null,
      errorOnUpdate: null,
      idField: 'id',
      tempIdField: '__id',
      ids: [],
      instanceDefaults: () => ({}),
      isCreatePending: false,
      isFindPending: false,
      isGetPending: false,
      isPatchPending: false,
      isRemovePending: false,
      isUpdatePending: false,
      keepCopiesInStore: false,
      keyedById: {},
      modelName: 'Todo',
      nameStyle: 'short',
      namespace: 'todos',
      pagination: {},
      paramsForServer: [],
      preferUpdate: false,
      replaceItems: false,
      serverAlias: 'default',
      servicePath: 'todos',
      skipRequestIfExists: false,
      setupInstance: item => item,
      serialize: item => item,
      tempsById: {},
      whitelist: []
    }

    assert.deepEqual(
      _omit(received, ['instanceDefaults', 'serialize', 'setupInstance']),
      // @ts-ignore
      _omit(expected, ['instanceDefaults', 'serialize', 'setupInstance']),
      'The module was registered.'
    )
    // @ts-ignore
    assert.equal(typeof received.serialize, 'function')
    // @ts-ignore
    assert.equal(typeof received.setupInstance, 'function')
    // @ts-ignore
    assert.equal(typeof received.instanceDefaults, 'function')
  })

  it('sets up Model.store && service.FeathersVuexModel', function() {
    const serverAlias = 'default'
    const { makeServicePlugin, BaseModel } = feathersVuex(feathers, {
      serverAlias
    })

    const servicePath = 'todos'
    const service = feathers.service(servicePath)
    class Todo extends BaseModel {
      public servicePath = servicePath
    }
    const todosPlugin = makeServicePlugin({ servicePath, Model: Todo, service })
    const store = new Vuex.Store({ plugins: [todosPlugin] })

    assert(Todo.store === store, 'the store is on the Model!')
    // @ts-ignore
    assert.equal(service.FeathersVuexModel, Todo, 'Model accessible on service')
  })

  it('allows accessing other models', function() {
    const serverAlias = 'default'
    const { makeServicePlugin, BaseModel, models } = feathersVuex(feathers, {
      idField: '_id',
      serverAlias
    })

    const servicePath = 'todos'
    class Todo extends BaseModel {
      public servicePath = servicePath
    }
    const todosPlugin = makeServicePlugin({
      servicePath,
      Model: Todo,
      service: feathers.service(servicePath)
    })

    const store = new Vuex.Store({
      plugins: [todosPlugin]
    })

    assert(models[serverAlias][Todo.name] === Todo)
    assert(Todo.store === store)
  })
})
