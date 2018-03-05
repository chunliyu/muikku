import actions from '../base/notifications';
import promisify from '~/util/promisify';
import {AnyActionType, SpecificActionType} from '~/actions';
import mApi from '~/lib/mApi';
import { HOPSDataType, HOPSStatusType } from '~/reducers/main-function/hops';

export interface UpdateHopsTriggerType {
  ():AnyActionType
}

export interface SetHopsToTriggerType {
  (newHops: HOPSDataType):AnyActionType
}

export interface UPDATE_HOPS extends SpecificActionType<"UPDATE_HOPS", HOPSDataType>{}
export interface UPDATE_HOPS_STATUS extends SpecificActionType<"UPDATE_HOPS_STATUS", HOPSStatusType>{}

let updateHops:UpdateHopsTriggerType = function updateHops() {
  return async (dispatch:(arg:AnyActionType)=>any, getState:()=>any)=>{
    try {
      if (getState().hops.status !== "WAIT"){
        return null;
      }
      dispatch({
        type: 'UPDATE_HOPS_STATUS',
        payload: <HOPSStatusType>"LOADING"
      });
      dispatch({
        type: 'UPDATE_HOPS',
        payload: <HOPSDataType>(await promisify(mApi().records.hops.read(), 'callback')())
      });
      dispatch({
        type: 'UPDATE_HOPS_STATUS',
        payload: <HOPSStatusType>"READY"
      });
    } catch (err){
      dispatch(actions.displayNotification(err.message, 'error'));
      dispatch({
        type: 'UPDATE_HOPS_STATUS',
        payload: <HOPSStatusType>"ERROR"
      });
    }
  }
}

let setHopsTo:SetHopsToTriggerType = function setHopsTo(newHops){
  return async (dispatch:(arg:AnyActionType)=>any, getState:()=>any)=>{
    try {
      dispatch({
        type: 'UPDATE_HOPS',
        payload: <HOPSDataType>(await promisify(mApi().records.hops.update(newHops), 'callback')())
      });
    } catch (err){
      dispatch(actions.displayNotification(err.message, 'error'));
    }
  }
}

export default {updateHops, setHopsTo};
export {updateHops, setHopsTo};