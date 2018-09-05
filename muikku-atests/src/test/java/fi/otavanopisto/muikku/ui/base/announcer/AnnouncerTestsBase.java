package fi.otavanopisto.muikku.ui.base.announcer;

import static fi.otavanopisto.muikku.mock.PyramusMock.mocker;
import static org.junit.Assert.assertTrue;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

import org.junit.Test;

import com.fasterxml.jackson.core.JsonProcessingException;

import fi.otavanopisto.muikku.TestUtilities;
import fi.otavanopisto.muikku.atests.Workspace;
import fi.otavanopisto.muikku.mock.PyramusMock.Builder;
import fi.otavanopisto.muikku.mock.model.MockCourseStudent;
import fi.otavanopisto.muikku.mock.model.MockStaffMember;
import fi.otavanopisto.muikku.mock.model.MockStudent;
import fi.otavanopisto.muikku.ui.AbstractUITest;
import fi.otavanopisto.pyramus.rest.model.Sex;
import fi.otavanopisto.pyramus.rest.model.UserRole;

public class AnnouncerTestsBase extends AbstractUITest {

  @Test
  public void createAnnouncementTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).mockLogin(admin).build();
    try{
      try{
        login();
        maximizeWindow();
        navigate("/announcer", true);
        waitAndClick(".an-new-announcement");
        
        waitForPresent(".cke_wysiwyg_frame");
        waitForPresent("*[name='endDate']");
        clearElement("*[name='endDate']");
        sendKeys("*[name='endDate']", "21.12.2025");
        
        sendKeys(".mf-textfield-subject", "Test title");
        click(".mf-form-header");
        waitForPresent("#ui-datepicker-div");
        waitForNotVisible("#ui-datepicker-div");
        addTextToCKEditor("Announcer test announcement");
        waitAndClick(".mf-toolbar input[name='send']");
        
        waitForPresent(".an-announcement-topic");
        assertTextIgnoreCase(".an-announcement-topic>span", "Test title");
        assertTextIgnoreCase(".an-announcement-content>p", "Announcer test announcement"); 
      }finally{
        deleteAnnouncements();
      }
    }finally {
      mockBuilder.wiremockReset();
    }   
  }
  
  @Test
  public void deleteAnnouncementTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).mockLogin(admin).build();
    try{
      try{
        login();
        maximizeWindow();
        navigate("/announcer", true);
        waitAndClick(".an-new-announcement");
        
        waitForPresent(".cke_wysiwyg_frame");
        waitForPresent("*[name='endDate']");
        clearElement("*[name='endDate']");
        sendKeys("*[name='endDate']", "21.12.2025");
        
        sendKeys(".mf-textfield-subject", "Test title");
        click(".mf-form-header");
        waitForPresent("#ui-datepicker-div");
        waitForNotVisible("#ui-datepicker-div");
        addTextToCKEditor("Announcer test announcement");
        waitAndClick(".mf-toolbar input[name='send']");
        
        waitForPresent(".an-announcement-topic");
        waitAndClick(".an-announcement-select input");
        waitAndClick(".mf-items-toolbar .icon-delete");
        waitAndClick(".mf-toolbar input[name='send']");
        reloadCurrentPage();
        assertTrue("Element found even though it shouldn't be there", isElementPresent(".an-announcement-topic>span") == false);
      }finally{
        deleteAnnouncements();
      }
    }finally {
      mockBuilder.wiremockReset();
    }
  }
  
  @Test
  public void announcementVisibleInFrontpageWidgetTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    try {
      mockBuilder.addStaffMember(admin).addStudent(student).mockLogin(admin).build();
      login();
      try{
        createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), date(125, 10, 12), false, true, null, null);
        logout();
        mockBuilder.mockLogin(student);
        login();
        waitForPresentAndVisible("#announcements ul>li>div>a");
        assertTextIgnoreCase("#announcements ul>li>div>a", "Test title");
      }finally{
        deleteAnnouncements();
      }
    }finally {
      mockBuilder.wiremockReset();
    }
  }

  @Test
  public void announcementListTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    try{
      mockBuilder.addStaffMember(admin).addStudent(student).mockLogin(admin).build();
      login();
      try{
        createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), date(125, 10, 12), false, true, null, null);
        logout();
        mockBuilder.mockLogin(student);
        login();
        waitForPresentAndVisible("#announcements ul>li>div>a");
        assertTextIgnoreCase("#announcements ul>li>div>a", "Test title");
        navigate("/announcements", true);
        waitForPresent("#announcementContextNavigation .gc-navigation-item");
        assertTextIgnoreCase("#announcementContextNavigation .gc-navigation-item a", "Test title");
        click("#announcementContextNavigation .gc-navigation-item a");
        waitForPresent(".announcement-article h2");
        assertTextIgnoreCase(".announcement-article h2", "Test title");
        assertTextIgnoreCase(".announcement-article div.article-datetime", "12.11.2015");
        assertTextIgnoreCase(".announcement-article div.article-context", "announcer test announcement");
      }finally{
        deleteAnnouncements();
      }
    }finally {
      mockBuilder.wiremockReset();
    }
  }

  @Test
  public void userGroupAnnouncementVisibleTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    try{
      mockBuilder.addStaffMember(admin).addStudent(student).addStudentGroup(2l, 1l, "Test group", "Test group for users", 1l, false).addStudentToStudentGroup(2l, student).addStaffMemberToStudentGroup(2l, admin).mockLogin(admin).build();
      login();
      try{
        List<Long> userGroups = new ArrayList<>();
        userGroups.add(2l);
        createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), date(125, 10, 12), false, false, userGroups, null);
        logout();
        mockBuilder.mockLogin(student);
        login();
        waitForPresent("#announcements ul>li>div>a");
        assertTextIgnoreCase("#announcements ul>li>div>a", "Test title");
      }finally{
        deleteAnnouncements();
        deleteUserGroup(2l);
      }
    }finally {
      mockBuilder.wiremockReset();
    }
  }
  
  @Test
  public void userGroupAnnouncementNotVisibleTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    try {
      mockBuilder.addStaffMember(admin).addStudent(student).addStudentGroup(2l, 1l, "Test group", "Test group for users", 1l, false).addStaffMemberToStudentGroup(2l, admin).mockLogin(admin).build();
      login();
      try{
        List<Long> userGroups = new ArrayList<>();
        userGroups.add(2l);
        createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), date(125, 10, 12), false, false, userGroups, null);
        logout();
        mockBuilder.mockLogin(student);
        login();
        waitForPresent("#announcements");
        assertTrue("Element found even though it shouldn't be there", isElementPresent("#announcements ul>li>div>a") == false);
      }finally{
        deleteAnnouncements();
      }
    }finally {
      mockBuilder.wiremockReset();
    }
  }
  
  @Test
  public void pastAnnnouncementsListTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Long courseId = 1l;
    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).addStudent(student).mockLogin(admin).build();
    login();
    Workspace workspace = createWorkspace("testcourse", "test course for testing", String.valueOf(courseId), Boolean.TRUE);
    MockCourseStudent mcs = new MockCourseStudent(2l, courseId, student.getId());
    mockBuilder.addCourseStudent(workspace.getId(), mcs).build();
    
    createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), date(115, 10, 15), false, true, null, null);
    try {
      navigate("/announcer", true);
      waitForPresent("div.mf-content-empty");
      waitAndClick("li.an-category[data-folder-id~=\"past\"]");
      waitForPresent("div.an-announcement-topic>span");
      assertTextIgnoreCase("div.an-announcement-topic>span", "Test title");
      navigate("/announcements", true);
      waitForPresent("#announcements");
      assertNotPresent(".announcement-article>header");
    }finally{
      deleteAnnouncements();
      deleteWorkspace(workspace.getId());
      mockBuilder.wiremockReset();
    }
  }
  
  @Test
  public void myAnnnouncementsListTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    MockStaffMember another = new MockStaffMember(3l, 3l, 1l, "Another", "User", UserRole.ADMINISTRATOR, "121212-1234", "blaablaa@example.com", Sex.MALE);
    Long courseId = 1l;
    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).addStaffMember(another).addStudent(student).mockLogin(admin).build();
    login();
    Workspace workspace = createWorkspace("testcourse", "test course for testing", String.valueOf(courseId), Boolean.TRUE);
    MockCourseStudent mcs = new MockCourseStudent(2l, courseId, student.getId());
    mockBuilder.addCourseStudent(workspace.getId(), mcs).build();
    
    createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), new java.util.Date(), false, true, null, null);
    createAnnouncement(another.getId(), "Another test title", "Another announcer test announcement", date(115, 10, 12), new java.util.Date(), false, true, null, null);
    try {
      navigate("/announcer", true);
      waitForPresent(".an-announcement-topic");
      assertCount("div.an-announcement-topic>span" ,2);
      waitAndClick("li.an-category[data-folder-id~=\"mine\"]");
      waitForPresent("li.an-category.selected[data-folder-id~=\"mine\"]");
      waitForPresent("div.an-announcement-topic>span");
      assertTextIgnoreCase("div.an-announcement-topic>span", "Test title");
      assertCount("div.an-announcement-topic>span" ,1);
    }finally{
      deleteAnnouncements();
      deleteWorkspace(workspace.getId());
      mockBuilder.wiremockReset();
    }
  }

  @Test
  public void archivedAnnouncementListTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).mockLogin(admin).build();
    try{
      try{
        login();
        maximizeWindow();
        navigate("/announcer", true);
        waitAndClick(".an-new-announcement");
        
        waitForPresent(".cke_wysiwyg_frame");
        waitForPresent("*[name='endDate']");
        clearElement("*[name='endDate']");
        sendKeys("*[name='endDate']", "21.12.2025");
        
        sendKeys(".mf-textfield-subject", "Test title");
        click(".mf-form-header");
        waitForPresent("#ui-datepicker-div");
        waitForNotVisible("#ui-datepicker-div");
        addTextToCKEditor("Announcer test announcement");
        waitAndClick(".mf-toolbar input[name='send']");
        
        waitForPresent(".an-announcement-topic");
        waitAndClick(".an-announcement-select input");
        waitAndClick(".mf-items-toolbar .icon-delete");
        waitAndClick(".mf-toolbar input[name='send']");
        reloadCurrentPage();
        assertTrue("Element found even though it shouldn't be there", isElementPresent(".an-announcement-topic>span") == false);
        waitAndClick("li.an-category[data-folder-id~=\"archived\"]");
        waitForPresent("li.an-category.selected[data-folder-id~=\"archived\"]");
        waitForPresent("div.an-announcement-topic>span");
        assertTextIgnoreCase("div.an-announcement-topic>span", "Test title");
      }finally{
        deleteAnnouncements();
      }
    }finally {
      mockBuilder.wiremockReset();
    }
  }
  
  
}
