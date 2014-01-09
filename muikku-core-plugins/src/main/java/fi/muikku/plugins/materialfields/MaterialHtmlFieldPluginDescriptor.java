package fi.muikku.plugins.materialfields;

import java.util.Arrays;
import java.util.List;

import fi.muikku.plugin.PluginDescriptor;
import fi.muikku.plugins.materialfields.dao.QueryDrawFieldDAO;
import fi.muikku.plugins.materialfields.dao.QueryFieldDAO;
import fi.muikku.plugins.materialfields.dao.QuerySelectFieldDAO;
import fi.muikku.plugins.materialfields.dao.QueryTextFieldDAO;
import fi.muikku.plugins.materialfields.dao.RightAnswerDAO;
import fi.muikku.plugins.materialfields.dao.SelectFieldOptionDAO;

public class MaterialHtmlFieldPluginDescriptor implements PluginDescriptor {

  @Override
  public String getName() {
    return "materialhtmlfield";
  }

  @Override
  public void init() {
    
  }

  @Override
  public List<Class<?>> getBeans() {
    return Arrays.asList(new Class<?>[] {
        
      HtmlMaterialFieldListeners.class,
      
      /** DAOs **/
      
      QueryFieldDAO.class,
      QueryDrawFieldDAO.class,
      QuerySelectFieldDAO.class,
      QueryTextFieldDAO.class,
      RightAnswerDAO.class,
      SelectFieldOptionDAO.class,
      
      /** Controllers **/
      
      QueryTextFieldController.class
      
    });
  }

}
