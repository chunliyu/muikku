import App from '~/containers/workspace';
import reducer from '~/reducers/workspace';
import runApp from '~/run';

import mainFunctionDefault from '~/util/base-main-function';
import { updateWorkspaceEditModeState } from '~/actions/workspaces';
import {Action} from 'redux';
import tabOrMouse from '~/util/tab-or-mouse';

runApp(reducer, App, (store)=>{
  tabOrMouse();

  if (store.getState().status.permissions.WORKSPACE_MANAGE_WORKSPACE) {
    store.dispatch(<Action>updateWorkspaceEditModeState({available: true}, true));
  }
  let websocket = null;
  if (store.getState().status.loggedIn) {
    websocket = mainFunctionDefault(store, {setupMessages: false});
  }
  return {websocket};
});
