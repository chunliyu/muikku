package fi.otavanopisto.muikku.plugins.transcriptofrecords;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import javax.enterprise.inject.Any;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;

import org.apache.commons.lang3.StringUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import fi.otavanopisto.muikku.controller.PluginSettingsController;
import fi.otavanopisto.muikku.model.workspace.WorkspaceEntity;
import fi.otavanopisto.muikku.model.workspace.WorkspaceUserEntity;
import fi.otavanopisto.muikku.plugins.transcriptofrecords.settings.MatriculationSubjects;
import fi.otavanopisto.muikku.plugins.transcriptofrecords.settings.StudentMatriculationSubjects;
import fi.otavanopisto.muikku.schooldata.GradingController;
import fi.otavanopisto.muikku.schooldata.SchoolDataIdentifier;
import fi.otavanopisto.muikku.schooldata.UserSchoolDataController;
import fi.otavanopisto.muikku.schooldata.entity.Subject;
import fi.otavanopisto.muikku.schooldata.entity.User;
import fi.otavanopisto.muikku.schooldata.entity.UserProperty;
import fi.otavanopisto.muikku.schooldata.entity.WorkspaceAssessment;
import fi.otavanopisto.muikku.search.SearchProvider;
import fi.otavanopisto.muikku.search.SearchResult;
import fi.otavanopisto.muikku.users.WorkspaceUserEntityController;

public class TranscriptOfRecordsController {
  
  private static final String MATRICULATION_SUBJECTS_PLUGIN_SETTING_KEY = "matriculation.subjects";
  private static final String USER_MATRICULATION_SUBJECTS_USER_PROPERTY = "hops.matriculation-subjects";
  
  @Inject
  private Logger logger;
  
  @Inject
  private UserSchoolDataController userSchoolDataController;
  
  @Inject
  private GradingController gradingController;

  @Inject
  private WorkspaceUserEntityController workspaceUserEntityController;

  @Inject
  private PluginSettingsController pluginSettingsController;

  @Inject
  @Any
  private Instance<SearchProvider> searchProviders;

  private static final Pattern UPPER_SECONDARY_SCHOOL_SUBJECT_PATTERN = Pattern.compile("^[A-ZÅÄÖ0-9]+$");
  
  public boolean subjectAppliesToStudent(User student, Subject subject) {
    if (subject.getCode() == null) {
      return false;
    }
    
    if (!UPPER_SECONDARY_SCHOOL_SUBJECT_PATTERN.matcher(subject.getCode()).matches()) {
      return false;
    }

    TranscriptofRecordsUserProperties userProperties = loadUserProperties(student);
    
    String mathSyllabus = userProperties.asString("mathSyllabus");
    String finnish = userProperties.asString("finnish");
    boolean german = userProperties.asBoolean("german");
    boolean french = userProperties.asBoolean("french");
    boolean italian = userProperties.asBoolean("italian");
    boolean spanish = userProperties.asBoolean("spanish");
    String religion = userProperties.asString("religion");

    String code = subject.getCode();
    
    if ("MUU".equals(code)) {
      return false;
    }

    // RUB is part of old curriculum that is not supported in vops (new is RUB1)
    if ("RUB".equals(code)) {
      return false;
    }
    
    if ("MAA".equals(mathSyllabus) && "MAB".equals(code)) {
      return false;
    }

    if ("MAB".equals(mathSyllabus) && "MAA".equals(code)) {
      return false;
    }

    if ("S2".equals(finnish) && "ÄI".equals(code)) {
      return false;
    }

    if ("AI".equals(finnish) && "S2".equals(code)) {
      return false;
    }

    if (!german && subject.getCode().startsWith("SA")) {
      return false;
    }

    if (!french && subject.getCode().startsWith("RA")) {
      return false;
    }

    if (!italian && subject.getCode().startsWith("IT")) {
      return false;
    }

    if (!spanish && subject.getCode().startsWith("ES")) {
      return false;
    }

    if ("UX".equals(religion) && ("UE".equals(code) || "ET".equals(code))) {
      return false;
    }

    if ("UE".equals(religion) && ("UX".equals(code) || "ET".equals(code))) {
      return false;
    }

    if ("ET".equals(religion) && ("UE".equals(code) || "UX".equals(code))) {
      return false;
    }

    return true;
  }

  public void saveStringProperty(User user, String propertyName, String value) {
    if (value != null && !"".equals(value)) {
      userSchoolDataController.setUserProperty(user, "hops." + propertyName, value);
    }
  }

  public void saveBoolProperty(User user, String propertyName, boolean value) {
    userSchoolDataController.setUserProperty(user, "hops." + propertyName, value ? "yes" : "no");
  }

  public boolean shouldShowStudies(User user) {
    UserProperty userProperty = userSchoolDataController.getUserProperty(user, "hops.enabled");
    if(userProperty != null && "1".equals(userProperty.getValue())) {
      return true;
    } else {
      return false;
    }
  }

  public TranscriptofRecordsUserProperties loadUserProperties(User user) {
    List<UserProperty> userProperties = userSchoolDataController.listUserProperties(user);
    
    StudentMatriculationSubjects studentMatriculationSubjects = unserializeStudentMatriculationSubjects(userProperties.stream()
      .filter(userProperty -> USER_MATRICULATION_SUBJECTS_USER_PROPERTY.equals(userProperty.getKey()))
      .findFirst()
      .orElse(null));
  
    return new TranscriptofRecordsUserProperties(userProperties, studentMatriculationSubjects);
  }

  public List<VopsWorkspace> listWorkspaceIdentifiersBySubjectIdentifierAndCourseNumber(String schoolDataSource, String subjectIdentifier, int courseNumber) {
    List<VopsWorkspace> retval = new ArrayList<>();
    SearchProvider searchProvider = getProvider("elastic-search");
    if (searchProvider != null) {
      SearchResult sr = searchProvider.searchWorkspaces(schoolDataSource, subjectIdentifier, courseNumber);
      List<Map<String, Object>> results = sr.getResults();
      for (Map<String, Object> result : results) {
        String searchId = (String) result.get("id");
        if (StringUtils.isNotBlank(searchId)) {
          String[] id = searchId.split("/", 2);
          if (id.length == 2) {
            String dataSource = id[1];
            String identifier = id[0];
            String educationTypeId = (String) result.get("educationSubtypeIdentifier");
            String name = (String) result.get("name");
            String description = (String) result.get("description");
            @SuppressWarnings("unchecked")
            ArrayList<String> curriculums = (ArrayList<String>) result.get("curriculumIdentifiers");
            
            SchoolDataIdentifier workspaceIdentifier = new SchoolDataIdentifier(identifier, dataSource);
            SchoolDataIdentifier educationSubtypeIdentifier = SchoolDataIdentifier.fromId(educationTypeId);
            Set<SchoolDataIdentifier> curriculumIdentifiers = new HashSet<>();
            
            for (String curriculum : curriculums) {
              curriculumIdentifiers.add(SchoolDataIdentifier.fromId(curriculum));
            }
            
            retval.add(
                new VopsWorkspace(
                    workspaceIdentifier,
                    educationSubtypeIdentifier,
                    curriculumIdentifiers,
                    name,
                    description
                )
            );
          }
        }
      }
    }
    return retval;
  }

  public Map<SchoolDataIdentifier, WorkspaceAssessment> listStudentAssessments(SchoolDataIdentifier studentIdentifier) {
    List<WorkspaceAssessment> assessmentsByStudent = gradingController.listAssessmentsByStudent(studentIdentifier);
    
    Map<SchoolDataIdentifier, WorkspaceAssessment> result = new HashMap<>();
    for (WorkspaceAssessment assessment : assessmentsByStudent) {
      WorkspaceUserEntity workspaceUserEntity = workspaceUserEntityController.findWorkspaceUserEntityByWorkspaceUserIdentifier(assessment.getWorkspaceUserIdentifier());
      
      WorkspaceEntity workspaceEntity = workspaceUserEntity.getWorkspaceEntity();
      SchoolDataIdentifier workspaceIdentifier = new SchoolDataIdentifier(workspaceEntity.getIdentifier(), workspaceEntity.getDataSource().getIdentifier());
     
      if (!result.containsKey(workspaceIdentifier)) {
        result.put(workspaceIdentifier, assessment);
      } else {
        WorkspaceAssessment storedAssessment = result.get(workspaceIdentifier);
        
        if (assessment.getDate().after(storedAssessment.getDate()))
          result.put(workspaceIdentifier, assessment);
      }
    }
    
    return result;
  }
  
  /**
   * Returns a list of configured matriculation subjects.
   * 
   * @return list of configured matriculation subjects or empty list if setting is not configured.
   */
  public MatriculationSubjects listMatriculationSubjects() {
    String subjectsJson = pluginSettingsController.getPluginSetting("transcriptofrecords", MATRICULATION_SUBJECTS_PLUGIN_SETTING_KEY);
    return unserializeObject(subjectsJson, MatriculationSubjects.class);    
  }
  
  /**
   * Saves a list of student's matriculation subjects
   * 
   * @param student student
   * @param matriculationSubjects list of student's matriculation subjects
   */
  public void saveStudentMatriculationSubjects(User student, StudentMatriculationSubjects matriculationSubjects) {
    userSchoolDataController.setUserProperty(student, USER_MATRICULATION_SUBJECTS_USER_PROPERTY, serializeObject(matriculationSubjects));
  }

  /**
   * Unserializes student's matriculation subjects from user property
   * 
   * @param userProperty user property
   * @return unserialized student's matriculation subjects
   */
  private StudentMatriculationSubjects unserializeStudentMatriculationSubjects(UserProperty userProperty) {
    return unserializeStudentMatriculationSubjects(userProperty != null ? userProperty.getValue() : null);
  }
  
  /**
   * Unserializes student's matriculation subjects from string
   * 
   * @param value string value
   * @return unserialized student's matriculation subjects
   */
  private StudentMatriculationSubjects unserializeStudentMatriculationSubjects(String value) {
    StudentMatriculationSubjects result = unserializeObject(value, StudentMatriculationSubjects.class);
    if (result != null) {
      return result;
    }
    
    return new StudentMatriculationSubjects();
  }
  
  /**
   * Unserialized object from a JSON string
   * 
   * @param string string representation
   * @return unserialized object or null if unserialization fails
   */
  private <T> T unserializeObject(String string, Class<T> targetClass) {
    if (StringUtils.isNotBlank(string)) {
      ObjectMapper objectMapper = new ObjectMapper();
      try {
        return objectMapper.readValue(string, targetClass);
      } catch (IOException e) {
        logger.log(Level.SEVERE, "Failed to unserialize object", e);
      }
    }
    
    return null;
  }
  
  /**
   * Writes an object as JSON string
   * 
   * @param entity to be serialized
   * @return serialized string
   */
  private String serializeObject(Object entity) {
    if (entity == null) {
      return null;
    }

    try {
      ObjectMapper objectMapper = new ObjectMapper();
      return objectMapper.writeValueAsString(entity);
    } catch (JsonProcessingException e) {
      logger.log(Level.SEVERE, "Failed to serialize an entity", e);
    }
    
    return null;
  }

  private SearchProvider getProvider(String name) {
    for (SearchProvider searchProvider : searchProviders) {
      if (name.equals(searchProvider.getName())) {
        return searchProvider;
      }
    }
    return null;
  }
  
}