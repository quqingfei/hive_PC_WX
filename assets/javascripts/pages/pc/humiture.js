$(document).ready(function () {
  var options = $.hive.getCurrentPageInfo('body-home-humiture');

  $.hive.init(options, function () {
  	function Humiture() {
  		this.$pageContent = $('.page-content');
  		this.settings = {};
      this.page = 0;
      this.perPage = 50;
      this.total = 0;
      this.sortpage = $.hive.pagesort();
      this.validation = $.hive.validation;
  		this._render = function (data) {
  		    var $row = this._createRow();
  		    $row.appendTo(this.$pageContent);
    	    $row.setTemplateElement("hive-humiture-tmpl");
    	    $row.processTemplate(data);
  		};

  		this._createRow = function () {
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

  	Humiture.prototype = {
  		init: function ()
		  {
        this.dataCenter = $.hive.getDataCenterIntance();
        this.getData();
      },

      getData: function () {
        $.hive.startPageLoading();
        var self = this;

        this.dataCenter.getAllDevicesLatestHumiture(this.page, this.perPage, function (res) {
          var data = { items: [] };
          self.total = res.result.data.total;
          var devices = res.result.data.devices;
          var max = 0;
          $.each(devices, function (index, item) {
            var _item = { 
              device_id : item.id,
              name: item.name,
              humidity: item.humitures[0].humidity,
              temperature: item.humitures[0].temperature,
              time: new Date(item.humitures[0].updated_at).getTime()
            };
            var _tempHum = item.humitures[0];
            _item.has_data = _tempHum.temperature != null && !self.validation.isOutDate(item.humitures[0].updated_at);
            _item.has_warning = ((_tempHum.temperature < $.hive.settings.min_temperature 
                || 
               _tempHum.temperature > $.hive.settings.max_temperature)
                ||
               (_tempHum.humidity < $.hive.settings.min_humidity 
                || 
               _tempHum.humidity > $.hive.settings.max_humidity)) || self.validation.isOutDate(item.humitures[0].updated_at);
            _item.has_power = _tempHum.power > $.hive.settings.min_power;
            data.items.push(_item);
            var time = new Date(item.humitures[0].updated_at).getTime();
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

   	// emit the rendering job here
   	var currentPageObj = new Humiture();
   	currentPageObj.init();
  });
});