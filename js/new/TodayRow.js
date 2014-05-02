todayRowUtil = {
	TODAY_TEXT: 'Today',
	exists: false,
	add: function() {
		rowUtil.add(new TodayRow());
		rowUtil.updateOwed();
	}
};

TodayRow.prototype = Object.create(Row.prototype);

function TodayRow() {
    Row.apply(this, [
	    new BoldDateCell(new Date(), todayRowUtil.TODAY_TEXT),
	    new TextCell(''),
	    new BoldCurrencyCell(new Currency('0')),
	    new TextCell(''),
	    new TextCell('')]);
}

TodayRow.prototype.build = function() {
    var tr = Row.prototype.build.apply(this, []);
    tr.className = 'active';
    return tr;
};

TodayRow.prototype.update = function(currency) {
	this.owedCell.update(currency);
	return currency;
};