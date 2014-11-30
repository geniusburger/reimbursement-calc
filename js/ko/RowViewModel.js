
function RowViewModel(date, amount, isStart, isSmall, option) {
    this.owed = ko.observable(new Currency('0'));
    this.isHighlighted = ko.observable(false);
    this.date = date;
    this.amount = amount;
    this.isStart = isStart;
    this.isToday = option === 'Today';
    this.isSizeRow = option === 'SizeRow';
    this.isSmall = isSmall;
    this.matchingRow = null;

    this.formattedDate = ko.pureComputed(function() {
        var small = this.isSmall();
        if( this.sizeRow) {
            return small ? '00/00/0000' : 'OOO OOO 00 0000';
        } else if( this.isToday ) {
            return 'Today';
        } else {
            return small ? this.date.toLocaleDateString() : this.date.toDateString();
        }
    }, this);

    this.formattedAmount = ko.pureComputed(function() {
        var text = this.amount.toString();
        var small = this.isSmall();
        if( this.isSizeRow) {
            return small ? '$00,000' : '$00,000.00';
        } else if( this.isToday ) {
            return '';
        } else {
            return small ? text.substring(0, text.lastIndexOf('.')) : text;
        }
    }, this);

    this.formattedOwed = ko.pureComputed(function() {
        var text = this.owed().toString();
        var small = this.isSmall();
        if( this.isSizeRow) {
            return small ? '$00,000' : '$00,000.00';
        } else {
            return small ? text.substring(0, text.lastIndexOf('.')) : text;
        }
    }, this);

    this.formattedType = ko.pureComputed(function() {
        var small = this.isSmall();
        if( this.isSizeRow) {
            return small ? '+' : 'Reimbursed longer message for testing and now it is even longer for testing';
        } else if( this.isToday) {
            return '';
        } else if(this.isStart) {
            return small ? '+' : 'Reimbursed longer message for testing and now it is even longer for testing';
        } else {
            return small ? '-' : 'Expired';
        }
    }, this);
}

RowViewModel.prototype.update = function(currency) {
    currency.adjust(this.amount);
    this.owed(new Currency(currency));
};
