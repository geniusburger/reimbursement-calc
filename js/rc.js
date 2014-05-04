
//////////////////////////////////////////////////////////////////////////////////
////////     Reimbursement Calc
//////////////////////////////////////////////////////////////////////////////////

var rc = {};

//////////////////////////////////////////////////////////////////////////////////
////////     Constants
//////////////////////////////////////////////////////////////////////////////////

rc.DARK = '#272b30';
rc.MID = '#2e3338';
rc.LIGHT = '#49515a';

rc.LINE = '#3366cc';
rc.TEXT = '#c8c8c8';
rc.BACKGROUND = rc.DARK;
rc.GRID = rc.LIGHT;

rc.CHART_OPTIONS = {
    pointSize: 6,
    backgroundColor: rc.BACKGROUND,
    selectionMode: 'multiple',
    animation: {
        duration: 1000
    },
    series: {
        color: rc.LINE
    },
    tooltip: {
        textStyle: {
            color: rc.TEXT
        }
    },
    hAxis: {
        titleTextStyle: {
            color: rc.TEXT
        },
        textStyle: {
            color: rc.TEXT
        },
        baselineColor: rc.GRID, 
        gridlines: {
            color: 'transparent'
        }
    },
    vAxis: {
        format: '$#,###',
        titleTextStyle: {
            color: rc.TEXT
        },
        textStyle: {
            color: rc.TEXT
        },
        baselineColor: rc.GRID, 
        gridlines: {
            color: rc.GRID
        }
    },
    legend: {
        position: 'none'
    }
};

//////////////////////////////////////////////////////////////////////////////////
////////     Variables
//////////////////////////////////////////////////////////////////////////////////

rc.chartData = [];

rc.chart = undefined;

//////////////////////////////////////////////////////////////////////////////////
////////     Functions
//////////////////////////////////////////////////////////////////////////////////

rc.addDate = function(date, amount) {
    dateRowUtil.add(date, rc.getSelectedTimeAmount(), rc.getSelectedTimeUnit(), amount);
	$("#testButton").addClass("hidden");
	$("#clearButton").removeClass("hidden");
};

rc.clearDates = function(doNotSave) {
	var trs = dateRowUtil.getStartRows();
	for( var i = 0; i < trs.length; i++) {
		trs[i].row.remove();
	}
	if( !doNotSave) {
		rc.saveDates();
	}
};

rc.loadDatesFromCookie = function(cookie) {
	if( typeof cookie === 'undefined') {
		cookie = util.getCookie('dates');
	}

	if (cookie !== null && cookie !== "") {
		var dates = cookie.split(":");
		for (var i = 0; i < dates.length; i++) {
			var values = dates[i].split("@");
			rc.addDate(new Date(values[1]), new Currency(values[0]));
		}
	}
};

/**
 * Load example/test data.
 */
rc.loadTestData = function() {
    [["7/6/2012", "$7802.05"],
    ["2/1/2013", "$6931.49"],
    ["4/12/2013", "$7568.49"],
    ["1/6/2012", "$3802.00"],
    ["4/13/2012", "$3658.51"],
    ["12/21/2012", "$775.00"],
    ["6/28/2013", "$4350.00"]]
	.forEach(function(date){
		rc.addDate(new Date(date[0]), new Currency(date[1]));
	});

	rc.saveDates();
};

rc.saveDates = function() {
	util.setCookie('dates', dateRowUtil.getCookieString());
};

rc.getSelectedTimeAmount = function() {
    return util.getSelected('timeAmount');
};

rc.getSelectedTimeUnit = function() {
    return util.getSelected('timeUnit');
};

/**
 * Handles mouseover events for points on the chart.
 * The matching event pair rows will be highlighted.
 * @param  {Object} point Represents the point being hovered. Has attributes row and column.
 */
rc.hoverPointHandler = function(point) {
    rc.lastPoint = point;
    rc.highlightRows(rc.reimbursementEvents[point.row].index);
};

/**
 * Handles mouseout events for points on the chart. All rows will be unhighlighted.
 */
rc.unhoverPointHandler = function() {
    rc.unhighlightRows();
};

/**
 * Handles select events for points on the chart.
 * The last hovered point will be rehighlighted since any click will results in a deselection of a highlighted point.
 */
rc.selectPointHandler = function() {
    rc.highlightRows(rc.reimbursementEvents[rc.lastPoint.row].index);
};

/**
 * Highlights the table rows for the pair of events relating to the specified Reimbursement.
 * @param  {number} dateIndex Index of the Reimbursement to highlight events for.
 */
rc.highlightPoints = function(row) {

	var start = row.isStart() ? row : row.matchingRow;
	var stop = start.matchingRow;

	// Subtract 1 from indexes to account for the header row
	var startIndex = start.tr.rowIndex-1;
	var stopIndex = stop.tr.rowIndex-1;
	var todayIndex = todayRowUtil.row.tr.rowIndex-1;

	// Skip today row
	if( startIndex > todayIndex) {
		startIndex--;
		if( stopIndex > todayIndex) {
			stopIndex--;
		}
	}

	if( !rc.START_COLOR) {
		rc.START_COLOR = start.style.backgroundColor;
	}
	if( !rc.STOP_COLOR) {
		rc.STOP_COLOR = stop.style.backgroundColor;
	}

    rc.chart.setSelection([
	    {row: startIndex, column: 1},
	    {row: stopIndex, column: 1}]);

    var selectedCircles = $("svg>g>g>g>circle");
    var d = [];
    for( var i = 0; i < selectedCircles.length; i++) {
        d.push(selectedCircles[i].outerHTML);
    }
    var red1 = 0;
    var red2 = 1;
    var green1 = 2;
    var green2 = 3;
    if( selectedCircles.length > 4) {
        // The use is hovering over a point so extra circles are being drawn
        if( selectedCircles[4].getAttribute("stroke") == "none") {
            // The first of a pair (the red one) of points was hovered
            red2 = 4;
            green1 = 5;
        }
        green2 = 6;
    }
    rc.setSelectedPointColor(selectedCircles[red1], selectedCircles[red2], rc.START_COLOR);
    rc.setSelectedPointColor(selectedCircles[green1], selectedCircles[green2], rc.STOP_COLOR);
};

rc.setSelectedPointColor = function(outerCircle, innerCircle, color) {
    $(outerCircle).attr("stroke", color);
    $(innerCircle).attr("fill", color);
};

rc.enterCatch = function(e) {
    if (e.keyCode == 13) {
        rc.getInput();
    }
};

rc.getInput = function() {
    $("#inputButton").blur();
    var dateInput = $("#inputDate");
    var amountInput = $("#inputAmount");
	var date = new Date(dateInput.val());
    var amount = new Currency(amountInput.val());
	var valid = true;

    if (!amount.valid) {
	    valid = false;
	    amountInput.parent().addClass("has-error");
	    amountInput.focus();
    } else {
	    amountInput.parent().removeClass("has-error");
    }

    if (util.isInvalidDate(date)) {
	    valid = false;
	    dateInput.parent().addClass("has-error");
	    dateInput.focus();
    } else {
	    dateInput.parent().removeClass("has-error");
    }

	if (valid) {
		dateInput.val("");
		amountInput.val("");
		rc.addDate(date, amount);
		rc.saveDates();
		dateInput.focus();
	}
    return false;
}

rc.updateReimbursementTime = function() {
    var dates = dateRowUtil.getCookieString();
	rc.clearDates(true);
	rc.loadDatesFromCookie(dates);
}

rc.timeAmountChanged = function() {
    util.setCookie("timeAmount", this.selectedOptions[0].value);
    rc.updateReimbursementTime();
};

rc.timeUnitChanged = function() {
    util.setCookie("timeUnit", this.selectedOptions[0].value);
    rc.updateReimbursementTime();
};

rc.populateTimeAmounts = function(unit, amount) {
    switch (unit) {
        case "Days":
            var max = 30;
            break;
        case "Months":
            var max = 12;
            break;
        case "Years":
            var max = 20;
            break;
        default:
            console.log("Failed to populate time amounts from unit: " + unit);
            return;
    }

    var timeAmount = document.getElementById("timeAmount");
    util.removeChildren(timeAmount);
    for (var i = 1; i <= max; i++) {
        var option = document.createElement("option");
        option.innerHTML = i;
        timeAmount.appendChild(option);
    }

    if (amount > max) {
        amount = max;
    }

    timeAmount.options[amount - 1].selected = true;
};

rc.drawChart = function() {

    if( !chartIsReady) {
        $("#chart").addClass("hidden");
        console.error("Chart not ready");
    } else {
        if( !rc.chart) {
            rc.chart = new google.visualization.LineChart(document.getElementById('chart'));
            google.visualization.events.addListener(rc.chart, 'select', rc.selectPointHandler);
            google.visualization.events.addListener(rc.chart, 'onmouseover', rc.hoverPointHandler);
            google.visualization.events.addListener(rc.chart, 'onmouseout', rc.unhoverPointHandler);
        }
		var rows = dateRowUtil.getDateRows();
        if( rows.length === 0) {
            $("#chart").addClass("hidden");
        } else {
            $("#chart").removeClass("hidden");
            rc.chartData = [];
            rc.chartData[0] = ['Date', 'Owed'];
            for( var i = 0; i < rows.length; i++) {
                rc.chartData[i+1] = [rows[i].row.dateCell.date,
                    {v: rows[i].row.toFloat(), f: rows[i].row.toString()}];
            }
            var data = google.visualization.arrayToDataTable(rc.chartData);

            rc.chart.draw(data, rc.CHART_OPTIONS);
        }
    }

	rc.drawChart();
};

//////////////////////////////////////////////////////////////////////////////////
////////     Setup
//////////////////////////////////////////////////////////////////////////////////

window.onload = function() {

    $("#inputButton").on('click', null, rc.getInput);
    $("#testButton").on('click', null, rc.loadTestData);
    $("#clearButton").on('click', null, rc.clearDates);
    $("#inputAmount").keypress(rc.enterCatch);
    $("#inputDate").keypress(rc.enterCatch);

	rowUtil.table = document.getElementById('tableBody');
	todayRowUtil.add();

    rc.populateTimeAmounts('Years', 2);

    if (window.isRunningLocally()) {
	    console.log('loading');
        rc.loadTestData();
    } else {
        if (navigator.cookieEnabled !== true) {
            $("#cookieAlert").removeClass("hidden");
        }
        var timeAmountCookie = util.getCookie("timeAmount");
        var timeUnitCookie = util.getCookie("timeUnit");

        if (timeAmountCookie !== null && timeUnitCookie !== null && timeAmountCookie !== "" && timeUnitCookie !== "") {
            $("#timeUnit").val(timeUnitCookie);
            rc.populateTimeAmounts(timeUnitCookie, timeAmountCookie);
        }

		rc.loadDatesFromCookie();
    }

    $("#timeAmount").on('change', null, rc.timeAmountChanged);
    $("#timeUnit").on('change', null, rc.timeUnitChanged);
};
