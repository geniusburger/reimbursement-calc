
DateCell.prototype = Object.create(Cell.prototype);

/**
 * @param date
 * @param [options]
 * @constructor
 */
function DateCell(date, options) {
	Cell.apply(this, ['text-right', options]);
	this.date = date;
}

DateCell.prototype.buildContents = function() {
	return document.createTextNode(this.toString());
};

DateCell.prototype.toString = function() {
    if( cellUtil.smallSize) {
        return this.date.toLocaleDateString();
    } else {
	    return this.date.toDateString();
    }
};