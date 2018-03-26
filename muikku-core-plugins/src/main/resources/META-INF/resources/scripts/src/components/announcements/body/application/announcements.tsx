import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import {colorIntToHex} from '~/util/modifiers';
import equals = require("deep-equal");
import {i18nType} from '~/reducers/base/i18n';
import '~/sass/elements/empty.scss';
import '~/sass/elements/loaders.scss';
import '~/sass/elements/application-list.scss';
import '~/sass/elements/text.scss';
import '~/sass/elements/announcement.scss';
import { AnnouncementType } from '~/reducers/main-function/announcements';
import BodyScrollKeeper from '~/components/general/body-scroll-keeper';
import SelectableList from '~/components/general/selectable-list';
import Link from '~/components/general/link';
import {StateType} from '~/reducers';

interface AnnouncementProps {
  i18n: i18nType,
  announcement: AnnouncementType,
}

interface AnnouncementState {
}

class Announcement extends React.Component<AnnouncementProps, AnnouncementState> {
  render(){    
    if (!this.props.announcement) {
      return (null)      
    }        
    return (
      <section className="articles">
        <article className="articles__page">
          <header className="text text--announcement-caption">{this.props.announcement.caption}</header>
          <div className="text text-announcement-date">{this.props.i18n.time.format(this.props.announcement.startDate)}</div>
          <section className="text text--announcement-content" dangerouslySetInnerHTML={{__html: this.props.announcement.content}}></section>
        </article>
      </section>      
    );
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    announcement: state.announcements.current
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Announcement);
