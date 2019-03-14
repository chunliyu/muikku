package fi.otavanopisto.muikku.plugins.workspace;

import java.util.Collection;
import java.util.Date;
import java.util.List;

import javax.inject.Inject;

import fi.otavanopisto.muikku.model.users.UserEntity;
import fi.otavanopisto.muikku.model.workspace.WorkspaceEntity;
import fi.otavanopisto.muikku.plugins.workspace.dao.WorkspaceJournalCommentDAO;
import fi.otavanopisto.muikku.plugins.workspace.dao.WorkspaceJournalEntryDAO;
import fi.otavanopisto.muikku.plugins.workspace.model.WorkspaceJournalComment;
import fi.otavanopisto.muikku.plugins.workspace.model.WorkspaceJournalEntry;

public class WorkspaceJournalController {

  @Inject
  private WorkspaceJournalEntryDAO workspaceJournalEntryDAO;

  @Inject
  private WorkspaceJournalCommentDAO workspaceJournalCommentDAO;

  public WorkspaceJournalEntry createJournalEntry(WorkspaceEntity workspaceEntity, UserEntity userEntity, String html, String title) {
    return workspaceJournalEntryDAO.create(workspaceEntity, userEntity, html, title, new Date(), Boolean.FALSE);
  }

  public List<WorkspaceJournalEntry> listEntriesForStudents(WorkspaceEntity workspaceEntity, Collection<UserEntity> userEntities, int firstResult, int maxResults) {
    return workspaceJournalEntryDAO.listByWorkspaceEntityAndUserEntities(workspaceEntity, userEntities, firstResult, maxResults);
  }
  
  public List<WorkspaceJournalEntry> listEntriesByWorkspaceEntityAndUserEntity(WorkspaceEntity workspaceEntity, UserEntity userEntity, int firstResult, int maxResults) {
    return workspaceJournalEntryDAO.listByWorkspaceEntityIdAndUserEntityId(workspaceEntity, userEntity, firstResult, maxResults);
  }

  public long countEntriesByWorkspaceEntityAndUserEntity(WorkspaceEntity workspaceEntity, UserEntity userEntity) {
    return workspaceJournalEntryDAO.countByWorkspaceEntityIdAndUserEntityId(workspaceEntity.getId(), userEntity.getId());
  }
  
  public WorkspaceJournalEntry findLatestsEntryByWorkspaceEntityAndUserEntity(WorkspaceEntity workspaceEntity, UserEntity userEntity) {
    return workspaceJournalEntryDAO.findLatestByWorkspaceEntityIdAndUserEntityId(workspaceEntity.getId(), userEntity.getId());
  }
  
  public WorkspaceJournalEntry findJournalEntry(Long workspaceJournalEntryId) {
    return workspaceJournalEntryDAO.findById(workspaceJournalEntryId);
  }

  public WorkspaceJournalEntry updateJournalEntry(WorkspaceJournalEntry workspaceJournalEntry, String title, String html) {
    return workspaceJournalEntryDAO.updateContent(workspaceJournalEntry, title, html);
  }
  
  public void archiveJournalEntry(WorkspaceJournalEntry workspaceJournalEntry){
    workspaceJournalEntryDAO.updateArchived(workspaceJournalEntry, Boolean.TRUE);
  }
  
  public WorkspaceJournalComment createComment(WorkspaceJournalEntry journalEntry, WorkspaceJournalComment parent, String comment, Long authorId) {
    return workspaceJournalCommentDAO.create(journalEntry, parent, comment,  authorId);
  }

  public WorkspaceJournalComment updateComment(WorkspaceJournalComment journalComment, String comment) {
    return workspaceJournalCommentDAO.updateComment(journalComment, comment);
  }
  
  public void archiveComment(WorkspaceJournalComment journalComment) {
    List<WorkspaceJournalComment> children = workspaceJournalCommentDAO.listByParent(journalComment);
    for (WorkspaceJournalComment child : children) {
      archiveComment(child);
    }
    workspaceJournalCommentDAO.archive(journalComment);
  }

  public WorkspaceJournalComment findCommentById(Long journalCommentId) {
    return workspaceJournalCommentDAO.findById(journalCommentId);
  }
  
  public List<WorkspaceJournalComment> listCommentsByJournalEntry(WorkspaceJournalEntry journalEntry) {
    return workspaceJournalCommentDAO.listByJournalEntryAndArchived(journalEntry, Boolean.FALSE);
  }
  
  public Long getCommentCount(WorkspaceJournalEntry journalEntry) {
    return workspaceJournalCommentDAO.countByJournalEntryAndArchived(journalEntry, Boolean.FALSE);
  }
}
