package fi.muikku.plugins.materialfields;

import javax.ejb.Stateless;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;

import fi.muikku.plugins.materialfields.dao.QuerySelectFieldDAO;
import fi.muikku.plugins.materialfields.model.QuerySelectField;

@Stateless
@Dependent
public class QuerySelectFieldController {

  @Inject
  QuerySelectFieldDAO querySelectFieldDAO;

  public QuerySelectField createQuerySelectField(String name, String help, String hint, boolean mandatory, String text) {
    return querySelectFieldDAO.create(name, help, hint, mandatory, text);
  }

  public QuerySelectField findQuerySelectFieldbyId(Long id) {
    return querySelectFieldDAO.findById(id);
  }

}
