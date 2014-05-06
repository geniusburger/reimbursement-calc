
TextCell.prototype = Object.create(Cell.prototype);

function TextCell(text, options) {
	Cell.apply(this, ['text-center', options]);
	this.text = text;
}

TextCell.prototype.buildContents = function() {
	return document.createTextNode(this.text);
};