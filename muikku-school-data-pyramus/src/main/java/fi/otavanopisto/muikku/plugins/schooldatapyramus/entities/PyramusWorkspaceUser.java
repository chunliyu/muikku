package fi.otavanopisto.muikku.plugins.schooldatapyramus.entities;

import org.threeten.bp.ZonedDateTime;

import fi.otavanopisto.muikku.plugins.schooldatapyramus.SchoolDataPyramusPluginDescriptor;
import fi.otavanopisto.muikku.schooldata.SchoolDataIdentifier;
import fi.otavanopisto.muikku.schooldata.entity.AbstractWorkspaceUser;
import fi.otavanopisto.muikku.schooldata.entity.WorkspaceUser;

public class PyramusWorkspaceUser extends AbstractWorkspaceUser implements WorkspaceUser {

	public PyramusWorkspaceUser(SchoolDataIdentifier identifier, SchoolDataIdentifier userIdentifier, SchoolDataIdentifier workspaceIdentifier,
      SchoolDataIdentifier roleIdentifier, ZonedDateTime enrolmentTime) {
    super(identifier, userIdentifier, workspaceIdentifier, roleIdentifier, enrolmentTime);
  }

  @Override
	public String getSchoolDataSource() {
		return SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE;
	}

}
