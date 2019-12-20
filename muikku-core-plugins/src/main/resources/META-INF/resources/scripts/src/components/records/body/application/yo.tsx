import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as queryString from 'query-string';
import { i18nType } from '~/reducers/base/i18n';
import { RecordsType } from '~/reducers/main-function/records/records';
import BodyScrollKeeper from '~/components/general/body-scroll-keeper';
import Link from '~/components/general/link';
import Button from '~/components/general/button';
import { UserWithSchoolDataType } from '~/reducers/main-function/user-index';
import { StateType } from '~/reducers';
import { HOPSType } from "~/reducers/main-function/hops";
import mApi from '~/lib/mApi';
import { YOType, YOEligibilityType, YOEligibilityStatusType } from '~/reducers/main-function/records/yo';
import '~/sass/elements/empty.scss';
import '~/sass/elements/loaders.scss';
import '~/sass/elements/course.scss';
import '~/sass/elements/application-sub-panel.scss';
import moment from '~/lib/moment';
import '~/sass/elements/buttons.scss';
import MatriculationEligibilityRow from './matriculation-eligibility-row/matriculation-eligibility-row';
import {updateMatriculationSubjectEligibility, UpdateMatriculationSubjectEligibilityTriggerType} from '~/actions/main-function/records/subject_eligibility';
import promisify from "~/util/promisify";

interface YOProps {
  i18n: i18nType,
  records: RecordsType,
  hops: HOPSType,
  yo: YOType
  updateMatriculationSubjectEligibility:UpdateMatriculationSubjectEligibilityTriggerType
}

interface YOState {
  eligibility?: YOEligibilityType,
  eligibilityStatus?: YOEligibilityStatusType,
  err?: String
}

class YO extends React.Component<YOProps, YOState> {
  constructor(props: YOProps) {
    super(props);
  }

  /**
   * Finds a subject code for matriculation subject
   *
   * @param code matriculation subject code
   * @returns subject code or null if not found
   */
  getSubjectCodeForCode = (code: string) => {

    const result = this.props.yo.subjects.find((matriculationSubject) => {
      return matriculationSubject.code === code;
    });

    return result ? result.subjectCode : null;
  }

  render() {
    let i18n = this.props.i18n;

    if (this.props.records.location !== "yo" || this.props.yo.status != "READY") {
      return null;
    } else {
      const loaded = this.props.hops.status === "READY" && !!this.props.hops.value;
      const selectedMatriculationSubjects = loaded ?
        this.props.hops.value.studentMatriculationSubjects.length > 0 ?
          (this.props.hops.value.studentMatriculationSubjects || []).map((code: string, index: number) => {
            return (
              <MatriculationEligibilityRow key={code+index} code={code} subjectCode={this.getSubjectCodeForCode(code)}/>
            );
          }) : <div className="empty">{i18n.text.get("plugin.records.matriculation.hopsUnfinished")}</div>
        : (<div>{this.props.i18n.text.get("plugin.records.yo.participationRights.loading")}</div>);
       const enrollmentLink = this.props.yo.enrollment != null ?
         (this.props.yo.enrollment).filter((exam) => exam.eligible == true).map((exam) => {
           return (
             exam.enrolled ?
               <div key={exam.id}>
                 <span className="application-sub-panel__notification-content">{i18n.text.get("plugin.records.matriculation.enrollmentDate")}</span>
                 <span className="application-sub-panel__notification-content">{new Date(exam.enrollmentDate).toLocaleDateString("fi-Fi")}</span>
                 <Button key={exam.id} href={"/matriculation-enrollment/" + exam.id} title={this.props.i18n.text.get("plugin.records.yo.button.signUp.active.title", new Date(exam.ends).toLocaleDateString("fi-Fi"))} className="button button--yo-signup" disabled={true}>{this.props.i18n.text.get("plugin.records.yo.button.signUp.hasAssigned")}</Button>
               </div>
             :
               <div key={exam.id}>
                 <Button key={exam.id} href={"/matriculation-enrollment/" + exam.id} title={this.props.i18n.text.get("plugin.records.yo.button.signUp.active.title", new Date(exam.ends).toLocaleDateString("fi-Fi"))} className="button button--yo-signup">{this.props.i18n.text.get("plugin.records.yo.button.signUp.active", new Date(exam.ends).toLocaleDateString("fi-Fi"))}</Button>
               </div>
           );
         }) : null;
      return (
          // TODO these are a bunch of wannabe components here. Need to be done to application-panel and sub-panel components.
          // Github issue: #4840
        <div>
          <div className="application-panel__content-header">{this.props.i18n.text.get("plugin.records.yo.title")}</div>
          <div className="application-panel__content">
          <div className="application-sub-panel application-sub-panel--yo-status-container">
            <div className="application-sub-panel__header">{this.props.i18n.text.get("plugin.records.yo.abiStatus.title")}</div>
            {this.props.yo.eligibility != null ? this.props.yo.eligibilityStatus == "ELIGIBLE" ?
              <div>
                <div className="application-sub-panel__body application-sub-panel__body--yo-status-complete">
                  <div className="application-sub-panel__notification-item">
                    <div className="application-sub-panel__notification-body">{this.props.i18n.text.get("plugin.records.yo.abiStatus.content.finished")}</div>
                    <div className="application-sub-panel__notification-footer">
                      {enrollmentLink}
                    </div>
                  </div>
                </div>
              </div> :
              this.props.yo.eligibilityStatus == "NOT_ELIGIBLE" ?
                <div className="application-sub-panel__body application-sub-panel__body--yo-status-incomplete">
                  <div className="application-sub-panel__notification-item">
                    <div className="application-sub-panel__notification-body application-sub-panel__notification-body--yo-status-incomplete">
                      <span className="application-sub-panel__notification-content">
                        {i18n.text.get("plugin.records.matriculation.notEligible", this.props.yo.eligibility.coursesCompleted, this.props.yo.eligibility.coursesRequired)}
                      </span>
                    </div>
                    <div className="application-sub-panel__notification-footer">
                      {enrollmentLink}
                    </div>
                  </div>
                </div> :
              null
            : null}
            </div>
            <div className="application-sub-panel  application-sub-panel--yo-status-container">
              <div className="application-sub-panel__header">{this.props.i18n.text.get("plugin.records.yo.participationRights.title")}</div>
              <div className="application-sub-panel__body application-sub-panel__body--studies-yo-cards">
                <div className="application-sub-panel__notification-item">
                  <div className="application-sub-panel__item-body application-sub-panel__item-body--summarizer">
                    {selectedMatriculationSubjects}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    records: state.records,
    hops: state.hops,
    yo: state.yo
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>) {
    return bindActionCreators({updateMatriculationSubjectEligibility}, dispatch);
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(YO);
