
DateCell.prototype = new Cell();

function DateCell(date) {
	Cell.apply(this, ['text-right']);
	this.date = date;
}

DateCell.prototype.buildContents = function() {
	document.createTextNode(this.toString());
};

DateCell.prototype.toString() = function() {
	return this.date.toDateString();
}