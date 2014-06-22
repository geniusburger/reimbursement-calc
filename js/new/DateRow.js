dateRowUtil = {
	DATE_START_TEXT: "Reimbursed",
	DATE_STOP_TEXT: "Obligation Expired",
	onMouseOver: function() {this.row.highlight(true, true); rc.highlightPoints(this.row);},
	onMouseOut: function() {this.row.highlight(false, true); rc.setChartSelection(); rc.highlightPoints();},
	add: function(date, duration, unit, amount, callback) {
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
                // fall-through
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
        window.setTimeout(function() {
            var divs = $([startRow.tr, stopRow.tr]).find('td>div');
            divs.on('transitionend', dateRowUtil.removeAnimationClass);
            divs.addClass('animateIn in');
            rowUtil.updateOwed();
            callback();
        }, 0);
	},
	getDateRows: function(){return util.toArray(document.querySelectorAll('#tableBody tr.date-row.exists'));},
	getStartRows: function(){return util.toArray(document.querySelectorAll('#tableBody tr.date-row.exists.start'));},
	removeAll: function() {
		var trs = dateRowUtil.getStartRows();
		for( var i = 0; i < trs.length; i++) {
			trs[i].row.remove();
		}
	},
	deleteAll: function() {
		var trs = dateRowUtil.getStartRows();
		for( var i = 0; i < trs.length; i++) {
			trs[i].row.remove();
		}
		rc.cookies.setDates();
	},
    removeAfterAnimation: function() {
        $(this).parents('tr').remove();
    },
    removeAnimationClass: function() {
        $(this).removeClass('animateIn');
    }
};

DateRow.prototype = Object.create(Row.prototype);

function DateRow(date, amount, start) {
	Row.apply(this, [
		'exists date-row ' + (start ? 'start' : 'stop'),
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

/**
 * Removes a row pair and redraws the chart without saving dates.
 */
DateRow.prototype.remove = function () {
    var rows = $([this.tr,this.matchingRow.tr]);
    this.tr.onmouseover = null;
    this.tr.onmouseout = null;
    this.matchingRow.tr.onmouseover = null;
    this.matchingRow.tr.onmouseout = null;
    rows.removeClass('exists highlight');
    window.setTimeout(function() {
        var divs = rows.find('td>div');
        var firstDivs = rows.find('td:first-child>div');
        firstDivs.on('transitionend', dateRowUtil.removeAfterAnimation);
        divs.addClass('animateOut');
        divs.removeClass('animateIn in');
        if (dateRowUtil.getDateRows().length === 0) {
            $("#testButton").removeClass("hidden");
            $("#clearButton").addClass("hidden");
        }
        rowUtil.updateOwed();
        rc.drawChart();
    }, 0);
};

/**
 * Removes a row pair, redraws the chart, and saves dates.
 */
DateRow.prototype.delete = function() {
	this.remove();
	rc.cookies.setDates();
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