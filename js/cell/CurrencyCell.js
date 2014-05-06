
CurrencyCell.prototype = Object.create(Cell.prototype);

function CurrencyCell(currency, options) {
	Cell.apply(this, ['text-right', options]);
	this.currency = currency;
	if( typeof this.options.useThousandsSeparators !== 'boolean') {
		this.options.useThousandsSeparators = true;
	}
	this.currency.useThousandsSeparators = this.options.useThousandsSeparators;
}

CurrencyCell.prototype.update = function(currency) {
	this.currency = new Currency(currency);
	util.removeChildren(this.contentHolder);
	this.contentHolder.appendChild(this.buildContents());
}

CurrencyCell.prototype.buildContents = function() {
	return document.createTextNode(this.currency.toString());
};

CurrencyCell.prototype.toString = function() {
	return this.currency.toString();
}