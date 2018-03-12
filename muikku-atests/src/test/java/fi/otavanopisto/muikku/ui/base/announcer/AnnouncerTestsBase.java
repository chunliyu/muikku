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
    MockStaffMember admin = new MockStaffMember(1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).mockLogin(admin).build();
    try{
      try{
        login();
        navigate("/announcer", false);
        waitAndClick("div.application-panel__helper-container.application-panel__helper-container--main-action > a.button--primary-function");
        
        waitForPresent(".cke_wysiwyg_frame");
        waitForPresent("div.jumbo-dialog__body > div.container.container--new-announcement-options > div:nth-child(3) > div.react-datepicker-wrapper > div > input");
        selectAllAndClear("div.jumbo-dialog__body > div.container.container--new-announcement-options > div:nth-child(3) > div.react-datepicker-wrapper > div > input");
        sendKeys("div.jumbo-dialog__body > div.container.container--new-announcement-options > div:nth-child(3) > div.react-datepicker-wrapper > div > input", "21.12.2025");
        waitAndClick(".jumbo-dialog__header");
        waitForNotVisible(".react-datepicker");
        sendKeys(".form-field--new-announcement-topic", "Test title");
        addTextToCKEditor("Announcer test announcement");
        waitAndClick(".button--standard-ok");
        waitForNotVisible(".jumbo-dialog");
        waitForPresent(".text--item-article-header");
        assertTextIgnoreCase(".text--item-article-header", "Test title");
        assertTextIgnoreCase(".text--item-article>p", "Announcer test announcement");
      }finally{
        deleteAnnouncements();
      }
    }finally {
      mockBuilder.wiremockReset();
    }   
  }
  
  @Test
  public void deleteAnnouncementTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).mockLogin(admin).build();
    try{
      try{
        login();
        createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), date(125, 10, 12), false, true, null);
        navigate("/announcer", false);
        waitForPresent(".text--item-article-header");
        waitAndClick(".announcement__select-container input");
        waitAndClick("span.button-pill__icon.icon-delete");
        waitAndClick("a.button--standard-ok");
        reloadCurrentPage();
        assertTrue("Element found even though it shouldn't be there", isElementPresent(".text--item-article-header") == false);
        navigate("/", false);
        navigate("/announcer#archived", false);
        
        waitForPresent(".text--item-article-header");
        assertTextIgnoreCase(".text--item-article-header", "Test title");
        assertTextIgnoreCase(".text--item-article>p", "Announcer test announcement");
      }finally{
        deleteAnnouncements();
      }
    }finally {
      mockBuilder.wiremockReset();
    }
  }
  
  @Test
  public void announcementVisibleInFrontpageWidgetTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    try {
      mockBuilder.addStaffMember(admin).addStudent(student).mockLogin(admin).build();
      login();
      try{
        createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), date(125, 10, 12), false, true, null);
        logout();
        mockBuilder.mockLogin(student);
        login();
        waitForPresentAndVisible("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-caption");
        assertTextIgnoreCase("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-caption", "Test title");
        
        waitForPresentAndVisible("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-date");
        assertTextIgnoreCase("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-date", "12.11.2015");
      }finally{
        deleteAnnouncements();
      }
    }finally {
      mockBuilder.wiremockReset();
    }
  }

  @Test
  public void announcementListTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    try{
      mockBuilder.addStaffMember(admin).addStudent(student).mockLogin(admin).build();
      login();
      try{
        createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), date(125, 10, 12), false, true, null);
        logout();
        mockBuilder.mockLogin(student);
        login();

        waitForPresentAndVisible("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-caption");
        assertTextIgnoreCase("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-caption", "Test title");
        waitAndClick("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-caption");
        
        waitForPresent("header.text--announcement-caption");
        assertTextIgnoreCase("header.text--announcement-caption", "Test title");
        assertTextIgnoreCase("div.text-announcement-date", "12.11.2015");
        assertTextIgnoreCase("section.text--announcement-content", "announcer test announcement");
      }finally{
        deleteAnnouncements();
      }
    }finally {
      mockBuilder.wiremockReset();
    }
  }

  @Test
  public void userGroupAnnouncementVisibleTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    try{
      mockBuilder.addStaffMember(admin).addStudent(student).addStudentGroup(2l, "Test group", "Test group for users", 1l, false).addStudentToStudentGroup(2l, student).addStaffMemberToStudentGroup(2l, admin).mockLogin(admin).build();
      login();
      try{
        List<Long> userGroups = new ArrayList<>();
        userGroups.add(2l);
        createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), date(125, 10, 12), false, false, userGroups);
        logout();
        mockBuilder.mockLogin(student);
        login();

        waitForPresentAndVisible("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-caption");
        assertTextIgnoreCase("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-caption", "Test title");
        
        waitForPresentAndVisible("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-date");
        assertTextIgnoreCase("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-date", "12.11.2015");
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
    MockStaffMember admin = new MockStaffMember(1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    Builder mockBuilder = mocker();
    try {
      mockBuilder.addStaffMember(admin).addStudent(student).addStudentGroup(2l, "Test group", "Test group for users", 1l, false).addStaffMemberToStudentGroup(2l, admin).mockLogin(admin).build();
      login();
      try{
        List<Long> userGroups = new ArrayList<>();
        userGroups.add(2l);
        createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), date(125, 10, 12), false, false, userGroups);
        logout();
        mockBuilder.mockLogin(student);
        login();
        waitForPresentAndVisible("div.ordered-container__item--announcements");
        
        assertTrue("Element found even though it shouldn't be there", isElementPresent("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-caption") == false);
      }finally{
        deleteAnnouncements();
      }
    }finally {
      mockBuilder.wiremockReset();
    }
  }
  
  @Test
  public void pastAnnnouncementsListTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());

    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).addStudent(student).mockLogin(admin).build();
    login();    
    createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), date(115, 10, 15), false, true, null);
    try {
      navigate("/announcer", false);
      waitForPresent("div.application-panel__main-container.loader-empty");
      navigate("/", false);
      navigate("/announcer#past", false);
      
      waitForPresent(".text--item-article-header");
      assertTextIgnoreCase(".text--item-article-header", "Test title");
      assertTextIgnoreCase(".text--item-article>p", "Announcer test announcement");       
      navigate("/", false);
      
      waitForPresentAndVisible("div.ordered-container__item--announcements");
      
      assertTrue("Element found even though it shouldn't be there", isElementPresent("div.ordered-container__item--announcements span.item-list__text-body--multiline span.item-list__announcement-caption") == false);
    }finally{
      deleteAnnouncements();
      mockBuilder.wiremockReset();
    }
  }
  
  @Test
  public void myAnnnouncementsListTest() throws JsonProcessingException, Exception {
    MockStaffMember admin = new MockStaffMember(1l, 1l, "Admin", "User", UserRole.ADMINISTRATOR, "121212-1234", "admin@example.com", Sex.MALE);
    MockStudent student = new MockStudent(2l, 2l, "Student", "Tester", "student@example.com", 1l, OffsetDateTime.of(1990, 2, 2, 0, 0, 0, 0, ZoneOffset.UTC), "121212-1212", Sex.FEMALE, TestUtilities.toDate(2012, 1, 1), TestUtilities.getNextYear());
    MockStaffMember another = new MockStaffMember(3l, 3l, "Another", "User", UserRole.ADMINISTRATOR, "121212-1234", "blaablaa@example.com", Sex.MALE);

    Builder mockBuilder = mocker();
    mockBuilder.addStaffMember(admin).addStaffMember(another).addStudent(student).mockLogin(admin).build();
    login();    
    createAnnouncement(admin.getId(), "Test title", "Announcer test announcement", date(115, 10, 12), new java.util.Date(), false, true, null);
    createAnnouncement(another.getId(), "Another test title", "Another announcer test announcement", date(115, 10, 12), new java.util.Date(), false, true, null);
    try {
      navigate("/announcer", false);
      waitForPresent(".text--item-article-header");
      assertCount(".text--item-article-header" ,2);
      
      navigate("/", false);
      navigate("/announcer#mine", false);
      waitForPresent(".text--item-article-header");
      assertTextIgnoreCase(".text--item-article-header", "Test title");
      assertCount(".text--item-article-header" ,1);
    }finally{
      deleteAnnouncements();
      mockBuilder.wiremockReset();
    }
  }
  
}
