import actions from '../base/notifications';
import promisify from '~/util/promisify';
import {AnyActionType, SpecificActionType} from '~/actions';
import mApi from '~/lib/mApi';
import { VOPSDataType, VOPSStatusType } from '~/reducers/main-function/vops';

export interface UpdateVopsTriggerType {
  ():AnyActionType
}

export interface UPDATE_VOPS extends SpecificActionType<"UPDATE_VOPS", VOPSDataType>{}
export interface UPDATE_VOPS_STATUS extends SpecificActionType<"UPDATE_VOPS_STATUS", VOPSStatusType>{}

let updateVops:UpdateVopsTriggerType = function updateVops() {
  return async (dispatch:(arg:AnyActionType)=>any, getState:()=>any)=>{
    try {
      if (getState().vops.status !== "WAIT"){
        return null;
      }
      dispatch({
        type: 'UPDATE_VOPS_STATUS',
        payload: <VOPSStatusType>"LOADING"
      });
      let userId = getState().status.userSchoolDataIdentifier;
      dispatch({
        type: 'UPDATE_VOPS',
        payload: <VOPSDataType>(await promisify(mApi().records.vops.read(userId), 'callback')())
      });
      dispatch({
        type: 'UPDATE_VOPS_STATUS',
        payload: <VOPSStatusType>"READY"
      });
    } catch (err){
      dispatch(actions.displayNotification(err.message, 'error'));
      dispatch({
        type: 'UPDATE_VOPS_STATUS',
        payload: <VOPSStatusType>"ERROR"
      });
    }
  }
}

export default {updateVops};
export {updateVops};