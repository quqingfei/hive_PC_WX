(function ($) {
    $.hive.loadPictures = function (options) {
        return new PicturesLoader(options);
    };

    function PicturesLoader(options) {
        this.default = { data: [], parallel_num: 5, done: null };
        this.default = $.extend(this.default, options);
        this.init();
    }

    $.extend(PicturesLoader.prototype, {
        init: function () {
            var _queue = this.default.data;
            var num = _queue.length > this.default.parallel_num ? this.default.parallel_num : _queue.length;
            var _processingQueue = [];

            for(var i = 0; i < num; i++) {
                _processingQueue.push(this._buildRequest(_queue.shift(), this.default.done));
            }

            var self = this;
            $.when.apply($, _processingQueue).done(function () {
                if(self.default.data.length > 0) {
                    self.init();
                }
            });
        },

        _buildRequest: function (data, done) {
            return $.Deferred(function (task) {
                var $img = $('<img/>').attr("url", data.url);

                $img.load(function () {
                    done(data);
                    task.resolve(data);
                });
                $img.error(function () {
                    task.reject();
                });
            }).promise();
        }
    });
})(jQuery);