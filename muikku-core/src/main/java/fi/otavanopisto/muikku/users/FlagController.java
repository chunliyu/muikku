package fi.otavanopisto.muikku.users;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

import javax.inject.Inject;

import fi.otavanopisto.muikku.dao.users.FlagDAO;
import fi.otavanopisto.muikku.dao.users.FlagShareDAO;
import fi.otavanopisto.muikku.dao.users.FlagStudentDAO;
import fi.otavanopisto.muikku.model.users.Flag;
import fi.otavanopisto.muikku.model.users.FlagShare;
import fi.otavanopisto.muikku.model.users.FlagStudent;
import fi.otavanopisto.muikku.model.users.UserSchoolDataIdentifier;
import fi.otavanopisto.muikku.schooldata.SchoolDataIdentifier;

public class FlagController {

  @Inject
  private Logger logger;
  
  @Inject
  private FlagDAO flagDAO;
  
  @Inject
  private FlagStudentDAO flagStudentDAO;
  
  @Inject
  private FlagShareDAO flagShareDAO;
  
  @Inject
  private UserSchoolDataIdentifierController userSchoolDataIdentifierController;

  public Flag createFlag(SchoolDataIdentifier ownerIdentifier, String name, String color, String description) {
    UserSchoolDataIdentifier ownerSchoolDataIdentifier = userSchoolDataIdentifierController.findUserSchoolDataIdentifierBySchoolDataIdentifier(ownerIdentifier);
    if (ownerSchoolDataIdentifier == null) {
      logger.severe(String.format("Could not find school data user by identifier %s", ownerIdentifier));
      return null;
    }

    return flagDAO.create(ownerSchoolDataIdentifier, name, color, description, Boolean.FALSE);
  }

  public Flag findFlagById(Long flagId) {
    return flagDAO.findById(flagId);
  }
  
  public List<Flag> listByOwnedAndSharedFlags(SchoolDataIdentifier ownerIdentifier) {
      UserSchoolDataIdentifier userSchoolDataIdentifier = userSchoolDataIdentifierController.findUserSchoolDataIdentifierBySchoolDataIdentifier(ownerIdentifier);
    if (userSchoolDataIdentifier == null) {
      logger.severe(String.format("Could not find school data user by identifier %s", ownerIdentifier));
      return Collections.emptyList();
    }
    
    return listByOwnedAndSharedFlags(userSchoolDataIdentifier);
  }
  
  public List<Flag> listByOwnedAndSharedFlags(UserSchoolDataIdentifier userSchoolDataIdentifier) {
    List<Flag> flags = flagShareDAO.listFlagsByUserIdentifier(userSchoolDataIdentifier);
    flags.addAll(flagDAO.listByOwnerIdentifier(userSchoolDataIdentifier));
    return flags;
  }

  public Flag updateFlag(Flag flag, String name, String color, String description) {
    flag = flagDAO.updateName(flag, name);
    flag = flagDAO.updateColor(flag, color);
    flag = flagDAO.updateDescription(flag, description);
    return flag;
  }

  public boolean hasFlagPermission(Flag flag, SchoolDataIdentifier userIdentifier) {
    UserSchoolDataIdentifier owner = flag.getOwnerIdentifier();
    SchoolDataIdentifier ownerIdentfier = toIdentifier(owner);
    if (ownerIdentfier.equals(userIdentifier)) {
      return true;
    }
    
    UserSchoolDataIdentifier userSchoolDataIdentifier = userSchoolDataIdentifierController.findUserSchoolDataIdentifierBySchoolDataIdentifier(userIdentifier);
    if (userSchoolDataIdentifier == null) {
      logger.severe(String.format("Could not find school data user by identifier %s", userIdentifier));
      return false;
    }
    
    FlagShare flagShare = flagShareDAO.findByFlagAndUserIdentifier(flag, userSchoolDataIdentifier);
    if (flagShare != null) {
      return true;
    }
    
    return false;
  }
  
  public List<SchoolDataIdentifier> getFlaggedStudents(List<Flag> flags) {
    List<UserSchoolDataIdentifier> students = flagStudentDAO.listStudentIdentifiersByFlags(flags);
    return toIdentifiers(students);
  }

  public FlagStudent findFlagStudentById(Long id) {
    return flagStudentDAO.findById(id);
  }

  public List<FlagStudent> listByOwnedAndSharedStudentFlags(SchoolDataIdentifier studentIdentifier,
      SchoolDataIdentifier userIdentifier) {
    
    UserSchoolDataIdentifier userSchoolDataIdentifier = userSchoolDataIdentifierController.findUserSchoolDataIdentifierBySchoolDataIdentifier(userIdentifier);
    if (userSchoolDataIdentifier == null) {
      logger.severe(String.format("Could not find school data user by identifier %s", userIdentifier));
      return Collections.emptyList();
    }
    
    UserSchoolDataIdentifier studentSchoolDataIdentifier = userSchoolDataIdentifierController.findUserSchoolDataIdentifierBySchoolDataIdentifier(studentIdentifier);
    if (studentSchoolDataIdentifier == null) {
      logger.severe(String.format("Could not find school data user by identifier %s", studentIdentifier));
      return Collections.emptyList();
    }

    List<FlagStudent> flagStudents = flagStudentDAO.listByStudentIdentifier(studentSchoolDataIdentifier);

    List<FlagStudent> result = new ArrayList<>(flagStudents.size());
    for (FlagStudent flagStudent : flagStudents) {
      if (hasFlagPermission(flagStudent.getFlag(), userIdentifier)) {
        result.add(flagStudent);
      }
    }
    
    return result;
  }

  public FlagStudent flagStudent(Flag flag, SchoolDataIdentifier studentIdentifier) {
    UserSchoolDataIdentifier studentSchoolDataIdentifier = userSchoolDataIdentifierController.findUserSchoolDataIdentifierBySchoolDataIdentifier(studentIdentifier);
    if (studentSchoolDataIdentifier == null) {
      logger.severe(String.format("Could not find school data user by identifier %s", studentIdentifier));
      return null;
    }
    
    FlagStudent flagStudent = flagStudentDAO.findByFlagAndStudentIdentifier(flag, studentSchoolDataIdentifier);
    if (flagStudent != null) {  
      return flagStudent;
    } 

    return flagStudentDAO.create(flag, studentSchoolDataIdentifier, new Date());
  }
  
  public void unflagStudent(Flag flag, SchoolDataIdentifier studentIdentifier) {
    UserSchoolDataIdentifier studentSchoolDataIdentifier = userSchoolDataIdentifierController.findUserSchoolDataIdentifierBySchoolDataIdentifier(studentIdentifier);
    if (studentSchoolDataIdentifier == null) {
      logger.severe(String.format("Could not find school data user by identifier %s", studentIdentifier));
      return;
    }
    
    FlagStudent flagStudent = flagStudentDAO.findByFlagAndStudentIdentifier(flag, studentSchoolDataIdentifier);
    if (flagStudent != null) {
      unflagStudent(flagStudent);
    }
  }
  
  public void unflagStudent(FlagStudent flagStudent) {
    flagStudentDAO.delete(flagStudent);
  }

  public List<FlagShare> listShares(Flag flag) {
    return flagShareDAO.listByFlag(flag);
  }
  
  public void unshareFlag(Flag flag, UserSchoolDataIdentifier userIdentifier) {
    FlagShare flagShare = flagShareDAO.findByFlagAndUserIdentifier(flag, userIdentifier);
    flagShareDAO.delete(flagShare);
  }

  public FlagShare findFlagShare(Long id) {
    return flagShareDAO.findById(id);
  }

  public FlagShare createFlagShare(Flag flag, SchoolDataIdentifier userIdentifier) {
    UserSchoolDataIdentifier studentSchoolDataIdentifier = userSchoolDataIdentifierController.findUserSchoolDataIdentifierBySchoolDataIdentifier(userIdentifier);
    if (studentSchoolDataIdentifier == null) {
      logger.severe(String.format("Could not find school data user by identifier %s", userIdentifier));
      return null;
    }
    
    return createFlagShare(flag, studentSchoolDataIdentifier);
  }

  private FlagShare createFlagShare(Flag flag, UserSchoolDataIdentifier studentSchoolDataIdentifier) {
    return flagShareDAO.create(flag, studentSchoolDataIdentifier);
  }
  
  public void deleteFlagShare(FlagShare flagShare) {
    flagShareDAO.delete(flagShare);
  }
  
  public void deleteFlag(Flag flag) {
    flagDAO.delete(flag);
  }
  
  public void deleteFlagCascade(Flag flag) {
    List<FlagStudent> flagStudents = flagStudentDAO.listByFlag(flag);
    for (FlagStudent flagStudent : flagStudents) {
      flagStudentDAO.delete(flagStudent);
    }
    
    deleteFlag(flag);
  }
  
  private List<SchoolDataIdentifier> toIdentifiers(List<UserSchoolDataIdentifier> userSchoolDataIdentifiers) {
    List<SchoolDataIdentifier> result = new ArrayList<>(userSchoolDataIdentifiers.size());
    
    for (UserSchoolDataIdentifier userSchoolDataIdentifier : userSchoolDataIdentifiers) {
      result.add(toIdentifier(userSchoolDataIdentifier));
    }
    
    return result;
  }

  private SchoolDataIdentifier toIdentifier(UserSchoolDataIdentifier userSchoolDataIdentifier) {
    SchoolDataIdentifier ownerIdentfier = userSchoolDataIdentifier.schoolDataIdentifier();
    return ownerIdentfier;
  }

}
