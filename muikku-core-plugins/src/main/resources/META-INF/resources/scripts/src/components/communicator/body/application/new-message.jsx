//<div className="communicator jumbo-dialog">
//  <div className="jumbo-dialog-wrapper">
//    <div className="jumbo-dialog-window">
//    
//      <div className="jumbo-dialog-header">
//        <div className="jumbo-dialog-title">
//          {#localize key=""/}
//          <span className="jumbo-dialog-close icon icon-close"></span>
//        </div>
//      </div>
//      
//      <div className="communicator form-field communicator-form-field-new-message-recepients">
//        <input type="text" placeholder='{#localize key="plugin.communicator.createmessage.title.recipients"/}'></input>
//      </div>
//      <input type="text" className="communicator form-field communicator-form-field-new-message-subject" placeholder='{#localize key="plugin.communicator.createmessage.title.subject"/}'></input>
//      <textarea className="communicator form-field communicator-form-field-new-message-body"></textarea>
//      
//      {?signature}
//        <div className="communicator form-field communicator-form-field-signature-new-message-checkbox">
//          <input type="checkbox" checked="checked" />
//          {#localize key="plugin.communicator.createmessage.checkbox.signature"/}
//        </div>
//      {/signature}
//    </div>
//  </div>
//</div>

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import CKEditor from '~/components/general/ckeditor.jsx';
import Link from '~/components/general/link.jsx';
import InputContactsAutofill from '~/components/base/input-contacts-autofill.jsx';
import JumboDialog from '~/components/general/jumbo-dialog.jsx';
import actions from '~/actions/main-function/communicator/communicator-messages';

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
  draftKey: 'communicator-new-message',
  resize_enabled: false
}
const extraPlugins = {
  'widget': '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/widget/4.5.9/',
  'lineutils': '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/lineutils/4.5.9/',
  'filetools' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/filetools/4.5.9/',
  'notification' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/notification/4.5.9/',
  'notificationaggregator' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/notificationaggregator/4.5.9/',
  'change' : '//cdn.muikkuverkko.fi/libs/coops-ckplugins/change/0.1.2/plugin.min.js',
  'draft' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/draft/0.0.3/plugin.min.js',
  'uploadwidget' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/uploadwidget/4.5.9/',
  'uploadimage' : '//cdn.muikkuverkko.fi/libs/ckeditor-plugins/uploadimage/4.5.9/'
}

class CommunicatorNewMessage extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  }
  constructor(props){
    super(props);
    
    this.onCKEditorChange = this.onCKEditorChange.bind(this);
    this.setSelectedItems = this.setSelectedItems.bind(this);
    this.onSubjectChange = this.onSubjectChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    
    this.state = {
      text: "",
      selectedItems: [],
      subject: ""
    }
  }
  onCKEditorChange(text){
    this.setState({text});
  }
  setSelectedItems(selectedItems){
    this.setState({selectedItems});
  }
  onSubjectChange(e){
    this.setState({subject: e.target.value});
  }
  sendMessage(closeDialog){
    this.props.sendMessage({
      to: this.state.selectedItems,
      subject: this.state.subject,
      text: this.state.text,
      success: ()=>{
        this.setState({
          text: "",
          selectedItems: [],
          subject: ""
        });
        closeDialog();
      },
      fail: null
    });
  }
  render(){
    let content = (closeDialog) => [
      (<InputContactsAutofill key="1" hasGroupMessagingPermission classNameExtension="communicator" classNameSuffix="new-message-recepients" placeholder={this.props.i18n.text.get('plugin.communicator.createmessage.title.recipients')}
        selectedItems={this.state.selectedItems} onChange={this.setSelectedItems}></InputContactsAutofill>),
      (<input key="2" type="text" className="communicator form-field communicator-form-field-new-message-subject"
        placeholder={this.props.i18n.text.get('plugin.communicator.createmessage.title.subject')}
        value={this.state.subject} onChange={this.onSubjectChange}></input>),
      (<CKEditor key="3" width="100%" height="grow" configuration={ckEditorConfig} extraPlugins={extraPlugins}
       onChange={this.onCKEditorChange}>{this.state.text}</CKEditor>)
    ]
       
    let footer = (closeDialog)=>{
      return <div>
        <Link className="communicator button button-large communicator-button-standard-ok" onClick={this.sendMessage.bind(this, closeDialog)}>
          {this.props.i18n.text.get('plugin.communicator.createmessage.button.send')}
        </Link>
        <Link className="communicator button button-large button-warn communicator-button-standard-cancel" onClick={closeDialog}>
          {this.props.i18n.text.get('plugin.communicator.createmessage.button.cancel')}
        </Link>
      </div>
    }
    
    return <JumboDialog classNameExtension="communicator"
      title={this.props.i18n.text.get('plugin.communicator.createmessage.topic')}
      content={content} footer={footer}>
      {this.props.children}
    </JumboDialog>
  }
}

function mapStateToProps(state){
  return {
    i18n: state.i18n
  }
};

const mapDispatchToProps = (dispatch)=>{
  return bindActionCreators(actions, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommunicatorNewMessage);