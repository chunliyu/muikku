import MainFunctionNavbar from '~/components/base/main-function/navbar';
import * as React from 'react';
import ScreenContainer from '~/components/general/screen-container';

import '~/sass/elements/buttons.scss';
import '~/sass/elements/text.scss';
import '~/sass/elements/ordered-container.scss';
import '~/sass/elements/panel.scss';

import { StateType } from '~/reducers';
import { Dispatch, connect } from 'react-redux';
import { ErrorType } from '~/reducers/base/error';

interface ErrorBodyProps {
  error: ErrorType
}

interface ErrorBodyState {
  
}

class ErrorBody extends React.Component<ErrorBodyProps,ErrorBodyState> {
  render(){
    return (<div>
      <MainFunctionNavbar/>
        
      <ScreenContainer fullHeight={true}>
        <div className="ordered-container ordered-container--error-panels">
          <div className="ordered-container__item ordered-container__item--error">
            <div className="text text--error-title">
              <span className="text__panel-icon text__panel-icon--error icon-error"></span>
              <span className="text__panel-title">{this.props.error.title}</span>
            </div>
            <div className="panel panel--error">
              <div className="text text--error-body">{this.props.error.description}</div>
            </div>
          </div>
        </div>
      </ScreenContainer>
    </div>);
  }
}

function mapStateToProps(state: StateType){
  return {
    error: state.error
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorBody);