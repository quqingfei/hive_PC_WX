$(document).ready(function () {
  var CSRFTOKEN = $('meta[name="csrf-token"]').attr('content');
  var options = $.hive.getCurrentPageInfo('body-home-settings');

  $.hive.init(options, function () {

    function Settings() {

      this.min_shake = "";
      this.max_shake = "";
      this.min_temperature = "";
      this.max_temperature = "";
      this.min_energy = "";
      this.max_energy = "";
      this.min_humidity = "";
      this.max_humidity = "";
      this.ray = "";
      this.radius = "";
      this.max_no_data_time = "";
      $.hive.buildObservable(this);

      this.dataCenter = $.hive.getDataCenterIntance();

      this._returnNotNull = function (data) {
        return data == null ? "" : data;
      };

      this._returnDefaultNotNull

      this._sendSettingsData = function (type) {
        var data = this._initUpdateData();
        console.log(data);
        this.dataCenter.updateSettingsData(data, function (res) {
          if( res.code == 1000 && type ) {
            bootbox.alert("修改成功", function () {
              location.href = location.href;
            });
          }
          else if( res.code == 1001 ) {
            bootbox.alert("修改出错", function () {
              location.href = location.href;
            });
          }
          else {
            bootbox.alert("Logo修改出错", function () {
              location.href = location.href;
            });
          }
        }, function (err) {
          console.log(err);
          bootbox.alert("修改出错", function () {
            location.href = location.href;
          });
        }, this);
      };

      this._bindEvent = function () {
        var self = this;

        $('.hive-settings-theme li').click(function () {
          $('.hive-settings-theme li').css('border','solid 2px #aaaaaa');
          $('.hive-settings-theme li').removeAttr('data-select');
          $(this).css('border','solid 2px #31A5E7');
          $(this).attr('data-select','1');
        });

        $('.hive-settings-alarm-shakeOptions').click(function () {
          $('.hive-settings-alarm-shakeOptions').css('border', 'solid 1px #DDD');
          $('.hive-settings-theme li').removeAttr('data-select');
          $(this).css('border', 'solid 1px #31A5E7');
          $(this).attr('data-select','1');
        });

        $('.hive-settings-dataGap li').click(self._bindLiClickEvent);

        $('#hive-settings-fileUpLoad').change(function () {
        });
        $('.hive-settings input').keydown(function (e) {
          if((e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode == 8 || e.keyCode == 190) {
            return true;
          }
          else {
            return false
          }
        });

        $('.hive-settings-confirm').click(function () {
          if(!self._validateData()) {
            return;
          }
          self.uploader.upload();
          self._sendSettingsData(true);
        });

        $('.hive-settings-cancel').click(function () {
          window.location.href = window.location.href.split('/settings')[0];
        });
      };

      this._bindLiClickEvent = function () {
        $(this).parent('ul').find('li').css('border','solid 1px #DDD');
        $(this).parent('ul').find('li').removeAttr('data-select');
        $(this).css('border','solid 1px #31A5E7');
        $(this).attr('data-select','1');
      };

      this._validateData = function () {
        return true;
      };

      this._initUpdateData = function () {
        var arr = $('#hive-settingsForm').serializeArray();
        var data = {};
        $.each(arr, function (index, item) {
          data[item.name] = item.value;
        });

        if($('.hive-settings-theme li[data-select]').length) {
          data.theme = $('.hive-settings-theme li[data-select]').attr('data-themeType');
        }
        else {
          data.theme = "default";
        }
        if($(".hive-settings-tempDataGapOptions").length) {
          data.humiture_max_upload_time = parseFloat($(".hive-settings-tempDataGapOptions[data-select]").attr('data-gapType'));
        }
        else {
          data.humiture_max_upload_time = null;
        }
        if($(".hive-settings-shakeDataGapOptions").length) {
          data.shake_max_upload_time = parseFloat($(".hive-settings-shakeDataGapOptions[data-select]").attr('data-gapType'));
        }
        else {
          data.shake_max_upload_time = null;
        }
        if($(".hive-settings-imageDataGapOptions").length) {
          data.picture_max_upload_time = parseFloat($(".hive-settings-imageDataGapOptions[data-select]").attr('data-gapType'));
        }
        else {
          data.picture_max_upload_time = null;
        }
        if($(".hive-settings-rayDataGapOptions").length) {
          data.infrared_max_upload_time = parseFloat($(".hive-settings-rayDataGapOptions[data-select]").attr('data-gapType'));
        }
        else {
          data.infrared_max_upload_time = null;
        }
        return { setting: data };
      };

      this._renderData = function () {
        var result = $.hive.settings;
        var self = this;
        $.each(result, function (index, value) {
          if(self.hasOwnProperty(index)) {
            (self[index])(value);
          }
        });
        $(".hive-settings-theme li[data-themeType={0}]"._format(result.theme)).trigger('click');
        if(result.humiture_max_upload_time) {
          $(".hive-settings-tempDataGapOptions[data-gapType='{0}']"._format(result.humiture_max_upload_time)).trigger('click'); 
        }
        if(result.shake_max_upload_time) {
          $(".hive-settings-shakeDataGapOptions[data-gapType='{0}']"._format(result.shake_max_upload_time)).trigger('click'); 
        }
        if(result.picture_max_upload_time) {
          $(".hive-settings-imageDataGapOptions[data-gapType='{0}']"._format(result.picture_max_upload_time)).trigger('click'); 
        }
        if(result.infrared_max_upload_time) {
          $(".hive-settings-rayDataGapOptions[data-gapType='{0}']"._format(result.infrared_max_upload_time)).trigger('click');  
        }
        if(result.logo) {
          $('.hive-theme-preview').removeClass('hive-theme-preview-hide');
          $('.hive-theme-preview').attr('src',result.logo);
        }
      };

      this._reviewLogo = function () {
        var self = this;
        this.uploader = WebUploader.create({
          auto: false,
          server: '/v1/settings/logo',
          pick: '#hive-theme-logoSelector',
          accept: {
              title: 'Images',
              extensions: 'gif,jpg,jpeg,bmp,png',
              mimeTypes: 'image/*'
          },
          resize: false,

          formData: {
            "authenticity_token":$('meta[name="csrf-token"]').attr('content')
          },
          fileNumLimit: 1
        });

        this.uploader.on( 'beforeFileQueued', function( file ) {
            var _self = self;
            self.uploader.makeThumb( file, function( error, src ) {
              if ( error ) {
                  return;
              }
              $('.hive-theme-preview').attr( 'src', src );
              $('.hive-theme-preview').removeClass('hive-theme-preview-hide');
            }, 1, 1 );
        });

        this.uploader.on( 'uploadProgress', function( file, percentage ) {
        });

        // 文件上传成功，给item添加成功class, 用样式标记上传成功。
        this.uploader.on( 'uploadSuccess', function( file ) {    
        });

        // 文件上传失败，显示上传出错。
        this.uploader.on( 'uploadError', function( file ) {
        });

        // 完成上传完了，成功或者失败，先删除进度条。
        this.uploader.on( 'uploadComplete', function( file ) {
        });

        this.uploader.on( 'uploadAccept', function ( obj, res) {
          if( res.code == 1000 ) {
            bootbox.alert("Logo上传成功", function () {
              
            });
          }
          else {
            bootbox.alert("Logo上传失败", function () {
              
            });
          }
        });
      };
    }

    $.extend(Settings.prototype, {
      init: function () {
        this._bindEvent();
        this._renderData();
        this._reviewLogo();
      }
    });

    var settingPage = new Settings();
    var obj = document.getElementById('hive-settingsForm');
    if(obj) {
      ko.applyBindings(settingPage, obj);
      settingPage.init();
    }

  });
});