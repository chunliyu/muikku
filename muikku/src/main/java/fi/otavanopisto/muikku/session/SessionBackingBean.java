package fi.otavanopisto.muikku.session;

import java.util.Locale;

import javax.annotation.PostConstruct;
import javax.ejb.Stateful;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;

import org.apache.commons.lang3.StringUtils;

import fi.otavanopisto.muikku.controller.SystemSettingsController;
import fi.otavanopisto.muikku.i18n.LocaleController;
import fi.otavanopisto.muikku.model.users.EnvironmentRoleArchetype;
import fi.otavanopisto.muikku.model.users.EnvironmentRoleEntity;
import fi.otavanopisto.muikku.model.users.UserEntity;
import fi.otavanopisto.muikku.model.workspace.WorkspaceEntity;
import fi.otavanopisto.muikku.plugins.workspace.WorkspaceBackingBean;
import fi.otavanopisto.muikku.schooldata.WorkspaceEntityController;
import fi.otavanopisto.muikku.schooldata.entity.User;
import fi.otavanopisto.muikku.users.UserController;
import fi.otavanopisto.muikku.users.UserEntityController;

@RequestScoped
@Named
@Stateful
public class SessionBackingBean {

  @Inject
  private UserEntityController userEntityController;

  @Inject
  private SessionController sessionController;

  @Inject
  private LocaleController localeController;

  @Inject
  private UserController userController;
  
  @Inject
  private WorkspaceEntityController workspaceEntityController;
  
  @Inject
  private SystemSettingsController systemSettingsController;
  
  @Inject
  private WorkspaceBackingBean workspaceBackingBean;

  @PostConstruct
  public void init() {
    loggedUserRoleArchetype = null;
    loggedUserName = null;
    testsRunning = StringUtils.equals("true", System.getProperty("tests.running"));
    bugsnagApiKey = systemSettingsController.getSetting("bugsnagApiKey");
    bugsnagEnabled = StringUtils.isNotBlank(bugsnagApiKey);    
    loggedUserId = null;
    loggedUser = null;
    
    if (sessionController.isLoggedIn()) {
      UserEntity loggedUser = sessionController.getLoggedUserEntity();
      if (loggedUser != null) {
        String activeSchoolDataSource = sessionController.getLoggedUserSchoolDataSource();
        String activeUserIdentifier = sessionController.getLoggedUserIdentifier();
        
        EnvironmentRoleEntity defaultIdentifierRole = userEntityController.getDefaultIdentifierRole(loggedUser);
        if (defaultIdentifierRole != null) {
          loggedUserRoleArchetype = defaultIdentifierRole.getArchetype();
        }

        User user = userController.findUserByDataSourceAndIdentifier(activeSchoolDataSource, activeUserIdentifier);
        if (user != null) {
          if (!loggedUserRoleArchetype.equals(EnvironmentRoleArchetype.STUDENT)) {
            loggedUserName = String.format("%s %s (%s)", user.getFirstName(), user.getLastName(), resolveLoggedUserRoleText());
          }
          else if (user.getNickName() != null) {
            loggedUserName = String.format("%s %s (%s)", user.getNickName(), user.getLastName(), user.getStudyProgrammeName());
          }
          else {
            loggedUserName = user.getDisplayName();
          }
        }
      }

      this.loggedUserId = sessionController.getLoggedUserEntity().getId();
      this.loggedUser = sessionController.getLoggedUser().toId();
    }
  }

  public boolean getLoggedIn() {
    return sessionController.isLoggedIn();
  }
  
  public boolean getIsStudent() {
    return loggedUserRoleArchetype != null && loggedUserRoleArchetype.equals(EnvironmentRoleArchetype.STUDENT); 
  }
  
  public boolean getIsActiveUser() {
    return sessionController.isActiveUser();
  }

  public Long getLoggedUserId() {
    return loggedUserId;
  }
  
  public String getLoggedUser() {
    return loggedUser;
  }

  public String getResourceLibrary() {
    return "theme-muikku";
  }
  
  public boolean hasEnvironmentPermission(String permissions) {
    if (StringUtils.isBlank(permissions)) {
      return false;
    }
    
    for (String permission : StringUtils.split(permissions, ',')) {
      if (sessionController.hasEnvironmentPermission(permission)) {
        return true;
      }
    }
    
    return false;
  }

  public boolean hasWorkspacePermission(String permissions) {
    if (StringUtils.isBlank(permissions)) {
      return false;
    }
    
    WorkspaceEntity workspaceEntity = workspaceBackingBean.getWorkspaceEntity();
    
    for (String permission : StringUtils.split(permissions, ',')) {
      if (hasWorkspacePermission(permission, workspaceEntity)) {
        return true;
      }
    }
    
    return false;
  }

  public boolean hasWorkspacePermission(String permission, Long workspaceEntityId) {
    WorkspaceEntity workspaceEntity = workspaceEntityId != null ? workspaceEntityController.findWorkspaceEntityById(workspaceEntityId) : null;
    return hasWorkspacePermission(permission, workspaceEntity);
  }

  private boolean hasWorkspacePermission(String permission, WorkspaceEntity workspaceEntity) {
    return sessionController.hasWorkspacePermission(permission, workspaceEntity);
  }

  public String getLoggedUserName() {
    return loggedUserName;
  }

  public Locale getLocale() {
    return localeController.resolveLocale(sessionController.getLocale());
  }
  
  public String getCurrentCountry() {
    return sessionController.getLocale().getCountry();
  }
  
  public boolean getTestsRunning() {
    return testsRunning;
  }
  
  public String getBugsnagApiKey() {
    return bugsnagApiKey;
  }
  
  public boolean getBugsnagEnabled() {
    return bugsnagEnabled;
  }

  private String resolveLoggedUserRoleText() {
    Locale locale = localeController.resolveLocale(sessionController.getLocale());
    switch (loggedUserRoleArchetype) {
    case ADMINISTRATOR:
      return localeController.getText(locale, "role.administrator");
    case MANAGER:
      return localeController.getText(locale, "role.manager");
    case STUDENT:
      return localeController.getText(locale, "role.student");
    case STUDY_PROGRAMME_LEADER:
      return localeController.getText(locale, "role.studyProgrammeLeader");
    case TEACHER:
      return localeController.getText(locale, "role.teacher");
    case STUDY_GUIDER:
      return localeController.getText(locale, "role.studyguider");
    default:
      return localeController.getText(locale, "role.custom");
    }
  }
  
  private String loggedUser;
  private Long loggedUserId;
  private EnvironmentRoleArchetype loggedUserRoleArchetype;
  private String loggedUserName;
  private boolean testsRunning;
  private String bugsnagApiKey;
  private boolean bugsnagEnabled;

}
