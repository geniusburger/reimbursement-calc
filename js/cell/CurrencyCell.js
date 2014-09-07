
CurrencyCell.prototype = Object.create(Cell.prototype);

/**
 * @param currency
 * @param [options]
 * @constructor
 */
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
    this.rebuildCell();
}

CurrencyCell.prototype.buildContents = function() {
    var text = this.currency.toString();
    if( cellUtil.smallSize) {
        text = text.substring(0, text.lastIndexOf('.'));
    }
	return document.createTextNode(text);
};

CurrencyCell.prototype.toString = function() {
	return this.currency.toString();
}