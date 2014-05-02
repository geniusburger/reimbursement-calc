
BoldDateCell.prototype = Object.create(DateCell.prototype);

function BoldDateCell(date, today) {
	DateCell.apply(this, arguments);	// Call super ctor
	this.today = today;
}

BoldDateCell.prototype.buildContents = function() {
	var strong = document.createElement('strong');
	if( this.today) {
		strong.appendChild(document.createTextNode('Today'));
	} else {
		strong.appendChild(DateCell.prototype.buildContents.apply(this, []));
	}
	return strong;
};