import notifications from './base/notifications';
import locales from './base/locales';
import status from './base/status';
import i18n from './base/i18n';
import messages from './main-function/messages';
import communicatorNavigation from './main-function/communicator/communicator-navigation';
import communicatorMessages from './main-function/communicator/communicator-messages';
import title from './base/title';

import {combineReducers} from 'redux';

export default combineReducers({
  notifications,
  i18n,
  locales,
  status,
  messages,
  communicatorNavigation,
  communicatorMessages,
  title
});