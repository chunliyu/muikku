package fi.otavanopisto.muikku.rest.model;

import java.util.Date;
import java.util.List;

import fi.otavanopisto.muikku.rest.model.StudentFlag;

public class Student {

  public Student() {
  }

  public Student(String id, String firstName, String lastName, String nickName, String studyProgrammeName, Boolean hasImage, String nationality, String language, String municipality, String school,
      String email, Date studyStartDate, Date studyEndDate, Date studyTimeEnd, String curriculumIdentifier,
      boolean updatedByStudent, Long userEntityId, List<StudentFlag> flags) {
    super();
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.nickName = nickName;
    this.studyProgrammeName = studyProgrammeName;
    this.hasImage = hasImage;
    this.nationality = nationality;
    this.language = language;
    this.municipality = municipality;
    this.school = school;
    this.email = email;
    this.studyStartDate = studyStartDate;
    this.studyEndDate = studyEndDate;
    this.studyTimeEnd = studyTimeEnd;
    this.curriculumIdentifier = curriculumIdentifier;
    this.updatedByStudent = updatedByStudent;
    this.userEntityId = userEntityId;
    this.setFlags(flags);
  }
  
  public String getId() {
    return id;
  }
  
  public void setId(String id) {
    this.id = id;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getNickName() {
    return nickName;
  }

  public void setNickName(String nickName) {
    this.nickName = nickName;
  }

  public String getStudyProgrammeName() {
    return studyProgrammeName;
  }
  
  public void setStudyProgrammeName(String studyProgrammeName) {
    this.studyProgrammeName = studyProgrammeName;
  }
  
  public Boolean isHasImage() {
    return hasImage;
  }

  public void setHasImage(Boolean hasImage) {
    this.hasImage = hasImage;
  }

  public String getNationality() {
    return nationality;
  }

  public void setNationality(String nationality) {
    this.nationality = nationality;
  }

  public String getLanguage() {
    return language;
  }

  public void setLanguage(String language) {
    this.language = language;
  }

  public String getMunicipality() {
    return municipality;
  }

  public void setMunicipality(String municipality) {
    this.municipality = municipality;
  }

  public String getSchool() {
    return school;
  }

  public void setSchool(String school) {
    this.school = school;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public Date getStudyStartDate() {
    return studyStartDate;
  }

  public void setStudyStartDate(Date studyStartDate) {
    this.studyStartDate = studyStartDate;
  }
  
  public Date getStudyEndDate() {
    return studyEndDate;
  }
  
  public void setStudyEndDate(Date studyEndDate) {
    this.studyEndDate = studyEndDate;
  }

  public Date getStudyTimeEnd() {
    return studyTimeEnd;
  }

  public void setStudyTimeEnd(Date studyTimeEnd) {
    this.studyTimeEnd = studyTimeEnd;
  }

  public String getCurriculumIdentifier() {
    return curriculumIdentifier;
  }

  public void setCurriculumIdentifier(String curriculumIdentifier) {
    this.curriculumIdentifier = curriculumIdentifier;
  }
  
  public boolean isUpdatedByStudent() {
    return updatedByStudent;
  }
  
  public void setUpdatedByStudent(boolean updatedByStudent) {
    this.updatedByStudent = updatedByStudent;
  }
  
  public List<StudentFlag> getFlags() {
	return flags;
  }

  public void setFlags(List<StudentFlag> flags) {
	this.flags = flags;
  }

  public Long getUserEntityId() {
	return userEntityId;
  }

  public void setUserEntityId(Long userEntityId) {
	this.userEntityId = userEntityId;
  }

  private String id;
  private String firstName;
  private String lastName;
  private String nickName;
  private String studyProgrammeName;
  private Boolean hasImage;
  private String nationality;
  private String language;
  private String municipality;
  private String school;
  private String email;
  private Date studyStartDate;
  private Date studyEndDate;
  private Date studyTimeEnd;
  private String curriculumIdentifier;
  private boolean updatedByStudent;
  private Long userEntityId;
  private List<StudentFlag> flags;
}
