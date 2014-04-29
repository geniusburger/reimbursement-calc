
BoldTextCell.prototype = Object.create(TextCell.prototype);

function BoldTextCell(text) {
	TextCell.apply(this, arguments);	// Call super ctor
}

BoldTextCell.prototype.buildContents = function() {
	var strong = document.createElement('strong');
	strong.appendChild(TextCell.prototype.buildContents.apply(this, []));
	return strong;
};