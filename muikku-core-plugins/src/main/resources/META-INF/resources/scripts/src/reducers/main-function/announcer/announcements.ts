import {ActionType} from '~/actions';

export interface AnnouncementType {
  archived: boolean,
  caption: string,
  content: string,
  created: string,
  endDate: string,
  id: number,
  publiclyVisible: boolean,
  publisherUserEntityId: number,
  startDate: string,
  temporalStatus: string,
  userGroupEntityIds: Array<number>,
  workspaceEntityIds: Array<number>,
  workspaces: Array<{
    id: number,
    urlName: string,
    name: string,
    nameExtension: string
  }>
}

export interface AnnouncementUpdateType {
  archived?: boolean,
  caption?: string,
  content?: string,
  created?: string,
  endDate?: string,
  publiclyVisible?: boolean,
  publisherUserEntityId?: number,
  startDate?: string,
  temporalStatus?: string,
  userGroupEntityIds?: Array<number>,
  workspaceEntityIds?: Array<number>,
  workspaces?: Array<{
    id: number,
    urlName: string,
    name: string,
    nameExtension: string
  }>
}

export interface AnnouncementListType extends Array<AnnouncementType> {}

export type AnnouncementsStateType = "LOADING" | "ERROR" | "READY";

export interface AnnouncementsType {
  state: AnnouncementsStateType,
  announcements: AnnouncementListType,
  current: AnnouncementType,
  selected: AnnouncementListType,
  selectedIds: Array<number>,
  location: string,
  toolbarLock: boolean
}

export interface AnnouncementsPatchType {
  state?: AnnouncementsStateType,
  announcements?: AnnouncementListType,
  selected?: AnnouncementListType,
  selectedIds?: Array<number>,
  location?: string,
  toolbarLock?: boolean,
  current?: AnnouncementType
}

export default function announcements(state: AnnouncementsType={
    state: "LOADING",
    announcements: [],
    current: null,
    selected: [],
    selectedIds: [],
    location: "",
    toolbarLock: false
}, action: ActionType): AnnouncementsType {
  if (action.type === "UPDATE_ANNOUNCEMENTS_STATE"){
    let newState: AnnouncementsStateType = action.payload;
    return Object.assign({}, state, {state: newState});
  } else if (action.type === "UPDATE_ANNOUNCEMENTS_ALL_PROPERTIES"){
    let newAllProperties: AnnouncementsPatchType = action.payload;
    return Object.assign({}, state, newAllProperties);
  } else if (action.type === "UPDATE_SELECTED_ANNOUNCEMENTS"){
    let newAnnouncements: AnnouncementListType = action.payload;
    return Object.assign({}, state, {selected: newAnnouncements, selectedIds: newAnnouncements.map((s: AnnouncementType)=>s.id)});
  } else if (action.type === "ADD_TO_ANNOUNCEMENTS_SELECTED"){
    let newAnnouncement: AnnouncementType = action.payload;
    return Object.assign({}, state, {
      selected: state.selected.concat([newAnnouncement]),
      selectedIds: state.selectedIds.concat([newAnnouncement.id])
    });
  } else if (action.type === "REMOVE_FROM_ANNOUNCEMENTS_SELECTED"){
    return Object.assign({}, state, {selected: state.selected.filter((selected: AnnouncementType)=>{
      return selected.id !== action.payload.id
    }), selectedIds: state.selectedIds.filter((id: number)=>{return id !== action.payload.id})});
  } else if (action.type === "UPDATE_ONE_ANNOUNCEMENT"){
    let update: AnnouncementUpdateType = action.payload.update;
    let oldAnnouncement: AnnouncementType = action.payload.announcement;
    let newAnnouncement: AnnouncementType = Object.assign({}, oldAnnouncement, update);
    return Object.assign({}, state, {selected: state.selected.map((selected: AnnouncementType)=>{
      if (selected.id === oldAnnouncement.id){
        return newAnnouncement
      }
      return selected;
    }), announcements: state.announcements.map((announcement: AnnouncementType)=>{
      if (announcement.id === oldAnnouncement.id){
        return newAnnouncement
      }
      return announcement;
    })});
  } else if (action.type === "LOCK_TOOLBAR"){
    return Object.assign({}, state, {toolbarLock: true});
  } else if (action.type === "UNLOCK_TOOLBAR"){
    return Object.assign({}, state, {toolbarLock: false});
  } else if (action.type === "DELETE_ANNOUNCEMENT"){
    return Object.assign({}, state, {selected: state.selected.filter((selected: AnnouncementType)=>{
      return selected.id !== action.payload.id
    }), announcements: state.announcements.filter((announcement: AnnouncementType)=>{
      return announcement.id !== action.payload.id
    }), selectedIds: state.selectedIds.filter((id: number)=>{return id !== action.payload.id})});
  } else if (action.type === "SET_CURRENT_ANNOUNCEMENT"){
    return Object.assign({}, state,{current: action.payload});
  }
  return state;
}