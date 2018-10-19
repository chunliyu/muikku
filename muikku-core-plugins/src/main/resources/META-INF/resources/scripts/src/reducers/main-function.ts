import notifications from './base/notifications';
import locales from './base/locales';
import status from './base/status';
import i18n from './base/i18n';
import title from './base/title';
import websocket from './util/websocket';

import messages from './main-function/messages';
import announcements from './main-function/announcements';
import workspaces from './main-function/workspaces';

import courses from './main-function/courses';

import userIndex from './main-function/user-index';

import discussion from '~/reducers/main-function/discussion';

import guider from './main-function/guider';

import profile from './main-function/profile';

import {combineReducers} from 'redux';

export default combineReducers({
  notifications,
  i18n,
  locales,
  status,
  websocket,
  title,
  
  userIndex,
  
  announcements,
  workspaces,
  messages,
  courses,
  discussion,
  guider,
  profile
});