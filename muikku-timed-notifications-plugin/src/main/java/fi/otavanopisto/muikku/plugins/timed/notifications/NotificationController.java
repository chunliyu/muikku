// RUNNING IN DRY RUN MODE - REMOVE DRY RUN FUNCTIONALITY AFTER VERIFIED 
package fi.otavanopisto.muikku.plugins.timed.notifications;

import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.enterprise.context.Dependent;
import javax.inject.Inject;

import fi.otavanopisto.muikku.controller.PluginSettingsController;
import fi.otavanopisto.muikku.mail.MailType;
import fi.otavanopisto.muikku.mail.Mailer;
import fi.otavanopisto.muikku.model.users.UserEntity;
/*
import fi.otavanopisto.muikku.plugins.communicator.CommunicatorController;
import fi.otavanopisto.muikku.plugins.communicator.model.CommunicatorMessage;
import fi.otavanopisto.muikku.users.UserEmailEntityController;
*/

@Dependent
public class NotificationController {
  
  @Inject
  private Logger logger;
  
  /*
  @Inject
  private CommunicatorController communicatorController;
  */
  
  @Inject
  private Mailer mailer;
  
  /*
  @Inject
  private UserEmailEntityController userEmailEntityController;
  */
  
  @Inject
  private PluginSettingsController pluginSettingsController;
  
  private String getRecipientEmail() {
    return pluginSettingsController.getPluginSetting("timed-notifications", "dryRunRecipientEmail");
  }
  
  public void sendNotification(String category, String subject, String content, UserEntity recipient) {
    
   String recipientEmail = getRecipientEmail();
   if (recipientEmail == null) {
     logger.log(Level.INFO, String.format("Sending notification %s - %s to %s",
         category,
         subject,
         recipient.getDefaultIdentifier()));
   } else {
     mailer.sendMail(
         MailType.HTML,
         Arrays.asList(recipientEmail),
         subject,
         "SENT TO: " + recipient.getDefaultIdentifier() + "<br/><br/><br/>" + content);
   }
   
   /*
   
   String studentEmail = userEmailEntityController.getUserDefaultEmailAddress(recipient, Boolean.FALSE);
   if (studentEmail != null) {
     mailer.sendMail(MailType.HTML, Arrays.asList(studentEmail), subject, content);
   } else {
     logger.log(
       Level.WARNING, 
       String.format("Cannot send email notification to student %s because no email address was found", recipient.getDefaultIdentifier())
     );
   }   
   return communicatorController.postMessage(
        recipient,
        category,
        subject,
        content,
        Arrays.asList(recipient)
    );

    */
  }

}
