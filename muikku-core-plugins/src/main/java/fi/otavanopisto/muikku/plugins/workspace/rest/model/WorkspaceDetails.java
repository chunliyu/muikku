package fi.otavanopisto.muikku.plugins.workspace.rest.model;

import java.time.OffsetDateTime;

public class WorkspaceDetails {

  public WorkspaceDetails() {
  }

  public WorkspaceDetails(String typeId, OffsetDateTime beginDate, OffsetDateTime endDate, String externalViewUrl, Long rootFolderId) {
    super();
    this.typeId = typeId;
    this.beginDate = beginDate;
    this.endDate = endDate;
    this.externalViewUrl = externalViewUrl;
    this.rootFolderId = rootFolderId;
  }

  public String getTypeId() {
    return typeId;
  }
  
  public void setTypeId(String typeId) {
    this.typeId = typeId;
  }
  
  public String getExternalViewUrl() {
    return externalViewUrl;
  }

  public void setExternalViewUrl(String externalViewUrl) {
    this.externalViewUrl = externalViewUrl;
  }
  
  public OffsetDateTime getBeginDate() {
    return beginDate;
  }
  
  public OffsetDateTime getEndDate() {
    return endDate;
  }

  public Long getRootFolderId() {
    return rootFolderId;
  }

  public void setRootFolderId(Long rootFolderId) {
    this.rootFolderId = rootFolderId;
  }

  private String typeId;
  private String externalViewUrl;
  private OffsetDateTime beginDate;
  private OffsetDateTime endDate;
  private Long rootFolderId;
}
