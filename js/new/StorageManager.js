
function StorageManager() {
	this.names = {
		DATES: 'dates',
		TIME_AMOUNT: 'timeAmount',
		TIME_UNIT: 'timeUnit'
	}
    if( localStorage) {
        this.set = StorageManager.prototype.setLocalStorage;
        this.get = StorageManager.prototype.getLocalStorage;
    } else if(navigator.cookieEnabled === true) {
        this.set = StorageManager.prototype.setCookie;
        this.get = StorageManager.prototype.getCookie;
    } else {
        this.displayCookieWarning = true;
    }
}

StorageManager.prototype.getTimeUnit = function() {
	return this.get(this.names.TIME_UNIT);
};

StorageManager.prototype.setTimeUnit = function(timeUnit) {
	this.set(this.names.TIME_UNIT, timeUnit);
};

StorageManager.prototype.getTimeAmount = function() {
	return this.get(this.names.TIME_AMOUNT);
};

StorageManager.prototype.setTimeAmount = function(timeAmount) {
	this.set(this.names.TIME_UNIT, timeAmount);
};

StorageManager.prototype.getDates = function() {
	var cookie = this.get(this.names.DATES);
	var dates = [];
	if (cookie !== null && cookie !== "") {
		cookie.split(":").forEach(function(date) {
			var values = date.split("@");
			if( values.length === 2) {
				dates.push(values);
			} else {
				console.warn('invalid saved date value', date);
			}
		});
	}
	return dates;
};

StorageManager.prototype.setDates = function(rows) {
	var cookie = '';
	if( typeof rows === 'undefined') {
        rows = dateRowUtil.getStartRows();
	}
    rows.filter(function(row){
        return row.isStart;
    }).forEach(function(row, notFirst) {
		if( notFirst) {
			cookie += ':';
		}
		cookie += row.amount.toString() + '@' + row.date.toDateString();
	});
	this.set(this.names.DATES, cookie);
};

/**
 * Retrieve a cookie from the browser.
 * @param  {string} name The name of the cookie to retrieve.
 * @return {string} Value of the cookie or null if not found.
 * @private
 */
StorageManager.prototype.getCookie = function(name) {
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
StorageManager.prototype.setCookie = function(name, value) {
	document.cookie = name + "=" + value;
};

/**
 * Set a local storage item in the browser.
 * @param {string} name The name of the item to set.
 * @param {string} value The value fo the item to set.
 * @private
 */
StorageManager.prototype.setLocalStorage = function(name, value) {
    localStorage.setItem(name, value);
};

/**
 * Retrieve a local storage item from the browser.
 * @param  {string} name The name of the item to retrieve.
 * @return {string} Value of the item or null if not found.
 * @private
 */
StorageManager.prototype.getLocalStorage = function(name) {
    return localStorage.getItem(name);
};
