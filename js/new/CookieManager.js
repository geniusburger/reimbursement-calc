
function CookieManager() {
	this.names = {
		DATES: 'dates',
		TIME_AMOUNT: 'timeAmount',
		TIME_UNIT: 'timeUnit'
	}
}

CookieManager.prototype.getTimeUnit = function() {
	return this.getCookie(this.names.TIME_UNIT);
};

CookieManager.prototype.setTimeUnit = function(timeUnit) {
	this.setCookie(this.names.TIME_UNIT, timeUnit);
};

CookieManager.prototype.getTimeAmount = function() {
	return this.getCookie(this.names.TIME_AMOUNT);
};

CookieManager.prototype.setTimeAmount = function(timeAmount) {
	this.setCookie(this.names.TIME_UNIT, timeAmount);
};

CookieManager.prototype.getDates = function() {
	var cookie = this.getCookie(this.names.DATES);
	var dates = [];
	if (cookie !== null && cookie !== "") {
		cookie.split(":").forEach(function(date) {
			var values = date.split("@");
			if( values.length === 2) {
				dates.push(values);
			} else {
				console.warn('invalid date cookie', date);
			}
		});
	}
	return dates;
};

CookieManager.prototype.setDates = function(dates) {
	var cookie = '';
	if( typeof dates === 'undefined') {
		dates = dateRowUtil.getStartRows();
	}
	dates.forEach(function(tr, notFirst) {
		if( notFirst) {
			cookie += ':';
		}
		cookie += tr.row.amountCell.toString() + '@' + tr.row.dateCell.toString();
	});
	this.setCookie(this.names.DATES, cookie);
};

/**
 * Retrieve a cookie from the browser.
 * @param  {string} name The name of the cookie to retrieve.
 * @return {string} Value of the cookie or null if not found.
 * @private
 */
CookieManager.prototype.getCookie = function(name) {
	var name = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return null;
};

/**
 * Set a cookie in the browser.
 * @param {string} name The name of the cookie to set.
 * @param {string} value The value fo the cookie to set.
 * @private
 */
CookieManager.prototype.setCookie = function(name, value) {
	document.cookie = name + "=" + value;
};