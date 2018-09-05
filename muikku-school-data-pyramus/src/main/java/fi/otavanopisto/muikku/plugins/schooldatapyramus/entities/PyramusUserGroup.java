package fi.otavanopisto.muikku.plugins.schooldatapyramus.entities;

import fi.otavanopisto.muikku.plugins.schooldatapyramus.SchoolDataPyramusPluginDescriptor;
import fi.otavanopisto.muikku.schooldata.SchoolDataIdentifier;
import fi.otavanopisto.muikku.schooldata.entity.UserGroup;

public class PyramusUserGroup implements UserGroup {

  public PyramusUserGroup(String identifier, String name, boolean guidanceGroup, SchoolDataIdentifier organizationIdentifier) {
    this.identifier = identifier;
    this.name = name;
    this.guidanceGroup = guidanceGroup;
    this.organizationIdentifier = organizationIdentifier;
  }
  
  @Override
  public String getSchoolDataSource() {
    return SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE;
  }

  @Override
  public String getIdentifier() {
    return identifier;
  }

  @Override
  public String getName() {
    return name;
  }

  @Override
  public String getSearchId() {
    return getIdentifier() + "/" + getSchoolDataSource();
  }
  
  @Override
  public boolean isGuidanceGroup() {
    return guidanceGroup;
  }
  
  @Override
  public SchoolDataIdentifier getOrganizationIdentifier() {
    return organizationIdentifier;
  }

  public void setOrganizationIdentifier(SchoolDataIdentifier organizationIdentifier) {
    this.organizationIdentifier = organizationIdentifier;
  }

  private String identifier;
  private String name;
  private boolean guidanceGroup;
  private SchoolDataIdentifier organizationIdentifier;
}
