import * as React from "react";
import { i18nType } from "~/reducers/base/i18n";

import '~/sass/elements/footer.scss';


interface FrontpageFooterProps {
  i18n: i18nType
}

interface FrontpageFooterState {

}

export default class FrontpageFooter extends React.Component<FrontpageFooterProps, FrontpageFooterState> {
  render() {
    return <footer className="footer" id="contact">
      <div className="footer__container">
        <div className="footer__item footer__item--contact">
          <h2 className="footer__header">{this.props.i18n.text.get( 'plugin.footer.contact.title' )}</h2>
          <p className="footer__subitem">
            <span className="glyph icon-location"></span>
            <b>{this.props.i18n.text.get( 'plugin.footer.streetAddress.label' )}</b>
            <span>Otavantie 2 B, 50670 Otava</span>
          </p>
          <p className="footer__subitem">
            <span className="glyph icon-phone"></span>
            <b>{this.props.i18n.text.get( 'plugin.footer.phoneNumber.label' )}</b>
            <span>015 194 3552</span>
          </p>
          <p className="footer__subitem">
            <span className="glyph icon-envelope"></span>
            <b>{this.props.i18n.text.get( 'plugin.footer.emailAddress.label' )}</b>
            <span>info@otavanopisto.fi</span>
          </p>
          <p className="footer__subitem footer__subitem--privacy-policy">
            <a href="http://otavanopisto.fi/resources/public/tietosuojaselosteet/opiskelijarekisteri_tietosuojaseloste.pdf" target="top" className="link link--privacy-policy">{this.props.i18n.text.get('plugin.footer.ooPrivacyPolicy.label')}</a>
          </p>
        </div>
        <div className="footer__item footer__item--logos">
          <img src="/gfx/alku_uudelle.jpg" alt="" title="" className="logo" />
          <img src="/gfx/footer_logo.jpg" alt="" title="" className="logo" />
        </div>
      </div>
      <div className="footer__container--plagscan"> 
        <div className="footer__item footer__item--plagscan">
          <a href="https://www.plagscan.com" className="link link--plagscan-logo" target="top"><img src="/gfx/plagscan-logo-white.png" alt="" title=""/></a> <span className="footer__item--plagscan-text">{this.props.i18n.text.get('plugin.footer.plagscan.text')}</span> <a href="http://otavanopisto.fi/resources/public/tietosuojaselosteet/plagscan-privacy-policy.pdf" target="top" className="link link--plagscan-privacy-policy">({this.props.i18n.text.get('plugin.footer.plagScanPrivacyPolicy.label')}).</a>
        </div>
      </div>
    </footer>
  }
}