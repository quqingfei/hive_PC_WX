(function ($) {
  $(window.document).ready(function () {
    function new_device () {
      this.init();
      this.mainSn = "";
      this.mainName = "";
      this.mainDescription = "";
      this.groups = [{
                  groupName: "无分组",
                  group_id: 0
              }];
      this.tempSn = "";
      this.tempDescription = "";
      this.shakeSn = "";
      this.shakeDescription = "";
      this.imageSn = "";
      this.imageDescription = "";
      this.raySn = "";
      this.rayDescription = "";
      $.hive.buildObservable(this);
    }

    $.extend(new_device.prototype, {

      dataCenter: $.hive.getDataCenterIntance(),

      wxHandler: $.hive.weixinHandler,

      init: function () {
        
        this.bindCommonEvent();
        this.getGroups();
      },

      bindCommonEvent: function () {
        $('.wx-newDevice .device-delete').live('click', this.deviceDeleteEvent);
        $('.wx-newDevice-form .deviceSn').live('keyup', this._bindKeyUpEvent);
        $('.wx-newDevice-form .clearfix i:first-child, .wx-nav-QRcode').click(this._iconClickEvent);
        $('.wx-newDevice-confirm').show();
        $('.wx-newDevice-confirm div:first-child').click(this.newDeviceCancelEvent);
        $('.wx-newDevice-confirm div:last-child').click(this.newDeviceConfirmEvent);
      },

      _iconClickEvent: function (e) {
        var self = this;
        $.hive.weixinHandler.scan(function (res) {

          var result = res.resultStr;
          var parent = $(self).parent('.clearfix');
          var snObj = parent.find('.deviceSn');
          snObj.val(result);
          snObj.trigger('keyup');

        }, function (err) {
          alert(err);
        });
        
      },

      deviceDeleteEvent: function (ev, e) {
        var parent = $(this).parent('.clearfix');
        $(parent.next().get(0)).remove();
        parent.remove();
      },

      addDevice: function (ev, e) {
        var self = this;
        $('.newDevice-form-subDevice .hidden').each(function (index, item) {
          var obj = $(item).clone();
          obj.removeClass('hidden');
          obj.attr('data-modal', 'true');
          obj.find('.device-left').click(self._iconClickEvent);
          $('.newDevice-plus').before(obj);
        });
        return false;
      },

      newDeviceConfirmEvent: function (ev, e) {
        if($('.fa-times').length > 0) {
          return;
        }
        this.sendInsertData();
      },

      newDeviceCancelEvent: function (ev, e) {
        location.href = "/weixin";
      },

      _bindKeyUpEvent: function (ev, e) {
        var $this = $(this);
        if(this.value == "") {
            $(this).parent('div').find('device-right').removeClass('fa-times');
            return;
        }
        $.hive.deviceDetails.autoQuery.query(function () {
          return $.hive.deviceDetails.getValidate($this);
        },$this.get(0));
      },

      getGroups: function () {
        this.dataCenter.getGroups (function (res) {
          var self = this;
          $.each(res.result, function (index, item) {
              self.groups.push({
                groupName: item.name,
                group_id: item.id
              });
          });
        }, function (err) {
          console.log(err);
        }, this);
      },

      sendInsertData: function() {
        var group_id = $('.newDevice-form-mainDevice select').val();
        var device = {
          name: $.hive.newDevice.mainName(),
          description: $.hive.newDevice.mainDescription(),
          group_id: group_id == 0 ? null : group_id,
          sub_devices:[]
        };

        var $description_inputs = $('.wx-newDevice-form .deviceDescription');
        $('.wx-newDevice-form .deviceSn').each(function(index, item) {
          if(item.value && item.value.length != 0) {
            device.sub_devices.push({
              sn: item.value,
              description: $description_inputs.eq(index).val()
            });
          } 
        });
        this.createDevice(device);
      },

      createDevice: function (data) {
        return;
        this.dataCenter.createDevice({ device: data },function(res) {
          if(res.code == 1001) {
            bootbox.alert("创建失败", function () {
            });
          }
          else {
            location.href = location.href;
          }
        },function(err) {
          console.log(err);
        },this);;
      }

    });
    var obj = document.getElementById('wx-newDevice');
    if(obj) {
      $.hive.newDevice = new new_device();
      ko.applyBindings($.hive.newDevice, obj);
    }
  });
})(jQuery);