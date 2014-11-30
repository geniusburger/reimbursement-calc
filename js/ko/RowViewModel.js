
function RowViewModel(date, amount, isStart, isSmall, name) {
    this.date = ko.observable(date);
    this.amount = ko.observable(amount);
    this.owed = ko.observable(new Currency('0'));
    this.isStart = ko.observable(isStart);
    this.isHighlighted = ko.observable(false);
    this.isSmall = isSmall;
    this.matchingRow = null;
    this.name = name;

    this.formattedDate = ko.pureComputed(function() {
        return this.isSmall() ? this.date().toLocaleDateString() : this.date().toDateString();
    }, this);

    this.formattedAmount = ko.pureComputed(function(){
        var text = this.amount().toString();
        if( this.isSmall()) {
            text = text.substring(0, text.lastIndexOf('.'));
        }
        return text;
    }, this);

    this.formattedOwed = ko.pureComputed(function() {
        var text = this.owed().toString();
        if( this.isSmall()) {
            text = text.substring(0, text.lastIndexOf('.'));
        }
        return text;
    }, this);

    this.formattedType = ko.pureComputed(function() {
        if(this.isStart()) {
            return this.isSmall() ? '+' : 'Reimbursed';
        } else {
            return this.isSmall() ? '-' : 'Expired';
        }
    }, this);
}

RowViewModel.prototype.update = function(currency) {
    currency.adjust(this.amount());
    this.owed(new Currency(currency));
};
