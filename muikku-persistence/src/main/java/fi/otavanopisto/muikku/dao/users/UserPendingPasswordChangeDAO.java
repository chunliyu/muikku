package fi.otavanopisto.muikku.dao.users;

import java.util.Date;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaDelete;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import fi.otavanopisto.muikku.dao.CoreDAO;
import fi.otavanopisto.muikku.model.users.UserEntity;
import fi.otavanopisto.muikku.model.users.UserPendingPasswordChange;
import fi.otavanopisto.muikku.model.users.UserPendingPasswordChange_;

public class UserPendingPasswordChangeDAO extends CoreDAO<UserPendingPasswordChange> {

  private static final long serialVersionUID = 5503016597955204959L;

  public UserPendingPasswordChange create(UserEntity userEntity, String confirmationHash, Date expires) {
    UserPendingPasswordChange userPendingPasswordChange = new UserPendingPasswordChange();
    
    userPendingPasswordChange.setConfirmationHash(confirmationHash);
    userPendingPasswordChange.setUserEntity(userEntity.getId());
    userPendingPasswordChange.setExpires(expires);
    
    getEntityManager().persist(userPendingPasswordChange);
    
    return userPendingPasswordChange;
  }
  
  public void delete(UserPendingPasswordChange userPendingPasswordChange) {
    super.delete(userPendingPasswordChange);
  }

  public UserPendingPasswordChange findByConfirmationHash(String confirmationHash) {
    EntityManager entityManager = getEntityManager(); 
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<UserPendingPasswordChange> criteria = criteriaBuilder.createQuery(UserPendingPasswordChange.class);
    Root<UserPendingPasswordChange> root = criteria.from(UserPendingPasswordChange.class);
    criteria.select(root);
    criteria.where(criteriaBuilder.equal(root.get(UserPendingPasswordChange_.confirmationHash), confirmationHash));
    
    return getSingleResult(entityManager.createQuery(criteria));
  }

  public UserPendingPasswordChange findByUserEntity(UserEntity userEntity) {
    EntityManager entityManager = getEntityManager(); 
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<UserPendingPasswordChange> criteria = criteriaBuilder.createQuery(UserPendingPasswordChange.class);
    Root<UserPendingPasswordChange> root = criteria.from(UserPendingPasswordChange.class);
    criteria.select(root);
    criteria.where(criteriaBuilder.equal(root.get(UserPendingPasswordChange_.userEntity), userEntity.getId()));
    
    return getSingleResult(entityManager.createQuery(criteria));
  }

  public UserPendingPasswordChange updateHash(UserPendingPasswordChange passwordChange, String confirmationHash) {
    passwordChange.setConfirmationHash(confirmationHash);
    return persist(passwordChange);
  }

  public UserPendingPasswordChange updateExpires(UserPendingPasswordChange passwordChange, Date expires) {
    passwordChange.setExpires(expires);
    return persist(passwordChange);
  }

  public int deleteExpired() {
    Date expiryDate = new Date();
    EntityManager entityManager = getEntityManager(); 
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaDelete<UserPendingPasswordChange> criteria = criteriaBuilder.createCriteriaDelete(UserPendingPasswordChange.class);
    Root<UserPendingPasswordChange> root = criteria.from(UserPendingPasswordChange.class);

    criteria.where(
        criteriaBuilder.lessThan(root.get(UserPendingPasswordChange_.expires), expiryDate)
    );
    
    return entityManager.createQuery(criteria).executeUpdate();
  }

}
