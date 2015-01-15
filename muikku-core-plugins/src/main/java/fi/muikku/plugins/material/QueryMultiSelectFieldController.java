package fi.muikku.plugins.material;

import java.io.IOException;
import java.util.List;

import javax.ejb.Stateless;
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Event;
import javax.inject.Inject;

import org.apache.commons.lang3.StringUtils;
import org.codehaus.jackson.map.ObjectMapper;

import fi.muikku.plugins.material.dao.QueryMultiSelectFieldDAO;
import fi.muikku.plugins.material.dao.QueryMultiSelectFieldOptionDAO;
import fi.muikku.plugins.material.events.QueryFieldUpdateEvent;
import fi.muikku.plugins.material.fieldmeta.MultiSelectFieldMeta;
import fi.muikku.plugins.material.fieldmeta.MultiSelectFieldOptionMeta;
import fi.muikku.plugins.material.model.Material;
import fi.muikku.plugins.material.model.QueryMultiSelectField;
import fi.muikku.plugins.material.model.QueryMultiSelectFieldOption;

@Stateless
@Dependent
public class QueryMultiSelectFieldController {

  @Inject
  private QueryMultiSelectFieldDAO queryMultiSelectFieldDAO;

  @Inject
  private QueryMultiSelectFieldOptionDAO queryMultiSelectFieldOptionDAO;

  @Inject
  private Event<QueryFieldUpdateEvent> queryFieldUpdateEvent;
  
  /* QueryMultiSelectField */

  public QueryMultiSelectField createQueryMultiSelectField(Material material, String name) {
    return queryMultiSelectFieldDAO.create(material, name);
  }

  public QueryMultiSelectField findQueryMultiSelectFieldbyId(Long id) {
    return queryMultiSelectFieldDAO.findById(id);
  }

  public QueryMultiSelectField findQueryMultiSelectFieldByMaterialAndName(Material material, String name) {
    return queryMultiSelectFieldDAO.findByMaterialAndName(material, name);
  }

  public QueryMultiSelectField updateQueryMultiSelectField(Material material, MaterialField field, boolean removeAnswers) throws MaterialFieldMetaParsingExeption {
    
    // Field JSON to metadata object
    
    ObjectMapper objectMapper = new ObjectMapper();
    MultiSelectFieldMeta multiSelectFieldMeta;
    try {
      multiSelectFieldMeta = objectMapper.readValue(field.getContent(), MultiSelectFieldMeta.class);
    } catch (IOException e) {
      throw new MaterialFieldMetaParsingExeption("Could not parse select field meta", e);
    }
    QueryMultiSelectField queryField = queryMultiSelectFieldDAO.findByMaterialAndName(material,  multiSelectFieldMeta.getName());
    
    // -> fi.muikku.plugins.workspace.QueryFieldChangeListener
    queryFieldUpdateEvent.fire(new QueryFieldUpdateEvent(queryField, field, removeAnswers));
    
    List<QueryMultiSelectFieldOption> oldOptions = queryMultiSelectFieldOptionDAO.listByField(queryField);
    List<MultiSelectFieldOptionMeta> newOptions = multiSelectFieldMeta.getOptions();
    for (MultiSelectFieldOptionMeta newOption : newOptions) {
      QueryMultiSelectFieldOption correspondingOption = findOptionByName(oldOptions, newOption.getName());
      if (correspondingOption == null) {
        // New options
        createQueryMultiSelectFieldOption(queryField, newOption.getName(), newOption.getText());
      }
      else {
        // Modified options
        if (!StringUtils.equals(correspondingOption.getText(), newOption.getText())) {
          updateQueryMultiSelectFieldOptionText(correspondingOption, newOption.getText());
        }
        oldOptions.remove(correspondingOption);
      }
    }
    // Removed options
    for (QueryMultiSelectFieldOption removedOption : oldOptions) {
      deleteQueryMultiSelectFieldOption(removedOption);
    }
    return queryField;
  }

  private QueryMultiSelectFieldOption findOptionByName(List<QueryMultiSelectFieldOption> options, String name) {
    for (QueryMultiSelectFieldOption option : options) {
      if (StringUtils.equals(option.getName(), name)) {
        return option;
      }
    }
    return null;
  }
  
  /* QueryMultiSelectFieldOption */
  
  public QueryMultiSelectFieldOption createQueryMultiSelectFieldOption(QueryMultiSelectField querySelectField, String name, String text) {
    return queryMultiSelectFieldOptionDAO.create(name, text, querySelectField);
  }

  public QueryMultiSelectFieldOption findQueryMultiSelectFieldOptionByFieldAndName(QueryMultiSelectField field, String name) {
    return queryMultiSelectFieldOptionDAO.findByFieldAndName(field, name);
  }

  public List<QueryMultiSelectFieldOption> listQueryMultiSelectFieldOptionsByField(QueryMultiSelectField field) {
    return queryMultiSelectFieldOptionDAO.listByField(field);
  }

  public QueryMultiSelectFieldOption updateQueryMultiSelectFieldOptionText(QueryMultiSelectFieldOption queryMultiSelectFieldOption, String text) {
    return queryMultiSelectFieldOptionDAO.updateText(queryMultiSelectFieldOption, text);
  }

  public void deleteQueryMultiSelectFieldOption(QueryMultiSelectFieldOption queryMultiSelectFieldOption) {
    queryMultiSelectFieldOptionDAO.delete(queryMultiSelectFieldOption);
  }

}
