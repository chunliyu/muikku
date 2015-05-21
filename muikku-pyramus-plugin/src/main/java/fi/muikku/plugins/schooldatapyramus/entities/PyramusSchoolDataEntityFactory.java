package fi.muikku.plugins.schooldatapyramus.entities;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.joda.time.DateTime;

import fi.muikku.controller.PluginSettingsController;
import fi.muikku.plugins.schooldatapyramus.PyramusIdentifierMapper;
import fi.muikku.plugins.schooldatapyramus.SchoolDataPyramusPluginDescriptor;
import fi.muikku.schooldata.entity.CourseLengthUnit;
import fi.muikku.schooldata.entity.EnvironmentRole;
import fi.muikku.schooldata.entity.EnvironmentRoleArchetype;
import fi.muikku.schooldata.entity.User;
import fi.muikku.schooldata.entity.Workspace;
import fi.muikku.schooldata.entity.WorkspaceAssessment;
import fi.muikku.schooldata.entity.WorkspaceRole;
import fi.muikku.schooldata.entity.WorkspaceRoleArchetype;
import fi.muikku.schooldata.entity.WorkspaceType;
import fi.muikku.schooldata.entity.WorkspaceUser;
import fi.pyramus.rest.model.Course;
import fi.pyramus.rest.model.CourseAssessment;
import fi.pyramus.rest.model.CourseStaffMember;
import fi.pyramus.rest.model.CourseStaffMemberRole;
import fi.pyramus.rest.model.CourseStudent;
import fi.pyramus.rest.model.CourseType;
import fi.pyramus.rest.model.EducationalTimeUnit;
import fi.pyramus.rest.model.UserRole;

public class PyramusSchoolDataEntityFactory {
  
  @Inject
  private PyramusIdentifierMapper identifierMapper;
  
  @Inject
  private PluginSettingsController pluginSettingsController;
  
  public WorkspaceRole createCourseStudentRoleEntity() {
    // TODO: Localize
    return new PyramusWorkspaceRole(identifierMapper.getWorkspaceStudentRoleIdentifier(), "Course Student", WorkspaceRoleArchetype.STUDENT);
  }
  
  @SuppressWarnings("incomplete-switch")
  public User createEntity(fi.pyramus.rest.model.StaffMember staffMember) {
    String displayName = staffMember.getFirstName() + " " + staffMember.getLastName();
    switch (staffMember.getRole()) {
      case ADMINISTRATOR:
        displayName += " (Administrator)";
      break;
      case GUEST:
        displayName += " (Guest)";
      break;
      case MANAGER:
        displayName += " (Manager)";
      break;
      case USER:
        displayName += " (User)";
      break;
    }
    
    
    return new PyramusUser(identifierMapper.getStaffIdentifier(staffMember.getId()),
                           staffMember.getFirstName(),
                           staffMember.getLastName(),
                           displayName,
                           null,
                           null,
                           null,
                           null,
                           null);
  }
  
  public List<User> createEntity(fi.pyramus.rest.model.StaffMember ... staffMembers) {
    List<User> result = new ArrayList<>();
    
    for (fi.pyramus.rest.model.StaffMember staffMember : staffMembers) {
      result.add(createEntity(staffMember));
    }
    
    return result;
  }
  
  public User createEntity(fi.pyramus.rest.model.Student student, fi.pyramus.rest.model.StudyProgramme studyProgramme) {
    return createEntity(student, studyProgramme, null, null, null, null);
  }

  public User createEntity(fi.pyramus.rest.model.Student student, fi.pyramus.rest.model.StudyProgramme studyProgramme, String nationality, String language, String municipality, String school) {
    StringBuilder displayName = new StringBuilder();
    
    displayName
      .append(student.getFirstName())
      .append(' ')
      .append(student.getLastName());
    
    String studyProgrammeName = studyProgramme != null ? studyProgramme.getName() : null;
    
    if (studyProgrammeName != null) {
      displayName.append(String.format(" (%s)", studyProgrammeName));
    }
    
    return new PyramusUser(identifierMapper.getStudentIdentifier(student.getId()),
                           student.getFirstName(),
                           student.getLastName(),
                           displayName.toString(),
                           studyProgrammeName,
                           nationality,
                           language,
                           municipality,
                           school);
  }
  
  public List<User> createEntity(fi.pyramus.rest.model.Student[] students, fi.pyramus.rest.model.StudyProgramme[] studyProgrammes) {
    return createEntity(students,
                        studyProgrammes,
                        new String[students.length],
                        new String[students.length],
                        new String[students.length],
                        new String[students.length]);
  }
  
  private boolean allEqual(int... values) {
    int reference = values[0];
    for (int value : values) {
      if (value != reference) {
        return false;
      }
    }
    
    return true;
  }

  public List<User> createEntity(fi.pyramus.rest.model.Student[] students, fi.pyramus.rest.model.StudyProgramme[] studyProgrammes, String[] nationalities, String[] languages, String[] municipalities, String[] schools) {
    if (!allEqual(students.length,
                  studyProgrammes.length,
                  nationalities.length,
                  languages.length,
                  municipalities.length,
                  schools.length)) {
      throw new RuntimeException("createEntity parameters not all equal length");
    }
    
    List<User> result = new ArrayList<>();
    
    for (int i = 0, l = students. length; i < l; i++) {
      result.add(createEntity(students[i],
                              studyProgrammes[i],
                              nationalities[i],
                              languages[i],
                              municipalities[i],
                              schools[i]));
    }
    
    return result;
  }
  
  public EnvironmentRole createEntity(fi.pyramus.rest.model.UserRole role) {
    if (role == null) {
      return null;
    }
    
    EnvironmentRoleArchetype archetype = getEnvironmentRoleArchetype(role);

    return new PyramusEnvironmentRole("ENV-" + role.name(), archetype, role.name());
  }
  
  public EnvironmentRole createStudentEnvironmentRoleEntity() {
    // TODO: Localize
    EnvironmentRoleArchetype archetype = EnvironmentRoleArchetype.STUDENT;
    return new PyramusEnvironmentRole("ENV-STUDENT", archetype, "Student");
  }

  public List<EnvironmentRole> createEntity(fi.pyramus.rest.model.UserRole... roles) {
    List<EnvironmentRole> result = new ArrayList<>();
    
    for (fi.pyramus.rest.model.UserRole role : roles) {
      result.add(createEntity(role));
    }
    
    return result;
  }

  public WorkspaceRole createEntity(CourseStaffMemberRole staffMemberRole) {
    if (staffMemberRole == null) {
      return null;
    }
    
    WorkspaceRoleArchetype archetype = getWorkspaceRoleArchetype(staffMemberRole.getId());
    return new PyramusWorkspaceRole(identifierMapper.getWorkspaceStaffRoleIdentifier(staffMemberRole.getId()), staffMemberRole.getName(), archetype);
  }

  public List<WorkspaceRole> createEntity(CourseStaffMemberRole[] staffMemberRoles) {
    List<WorkspaceRole> result = new ArrayList<>();
    
    for (fi.pyramus.rest.model.CourseStaffMemberRole staffMemberRole : staffMemberRoles) {
      result.add(createEntity(staffMemberRole));
    }
    
    return result;
  }
  
  public WorkspaceUser createEntity(CourseStaffMember staffMember) {
    if (staffMember == null) {
      return null;
    }
    
    return new PyramusWorkspaceUser(identifierMapper.getWorkspaceStaffIdentifier(staffMember.getId()), 
      SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, 
      identifierMapper.getWorkspaceIdentifier(staffMember.getCourseId()),
      SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, 
      identifierMapper.getStaffIdentifier(staffMember.getStaffMemberId()), 
      SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, 
      identifierMapper.getWorkspaceStaffRoleIdentifier(staffMember.getRoleId())
    );
  }

  public List<WorkspaceUser> createEntity(CourseStaffMember... staffMembers) {
    List<WorkspaceUser> result = new ArrayList<>();
    
    for (CourseStaffMember staffMember : staffMembers) {
      result.add(createEntity(staffMember));
    }
    
    return result;
  }
  
  public WorkspaceUser createEntity(CourseStudent courseStudent) {
    if (courseStudent == null) {
      return null;
    }
    
    return new PyramusWorkspaceUser(identifierMapper.getWorkspaceStudentIdentifier(courseStudent.getId()),
      SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, 
      identifierMapper.getWorkspaceIdentifier(courseStudent.getCourseId()),
      SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, 
      identifierMapper.getStudentIdentifier(courseStudent.getStudentId()), 
      SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, 
      createCourseStudentRoleEntity().getIdentifier());
  }

  public List<WorkspaceUser> createEntity(CourseStudent... courseStudents) {
    List<WorkspaceUser> result = new ArrayList<>();
    
    for (CourseStudent courseStudent : courseStudents) {
      result.add(createEntity(courseStudent));
    }
    
    return result;
  }

  public Workspace createEntity(Course course, String educationTypeIdentifier) {
    if (course == null) {
      return null;
    }
    
    DateTime modified = course.getLastModified();
    if (modified == null) {
      modified = course.getCreated();
    }
    
    return new PyramusWorkspace(
        identifierMapper.getWorkspaceIdentifier(course.getId()),
        course.getName(),
        course.getDescription(),
        identifierMapper.getWorkspaceTypeIdentifier(course.getTypeId()),
        identifierMapper.getWorkspaceCourseIdentifier(course.getSubjectId(), course.getCourseNumber()),
        modified.toDate(),
        identifierMapper.getSubjectIdentifier(course.getSubjectId()),
        educationTypeIdentifier,
        course.getLength(),
        identifierMapper.getCourseLengthUnitIdentifier(course.getLengthUnitId()),
        course.getBeginDate(),
        course.getEndDate(),
        course.getArchived()
    );
  }
  
  public WorkspaceType createEntity(CourseType courseType) {
    return new PyramusWorkspaceType(
      identifierMapper.getWorkspaceTypeIdentifier(courseType.getId()), 
      courseType.getName()
    );
  }

  public WorkspaceAssessment createEntity(CourseAssessment courseAssessment){
    return new PyramusWorkspaceAssessment(
       courseAssessment.getId().toString(),
       identifierMapper.getWorkspaceStudentIdentifier(courseAssessment.getCourseStudentId()),
       identifierMapper.getStaffIdentifier(courseAssessment.getAssessorId()),
       courseAssessment.getGradeId().toString(),
       courseAssessment.getGradingScaleId().toString(),
       courseAssessment.getVerbalAssessment(),
       courseAssessment.getDate().toDate()
     );
  }
  
  public List<WorkspaceAssessment> createEntity(CourseAssessment... courseAssessments){
    List<WorkspaceAssessment> result = new ArrayList<>();
    for(CourseAssessment courseAssessment : courseAssessments){
      result.add(createEntity(courseAssessment));
    }
    return result;
  }
  
  public List<WorkspaceType> createEntities(CourseType... courseTypes) {
    List<WorkspaceType> result = new ArrayList<>();
    
    for (CourseType courseType : courseTypes) {
      result.add(createEntity(courseType));
    }
    
    return result;
  }
  
  public CourseLengthUnit getCourseLengthUnit(EducationalTimeUnit educationalTimeUnit) {
    return new PyramusCourseLengthUnit(
        identifierMapper.getCourseLengthUnitIdentifier(educationalTimeUnit.getId()), 
        educationalTimeUnit.getSymbol(),
        educationalTimeUnit.getName());
  }
  
  private EnvironmentRoleArchetype getEnvironmentRoleArchetype(UserRole role) {
    switch (role) {
      case ADMINISTRATOR:
        return EnvironmentRoleArchetype.ADMINISTRATOR;
      case MANAGER:
        return EnvironmentRoleArchetype.MANAGER;
      case STUDENT:
        return EnvironmentRoleArchetype.STUDENT;
      default:
        return EnvironmentRoleArchetype.CUSTOM;
    }
  }
  
  private WorkspaceRoleArchetype getWorkspaceRoleArchetype(Long staffMemberRoleId) {
    String teacherRoleSetting = pluginSettingsController.getPluginSetting(SchoolDataPyramusPluginDescriptor.PLUGIN_NAME, "roles.workspace.TEACHER");
    if (StringUtils.isNumeric(teacherRoleSetting)) {
      if (staffMemberRoleId.equals(NumberUtils.createLong(teacherRoleSetting))) {
        return WorkspaceRoleArchetype.TEACHER;
      }
    }
    
    return WorkspaceRoleArchetype.CUSTOM;
  }

}
