dateRowUtil = {
	DATE_START_TEXT: "Reimbursed",
	DATE_STOP_TEXT: "Obligation Expired",
	onmouseover: function() {this.row.highlight(true, true);},
	onmouseout: function() {this.row.highlight(false, true);},
	add: function(date, duration, unit, amount) {
		var future = new Date(date);
		duration = Number(duration);
		switch (unit) {
			case "Days":
				future.setDate(this.stopDate.getDate() + duration);
				break;
			case "Months":
				future.setMonth(this.stopDate.getMonth() + duration);
				break;
			default:
				console.log("Failed to find time unit, defaulting to years");
			case "Years":
				future.setFullYear(this.stopDate.getFullYear() + duration);
				break;
		}

		rowUtil.add(new DateRow(date, amount));
		rowUtil.add(new DateRow(future, new Currency(amount)));
		rowUtil.updateOwed();
	}
};

DateRow.prototype = Object.create(Row.prototype);

function DateRow(date, amount) {
	Row.apply(this, [
		new DateCell(date),
		new CurrencyCell(amount),
		new CurrencyCell('0'),
		new TextCell(amount.start ? dateRowUtil.DATE_START_TEXT : dateRowUtil.DATE_STOP_TEXT),
		new ButtonCell()]);
	this.highlightClass = amount.start ? 'danger' : 'success';
};

DateRow.prototype.remove = function () {
	$([this.tr,this.pair.tr]).remove();
};

DateRow.prototype.highlight = function (enable, recursive) {
	if(enable) {
		$(this.tr).addClass(this.highlightClass);
	} else {
		$(this.tr).removeClass(this.highlightClass);
	}

	if( recursive) {
		this.pair.highlight(enable, false);
	}
};

DateRow.prototype.build = function () {
	var tr = Row.prototype.build.apply(this, []);
	tr.onmouseover = dateRowUtil.onmouseover;
	tr.onmouseout = dateRowUtil.onmouseout;
	return tr;
};

TodayRow.prototype.update = function(currency) {
	currency.add(this.amountCell.currency);
	this.owedCell.update(currency);
	return currency;
};