package fi.otavanopisto.muikku.search;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.collections.CollectionUtils;

import fi.otavanopisto.muikku.model.workspace.WorkspaceAccess;
import fi.otavanopisto.muikku.schooldata.SchoolDataIdentifier;
import fi.otavanopisto.muikku.search.SearchProvider.Sort;

public abstract class AbstractWorkspaceSearchBuilder implements WorkspaceSearchBuilder {

  public abstract SearchResult search();
  
  @Override
  public String getSchoolDataSource() {
    return schoolDataSource;
  }
  
  @Override
  public WorkspaceSearchBuilder setSchoolDataSource(String schoolDataSource) {
    this.schoolDataSource = schoolDataSource;
    return this;
  }
  
  @Override
  public List<String> getSubjects() {
    return subjects;
  }
  
  @Override
  public WorkspaceSearchBuilder addSubject(String subject) {
    if (this.subjects == null) {
      this.subjects = new ArrayList<>();
    }
    this.subjects.add(subject);
    return this;
  }
  
  @Override
  public WorkspaceSearchBuilder setSubjects(List<String> subjects) {
    this.subjects = subjects;
    return this;
  }
  
  @Override
  public List<String> getWorkspaceIdentifiers() {
    return workspaceIdentifiers;
  }
  
  @Override
  public WorkspaceSearchBuilder addWorkspaceIdentifier(String identifier) {
    if (this.workspaceIdentifiers == null) {
      this.workspaceIdentifiers = new ArrayList<>();
    }
    this.workspaceIdentifiers.add(identifier);
    return this;
  }
  
  @Override
  public WorkspaceSearchBuilder setWorkspaceIdentifiers(List<String> identifiers) {
    this.workspaceIdentifiers = identifiers;
    return this;
  }
  
  @Override
  public List<SchoolDataIdentifier> getEducationTypeIdentifiers() {
    return educationTypeIdentifiers;
  }
  
  @Override
  public WorkspaceSearchBuilder addEducationTypeIdentifier(SchoolDataIdentifier educationTypeIdentifier) {
    if (this.educationTypeIdentifiers == null) {
      this.educationTypeIdentifiers = new ArrayList<>();
    }
    this.educationTypeIdentifiers.add(educationTypeIdentifier);
    return this;
  }
  
  @Override
  public WorkspaceSearchBuilder setEducationTypeIdentifiers(List<SchoolDataIdentifier> educationTypeIdentifiers) {
    this.educationTypeIdentifiers = educationTypeIdentifiers;
    return this;
  }
  
  @Override
  public List<SchoolDataIdentifier> getCurriculumIdentifiers() {
    return curriculumIdentifiers;
  }
  
  @Override
  public WorkspaceSearchBuilder addCurriculumIdentifier(SchoolDataIdentifier curriculumIdentifier) {
    if (this.curriculumIdentifiers == null) {
      this.curriculumIdentifiers = new ArrayList<>();
    }
    this.curriculumIdentifiers.add(curriculumIdentifier);
    return this;
  }
  
  @Override
  public WorkspaceSearchBuilder setCurriculumIdentifiers(List<SchoolDataIdentifier> curriculumIdentifiers) {
    this.curriculumIdentifiers = curriculumIdentifiers;
    return this;
  }
  
  @Override
  public List<SchoolDataIdentifier> getOrganizationIdentifiers() {
    return organizationIdentifiers;
  }
  
  @Override
  public WorkspaceSearchBuilder addOrganizationIdentifier(SchoolDataIdentifier organizationIdentifier) {
    if (this.organizationIdentifiers == null) {
      this.organizationIdentifiers = new ArrayList<>();
    }
    this.organizationIdentifiers.add(organizationIdentifier);
    return this;
  }
  
  @Override
  public WorkspaceSearchBuilder setOrganizationIdentifiers(List<SchoolDataIdentifier> organizationIdentifiers) {
    this.organizationIdentifiers = organizationIdentifiers;
    return this;
  }
  
  @Override
  public String getFreeText() {
    return freeText;
  }
  
  @Override
  public WorkspaceSearchBuilder setFreeText(String freeText) {
    this.freeText = freeText;
    return this;
  }
  
  @Override
  public Set<WorkspaceAccess> getAccesses() {
    return Collections.unmodifiableSet(accesses);
  }
  
  @Override
  public WorkspaceSearchBuilder addAccess(WorkspaceAccess access) {
    this.accesses.add(access);
    return this;
  }
  
  @Override
  public WorkspaceSearchBuilder setAccesses(Collection<WorkspaceAccess> accesses) {
    this.accesses.clear();
    if (CollectionUtils.isNotEmpty(accesses)) {
      this.accesses.addAll(accesses);
    }
    return this;
  }
  
  @Override
  public SchoolDataIdentifier getAccessUser() {
    return accessUser;
  }
  
  @Override
  public WorkspaceSearchBuilder setAccessUser(SchoolDataIdentifier accessUser) {
    this.accessUser = accessUser;
    return this;
  }
  
  @Override
  public boolean isIncludeUnpublished() {
    return includeUnpublished;
  }
  
  @Override
  public WorkspaceSearchBuilder setIncludeUnpublished(boolean includeUnpublished) {
    this.includeUnpublished = includeUnpublished;
    return this;
  }
  
  @Override
  public int getFirstResult() {
    return firstResult;
  }
  
  @Override
  public WorkspaceSearchBuilder setFirstResult(int firstResult) {
    this.firstResult = firstResult;
    return this;
  }
  
  @Override
  public int getMaxResults() {
    return maxResults;
  }
  
  @Override
  public WorkspaceSearchBuilder setMaxResults(int maxResults) {
    this.maxResults = maxResults;
    return this;
  }
  
  @Override
  public List<Sort> getSorts() {
    return sorts;
  }
  
  @Override
  public WorkspaceSearchBuilder addSort(Sort sort) {
    if (this.sorts == null) {
      this.sorts = new ArrayList<>();
    }
    this.sorts.add(sort);
    return this;
  }
  
  @Override
  public WorkspaceSearchBuilder setSorts(List<Sort> sorts) {
    this.sorts = sorts;
    return this;
  }
  
  @Override
  public TemplateRestriction getTemplateRestriction() {
    return templateRestriction;
  }
  
  @Override
  public WorkspaceSearchBuilder setTemplateRestriction(TemplateRestriction templateRestriction) {
    this.templateRestriction = templateRestriction;
    return this;
  }
  
  private String freeText;
  private String schoolDataSource;
  private List<String> workspaceIdentifiers = null;
  private List<String> subjects = null;
  private List<SchoolDataIdentifier> educationTypeIdentifiers = null; 
  private List<SchoolDataIdentifier> curriculumIdentifiers = null;
  private List<SchoolDataIdentifier> organizationIdentifiers = null;
  private EnumSet<WorkspaceAccess> accesses = EnumSet.noneOf(WorkspaceAccess.class);
  private SchoolDataIdentifier accessUser; 
  private boolean includeUnpublished;
  private int firstResult;
  private int maxResults;
  private List<Sort> sorts = null;
  private TemplateRestriction templateRestriction = TemplateRestriction.ONLY_WORKSPACES;
}
