package fi.otavanopisto.muikku.plugins.transcriptofrecords;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
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

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import fi.otavanopisto.muikku.controller.PluginSettingsController;
import fi.otavanopisto.muikku.model.workspace.WorkspaceEntity;
import fi.otavanopisto.muikku.model.workspace.WorkspaceUserEntity;
import fi.otavanopisto.muikku.plugins.transcriptofrecords.settings.MatriculationSubject;
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
    return new TranscriptofRecordsUserProperties(userSchoolDataController.listUserProperties(user));
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
  public List<MatriculationSubject> listMatriculationSubjects() {
    String subjectsJson = pluginSettingsController.getPluginSetting("transcriptofrecords", MATRICULATION_SUBJECTS_PLUGIN_SETTING_KEY);
    if (StringUtils.isNotBlank(subjectsJson)) {
      ObjectMapper objectMapper = new ObjectMapper();
      try {
        return objectMapper.readValue(subjectsJson, new TypeReference<List<MatriculationSubject>>() { });
      } catch (IOException e) {
        if (logger.isLoggable(Level.SEVERE)) {
          logger.log(Level.SEVERE, String.format("Failed to parse %s setting value", MATRICULATION_SUBJECTS_PLUGIN_SETTING_KEY), e);
        }
      }
    }
    
    return Collections.emptyList();
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