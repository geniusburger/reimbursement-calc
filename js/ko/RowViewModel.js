
function RowViewModel(date, amount, owed, isStart, isSmall) {
    var self = this;

    self.date = ko.observable(date);
    self.amount = ko.observable(amount);
    self.owed = ko.observable(owed);
    self.isStart = ko.observable(isStart);
    self.isSmall = isSmall;
    self.matchingRow = null;

    self.formattedDate = ko.computed(function() {
        return self.isSmall() ? self.date().toLocaleDateString() : self.date().toDateString();
    });

    self.formattedAmount = ko.computed(function(){
        return self.amount().toString();
    });

    self.formattedOwed = ko.computed(function() {
        return self.amount().toString();
    });

    self.formattedType = ko.computed(function() {
        if(self.isStart()) {
            return self.isSmall() ? '+' : 'Reimbursed';
        } else {
            return self.isSmall() ? '-' : 'Expired';
        }
    });
}

RowViewModel.prototype.update = function(currency) {
    currency.adjust(this.amount());
    this.owed().update(currency);
    return currency;
};

RowViewModel.prototype.remove = function() {
    console.log('removing myself ', this)
};