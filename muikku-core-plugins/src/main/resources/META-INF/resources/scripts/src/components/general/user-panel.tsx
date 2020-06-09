import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {i18nType} from '~/reducers/base/i18n';
import {UserWithSchoolDataType} from "~/reducers/user-index";
import Avatar from "~/components/general/avatar";
import UserDialog from '~/components/organization//dialogs/new-edit-user';
import {getName} from "~/util/modifiers";
import ApplicationSubPanel from "~/components/general/application-sub-panel";
import ApplicationList, {ApplicationListItem, ApplicationListItemContentWrapper, ApplicationListItemContentData} from "~/components/general/application-list";
import Student from '../guider/body/application/students/student';


interface UserPanelProps {
  i18n: i18nType,
  users: Array<UserWithSchoolDataType>,
  title: string
}

interface UserPanelState {
}

export default class UserPanel extends React.Component<UserPanelProps, UserPanelState>{
  constructor(props: UserPanelProps){
    super(props);
  }

  render() {

    return(
     <ApplicationSubPanel i18n={this.props.i18n} modifier="organization-users" bodyModifier="organization-users" title={this.props.i18n.text.get(this.props.title)}>
        <ApplicationList>
          {this.props.users && this.props.users.map((user)=>{
            let aside = <Avatar id={user.userEntityId} hasImage firstName={user.firstName}/>;
            let data = {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: "STUDENT",
              studyProgrammeIdentifier: "STUDYPROGRAMME-1"
            }
            let actions = <div><UserDialog data={data}><span className="icon-pencil"></span></UserDialog></div>;
            return <ApplicationListItem key={user.id} modifiers="user">
              <ApplicationListItemContentWrapper modifiers="user" actions={actions} mainModifiers="user" asideModifiers="user" aside={aside}>
                <ApplicationListItemContentData modifiers="primary">{getName(user, true)}</ApplicationListItemContentData>
                <ApplicationListItemContentData modifiers="secondary">{user.email}</ApplicationListItemContentData>
              </ApplicationListItemContentWrapper>
            </ApplicationListItem>
          })}
        </ApplicationList>
      </ApplicationSubPanel>
    )
  }
}
