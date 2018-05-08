import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import Link from '~/components/general/link';
import Dialog from '~/components/general/dialog';
import {AnyActionType} from '~/actions';
import {i18nType} from '~/reducers/base/i18n';

import '~/sass/elements/link.scss';
import '~/sass/elements/text.scss';
import '~/sass/elements/buttons.scss';
import { deleteDiscussionArea, DeleteDiscussionAreaTriggerType } from '~/actions/main-function/discussion';
import { DiscussionAreaType, DiscussionType } from '~/reducers/main-function/discussion';
import {StateType} from '~/reducers';

interface DiscussionDeleteAreaProps {
  i18n: i18nType,
  discussion: DiscussionType,
  children: React.ReactElement<any>,
  deleteDiscussionArea: DeleteDiscussionAreaTriggerType
}

interface DiscussionDeleteAreaState {
  locked: boolean
}

class DiscussionDeleteArea extends React.Component<DiscussionDeleteAreaProps, DiscussionDeleteAreaState> {
  private area:DiscussionAreaType;

  constructor(props: DiscussionDeleteAreaProps){
    super(props);
    this.state = {
      locked: false
    }
  }
  deleteArea(closeDialog: ()=>any){
    this.setState({locked: true});
    this.props.deleteDiscussionArea({
      id: this.area.id,
      success: ()=>{
        this.setState({locked: false});
        closeDialog();
      },
      fail: ()=>{
        this.setState({locked: false});
      }
    });
  }
  componentWillReceiveProps(nextProps: DiscussionDeleteAreaProps){
    this.area = nextProps.discussion.areas.find(area=>area.id === nextProps.discussion.areaId);
  }
  render(){
    if (!this.area){
      return this.props.children;
    }
    
    let content = (closeDialog: ()=>any) => <div className="text text--delete-area">
      {this.props.i18n.text.get('plugin.discussion.deletearea.info')}
    </div>
       
    let footer = (closeDialog: ()=>any)=>{
      return (          
         <div className="dialog__button-set">
          <Link className="button button-dialog--cancel" onClick={closeDialog}>
            {this.props.i18n.text.get('plugin.discussion.deletearea.cancel')}
          </Link>
          <Link className="button button-dialog--execute" onClick={this.deleteArea.bind(this, closeDialog)} disabled={this.state.locked}>
            {this.props.i18n.text.get('plugin.discussion.deletearea.send')}
          </Link>
        </div>
      )
    }
    
    return <Dialog modifier="delete-area"
      title={this.props.i18n.text.get('plugin.discussion.deletearea.topic')}
      content={content} footer={footer}>
      {this.props.children}
    </Dialog>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    discussion: state.discussion
  }
};

function mapDispatchToProps(dispatch: Dispatch<AnyActionType>){
  return bindActionCreators({deleteDiscussionArea}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DiscussionDeleteArea);