(function Util(argument) {
	String.prototype._format = function() {
	  var source = this;

	  for (var i = 0; i <= arguments.length - 1; i++) {       
	    var reg = new RegExp("\\{" + i + "\\}", "gm");             
	    source = source.replace(reg, arguments[i]);
	  }

	  return source;
	};

	Array.prototype.max = function () {
		return Math.max.apply(Math, this);
	};

	Array.prototype.min = function () {
		return Math.min.apply(Math, this);
	};

	Number.prototype.toFloat = function (num) {
		return parseFloat(this.toFixed(num));
	};
})();