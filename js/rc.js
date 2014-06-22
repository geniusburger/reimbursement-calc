
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
        duration: 300
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

rc.cookies = undefined;
rc.chart = undefined;

//////////////////////////////////////////////////////////////////////////////////
////////     Functions
//////////////////////////////////////////////////////////////////////////////////

rc.loadDate = function(date, amount) {
	if(date instanceof Array && date.length === 2) {
		amount = new Currency(date[0]);
		date = new Date(date[1]);
	}
    dateRowUtil.add(date, rc.getSelectedTimeAmount(), rc.getSelectedTimeUnit(), amount, rc.completeLoadDate);
};

/**
 * @nextExpiration {Object|null} days Number of days until the next reimbursement expiration
 */
rc.completeLoadDate = function(nextExpiration) {
    $("#testButton").addClass("hidden");
    $("#clearButton").removeClass("hidden");
    var nextEvent = document.getElementById('nextEvent');
    if( nextExpiration === null) {
        nextEvent.style.visibility = 'hidden';
    } else {
        nextEvent.style.visibility = 'visible';
        document.getElementById('daysLeft').innerHTML = nextExpiration.days;
        var textDiv = document.querySelector('#nextEvent>div');
        textDiv.onmouseover = function() {
            rc.hoverPointHandler(nextExpiration);
        };
        textDiv.onmouseout = function() {
            rc.unhoverPointHandler();
        }
    }
    rc.drawChart();
};

rc.addDate = function(date, amount) {
	rc.loadDate(date, amount);
	rc.cookies.setDates();
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

	rc.drawChart();
};

/**
 * Load example/test data.
 */
rc.loadTestData = function() {
    [
        ["$7802.05", "7/6/2012"],
        ["$6931.49", "2/1/2013"],
        ["$7568.49", "4/12/2013"],
        ["$3802.00", "1/6/2012"],
        ["$3658.51", "4/13/2012"],
        ["$775.00", "12/21/2012"],
        ["$4350.00", "6/28/2013"]
	].forEach(function(date){
		rc.addDate(date);
	});
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
	var rows = dateRowUtil.getDateRows();
	rows[point.row].row.highlight(true, true);
	rc.highlightPoints(rows[point.row].row);
};

/**
 * Handles mouseout events for points on the chart. All rows will be unhighlighted.
 */
rc.unhoverPointHandler = function() {
    var rows = dateRowUtil.getStartRows();
	for( var i = 0; i < rows.length; i++) {
		rows[i].row.highlight(false, true);
	}
	rc.chart.setSelection();
};

/**
 * Handles select events for points on the chart.
 * The last hovered point will be rehighlighted since any click will results in a deselection of a highlighted point.
 */
rc.selectPointHandler = function() {
	var rows = dateRowUtil.getDateRows();
	rows[rc.lastPoint.row].row.highlight(true, true);
	rc.highlightPoints(rows[rc.lastPoint.row].row);
};

rc.highlightPoints = function(row) {

	var start = row.isStart() ? row : row.matchingRow;
	var stop = start.matchingRow;

	// Subtract 2 from indexes to account for the header row and size row
	var startIndex = start.tr.rowIndex-2;
	var stopIndex = stop.tr.rowIndex-2;
	var todayIndex = todayRowUtil.row.tr.rowIndex-2;

	// Skip today row
	if( stopIndex > todayIndex) {
		stopIndex--;
		if( startIndex > todayIndex) {
			startIndex--;
		}
	}

	if( !rc.START_COLOR) {
		rc.START_COLOR = $(start.tr).css('backgroundColor');
	}
	if( !rc.STOP_COLOR) {
		rc.STOP_COLOR = $(stop.tr).css('backgroundColor');
	}

    rc.setChartSelection([
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

rc.setChartSelection = function(selection) {
	try {
		rc.chart.setSelection(selection);
	} catch (e) {
		console.warn("Oddity setting selection", e);
	}
};

rc.clearChartSelection = function() {
	rc.setChartSelection();
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
		rc.cookies.setDates();
		rc.drawChart();
		dateInput.focus();
	}
    return false;
};

rc.updateReimbursementTime = function() {
    var dates = [];
	dateRowUtil.getStartRows().forEach(function(tr){
		dates.push([
			tr.row.amountCell.toString(),
			tr.row.dateCell.toString()]);
	});
	dateRowUtil.removeAll();
	dates.forEach(function(date){rc.loadDate(date);});
};

rc.timeAmountChanged = function() {
    util.setCookie("timeAmount", this.selectedOptions[0].value);
    rc.updateReimbursementTime();
};

rc.timeUnitChanged = function() {
    util.setCookie("timeUnit", this.selectedOptions[0].value);
    rc.updateReimbursementTime();
};

rc.populateTimeAmounts = function(unit, amount) {
	var max = 0;
    switch (unit) {
        case "Days":
            max = 30;
            break;
        case "Months":
            max = 12;
            break;
        case "Years":
            max = 20;
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
        $("#chart").css('visibility', 'hidden');
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
            $("#chart").css('visibility', 'hidden');
        } else {
	        $("#chart").css('visibility', 'visible');
        }
        var data = [];
        data[0] = ['Date', 'Owed'];
        for( var i = 0; i < rows.length; i++) {
            data[i+1] = [rows[i].row.dateCell.date,
                {v: rows[i].row.owedCell.currency.toFloat(), f: rows[i].row.owedCell.currency.toString()}];
        }
        rc.chart.draw(google.visualization.arrayToDataTable(data), rc.CHART_OPTIONS);
    }
};

//////////////////////////////////////////////////////////////////////////////////
////////     Setup
//////////////////////////////////////////////////////////////////////////////////

window.onload = function() {

	rc.cookies = new CookieManager();

    $("#inputButton").on('click', null, rc.getInput);
    $("#testButton").on('click', null, rc.loadTestData);
    $("#clearButton").on('click', null, dateRowUtil.deleteAll);
    $("#inputAmount").keypress(rc.enterCatch);
    $("#inputDate").keypress(rc.enterCatch);

	rowUtil.table = document.getElementById('tableBody');
	sizeRowUtil.add();
	todayRowUtil.add();

    rc.populateTimeAmounts('Years', 2);

	var $timeUnit = $("#timeUnit");

    if (window.isRunningLocally()) {
	    console.log('loading');
        rc.loadTestData();
    } else {
        if (navigator.cookieEnabled !== true) {
            $("#cookieAlert").removeClass("hidden");
        }
        var timeAmountCookie = rc.cookies.getCookie("timeAmount");
        var timeUnitCookie = rc.cookies.getCookie("timeUnit");

        if (timeAmountCookie !== null && timeUnitCookie !== null && timeAmountCookie !== "" && timeUnitCookie !== "") {
	        $timeUnit.val(timeUnitCookie);
            rc.populateTimeAmounts(timeUnitCookie, timeAmountCookie);
        }

	    rc.cookies.getDates().forEach(function(date){rc.loadDate(date);});
    }

    $("#timeAmount").on('change', null, rc.timeAmountChanged);
	$timeUnit.on('change', null, rc.timeUnitChanged);
};
