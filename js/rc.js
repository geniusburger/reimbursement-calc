
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

rc.storage = undefined;
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
rc.completeLoadDate = function() {
    $("#testButton").addClass("hidden");
    $("#clearButton").removeClass("hidden");
    rc.drawChart();
    // todo figure out how to do this without a random sleep
    setTimeout(rc.highlightPoints, 1000);
};

rc.updateNextExpiration = function(nextExpiration) {
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
};

rc.addDate = function(date, amount) {
	rc.loadDate(date, amount);
	rc.storage.setDates();
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
    // check if row is todayRow
    var todayIndex = todayRowUtil.row.tr.rowIndex-2;
    if( point.row === todayIndex) {
        rc.setChartSelection([
            {row: todayIndex, column: 1}
        ]);
        rc.colorPoints();
    } else {
        var rows = rowUtil.getRows();
        rows[point.row].row.highlight(true, true);
        rc.highlightPoints(rows[point.row].row);
    }
};

/**
 * Handles mouseout events for points on the chart. All rows will be unhighlighted.
 */
rc.unhoverPointHandler = function() {
    var rows = dateRowUtil.getStartRows();
	for( var i = 0; i < rows.length; i++) {
		rows[i].row.highlight(false, true);
	}
    rc.setChartSelection();
    rc.highlightPoints();
};

/**
 * Handles select events for points on the chart.
 * The last hovered point will be re-highlighted since any click will results in a deselection of a highlighted point.
 */
rc.selectPointHandler = function() {
    rc.hoverPointHandler(rc.lastPoint);
};

rc.highlightPoints = function(row) {

    var today = todayRowUtil.row;
    var todayIndex = today.tr.rowIndex - 2;
    if( typeof row === 'undefined' || row === null) {
        rc.setChartSelection([
            {row: todayIndex, column: 1}
        ]);
    } else {
        var start = row.isStart() ? row : row.matchingRow;
        var stop = start.matchingRow;

        // Subtract 2 from indexes to account for the header row and size row
        var startIndex = start.tr.rowIndex - 2;
        var stopIndex = stop.tr.rowIndex - 2;

        rc.setChartSelection([
            {row: startIndex, column: 1},
            {row: stopIndex, column: 1},
            {row: todayIndex, column: 1}
        ]);
    }

    rc.colorPoints(start, stop, today, startIndex, stopIndex, todayIndex)
};

rc.colorPoints = function(start, stop, today, startIndex, stopIndex, todayIndex) {

    if (!rc.TODAY_COLOR) {
        rc.TODAY_COLOR = $(today.tr).children('td').first().css('backgroundColor');
    }

    var selectedCircles = $("svg>g>g>g>circle");
    var circles = [];
    for (var i = 0; i < selectedCircles.length; i++) {
        circles.push(selectedCircles[i].outerHTML);
    }

    var first1 = 0;
    var first2 = 1;
    var middle1 = 2;
    var middle2 = 3;
    var last1 = 4;
    var last2 = 5;

    var start1;
    var start2;
    var stop1;
    var stop2;
    var today1;
    var today2;
    if (selectedCircles.length < 6) {
        // just today dot
        rc.setSelectedPointColor(selectedCircles[0], selectedCircles[selectedCircles.length - 1], rc.TODAY_COLOR);
        return;
    } else if( selectedCircles.length > 6) {
        // The mouse is hovering over a point so 3 extra circles are being drawn between the existing circles for the hovered point

        // Check if the first point is hovered, Red-Today-Green or Red-Green-Today, must be red
        if( selectedCircles[2].getAttribute("fill") == "none") {
            first2 += 3;
            middle1 += 3;
            middle2 += 3;
            last1 += 3;
            last2 += 3;
        }
        // Check if the middle point is hovered, Red-Green-Today or Today-Red-Green
        else if( selectedCircles[4].getAttribute("fill") == "none") {
            middle2 += 3;
            last1 += 3;
            last2 += 3;
        }
        // Check if the last point is hovered, Red-Today-Green or Today-Red-Green, must be green
        else if( selectedCircles[6].getAttribute("fill") == "none") {
            last2 += 3;
        }
    }

    // Adjust today/start/stop positions
    if( todayIndex < startIndex) {
        // Today-Start-Stop
        today1 = first1;
        today2 = first2;
        start1 = middle1;
        start2 = middle2;
        stop1 = last1;
        stop2 = last2;
    } else if( todayIndex < stopIndex) {
        // Start-Today-Stop
        start1 = first1;
        start2 = first2;
        today1 = middle1;
        today2 = middle2;
        stop1 = last1;
        stop2 = last2;
    } else {
        // Start-Stop-Today
        start1 = first1;
        start2 = first2;
        stop1 = middle1;
        stop2 = middle2;
        today1 = last1;
        today2 = last2;
    }

    if (!rc.START_COLOR) {
        rc.START_COLOR = $(start.tr).css('backgroundColor');
    }
    if (!rc.STOP_COLOR) {
        rc.STOP_COLOR = $(stop.tr).css('backgroundColor');
    }

    rc.setSelectedPointColor(selectedCircles[start1], selectedCircles[start2], rc.START_COLOR);
    rc.setSelectedPointColor(selectedCircles[stop1], selectedCircles[stop2], rc.STOP_COLOR);
    rc.setSelectedPointColor(selectedCircles[today1], selectedCircles[today2], rc.TODAY_COLOR);
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
		rc.storage.setDates();
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
    rc.storage.setTimeAmount(this.selectedOptions[0].value);
    rc.updateReimbursementTime();
};

rc.timeUnitChanged = function() {
    rc.storage.setTimeUnit(this.selectedOptions[0].value);
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
            console.error("Failed to populate time amounts from unit: " + unit);
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
        rc.$chart.css('visibility', 'hidden');
        console.error("Chart not ready");
    } else {
        if( !rc.chart) {
            rc.chart = new google.visualization.LineChart(document.getElementById('chart'));
            google.visualization.events.addListener(rc.chart, 'select', rc.selectPointHandler);
            google.visualization.events.addListener(rc.chart, 'onmouseover', rc.hoverPointHandler);
            google.visualization.events.addListener(rc.chart, 'onmouseout', rc.unhoverPointHandler);
        }
		var rows = rowUtil.getRows();
        if( rows.length <= 1) {
            rc.$chart.css('visibility', 'hidden');
        } else {
            rc.$chart.css('visibility', 'visible');
        }
        var todayDot = {
            previous : null,
            today : null
        };
        var data = [];
        data[0] = ['Date', 'Owed'];
        for( var i = 0; i < rows.length; i++) {
            if( rows[i].row instanceof TodayRow) {
                todayDot.today = rows[i].row;
            } else {
                if( todayDot.today) {
                    // insert todayDot, calculate value
                    var nextDate = rows[i].row;
                    var previousTime = todayDot.previous.dateCell.date.getTime();
                    var todayTime = todayDot.today.dateCell.date.getTime();
                    var nextTime = nextDate.dateCell.date.getTime();
                    var totalTime = nextTime - previousTime;

                    var fractionOfTime = (todayTime - previousTime) / totalTime;

                    var previousOwed = todayDot.previous.owedCell.currency.toFloat();
                    var nextOwed = nextDate.owedCell.currency.toFloat();
                    var todayOwed = previousOwed + (fractionOfTime * (nextOwed - previousOwed));

                    data.push(rc.buildDot(todayDot.today, todayOwed));
                    todayDot.today = null;
                }
                todayDot.previous = rows[i].row;
                data.push(rc.buildDot(todayDot.previous));
            }
        }
        if( todayDot.today) {
            // today is the last dot, insert it
            data.push(rc.buildDot(todayDot.today));
        }

        rc.chart.draw(google.visualization.arrayToDataTable(data), rc.CHART_OPTIONS);
    }
};

rc.buildDot = function(row, yValue) {
    var xValue = row.dateCell.date;
    var xFormatted = xValue.toString().split(' ')[1] + ' ' + xValue.getDate() + ', ' + xValue.getFullYear();
    yValue = yValue || row.owedCell.currency.toFloat();
    var yFormatted = row.owedCell.currency.toString();
    return [{v: xValue, f: xFormatted}, {v: yValue, f: yFormatted}];
};

rc.checkOverflow = function() {
    var colWidth = rc.$column.width();

    if( rc.lastColWidth !== colWidth) {
        rc.lastColWidth = colWidth;
        
        rc.$chart.css({
            width: colWidth + 'px',
            height: colWidth + 'px'
        });
        rc.drawChart();

        var needToSetSmall = rc.$table.width() > colWidth;
        if( !rc.widthWhenChangingSmallSize) {
            if(cellUtil.setSmallSize(needToSetSmall)) {
                rc.widthWhenChangingSmallSize = colWidth;
            }
        } else {
            if( colWidth != rc.widthWhenChangingSmallSize) {
                if(cellUtil.setSmallSize(needToSetSmall)) {
                    rc.widthWhenChangingSmallSize = colWidth;
                }
            }
        }
    }
};

//////////////////////////////////////////////////////////////////////////////////
////////     Setup
//////////////////////////////////////////////////////////////////////////////////

window.onload = function() {

	rc.storage = new StorageManager();

    var vm = new PageViewModel();
    ko.applyBindings(vm);
    vm.loadTestData();

    //$("#inputButton").on('click', null, rc.getInput);
    //$("#testButton").on('click', null, rc.loadTestData);
    //$("#clearButton").on('click', null, dateRowUtil.deleteAll);
    //$("#inputAmount").keypress(rc.enterCatch);
    //$("#inputDate").keypress(rc.enterCatch);
    //
    //rowUtil.table = document.getElementById('tableBody');
    //sizeRowUtil.add();
    //rc.$table = $('#dateTable');
    //rc.$column = rc.$table.parent();
    //rc.$chart = $('#chart');
    //rc.checkOverflow();
    //todayRowUtil.add();
    //
    //rc.populateTimeAmounts('Years', 2);
    //
    //var $timeUnit = $("#timeUnit");
    //
    //if (window.isRunningLocally()) {
    //    rc.loadTestData();
    //} else {
    //    if (rc.storage.displayCookieWarning) {
    //        $("#cookieAlert").removeClass("hidden");
    //    }
    //    var storedTimeAmount = rc.storage.getTimeAmount();
    //    var storedTimeUnit = rc.storage.getTimeUnit();
    //
    //    if (storedTimeAmount !== null && storedTimeUnit !== null && storedTimeAmount !== "" && storedTimeUnit !== "") {
	 //       $timeUnit.val(storedTimeUnit);
    //        rc.populateTimeAmounts(storedTimeUnit, storedTimeAmount);
    //    }
    //
	 //   rc.storage.getDates().forEach(function(date){rc.loadDate(date);});
    //}
    //
    //$("#timeAmount").on('change', null, rc.timeAmountChanged);
    //$timeUnit.on('change', null, rc.timeUnitChanged);
    //$(window).resize(rc.checkOverflow);
};
