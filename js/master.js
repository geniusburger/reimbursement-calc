
//////////////////////////////////////////////////////////////////////////////////
////////     Reimbursement Class
//////////////////////////////////////////////////////////////////////////////////

function Reimbursement(date, amount) {

    this.amount = amount;
    this.amountString = amount;
    this.startDate = new Date(date);

    if (this.isValid() === true) {
        this.stopDate = new Date(this.startDate);
        var timeAmount = Number(rc.getSelectedTimeAmount());
        switch (rc.getSelectedTimeUnit()) {
            case "Days":
                this.stopDate.setDate(this.stopDate.getDate() + timeAmount);
                break;
            case "Months":
                this.stopDate.setMonth(this.stopDate.getMonth() + timeAmount);
                break;
            default:
                console.log("Failed to find time unit, defaulting to years");
            case "Years":
                this.stopDate.setFullYear(this.stopDate.getFullYear() + timeAmount);
                break;
        }

        this.dollars = parseInt(amount);
        var i = amount.indexOf(".");
        if (i === -1) {
            this.cents = 0;
        } else {
            var sub = amount.substring(amount.indexOf(".") + 1);
            if (sub.length === 2) {
                this.cents = parseInt(sub);
            } else {
                startDate = NaN;
            }

        }
        this.amount = this.dollars * 100 + this.cents;
    }
};

Reimbursement.prototype.isValid = function() {
    return this.isValidDate() && this.isValidAmount();
};

Reimbursement.prototype.isInvalid = function() {
    return this.isInvalidDate() || this.isInvalidAmount();
};

Reimbursement.prototype.isInvalidDate = function() {
    return isNaN(this.startDate.getTime());
};

Reimbursement.prototype.isValidDate = function() {
    return !this.isInvalidDate();
};

Reimbursement.prototype.isInvalidAmount = function() {
    return !this.isValidAmount();
};

Reimbursement.prototype.isValidAmount = function() {
    var matches = this.amountString.match(/^\s*\d+(\.\d\d)?\s*$/);
    if (matches === null || matches.length === 0) {
        return false;
    }
    return !isNaN(parseFloat(this.amountString)) && isFinite(this.amountString) && (parseFloat(this.amountString) >= 0);
};

Reimbursement.prototype.toString = function() {
    return this.amountString + "@" + this.startDate.toDateString();
};

//////////////////////////////////////////////////////////////////////////////////
////////     ReimbursementEvent Class
//////////////////////////////////////////////////////////////////////////////////

function ReimbursementEvent(reimbursement, index, start) {
    this.reimbursement = reimbursement;
    this.index = index;
    this.start = start;
};

ReimbursementEvent.prototype.isStart = function() {
    return this.start;
};

ReimbursementEvent.prototype.isStop = function() {
    return !this.start;
};

ReimbursementEvent.prototype.getAmount = function() {
    return this.reimbursement.amount;
};

ReimbursementEvent.prototype.getDate = function() {
    return this.start ? this.reimbursement.startDate : this.reimbursement.stopDate;
};

ReimbursementEvent.prototype.getAmountString = function() {
    return "$" + this.reimbursement.dollars + "." + (this.reimbursement.cents < 10 ? "0" : "") + this.reimbursement.cents;
};

ReimbursementEvent.prototype.toString = function() {
    return (this.start ? "+ " : "- ") + this.getDate().toDateString() + " : " + this.getAmountString();
};

//////////////////////////////////////////////////////////////////////////////////
////////     Utilities
//////////////////////////////////////////////////////////////////////////////////

var util = {};

/**
 * Retrieve a cookie from the browser.
 * @param  {string} name The name of the cookie to retrieve.
 * @return {string} Value of the cookie or null if not found.
 */ 
util.getCookie = function(name) {
    var name = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return null;
};

/**
 * Set a cookie in the browser.
 * @param {string} name The name of the cookie to set.
 * @param {string} value The value fo the cookie to set.
 */
util.setCookie = function(name, value) {
    document.cookie = name + "=" + value;
};

/**
 * Remove all child nodes.
 * @param  {object} parent The node to remove all children from.
 */
util.removeChildren = function(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
};

util.getNumberWithCommas = function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
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

rc.chartColor

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

    util.removeChildren(table);

    var lastTime = 0;
    var now = new Date().getTime();
    var printedToday = false;
    for (var i = 0; i < rc.reimbursementEvents.length; i++) {
        if (!printedToday && now > lastTime && now <= rc.reimbursementEvents[i].getDate().getTime()) {
            table.appendChild(rc.buildTodayRow(i === 0 ? 0 : rc.runningAmount[i - 1]));
            printedToday = true;
        }

        table.appendChild(rc.buildDateTableRow(rc.reimbursementEvents[i], rc.runningAmount[i], i));
    }

    if (!printedToday && rc.reimbursementEvents.length > 1) {
        table.appendChild(rc.buildTodayRow(0));
    }

    if (rc.reimbursementEvents.length > 1) {
        $("#testButton").addClass("hidden");
        $("#clearButton").removeClass("hidden");
    } else {
        $("#testButton").removeClass("hidden");
        $("#clearButton").addClass("hidden");
    }

    rc.drawChart();
};

rc.buildTodayRow = function(amount) {
    var tr = document.createElement("tr");
    tr.className = "active";
    tr.appendChild(rc.buildTableCellText(rc.TODAY_TEXT, "bold|center"));
    tr.appendChild(rc.buildTableCellText(""));
    tr.appendChild(rc.buildTableCellText(""));
    tr.appendChild(rc.buildTableCellText("$" + rc.getDollarsStringFromCents(amount), "bold|right"));
    tr.appendChild(rc.buildTableCellText(""));
    return tr;
};

rc.getDollarsStringFromCents = function(amount, useThousandsSeparators) {
    var cents = (amount % 100);
    var dollars = parseInt(amount / 100);
    if( useThousandsSeparators) {
        dollars = util.getNumberWithCommas(dollars);
    }
    return dollars + "." + (cents < 10 ? "0" : "") + cents;
};

rc.buildDateListItem = function(reimbursementEvent, amount, index) {
    var li = document.createElement("li");
    li.className = "list-group-item list-group-item-";
    if (index === 0) {
        li.className += "danger";
    } else if (amount === 0) {
        li.className += "success";
    } else if (reimbursementEvent.isStart() === true) {
        li.className += "warning";
    } else {
        li.className += "info";
    }
    var button = document.createElement("button");
    button.type = "button";
    button.className = "close";
    button.setAttribute("data-dismiss", "alert");
    button.setAttribute("aria-hidden", "true");
    button.innerHTML = "&times;";
    $(button).on('click', null, function() {
        rc.removeAt(reimbursementEvent.index);
    });
    li.appendChild(button);
    li.appendChild(document.createTextNode(reimbursementEvent + " $" + rc.getDollarsStringFromCents(amount)));
    return li;
};

rc.buildDateTableRow = function(reimbursementEvent, amount, index) {
    var tr = document.createElement("tr");
    tr.appendChild(rc.buildTableCellText(reimbursementEvent.getDate().toDateString(), "right"));
    tr.appendChild(rc.buildTableCellText(reimbursementEvent.isStart() ? rc.DATE_START_TEXT : rc.DATE_STOP_TEXT, "center"));
    tr.appendChild(rc.buildTableCellText(reimbursementEvent.getAmountString(), "right"));
    tr.appendChild(rc.buildTableCellText("$" + rc.getDollarsStringFromCents(amount), "right"));
    tr.appendChild(rc.buildTableCellButton(reimbursementEvent.index));
    tr.dateIndex = reimbursementEvent.index;
    tr.eventIndex = index;
    tr.onmouseover = rc.hoverRowHandler;
    tr.onmouseout = rc.unhoverRowHandler;
    return tr;
};

rc.buildTableCellText = function(text, mod) {
    var td = document.createElement("td");
    var root = document.createTextNode(text);
    if (mod === undefined) {
        mod = "";
    }

    if (mod.match(/bold/)) {
        var strong = document.createElement("strong");
        strong.appendChild(root);
        root = strong;
    }

    if (mod.match(/right/)) {
        td.className = "text-right";
    }

    if (mod.match(/center/)) {
        td.className = "text-center";
    }

    td.appendChild(root);
    return td;
};

rc.buildTableCellButton = function(index) {
    var td = document.createElement("td");
    var button = document.createElement("button");
    button.type = "button";
    button.className = "close";
    button.setAttribute("aria-hidden", "true");
    button.innerHTML = "&times;";
    button.dateIndex = index;
    $(button).on('click', null, rc.removeDate);
    td.appendChild(button);
    return td;
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
                    {v: rc.runningAmount[i]/100, f: '$' + rc.getDollarsStringFromCents(rc.runningAmount[i], true) }];
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
