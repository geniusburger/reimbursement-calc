
//////////////////////////////////////////////////////////////////////////////////
////////     Reimbursement Calc
//////////////////////////////////////////////////////////////////////////////////

var rc = {};

//////////////////////////////////////////////////////////////////////////////////
////////     Constants
//////////////////////////////////////////////////////////////////////////////////

rc.DATE_START_TEXT = "Reimbursed";
rc.DATE_STOP_TEXT = "Obligation Expired";
rc.TODAY_TEXT = "Today";

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

/**
 * All of the reimbursements that have been added.
 * @type {Reimbursement[]}
 */
rc.reimbursements = [];

/**
 * All of the individual reimbursement events, this includes reimbursements and obligation expirations.
 * @type {ReimbursementEvent[]}
 */
rc.reimbursementEvents = [];

/**
 * The running total to display for each reimbursement event.
 * @type {number[]}
 */
rc.runningAmount = [];

rc.chartData = [];

rc.chart = undefined;

rc.selection = [];

//////////////////////////////////////////////////////////////////////////////////
////////     Functions
//////////////////////////////////////////////////////////////////////////////////

rc.addDate = function(date) {
    if (date.isValid()) {
        rc.reimbursements[rc.reimbursements.length] = date;
    }
    return date.isValid();
};

rc.removeDate = function() {
    rc.removeAt(this.dateIndex);
}

rc.removeAt = function(index) {
    rc.reimbursements.splice(index, 1);
    rc.processReimbursements();
};

rc.clearDates = function() {
    rc.reimbursements = [];
    rc.processReimbursements();
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

    rc.processReimbursements();
};

rc.getSelectedTimeAmount = function() {
    return rc.getSelected('timeAmount');
};

rc.getSelectedTimeUnit = function() {
    return rc.getSelected('timeUnit');
};

rc.getSelected = function(id) {
    return document.getElementById(id).selectedOptions[0].value
};

rc.sortByDate = function(a, b) {
    return a.getDate() - b.getDate();
};

rc.processReimbursements = function() {
    var cookie = null;
    rc.reimbursementEvents = [];
    rc.runningAmount = [];

    for (var i = 0; i < rc.reimbursements.length; i++) {
        rc.reimbursementEvents[rc.reimbursementEvents.length] = new ReimbursementEvent(rc.reimbursements[i], i, true);
        rc.reimbursementEvents[rc.reimbursementEvents.length] = new ReimbursementEvent(rc.reimbursements[i], i, false);
        if (cookie === null) {
            cookie = "";
        } else {
            cookie += ":";
        }
        cookie += rc.reimbursements[i];
    }

    rc.reimbursementEvents.sort(rc.sortByDate);
    var total = 0;
    for (var i = 0; i < rc.reimbursementEvents.length; i++) {
        if (rc.reimbursementEvents[i].isStart()) {
            total += rc.reimbursementEvents[i].getAmount();
        } else {
            total -= rc.reimbursementEvents[i].getAmount();
        }
        rc.runningAmount[i] = total;
    }

    // Save dates in cookies
    util.setCookie("dates", cookie);
    rc.print();
};

rc.print = function() {

    var table = document.getElementById("tableBody");
    var rows = [];
    util.removeChildren(table);

    var lastTime = 0;
    var now = new Date().getTime();
    var printedToday = false;
    for (var i = 0; i < rc.reimbursementEvents.length; i++) {
        if (!printedToday && now > lastTime && now <= rc.reimbursementEvents[i].getDate().getTime()) {
            rows.push(rc.buildTodayRow(i === 0 ? 0 : rc.runningAmount[i - 1]));
            printedToday = true;
        }

        rows.push(rc.buildDateTableRow(rc.reimbursementEvents[i], rc.runningAmount[i], i));
    }

    if (!printedToday && rc.reimbursementEvents.length > 1) {
        rows.push(rc.buildTodayRow(0));
    }

    if (rc.reimbursementEvents.length > 1) {
        $("#testButton").addClass("hidden");
        $("#clearButton").removeClass("hidden");
    } else {
        $("#testButton").removeClass("hidden");
        $("#clearButton").addClass("hidden");
    }
    var options = {
    	duration: 50
    };
    rows.forEach(function(tr, i) {
    	var divs = $(tr.querySelectorAll('td>div'));
    	$(divs).hide();
    	table.appendChild(tr);
    	window.setTimeout(function(){divs.slideDown(options);}, i * 50);
    });

    rc.drawChart();
};

rc.buildTodayRow = function(amount) {
    var tr = rc.buildRow([
    	new BoldTextCell(rc.TODAY_TEXT),
    	new Cell(),
    	new Cell(),
    	new BoldCurrencyCell(amount),
    	new Cell()
    ]);
    tr.className = "active";
    return tr;
};

rc.buildDateTableRow = function(reimbursementEvent, amount, index) {
    var tr = rc.buildRow( [
    	new DateCell(reimbursementEvent.getDate()),
    	new TextCell(reimbursementEvent.isStart() ? rc.DATE_START_TEXT : rc.DATE_STOP_TEXT),
    	new CurrencyCell(reimbursementEvent.getAmount()),
    	new CurrencyCell(amount),
    	new ButtonCell(reimbursementEvent.index, rc.removeDate)
    ]);
    tr.dateIndex = reimbursementEvent.index;
    tr.eventIndex = index;
    tr.onmouseover = rc.hoverRowHandler;
    tr.onmouseout = rc.unhoverRowHandler;
    return tr;
};

rc.buildRow = function(cells) {
	var tr = document.createElement("tr");
	cells.forEach(function(cell){tr.appendChild(cell.buildCell());});
	return tr;
};

/**
 * Handles mouseover events for table rows.
 * The tr element must have a dateIndex property defined that indicates which ReimbursementEvent it represents.
 * The matching event pair rows will be highlighted.
 */
rc.hoverRowHandler = function() {
    rc.highlightRows(this.dateIndex);
}

/**
 * Handles mouseout events for table rows. All rows will be unhighlighted.
 */
rc.unhoverRowHandler = function() {
    rc.chart.setSelection();
    rc.unhighlightRows();
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
rc.highlightRows = function(dateIndex) {
    rc.selection = [];
    var first = true;
    $("#tableBody").children("tr").each(function(index, el) {
        if (el.dateIndex === dateIndex) {
            if (first === true) {
                first = false;
                $(el).addClass("danger");
                if( !rc.RED) {
                    rc.RED = $(el).find("td").first().css('backgroundColor');
                }
            } else {
                $(el).addClass("success");
                if( !rc.GREEN) {
                    rc.GREEN = $(el).find("td").first().css('backgroundColor');
                }
            }
            rc.selection.push({row: this.eventIndex, column: 1});
        } else {
            $(el).removeClass("danger");
            $(el).removeClass("success");
        }
    });

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

/**
 * Unhighlights all rows in the event table.
 * @return {[type]} [description]
 */
rc.unhighlightRows = function() {
    $("#tableBody").children("tr").removeClass("danger").removeClass("success");
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
    util.setCookie("timeAmount", this.selectedOptions[0].value);
    rc.updateReimbursementTime();
    rc.processReimbursements();
};

rc.timeUnitChanged = function() {
    var unit = this.selectedOptions[0].value;
    util.setCookie("timeUnit", unit);
    rc.populateTimeAmounts(unit, rc.getSelectedTimeAmount());
    rc.updateReimbursementTime();
    rc.processReimbursements();
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

    $("#inputButton").on('click', null, rc.getInput);
    $("#testButton").on('click', null, rc.loadTestData);
    $("#clearButton").on('click', null, rc.clearDates);
    $("#inputAmount").keypress(rc.enterCatch);
    $("#inputDate").keypress(rc.enterCatch);

    rc.populateTimeAmounts('Years', 2);

    if (window.location.protocol === 'file:') {
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

    rc.processReimbursements();
};
