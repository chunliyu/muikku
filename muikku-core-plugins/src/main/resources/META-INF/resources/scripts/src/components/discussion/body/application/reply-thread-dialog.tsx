import { i18nType } from "~/reducers/base/i18n";
import * as React from "react";
import { DiscussionThreadType, DiscussionThreadReplyType } from "~/reducers/main-function/discussion";
import { Dispatch, connect } from "react-redux";
import { AnyActionType } from "~/actions";
import { bindActionCreators } from "redux";
import CKEditor from "~/components/general/ckeditor";
import Link from "~/components/general/link";
import JumboDialog from "~/components/general/jumbo-dialog";
import { replyToCurrentDiscussionThread, ReplyToCurrentDiscussionThreadTriggerType } from "~/actions/main-function/discussion";
import {StateType} from '~/reducers';
import SessionStateComponent from '~/components/general/session-state-component';
import Button from '~/components/general/button';

interface ReplyThreadProps {
  i18n: i18nType,
  children: React.ReactElement<any>,
  reply?: DiscussionThreadReplyType,
  quote?: string,
  quoteAuthor?: string,
  currentId: number,
      
  replyToCurrentDiscussionThread: ReplyToCurrentDiscussionThreadTriggerType,
}

interface ReplyThreadState {
  text: string,
  locked: boolean
}

const ckEditorConfig = {
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
  'notification' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/notification/4.5.9/',
  'change' : '//cdn.muikkuverkko.fi/libs/coops-ckplugins/change/0.1.2/plugin.min.js'
}

class ReplyThread extends SessionStateComponent<ReplyThreadProps, ReplyThreadState> {
  constructor(props: ReplyThreadProps){
    super(props, "discussion-reply-thread");
    
    this.onCKEditorChange = this.onCKEditorChange.bind(this);
    this.createReply = this.createReply.bind(this);
    this.clearUp = this.clearUp.bind(this);
    this.checkAgainstStoredState = this.checkAgainstStoredState.bind(this);
    
    this.state = this.getRecoverStoredState({
      locked: false,
      text: (props.quote && props.quoteAuthor ? 
          "<blockquote><p><strong>" + props.quoteAuthor + "</strong></p>" + props.quote + "</blockquote> <p></p>" :
            "")
    }, (props.reply && props.reply.id) || props.currentId);
  }
  onCKEditorChange(text: string){
    this.setStateAndStore({text}, (this.props.reply && this.props.reply.id) || this.props.currentId);
  }
  checkAgainstStoredState(){
    this.checkAgainstDefaultState({
      text: (this.props.quote && this.props.quoteAuthor ? 
          "<blockquote><p><strong>" + this.props.quoteAuthor + "</strong></p>" + this.props.quote + "</blockquote> <p></p>" :
      ""),
    }, (this.props.reply && this.props.reply.id) || this.props.currentId);
  }
  clearUp(){
    this.setStateAndClear({
      text: (this.props.quote && this.props.quoteAuthor ? 
          "<blockquote><p><strong>" + this.props.quoteAuthor + "</strong></p>" + this.props.quote + "</blockquote> <p></p>" :
      ""),
    }, (this.props.reply && this.props.reply.id) || this.props.currentId);
  }
  createReply(closeDialog: ()=>any){
    this.setState({
      locked: true
    });
    this.props.replyToCurrentDiscussionThread({
      replyId: this.props.reply && this.props.reply.id,
      message: this.state.text,
      success: ()=>{
        closeDialog();
        this.setStateAndClear({
          text: "",
          locked: false
        }, (this.props.reply && this.props.reply.id) || this.props.currentId);
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
      <CKEditor autofocus key="1" width="100%" height="grow" configuration={ckEditorConfig} extraPlugins={extraPlugins}
        onChange={this.onCKEditorChange}>{this.state.text}</CKEditor>
    ]
    let footer = (closeDialog: ()=>any)=>{
      return (          
         <div className="jumbo-dialog__button-container">
          {this.recovered ? <Button buttonModifiers="danger" onClick={this.clearUp} disabled={this.state.locked}>
            {this.props.i18n.text.get('clear draft')}
          </Button> : null}
          <Button buttonModifiers={["warn", "standard-cancel"]} onClick={closeDialog} disabled={this.state.locked}>
            {this.props.i18n.text.get('plugin.discussion.createmessage.cancel')}
          </Button>
          <Button buttonModifiers="standard-ok" onClick={this.createReply.bind(this, closeDialog)} disabled={this.state.locked}>
            {this.props.i18n.text.get('plugin.discussion.createmessage.send')}
          </Button>
        </div>
      )
    }
    
    return <JumboDialog modifier="reply-thread"
      title={this.props.i18n.text.get('plugin.discussion.reply.topic')}
      content={content} footer={footer} onOpen={this.checkAgainstStoredState}>
      {this.props.children}
    </JumboDialog>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    currentId: state.discussion.current.id
  }
};

function mapDispatchToProps(dispatch: Dispatch<AnyActionType>){
  return bindActionCreators({replyToCurrentDiscussionThread}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReplyThread);