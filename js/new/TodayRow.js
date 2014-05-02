todayRowUtil = {
	TODAY_TEXT: 'Today',
	exists: false,
	add: function() {
		if( !todayRowUtil.exists) {
			rowUtil.add(new TodayRow());
			rowUtil.updateOwed();
			todayRowUtil.exists = true;
		}
	}
};

TodayRow.prototype = Object.create(Row.prototype);

function TodayRow() {
    Row.apply(this, [
	    new BoldDateCell(new Date(), todayRowUtil.TODAY_TEXT),
	    new InvisibleTextCell('$00,000.00'),
	    new BoldCurrencyCell(new Currency('0')),
	    new InvisibleTextCell(dateRowUtil.DATE_START_TEXT.length > dateRowUtil.DATE_STOP_TEXT.length ? dateRowUtil.DATE_START_TEXT : dateRowUtil.DATE_STOP_TEXT),
	    new ButtonCell(true)]);
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

TodayRow.prototype.fixWidth = function() {
	var newWidth = this.amountCell.td.offsetWidth + 'px';
	console.log('newWidth', newWidth);
	this.owedCell.td.style.minWidth = newWidth;

	newWidth = this.typeCell.td.offsetWidth + 'px';
	console.log('newWidth', newWidth);
	this.dateCell.td.style.minWidth = newWidth;
};