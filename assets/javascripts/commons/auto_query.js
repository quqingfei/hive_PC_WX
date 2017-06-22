(function ($) {
	function AutoQuery (options) {
		var self = this;
		this.options = $.extend({ timeout: 2000 }, options);
		this.requestHandler = null;
		this.timeoutHandler = null;
		this.intervalHandler = null;
		this.objs = [];
		this.timeoutHandlers = [];
		this.query = function (requestFn, obj) {
			var index = self.checkSameHandler(obj);
			if(index > -1) {
				window.clearTimeout(self.timeoutHandlers[index]);
				self.timeoutHandlers = $.grep(self.timeoutHandlers, function (item, i) {
					return i != index; 
				});
				self.objs = $.grep(self.objs, function (item, i) {
					return item != obj;
				});
			}
			this.timeoutHandler = window.setTimeout(function () {
				self.requestHandler = requestFn();
			}, this.options.timeout);
			self.objs.push(obj);
			self.timeoutHandlers.push(self.timeoutHandler);
		};

		this.longPolling = function (fn) {
			if(this.intervalHandler) {
				window.clearInterval(this.intervalHandler);
				this.intervalHandler = null;
			}

			if(this.requestHandler) {
				this.requestHandler.abort();
				this.requestHandler = null;
			}

			this.intervalHandler = window.setInterval(function () {
				self.requestHandler = fn();
			}, this.options.timeout);
		};

		this.checkSameHandler = function (handler) {
			var result = -1;
			$.each(this.objs, function (index, item) {
				if(item == handler) {
					result = index;
				}
			});
			return result;
		};
	}

	$.getAutoQuery = function (options) {
		return new AutoQuery(options);
	};
})(jQuery);