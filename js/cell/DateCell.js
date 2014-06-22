
DateCell.prototype = Object.create(Cell.prototype);

function DateCell(date, options) {
	Cell.apply(this, ['text-right', options]);
	this.date = date;
}

DateCell.prototype.buildContents = function() {
	return document.createTextNode(this.toString());
};

DateCell.prototype.toString = function() {
	return this.date.toDateString();
};