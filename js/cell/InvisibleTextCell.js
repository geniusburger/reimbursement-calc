
InvisibleTextCell.prototype = Object.create(TextCell.prototype);

function InvisibleTextCell(text) {
	TextCell.apply(this, arguments);	// Call super ctor
}

InvisibleTextCell.prototype.buildContents = function() {
	var div = document.createElement('div');
	div.appendChild(TextCell.prototype.buildContents.apply(this, []));
	div.style.visibility = 'hidden';
	return div;
};