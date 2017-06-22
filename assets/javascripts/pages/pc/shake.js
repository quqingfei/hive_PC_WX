$(document).ready(function () {
  var options = $.hive.getCurrentPageInfo('body-home-shake');

  $.hive.init(options, function () {
    function Shake() {
      this.$pageContent = $('.page-content');
      this.page = 0;
      this.perPage = 50;
      this.total = 0;
      this.sortpage = $.hive.pagesort();
      this.validation = $.hive.validation;
      this._render = function (data) {
        var $row = this._createRow();
        $row.appendTo(this.$pageContent);
        $row.setTemplateElement("hive-shake-tmpl");
        $row.processTemplate(data);
      };

      this._createRow = function (data) {
        return $("<div class='row hive-grid-row'></div>");
      };

      this._bindEvent = function () {
        var self = this;
        $('.hive-grid-col').click(function () {
            var id = $(this).attr('data-id');
            $.hive.showDeviceDetails(id);
        });
        $('.hive-pageBar-sortBtn').removeClass('hive-page-hidden');
        $('.hive-pageBar-latesTime').removeClass('hive-page-hidden');
        $('.hive-pageBar-sortBtn i').click(function (e) {
          $('.hive-pageBar-quickPage').addClass('quickPage-show');
          e.stopPropagation();
        });
        $(document.body).click(function () {
          $('.hive-pageBar-quickPage').removeClass('quickPage-show');
        });
        $('.hive-pageBar-quickPage div').click(function () {
          self.sortpage._tableSort($(this).attr('data-type'));
          $('.hive-pageBar-quickPage').removeClass('quickPage-show');
        });
      };
    }

    Shake.prototype = {
      init: function () {
        this.dataCenter = $.hive.getDataCenterIntance();

        this.getData();
      },

      getData: function () {
        $.hive.startPageLoading();
        var self = this;

        this.dataCenter.getAllDeviceLatestShake(this.page, this.perPage, function (res) {
          var data = { items: [] };
          self.total = res.result.data.total;
          var devices = res.result.data.devices;
          var max = 0;
          $.each(devices, function (index, item) {
            data.items.push({
              device_id: item.id,
              name: item.name,
              has_data: item.shakes[0].shake != null && !self.validation.isOutDate(item.shakes[0].updated_at),
              has_warning: item.shakes[0].shake > $.hive.settings.max_shake || self.validation.isOutDate(item.shakes[0].updated_at),
              has_power : item.shakes[0].power > $.hive.settings.min_power,
              shake: item.shakes[0].shake,
              time: new Date(item.shakes[0].updated_at).getTime()
            });
            var time = new Date(item.shakes[0].updated_at).getTime();
            max = time > max ? time : max;
          });
          if(max) {
            $('.hive-pageBar-latesTime').text("实时时间: "+moment(new Date(max)).format('YYYY-MM-DD hh:mm:ss'));
          }
          self._render(data);
          self._bindEvent();

          $.hive.stopPageLoading();
        },
        function (err) {
          console.log(err);

          $.hive.stopPageLoading();
        });
      }
    };
    
    var currentPageObj = new Shake();
    currentPageObj.init();
  });
});