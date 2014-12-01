
//////////////////////////////////////////////////////////////////////////////////
////////     Utilities
//////////////////////////////////////////////////////////////////////////////////

var util = {};

/**
 * Remove all child nodes.
 * @param  {object} parent The node to remove all children from.
 */
util.removeChildren = function(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
};

util.getNumberWithCommas = function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

util.getSelected = function(id) {
	return document.getElementById(id).selectedOptions[0].value
};

util.isInvalidDate = function(date) {
	return isNaN(date.getTime());
};

util.toArray = function(list) {
	return Array.prototype.slice.call(list);
};

util.stripTime = function(date) {
    if( date instanceof Date) {
        return new Date(date.getTime() - (date.getHours() * 3600000) - (date.getMinutes() * 60000) - (date.getSeconds() * 1000) - date.getMilliseconds());
    }
};
