
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

rc.getDollarsStringFromCents = function(amount) {
    var cents = (amount % 100);
    return parseInt(amount / 100) + "." + (cents < 10 ? "0" : "") + cents;
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

rc.hoverRowHandler = function() {
    var dateIndex = this.dateIndex;
    var r = rc.reimbursements[dateIndex];
    var first = true;
    $("#tableBody").children("tr").each(function(index, el) {
        if (el.dateIndex === dateIndex) {
            if (first === true) {
                first = false;
                $(el).addClass("danger")
            } else {
                $(el).addClass("success");
            }
        } else {
            $(el).removeClass("danger");
            $(el).removeClass("success");
        }
    });
}

rc.unhoverRowHandler = function() {
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

    if( rc.reimbursementEvents.length === 0) {
        $("#chart").addClass("hidden");
    } else if( chartIsReady) {
        $("#chart").removeClass("hidden");
        rc.chartData = [];
        rc.chartData[0] = ['Date', 'Owed'];
        for( var i = 0; i < rc.reimbursementEvents.length; i++) {
            rc.chartData[i+1] = [rc.reimbursementEvents[i].getDate(), {v: rc.runningAmount[i]/100, f: '$' + rc.getDollarsStringFromCents(rc.runningAmount[i]) }];
        }
        var data = google.visualization.arrayToDataTable(rc.chartData);

        var axis = {
            baselineColor: '#272b30', 
            gridlines: {
                color: '#272b30'
            }
        };

        var dark = '#272b30';
        var mid = '#2e3338';
        var light = '#49515a';
        var text = '#c8c8c8';

        var background = dark;
        var grid = light;

        var options = {
            pointSize: 5,
            backgroundColor: background, 
            tooltip: {
                textStyle: {
                    color: text
                }
            },
            hAxis: {
                titleTextStyle: {
                    color: text
                },
                textStyle: {
                    color: text
                },
                baselineColor: grid, 
                gridlines: {
                    color: grid
                }
            },
            vAxis: {
                titleTextStyle: {
                    color: text
                },
                textStyle: {
                    color: text
                },
                baselineColor: grid, 
                gridlines: {
                    color: grid
                }
            },
            legend: {
                position: 'none'
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart'));
        chart.draw(data, options);
    } else {
        $("#chart").addClass("hidden");
        console.error("Chart not ready");
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
