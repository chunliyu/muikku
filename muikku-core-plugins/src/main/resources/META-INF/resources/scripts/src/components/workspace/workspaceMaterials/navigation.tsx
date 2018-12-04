import * as React from "react";
import { StateType } from "~/reducers";
import { Dispatch, connect } from "react-redux";
import { i18nType } from "~/reducers/base/i18n";
import { MaterialContentNodeListType, WorkspaceType } from "~/reducers/workspaces";
import ProgressData from '../progressData';

import '~/sass/elements/buttons.scss';
import '~/sass/elements/item-list.scss';
import { ButtonPill } from '~/components/general/button';
import Navigation, { NavigationTopic, NavigationElement } from '~/components/general/navigation';

interface NavigationProps {
  i18n: i18nType,
  materials: MaterialContentNodeListType,
  activeNodeId: number,
  workspace: WorkspaceType
}

interface NavigationState {
  
}

function isScrolledIntoView(el: HTMLElement) {
  let rect = el.getBoundingClientRect();
  let elemTop = rect.top;
  let elemBottom = rect.bottom;

  let isVisible = elemTop < (window.innerHeight - 100) && elemBottom >= (document.querySelector(".content-panel__navigation") as HTMLElement).offsetTop + 50;
  return isVisible;
}

class NavigationComponent extends React.Component<NavigationProps, NavigationState> {
  componentWillReceiveProps(nextProps: NavigationProps){
    if (nextProps.activeNodeId !== this.props.activeNodeId){
      this.refresh(nextProps);
    }
  }
  refresh(props:NavigationProps = this.props){
    let element = (this.refs[props.activeNodeId] as NavigationElement).getElement();
    if (!isScrolledIntoView(element)){
      element.scrollIntoView(true);
    }
  }
  render(){
    if (!this.props.materials){
      return null;
    }
    
    return <Navigation>
      {this.props.workspace ? <ProgressData activity={this.props.workspace.studentActivity} i18n={this.props.i18n}/> : null}
      {
        this.props.materials.map((node)=>{
          return <NavigationTopic name={node.title} key={node.workspaceMaterialId}>
            {node.children.map((subnode)=>{
              return <NavigationElement ref={subnode.workspaceMaterialId + ""} iconColor={null} icon={null} key={subnode.workspaceMaterialId}
                isActive={this.props.activeNodeId === subnode.workspaceMaterialId} disableScroll
                hash={"p-" + subnode.workspaceMaterialId}>{subnode.title}</NavigationElement>
            })}
          </NavigationTopic>
        })
      }
    </Navigation>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    materials: state.workspaces.currentMaterials,
    activeNodeId: state.workspaces.currentMaterialsActiveNodeId,
    workspace: state.workspaces.currentWorkspace
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true }
)(NavigationComponent);