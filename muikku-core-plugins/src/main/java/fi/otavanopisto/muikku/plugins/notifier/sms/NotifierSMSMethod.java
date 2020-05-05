package fi.otavanopisto.muikku.plugins.notifier.sms;

import javax.enterprise.context.ApplicationScoped;

import fi.otavanopisto.muikku.notifier.NotifierAction;
import fi.otavanopisto.muikku.notifier.NotifierContext;
import fi.otavanopisto.muikku.notifier.NotifierMethod;

@ApplicationScoped
public class NotifierSMSMethod implements NotifierMethod {

  @Override
  public String getName() {
    return "sms";
  }

  @Override
  public String getDisplayName() {
    return "SMS";
  }

  @Override
  public void sendNotification(NotifierAction action, NotifierContext context) {
  }

  @Override
  public boolean isSupported(NotifierAction action) {
    return false;
  }

}
