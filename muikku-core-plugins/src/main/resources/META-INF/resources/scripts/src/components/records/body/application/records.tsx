import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as queryString from 'query-string';

import {i18nType} from '~/reducers/base/i18n';

import '~/sass/elements/course.scss';
import '~/sass/elements/empty.scss';
import '~/sass/elements/loaders.scss';
import '~/sass/elements/text.scss';
import '~/sass/elements/application-sub-panel.scss';
import '~/sass/elements/workspace-activity.scss';
import '~/sass/elements/file-uploader.scss';

import { RecordsType, TransferCreditType } from '~/reducers/main-function/records/records';
import BodyScrollKeeper from '~/components/general/body-scroll-keeper';
import Link from '~/components/general/link';
import { WorkspaceType, WorkspaceStudentAssessmentsType, WorkspaceAssessementState } from '~/reducers/main-function/workspaces';
import { UserWithSchoolDataType } from '~/reducers/main-function/user-index';
import {StateType} from '~/reducers';
import { shortenGrade, getShortenGradeExtension } from '~/util/modifiers';
import ApplicationList, { ApplicationListItem, ApplicationListItemHeader } from '~/components/general/application-list';

let ProgressBarLine = require('react-progressbar.js').Line;

interface RecordsProps {
  i18n: i18nType,
  records: RecordsType
}

interface RecordsState {
}

let storedCurriculumIndex:any = {};

function getEvaluationRequestIfAvailable(props: RecordsProps, workspace: WorkspaceType){
  let assesmentState:WorkspaceAssessementState;
  let assesmentDate:string;
  if (workspace.studentAssessments && workspace.studentAssessments.assessmentState){
    assesmentState = workspace.studentAssessments.assessmentState;
    assesmentDate = workspace.studentAssessments.assessmentStateDate;
  } else if (workspace.studentActivity && workspace.studentActivity.assessmentState){
    assesmentState = workspace.studentActivity.assessmentState.state;
    assesmentDate = workspace.studentActivity.assessmentState.date;
  }
  
  if (assesmentState === "pending" || assesmentState === "pending_pass" || assesmentState === "pending_fail"){
    return <div className="text text--list-item-type-title">
      <span className="text text--workspace-assesment-description">{props.i18n.text.get("plugin.records.workspace.pending",props.i18n.time.format(assesmentDate))}</span>
      <span title={props.i18n.text.get("plugin.records.workspace.pending",props.i18n.time.format(assesmentDate))} className="text text--evaluation-request icon-assessment-pending"></span>
    </div>
  }
  
  return null;
}

function getTransferCreditValue(props: RecordsProps, transferCredit: TransferCreditType){
  let gradeId = [
    transferCredit.gradingScaleIdentifier,
    transferCredit.gradeIdentifier].join('-');
  let grade = props.records.grades[gradeId];
  return <div className="text text--list-item-type-title">
    <span className="text text--workspace-assesment-description">{props.i18n.text.get("plugin.records.transferCreditsDate", props.i18n.time.format(transferCredit.date))}</span>
    <span title={props.i18n.text.get("plugin.records.transferCreditsDate", props.i18n.time.format(transferCredit.date)) +
      getShortenGradeExtension(grade.grade)} className={`text text--workspace-credit-grade ${grade.passing ? "state-PASSED" : "state-FAILED"}`}>
      {shortenGrade(grade.grade)}
    </span>
  </div>
}

function getAssessments(props: RecordsProps, workspace: WorkspaceType){
  if (workspace.studentAssessments.assessments.length){
    let assessment = workspace.studentAssessments.assessments[0];
    if (!assessment){
      return null;
    }
    let gradeId = [
      assessment.gradingScaleSchoolDataSource,
      assessment.gradingScaleIdentifier,
      assessment.gradeSchoolDataSource,
      assessment.gradeIdentifier].join('-');
    let grade = props.records.grades[gradeId];
    return <span className="text text--list-item-type-title">
      <span className="text text--workspace-assesment-description">{props.i18n.text.get("plugin.records.workspace.evaluated", props.i18n.time.format(assessment.evaluated))}</span>
      <span title={props.i18n.text.get("plugin.records.workspace.evaluated", props.i18n.time.format(assessment.evaluated)) +
        getShortenGradeExtension(grade.grade)} className={`text text--workspace-assesment-grade ${assessment.passed ? "state-PASSED" : "state-FAILED"}`}>
        {shortenGrade(grade.grade)}
      </span>
    </span>
  } else if (workspace.studentAssessments.assessmentState &&
    (workspace.studentAssessments.assessmentState === "incomplete" || workspace.studentAssessments.assessmentState === "fail")){
    let status = props.i18n.text.get(workspace.studentAssessments.assessmentState === "incomplete" ?
    		"plugin.records.workspace.incomplete" : "plugin.records.workspace.failed");
    return <span className="text text--list-item-type-title">
      <span className="text text--workspace-assesment-description">{props.i18n.text.get("plugin.records.workspace.evaluated", props.i18n.time.format(workspace.studentAssessments.assessmentStateDate))}</span>
      <span title={props.i18n.text.get("plugin.records.workspace.evaluated", props.i18n.time.format(workspace.studentAssessments.assessmentStateDate)) + " - " + status} className={`text text--workspace-assesment-grade ${workspace.studentAssessments.assessmentState === "incomplete" ? "state-INCOMPLETE" : "state-FAILED"}`}>
      {status[0].toLocaleUpperCase()}
    </span>
  </span>
  } else {
    return null;
  }
}

function getActivity(props: RecordsProps, workspace: WorkspaceType){
    if (!workspace.studentActivity){
      return null;
    } else if ((workspace.studentActivity.exercisesTotal + workspace.studentActivity.evaluablesTotal) === 0){
      return null;
    }
    let evaluablesCompleted = workspace.studentActivity.evaluablesPassed + workspace.studentActivity.evaluablesSubmitted +
      workspace.studentActivity.evaluablesFailed + workspace.studentActivity.evaluablesIncomplete;
    return <div className="workspace-activity workspace-activity--studies">
    
      {workspace.studentActivity.evaluablesTotal ? <ProgressBarLine containerClassName="workspace-activity__progressbar workspace-activity__progressbar--studies" initialAnimate options={{
        strokeWidth: 1,
        duration: 1000,
        color: "#ce01bd",
        trailColor: "#f5f5f5",
        trailWidth: 1,
        svgStyle: {width: "100%", height: "4px"},
        text: {
          className: "text workspace-activity__progressbar-label",
          style: {
            left: workspace.studentActivity.evaluablesDonePercent === 0 ? "0%" : null,
            right: workspace.studentActivity.evaluablesDonePercent === 0 ? null : 100 - workspace.studentActivity.evaluablesDonePercent +  "%"
          }
        }
      }}
      strokeWidth={1} easing="easeInOut" duration={1000} color="#ce01bd" trailColor="#f5f5f5"
      trailWidth={1} svgStyle={{width: "100%", height: "4px"}}
      text={evaluablesCompleted + "/" + workspace.studentActivity.evaluablesTotal}
      progress={workspace.studentActivity.evaluablesDonePercent/100}/> : null}
    
      {workspace.studentActivity.exercisesTotal ? <ProgressBarLine containerClassName="workspace-activity__progressbar workspace-activity__progressbar--studies" initialAnimate options={{
        strokeWidth: 1,
        duration: 1000,
        color: "#ff9900",
        trailColor: "#f5f5f5",
        trailWidth: 1,
        svgStyle: {width: "100%", height: "4px"},
        text: {
          className: "text workspace-activity__progressbar-label",
          style: {
            left: workspace.studentActivity.exercisesDonePercent === 0 ? "0%" : null,
            right: workspace.studentActivity.exercisesDonePercent === 0 ? null : 100 - workspace.studentActivity.exercisesDonePercent + "%"
          }
        }
      }}
      strokeWidth={1} easing="easeInOut" duration={1000} color="#ff9900" trailColor="#f5f5f5"
      trailWidth={1} svgStyle={{width: "100%", height: "4px"}}
      text={workspace.studentActivity.exercisesAnswered + "/" + workspace.studentActivity.exercisesTotal}
      progress={workspace.studentActivity.exercisesDonePercent/100}/> : null}
    </div>
}

class Records extends React.Component<RecordsProps, RecordsState> {
  constructor(props: RecordsProps){
    super(props);
    
    this.goToWorkspace = this.goToWorkspace.bind(this);
  }
  
  goToWorkspace(user: UserWithSchoolDataType, workspace: WorkspaceType) {
    window.location.hash = "#?u=" + user.userEntityId + "&i=" + encodeURIComponent(user.id) + "&w=" + workspace.id;
  }
    
  render(){
    
    if (this.props.records.userDataStatus === "LOADING"){
      return null;
    } else if (this.props.records.userDataStatus === "ERROR"){
      //TODO: put a translation here please! this happens when messages fail to load, a notification shows with the error
      //message but here we got to put something
      return <div className="empty"><span>{"ERROR"}</span></div>
    }    
    
    if (!Object.keys(storedCurriculumIndex).length && this.props.records.curriculums.length){
      this.props.records.curriculums.forEach((curriculum)=>{
        storedCurriculumIndex[curriculum.identifier] = curriculum.name;
      });
    }
    
    let studentBasicInfo = <div className="application-sub-panel__body text">
      <div className="application-sub-panel__item">
        <div className="application-sub-panel__item-title">{this.props.i18n.text.get("plugin.records.studyStartDateLabel")}</div>
        <div className="application-sub-panel__item-data">
          <span className="text text--guider-profile-value">{this.props.records.studyStartDate ? 
            this.props.i18n.time.format(this.props.records.studyStartDate) : "-"}</span>
        </div>
      </div>
      <div className="application-sub-panel__item">
        <div className="application-sub-panel__item-title">{this.props.i18n.text.get(this.props.records.studyEndDate ? "plugin.records.studyEndDateLabel" :
          "plugin.records.studyTimeEndLabel")}</div>
        <div className="application-sub-panel__item-data">
          <span className="text text--guider-profile-value">{this.props.records.studyEndDate || this.props.records.studyTimeEnd ? 
            this.props.i18n.time.format(this.props.records.studyEndDate || this.props.records.studyTimeEnd) : "-"}</span>
        </div>
      </div>
    </div>  
    
    let studentRecords = <div className="application-sub-panel">
        {this.props.records.userData.map((data)=>{
          let user = data.user;
          let records = data.records;      

          return <div className="react-required-container" key={data.user.id}>
          <div className="application-sub-panel__header text text--studies-header">{user.studyProgrammeName}</div>
          <div className="application-sub-panel__body">
            {records.length ? records.map((record, index)=>{
              return <ApplicationList key={record.groupCurriculumIdentifier || index}>
                {record.groupCurriculumIdentifier ? <div className="application-list__header"><h3 className="text text--studies-list-header">{storedCurriculumIndex[record.groupCurriculumIdentifier]}</h3></div> : null}  
                  {record.workspaces.map((workspace)=>{
                    //Do we want an special way to display all these different states? passed is very straightforward but failed and
                    //incomplete might be difficult to understand
                    let extraClassNameState = "";
                    if (workspace.studentAssessments.assessmentState === "pass"){
                      extraClassNameState = "state-PASSED"
                    } else if (workspace.studentAssessments.assessmentState === "fail"){
                      extraClassNameState = "state-FAILED"
                    } else if (workspace.studentAssessments.assessmentState === "incomplete"){
                      extraClassNameState = "state-INCOMPLETE"
                    }
                    return <ApplicationListItem className={`course course--studies ${extraClassNameState}`} key={workspace.id} onClick={this.goToWorkspace.bind(this, user, workspace)}>
                      <ApplicationListItemHeader modifiers="course" key={workspace.id}>
                        <span className="text text--course-icon icon-books"></span>
                        <span className="text text--list-item-title">{workspace.name} {workspace.nameExtension ? "(" + workspace.nameExtension + ")" : null}</span> 
                        {getEvaluationRequestIfAvailable(this.props, workspace)}
                        {getAssessments(this.props, workspace)}
                        {getActivity(this.props, workspace)}
                      </ApplicationListItemHeader>
                    </ApplicationListItem>
                  })}
                {record.transferCredits.length ? 
                  <div className="application-list__header"><h3 className="text text--studies-list-header">{this.props.i18n.text.get("plugin.records.transferCredits")} ({storedCurriculumIndex[record.groupCurriculumIdentifier]})</h3></div> : null}
                    {record.transferCredits.map((credit)=>{
                      return <ApplicationListItem className="course course--credits" key={credit.date}>
                        <ApplicationListItemHeader modifiers="course">
                          <span className="text text--transfer-credit-icon icon-books"></span>  
                          <span className="text text--list-item-title">{credit.courseName}</span>
                          {getTransferCreditValue(this.props, credit)}
                        </ApplicationListItemHeader>
                      </ApplicationListItem>
                    })}
              </ApplicationList>
            }) : <h4>{this.props.i18n.text.get("TODO no records")}</h4>}
          </div>
          </div>
        })}
      </div>  

    // Todo fix the first sub-panel border-bottom stuff from guider. It should be removed from title only.
    
    return <BodyScrollKeeper hidden={this.props.records.location !== "records" || !!this.props.records.current}>
    
    <div className="application-sub-panel">
      {studentBasicInfo}
    </div>
    {studentRecords}    
    
    <div className="application-sub-panel">
      <div className="application-sub-panel__header text text--studies-header">{this.props.i18n.text.get("plugin.records.files.title")}</div>
      <div className="application-sub-panel__body">
      {this.props.records.files.length ?
        <ApplicationList className="uploaded-files text">
          {this.props.records.files.map((file)=>{
            return <ApplicationListItem className="uploaded-files__item" key={file.id}>
              <span className="uploaded-files__item-attachment-icon icon-attachment"></span>
              <Link className="uploaded-files__item-title" href={`/rest/records/files/${file.id}/content`} openInNewTab={file.title}>{file.title}</Link>
            </ApplicationListItem>
          })}
        </ApplicationList> :
        <div className="file-uploader__files-container text">{this.props.i18n.text.get("plugin.records.files.empty")}</div>
      }
      </div>
    </div>
    </BodyScrollKeeper>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    records: state.records
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Records);
