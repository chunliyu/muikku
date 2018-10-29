(function() {
  'use strict';
  renderDustTemplate('workspace/workspace-chat-settings.dust', {}, $.proxy(function (text) {
    $('.workspace-chat-settings').html(text);
  }, this));
  
  $.widget("custom.workspaceFrontpageImage", {
    options: {
      workspaceEntityId: null
    },
    _create : function() {
      $('.workspace-frontpage-image-input').on('change', $.proxy(this._onFileInputChange, this));
    },
    _onFileInputChange : function (event) {
      var file = event.target.files[0];
      var formData = new FormData($('.workspace-frontpage-image-form')[0]);
      var workspaceId = this.options.workspaceEntityId;
      // Upload source image
      
      $.ajax({
        url: CONTEXTPATH + '/tempFileUploadServlet',
        type: 'POST',
        data: formData,
        success: $.proxy(function(xhr) {
          mApi().workspace.workspaces.workspacefile
            .create(workspaceId, {
              contentType: xhr.fileContentType,
              tempFileId: xhr.fileId,
              fileIdentifier: 'workspace-frontpage-image-original'
            })
            .callback($.proxy(function(err, result) {
            
              // Create cropping dialog
              
              renderDustTemplate('workspace/workspace-frontpage-image.dust', {}, $.proxy(function (text) {
                var dialog = $(text);
                
                // Show cropping dialog
                
                $(text).dialog({
                  modal: true, 
                  resizable: false,
                  width: 985,
                  height: 440,
                  dialogClass: "workspace-frontpage-image-dialog",
                  close: function() {
                    $(this).dialog().remove();
                    $('.workspace-frontpage-image-input').val('');
                  },
                  open: function() {
                    
                    // Initialize Croppie
                    
                    var rnd = Math.floor(Math.random() * 1000) + 1
                    $(this).find('.workspace-frontpage-image-container').croppie({
                      url: '/rest/workspace/workspaces/' + workspaceId + '/workspacefile/workspace-frontpage-image-original?h=' + rnd,
                      viewport: {
                        width: 950,
                        height: 240,
                        type: 'square'
                      },
                      boundary: {
                        width: 950,
                        height: 240
                      }
                    });
                  },
                  buttons: [{
                    'text': dialog.data('button-ok-text'),
                    'class': 'send-button',
                    'click': function(event) {
                      
                      // Create image
                      
                      $(this).find('.workspace-frontpage-image-container').croppie('result', {
                        type: 'base64',
                        size: {width: 950, height: 240},
                        format: 'jpeg',
                        quality: 0.8,
                        circle: false
                      }).then(function(data) {
                        mApi().workspace.workspaces.workspacefile
                          .create(workspaceId, {
                            fileIdentifier: 'workspace-frontpage-image-cropped',
                            contentType: 'image/jpeg',
                            base64Data: data
                          })
                          .callback(function () {
                            $(this).dialog('close');
                            window.location.reload(true);
                          });
                      });
                    }
                  }, {
                    'text': dialog.data('button-cancel-text'),
                    'class': 'cancel-button',
                    'click': function(event) {
                      $(this).dialog('close');
                    }
                  }]
                });
              }, this));
              
            }, this));
        }, this),
        cache: false,
        contentType: false,
        processData: false
      })
    }
  });
  
  
  $.widget("custom.workspaceChatSettings", {
    options: {
      workspaceEntityId: null,
    },
    _create: function() {
      var workspaceEntityId = this.options.workspaceEntityId;
     mApi().chat.workspaceChatSettings.read(workspaceEntityId).callback($.proxy(function (err, workspaceChatSettings) {
        if (err) { 
          $('.notification-queue').notificationQueue('notification', 'error', err);
          return;
        }
        var data = {};
        
        if (workspaceChatSettings && workspaceChatSettings.chatStatus === "ENABLED") {
          data.enabled_selected = "selected";
        } else {
          data.disabled_selected = "selected";
        }
        
        renderDustTemplate('workspace/workspace-chat-settings.dust', data, $.proxy(function (text) {
          this.element.html(text);
        }, this));
      }, this));
    },
  });
  
  $.widget("custom.workspaceManagement", {
    options: {
      workspaceEntityId: null,
      ckeditor: {
        height : '200px',
        entities: false,
        entities_latin: false,
        entities_greek: false,
        toolbar: [
          { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'RemoveFormat' ] },
          { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'Undo', 'Redo' ] },
          { name: 'links', items: [ 'Link' ] },
          { name: 'insert', items: [ 'Image', 'Table', 'Smiley', 'SpecialChar' ] },
          { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
          { name: 'styles', items: [ 'Format' ] },
          { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', 'Outdent', 'Indent', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight'] },
          { name: 'tools', items: [ 'Maximize' ] }
        ]
      }
    },
    
    _create: function () {

      this.element.on("click", ".copy-workspace-link", $.proxy(this._onCopyCourseClick, this));
      
      this.element.on("click", ".workspace-management-image-delete", $.proxy(this._onWorkspaceFrontPageImageDeleteClick, this));
      
      var loader = $('<div>')
        .addClass('loading')
        .appendTo(this.element);
      
      async.parallel([this._createWorkspaceTypesLoad(), this._createWorkspaceLoad(), this._createWorkspaceDetailsLoad(), this._createWorkspaceMaterialProducersLoad()], $.proxy(function (err, results) {
        loader.remove();
        if (err) {
          $('.notification-queue').notificationQueue('notification', 'error', err);
        } else {
          var workspaceTypes = results[0];
          var workspace = results[1];
          var details = results[2];
          var producers = results[3];
          
          $.each(producers, $.proxy(function (index, producer) {
            this._addMaterialProducerElement(producer.id, 'EXISTING', producer.name);
          }, this));
          
          this.element.find('*[name="workspaceName"]').val(workspace.name);
          this.element.find('.external-view-url').attr('href', details.externalViewUrl);
          this.element.find('*[name="published"][value="' + (workspace.published ? 'true' : 'false') + '"]').prop('checked', 'checked');
          this.element.find('*[name="access"][value="' + workspace.access + '"]').prop('checked', 'checked');
          this.element.find('*[name="workspaceNameExtension"]').val(workspace.nameExtension);
          this.element.find('.workspace-description').val(workspace.description);
          this.element.find('.default-material-license').val(workspace.materialDefaultLicense);
          
          $.each(workspaceTypes, $.proxy(function (index, workspaceType) {
            var option = $('<option>')
              .attr('value', workspaceType.identifier)
              .text(workspaceType.name)
              .appendTo(this.element.find('.workspace-type'));
            
            if (workspaceType.identifier == details.typeId) {
              option.prop('selected', 'selected');
            }
          }, this));
          
          var dateField = this.element.find('*[name="beginDate"]'); 
          dateField.datepicker({
            "dateFormat": getLocaleText('datePattern')
          });
          if (details.beginDate) {
            dateField.datepicker('setDate', moment(details.beginDate).toDate());
          }
          
          dateField = this.element.find('*[name="endDate"]'); 
          dateField.datepicker({
            "dateFormat": getLocaleText('datePattern')
          });
          if (details.endDate) {
            dateField.datepicker('setDate', moment(details.endDate).toDate()); 
          }
          
          this.element.on('keydown', '.workspace-material-producer-add', $.proxy(this._onMaterialProducerKeyDown, this));
          this.element.on('click', '.workspace-material-producer-remove', $.proxy(this._onMaterialProducerRemoveClick, this));
                    
          this.element.find('.ckeditor-field').each($.proxy(function (index, ckField) {
            CKEDITOR.replace(ckField, this.options.ckeditor);
          }, this));
          
          this.element.find('.default-material-license').licenseSelector({
            locale: getLocale() == 'fi' ? 'fi' : 'en',
            types: {
              'ogl': false
            }
          });
          
          this.element.on('submit', 'form', $.proxy(this._onFormSubmit, this));
          this.element.on('click', '.save', $.proxy(this._onSaveClick, this));
        }
      }, this));
    },
    
    _onCopyCourseClick: function (event) {
      $('<div>')
        .appendTo(document.body)
        .workspaceCopyWizard({
          workspaceEntityId: this.options.workspaceEntityId
        });
    },
    
    _addMaterialProducerElement: function (id, status, name) {
      $('<span>')
        .attr({
          'data-id': id,
          'data-status': status,
          'data-name': name
        })
        .addClass('workspace-material-producer')
        .text(name)
        .appendTo(this.element.find('.workspace-material-producers'))
        .append($('<a>')
            .addClass('workspace-material-producer-remove')
            .attr('href', 'javascript:void(null)'));
    },
    
    _createWorkspaceTypesLoad: function () {
      return $.proxy(function (callback) {
        mApi().workspace.workspaceTypes
          .read()
          .callback(function (err, workspaceTypes) {
            callback(err, workspaceTypes);
          })
      }, this); 
    },
    
    _createWorkspaceLoad: function () {
      return $.proxy(function (callback) {
        mApi().workspace.workspaces
          .read(this.options.workspaceEntityId)
          .callback(function (err, workspace) {
            callback(err, workspace);
          })
      }, this); 
    },
    
    _createWorkspaceDetailsLoad: function () {
      return $.proxy(function (callback) {
        mApi().workspace.workspaces.details
          .read(this.options.workspaceEntityId)
          .callback(function (err, details) {
            callback(err, details);
          })
      }, this); 
    },
    
    _createWorkspaceMaterialProducersLoad: function () {
      return $.proxy(function (callback) {
        mApi().workspace.workspaces.materialProducers
          .read(this.options.workspaceEntityId)
          .callback(function (err, materialProducers) {
            callback(err, materialProducers);
          })
      }, this); 
    },
    
    _createWorkspaceUpdate: function () {
      return $.proxy(function (callback) {
        mApi().workspace.workspaces
          .read(this.options.workspaceEntityId)
          .callback($.proxy(function (getErr, workspace) {
            if (getErr) {
              callback(getErr);
            } else {
              var name = this.element.find('*[name="workspaceName"]').val();
              var nameExtension = this.element.find('*[name="workspaceNameExtension"]').val();
              var description = CKEDITOR.instances['workspace-description'].getData();
              var published = this.element.find('*[name="published"]:checked').val() == 'true';
              var access = this.element.find('*[name="access"]:checked').val();
              var materialDefaultLicense = this.element.find('.default-material-license').val();
              
              mApi().workspace.workspaces
                .update(this.options.workspaceEntityId, $.extend(workspace, {
                  name: name,
                  nameExtension: nameExtension,
                  description: description,
                  published: published,
                  access: access,
                  materialDefaultLicense: materialDefaultLicense
                }))
                .callback(function (err, updatedWorkspace) {
                  callback(err, updatedWorkspace);
                })
            }
          }, this))
      }, this); 
    },
    
    _createWorkspaceDetailsUpdate: function () {
      return $.proxy(function (callback) {
        mApi().workspace.workspaces.details
          .read(this.options.workspaceEntityId)
          .callback($.proxy(function (getErr, details) {
            if (getErr) {
              callback(getErr);
            } else {
              var beginDate = this.element.find('*[name="beginDate"]').datepicker('getDate');
              var endDate = this.element.find('*[name="endDate"]').datepicker('getDate');
              var typeId = this.element.find('.workspace-type').val();
              mApi().workspace.workspaces.details
                .update(this.options.workspaceEntityId, $.extend(details, {
                  beginDate: beginDate != null ? beginDate.toISOString() : null,
                  endDate: endDate != null ? endDate.toISOString() : null,
                  typeId: typeId != null ? typeId : null
                }))
                .callback(function (err, updatedDetails) {
                  callback(err, updatedDetails);
                })
            }
          }, this))
      }, this); 
    },
    
    _createCreateWorkspaceMaterialProducer: function (name) {
      return $.proxy(function (callback) {
        mApi().workspace.workspaces.materialProducers
          .create(this.options.workspaceEntityId, {
            name: name
          })
          .callback(function (err, materialProducer) {
            callback(err, materialProducer);
          })
      }, this); 
    },
    
    _saveWorkspaceChatStatus: function (workspaceEntityId, chatStatus) {

      return $.proxy(function (callback) {
        mApi().chat.workspaceChatSettings.update(workspaceEntityId, {chatStatus: chatStatus, workspaceEntityId: workspaceEntityId})
        .callback($.proxy(function (err) {
          callback(err);
        }), this);
      }, this); 
    },
    
    _createDeleteWorkspaceMaterialProducer: function (id) {
      return $.proxy(function (callback) {
        mApi().workspace.workspaces.materialProducers
          .del(this.options.workspaceEntityId, id)
          .callback(function (err) {
            callback(err);
          })
      }, this); 
    },
    
    _onMaterialProducerKeyDown: function (event) {
      if (((event.keyCode ? event.keyCode : event.which) == 13)) {
        event.preventDefault();
        var input = this.element.find('.workspace-material-producer-add');
        this._addMaterialProducerElement('', 'NEW', input.val());
        input.val('');
      }
    },
    
    _onMaterialProducerRemoveClick: function (event) {
      var producer = $(event.target)
        .closest('.workspace-material-producer');
      
      if (producer.attr('data-status') == 'NEW') {
        producer.remove();
      } else {
        producer
          .attr('data-status', 'REMOVED')
          .hide();
      }
    },
    
    _onFormSubmit: function (event) {
      event.preventDefault();
    },
    
    _onWorkspaceFrontPageImageDeleteClick: function (event) {
      var workspaceEntityId = this.options.workspaceEntityId;
      renderDustTemplate('workspace/workspace-frontpage-image-delete-confirm.dust', { }, $.proxy(function (text) {
        var dialog = $(text);
        $(text).dialog({
          modal: true, 
          resizable: false,
          width: 500,
          dialogClass: "workspace-frontpage-image-delete-confirm-dialog",
          buttons: [{
            'text': dialog.data('button-delete-text'),
            'class': 'delete-button',
            'click': function(event) {
              $(this).dialog().remove();
              var removeCroppedCall = $.proxy(function (callback) {
                mApi().workspace.workspaces.workspacefile
                  .del(workspaceEntityId, 'workspace-frontpage-image-cropped')
                  .callback($.proxy(function(err, result) {
                    if (err)
                      callback(err);
                    else
                      callback(undefined);
                  })
                );
              });
              
              var removeOriginalCall = $.proxy(function (callback) {
                mApi().workspace.workspaces.workspacefile
                  .del(workspaceEntityId, 'workspace-frontpage-image-original')
                  .callback($.proxy(function(err, result) {
                    if (err)
                      callback(err);
                    else
                      callback(undefined);
                  })
                );
              });
              
              var removeCalls = [removeCroppedCall, removeOriginalCall];
              async.parallel(removeCalls, function(err) {
                if (err) {
                  $('.notification-queue').notificationQueue('notification', 'error', err);
                } else
                  window.location.reload(true);
              });
            }
          }, {
            'text': dialog.data('button-cancel-text'),
            'class': 'cancel-button',
            'click': function(event) {
              $(this).dialog().remove();
            }
          }]
        });
      }, this));
    },
    
    _onSaveClick: function (event) {      
      event.preventDefault();
      
      var form = $("#workspaceManagementForm");
      
      if (form) {
        $(form).find('.validate-form-button')[0].click();
        try {
          if (!form.checkValidity()) {
            return;
          }
        } catch (e) {
        }
      }
      
      var loader = $('<div>')
        .addClass('loading')
        .appendTo(this.element);
      
      var operations = [this._createWorkspaceUpdate(), this._createWorkspaceDetailsUpdate()];
      
      this.element.find('.workspace-material-producer').each($.proxy(function (index, producer) {
        var id = $(producer).attr('data-id');
        var status = $(producer).attr('data-status');
        var name = $(producer).attr('data-name');
        
        switch (status) {
          case 'NEW':
            operations.push(this._createCreateWorkspaceMaterialProducer(name));
          break;
          case 'REMOVED':
            operations.push(this._createDeleteWorkspaceMaterialProducer(id));
          break;
        }        
      }, this));
      
      var chatStatus = this.element.find(".workspace-chat").val();
      var workspaceEntityId = this.options.workspaceEntityId;
      operations.push(this._saveWorkspaceChatStatus(workspaceEntityId, chatStatus));
      
      async.series(operations, function (err, results) {
        loader.remove();
        if (err) {
          $('.notification-queue').notificationQueue('notification', 'error', err);
        } else {
          window.location.reload(true);
        }
      });
    }
  });
  
  $(document).ready(function () {
    webshim.polyfill('forms');
    var workspaceEntityId = $('.workspaceEntityId').val();
    $(document.body).workspaceManagement({
      workspaceEntityId: workspaceEntityId
    });
    var evaluationLink = $('.dock-static-navi-button-evaluation > a.icon-evaluate');
    if (evaluationLink) {
      var href = $(evaluationLink).attr('href');
      $(evaluationLink).attr('href', href + '?workspaceEntityId=' + workspaceEntityId);
      $(evaluationLink).attr('target', '_blank');
    }
    
    $('.workspace-chat-settings').workspaceChatSettings({
      workspaceEntityId: workspaceEntityId
    });
    
    $('.workspace-frontpage-image-uploader').workspaceFrontpageImage({
      workspaceEntityId: workspaceEntityId
    });
    $('.workspace-management-image-edit').on('click', $.proxy(function() {
      $('.workspace-frontpage-image-input').click();
    }, this));
    
    
  });
  
}).call(this);
