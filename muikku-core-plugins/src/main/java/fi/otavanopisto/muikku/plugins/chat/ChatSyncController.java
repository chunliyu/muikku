package fi.otavanopisto.muikku.plugins.chat;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ejb.Stateless;
import javax.enterprise.event.Event;
import javax.enterprise.inject.Any;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;

import fi.otavanopisto.muikku.controller.PluginSettingsController;
import fi.otavanopisto.muikku.model.users.EnvironmentRoleArchetype;
import fi.otavanopisto.muikku.model.users.EnvironmentRoleEntity;
import fi.otavanopisto.muikku.model.users.UserSchoolDataIdentifier;
import fi.otavanopisto.muikku.model.workspace.WorkspaceEntity;
import fi.otavanopisto.muikku.openfire.rest.client.RestApiClient;
import fi.otavanopisto.muikku.openfire.rest.client.entity.AuthenticationToken;
import fi.otavanopisto.muikku.openfire.rest.client.entity.MUCRoomEntity;
import fi.otavanopisto.muikku.openfire.rest.client.entity.UserEntity;
import fi.otavanopisto.muikku.plugins.chat.model.WorkspaceChatSettings;
import fi.otavanopisto.muikku.plugins.chat.model.WorkspaceChatStatus;
import fi.otavanopisto.muikku.schooldata.CourseMetaController;
import fi.otavanopisto.muikku.schooldata.SchoolDataBridgeSessionController;
import fi.otavanopisto.muikku.schooldata.SchoolDataIdentifier;
import fi.otavanopisto.muikku.schooldata.WorkspaceController;
import fi.otavanopisto.muikku.schooldata.entity.Curriculum;
import fi.otavanopisto.muikku.schooldata.entity.User;
import fi.otavanopisto.muikku.schooldata.entity.Workspace;
import fi.otavanopisto.muikku.search.SearchProvider;
import fi.otavanopisto.muikku.users.UserController;
import fi.otavanopisto.muikku.users.UserEntityController;
import fi.otavanopisto.muikku.users.UserSchoolDataIdentifierController;
import fi.otavanopisto.muikku.users.WorkspaceUserEntityController;

@Stateless
public class ChatSyncController {

  @Inject
  private PluginSettingsController pluginSettingsController;

  @Inject
  private Logger logger;

  @Inject
  private WorkspaceController workspaceController;

  @Inject
  private WorkspaceUserEntityController workspaceUserEntityController;

  @Inject
  private CourseMetaController courseMetaController;

  @Inject
  @Any
  private Instance<SearchProvider> searchProviders;

  @Inject
  private UserController userController;

  @Inject
  private UserEntityController userEntityController;
  
  @Inject
  private ChatController chatController;

  @Inject
  private Event<WorkspaceChatSettingsEnabledEvent> workspaceChatSettingsEnabledEvent;

  @Inject
  private UserSchoolDataIdentifierController userSchoolDataIdentifierController;
  
  @Inject
  private SchoolDataBridgeSessionController schoolDataBridgeSessionController;

  public void syncStudent(SchoolDataIdentifier studentIdentifier) {

    String openfireToken = pluginSettingsController.getPluginSetting("chat", "openfireToken");
    if (openfireToken == null) {
      logger.log(Level.INFO, "No openfire token set, skipping room sync");
      return;
    }

    String openfireUrl = pluginSettingsController.getPluginSetting("chat", "openfireUrl");
    if (openfireUrl == null) {
      logger.log(Level.INFO, "No openfire url set, skipping room sync");
      return;
    }

    String openfirePort = pluginSettingsController.getPluginSetting("chat", "openfirePort");
    if (openfirePort == null) {
      logger.log(Level.INFO, "No openfire port set, skipping room sync");
      return;
    }
    if (!StringUtils.isNumeric(openfirePort)) {
      logger.log(Level.WARNING, "Invalid openfire port, skipping room sync");
      return;
    }

    AuthenticationToken token = new AuthenticationToken(openfireToken);
    RestApiClient client = new RestApiClient(openfireUrl, Integer.parseInt(openfirePort, 10), token);

    SecureRandom random = new SecureRandom();
    User user = userController.findUserByDataSourceAndIdentifier(studentIdentifier.getDataSource(),
        studentIdentifier.getIdentifier());

    String userSchoolDataSource = user.getSchoolDataSource();
    String userIdentifier = user.getIdentifier();

    try {
      // Checking before creating is subject to a race condition, but in the worst
      // case
      // the creation just fails, resulting in a log entry
      UserEntity userEntity = client.getUser(studentIdentifier.toId());
      if (userEntity == null) {
        logger.log(Level.INFO, "Syncing chat user " + userSchoolDataSource + "/" + userIdentifier);
        // Can't leave the password empty, so next best thing is random passwords

        // The passwords are not actually used
        byte[] passwordBytes = new byte[20];
        random.nextBytes(passwordBytes);
        String password = Base64.encodeBase64String(passwordBytes);

        userEntity = new UserEntity(userSchoolDataSource + "-" + userIdentifier, user.getDisplayName(), "", password);
        client.createUser(userEntity);

        if (userSchoolDataSource == null || userIdentifier == null) {
          logger.log(Level.WARNING, String.format("No user entity found for identifier %s, skipping...", studentIdentifier.getIdentifier()));
        }
      }

      fi.otavanopisto.muikku.model.users.UserEntity muikkuUserEntity = userEntityController.findUserEntityByUser(user);
      List<WorkspaceEntity> workspaceEntities = workspaceUserEntityController.listActiveWorkspaceEntitiesByUserEntity(muikkuUserEntity);

      for (WorkspaceEntity workspaceEntity : workspaceEntities) {
        
        // Ignore workspaces that don't have chat enabled
        WorkspaceChatSettings workspaceChatSettings = chatController.findWorkspaceChatSettings(workspaceEntity);
        if (workspaceChatSettings == null || workspaceChatSettings.getStatus() == WorkspaceChatStatus.DISABLED) {
          continue;
        }
        
        MUCRoomEntity chatRoomEntity = client.getChatRoom(workspaceEntity.getIdentifier());
        Workspace workspace = workspaceController.findWorkspace(workspaceEntity);
        Set<SchoolDataIdentifier> curriculumIdentifiers = workspace.getCurriculumIdentifiers();
        boolean hasCorrectCurriculums = true;

        for (SchoolDataIdentifier curriculumIdentifier : curriculumIdentifiers) {

          Curriculum curriculum = courseMetaController.findCurriculum(curriculumIdentifier);

          String curriculumName = curriculum.getName();

          if (curriculumName.equals("OPS2005")) {
            hasCorrectCurriculums = false;
            break;
          }
        }

        if (hasCorrectCurriculums) {

          if (chatRoomEntity == null) {
            logger.log(Level.INFO, "Syncing chat workspace " + workspaceEntity.getUrlName());
            if (userIdentifier == null) {
              logger.log(Level.WARNING, "Invalid workspace identifier " + userIdentifier + ", skipping...");
              continue;
            }

            String subjectCode = courseMetaController
                .findSubject(workspace.getSchoolDataSource(), workspace.getSubjectIdentifier()).getCode();

            String roomName = subjectCode + workspace.getCourseNumber() + " - " + workspace.getNameExtension();

            List<String> broadcastPresenceRolesList = new ArrayList<String>();
            broadcastPresenceRolesList.add("moderator");
            broadcastPresenceRolesList.add("participant");
            broadcastPresenceRolesList.add("visitor");

            chatRoomEntity = new MUCRoomEntity("workspace-chat-" + workspace.getIdentifier(), roomName, "");
            chatRoomEntity.setPersistent(true);
            chatRoomEntity.setLogEnabled(true);
            chatRoomEntity.setBroadcastPresenceRoles(broadcastPresenceRolesList);
            client.createChatRoom(chatRoomEntity);
          }

          EnvironmentRoleEntity role = userSchoolDataIdentifierController.findUserSchoolDataIdentifierRole(studentIdentifier);
          if (EnvironmentRoleArchetype.ADMINISTRATOR.equals(role.getArchetype())
              || EnvironmentRoleArchetype.STUDY_PROGRAMME_LEADER.equals(role.getArchetype())) {
            client.addOwner("workspace-chat-" + workspace.getIdentifier(), userSchoolDataSource + "-" + userIdentifier);
          }
          else {
            client.addMember("workspace-chat-" + workspace.getIdentifier(), userSchoolDataSource + "-" + userIdentifier);
          }
        }
      }
    }
    catch (Exception e) {
      logger.log(Level.INFO, "Exception when syncing user " + studentIdentifier.getIdentifier(), e);
    }
  }
  
  public void syncRoomOwners(UserSchoolDataIdentifier userSchoolDataIdentifier, String roomName) {
    String openfireToken = pluginSettingsController.getPluginSetting("chat", "openfireToken");
      if (openfireToken == null) {
        logger.log(Level.INFO, "No openfire token set, skipping room sync");
        return;
      }

      String openfireUrl = pluginSettingsController.getPluginSetting("chat", "openfireUrl");
      if (openfireUrl == null) {
        logger.log(Level.INFO, "No openfire url set, skipping room sync");
        return;
      }
      String openfirePort = pluginSettingsController.getPluginSetting("chat", "openfirePort");
      if (openfirePort == null) {
        logger.log(Level.INFO, "No openfire port set, skipping room sync");
        return;
      }
      if (!StringUtils.isNumeric(openfirePort)) {
        logger.log(Level.WARNING, "Invalid openfire port, skipping room sync");
        return;
      }

      AuthenticationToken token = new AuthenticationToken(openfireToken);
      RestApiClient client = new RestApiClient(openfireUrl, Integer.parseInt(openfirePort, 10), token);
      
      schoolDataBridgeSessionController.startSystemSession();
      try {
    	User user = userController.findUserByDataSourceAndIdentifier(userSchoolDataIdentifier.getDataSource(), userSchoolDataIdentifier.getIdentifier()); 

        String userSchoolDataSource = user.getSchoolDataSource();
        String userIdentifier = user.getIdentifier();
              
        String jid = userSchoolDataSource + "-" + userIdentifier;
          
        client.addOwner(roomName, jid);
      }
      finally {
        schoolDataBridgeSessionController.endSystemSession();
      }
      
      

  }
  public void removeChatRoomMembership(SchoolDataIdentifier studentIdentifier, WorkspaceEntity workspaceEntity) {
    
    String openfireToken = pluginSettingsController.getPluginSetting("chat", "openfireToken");
    if (openfireToken == null) {
      logger.log(Level.INFO, "No openfire token set, skipping room sync");
      return;
    }

    String openfireUrl = pluginSettingsController.getPluginSetting("chat", "openfireUrl");
    if (openfireUrl == null) {
      logger.log(Level.INFO, "No openfire url set, skipping room sync");
      return;
    }

    String openfirePort = pluginSettingsController.getPluginSetting("chat", "openfirePort");
    if (openfirePort == null) {
      logger.log(Level.INFO, "No openfire port set, skipping room sync");
      return;
    }
    if (!StringUtils.isNumeric(openfirePort)) {
      logger.log(Level.WARNING, "Invalid openfire port, skipping room sync");
      return;
    }

    AuthenticationToken token = new AuthenticationToken(openfireToken);
    RestApiClient client = new RestApiClient(openfireUrl, Integer.parseInt(openfirePort, 10), token);
    
    User user = userController.findUserByDataSourceAndIdentifier(studentIdentifier.getDataSource(), studentIdentifier.getIdentifier()); 

    String userSchoolDataSource = user.getSchoolDataSource();
    String userIdentifier = user.getIdentifier();
    
    Workspace workspace = workspaceController.findWorkspace(workspaceEntity);

    String roomName = workspace.getIdentifier();
    String jid = userSchoolDataSource + "-" + userIdentifier;
    
    client.deleteMember(roomName, jid);
  }
  
  public void removeWorkspaceChatRoom(WorkspaceEntity workspaceEntity) {
    
    String openfireToken = pluginSettingsController.getPluginSetting("chat", "openfireToken");
    if (openfireToken == null) {
      logger.log(Level.INFO, "No openfire token set, skipping room sync");
      return;
    }

    String openfireUrl = pluginSettingsController.getPluginSetting("chat", "openfireUrl");
    if (openfireUrl == null) {
      logger.log(Level.INFO, "No openfire url set, skipping room sync");
      return;
    }

    String openfirePort = pluginSettingsController.getPluginSetting("chat", "openfirePort");
    if (openfirePort == null) {
      logger.log(Level.INFO, "No openfire port set, skipping room sync");
      return;
    }
    if (!StringUtils.isNumeric(openfirePort)) {
      logger.log(Level.WARNING, "Invalid openfire port, skipping room sync");
      return;
    }

    AuthenticationToken token = new AuthenticationToken(openfireToken);
    RestApiClient client = new RestApiClient(openfireUrl, Integer.parseInt(openfirePort, 10), token);
    
    client.deleteChatRoom("workspace-chat-" + workspaceEntity.getIdentifier());
    

  }
  
 public void syncWorkspace(WorkspaceEntity workspaceEntity) {
    
    String openfireToken = pluginSettingsController.getPluginSetting("chat", "openfireToken");
    if (openfireToken == null) {
      logger.log(Level.INFO, "No openfire token set, skipping room sync");
      return;
    }

    String openfireUrl = pluginSettingsController.getPluginSetting("chat", "openfireUrl");
    if (openfireUrl == null) {
      logger.log(Level.INFO, "No openfire url set, skipping room sync");
      return;
    }

    String openfirePort = pluginSettingsController.getPluginSetting("chat", "openfirePort");
    if (openfirePort == null) {
      logger.log(Level.INFO, "No openfire port set, skipping room sync");
      return;
    }
    if (!StringUtils.isNumeric(openfirePort)) {
      logger.log(Level.WARNING, "Invalid openfire port, skipping room sync");
      return;
    }

    AuthenticationToken token = new AuthenticationToken(openfireToken);
    RestApiClient client = new RestApiClient(openfireUrl, Integer.parseInt(openfirePort, 10), token);
    
    
    Workspace workspace = workspaceController.findWorkspace(workspaceEntity);
    

    String subjectCode = courseMetaController.findSubject(workspace.getSchoolDataSource(), workspace.getSubjectIdentifier()).getCode();
    
    String separator = "workspace-chat-";
    String roomName = subjectCode + workspace.getCourseNumber() + " - " + workspace.getNameExtension();
    MUCRoomEntity chatRoomEntity = client.getChatRoom(workspace.getIdentifier());
    
    List<String> broadcastPresenceRolesList = new ArrayList<String>();
    broadcastPresenceRolesList.add("moderator");
    broadcastPresenceRolesList.add("participant");
    broadcastPresenceRolesList.add("visitor");

    chatRoomEntity = new MUCRoomEntity(separator + workspace.getIdentifier(), roomName, "");
    chatRoomEntity.setPersistent(true);
    chatRoomEntity.setLogEnabled(true);
    chatRoomEntity.setBroadcastPresenceRoles(broadcastPresenceRolesList);
    client.createChatRoom(chatRoomEntity);
    
    workspaceChatSettingsEnabledEvent.fire(new WorkspaceChatSettingsEnabledEvent(workspace.getSchoolDataSource(), workspace.getIdentifier(), true));
  }
 
 public void syncWorkspaceUser(WorkspaceEntity workspaceEntity, SchoolDataIdentifier userIdentifier) {
    String openfireToken = pluginSettingsController.getPluginSetting("chat", "openfireToken");
    if (openfireToken == null) {
      logger.log(Level.INFO, "No openfire token set, skipping room sync");
      return;
      }
    String openfireUrl = pluginSettingsController.getPluginSetting("chat", "openfireUrl");
    if (openfireUrl == null) {
      logger.log(Level.INFO, "No openfire url set, skipping room sync");
      return;
    }
    String openfirePort = pluginSettingsController.getPluginSetting("chat", "openfirePort");
    if (openfirePort == null) {
      logger.log(Level.INFO, "No openfire port set, skipping room sync");
      return;
    }
    if (!StringUtils.isNumeric(openfirePort)) {
      logger.log(Level.WARNING, "Invalid openfire port, skipping room sync");
      return;
    }
    AuthenticationToken token = new AuthenticationToken(openfireToken);
    RestApiClient client = new RestApiClient(openfireUrl, Integer.parseInt(openfirePort, 10), token);
    
    Workspace workspace = workspaceController.findWorkspace(workspaceEntity);

    EnvironmentRoleEntity role = userSchoolDataIdentifierController.findUserSchoolDataIdentifierRole(userIdentifier);
    if (EnvironmentRoleArchetype.ADMINISTRATOR.equals(role.getArchetype()) || EnvironmentRoleArchetype.STUDY_PROGRAMME_LEADER.equals(role.getArchetype())) {
      client.addOwner("workspace-chat-" + workspace.getIdentifier(), userIdentifier.getDataSource() +"-"+ userIdentifier.getIdentifier());
    } else {
      client.addMember("workspace-chat-" + workspace.getIdentifier(), userIdentifier.getDataSource() +"-"+ userIdentifier.getIdentifier());
   }
   
  }
}
