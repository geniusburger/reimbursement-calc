todayRowUtil = {
	TODAY_TEXT: 'Today',
	exists: false,
	row: undefined,
	add: function() {
		if( !todayRowUtil.exists) {
			todayRowUtil.row = new TodayRow();
			rowUtil.add(todayRowUtil.row);
			rowUtil.updateOwed();
			todayRowUtil.exists = true;
		}
	}
};

TodayRow.prototype = Object.create(Row.prototype);

function TodayRow() {
    Row.apply(this, [
	    'exists active today-row',
	    new DateCell(new Date(), {bold: true, alternateText: todayRowUtil.TODAY_TEXT}),
	    new TextCell(''),
	    new CurrencyCell(new Currency('0'), {bold: true}),
	    new TextCell(''),
	    new TextCell('')]);
}

TodayRow.prototype.update = function(currency) {
	this.owedCell.update(currency);
	return currency;
};