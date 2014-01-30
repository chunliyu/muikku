package fi.muikku.model.users;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

@Entity
public class UserGroupUser {

  public Long getId() {
    return id;
  }

  public UserGroup getUserGroup() {
    return userGroup;
  }

  public void setUserGroup(UserGroup userGroup) {
    this.userGroup = userGroup;
  }

  public UserEntity getUser() {
    return user;
  }

  public void setUser(UserEntity user) {
    this.user = user;
  }

  public UserGroupRoleEntity getRole() {
    return role;
  }

  public void setRole(UserGroupRoleEntity role) {
    this.role = role;
  }

  @Id
  @GeneratedValue (strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  private UserGroup userGroup;
  
  @ManyToOne
  private UserEntity user;
  
  @ManyToOne
  private UserGroupRoleEntity role;
}
