
CurrencyCell.prototype = Object.create(Cell.prototype);

function CurrencyCell(currency, useThousandsSeparators) {
	Cell.apply(this, ['text-right']);
	this.currency = currency;
	this.useThousandsSeparators = useThousandsSeparators;
	if( typeof useThousandsSeparators === 'undefined') {
		this.useThousandsSeparators = true;
	}
}

CurrencyCell.prototype.update = function(currency) {
	this.currency = currency;
	util.removeChildren(this.contentHolder);
	this.contentHolder.appendChild(this.buildContents());
}

CurrencyCell.prototype.buildContents = function() {
	return document.createTextNode(this.currency.toString());
};