
BoldDateCell.prototype = Object.create(DateCell.prototype);

function BoldDateCell(date, text) {
	DateCell.apply(this, arguments);	// Call super ctor
	this.text = text;
	if( this.text) {
		this.alignmentClass = 'text-center';
	}
}

BoldDateCell.prototype.buildContents = function() {
	var strong = document.createElement('strong');
	if( this.text) {
		strong.appendChild(document.createTextNode(this.text));
	} else {
		strong.appendChild(DateCell.prototype.buildContents.apply(this, []));
	}
	return strong;
};