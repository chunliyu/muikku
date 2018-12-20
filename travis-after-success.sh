#!/bin/bash
if [[ $release = "true" || $deploy_snapshot == "true" || $deploy_release == "true" ]]; then
  python travis-prepare-maven.py
fi;

if [[ $release = "true" ]]; then
  eval `ssh-agent -s`
  ssh-add .travisdeploykey
  rm -f .travisdeploykey
  git remote set-url origin git@github.com:otavanopisto/muikku.git
  git config user.name "Travis CI"
  git config user.email "travis@travis-ci.org"
  git config --global push.default simple
  git checkout master
  git reset --hard
  git pull
  pushd .
  echo Checking latest Pyramus SNAPSHOTS
  mvn versions:use-latest-snapshots -Dincludes=fi.otavanopisto.pyramus:* --settings ~/.m2/mySettings.xml
  echo Replacing SNAPSHOT versions to releases
  mvn versions:force-releases -Dincludes=fi.otavanopisto.pyramus:* --settings ~/.m2/mySettings.xml
  git add .
  git commit -m "Updated dependency versions"
  echo Releasing
  mvn -B release:prepare release:perform --settings ~/.m2/mySettings.xml
  popd
  echo Merging changes back to devel and replacing releases to SNAPSHOTS
  git checkout -B devel
  git pull
  git merge master
  mvn versions:use-latest-snapshots -Dincludes=fi.otavanopisto.pyramus:* --settings ~/.m2/mySettings.xml
  git add .
  git commit -m "Updated latest snapshot releases"
  git pull
  git push --set-upstream origin devel
fi;

if [[ $deploy_snapshot == "true" ]]; then
  echo Deploying snapshot
  pushd .
  cd muikku
  mvn clean deploy --settings ~/.m2/mySettings.xml -Pmongo-log-plugin,jndi-mail-plugin,elastic-search-plugin,evaluation-plugin,timed-notifications-plugin,pyramus-plugins
  popd
fi;

if [[ $deploy_release == "true" ]]; then
  echo Deploying
  pushd .
  cd muikku
  mvn clean deploy --settings ~/.m2/mySettings.xml -Pmongo-log-plugin,jndi-mail-plugin,elastic-search-plugin,evaluation-plugin,timed-notifications-plugin,pyramus-plugins -Dclassifier=otavanopisto
  popd
fi;




