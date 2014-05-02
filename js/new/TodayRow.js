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
	    new InvisibleTextCell('$00,000.00'),
	    new BoldCurrencyCell(new Currency('0')),
	    new InvisibleTextCell(dateRowUtil.DATE_START_TEXT.length > dateRowUtil.DATE_STOP_TEXT.length ? dateRowUtil.DATE_START_TEXT : dateRowUtil.DATE_STOP_TEXT),
	    new InvisibleTextCell(' ')]);
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