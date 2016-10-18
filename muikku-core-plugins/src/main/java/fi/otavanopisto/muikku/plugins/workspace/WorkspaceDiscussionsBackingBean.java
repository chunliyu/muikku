package fi.otavanopisto.muikku.plugins.workspace;

import java.util.HashMap;
import java.util.Map;

import javax.ejb.Stateful;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;

import org.apache.commons.lang3.StringUtils;
import org.ocpsoft.rewrite.annotation.Join;
import org.ocpsoft.rewrite.annotation.Parameter;
import org.ocpsoft.rewrite.annotation.RequestAction;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import fi.otavanopisto.muikku.jsf.NavigationRules;
import fi.otavanopisto.muikku.model.workspace.WorkspaceEntity;
import fi.otavanopisto.muikku.plugins.forum.ForumController;
import fi.otavanopisto.muikku.plugins.forum.ForumResourcePermissionCollection;
import fi.otavanopisto.muikku.plugins.forum.model.WorkspaceForumArea;
import fi.otavanopisto.muikku.schooldata.WorkspaceController;
import fi.otavanopisto.muikku.session.SessionController;
import fi.otavanopisto.security.LoggedIn;

@Named
@Stateful
@RequestScoped
@Join (path = "/workspace/{workspaceUrlName}/discussions", to = "/jsf/workspace/discussions.jsf")
@LoggedIn
public class WorkspaceDiscussionsBackingBean extends AbstractWorkspaceBackingBean {
  
  @Parameter
  private String workspaceUrlName;

  @Inject
  private SessionController sessionController;

  @Inject
  private WorkspaceController workspaceController;

  @Inject
  private ForumController forumController;

  @Inject
  @Named
  private WorkspaceBackingBean workspaceBackingBean;

  @RequestAction
  public String init() {
    String urlName = getWorkspaceUrlName();
    
    if (StringUtils.isBlank(urlName)) {
      return NavigationRules.NOT_FOUND;
    }

    WorkspaceEntity workspaceEntity = workspaceController.findWorkspaceEntityByUrlName(urlName);
    if (workspaceEntity == null) {
      return NavigationRules.NOT_FOUND;
    }
    
    if (!sessionController.hasWorkspacePermission(ForumResourcePermissionCollection.FORUM_ACCESSWORKSPACEFORUMS, workspaceEntity)) {
      return NavigationRules.ACCESS_DENIED;
    }

    workspaceEntityId = workspaceEntity.getId();
    workspaceBackingBean.setWorkspaceUrlName(urlName);
    workspaceName = workspaceBackingBean.getWorkspaceName();

    lockStickyPermission = sessionController.hasWorkspacePermission(ForumResourcePermissionCollection.FORUM_LOCK_OR_STICKIFY_WORKSPACE_MESSAGES, workspaceEntity);
    
    Map<Long, AreaPermission> areaPermissions = new HashMap<>();
    
    for (WorkspaceForumArea forumArea : forumController.listWorkspaceForumAreas(workspaceEntity)) {
      areaPermissions.put(forumArea.getId(), new AreaPermission(sessionController.hasWorkspacePermission(ForumResourcePermissionCollection.FORUM_DELETE_ENVIRONMENT_MESSAGES, workspaceEntity)));
    }

    canCreateArea = sessionController.hasWorkspacePermission(ForumResourcePermissionCollection.FORUM_CREATEWORKSPACEFORUM, workspaceEntity);
    canUpdateArea = sessionController.hasWorkspacePermission(ForumResourcePermissionCollection.FORUM_UPDATEWORKSPACEFORUM, workspaceEntity);
    canDeleteArea = sessionController.hasWorkspacePermission(ForumResourcePermissionCollection.FORUM_DELETEWORKSPACEFORUM, workspaceEntity);
    
    try {
      this.areaPermissions = new ObjectMapper().writeValueAsString(areaPermissions);
    } catch (JsonProcessingException e) {
      return NavigationRules.INTERNAL_ERROR;
    }
    
    return null;
  }
  
  public String getWorkspaceName() {
    return workspaceName;
  }
  
  public String getWorkspaceUrlName() {
    return workspaceUrlName;
  }
  
  public void setWorkspaceUrlName(String workspaceUrlName) {
    this.workspaceUrlName = workspaceUrlName;
  }
  
  public Long getWorkspaceEntityId() {
    return workspaceEntityId;
  }
  
  public String getAreaPermissions() {
    return areaPermissions;
  }
  
  public Boolean getLockStickyPermission() {
    return lockStickyPermission;
  }

  public boolean getCanCreateArea() {
    return canCreateArea;
  }
  
  public boolean getCanUpdateArea() {
    return canUpdateArea;
  }
  
  public boolean getCanDeleteArea() {
    return canDeleteArea;
  }
  
  private Long workspaceEntityId;
  private String areaPermissions;
  private Boolean lockStickyPermission;
  private boolean canCreateArea = false;
  private boolean canUpdateArea = false;
  private boolean canDeleteArea = false;

  public static class AreaPermission {
    
    public AreaPermission(Boolean removeThread) {
      this.removeThread = removeThread;
    }

    public Boolean getRemoveThread() {
      return removeThread;
    }
    
    private Boolean removeThread;
  }
    private String workspaceName;
}