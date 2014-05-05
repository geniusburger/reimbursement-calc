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
			todayRowUtil.row.fixWidth();
		}
	}
};

TodayRow.prototype = Object.create(Row.prototype);

function TodayRow() {
    Row.apply(this, [
	    'active today-row',
	    new BoldDateCell(new Date(), todayRowUtil.TODAY_TEXT),
	    new InvisibleTextCell('$00,000.00'),
	    new BoldCurrencyCell(new Currency('0')),
	    new InvisibleTextCell(dateRowUtil.DATE_START_TEXT.length > dateRowUtil.DATE_STOP_TEXT.length ? dateRowUtil.DATE_START_TEXT : dateRowUtil.DATE_STOP_TEXT),
	    new ButtonCell(true)]);
}

TodayRow.prototype.update = function(currency) {
	this.owedCell.update(currency);
	return currency;
};

TodayRow.prototype.fixWidth = function() {
	var newWidth = this.amountCell.td.offsetWidth + 'px';
	this.owedCell.td.style.minWidth = newWidth;

	newWidth = this.typeCell.td.offsetWidth + 'px';
	this.dateCell.td.style.minWidth = newWidth;
};