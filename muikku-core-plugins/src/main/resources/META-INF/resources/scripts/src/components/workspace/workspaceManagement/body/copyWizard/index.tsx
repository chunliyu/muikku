import * as React from "react";
import { WorkspaceType } from "~/reducers/workspaces";
import { i18nType } from "~/reducers/base/i18n";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import Step5 from "./step5";
import Step6 from "./step6";
const StepZilla = require('react-stepzilla').default;
import moment from "~/lib/moment";

//TODO lankkinen you might want to remove this file and add your own style
import "react-stepzilla/src/css/main.css";
import { copyCurrentWorkspace, CopyCurrentWorkspaceTriggerType, CopyCurrentWorkspaceStepType } from "~/actions/workspaces";
import { connect, Dispatch } from "react-redux";
import { StateType } from "~/reducers";
import { bindActionCreators } from "redux";

interface CopyWizardProps {
  workspace: WorkspaceType,
  i18n: i18nType,
  copyCurrentWorkspace: CopyCurrentWorkspaceTriggerType,
  onDone: ()=>any
}

interface CopyWizardState {
  store: CopyWizardStoreType,
  locked: boolean,
  resultingWorkspace?: WorkspaceType,
  step?: CopyCurrentWorkspaceStepType
}

export interface CopyWizardStoreType {
  description: string,
  name: string,
  nameExtension?: string,
  beginDate: any,
  endDate: any,
  copyDiscussionAreas: boolean,
  copyMaterials: "NO" | "CLONE" | "LINK",
  copyBackgroundPicture: boolean,
}

export type CopyWizardStoreUpdateType = Partial<CopyWizardStoreType>;

class CopyWizard extends React.Component<CopyWizardProps, CopyWizardState> {
  private store: CopyWizardStoreType;
  constructor(props: CopyWizardProps){
    super(props);
    
    this.state = {
      store: {
        description: props.workspace.description,
        name: props.workspace.name,
        nameExtension: props.workspace.nameExtension,
        beginDate: moment(props.workspace.additionalInfo.beginDate),
        endDate: moment(props.workspace.additionalInfo.endDate),
        copyDiscussionAreas: false,
        copyMaterials: "CLONE",
        copyBackgroundPicture: true
      },
      locked: false
    }
    
    this.getStore = this.getStore.bind(this);
    this.updateStore = this.updateStore.bind(this);
    this.checkLastStep = this.checkLastStep.bind(this);
    this.copyWorkspace = this.copyWorkspace.bind(this);
  }
  
  getStore() {
    return this.state.store;
  }

  updateStore(update: CopyWizardStoreUpdateType) {
    this.setState({
      store:{
        ...this.state.store,
        ...update,
      }
    });
  }
  
  copyWorkspace() {
    this.setState({
      locked: true
    });
    
    this.props.copyCurrentWorkspace({
      description: this.state.store.description,
      name: this.state.store.name,
      nameExtension: this.state.store.nameExtension,
      beginDate: this.state.store.beginDate.toISOString(),
      endDate: this.state.store.endDate.toISOString(),
      copyDiscussionAreas: this.state.store.copyDiscussionAreas,
      copyMaterials: this.state.store.copyMaterials,
      copyBackgroundPicture: this.state.store.copyBackgroundPicture,
      success: (step, workspace)=>{
        this.setState({
          step
        });
        if (step === "done") {
          this.setState({
            resultingWorkspace: workspace
          });
        }
      },
      fail: ()=>{
        this.setState({
          locked: false
        });
      }
    });
  }
  
  checkLastStep(steps: Array<any>, step: number){
    if (step === steps.length - 1) {
      this.copyWorkspace();
    }
  }
  
  render() {
    const props = {
      getStore: this.getStore,
      updateStore: this.updateStore,
      i18n: this.props.i18n,
      workspace: this.props.workspace,
      onDone: this.props.onDone,
      resultingWorkspace: this.state.resultingWorkspace,
      step: this.state.step
    }
    const steps =
    [
      {
        name: this.props.i18n.text.get("TODO step1"),
        component: <Step1 {...props}/>
      },
      {
        name: this.props.i18n.text.get("TODO step2"),
        component: <Step2 {...props}/>
      },
      {
        name: this.props.i18n.text.get("TODO step3"),
        component: <Step3 {...props}/>
      },
      {
        name: this.props.i18n.text.get("TODO step4"),
        component: <Step4 {...props}/>
      }
    ]
    
    if (this.state.store.copyMaterials !== "NO") {
      steps.push({
        name: this.props.i18n.text.get("TODO step5"),
        component: <Step5 {...props}/>
      });
    }
    
    //The reason step 6 is twice is so that the user can review before
    //the action is completed, I guess this stepzilla thing is kind of funny
    steps.push({
      name: this.props.i18n.text.get("TODO step6"),
      component: <Step6 {...props}/>
    });
    steps.push({
      name: this.props.i18n.text.get("TODO step6 final"),
      component: <Step6 {...props}/>
    });

    // https://github.com/newbreedofgeek/react-stepzilla/blob/master/src/examples/i18n/Example.js
    return (
      <div className='example'>
        <div className='step-progress'>
          <StepZilla
            stepsNavigation={!this.state.locked}
            showNavigation={!this.state.locked}
            steps={steps}
            preventEnterSubmission={true}
            nextTextOnFinalActionStep={this.props.i18n.text.get("plugin.workspace.management.copyWorkspace")}
            nextButtonText={this.props.i18n.text.get("TODO button next")}
            backButtonText={this.props.i18n.text.get("TODO button back")}
            onStepChange={this.checkLastStep.bind(this, steps)}
           />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    workspace: state.workspaces && state.workspaces.currentWorkspace
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return bindActionCreators({copyCurrentWorkspace}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CopyWizard);