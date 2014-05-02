
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

rc.selection = [];

//////////////////////////////////////////////////////////////////////////////////
////////     Functions
//////////////////////////////////////////////////////////////////////////////////

rc.addDate = function(r) {
    if (r.isValid()) {
        dateRowUtil.add(r.startDate, rc.getSelectedTimeAmount(), rc.getSelectedTimeUnit(), new Currency(r.amountString));
	    //todo save dates as cookies: util.setCookie("dates", cookie);
    }
    return r.isValid();
};

rc.clearDates = function() {
	rowUtil.getRows().forEach(function(row){
		if( row.isStart()) {
			row.remove();
		}
	});
};

/**
 * Load example/test data.
 */
rc.loadTestData = function() {
    rc.addDate(new Reimbursement("7/6/2012", "7802.05"));
    rc.addDate(new Reimbursement("2/1/2013", "6931.49"));
    rc.addDate(new Reimbursement("4/12/2013", "7568.49"));
    rc.addDate(new Reimbursement("1/6/2012", "3802.00"));
    rc.addDate(new Reimbursement("4/13/2012", "3658.51"));
    rc.addDate(new Reimbursement("12/21/2012", "775.00"));
    rc.addDate(new Reimbursement("6/28/2013", "4350.00"));
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
rc.highlightPoints = function(dateIndex) {
    //todo this used to where rows to be highlighted where calculated, then variables from there would be used tohighlight points

    rc.chart.setSelection(rc.selection);
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
    rc.setSelectedPointColor(selectedCircles[red1], selectedCircles[red2], rc.RED);
    rc.setSelectedPointColor(selectedCircles[green1], selectedCircles[green2], rc.GREEN);
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
    var date = $("#inputDate");
    var amount = $("#inputAmount");
    var r = new Reimbursement(date.val(), amount.val());

    if (rc.addDate(r) === true) {
        date.val("");
        amount.val("");
        rc.processReimbursements();
        date.focus();
    }

    if (r.isInvalidAmount()) {
        amount.parent().addClass("has-error");
        amount.focus();
    } else {
        amount.parent().removeClass("has-error");
    }

    if (r.isInvalidDate()) {
        date.parent().addClass("has-error");
        date.focus();
    } else {
        date.parent().removeClass("has-error");
    }
    return false;
}

rc.updateReimbursementTime = function() {
    for (var i = 0; i < rc.reimbursements.length; i++) {
        var old = rc.reimbursements[i];
        rc.reimbursements[i] = new Reimbursement(old.startDate, old.amountString);
    }
}

rc.timeAmountChanged = function() {
	//todo handle time amount changed
//    util.setCookie("timeAmount", this.selectedOptions[0].value);
//    rc.updateReimbursementTime();
//    rc.processReimbursements();
};

rc.timeUnitChanged = function() {
	//todo handle time unit changed
//    var unit = this.selectedOptions[0].value;
//    util.setCookie("timeUnit", unit);
//    rc.populateTimeAmounts(unit, rc.getSelectedTimeAmount());
//    rc.updateReimbursementTime();
//    rc.processReimbursements();
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

        if( rc.reimbursementEvents.length === 0) {
            $("#chart").addClass("hidden");
        } else {
            $("#chart").removeClass("hidden");
            rc.chartData = [];
            rc.chartData[0] = ['Date', 'Owed'];
            for( var i = 0; i < rc.reimbursementEvents.length; i++) {
                rc.chartData[i+1] = [rc.reimbursementEvents[i].getDate(),
                    {v: rc.runningAmount[i]/100, f: new CurrencyCell(rc.runningAmount[i]).toString() }];
            }
            var data = google.visualization.arrayToDataTable(rc.chartData);

            rc.chart.draw(data, rc.CHART_OPTIONS);
        }
    }
};

//////////////////////////////////////////////////////////////////////////////////
////////     Setup
//////////////////////////////////////////////////////////////////////////////////

window.onload = function() {

//    $("#inputButton").on('click', null, rc.getInput);
    $("#testButton").on('click', null, rc.loadTestData);
    $("#clearButton").on('click', null, rc.clearDates);
//    $("#inputAmount").keypress(rc.enterCatch);
//    $("#inputDate").keypress(rc.enterCatch);

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

        var datesCookie = util.getCookie("dates");
        if (datesCookie !== null && datesCookie !== "") {
            var dates = datesCookie.split(":");
            for (var i = 0; i < dates.length; i++) {
                var values = dates[i].split("@");
                rc.addDate(new Reimbursement(values[1], values[0]));
            }
        }
    }

    $("#timeAmount").on('change', null, rc.timeAmountChanged);
    $("#timeUnit").on('change', null, rc.timeUnitChanged);
};
