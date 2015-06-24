package fi.muikku.dao.users;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import fi.muikku.dao.CoreDAO;
import fi.muikku.model.base.SchoolDataSource;
import fi.muikku.model.users.UserGroupEntity;
import fi.muikku.model.users.UserGroupUserEntity;
import fi.muikku.model.users.UserGroupUserEntity_;
import fi.muikku.model.users.UserSchoolDataIdentifier;

public class UserGroupUserEntityDAO extends CoreDAO<UserGroupUserEntity> {

  private static final long serialVersionUID = -2602347893195385174L;

  public UserGroupUserEntity create(UserGroupEntity userGroupEntity,
                                SchoolDataSource schoolDataSource,
                                String identifier,
                                UserSchoolDataIdentifier userSchoolDataIdentifier,
                                boolean archived
  ) {
    UserGroupUserEntity userGroupUser = new UserGroupUserEntity();

    userGroupUser.setArchived(archived);
    userGroupUser.setSchoolDataSource(schoolDataSource);
    userGroupUser.setIdentifier(identifier);
    userGroupUser.setUserGroupEntity(userGroupEntity);
    userGroupUser.setUserSchoolDataIdentifier(userSchoolDataIdentifier);

    getEntityManager().persist(userGroupUser);

    return userGroupUser;
  }
  
  public UserGroupUserEntity findByDataSourceAndIdentifier(SchoolDataSource schoolDataSource, String identifier) {
    EntityManager entityManager = getEntityManager();
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<UserGroupUserEntity> criteria = criteriaBuilder.createQuery(UserGroupUserEntity.class);
    Root<UserGroupUserEntity> root = criteria.from(UserGroupUserEntity.class);
    criteria.select(root);
    criteria.where(
      criteriaBuilder.and(          
        criteriaBuilder.equal(root.get(UserGroupUserEntity_.schoolDataSource), schoolDataSource),
        criteriaBuilder.equal(root.get(UserGroupUserEntity_.identifier), identifier)
      )
    );
   
    return getSingleResult(entityManager.createQuery(criteria));
  }

  public List<UserGroupUserEntity> listByUserGroupEntity(UserGroupEntity userGroupEntity) {
    EntityManager entityManager = getEntityManager();
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<UserGroupUserEntity> criteria = criteriaBuilder.createQuery(UserGroupUserEntity.class);
    Root<UserGroupUserEntity> root = criteria.from(UserGroupUserEntity.class);
    criteria.select(root);
    criteria.where(
      criteriaBuilder.equal(root.get(UserGroupUserEntity_.userGroupEntity), userGroupEntity)
    );
   
    return entityManager.createQuery(criteria).getResultList();
  }

  public UserGroupUserEntity archive(UserGroupUserEntity userGroupUserEntity) {
    userGroupUserEntity.setArchived(true);
    
    getEntityManager().persist(userGroupUserEntity);
    
    return userGroupUserEntity;
  }

  
}