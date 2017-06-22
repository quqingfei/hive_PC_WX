(function ($) {
  $(document).ready(function () {
    $.hive.pagesort = function () {
      return new pageSort();
    };
    function pageSort() {

      this.sortArr = [true,true,true];
      this._tableSort = function (index) {
          var $grid = $('.hive-grid-col');
          var arr = [];
          $grid.each(function (index, item) {
            arr.push($grid.eq(index));
          });
          switch(index) {
            case "0":
              if(this.sortArr[index]) {
                arr.sort(this._SortTimeUpRuleFunction);
              }
              else {
                arr.sort(this._SortTimeDownRuleFunction);
              }
              break;
            case "1":
              if(this.sortArr[index]) {
                arr.sort(this._SortStatusUpRuleFunction);
              }
              else {
                arr.sort(this._SortStatusDownRuleFunction);
              }
              break;
            case "2":
              if(this.sortArr[index]) {
                arr.sort(this._SortNameUpRuleFunction);
              }
              else {
                arr.sort(this._SortNameDownRuleFunction);
              }
              break;
          }
          this.sortArr[index] = !this.sortArr[index];
          $('.hive-grid-row').empty();
          $.each(arr, function (index, item) {
            $('.hive-grid-row').eq(0).prepend($(item));
          });
          $('.hive-grid-col').click(function () {
            var id = $(this).attr('data-id');
            $.hive.showDeviceDetails(id);
          });
      };

      this.stringCompare = function (a, b, c) {
        if(a.length != b.length) {
          return (a.length > b.length) ? c : -c;
        }
        else {
          return (a > b) ? c : -c;
        }
      }

      this._SortNameUpRuleFunction = function (a, b) {
        return $.hive.pagesort().stringCompare(a.attr('data-name'), b.attr('data-name'), 1);
      };
      this._SortStatusUpRuleFunction = function (a, b) {
        return $.hive.pagesort().stringCompare(a.attr('data-status'), b.attr('data-status'), 1);
      };
      this._SortTimeUpRuleFunction = function (a, b) {
        return $.hive.pagesort().stringCompare(a.attr('data-time'), b.attr('data-time'), 1);
      };
      this._SortNameDownRuleFunction = function (a, b) {
        return $.hive.pagesort().stringCompare(a.attr('data-name'), b.attr('data-name'), -1);
      };
      this._SortStatusDownRuleFunction = function (a, b) {
        return $.hive.pagesort().stringCompare(a.attr('data-status'), b.attr('data-status'), -1);
      };
      this._SortTimeDownRuleFunction = function (a, b) {
        return $.hive.pagesort().stringCompare(a.attr('data-time'), b.attr('data-time'), -1);
      };
    }
  });
})(jQuery);