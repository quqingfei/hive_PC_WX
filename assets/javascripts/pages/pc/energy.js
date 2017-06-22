$(document).ready(function () {
  var options = $.hive.getCurrentPageInfo('body-home-energy');
  $.hive.init(options, function () {
    function Energy() {
      this.$pageContent = $('.page-content');
      this.page = 0;
      this.perPage = 50;
      this.total = 0;
      this.sortpage = $.hive.pagesort();
      this.validation = $.hive.validation;
      this._render = function (data) {
          var $row = this._createRow();
          $row.appendTo(this.$pageContent);
          $row.setTemplateElement("hive-energy-tmpl");
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

    Energy.prototype = {
      init: function () {
        this.dataCenter = $.hive.getDataCenterIntance();
        this.getData();
      },

      getData: function () {
        $.hive.startPageLoading();
        var self = this;

        this.dataCenter.getAllDevicesLatestEnergy(this.page, this.perPage, function (res) {
          var data = { items: [] };
          self.total = res.result.data.total;
          var devices = res.result.data.devices;
          var max = 0;
          $.each(devices, function (index, item) {
            console.log(item);
            var _item = { 
              device_id : item.id,
              name: item.name,
              energy: item.energy.energy,
              has_data: item.energy.energy != null && !self.validation.isOutDate(item.energy.updated_at),
              has_warning: (item.energy.energy > $.hive.settings.max_energy) || item.energy.energy == null || self.validation.isOutDate(item.energy.updated_at),
              time: new Date(item.energy.updated_at).getTime()
            };

            var time = new Date(item.energy.updated_at).getTime();
            max = time > max ? time : max;
            data.items.push(_item);
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

    var currentPageObj = new Energy();
    currentPageObj.init();
  });
}); 