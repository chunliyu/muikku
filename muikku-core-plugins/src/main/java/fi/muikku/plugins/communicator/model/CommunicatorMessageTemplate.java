package fi.muikku.plugins.communicator.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Lob;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;

import fi.muikku.security.ContextReference;
import fi.muikku.tranquil.UserEntityResolver;
import fi.tranquil.TranquilityEntityField;

@Entity
@Inheritance(strategy=InheritanceType.JOINED)
public class CommunicatorMessageTemplate implements ContextReference {

  public Long getId() {
    return id;
  }
  
  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public Long getUser() {
    return user;
  }

  public void setUser(Long user) {
    this.user = user;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  @Id
  @GeneratedValue (strategy = GenerationType.IDENTITY)
  private Long id;

  @Column (name = "user_id")
  @TranquilityEntityField(UserEntityResolver.class)
  private Long user;
  
  @NotNull
  @NotEmpty
  @Column (nullable = false)
  private String name;
  
  @NotNull
  @NotEmpty
  @Column (nullable = false)
  @Lob
  private String content;
}
