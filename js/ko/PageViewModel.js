
function PageViewModel() {
    var self = this;

    self.date = ko.observable();
    self.amount = ko.observable();
    self.timeAmount = ko.observable(2);
    self.timeUnit = ko.observable('Years');
    self.rows = ko.observableArray();
    self.isSmall = ko.observable(false);

    self.timeAmountOptions = ko.observableArray();
    self.timeUnitOptions = ['Days', 'Months', 'Years'];

    self.populateTimeAmounts();

    self.removePair = function(row) {
        self.rows.remove(row);
        self.rows.remove(row.matchingRow);
    };

    self.rows.subscribe(function(changes) {
        var owed = new Currency('0');
        changes.forEach(function(row, i, a) {
            console.log('updating row ' + i + ' of ' + a.length + ' with owed ' + owed.toString() + ', before: ' + row.owed());
            row.update(owed);
            console.log('updating row ' + i + ' of ' + a.length + ' with owed ' + owed.toString() + ', after:  ' + row.owed());
        });
    });

    self.deleteAll = function() {
        self.rows.removeAll();
        self.rows.push(new RowViewModel(new Date(), new Currency('0'), true, self.isSmall, true));
    };

    self.rows.push(new RowViewModel(new Date(), new Currency('0'), true, self.isSmall, true));
}

PageViewModel.prototype.populateTimeAmounts = function() {
    var amount = this.timeAmount();
    var max = 0;
    switch (this.timeUnit()) {
        case 'Days':
            max = 30;
            break;
        case 'Months':
            max = 12;
            break;
        case 'Years':
            max = 20;
            break;
        default:
            console.error('Failed to populate time amounts from unit: ' + this.timeUnit());
            return;
    }

    this.timeAmountOptions.removeAll();
    for (var i = 1; i <= max; i++) {
        this.timeAmountOptions.push(i);
    }

    if (amount > max) {
        amount = max;
    }

    this.timeAmount(amount);
};

PageViewModel.prototype.getInput = function() {
    console.log('getInput', this.date(), this.amount(), this.timeAmount(), this.timeUnit());

    //$("#inputButton").blur();
    var date = new Date(this.date());
    var amount = new Currency(this.amount());
    var valid = true;

    if (!amount.valid) {
        valid = false;
        //amountInput.parent().addClass("has-error");
        //amountInput.focus();
    } else {
        //amountInput.parent().removeClass("has-error");
    }

    if (util.isInvalidDate(date)) {
        valid = false;
        //dateInput.parent().addClass("has-error");
        //dateInput.focus();
    } else {
        //dateInput.parent().removeClass("has-error");
    }

    if (valid) {
        this.date("");
        this.amount("");
        this.addDate(date, amount);
        //rc.storage.setDates();
        //rc.drawChart();
        //dateInput.focus();
    }
    return false;
};

PageViewModel.prototype.addDate = function(date, amount) {
    var future = new Date(date);
    var duration = Number(this.timeAmount());
    switch (this.timeUnit()) {
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

    var startRow = new RowViewModel(date, amount, true, this.isSmall);
    var stopRow = new RowViewModel(future, new Currency(amount), false, this.isSmall);

    startRow.matchingRow = stopRow;
    stopRow.matchingRow = startRow;

    this.rows.push(startRow);
    this.rows.push(stopRow);

    this.rows.sort(function(left, right) {
        return left.date.getTime() - right.date.getTime();
    });
};

PageViewModel.prototype.loadTestData = function() {
    [
        ["$7802.05", "7/6/2012"],
        ["$6931.49", "2/1/2013"],
        ["$7568.49", "4/12/2013"],
        ["$3802.00", "1/6/2012"],
        ["$3658.51", "4/13/2012"],
        ["$775.00", "12/21/2012"],
        ["$4350.00", "6/28/2013"]
    ].forEach(function(row){
        this.addDate(new Date(row[1]), new Currency(row[0]));
    }, this);
};

PageViewModel.prototype.rowMouseOver = function(row) {
    if( !row.isToday) {
        row.isHighlighted(true).matchingRow.isHighlighted(true);
    }
};

PageViewModel.prototype.rowMouseOut = function(row) {
    if( !row.isToday) {
        row.isHighlighted(false).matchingRow.isHighlighted(false);
    }
};
