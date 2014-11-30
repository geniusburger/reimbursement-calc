
function RowViewModel(date, amount, isStart, isSmall, isToday) {
    this.owed = ko.observable(new Currency('0'));
    this.isHighlighted = ko.observable(false);
    this.date = date;
    this.amount = amount;
    this.isStart = isStart;
    this.isToday = isToday;
    this.isSmall = isSmall;
    this.matchingRow = null;

    this.formattedDate = ko.pureComputed(function() {
        var small = this.isSmall();
        if( this.isToday ) {
            return 'Today';
        } else {
            return small ? this.date.toLocaleDateString() : this.date.toDateString();
        }
    }, this);

    this.formattedAmount = ko.pureComputed(function(){
        var text = this.amount.toString();
        var small = this.isSmall();
        if( this.isToday ) {
            return '';
        } else if( small) {
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
        var small = this.isSmall();
        if( this.isToday) {
            return '';
        } else if(this.isStart) {
            return small ? '+' : 'Reimbursed';
        } else {
            return small ? '-' : 'Expired';
        }
    }, this);
}

RowViewModel.prototype.update = function(currency) {
    currency.adjust(this.amount);
    this.owed(new Currency(currency));
};
