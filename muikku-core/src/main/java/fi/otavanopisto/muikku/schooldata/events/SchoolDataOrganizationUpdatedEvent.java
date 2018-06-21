package fi.otavanopisto.muikku.schooldata.events;

import fi.otavanopisto.muikku.schooldata.entity.WorkspaceRoleArchetype;

public class SchoolDataOrganizationUpdatedEvent {

  public SchoolDataOrganizationUpdatedEvent(String dataSource, String identifier, WorkspaceRoleArchetype archetype, String name) {
    super();
    this.dataSource = dataSource;
    this.identifier = identifier;
    this.name = name;
  }

  public String getDataSource() {
    return dataSource;
  }

  public String getIdentifier() {
    return identifier;
  }
  
  public String getName() {
    return name;
  }
  
  private String dataSource;
  private String identifier;
  private String name;
}
