package fi.otavanopisto.muikku.ui.base.guider;

import java.io.File;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.junit.Test;

import fi.otavanopisto.muikku.TestEnvironments;
import fi.otavanopisto.muikku.TestUtilities;
import fi.otavanopisto.muikku.atests.Workspace;
import fi.otavanopisto.muikku.mock.PyramusMock.Builder;
import fi.otavanopisto.muikku.mock.model.MockCourseStudent;
import fi.otavanopisto.muikku.mock.model.MockStaffMember;
import fi.otavanopisto.muikku.mock.model.MockStudent;
import fi.otavanopisto.muikku.ui.AbstractUITest;
import fi.otavanopisto.pyramus.rest.model.CourseStaffMember;
import fi.otavanopisto.pyramus.rest.model.Sex;
import fi.otavanopisto.pyramus.rest.model.UserRole;
import static fi.otavanopisto.muikku.mock.PyramusMock.mocker;

public class GuiderTestsBase extends AbstractUITest {
  @Test
  public void filterByNameTest() throws Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "Person", UserRole.ADMINISTRATOR, "090978-1234", "testadmin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(3l, 3l, "Second", "User", "teststudent@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).addStudent(student).mockLogin(admin).build();
    login();
    Workspace workspace = createWorkspace("testscourse", "test course for testing", "3", Boolean.TRUE);
    Workspace workspace2 = createWorkspace("diffentscourse", "Second test course", "4", Boolean.TRUE);
    MockCourseStudent mcs = new MockCourseStudent(3l, workspace.getId(), student.getId());
    mockBuilder.addCourseStudent(workspace.getId(), mcs).build();
    try {
      navigate("/guider", true);
      sendKeys(".gt-search .search", "Second User");
      waitForPresent(".gt-user .gt-user-meta-topic>span");
      assertText(".gt-user .gt-user-meta-topic>span", "Second User (Test Study Programme)");
    } finally {
      deleteWorkspace(workspace.getId());
      deleteWorkspace(workspace2.getId());
      mockBuilder.wiremockReset();
    }

  }
  
  @Test
  public void filterByWorkspaceTest() throws Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "Person", UserRole.ADMINISTRATOR, "090978-1234", "testadmin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(3l, 3l, "Second", "User", "teststudent@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).addStudent(student).mockLogin(admin).build();
    login();
    Workspace workspace = createWorkspace("testcourse", "test course for testing", "1", Boolean.TRUE);
    Workspace workspace2 = createWorkspace("diffentcourse", "Second test course", "2", Boolean.TRUE);
    MockCourseStudent mcs = new MockCourseStudent(1l, workspace.getId(), student.getId());
    
    CourseStaffMember courseStaffMember = new CourseStaffMember(1l, 1l, admin.getId(), 7l);

    mockBuilder
      .addCourseStaffMember(workspace.getId(), courseStaffMember)
      .addCourseStudent(workspace.getId(), mcs)
      .build();
    try {
      navigate("/guider", true);
      waitAndClick(String.format("a.gt-filter-link[data-id~=\"%d\"]", workspace.getId()));
      waitForPresent(".gt-user .gt-user-meta-topic>span");
      assertText(".gt-user .gt-user-meta-topic>span", "Second User (Test Study Programme)");
    } finally {
      deleteWorkspace(workspace2.getId());
      deleteWorkspace(workspace.getId());
      mockBuilder.wiremockReset();
    }
  }
  
  @Test
  @TestEnvironments (
    browsers = {
      TestEnvironments.Browser.CHROME,
      TestEnvironments.Browser.FIREFOX,
      TestEnvironments.Browser.INTERNET_EXPLORER,
    }
  )
  public void uploadFileToStudentTest() throws Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "Person", UserRole.ADMINISTRATOR, "090978-1234", "testadmin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(3l, 3l, "Second", "User", "teststudent@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).addStudent(student).mockLogin(admin).build();
    login();
    Workspace workspace = createWorkspace("testcourse", "test course for testing", "1", Boolean.TRUE);
    MockCourseStudent mcs = new MockCourseStudent(1l, workspace.getId(), student.getId());
    
    CourseStaffMember courseStaffMember = new CourseStaffMember(1l, 1l, admin.getId(), 7l);

    mockBuilder
      .addCourseStaffMember(workspace.getId(), courseStaffMember)
      .addCourseStudent(workspace.getId(), mcs)
      .build();
    try {
      navigate("/guider", true);
      waitAndClick(".gt-user .gt-user-meta-topic>span");
      waitAndClick(".gt-user .gt-tool-view-profile");
      File testFile = getTestFile();
      waitForPresent(".gt-user-files .gt-user-file-add input[type=\"file\"]");
      sendKeys(".gt-user-files .gt-user-file-add input[type=\"file\"]", testFile.getAbsolutePath());
      waitForPresent(".gt-user-file .gt-user-file-name a");
      scrollIntoView(".gt-user-file .gt-user-file-name a");
      assertTextIgnoreCase(".gt-user-file .gt-user-file-name a", testFile.getName());
      logout();
      mockBuilder.mockLogin(student).build();
      login();
      navigate("/records/", true);
      waitForPresent(".mf-item .mf-files .mf-file-name a");
      assertText(".mf-item .mf-files .mf-file-name a", "img_100x100_3x8bit_RGB_circles_center_0016.png");
    } finally {
      deleteWorkspace(workspace.getId());
      mockBuilder.wiremockReset();
    }
  }
}
