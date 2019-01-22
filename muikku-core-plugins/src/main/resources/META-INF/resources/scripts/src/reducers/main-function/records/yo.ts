import { ActionType } from "actions";

export type YOStatusType = "WAIT" | "LOADING" | "READY" | "ERROR";
export type YOEligibilityStatusType = "NOT_ELIGIBLE" | "ELIGIBLE" | "ENROLLED";

/**
 * Enum describing matriculation eligibility
 * 
 * @author Antti Leppä <antti.leppa@metatavu.fi>
 */

export enum YOEligbleEnum { 
  FALSE,
  TRUE, 
  UNKNOWN
}

/**
 * Interface representing matriculation eligibility REST model 
 * 
 * @author Antti Leppä <antti.leppa@metatavu.fi>
 */

export interface YOMatriculationEligibilityType {
  eligible: boolean;
  requirePassingGrades: number;
  acceptedCourseCount: number;
  acceptedTransferCreditCount: number;
}

export interface YODataType{
  studyStartDate: string,
  studyTimeEnd: string,
  studyEndDate: string,
}

export interface YOEligibilityType {
    coursesCompleted: number,
    coursesRequired: number,
    enrollmentDate: String,
    examDate: String
}

export interface YOType {
  status: YOStatusType,
  value: YODataType,
  subjects: Array<YOMatriculationSubjectType>,
  eligibility: YOEligibilityType,
  eligibilityStatus: YOEligibilityStatusType
}

export interface YOMatriculationSubjectType {
  code: string,
  subjectCode: string
}

export default function yo(state:YOType={
  status: "WAIT",
  value: null,
  subjects: null,
  eligibility: null,
  eligibilityStatus: null
}, action: ActionType):YOType{
  if (action.type === "UPDATE_STUDIES_YO_STATUS"){
    return Object.assign({}, state, {
      status: action.payload
    });
  } else if (action.type === "UPDATE_STUDIES_YO"){
    return Object.assign({}, state, {
      value: action.payload
    });
  } else if (action.type === "UPDATE_STUDIES_YO_SUBJECTS"){
     return Object.assign({}, state, {
       subjects: action.payload
     });       
  } else if (action.type === "UPDATE_STUDIES_YO_ELIGIBILITY_STATUS"){
     return Object.assign({}, state, {
       eligibilityStatus: action.payload
     });       
  } else if (action.type === "UPDATE_STUDIES_YO_ELIGIBILITY"){
     return Object.assign({}, state, {
       eligibility: action.payload
     });       
   }
  return state;
}