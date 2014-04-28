
CurrencyCell.prototype = new Cell();

function CurrencyCell(cents, useThousandsSeparators) {
	Cell.apply(this, ['text-right']);
	this.cents = cents;
	this.useThousandsSeparators = useThousandsSeparators;
	if( typeof useThousandsSeparators === 'undefined') {
		this.useThousandsSeparators = true;
	}
}

CurrencyCell.prototype.buildContents = function() {
	return document.createTextNode(this.toString());
};

CurrencyCell.prototype.toString = function() {
    var cents = (this.cents % 100);
    var dollars = parseInt(this.cents / 100);
    if( this.useThousandsSeparators) {
        dollars = dollars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");	// add thousands separators
    }
    return '$' + dollars + '.' + (cents < 10 ? '0' : '') + cents;
};