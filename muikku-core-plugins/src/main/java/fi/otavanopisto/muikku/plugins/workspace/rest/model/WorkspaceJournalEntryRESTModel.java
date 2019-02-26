package fi.otavanopisto.muikku.plugins.workspace.rest.model;

import java.util.Date;

public class WorkspaceJournalEntryRESTModel {

  public WorkspaceJournalEntryRESTModel() {
    super();
  }

  public WorkspaceJournalEntryRESTModel(Long id, Long workspaceEntityId, Long userEntityId, String firstName,
      String lastName, String html, String title, Date created) {
    super();
    this.id = id;
    this.workspaceEntityId = workspaceEntityId;
    this.userEntityId = userEntityId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.content = html;
    this.title = title;
    this.created = created;
  }

  public Long getWorkspaceEntityId() {
    return workspaceEntityId;
  }

  public void setWorkspaceEntityId(Long workspaceEntityId) {
    this.workspaceEntityId = workspaceEntityId;
  }

  public Long getUserEntityId() {
    return userEntityId;
  }

  public void setUserEntityId(Long userEntityId) {
    this.userEntityId = userEntityId;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String html) {
    this.content = html;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Date getCreated() {
    return created;
  }

  public void setCreated(Date created) {
    this.created = created;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  private Long id;
  private Long workspaceEntityId;
  private Long userEntityId;
  private String firstName;
  private String lastName;
  private String content;
  private String title;
  private Date created;
}
