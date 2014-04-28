
TextCell.prototype = new Cell();

function TextCell(text) {
	Cell.apply(this, ['text-center']);
	this.text = text;
}

TextCell.prototype.buildContents = function() {
	return document.createTextNode(this.text);
};