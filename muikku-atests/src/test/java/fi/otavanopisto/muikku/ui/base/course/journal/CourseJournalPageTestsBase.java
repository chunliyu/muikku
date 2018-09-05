package fi.otavanopisto.muikku.ui.base.course.journal;

import static fi.otavanopisto.muikku.mock.PyramusMock.mocker;

import org.apache.commons.lang3.math.NumberUtils;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.junit.Test;

import fi.otavanopisto.muikku.TestUtilities;
import fi.otavanopisto.muikku.atests.Workspace;
import fi.otavanopisto.muikku.mock.PyramusMock.Builder;
import fi.otavanopisto.muikku.mock.model.MockCourseStudent;
import fi.otavanopisto.muikku.mock.model.MockStaffMember;
import fi.otavanopisto.muikku.mock.model.MockStudent;
import fi.otavanopisto.muikku.ui.AbstractUITest;
import fi.otavanopisto.pyramus.rest.model.Sex;
import fi.otavanopisto.pyramus.rest.model.UserRole;

public class CourseJournalPageTestsBase extends AbstractUITest {

  @Test
  public void courseJournalToolsForTeacher() throws Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    Builder mockBuilder = mocker();
    try{
      mockBuilder.addStaffMember(admin).mockLogin(admin).build();
      login();
      Workspace workspace = createWorkspace("testcourse", "test course for testing", "1", Boolean.TRUE);
      try {
        navigate(String.format("/workspace/%s/journal", workspace.getUrlName()), true);
        waitForPresent(".workspace-journal-content-wrapper");
        assertVisible(".workspace-journal-teacher-tools-container");
      } finally {
        deleteWorkspace(workspace.getId());
      }
    }
    finally {
      mockBuilder.wiremockReset();
    }
  }


  @Test
  public void courseJournalNewEntryForStudent() throws Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    try{
      mockBuilder.addStaffMember(admin).addStudent(student).mockLogin(admin).build();
      login();
      Workspace workspace = createWorkspace("testcourse", "test course for testing", "1", Boolean.TRUE);

      Long courseId = NumberUtils.createLong(workspace.getIdentifier()); 
      MockCourseStudent courseStudent = new MockCourseStudent(1l, courseId, student.getId());
      mockBuilder.addCourseStudent(courseId, courseStudent).build();

      logout();
      mockBuilder.mockLogin(student).build();
      login();
      try {
        navigate(String.format("/workspace/%s/journal", workspace.getUrlName()), true);
        waitForPresent(".workspace-journal-content-wrapper");
        assertVisible(".workspace-journal-new-entry-button");
      } finally {
        deleteWorkspace(workspace.getId());
      }
    } finally {
      mockBuilder.wiremockReset();
    }
  }

  @Test
  public void courseJournalEntryAdded() throws Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    try{
      mockBuilder.addStaffMember(admin).addStudent(student).mockLogin(admin).build();
      login();
      Workspace workspace = createWorkspace("testcourse", "test course for testing", "1", Boolean.TRUE);

      Long courseId = NumberUtils.createLong(workspace.getIdentifier()); 
      MockCourseStudent courseStudent = new MockCourseStudent(1l, courseId, student.getId());
      mockBuilder.addCourseStudent(courseId, courseStudent).build();
      
      logout();
      mockBuilder.mockLogin(student).build();
      login();
      try {
        navigate(String.format("/workspace/%s/journal", workspace.getUrlName()), true);
        click(".workspace-journal-new-entry-button");
        addTextToCKEditor("content");
        sendKeys(".mf-textfield-subject", "title");
        click("#socialNavigation.sn-container .jo-message-create .mf-toolbar input[name=\"send\"]");
        waitForPresent("#content");
        waitForPresent(".workspace-journal-title");
        assertText(".workspace-journal-title", "title");
        waitForPresent(".workspace-journal-content>p");
        assertText(".workspace-journal-content>p", "content");
      } finally {
        deleteWorkspace(workspace.getId());
      }
    } finally {
      mockBuilder.wiremockReset();
    }
  }

}