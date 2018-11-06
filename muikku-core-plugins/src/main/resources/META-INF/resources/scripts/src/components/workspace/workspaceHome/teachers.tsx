import { StateType } from "~/reducers";
import { Dispatch, connect } from "react-redux";
import * as React from "react";
import { WorkspaceType } from "~/reducers/workspaces";
import { i18nType } from "~/reducers/base/i18n";
import { getUserImageUrl } from "~/util/modifiers";
import Button from "~/components/general/button";
import CommunicatorNewMessage from '~/components/communicator/dialogs/new-message';
import { StatusType } from "~/reducers/base/status";

import '~/sass/elements/panel.scss';
import '~/sass/elements/item-list.scss';
import '~/sass/elements/avatar.scss';
import '~/sass/elements/buttons.scss';
import '~/sass/elements/glyph.scss';

interface WorkspaceTeachersProps {
  workspace: WorkspaceType,
  i18n: i18nType,
  status: StatusType
}

interface WorkspaceTeachersState {
}

function getWorkspaceMessage(i18n: i18nType, status: StatusType, workspace: WorkspaceType, html?: boolean){
  if (!workspace){
    return ""
  }

  let text = workspace.name + (workspace.nameExtension ? " (" + workspace.nameExtension + ")" : "");
  let pretext = "";
  if (html){
    let url = window.location.href;
    let arr = url.split("/");
    let server = arr[0] + "//" + arr[2];

    text = '<a href="' + server + status.contextPath + "/workspace/" + workspace.urlName + '">' + text + "</a></p>";
    pretext = "<p> </p>\n\n<p>";
  }
  return pretext + i18n.text.get("plugin.workspace.index.newMessageCaption", text);
}

class WorkspaceTeachers extends React.Component<WorkspaceTeachersProps, WorkspaceTeachersState> {
  constructor(props: WorkspaceTeachersProps){
    super(props);
  }
  render(){
    if (!this.props.status.permissions.WORSKPACE_LIST_WORKSPACE_MEMBERS){
      return null;
    }
    return <div className="panel panel--workspace-teachers">
      <div className="panel__header">
        <div className="panel__header-icon panel__header-icon--workspace-teachers icon-user"></div>
        <div className="panel__header-title">{this.props.i18n.text.get('plugin.workspace.index.teachersTitle')}</div>
      </div>
      <div className="panel__body">
        <div className="item-list item-list--panel-teachers">
          {this.props.workspace && this.props.workspace.staffMembers && this.props.workspace.staffMembers.length ? this.props.workspace.staffMembers.map((teacher)=>
            <div className="item-list__item item-list__item--teacher" key={teacher.userEntityId}>
              <div className="item-list__profile-picture">
                <object data={getUserImageUrl(teacher.userEntityId)} type="image/jpeg" className="avatar-container">
                  <div className="avatar avatar--category-3">{teacher.firstName[0]}</div>
                </object>
              </div>
              <div className="item-list__text-body item-list__text-body--multiline">
                <div className="item-list__user-name">{teacher.firstName} {teacher.lastName}</div>
                <div className="item-list__user-contact-info">
                  <div className="item-list__user-email"><span className="glyph icon-envelope"></span>{teacher.email}</div>
                  {teacher.properties['profile-phone'] ?
                    <div className="item-list__user-phone"><span className="glyph icon-phone"></span>{teacher.properties['profile-phone']}
                  </div> : null}
                </div>
                {teacher.properties['profile-vacation-period'] ?
                  <div className="item-list__user-vacation-period">{this.props.i18n.text.get("plugin.workspace.index.teachersVacationPeriod.label")} {teacher.properties['profile-vacation-period']}
                </div> : null}
                {this.props.status.loggedIn ? <CommunicatorNewMessage extraNamespace="workspace-teachers" initialSelectedItems={[{
                    type: "staff",
                    value: teacher
                  }]} initialSubject={getWorkspaceMessage(this.props.i18n, this.props.status, this.props.workspace)}
                    initialMessage={getWorkspaceMessage(this.props.i18n, this.props.status, this.props.workspace, true)}>
                    <Button buttonModifiers={["info", "contact-teacher"]}>
                      {this.props.i18n.text.get("plugin.workspace.index.message.label")}
                    </Button></CommunicatorNewMessage> : null}
              </div>
            </div>
          ) : (
          <div className="panel__body panel__body--empty">
            {this.props.i18n.text.get("plugin.workspace.index.teachersEmpty")}
          </div>
          )}
        </div>
      </div>
    </div>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    workspace: state.workspaces.currentWorkspace,
    status: state.status
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkspaceTeachers);