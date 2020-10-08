import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import Dialog, { DialogRow } from '~/components/general/dialog';
import { FormWizardActions, InputFormElement, SearchFormElement } from '~/components/general/form-element';
import { AnyActionType } from '~/actions';
import { loadStaff, loadStudents, LoadUsersTriggerType } from '~/actions/main-function/users';
import { loadTemplatesFromServer, LoadTemplatesFromServerTriggerType, CreateWorkspaceTriggerType, createWorkspace, CreateWorkspaceStateType } from '~/actions/workspaces';
import notificationActions from '~/actions/base/notifications';
import { i18nType } from '~/reducers/base/i18n';
import { StateType } from '~/reducers';
import promisify from '~/util/promisify';
import mApi from '~/lib/mApi';
import { bindActionCreators } from 'redux';
import { StatusType } from '~/reducers/base/status';
import ApplicationList, { ApplicationListItem, ApplicationListItemHeader } from '~/components/general/application-list';
import AutofillSelector, { SelectItem } from '~/components/base/input-select-autofill';
import { StudyprogrammeTypes } from '~/reducers/main-function/users';
import { UsersType } from '~/reducers/main-function/users';
import { CreateWorkspaceType, WorkspaceType } from '~/reducers/workspaces';

import { UserType, UserStaffType } from '~/reducers/user-index';
import studiesEnded from '~/components/index/body/studies-ended';
import Workspace from '~/containers/workspace';

interface TemplateType {
  id: number,
  name: string,
  line: string,
  type: string
}

interface OrganizationNewWorkspaceProps {
  children?: React.ReactElement<any>,
  i18n: i18nType,
  data?: CreateWorkspaceType,
  users: UsersType,
  templates: WorkspaceType[],
  loadStudents: LoadUsersTriggerType,
  loadStaff: LoadUsersTriggerType,
  loadTemplates: LoadTemplatesFromServerTriggerType
  createWorkspace: CreateWorkspaceTriggerType,
}

interface OrganizationNewWorkspaceState {
  template: string,
  workspacename: string,
  locked: boolean,
  currentStep: number,
  selectedStaff: SelectItem[],
  selectedStudents: SelectItem[],
  totalSteps: number,
  executing: boolean,
  workspaceCreated: boolean,
  studentsAdded: boolean,
  staffAdded: boolean,
}

class OrganizationNewWorkspace extends React.Component<OrganizationNewWorkspaceProps, OrganizationNewWorkspaceState> {

  constructor(props: OrganizationNewWorkspaceProps) {
    super(props);
    this.state = {
      workspacename: "",
      template: null,
      selectedStaff: [],
      selectedStudents: [],
      locked: false,
      totalSteps: 4,
      currentStep: 1,
      executing: false,
      workspaceCreated: false,
      studentsAdded: false,
      staffAdded: false,
    };

    // TODO: amount of these methods can be halved

    this.doTemplateSearch = this.doTemplateSearch.bind(this);
    this.selectTemplate = this.selectTemplate.bind(this);
    this.doStaffSearch = this.doStaffSearch.bind(this);
    this.selectStaff = this.selectStaff.bind(this);
    this.deleteStaff = this.deleteStaff.bind(this);
    this.doStudentSearch = this.doStudentSearch.bind(this);
    this.selectStudent = this.selectStudent.bind(this);
    this.deleteStudent = this.deleteStudent.bind(this);
    this.updateField = this.updateField.bind(this);
    this.setSelectedStudents = this.setSelectedStudents.bind(this);
    this.setWorkspaceName = this.setWorkspaceName.bind(this);
    this.saveWorkspace = this.saveWorkspace.bind(this);

  }

  doTemplateSearch(value: string) {
    this.props.loadTemplates(value);
  }

  selectTemplate(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ template: e.target.value });
  }

  doStudentSearch(value: string) {
    this.props.loadStudents(value);
  }

  selectStudent(student: SelectItem) {
    let newState = this.state.selectedStudents.concat(student);
    this.setState({ selectedStudents: newState });
  }

  deleteStudent(student: SelectItem) {
    let newState = this.state.selectedStudents.filter(selectedItem => selectedItem.id !== student.id);
    this.setState({ selectedStudents: newState });
  }

  doStaffSearch(value: string) {
    this.props.loadStaff(value);
  }

  selectStaff(staff: SelectItem) {
    let newState = this.state.selectedStaff.concat(staff);
    this.setState({ selectedStaff: newState });
  }

  deleteStaff(staff: SelectItem) {
    let newState = this.state.selectedStaff.filter(selectedItem => selectedItem.id !== staff.id);
    this.setState({ selectedStaff: newState });
  }

  updateField(name: string, value: string, valid: boolean) {
    let fieldName = name;
    let fieldValue = valid ? value : "";
    let newState = Object.assign(this.state.template, { [fieldName]: fieldValue });
    this.setState({ template: newState });
  }

  setSelectedStudents(selectedStudents: Array<SelectItem>) {
    this.setState({ selectedStudents });
  }

  setWorkspaceName(value: string) {
    this.setState({ workspacename: value });
  }

  clearComponentState() {
    this.setState({
      template: null,
      locked: false,
      workspacename: "",
      executing: false,
      currentStep: 1,
      selectedStaff: [],
      selectedStudents: [],
      workspaceCreated: false,
      studentsAdded: false,
      staffAdded: false,
    });
  }

  cancelDialog(closeDialog: () => any) {
    this.clearComponentState();
    closeDialog();
  }

  nextStep() {
    let nextStep = this.state.currentStep + 1;
    this.setState({ currentStep: nextStep });
  }

  lastStep() {
    let lastStep = this.state.currentStep - 1;
    this.setState({ currentStep: lastStep });
  }

  saveWorkspace(closeDialog: () => any) {
    this.setState({
      locked: true,
      executing: true
    });

    this.props.createWorkspace({
      id: this.state.template,
      name: this.state.workspacename,
      students: this.state.selectedStudents,
      staff: this.state.selectedStaff,
      success: (state: CreateWorkspaceStateType) => {
        if (state === "WORKSPACE-CREATE") {
          this.setState({
            workspaceCreated: true
          });
        } else if (state === "ADD-STUDENTS") {
          this.setState({
            studentsAdded: true
          });
        } else if (state === "ADD-TEACHERS") {
          this.setState({
            staffAdded: true
          })
        } else if (state === "DONE") {
          closeDialog();
          this.clearComponentState();
        }
      },
      fail: () => {
        closeDialog();
        this.clearComponentState();
      }
    });
  }

  wizardSteps(page: number) {

    switch (page) {
      case 1:
        return <div>
          <DialogRow modifiers="new-workspace" >
            <SearchFormElement placeholder={this.props.i18n.text.get('plugin.organization.workspaces.addWorkspace.search.template.placeholder')} name="templateSearch" updateField={this.doTemplateSearch}></SearchFormElement>
          </DialogRow >
          <DialogRow modifiers="new-workspace">
            <InputFormElement updateField={this.setWorkspaceName} name="workspaceName" label={this.props.i18n.text.get('plugin.organization.workspaces.addWorkspace.name')} value={this.state.workspacename}></InputFormElement>
          </DialogRow>
          <DialogRow modifiers="new-workspace">
            <ApplicationList>
              <form>
                {this.props.templates.map((template: WorkspaceType) => {
                  return <ApplicationListItem>
                    <ApplicationListItemHeader>
                      <input key={template.id} type="radio" onChange={this.selectTemplate} name="template" value={template.id} />
                      <span className="application-list__header-primary">{template.name}</span>
                      <span className="application-list__header-secondary">{template.educationTypeName}</span>
                    </ApplicationListItemHeader>
                  </ApplicationListItem>
                })}
              </form>
            </ApplicationList>
          </DialogRow>
        </div>;
      case 2:

        let studentSearchItems = this.props.users.students.map(student => {
          return { id: student.id, label: student.firstName + " " + student.lastName }
        });

        return <DialogRow modifiers="new-workspace">
          <AutofillSelector modifier="add-students"
            loader={this.doStudentSearch}
            placeholder={this.props.i18n.text.get('plugin.organization.workspaces.addWorkspace.search.students.placeholder')}
            selectedItems={this.state.selectedStudents} searchItems={studentSearchItems} onDelete={this.deleteStudent} onSelect={this.selectStudent}
            showFullNames={true} />
        </DialogRow>;
      case 3:

        let teacherSearchItems = this.props.users.staff.map(staff => {
          return { id: staff.id, label: staff.firstName + " " + staff.lastName }
        });

        return <DialogRow modifiers="new-workspace">
          <AutofillSelector modifier="add-teachers"
            loader={this.doStaffSearch}
            placeholder={this.props.i18n.text.get('plugin.organization.workspaces.addWorkspace.search.teachers.placeholder')}
            selectedItems={this.state.selectedStaff} searchItems={teacherSearchItems} onDelete={this.deleteStaff} onSelect={this.selectStaff}
            showFullNames={true} />
        </DialogRow>;
      case 4:
        return <DialogRow modifiers="new-workspace">
          Koonti
        </DialogRow>;
      default: return <div>EMPTY</div>
    }
  }

  render() {
    let content = (closePortal: () => any) => this.wizardSteps(this.state.currentStep);
    let executeContent = <div><div className={`dialog__executer ${this.state.workspaceCreated === true ? "dialog__executer state-DONE" : ""}`}>Create workspace</div>
      <div className={`dialog__executer ${this.state.studentsAdded === true ? "dialog__executer state-DONE" : ""}`}>Add students</div>
      <div className={`dialog__executer ${this.state.staffAdded === true ? "dialog__executer state-DONE" : ""}`}>Add teachers</div>
      <div className={`dialog__executer`}>Done</div></div>;
    let footer = (closePortal: () => any) => <FormWizardActions locked={this.state.locked}
      currentStep={this.state.currentStep} totalSteps={this.state.totalSteps}
      executeLabel={this.props.i18n.text.get('plugin.organization.workspaces.addWorkspace.execute.label')}
      nextLabel={this.props.i18n.text.get('plugin.organization.workspaces.addWorkspace.next.label')}
      lastLabel={this.props.i18n.text.get('plugin.organization.workspaces.addWorkspace.last.label')}
      cancelLabel={this.props.i18n.text.get('plugin.organization.workspaces.addWorkspace.cancel.label')}
      executeClick={this.saveWorkspace.bind(this, closePortal)}
      nextClick={this.nextStep.bind(this)}
      lastClick={this.lastStep.bind(this)}
      cancelClick={this.cancelDialog.bind(this, closePortal)} />;

    return (<Dialog executing={this.state.executing} executeContent={executeContent} footer={footer} modifier="new-user"
      title={this.props.i18n.text.get('plugin.organization.workspaces.addWorkspace.title')}
      content={content} >
      {this.props.children}
    </Dialog  >
    )
  }
}

function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    users: state.organizationUsers,
    templates: state.organizationWorkspaces.templateWorkspaces
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators({ loadStaff, loadStudents, loadTemplates: loadTemplatesFromServer, createWorkspace }, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganizationNewWorkspace);
