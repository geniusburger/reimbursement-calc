
DateCell.prototype = Object.create(Cell.prototype);

function DateCell(date) {
	Cell.apply(this, ['text-right']);
	this.date = date;
}

DateCell.prototype.buildContents = function() {
	return document.createTextNode(this.toString());
};

DateCell.prototype.toString = function() {
	return this.date.toDateString();
}