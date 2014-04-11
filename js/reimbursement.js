
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
