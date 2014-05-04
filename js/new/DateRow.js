dateRowUtil = {
	DATE_START_TEXT: "Reimbursed",
	DATE_STOP_TEXT: "Obligation Expired",
	onMouseOver: function() {this.row.highlight(true, true); rc.highlightPoints(this.row);},
	onMouseOut: function() {this.row.highlight(false, true); rc.chart.setSelection();},
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

		var startRow = new DateRow(date, amount, true);
		var stopRow = new DateRow(future, new Currency(amount), false);

		startRow.pair(stopRow);
		stopRow.pair(startRow);

		rowUtil.add(startRow);
		rowUtil.add(stopRow);
		rowUtil.updateOwed();
	},
	getDateRows: function(){return document.querySelectorAll('#tableBody tr.date-row');},
	getStartRows: function(){return document.querySelectorAll('#tableBody tr.date-row.start')},
	getCookieString: function() {
		var datesCookie = '';
		var rows = dateRowUtil.getStartRows();
		for( var i = 0; i < rows.length; i++) {
			var row = rows[i].row;
			if (i > 0) {
				datesCookie += ':';
			}
			datesCookie += row.amountCell.toString() + '@' + row.dateCell.toString();
		}
		return datesCookie;
	}
};

DateRow.prototype = Object.create(Row.prototype);

function DateRow(date, amount, start) {
	Row.apply(this, [
		'date-row ' + (start ? 'start' : 'stop'),
		new DateCell(date),
		new CurrencyCell(amount),
		new CurrencyCell('0'),
		new TextCell(amount.start ? dateRowUtil.DATE_START_TEXT : dateRowUtil.DATE_STOP_TEXT),
		new ButtonCell()]);
	this.matchingRow = undefined;
	this.amountCell.currency.start = start;
}

DateRow.prototype.pair = function(matchingRow) {
	this.matchingRow = matchingRow;
};

DateRow.prototype.remove = function () {
	$([this.tr,this.matchingRow.tr]).remove();
	rowUtil.updateOwed();
	rc.saveDates();
	if( rowUtil.getRows().length < 2) {
		$("#testButton").removeClass("hidden");
		$("#clearButton").addClass("hidden");
	}
};

DateRow.prototype.highlight = function (enable, recursive) {
	if(enable) {
		$(this.tr).addClass('highlight');
	} else {
		$(this.tr).removeClass('highlight');
	}

	if( recursive) {
		this.matchingRow.highlight(enable, false);
	}
};

DateRow.prototype.build = function () {
	var tr = Row.prototype.build.apply(this, []);
	tr.onmouseover = dateRowUtil.onMouseOver;
	tr.onmouseout = dateRowUtil.onMouseOut;
	return tr;
};

DateRow.prototype.update = function(currency) {
	currency.adjust(this.amountCell.currency);
	this.owedCell.update(currency);
	return currency;
};