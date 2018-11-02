package fi.otavanopisto.muikku.schooldata.entity;

import java.time.OffsetDateTime;
import java.util.Date;
import java.util.Set;

import fi.otavanopisto.muikku.schooldata.SchoolDataIdentifier;
import fi.otavanopisto.muikku.search.annotations.IndexField;
import fi.otavanopisto.muikku.search.annotations.IndexId;
import fi.otavanopisto.muikku.search.annotations.Indexable;
import fi.otavanopisto.muikku.search.annotations.IndexableFieldMultiField;
import fi.otavanopisto.muikku.search.annotations.IndexableFieldOption;

@Indexable (
  name = "Workspace",
  options = {
    @IndexableFieldOption (
      name = "name",
      type = "multi_field",
      multiFields = {
        @IndexableFieldMultiField(name = "name", type="string", index = "analyzed"),
        @IndexableFieldMultiField(name = "untouched", type="string", index = "not_analyzed")
      }
    ),
    @IndexableFieldOption (
      name = "educationTypeIdentifier",
      type = "multi_field",
      multiFields = {
        @IndexableFieldMultiField(name = "educationTypeIdentifier", type="string", index = "analyzed"),
        @IndexableFieldMultiField(name = "untouched", type="string", index = "not_analyzed")
      }
    ),
    @IndexableFieldOption (
      name = "curriculumIdentifiers",
      type = "multi_field",
      multiFields = {
        @IndexableFieldMultiField(name = "curriculumIdentifiers", type="string", index = "analyzed"),
        @IndexableFieldMultiField(name = "untouched", type="string", index = "not_analyzed")
      }
    ),
    @IndexableFieldOption (
      name = "organizationIdentifier",
      type = "multi_field",
      multiFields = {
        @IndexableFieldMultiField(name = "organizationIdentifier", type="string", index = "analyzed"),
        @IndexableFieldMultiField(name = "untouched", type="string", index = "not_analyzed")
      }
    ),
    @IndexableFieldOption (
      name = "workspaceTypeId",
      type = "multi_field",
      multiFields = {
        @IndexableFieldMultiField(name = "workspaceTypeId", type="string", index = "analyzed"),
        @IndexableFieldMultiField(name = "untouched", type="string", index = "not_analyzed")
      }
    ),
    @IndexableFieldOption (
      name = "access",
      type = "string",
      index = "not_analyzed"
    )
  }
)
public interface Workspace extends SchoolDataEntity {

  public String getIdentifier();

  public String getName();

  public void setName(String name);
  
  public String getNameExtension();
  
  public void setNameExtension(String name);

  public String getDescription();

  public void setDescription(String description);

  public OffsetDateTime getBeginDate();
  
  public void setBeginDate(OffsetDateTime beginDate);

  public OffsetDateTime getEndDate();
  
  public void setEndDate(OffsetDateTime endDate);

  @IndexField (
    toId = true
  )
  public SchoolDataIdentifier getWorkspaceTypeId();
  public void setWorkspaceTypeId(SchoolDataIdentifier workspaceTypeId);

  // TODO: public String getCourseIdentifierDataSource();

  public String getCourseIdentifierIdentifier();

  public Date getLastModified();

  public String getSubjectIdentifier();

  @IndexField (
    toId = true
  )
  public SchoolDataIdentifier getEducationTypeIdentifier();

  @IndexField (
    toId = true
  )
  public SchoolDataIdentifier getEducationSubtypeIdentifier();

  public Double getLength();

  public String getLengthUnitIdentifier();

  public boolean isArchived();
  
  public boolean isEvaluationFeeApplicable();

  public String getViewLink();
  
  public Integer getCourseNumber();

  @IndexId
  public String getSearchId();

  @IndexField (
    toId = true
  )
  public Set<SchoolDataIdentifier> getCurriculumIdentifiers();
}
