
function Cell(alignmentClass) {
	this.alignmentClass = alignmentClass;
}

Cell.prototype.buildContents = function() {
	return document.createTextNode('');	// default to blank
};

Cell.prototype.buildCell = function() {
	var td = document.createElement('td');
	td.appendChild(this.buildContents());
	if( this.alignmentClass) {
		td.className = this.alignmentClass;
	}
	return td;
};