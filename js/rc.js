var rc = {};

rc.reimbursements = [];
rc.reimbursementEvents = [];
rc.runningAmount = [];

rc.DATE_START_TEXT = "Reimbursed";
rc.DATE_STOP_TEXT = "Obligation Expired";
rc.TODAY_TEXT = "Today";

rc.addDate = function(date) {
    if (date.isValid()) {
        rc.reimbursements[rc.reimbursements.length] = date;
    }
    return date.isValid();
};

rc.getCookie = function(name) {
    var name = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return null;
};

rc.setCookie = function(name, value) {
    document.cookie = name + "=" + value;
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
    rc.setCookie("dates", cookie);
    rc.print();
};

rc.print = function() {

    var table = document.getElementById("tableBody");

    rc.removeChildren(table);

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
};

rc.buildTodayRow = function(amount) {
    var tr = document.createElement("tr");
    tr.className = "active";
    tr.appendChild(rc.buildTableCellText(rc.TODAY_TEXT, "bold|center"));
    tr.appendChild(rc.buildTableCellText(""));
    tr.appendChild(rc.buildTableCellText(""));
    tr.appendChild(rc.buildTableCellText("$" + rc.getDollarsFromCentsString(amount), "bold|right"));
    tr.appendChild(rc.buildTableCellText(""));
    return tr;
};

rc.sortByDate = function(a, b) {
    return a.getDate() - b.getDate();
};

rc.getDollarsFromCentsString = function(amount) {
    var cents = (amount % 100);
    return parseInt(amount / 100) + "." + (cents < 10 ? "0" : "") + cents;
};

rc.removeAt = function(index) {
    rc.reimbursements.splice(index, 1);
    rc.processReimbursements();
};

rc.removeDate = function() {
    rc.removeAt(this.dateIndex);
}

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
    li.appendChild(document.createTextNode(reimbursementEvent + " $" + rc.getDollarsFromCentsString(amount)));
    return li;
};

rc.buildDateTableRow = function(reimbursementEvent, amount, index) {
    var tr = document.createElement("tr");
    tr.appendChild(rc.buildTableCellText(reimbursementEvent.getDate().toDateString(), "right"));
    tr.appendChild(rc.buildTableCellText(reimbursementEvent.isStart() ? rc.DATE_START_TEXT : rc.DATE_STOP_TEXT, "center"));
    tr.appendChild(rc.buildTableCellText(reimbursementEvent.getAmountString(), "right"));
    tr.appendChild(rc.buildTableCellText("$" + rc.getDollarsFromCentsString(amount), "right"));
    tr.appendChild(rc.buildTableCellButton(reimbursementEvent.index));
    tr.dateIndex = reimbursementEvent.index;
    tr.onmouseover = rc.hoverRowHandler;
    tr.onmouseout = rc.unhoverRowHandler;
    return tr;
};

rc.buildTableCellText = function(text, mod) {
    var td = document.createElement("td");
    var root = document.createTextNode(text);
    if( mod === undefined) {
    	mod = "";
    }

    if( mod.match(/bold/)) {
    	var strong = document.createElement("strong");
    	strong.appendChild(root);
    	root = strong;
    }

    if( mod.match(/right/)) {
    	td.className = "text-right";
    }

    if( mod.match(/center/)) {
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

rc.clearDates = function() {
    rc.reimbursements = [];
    rc.processReimbursements();
};

rc.updateReimbursementTime = function() {
	for( var i = 0; i < rc.reimbursements.length; i++) {
		var old = rc.reimbursements[i];
		rc.reimbursements[i] = new Reimbursement(old.startDate, old.amountString);
	}
}

rc.timeAmountChanged = function() {
	rc.setCookie("timeAmount", this.selectedOptions[0].value);
	rc.updateReimbursementTime();
	rc.processReimbursements();
};

rc.timeUnitChanged = function() {
	var unit = this.selectedOptions[0].value;
	rc.setCookie("timeUnit", unit);
	rc.populateTimeAmounts(unit, rc.getSelectedTimeAmount());
	rc.updateReimbursementTime();
	rc.processReimbursements();
};

rc.populateTimeAmounts = function(unit, amount) {
	switch(unit) {
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
	rc.removeChildren(timeAmount);
	for( var i = 1; i <= max; i++) {
		var option = document.createElement("option");
		option.innerHTML = i;
		timeAmount.appendChild(option);
	}

	if( amount > max) {
		amount = max;
	}

	timeAmount.options[amount-1].selected = true;
};

rc.removeChildren = function(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
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

function Reimbursement(date, amount) {

    this.amount = amount;
    this.amountString = amount;
    this.startDate = new Date(date);

    if (this.isValid() === true) {
        this.stopDate = new Date(this.startDate);
        var timeAmount = Number(rc.getSelectedTimeAmount());
        switch( rc.getSelectedTimeUnit()) {
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
    	if( navigator.cookieEnabled !== true) {
    		$("#cookieAlert").removeClass("hidden");
    	}
    	var timeAmountCookie = rc.getCookie("timeAmount");
    	var timeUnitCookie = rc.getCookie("timeUnit");

    	if( timeAmountCookie !== null && timeUnitCookie !== null && timeAmountCookie !== "" && timeUnitCookie !== "") {
		    $("#timeUnit").val(timeUnitCookie);
		    rc.populateTimeAmounts(timeUnitCookie, timeAmountCookie);
    	}

        var datesCookie = rc.getCookie("dates");
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
