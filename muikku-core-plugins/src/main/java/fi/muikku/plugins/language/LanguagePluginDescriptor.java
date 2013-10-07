package fi.muikku.plugins.language;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.ResourceBundle;

import javax.ejb.Stateful;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import org.apache.commons.lang3.LocaleUtils;

import fi.muikku.controller.WidgetController;
import fi.muikku.i18n.LocaleBundle;
import fi.muikku.i18n.LocaleLocation;
import fi.muikku.plugin.LocalizedPluginDescriptor;
import fi.muikku.plugin.PluginDescriptor;

@ApplicationScoped
@Stateful
public class LanguagePluginDescriptor implements PluginDescriptor, LocalizedPluginDescriptor {

  @Inject
  private WidgetController widgetController;

  @Override
  public String getName() {
    return "language";
  }
  
  @Override
  public void init() {
    
  }

  @Override
  public List<Class<?>> getBeans() {
    return new ArrayList<Class<?>>(Arrays.asList(
        LanguageWidgetBackingBean.class
      ));
  }

  @Override
  public List<LocaleBundle> getLocaleBundles() {
    List<LocaleBundle> bundles = new ArrayList<LocaleBundle>();
    bundles.add(new LocaleBundle(LocaleLocation.APPLICATION, ResourceBundle.getBundle("fi.muikku.plugins.language.LanguagePluginMessages", LocaleUtils.toLocale("fi"))));
    bundles.add(new LocaleBundle(LocaleLocation.APPLICATION, ResourceBundle.getBundle("fi.muikku.plugins.language.LanguagePluginMessages", LocaleUtils.toLocale("en"))));
    return bundles;
  }

}
