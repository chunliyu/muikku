import * as React from "react";
import { StateType } from "~/reducers";
import { Dispatch, connect } from "react-redux";
import { i18nType } from "~/reducers/base/i18n";

import MaterialLoader from "~/components/base/material-loader";
import { StatusType } from "~/reducers/base/status";
import { MaterialContentNodeType, WorkspaceType, MaterialCompositeRepliesType } from "~/reducers/workspaces";
import { setCurrentWorkspace, SetCurrentWorkspaceTriggerType } from "~/actions/workspaces";
import { bindActionCreators } from "redux";
import { MaterialLoaderEditorButtonSet } from "~/components/base/material-loader/editor-buttonset";
import { MaterialLoaderTitle } from "~/components/base/material-loader/title";
import { MaterialLoaderContent } from "~/components/base/material-loader/content";
import { MaterialLoaderProducersLicense } from "~/components/base/material-loader/producers-license";
import { MaterialLoaderButtons } from "~/components/base/material-loader/buttons";
import { MaterialLoaderCorrectAnswerCounter } from "~/components/base/material-loader/correct-answer-counter";
import { MaterialLoaderAssesment } from "~/components/base/material-loader/assesment";
import { MaterialLoaderGrade } from "~/components/base/material-loader/grade";
import { MaterialLoaderDate } from "~/components/base/material-loader/date";

interface WorkspaceMaterialProps {
  i18n: i18nType,
  status: StatusType,
  materialContentNode: MaterialContentNodeType,
  folder: MaterialContentNodeType,
  compositeReplies: MaterialCompositeRepliesType,
  workspace: WorkspaceType,
  setCurrentWorkspace: SetCurrentWorkspaceTriggerType
}

interface WorkspaceMaterialState {
}

class WorkspaceMaterial extends React.Component<WorkspaceMaterialProps, WorkspaceMaterialState> {
  constructor(props: WorkspaceMaterialProps){
    super(props);
    this.updateWorkspaceActivity = this.updateWorkspaceActivity.bind(this);
  }
  updateWorkspaceActivity(){
    //This function is very efficient and reuses as much data as possible so it won't call anything from the server other than
    //to refresh the activity and that's because we are forcing it to do so
    this.props.setCurrentWorkspace({workspaceId: this.props.workspace.id, refreshActivity: true});
  }
  render(){
    const isAssignment = this.props.materialContentNode.assignmentType === "EVALUATED";
    const isEvaluatedAsPassed = this.props.compositeReplies && this.props.compositeReplies.state === "PASSED";
    const hasEvaluation = this.props.compositeReplies && (this.props.compositeReplies.state === "INCOMPLETE" || this.props.compositeReplies.state === "PASSED" || this.props.compositeReplies.state === "FAILED" || this.props.compositeReplies.state === "WITHDRAWN");
    const isBinary = this.props.materialContentNode.type === "binary";
    let evalStateClassName:string = "";
    let evalStateIcon:string = "";
    if (this.props.compositeReplies){
      switch (this.props.compositeReplies.state){
        case "INCOMPLETE":
          evalStateClassName = "material-page__assignment-assessment--incomplete";
          evalStateIcon = "icon-thumb-down-alt";
          break;
        case "FAILED":
          evalStateClassName = "material-page__assignment-assessment--failed";
          evalStateIcon = "icon-thumb-down-alt";
          break;
        case "PASSED":
          evalStateClassName = "material-page__assignment-assessment--passed";
          evalStateIcon = "icon-thumb-up-alt";
          break;
        case "WITHDRAWN":
          evalStateClassName = "material-page__assignment-assessment--withdrawn";
          evalStateIcon = "";
          break;
      }
    }

    return <MaterialLoader canPublish
      canRevert={!isBinary} canCopy={!isBinary} canHide canDelete canRestrictView canChangePageType={!isBinary}
      canChangeExerciseType={!isBinary} canSetLicense={!isBinary} canSetProducers={!isBinary}
      canAddAttachments={!isBinary} canEditContent={!isBinary} folder={this.props.folder} editable={this.props.status.permissions.WORKSPACE_MANAGE_WORKSPACE}
      material={this.props.materialContentNode} workspace={this.props.workspace}
      compositeReplies={this.props.compositeReplies} answerable onAssignmentStateModified={this.updateWorkspaceActivity}>
      {(props, state, stateConfiguration) => {
        return <div>
          <MaterialLoaderEditorButtonSet {...props} {...state}/>
          <MaterialLoaderTitle {...props} {...state}/>
          <MaterialLoaderContent {...props} {...state} stateConfiguration={stateConfiguration}/>
          <MaterialLoaderContent {...props} {...state} stateConfiguration={stateConfiguration} invisible={true}/>
          {!isEvaluatedAsPassed ? 
            <MaterialLoaderButtons {...props} {...state} stateConfiguration={stateConfiguration}/>
          : null}
          <MaterialLoaderCorrectAnswerCounter {...props} {...state}/>
          {isAssignment && hasEvaluation ? 
            <div className={`material-page__assignment-assessment ${evalStateClassName}`}>
              <div className={`material-page__assignment-assessment-icon ${evalStateIcon}`}></div>
              <MaterialLoaderDate {...props} {...state}/>
              <MaterialLoaderGrade {...props} {...state}/>
              <MaterialLoaderAssesment {...props} {...state}/>
            </div>
          : null}
          <MaterialLoaderProducersLicense {...props} {...state}/>
        </div>
      }}
    </MaterialLoader>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    status: state.status
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return bindActionCreators({setCurrentWorkspace}, dispatch);
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WorkspaceMaterial);