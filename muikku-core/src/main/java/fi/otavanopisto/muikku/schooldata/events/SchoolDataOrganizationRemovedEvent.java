package fi.otavanopisto.muikku.schooldata.events;

public class SchoolDataOrganizationRemovedEvent {

  public SchoolDataOrganizationRemovedEvent(String dataSource, String identifier) {
    super();
    this.dataSource = dataSource;
    this.identifier = identifier;
  }

  public String getDataSource() {
    return dataSource;
  }

  public String getIdentifier() {
    return identifier;
  }
  
  private String dataSource;
  private String identifier;
}
