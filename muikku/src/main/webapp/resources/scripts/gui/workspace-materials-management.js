(function() {

  function createAddPageLink() {
    return $('<div>')
      .addClass('workspace-materials-management-addpage')
      .append($('<span>').addClass('workspace-materials-management-line-separator'))
      .append($('<a>').addClass('workspaces-materials-management-add-page icon-add').attr('href', 'javascript:void(null)').append($('<span>').html('Add new page')));
  }
  
  function createFileUploader() {
    return $('<div>')
      .addClass('workspaces-materials-management-insert-file')
      .append($('<input>').attr('type', 'file'));
  }
  
  function enableFileUploader(element, parentId, nextSiblingId) {
    $(element)
      .workspaceMaterialUpload({
        workspaceEntityId: $('.workspaceEntityId').val(),
        parentId: parentId,
        nextSiblingId: nextSiblingId
      })
      .on('fileUploaded', function (event, data) {
        var newPage = $('<section>')
          .addClass('workspace-materials-management-view-page')
          .attr({
            'id': 'page-' + data.workspaceMaterialId,
            'data-material-title': data.title,
            'data-parent-id': data.parentId,
            'data-material-id': data.materialId,
            'data-material-type': 'binary',
            'data-workspace-material-id': data.workspaceMaterialId
          });
        $(element).after(newPage);
        $(element).workspaceMaterialUpload('reset');
        
        loadPageNode(newPage);
        
        var nextPage = $(newPage).next('.workspace-materials-management-view-page');
        
        var uploader = createFileUploader();
        nextPage.before(createAddPageLink());
        nextPage.before(uploader);
        enableFileUploader(uploader, nextPage.data('parent-id'), nextPage.data('workspace-material-id'));
      });
  }
  
  function fixTables(node) {
    var $tables = node.find("table");
    
    $tables.each(function() {
      var $table = $(this);
      
      var padding = ($table.attr("cellpadding") !== undefined ? $table.attr("cellpadding") : 0);
      var margin = ($table.attr("cellspacing") !== undefined ? $table.attr("cellspacing") : 0);
      var border = ($table.attr("border") !== undefined ? $table.attr("border") : 0);
      var width = $table.attr("width") !== undefined ? $table.attr("width") + "px;" : "auto;";
      var bgcolor = $table.attr("bgcolor") !== undefined ? $table.attr("bgcolor") : "transparent;";
      
      if ($table.attr("style") !== undefined) {
        var origStyle = $table.attr("style");
        $table.attr("style", "width:" + width + "border:" + border + "px solid #000;" + "border-spacing:" + margin + "px; " + origStyle + "background-color:" + bgcolor);  
      } else {
        $table.attr("style", "width:" + width + "border:" + border + "px solid #000;" + "border-spacing:" + margin + "px; " + "background-color:" + bgcolor);  
      }
      
      $table.removeAttr("border width cellpadding cellspacing bgcolor");
       
      var $tds = $table.find("td");
      $tds.each(function(){
        var $td = $(this);
        var bgcolor = $td.attr("bgcolor") !== undefined ? $td.attr("bgcolor") : "transparent;";
        var width = $td.attr("width") !== undefined ? $td.attr("width") + "px; " : "auto;";
        var valign = $td.attr("valign") !== undefined ? $td.attr("valign") : "middle;";
        $td.attr("style", "vertical-align:" + valign + "width:" + width + "padding:" + padding + "px;" + "border:" + border + "px solid #000;" + "background-color:" + bgcolor);
        
        $td.removeAttr("border width bgcolor valign");

      });
      
    });
    
  }
  
  function loadPageNode(node, callback) {
    if (typeof callback === 'undefined' || callback === null) {
      callback = function() {};
    }
    
    var workspaceMaterialId = $(node).data('workspace-material-id');
    var materialId = $(node).data('material-id');
    var materialType = $(node).data('material-type');
    
    if (materialType !== 'folder') {
      var typeEndpoint = mApi().materials[materialType];
      if (typeEndpoint != null) {
        typeEndpoint.read(materialId).callback($.proxy(function (err, result) {
          renderDustTemplate('workspace/materials-management-page.dust',
              { workspaceMaterialId: workspaceMaterialId,
                materialId: materialId,
                id: materialId,
                type: materialType,
                data: result 
              },
                $.proxy(function (text) {
            $(this).html(text);
            fixTables($(this));
            callback();
          }, node));
        }, node));
      } else {
        $('.notification-queue').notificationQueue('notification', 'error', "Could not find rest service for " + materialType);
        
        callback();
      }
    } else {
      renderDustTemplate('workspace/materials-management-page.dust', { id: materialId, type: materialType }, $.proxy(function (text) {
        $(this).html(text);
        
        callback();
      }, node));
    }
  }
  
  function editPage(node) {
    var materialType = node.data('material-type');
    var materialId = node.data('material-id');
    var materialTitle = node.data('material-title');
    var workspaceMaterialId = node.data('workspace-material-id');
    var editorName = 'workspaceMaterialEditor' + (materialType.substring(0, 1).toUpperCase() + materialType.substring(1));
    var pageElement = $('#page-' + workspaceMaterialId);
    var pageSection = $(pageElement).closest(".workspace-materials-management-view-page");
    
    pageSection.addClass("page-edit-mode");
    
    var editor = pageElement[editorName];
    if (editor) {
      $(pageElement).find('.page-content').hide();
      
      editor.call(pageElement, {
        materialId: materialId,
        materialTitle: materialTitle
      });
      
//      $(document).on("click",$.proxy(function (event) {
//        var target = $(event.target);
//        if (target.closest('.workspace-materials-management-view-page').length == 0) {
//          $(this).data('material-title', editor.call(pageElement, 'title'));
//          editor.call(pageElement, 'destroy');
//          loadPageNode(node);
//          pageSection.removeClass("page-edit-mode");
//        }
//      }, node));
    } else {
      $('.notification-queue').notificationQueue('notification', 'error', "Could not find editor for " + materialType);
    }
  }
  
  function deletePage(workspaceMaterialId) {
    renderDustTemplate('workspace/materials-management-page-delete-corfirm.dust', { }, $.proxy(function (text) {
      var workspaceId = $('.workspaceEntityId').val();
      var dialog = $(text);
      var page = $('#page-' + workspaceMaterialId);
      $(text).dialog({
        modal: true, 
        resizable: false,
        width: 360,
        dialogClass: "workspace-materials-management-dialog",
        buttons: [{
          'text': dialog.data('button-delete-text'),
          'class': 'delete-button',
          'click': function(event) {
            mApi().workspace.workspaces.materials.del(workspaceId,workspaceMaterialId).callback($.proxy(function (err){
              if (err) {
                $('.notification-queue').notificationQueue('notification', 'error', err);
              } else {
                $(this).dialog("close");
                // TODO: animation won't work
                $(page)
                .animate({
                  height:0,
                  opacity: 0
                }, {
                  duration : 500,
                  easing : "easeInOutQuint",
                  complete: function() {
                    $(page).next(".workspace-materials-management-addpage").remove();
                    $(page).next(".workspaces-materials-management-insert-file").remove();
                    $(page).remove();
                  }
                });
              }
            }, this));
          }
        }, {
          'text': dialog.data('button-cancel-text'),
          'class': 'cancel-button',
          'click': function(event) {
            $(this).dialog("close");
          }
        }]
      });
    }, this));
  }
  
  function toggleVisibility(node, hidden) {
    var _node = node;
    var _hidden = hidden;
    var workspaceId = $('.workspaceEntityId').val();
    var nextSibling = node.nextAll('.workspace-materials-management-view-page').first();
    var nextSiblingId = nextSibling.length > 0 ? nextSibling.data('workspace-material-id') : null;
    mApi().workspace.workspaces.materials.update(workspaceId, node.data('workspace-material-id'), {
      id: node.data('workspace-material-id'),
      materialId: node.data('material-id'),
      parentId: node.data('parent-id'),
      nextSiblingId: nextSiblingId,
      hidden: hidden
    }).callback(
      function (err, html) {
        // TODO error handling
        if (!hidden) {
          node.removeClass('page-hidden');
          node.find('.hide-page').removeClass('icon-show').addClass('icon-hide');
          // TODO Table of contents modifications
        }
        else {
          node.addClass('page-hidden');
          node.find('.hide-page').removeClass('icon-hide').addClass('icon-show');
          // TODO Table of contents modifications
        }
    });
  }
  
  $(document).ready(function() {
    // Workspace Material's page loading
    
    function loadPageNodes(selector, node) {
      loadPageNode(node, function() {
        var next = $(node).nextAll(selector).first();
        if (next.length > 0) {
          loadPageNodes(selector, next);
        }
      });
    }
    
    loadPageNodes('.workspace-materials-management-view-page', $('.workspace-materials-management-view-page').first());

    /* Smooth scrolling */
    var $sections = $('.workspace-materials-management-view-page');

    $sections.each(function() {
      var $section = $(this);
      var hash = '#' + this.id;

      $('a[href="' + hash + '"]').click(function(event) {
        $('html, body').stop().animate({
          scrollTop: $section.offset().top - 29
        },{
          duration: 500,
          easing : "easeInOutQuad",
          complete: function() {
            window.location.hash = hash;
          }
        });
        event.preventDefault();
      });
    });

    /* Highlighting toc item at appropriate time when we scroll to the corresponding section */
    $('.workspace-materials-management-view-page')
      .waypoint(function(direction) {
        var $links = $('a[href="#' + this.id + '"]');
        $links.toggleClass('active', direction === 'down');
      }, {
        offset: '60%'
      })
      .waypoint(function(direction) {
        var $links = $('a[href="#' + this.id + '"]');
        $links.toggleClass('active', direction === 'up');
      }, {
        offset: function() {
          return -$(this).height() + 250;
        }
      });
    
    //
    
    // Workspace's Materials's TOC
    if ($('#workspaceMaterialsManagementTOCWrapper').length > 0) {
      
      var height = $(window).height();
      var thinTocWrapper = $('#workspaceMaterialsManagementTOCClosed');
      var wideTocWrapper = $('#workspaceMaterialsManagementTOCOpen');
      var tocOpeningButton = $('.workspace-materials-management-toc-opening-button');
      var tocClosingButton = $('.workspace-materials-management-toc-closing-button');
      var contentPageContainer = $('#contentWorkspaceMaterialsManagement');
      
      var contentMinOffset;
      var contentOffset;
      var windowMinWidth;

      if (thinTocWrapper.length > 0) {
        thinTocWrapper
        .hide()
        .css({
          height: height,
          "margin-left" : "-55px"
        });
      }
      
      if (wideTocWrapper.length > 0) {
        contentPageContainer.css({
          paddingLeft: wideTocWrapper.width() + 10,
          paddingRight: "60px"
        });
        
        wideTocWrapper
        .show()
        .css({
          height: height,
          "margin-left" : "0px"
        });
      }
      
      $(window).resize(function(){
        height = $(window).height();
        wideTocWrapper.height(height);
        thinTocWrapper.height(height);
        
        contentMinOffset = wideTocWrapper.width() + 10; 
        contentOffset = contentPageContainer.offset();
        windowMinWidth = contentPageContainer.width() + contentMinOffset*2;
        
        // Lets prevent page content to slide under TOC when browser window is resized
        if ($('#workspaceMaterialsManagementTOCOpen:visible').length !== 0) {
          
          if (contentOffset.left < contentMinOffset) {
            contentPageContainer.css({
              paddingLeft: contentMinOffset,
              paddingRight: "60px"
            });
          } 
        } else {
          contentPageContainer.css({
            paddingLeft: "60px",
            paddingRight: "60px"
          });
        }
        
      });

      $(tocOpeningButton).click(function() {
        thinTocWrapper
        .clearQueue()
        .stop()
        .animate({
          "margin-left" : "-55px"
        }, {
          duration : 200,
          easing : "easeInOutQuint",
          complete : function(){
            $(this).hide();
            
            contentMinOffset = wideTocWrapper.width() + 10; 
            
            contentPageContainer
            .animate({
              paddingLeft: contentMinOffset,
              paddingRight: "60px"
            },{
              duration:500,
              easing: "easeInOutQuint"
            });
            
            wideTocWrapper
            .show()
            .clearQueue()
            .stop()
            .animate({
              opacity:0.97,
              "margin-left" : "0"
            }, {
              duration:500,
              easing: "easeInOutQuint"
            });
            
          }
        });
      });
      
      $(tocClosingButton).click(function() {
              
        contentPageContainer
        .animate({
          paddingLeft: "60px",
          paddingRight: "60px"
        },{
          duration:600,
          easing: "easeInOutQuint"
        });
        
        wideTocWrapper
        .clearQueue()
        .stop()
        .animate({
          "margin-left" : "-370px",
          opacity: 1
        }, {
          duration : 600,
          easing : "easeInOutQuint",
          complete : function(){
            $(this).hide();
            
            thinTocWrapper
            .show()
            .clearQueue()
            .stop()
            .animate({
              "margin-left" : "0"
            }, {
              duration:500,
              easing: "easeInOutQuint"
            });
            
          }
        });
      });
      
      $('.workspace-materials-toc-content-inner').on('DOMMouseScroll mousewheel', function(ev) {
        var $this = $(this),
          scrollTop = this.scrollTop,
          scrollHeight = this.scrollHeight,
          height = $this.height(),
          delta = (ev.type == 'DOMMouseScroll' ?
            ev.originalEvent.detail * -40 :
            ev.originalEvent.wheelDelta),
          up = delta > 0;

        var prevent = function() {
          ev.stopPropagation();
          ev.preventDefault();
          ev.returnValue = false;
          return false;
        }

        if (!up && -delta > scrollHeight - height - scrollTop) {
          // Scrolling down, but this will take us past the bottom.
          $this.scrollTop(scrollHeight);

          return prevent();
        } else if (up && delta > scrollTop) {
          // Scrolling up, but this will take us past the top.
          $this.scrollTop(0);
          return prevent();
        }
      });

    }
    
    $('.workspaces-materials-management-insert-file').each(function(index, element) {
      var nextMaterial = $(element).next('.workspace-materials-management-view-page');
      var parentId = $(nextMaterial).data('parent-id');
      var nextSiblingId = $(nextMaterial).data('workspace-material-id');
      enableFileUploader(element, parentId, nextSiblingId);
    });
  });
  
  $(document).on('click', '.edit-page', function (event, data) {
    // TODO: Better way to toggle classes and observe hidden/visible states?
    var page = $(this).closest('.workspace-materials-management-view-page');
    if (page.hasClass('page-hidden')) {
      page.removeClass('page-hidden');
      page.find('.hide-page').removeClass('icon-show').addClass('icon-hide');
    } 
    editPage($(this).closest('section'));
  });
  
  $(document).on('click', '.delete-page', function (event, data) {
    var workspaceMaterialId = $(this).data('workspace-material-id');
    
    deletePage(workspaceMaterialId);
  });
  
  $(document).on('click', '.hide-page', function (event, data) {
    // TODO: Better way to toggle classes and observe hidden/visible states?
    var page = $(this).closest('.workspace-materials-management-view-page');
    var hidden = page.hasClass('page-hidden');
    toggleVisibility(page, !hidden);
  });
  
  $(document).on('click', '.workspaces-materials-management-add-page', function (event, data) {
    var nextMaterial = $(this).next('.workspace-materials-management-view-page');
    
    renderDustTemplate('workspace/materials-management-new-page.dust', { }, $.proxy(function (text) {
      var newPage = $(text);
      $(this).after(newPage);
      
      var uploader = createFileUploader();
      $(newPage).before(uploader);
      enableFileUploader(uploader, nextMaterial.data('parent-id'), nextMaterial.data('workspace-material-id'));
      $(newPage).after(createAddPageLink());
      
      
      $(newPage).find('.workspace-materials-management-new-page-link').one('click', function (event) {
        event.preventDefault();
        
        var materialType = $(this).data('material-type');
        var parentId = $(nextMaterial).data('parent-id');
        var nextSiblingId = $(nextMaterial).data('workspace-material-id');
        
        var typeEndpoint = mApi().materials[materialType];
        if (typeEndpoint != null) {
          // TODO: Localize
          typeEndpoint.create({
            title: 'Untitled',
            contentType: 'text/html;editor=CKEditor'
          })
          .callback($.proxy(function (materialErr, materialResult) {
            if (materialErr) {
              $('.notification-queue').notificationQueue('notification', 'error', materialErr);
              return;
            }
            
            var workspaceEntityId = $('.workspaceEntityId').val();
            
            mApi().workspace.workspaces.materials.create(workspaceEntityId, {
              materialId: materialResult.id,
              parentId: parentId,
              nextSiblingId: nextSiblingId
            })
            .callback($.proxy(function (workspaceMaterialErr, workspaceMaterialResult) {
              if (workspaceMaterialErr) {
                $('.notification-queue').notificationQueue('notification', 'error', workspaceMaterialErr);
                return;
              } else {
                newPage.removeClass('workspace-materials-management-new-page');
                newPage.attr({
                  'id': 'page-' + materialResult.id,
                  'data-material-title': materialResult.title,
                  'data-parent-id': workspaceMaterialResult.parentId,
                  'data-material-id': materialResult.id,
                  'data-material-type': materialType,
                  'data-workspace-material-id': workspaceMaterialResult.id
                });

                editPage(materialType, materialResult.id);
              } 
            }, this));
          }, newPage));
        } else {
          $('.notification-queue').notificationQueue('notification', 'error', "Could not find rest service for " + materialType);
        }
        
      });
    }, this));
  });
  
  
}).call(this);
