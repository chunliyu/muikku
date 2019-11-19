import * as React from 'react';
import { i18nType } from "~/reducers/base/i18n";

interface SubPanelProps {
  modifier?: string,
  bodyModifier?: string,
  i18n: i18nType,
  title: string
}

interface SubPanelState {
  
}

export default class ApplicationSubPanel extends React.Component<SubPanelProps, SubPanelState> {
  render(){
    return <div className={`application-sub-panel ${this.props.modifier ? `application-sub-panel--${this.props.modifier}` : ""}`}>
      <div className={`application-sub-panel__header ${this.props.modifier ? `application-sub-panel__header--${this.props.modifier}` : ""}`}>{this.props.title}</div>
      <div className={`application-sub-panel__body ${this.props.modifier ? `application-sub-panel__body--${this.props.modifier}` : ""} ${this.props.bodyModifier ? `application-sub-panel__body--${this.props.bodyModifier}` : ""}`}>{this.props.children}</div>
    </div>
  }
}