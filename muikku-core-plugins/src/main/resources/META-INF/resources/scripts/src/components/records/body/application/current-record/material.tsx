import * as React from "react";
import { i18nType } from "~/reducers/base/i18n";
import { RecordsGradesType, MaterialType } from "~/reducers/main-function/records/records";
import { WorkspaceType } from "~/reducers/main-function/workspaces";

import MaterialLoader from "~/components/base/material-loader";
import { shortenGrade, getShortenGradeExtension } from "~/util/modifiers";

interface MaterialProps {
  material: MaterialType,
  workspace: WorkspaceType,
  i18n: i18nType,
  grades: RecordsGradesType
}

interface MaterialState {
  opened: boolean
}

export default class Material extends React.Component<MaterialProps, MaterialState> {
  constructor(props: MaterialProps){
    super(props);
    
    this.toggleOpened = this.toggleOpened.bind(this);
    
    this.state = {
      opened: false
    }
  }
  componentWillReceiveProps(nextProps: MaterialProps){
    if (nextProps.material.assignment.id !== this.props.material.assignment.id){
      this.setState({
        opened: false
      })
    }
  }
  toggleOpened(){
    this.setState({opened: !this.state.opened})
  }
  render(){
    let evaluation = this.props.material.evaluation;
    return <div className={`application-list__item assignment ${this.props.material.evaluation ? "" : "state-NO-ASSESSMENT"}`}>
      <div className="application-list__item-content application-list__item-content--main">
        <div className="application-list__item-header application-list__item-header--studies-assignment" onClick={this.props.material.evaluation ? this.toggleOpened : null}>
          {evaluation ?
            <span title={this.props.grades[[
              evaluation.gradingScaleSchoolDataSource,
              evaluation.gradingScaleIdentifier,
              evaluation.gradeSchoolDataSource,
              evaluation.gradeIdentifier].join("-")].scale + getShortenGradeExtension(evaluation.grade)}
              className={`text text--assignment-assesment-grade ${evaluation.grade ? "state-PASSED" : "state-FAILED"}`}>{shortenGrade(evaluation.grade)}</span>
            : <span className={`text text--assignment-assesment-grade state-NO-ASSESSMENT`}>N</span>}
          
          <span className="text text--list-item-title">{this.props.material.assignment.title}</span>
        </div>
        {this.state.opened ? <div className="application-list__item-body text">
          <MaterialLoader material={this.props.material} workspace={this.props.workspace} i18n={this.props.i18n}/>
        </div> : null}
      </div>
    </div>
  }
}