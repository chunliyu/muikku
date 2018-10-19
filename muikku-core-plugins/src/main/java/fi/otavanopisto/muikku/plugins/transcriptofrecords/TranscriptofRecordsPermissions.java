package fi.otavanopisto.muikku.plugins.transcriptofrecords;

import java.util.List;

import javax.enterprise.context.ApplicationScoped;

import fi.otavanopisto.muikku.model.users.EnvironmentRoleArchetype;
import fi.otavanopisto.muikku.model.workspace.WorkspaceRoleArchetype;
import fi.otavanopisto.muikku.security.AbstractMuikkuPermissionCollection;
import fi.otavanopisto.muikku.security.DefaultEnvironmentPermissionRoles;
import fi.otavanopisto.muikku.security.MuikkuPermissionCollection;
import fi.otavanopisto.muikku.security.PermissionScope;
import fi.otavanopisto.security.Scope;

@ApplicationScoped
public class TranscriptofRecordsPermissions extends AbstractMuikkuPermissionCollection implements MuikkuPermissionCollection {

  @Scope (PermissionScope.ENVIRONMENT)
  @DefaultEnvironmentPermissionRoles ( { EnvironmentRoleArchetype.STUDENT } )
  public static final String TRANSCRIPT_OF_RECORDS_VIEW = "TRANSCRIPT_OF_RECORDS_VIEW";
  
  @Scope (PermissionScope.ENVIRONMENT)
  @DefaultEnvironmentPermissionRoles ( {
	EnvironmentRoleArchetype.STUDY_GUIDER,
	EnvironmentRoleArchetype.TEACHER,
	EnvironmentRoleArchetype.STUDY_PROGRAMME_LEADER,
	EnvironmentRoleArchetype.MANAGER,
	EnvironmentRoleArchetype.ADMINISTRATOR
  } )
  public static final String TRANSCRIPT_OF_RECORDS_FILE_UPLOAD = "TRANSCRIPT_OF_RECORDS_FILE_UPLOAD";
  
  @Scope (PermissionScope.ENVIRONMENT)
  @DefaultEnvironmentPermissionRoles ( {
    EnvironmentRoleArchetype.STUDY_GUIDER,
    EnvironmentRoleArchetype.TEACHER,
    EnvironmentRoleArchetype.STUDY_PROGRAMME_LEADER,
    EnvironmentRoleArchetype.MANAGER,
    EnvironmentRoleArchetype.ADMINISTRATOR
  } )
  public static final String TRANSCRIPT_OF_RECORDS_VIEW_ANY_STUDENT_STUDIES = "TRANSCRIPT_OF_RECORDS_VIEW_ANY_STUDENT_STUDIES";
  
  @Scope (PermissionScope.ENVIRONMENT)
  @DefaultEnvironmentPermissionRoles ( {
    EnvironmentRoleArchetype.STUDY_GUIDER,
    EnvironmentRoleArchetype.TEACHER,
    EnvironmentRoleArchetype.STUDY_PROGRAMME_LEADER,
    EnvironmentRoleArchetype.MANAGER,
    EnvironmentRoleArchetype.ADMINISTRATOR
  } )
  public static final String TRANSCRIPT_OF_RECORDS_VIEW_ANY_STUDENT_HOPS_FORM = "TRANSCRIPT_OF_RECORDS_VIEW_ANY_STUDENT_HOPS_FORM";

  @Override
  public List<String> listPermissions() {
    return listPermissions(TranscriptofRecordsPermissions.class);
  }

  @Override
  public boolean containsPermission(String permission) {
    return listPermissions().contains(permission);
  }
  
  @Override
  public String getPermissionScope(String permission) throws NoSuchFieldException {
    return getPermissionScope(TranscriptofRecordsPermissions.class, permission);
  }

  @Override
  public String[] getDefaultPseudoRoles(String permission) throws NoSuchFieldException {
    return getDefaultPseudoRoles(TranscriptofRecordsPermissions.class, permission);
  }

  @Override
  public EnvironmentRoleArchetype[] getDefaultEnvironmentRoles(String permission) throws NoSuchFieldException {
    return getDefaultEnvironmentRoles(TranscriptofRecordsPermissions.class, permission);
  }

  @Override
  public WorkspaceRoleArchetype[] getDefaultWorkspaceRoles(String permission) throws NoSuchFieldException {
    return getDefaultWorkspaceRoles(TranscriptofRecordsPermissions.class, permission);
  }

}
