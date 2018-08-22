import { i18nType } from "~/reducers/base/i18n";
import * as React from "react";
import { DiscussionThreadType, DiscussionThreadReplyType } from "~/reducers/main-function/discussion";
import { Dispatch, connect } from "react-redux";
import { AnyActionType } from "~/actions";
import { bindActionCreators } from "redux";
import CKEditor from "~/components/general/ckeditor";
import Link from "~/components/general/link";
import JumboDialog from "~/components/general/environment-dialog";
import { modifyReplyFromCurrentThread, ModifyReplyFromCurrentThreadTriggerType } from "~/actions/main-function/discussion";
import {StateType} from '~/reducers';
import SessionStateComponent from '~/components/general/session-state-component';
import Button from '~/components/general/button';

interface ModifyThreadReplyProps {
  i18n: i18nType,
  children: React.ReactElement<any>,
  reply?: DiscussionThreadReplyType,
  modifyReplyFromCurrentThread: ModifyReplyFromCurrentThreadTriggerType
}

interface ModifyThreadReplyState {
  text: string,
  locked: boolean
}

const ckEditorConfig = {
  uploadUrl: '/communicatorAttachmentUploadServlet',
  toolbar: [
    { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'RemoveFormat' ] },
    { name: 'links', items: [ 'Link' ] },
    { name: 'insert', items: [ 'Image', 'Smiley', 'SpecialChar' ] },
    { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
    { name: 'styles', items: [ 'Format' ] },
    { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', 'Outdent', 'Indent', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight'] },
    { name: 'tools', items: [ 'Maximize' ] }
  ],
  resize_enabled: false
}
const extraPlugins = {
    'widget': '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/widget/4.5.9/',
    'lineutils': '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/lineutils/4.5.9/',
    'filetools' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/filetools/4.5.9/',
    'notification' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/notification/4.5.9/',
    'notificationaggregator' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/notificationaggregator/4.5.9/',
    'change' : '//cdn.muikkuverkko.fi/libs/coops-ckplugins/change/0.1.2/plugin.min.js',
    'uploadwidget' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/uploadwidget/4.5.9/',
    'uploadimage' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/uploadimage/4.5.9/'
}

class ModifyThreadReply extends SessionStateComponent<ModifyThreadReplyProps, ModifyThreadReplyState> {
  constructor(props: ModifyThreadReplyProps){
    super(props, "discussion-modify-thread-reply");
    
    this.onCKEditorChange = this.onCKEditorChange.bind(this);
    this.modifyReply = this.modifyReply.bind(this);
    this.clearUp = this.clearUp.bind(this);
    this.checkAgainstStoredState = this.checkAgainstStoredState.bind(this);
    
    this.state = this.getRecoverStoredState({
      locked: false,
      text: props.reply.message
    }, props.reply.id);
  }
  checkAgainstStoredState(){
    this.checkAgainstDefaultState({
      text: this.props.reply.message
    }, this.props.reply.id);
  }
  clearUp(){
    this.setStateAndClear({
      text: this.props.reply.message,
    }, this.props.reply.id);
  }
  componentWillReceiveProps(nextProps: ModifyThreadReplyProps){
    if (nextProps.reply.id !== this.props.reply.id){
      this.setState(this.getRecoverStoredState({
        text: nextProps.reply.message
      }, nextProps.reply.id));
    }
  }
  onCKEditorChange(text: string){
    this.setStateAndStore({text}, this.props.reply.id);
  }
  modifyReply(closeDialog: ()=>any){
    this.setState({
      locked: true
    });
    this.props.modifyReplyFromCurrentThread({
      reply: this.props.reply,
      message: this.state.text,
      success: ()=>{
        this.justClear(["text"], this.props.reply.id);
        this.setState({
          locked: false
        });
        closeDialog();
      },
      fail: ()=>{
        this.setState({
          locked: false
        });
      }
    });
  }
  render(){
    let content = (closeDialog: ()=>any) => [
    <div className="env-dialog_row" key="3">     
      <div className="env-dialog__form-element-container">
        <div className="env-dialog__label">{this.props.i18n.text.get('plugin.discussion.createmessage.content')}</div>
        <CKEditor autofocus key="1" width="100%" height="grow" growReference=".env-dialog__body" configuration={ckEditorConfig} extraPlugins={extraPlugins}
          onChange={this.onCKEditorChange}>{this.state.text}</CKEditor>
      </div>
    </div>
    ]
    let footer = (closeDialog: ()=>any)=>{
      return (          
         <div className="env-dialog__actions">       
          <Button buttonModifiers="dialog-execute" onClick={this.modifyReply.bind(this, closeDialog)} disabled={this.state.locked}>
            {this.props.i18n.text.get('plugin.discussion.createmessage.send')}
          </Button>
          <Button buttonModifiers="dialog-cancel" onClick={closeDialog} disabled={this.state.locked}>
            {this.props.i18n.text.get('plugin.discussion.createmessage.cancel')}
          </Button>
          {this.recovered ? <Button buttonModifiers="dialog-clear" onClick={this.clearUp} disabled={this.state.locked}>
              {this.props.i18n.text.get('plugin.discussion.createmessage.clearDraft')}
            </Button> : null}              
        </div>
      )
    }
    
    return <JumboDialog modifier="modify-reply-thread"
      title={this.props.reply ? this.props.i18n.text.get('plugin.discussion.reply.edit.topic') : this.props.i18n.text.get('plugin.discussion.reply.topic')}
      content={content} footer={footer} onOpen={this.checkAgainstStoredState}>
      {this.props.children}
    </JumboDialog>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n
  }
};

function mapDispatchToProps(dispatch: Dispatch<AnyActionType>){
  return bindActionCreators({modifyReplyFromCurrentThread}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModifyThreadReply);