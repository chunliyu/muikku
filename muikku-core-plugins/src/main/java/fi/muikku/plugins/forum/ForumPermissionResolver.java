package fi.muikku.plugins.forum;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;

import fi.muikku.controller.ResourceRightsController;
import fi.muikku.dao.courses.CourseUserDAO;
import fi.muikku.dao.security.PermissionDAO;
import fi.muikku.dao.security.ResourceRolePermissionDAO;
import fi.muikku.dao.users.EnvironmentUserDAO;
import fi.muikku.model.courses.CourseUser;
import fi.muikku.model.security.Permission;
import fi.muikku.model.users.EnvironmentUser;
import fi.muikku.model.users.RoleEntity;
import fi.muikku.model.users.UserEntity;
import fi.muikku.model.workspace.WorkspaceEntity;
import fi.muikku.plugins.forum.model.ForumArea;
import fi.muikku.plugins.forum.model.ForumThread;
import fi.muikku.plugins.forum.model.WorkspaceForumArea;
import fi.muikku.schooldata.WorkspaceController;
import fi.muikku.security.AbstractPermissionResolver;
import fi.muikku.security.ContextReference;
import fi.muikku.security.PermissionResolver;
import fi.muikku.security.User;

@RequestScoped
public class ForumPermissionResolver extends AbstractPermissionResolver implements PermissionResolver {

  @Inject
  private ResourceRolePermissionDAO resourceUserRolePermissionDAO;
  
  @Inject
  private CourseUserDAO courseUserDAO;
  
  @Inject
  private EnvironmentUserDAO environmentUserDAO;
  
  @Inject
  private ForumResourcePermissionCollection permissionCollection;
  
  @Inject
  private PermissionDAO permissionDAO;
  
  @Inject
  private WorkspaceController workspaceController;
  
  @Inject
  private ResourceRightsController resourceRightsController;
  
  @Override
  public boolean handlesPermission(String permission) {
    return permissionCollection.containsPermission(permission);
  }
  
  @Override
  public boolean hasPermission(String permission, ContextReference contextReference, User user) {
    ForumArea forumArea = getForumArea(contextReference);
    Permission perm = permissionDAO.findByName(permission);
    UserEntity userEntity = getUserEntity(user);
    
    RoleEntity userRole;
    
    // TODO: typecasts
    if (forumArea instanceof WorkspaceForumArea) {
      WorkspaceForumArea workspaceForum = (WorkspaceForumArea) forumArea;
      
      WorkspaceEntity workspaceEntity = workspaceController.findWorkspaceEntityById(workspaceForum.getWorkspace());
      
      CourseUser courseUser = courseUserDAO.findByCourseAndUser(workspaceEntity, userEntity);
      userRole = courseUser.getCourseUserRole();
    } else {
      EnvironmentUser environmentUser = environmentUserDAO.findByUserAndArchived(userEntity, Boolean.FALSE);
      userRole = environmentUser.getRole();
    }
    
    return resourceUserRolePermissionDAO.hasResourcePermissionAccess(
        resourceRightsController.findResourceRightsById(forumArea.getRights()), userRole, perm) ||
        hasEveryonePermission(permission, forumArea) ||
        userEntity.getId().equals(forumArea.getOwner());
  }

  @Override
  public boolean hasEveryonePermission(String permission, ContextReference contextReference) {
    ForumArea forumArea = getForumArea(contextReference);
    RoleEntity userRole = getEveryoneRole();
    Permission perm = permissionDAO.findByName(permission);
    
    return resourceUserRolePermissionDAO.hasResourcePermissionAccess(
        resourceRightsController.findResourceRightsById(forumArea.getRights()), userRole, perm);
  }
  
  private ForumArea getForumArea(ContextReference contextReference) {
    if (contextReference instanceof ForumArea)
      return (ForumArea) contextReference;
    
    if (contextReference instanceof ForumThread)
      return ((ForumThread) contextReference).getForumArea();
    
    return null;
  }
  
}
