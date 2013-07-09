package fi.muikku.schooldata.entity;

import fi.tranquil.TranquilEntity;

@TranquilEntity
public interface WorkspaceType extends SchoolDataEntity {
	
	public String getIdentifier();
	
	public String getName();

}