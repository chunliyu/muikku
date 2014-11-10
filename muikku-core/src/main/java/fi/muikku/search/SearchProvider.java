package fi.muikku.search;

import java.util.Map;

public interface SearchProvider {
  public String getName();
  public SearchResult search(String query, String[] fields, int start, int maxResults, Class<?>... types);
  public SearchResult freeTextSearch(String text, int start, int maxResults);
  public SearchResult matchAllSearch(int start, int maxResults);
  public SearchResult matchAllSearch(int start, int maxResults, Class<?>... types);
  public void addOrUpdateIndex(String typeName, Map<String, Object> entity);
  public void deleteFromIndex(String typeName, String id);
  public void init();
}
