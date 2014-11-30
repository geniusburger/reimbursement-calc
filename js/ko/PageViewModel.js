
function PageViewModel(storage) {
    var self = this;

    self.storage = storage;
    self.date = ko.observable();
    self.dateError = ko.observable(false);
    self.amount = ko.observable();
    self.amountError = ko.observable(false);
    self.timeAmount = ko.observable(2);
    self.lastTimeAmount = 1;
    self.timeUnit = ko.observable('Years');
    self.rows = ko.observableArray();//.extend({ rateLimit: {timeout: 50, method: 'notifyWhenChangesStop '}});
    self.isSmall = ko.observable(false);
    self.daysLeft = ko.observable(0);
    self.nextRow = null;
    self.loading = false;
    self.timeUnitOptions = ['Days', 'Months', 'Years'];
    self.sizeRow = new RowViewModel(new Date(0), new Currency('0'), false, self.isSmall, 'SizeRow');
    self.todayRow = new RowViewModel(new Date(), new Currency('0'), false, self.isSmall, 'Today');

    self.rows.push(self.todayRow);

    self.timeAmountOptions = ko.computed(function(){
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
        if (amount > max) {
            amount = max;
        }
        this.timeAmount(amount);
        var options = [];
        for (var i = 1; i <= max; i++) {
            options.push(i);
        }
        return options;
    }, this);

    self.removePair = function(row) {
        self.rows.remove(row);
        self.rows.remove(row.matchingRow);
    };

    // Update owed column automatically
    self.rows.subscribe(function(changes) {
        var owed = new Currency('0');
        changes.forEach(function(row) {
            row.update(owed);
        });
        self.storage.setDates(changes);
        var todayIndex = self.rows.indexOf(self.todayRow);
        if( todayIndex !== -1 && todayIndex < self.rows().length-1) {
            self.nextRow = self.rows()[todayIndex+1];
            var futureDate = util.stripTime(self.nextRow.date);
            var todayDate = util.stripTime(self.todayRow.date);
            var days = (futureDate - todayDate) / 86400000;
            var floor = Math.floor(days);

            if( floor !== days) {
                var ceil = Math.ceil(days);
                if( (ceil - days) < (days - floor)) {
                    days = ceil;
                } else {
                    days = floor;
                }
            }

            self.daysLeft(days);
        }
    });

    self.updateDuration = function() {
        var dates = [];
        self.rows().forEach(function(row){
            if( row.isStart) {
                dates.push({date: row.date, amount: row.amount});
            }
        });
        self.deleteAll();
        dates.forEach(function(row) {
            self.addDate(row.date, row. amount);
        });
    };

    self.timeAmount.subscribe(self.updateDuration);
    self.timeUnit.subscribe(self.updateDuration);

    self.deleteAll = function() {
        self.rows.remove(function(row){
            return !row.isToday;
        });
    };

    self.getInput = function() {
        console.log('getInput', this.date(), this.amount(), this.timeAmount(), this.timeUnit());

        var date = new Date(this.date());
        var amount = new Currency(this.amount());
        var valid = true;

        if (!amount.valid) {
            valid = false;
            //amountInput.focus();
        }
        self.amountError(!amount.valid);

        if (util.isInvalidDate(date)) {
            valid = false;
            self.dateError(true);
            //dateInput.focus();
        } else {
            self.dateError(false);
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
}

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

PageViewModel.prototype.loadSavedData = function() {
    this.loading = true;
    this.storage.getDates().forEach(function(row) {
        this.addDate(new Date(row[1]), new Currency(row[0]));
    }, this);
    this.loading = false;
};

PageViewModel.prototype.rowMouseOver = function(row) {
    if( !row.isToday && !row.isSizeRow) {
        row.isHighlighted(true).matchingRow.isHighlighted(true);
    }
};

PageViewModel.prototype.rowMouseOut = function(row) {
    if( !row.isToday && !row.isSizeRow) {
        row.isHighlighted(false).matchingRow.isHighlighted(false);
    }
};