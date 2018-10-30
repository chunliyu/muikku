module(function(){
  $.widget("custom.notificationQueue", {
    options : {
      'severity-info' : {
        'class' : 'notification-queue-item-info',
        'timeout' : 5000
      },
      'severity-warn' : {
        'class' : 'notification-queue-item-warn'
      },
      'severity-error' : {
        'class' : 'notification-queue-item-error'
      },
      'severity-fatal' : {
        'class' : 'notification-queue-item-fatal'
      },
      'severity-success' : {
        'class' : 'notification-queue-item-success',
        'timeout' : 5000
      },
      'severity-loading' : {
        'class' : 'notification-queue-item-loading'
      }
    },

    _create : function() {
      var context = this;
      context.element.children('.notification-queue-item').each(function(index, item) {
        context._setupItem(item);
      });
    },

    notify : function(severity, message) {
      var severityOption = this.options['severity-' + severity];
      if (severityOption) {
        return this._setupItem(
            $('<div>').data('severity', severity)
            .addClass('notification-queue-item')
            .addClass(severityOption['class'])
            .append($('<span>').html(message))
            .append($('<a>').addClass('notification-queue-item-close')
                .attr('href', 'javascript:void(null)'))
            .appendTo(this.element.find('.notification-queue-items')));
      } else {
        throw new Error("Severity " + severity + " is undefined");
      }
    },

    //Backwards compatibility hack
    notification: function (severity, message) {
      return this.notify(severity, message);
    },

    remove : function(item) {
      this._hide($(item));
    },

    _hide : function(item) {
      $(item).cssAnimate({
        "condition": ":visible",
        'addClass': 'hidden',
        'clearStyle': true,
        'callback': this._destroy.bind(this, item)
      });
    },

    _setupItem : function(item) {
      var severityOption = this.options['severity-' + $(item).data('severity')];
      if (severityOption && severityOption.timeout) {
        setTimeout(this._hide.bind(this, item), severityOption.timeout);
      }

      var context = this;
      
      var $item = $(item);
      var rawItem = item instanceof jQuery ? item.get(0) : item;
      if (rawItem.offsetHeight < rawItem.scrollHeight){
        $item.css("height", rawItem.scrollHeight);
      }
      $item.find('a.notification-queue-item-close').click(function(e){
        context._hide($item);
      });

      return $item;
    },

    _destroy : function(item) {
      item.remove();
    }
  });
});