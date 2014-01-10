package fi.muikku.plugins.materialfields.dao;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import fi.muikku.dao.DAO;
import fi.muikku.plugin.PluginDAO;
import fi.muikku.plugins.material.model.Material;
import fi.muikku.plugins.materialfields.model.QueryTextField;
import fi.muikku.plugins.materialfields.model.QueryTextField_;

@DAO
public class QueryTextFieldDAO extends PluginDAO<QueryTextField> {

  private static final long serialVersionUID = -5327160259588566934L;

  public QueryTextField create(Material material, String name, Boolean mandatory) {

    QueryTextField queryTextField = new QueryTextField();

    queryTextField.setMaterial(material);
    queryTextField.setName(name);
    queryTextField.setMandatory(mandatory);

    return persist(queryTextField);
  }

  public QueryTextField findByMaterialAndName(Material material, String name) {
    EntityManager entityManager = getEntityManager();

    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<QueryTextField> criteria = criteriaBuilder.createQuery(QueryTextField.class);
    Root<QueryTextField> root = criteria.from(QueryTextField.class);
    criteria.select(root);
    criteria.where(
      criteriaBuilder.and(
        criteriaBuilder.equal(root.get(QueryTextField_.material), material),
        criteriaBuilder.equal(root.get(QueryTextField_.name), name)
      )
    );

    return getSingleResult(entityManager.createQuery(criteria));
  }

}
