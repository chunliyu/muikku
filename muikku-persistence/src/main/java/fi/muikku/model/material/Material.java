package fi.muikku.model.material;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;

import fi.muikku.model.users.UserEntity;

@Entity
public class Material {

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getCharacterData() {
    return characterData;
  }

  public void setCharacterData(String characterData) {
    this.characterData = characterData;
  }

  public byte[] getBinaryData() {
    return binaryData;
  }

  public void setBinaryData(byte[] binaryData) {
    this.binaryData = binaryData;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public Date getCreated() {
    return created;
  }

  public void setCreated(Date created) {
    this.created = created;
  }

  public Date getEdited() {
    return edited;
  }

  public void setEdited(Date edited) {
    this.edited = edited;
  }

  public UserEntity getCreator() {
    return creator;
  }

  public void setCreator(UserEntity creator) {
    this.creator = creator;
  }

  public String getUrlName() {
    return urlName;
  }

  public void setUrlName(String urlName) {
    this.urlName = urlName;
  }

  @Id
  @GeneratedValue (strategy = GenerationType.IDENTITY)
  private Long id;
  
  @NotEmpty
  @NotNull
  @Column
  private String type;
  
  @Lob
  @Column
  private String characterData;
  
  @Lob
  @Column
  private byte[] binaryData;
  
  @NotNull
  @Column
  private String title;
  
  @NotNull
  @Column(unique=true)
  private String urlName;
  
  @NotNull
  @Column
  @Temporal(value=TemporalType.TIMESTAMP)
  private Date created;
  
  @NotNull
  @Column
  @Temporal(value=TemporalType.TIMESTAMP)
  private Date edited;
  
  @ManyToOne
  private UserEntity creator;
}
