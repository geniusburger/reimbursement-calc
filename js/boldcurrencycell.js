
BoldCurrencyCell.prototype = new CurrencyCell();

function BoldCurrencyCell(cents) {
	CurrencyCell.apply(this, arguments);	// Call super ctor
}

BoldCurrencyCell.prototype.buildContents = function() {
	var strong = document.createElement('strong');
	strong.appendChild(CurrencyCell.prototype.buildContents.apply(this, []);
	return strong;
};