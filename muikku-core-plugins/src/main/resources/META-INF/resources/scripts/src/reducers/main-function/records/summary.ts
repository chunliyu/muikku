import { ActionType } from "actions";
import { WorkspaceListType, ActivityLogType } from "~/reducers/workspaces";

export type SummaryStatusType = "WAIT" | "LOADING" | "READY" | "ERROR";
export type SummaryWorkspaceListType = WorkspaceListType;

export interface SummaryStudyTime {
  studyStartDate: string,
  studyTimeEnd: string,
  studyEndDate: string,
}

export interface SummaryDataType {
  eligibilityStatus: number,
  activity: number,
  returnedExercises: number,
  graphData: GraphDataType,
  coursesDone: number,
  studentsDetails: SummaryStudyTime,
}

export interface SummaryType {
  data: SummaryDataType,
  status: SummaryStatusType,
}

export interface GraphDataType {
  activity: Array<ActivityLogType>,
  workspaces: WorkspaceListType,
}

export default function summary(state: SummaryType = {
  status: "WAIT",
  data: null,
}, action: ActionType): SummaryType {
  if (action.type === "UPDATE_STUDIES_SUMMARY_STATUS") {
    return Object.assign({}, state, {
      status: action.payload
    });
  } else if (action.type === "UPDATE_STUDIES_SUMMARY") {
    return Object.assign({}, state, {
      data: action.payload
    });
  }
  return state;
}