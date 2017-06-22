$(document).ready(function () {
  var options = $.hive.getCurrentPageInfo('body-home-inspection');

  $.hive.init(options, function () {
  	function inspection() {
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
    	    $row.setTemplateElement("hive-inspection-tmpl");
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

  	inspection.prototype = {
  		init: function ()
		  {
        this.dataCenter = $.hive.getDataCenterIntance();
        this._data = { items: [] };
        this.getData();
      },

      getData: function () {
        $.hive.startPageLoading();
        this.dataCenter.getAllDevicesLatestData("all", function (res) {
          var result = res.result.data.devices;
          var self = this;
          $.each(result, function(index, item) {
            var location = item.location;
            location.city = (location.city == location.province) ? "" : location.city;
            location = (location.province || "") + (location.city || "") + (location.downtown || "") + (location.street || "");
            if(item.routine_checking) {
              var time = self.calculateDates(item.routine_checking.created_at);
            }
            self._data.items.push({
              device_id : item.id,
              Devicename: item.name,
              time: (item.routine_checking) ? time : null,
              name: (item.routine_checking && item.routine_checking.user) ? item.routine_checking.user.name : "",
              isError: ($.hive.checkNormal(item) != "设备运行正常")
            });
          });
          self._render(this._data);
          self._bindEvent();
          $.hive.stopPageLoading();
        }, function (err) {
          console.log(err);
        }, this);
      },
      calculateDates: function (date) {

        var thisDate = new Date($.hive.current_date);
        var date = new Date(date);
        return parseInt((thisDate.getTime() - date.getTime())/3600000/24);

      }
 	  };

   	// emit the rendering job here
   	var currentPageObj = new inspection();
   	currentPageObj.init();
  });
});