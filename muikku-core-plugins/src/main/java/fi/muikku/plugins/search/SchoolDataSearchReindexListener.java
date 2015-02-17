package fi.muikku.plugins.search;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.Resource;
import javax.ejb.Singleton;
import javax.ejb.Stateless;
import javax.ejb.Timeout;
import javax.ejb.Timer;
import javax.ejb.TimerConfig;
import javax.ejb.TimerService;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;

import org.jboss.ejb3.annotation.TransactionTimeout;

import fi.muikku.model.workspace.WorkspaceEntity;
import fi.muikku.schooldata.WorkspaceController;
import fi.muikku.schooldata.WorkspaceEntityController;
import fi.muikku.schooldata.entity.User;
import fi.muikku.schooldata.entity.Workspace;
import fi.muikku.search.SearchIndexer;
import fi.muikku.search.SearchReindexEvent;
import fi.muikku.users.UserController;

@ApplicationScoped
@Singleton
public class SchoolDataSearchReindexListener {
  
  @Inject
  private Logger logger;
  
  @Inject
  private WorkspaceController workspaceController;
  
  @Inject
  private WorkspaceEntityController workspaceEntityController;
  
  @Inject
  private UserController userController;

  @Inject
  private SearchIndexer indexer;
  
  @Resource
  private TimerService timerService;

  private int userIndex = 0;
  private int workspaceIndex = 0;
  private static int BATCH = 100;
  
  public void onReindexEvent(@Observes SearchReindexEvent event) {
//    List<WorkspaceEntity> workspaceEntities = workspaceEntityController.listWorkspaceEntities();
//    for (WorkspaceEntity workspaceEntity : workspaceEntities) {
//      Workspace workspace = workspaceController.findWorkspace(workspaceEntity);
//      if (workspace != null) {
//        try {
//          indexer.index(Workspace.class.getSimpleName(), workspace);
//        } catch (Exception e) {
//          logger.log(Level.WARNING, "could not index WorkspaceEntity #" + workspaceEntity.getId(), e);
//        }
//      }
//    }
//    
//    for (User user : userController.listUsers()) {
//      try {
//        indexer.index(User.class.getSimpleName(), user);
//      } catch (Exception e) {
//        logger.log(Level.WARNING, "could not index User #" + user.getSchoolDataSource() + '/' + user.getIdentifier(), e);
//      }
//    }
    
    userIndex = 0;
    workspaceIndex = 0;
    
    System.out.println("Starting reindex timer");
    
    timerService.createSingleActionTimer(60000, new TimerConfig());
  }

  @Timeout
  private void onTimeOut(Timer timer) {
    System.out.println("Reindexing timeout");
    try {
      boolean alldone = reindexWorkspaceEntities() || reindexUsers();
  
  //    if (!alldone)
      //      timerService.createSingleActionTimer(3000, new TimerConfig());
    } catch (Exception ex) {
      logger.log(Level.SEVERE, "Reindexing of entities failed.", ex);
    }
  }
  
  private boolean reindexWorkspaceEntities() {
    List<WorkspaceEntity> workspaceEntities = workspaceEntityController.listWorkspaceEntities();
    
    if (workspaceIndex < workspaceEntities.size()) {
      int last = Math.min(workspaceEntities.size(), workspaceIndex + BATCH);
      
      for (int i = workspaceIndex; i < last; i++) {
        WorkspaceEntity workspaceEntity = workspaceEntities.get(i);
        
        Workspace workspace = workspaceController.findWorkspace(workspaceEntity);
        if (workspace != null) {
          try {
            indexer.index(Workspace.class.getSimpleName(), workspace);
          } catch (Exception e) {
            logger.log(Level.WARNING, "could not index WorkspaceEntity #" + workspaceEntity.getId(), e);
          }
        }
      }

      System.out.println("Reindexed batch of workspaces (" + workspaceIndex + "-" + last + ")");
      
      workspaceIndex += BATCH;
      return false;
    } else
      return true;
  }

  private boolean reindexUsers() {
    List<User> users = userController.listUsers();
    
    if (userIndex < users.size()) {
      int last = Math.min(users.size(), userIndex + BATCH);
      
      for (int i = userIndex; i < last; i++) {
        User user = users.get(i);
        try {
          indexer.index(User.class.getSimpleName(), user);
        } catch (Exception e) {
          logger.log(Level.WARNING, "could not index User #" + user.getSchoolDataSource() + '/' + user.getIdentifier(), e);
        }
      }
      
      System.out.println("Reindexed batch of users (" + userIndex + "-" + last + ")");

      userIndex += BATCH;
      return false;
    } else
      return true;
  }
  
}
