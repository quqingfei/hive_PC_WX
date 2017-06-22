$(document).ready(function () {
  var options = $.hive.getCurrentPageInfo('body-home-picture');

  $.hive.init(options, function () {
    function Picture() {
        this.$pageContent = $('.page-content');
        this.sortpage = $.hive.pagesort();
        this.validation = $.hive.validation;
        this._render = function (data) {
            var $row = this._createRow();
            $row.appendTo(this.$pageContent);
            $row.setTemplateElement("hive-picture-tmpl");
            $row.processTemplate(data);
            $('.hive-picture-cell').height($('.hive-picture-cell').width()*3/4);
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

    Picture.prototype = {
      init: function () {
        this.dataCenter = $.hive.getDataCenterIntance();

        this.getData();
      },

      getData: function () {
        $.hive.startPageLoading();
        var self = this;

        this.dataCenter.getAllDevicesLatestPicture(this.page, this.perPage, function (res) {
          var data = { items: [] };
          var devices = res.result.data.devices;
          var max = 0;
          $.each(devices, function (index, item) {
            var _item = { 
              device_id : item.id,
              name: item.name,
              url: item.pictures[0].path,
              has_data: (item.pictures[0].path != null && item.pictures[0].path != "") && !self.validation.isOutDate(item.pictures[0].updated_at),
              elem_id:  'hive-picturePage-' + index,
              has_power : item.pictures[0].power > $.hive.settings.min_power,
              time: new Date(item.pictures[0].updated_at).getTime(),
            };
            var time = new Date(item.pictures[0].updated_at).getTime();
            max = time > max ? time : max;
            data.items.push(_item);
          });
          if(max) {
            $('.hive-pageBar-latesTime').text("实时时间: "+moment(new Date(max)).format('YYYY-MM-DD hh:mm:ss'));
          }
          self._render(data);
          self._bindEvent();

          $.hive.stopPageLoading();

  /*        self.imageLoader = $.hive.loadPictures({ 
              data: data.items, 
              done: function done(item) {
                  $("#" + elem_id).css("background-image", "url(" + data.url +")");
              }
          });*/
        },
        function (err) {
          console.log(err);

          $.hive.stopPageLoading();
        });
      }
    };

    var currentPageObj = new Picture();
    currentPageObj.init();
  });
});