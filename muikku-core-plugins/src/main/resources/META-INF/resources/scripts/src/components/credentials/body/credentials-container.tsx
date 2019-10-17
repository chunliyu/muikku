import * as React from 'react';
import mApi from '~/lib/mApi';
import promisify from '~/util/promisify';
import "~/sass/elements/credentials-container.scss";
import {i18nType} from '~/reducers/base/i18n';

interface CredentialsContainerProps {
  modifier? : string,
  i18n: i18nType
}

interface CredentialsContainerState {
  hash: string
}



export default class CredentialsContainer extends React.Component<CredentialsContainerProps, CredentialsContainerState> {
  
  private param = new URLSearchParams(location.search);
  
  constructor(props: CredentialsContainerProps){
    super(props);
    
    this.state = {
        hash: this.param.get("h")
    }
  }
 
  render(){
    
    let credentialChange = async ()=>{
      let hash = this.state.hash;      
      return await (promisify(mApi().forgotpassword.credentialReset.read(hash), 'callback')());
    } 
    
    return (
      <div className="credentials-container">
        <div className="credentials-container__header">{this.props.i18n.text.get("plugin.forgotpassword.forgotPasswordDialog.title")}</div>
        <div className="credentials-container__body">{this.props.children}</div>
      </div>
    ) 
  }
}