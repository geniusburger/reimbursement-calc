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
				future.setDate(future.getDate() + duration);
				break;
			case "Months":
				future.setMonth(future.getMonth() + duration);
				break;
			default:
				console.log("Failed to find time unit, defaulting to years");
			case "Years":
				future.setFullYear(future.getFullYear() + duration);
				break;
		}

		var startRow = new DateRow(date, amount);
		var stopRow = new DateRow(future, new Currency(amount));

		startRow.pair(stopRow, true);
		stopRow.pair(startRow, false);

		rowUtil.add(startRow);
		rowUtil.add(stopRow);
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
	this.matchingRow = undefined;
};

DateRow.prototype.pair = function(matchingRow, start) {
	this.matchingRow = matchingRow;
	this.amountCell.currency.start = start;
};

DateRow.prototype.remove = function () {
	$([this.tr,this.matchingRow.tr]).remove();
};

DateRow.prototype.highlight = function (enable, recursive) {
	if(enable) {
		$(this.tr).addClass(this.highlightClass);
	} else {
		$(this.tr).removeClass(this.highlightClass);
	}

	if( recursive) {
		this.matchingRow.highlight(enable, false);
	}
};

DateRow.prototype.build = function () {
	var tr = Row.prototype.build.apply(this, []);
	tr.onmouseover = dateRowUtil.onmouseover;
	tr.onmouseout = dateRowUtil.onmouseout;
	return tr;
};

DateRow.prototype.update = function(currency) {
	currency.adjust(this.amountCell.currency);
	this.owedCell.update(currency);
	return currency;
};