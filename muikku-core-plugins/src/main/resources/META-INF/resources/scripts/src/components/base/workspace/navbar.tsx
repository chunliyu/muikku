import Navbar from '~/components/general/navbar';
import Link from '~/components/general/link';

import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {i18nType} from '~/reducers/base/i18n';
import {StatusType} from '~/reducers/base/status';
import {StateType} from '~/reducers';

import '~/sass/elements/link.scss';
import '~/sass/elements/indicator.scss';
import Dropdown from '~/components/general/dropdown';
import { WorkspaceType, WorkspaceAssessementStateType } from '~/reducers/workspaces';
import Navigation, { NavigationTopic, NavigationElement } from '~/components/general/navigation';
import EvaluationRequestDialog from './evaluation-request-dialog';
import EvaluationCancelDialog from './evaluation-cancel-dialog';

interface ItemDataElement {
  modifier: string,
  trail: string,
  text: string,
  href: string,
  to?: boolean,
  icon: string,
  condition?: boolean,
  badge?: number
}

interface WorkspaceNavbarProps {
  activeTrail?: string,
  i18n: i18nType,
  navigation?: React.ReactElement<any>,
  status: StatusType,
  title: string,
  workspaceUrl: string,
  currentWorkspace: WorkspaceType
}

interface WorkspaceNavbarState {
  requestEvaluationOpen: boolean,
  requestCancelOpen: boolean
}

function getTextForAssessmentState(state: WorkspaceAssessementStateType, i18n: i18nType){
  let text;
  switch(state){
  case "unassessed":
    text = "plugin.workspace.dock.evaluation.requestEvaluationButtonTooltip";
    break;
  case "pending":
  case "pending_pass":
  case "pending_fail":
    text = "plugin.workspace.dock.evaluation.cancelEvaluationButtonTooltip";
    break;
  default:
    text = "plugin.workspace.dock.evaluation.resendRequestEvaluationButtonTooltip";
    break;
  }
  
  return i18n.text.get(text);
}

class WorkspaceNavbar extends React.Component<WorkspaceNavbarProps, WorkspaceNavbarState> {
  constructor(props: WorkspaceNavbarProps){
    super(props);
    
    this.state = {
      requestEvaluationOpen: false,
      requestCancelOpen: false
    }
    
    this.onRequestEvaluationOrCancel = this.onRequestEvaluationOrCancel.bind(this);
  }
  onRequestEvaluationOrCancel(state: string){
    let text;
    switch(state){
    case "pending":
    case "pending_pass":
    case "pending_fail":
      this.setState({
        requestCancelOpen: true
      });
      break;
    case "unassessed":
    default:
      this.setState({
        requestEvaluationOpen: true
      });
      break;
    }
  }
  render(){
    const itemData: ItemDataElement[] = [{
      modifier: "home",
      trail: "index",
      text: 'plugin.workspace.dock.home',
      href: "/workspaces/" + this.props.workspaceUrl,
      icon: "home",
      to: true,
      condition: this.props.status.permissions.WORKSPACE_HOME_VISIBLE
    }, {
      modifier: "help",
      trail: "help",
      text: 'plugin.workspace.dock.guides',
      href: "/workspaces/" + this.props.workspaceUrl + "/help",
      icon: "explanation",
      to: true,
      condition: this.props.status.permissions.WORKSPACE_GUIDES_VISIBLE
    }, {
      modifier: "materials",
      trail: "materials",
      text: 'plugin.workspace.dock.materials',
      href: "/workspaces/" + this.props.workspaceUrl + "/materials",
      icon: "materials",
      to: true,
      condition: this.props.status.permissions.WORKSPACE_MATERIALS_VISIBLE
    }, {
      modifier: "discussions",
      trail: "discussions",
      text: 'plugin.workspace.dock.discussions',
      href: "/workspaces/" + this.props.workspaceUrl + "/discussions",
      icon: "discussion",
      to: true,
      condition: this.props.status.permissions.WORKSPACE_DISCUSSIONS_VISIBLE
    }, {
      modifier: "users",
      trail: "users",
      text: 'plugin.workspace.dock.members',
      href: "/workspaces/" + this.props.workspaceUrl + "/users",
      icon: "members",
      to: true,
      condition: this.props.status.permissions.WORKSPACE_USERS_VISIBLE
    }, {
      modifier: "journal",
      trail: "journal",
      text: 'plugin.workspace.dock.journal',
      href: "/workspaces/" + this.props.workspaceUrl + "/journal",
      icon: "journal",
      to: true,
      condition: this.props.status.permissions.WORKSPACE_JOURNAL_VISIBLE
    }];
  
  let assessmentRequestItem = this.props.currentWorkspace &&
    this.props.status.permissions.WORKSPACE_REQUEST_WORKSPACE_ASSESSMENT ? {
    modifier: "assessment-request",
    //TODO add the styles for the following "unassessed" | "pending" | "pending_pass" | "pending_fail" | "pass" | "fail" | "incomplete"
    //with the required happy or unhappy faces
    item: (<Dropdown openByHover key="assessment-request" modifier="assessment"
        content={getTextForAssessmentState(this.props.currentWorkspace.studentAssessments.assessmentState, this.props.i18n)}>
      <Link onClick={this.onRequestEvaluationOrCancel.bind(this, this.props.currentWorkspace.studentAssessments.assessmentState)} title={getTextForAssessmentState(this.props.currentWorkspace.studentAssessments.assessmentState, this.props.i18n)}
        className={`link link--icon link--full link--workspace-navbar link--workspace-navbar-${this.props.currentWorkspace.studentAssessments.assessmentState} 
          icon icon-assessment-${this.props.currentWorkspace.studentAssessments.assessmentState}`}></Link>
    </Dropdown>)
  } : null;
  
  let assessmentRequestMenuItem = assessmentRequestItem ? (<Link onClick={this.onRequestEvaluationOrCancel.bind(this, this.props.currentWorkspace.studentAssessments.assessmentState)}
      className="link link--full link--menu link--assessment-request">
    <span className={`link__icon icon-assessment-${this.props.currentWorkspace.studentAssessments.assessmentState}`}/>
    <span className="link--menu__text">{getTextForAssessmentState(this.props.currentWorkspace.studentAssessments.assessmentState, this.props.i18n)}</span>
  </Link>) : null;
  
  let managementItemList:Array<{
    modifier: string,
    href: string,
    text: string,
    visible: boolean,
    trail: string
  }> = [
    {
      modifier: "workspace-management",
      href: "/workspaces/" + this.props.workspaceUrl + "/workspace-management",
      text: this.props.i18n.text.get("plugin.workspace.dock.workspace-edit"),
      visible: this.props.status.permissions.WORKSPACE_MANAGE_WORKSPACE,
      trail: "workspace-management"
    },
    {
      modifier: "workspace-announcer",
      href: "/workspaces/" + this.props.workspaceUrl + "/announcer",
      text: this.props.i18n.text.get("plugin.workspace.dock.workspace-announcements"),
      visible: this.props.status.permissions.WORKSPACE_ANNOUNCER_TOOL,
      trail: "workspace-announcer"
    },
    {
      modifier: "workspace-permissions",
      href: "/workspaces/" + this.props.workspaceUrl + "/permissions",
      text: this.props.i18n.text.get("plugin.workspace.dock.workspace-permissions"),
      visible: this.props.status.permissions.WORKSPACE_MANAGE_PERMISSIONS,
      trail: "workspace-permissions"
    },
    {
      modifier: "workspace-materials-management",
      href: "/workspaces/" + this.props.workspaceUrl + "/materials-management",
      text: this.props.i18n.text.get("plugin.workspace.dock.material-management"),
      visible: this.props.status.permissions.WORKSPACE_MANAGE_WORKSPACE,
      trail: "workspace-materials-management"
    },
    {
      modifier: "workspace-frontpage-management",
      href: "/workspaces/" + this.props.workspaceUrl + "/frontpage-management",
      text: this.props.i18n.text.get("plugin.workspace.dock.editIndex"),
      visible: this.props.status.permissions.WORKSPACE_MANAGE_WORKSPACE_FRONTPAGE,
      trail: "workspace-frontpage-management"
    },
    {
      modifier: "workspace-helppage-management",
      href: "/workspaces/" + this.props.workspaceUrl + "/helppage-management",
      text: this.props.i18n.text.get("plugin.workspace.dock.editHelp"),
      visible: this.props.status.permissions.WORKSPACE_MANAGE_WORKSPACE_HELP,
      trail: "workspace-helppage-management"
    }
  ]
  
  let managementItem = this.props.currentWorkspace &&
    (this.props.status.permissions.WORKSPACE_MANAGE_WORKSPACE ||
    this.props.status.permissions.WORKSPACE_MANAGE_PERMISSIONS || 
    this.props.status.permissions.WORKSPACE_MANAGE_WORKSPACE_MATERIALS ||
    this.props.status.permissions.WORKSPACE_MANAGE_WORKSPACE_FRONTPAGE || 
    this.props.status.permissions.WORKSPACE_MANAGE_WORKSPACE_HELP ||
    this.props.status.permissions.WORKSPACE_ANNOUNCER_TOOL) ? {
      modifier: "workspace-management",
      item: (<Dropdown key="workspace-management" modifier="workspace-management" items={managementItemList.map(item=>{
        if (!item.visible){
          return null
        }
        return <Link className={`link link--${item.modifier} ${this.props.activeTrail === item.trail ? "active" : ""}`} href={item.href}>{item.text}</Link>
      })}>
        <Link className={`link link--icon link--full link--workspace-navbar icon icon-cogs`}></Link>
      </Dropdown>)
    } : null;
    
    let trueNavigation:Array<React.ReactElement<any>> = [];
    if (this.props.navigation){
      trueNavigation.push(this.props.navigation);
    }
    if (managementItem){
      trueNavigation.push(<Navigation>
        <NavigationTopic icon="cogs" name={this.props.i18n.text.get("plugin.workspace.dock.workspace-edit")}>
          {managementItemList.map((item, index)=>{
            return <NavigationElement isActive={this.props.activeTrail === item.trail} key={index} href={item.href}>{item.text}</NavigationElement>
          })}
        </NavigationTopic>
      </Navigation>)
    }
    
    return <Navbar mobileTitle={this.props.title}
      modifier="workspace" navigation={trueNavigation} navbarItems={[
        assessmentRequestItem,
        managementItem
      ].concat(itemData.map((item)=>{
      if (!item.condition){
        return null;
      }
      return {
        modifier: item.modifier,
        item: (<Link href={item.href} to={item.to && this.props.activeTrail !== item.trail ? item.href : null} className={`link link--icon link--full link--workspace-navbar ${this.props.activeTrail === item.trail ? 'active' : ''}`}
          title={this.props.i18n.text.get(item.text)}>
          <span className={`link__icon icon-${item.icon}`}/>
          {item.badge ? <span className="indicator indicator--workspace">{(item.badge >= 100 ? "99+" : item.badge)}</span> : null}
        </Link>)
      }
    }))} defaultOptions={null} menuItems={[assessmentRequestMenuItem].concat(itemData.map((item: ItemDataElement)=>{
      if (!item.condition){
        return null;
      }
      return <Link href={item.href} className={`link link--full link--menu ${this.props.activeTrail === item.trail ? 'active' : ''}`}>
        <span className={`link__icon icon-${item.icon}`}/>
        {item.badge ? <span className="indicator indicator--workspace">{(item.badge >= 100 ? "99+" : item.badge)}</span> : null}
        <span className="link--menu__text">{this.props.i18n.text.get(item.text)}</span>
      </Link>
    }))} extraContent={[
      <EvaluationRequestDialog isOpen={this.state.requestEvaluationOpen}
        key="evaluation-request-dialog" onClose={()=>this.setState({requestEvaluationOpen: false})}/>,
      <EvaluationCancelDialog isOpen={this.state.requestCancelOpen}
        key="evaluation-cancel-dialog" onClose={()=>this.setState({requestCancelOpen: false})}/>
    ]}/>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    status: state.status,
    title: state.title,
    currentWorkspace: state.workspaces.currentWorkspace
  }
};

const mapDispatchToProps = (dispatch: Dispatch<any>)=>{
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkspaceNavbar);