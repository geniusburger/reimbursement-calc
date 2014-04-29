/**
 * Holds currency values and helps with addition, subtraction, and formatting.
 * @param amount
 * @constructor
 */
function Currency(amount) {

    /**
     * Indicates if this object was successfully constructed.
     * @type {boolean}
     */
    this.valid = false;

    /**
     * Indicates if thousand separators should be used when formatting the currency as a string.
     * @type {boolean}
     */
    this.useThousandsSeparators = true;

    /**
     * The number of integer dollars.
     * @type {number}
     * @private
     */
    this.dollars = 0;

    /**
     * The number of integer cents [0,99].
     * @type {number}
     * @private
     */
    this.cents = 0;

    if( typeof amount === 'string') {
        // amount is a currency string with dollars and cents
        if( !isNaN(amount)) {
            this.dollars = parseInt(amount);

            var decimalIndex = amount.indexOf('.');
            if( decimalIndex > -1 && decimalIndex < (amount.length - 1)) {
                this.cents = parseInt(amount.substring(decimalIndex + 1))
            }

            // Check if no dollars/cents were included
            if( isNaN(this.dollars)) {
                this.dollars = 0;
            }
            if( isNaN(this.cents)) {
                this.cents = 0;
            }

            this.valid = true;

            if( this.dollars < 0) {
                this.valid = false;
                console.error('Currency constructed with invalid dollars in amount string', this.dollars);
            }
            if( this.cents < 0 || this.cents > 99) {
                this.valid = false;
                console.error('Currency constructed with invalid cents in amount string', this.cents);
            }
        } else {
            console.error('Currency constructed with invalid amount string', amount);
        }
    } else if( typeof amount === 'object') {
        // amount might contain dollar and cents fields
        if( amount instanceof Currency) {
            this.dollars = amount.dollars;
            this.cents = amount.cents;
            this.valid = true;
        } else {
            console.error('Currency constructed with invalid amount object', amount);
        }
    }
}

/**
 * Add another Currency object to this. This object will be updated.
 * @param {Currency} other The other Currency to add.
 * @returns {Currency} this
 */
Currency.prototype.add = function(other) {
    if( other instanceof Currency) {
        this.dollars += other.dollars;
        this.cents += other.cents;
        while( this.cents >= 100) {
            this.dollars++;
            this.cents -= 100;
        }
    } else {
        console.error("Can't add non-Currency type", other);
    }
    return this;
};

/**
 * Subtract another Currency object from this. This object will be updated.
 * @param {Currency} other The other Currency to subtract.
 * @returns {Currency} this
 */
Currency.prototype.subtract = function(other) {
    if( other instanceof Currency) {
        this.dollars -= other.dollars;
        this.cents -= other.cents;
        while( this.cents < 0) {
            this.dollars--;
            this.cents += 100;
        }
        if( this.dollars < 0) {
            console.warn('Resetting negative Currency to zero', this.toString());
            this.dollars = 0;
            this.cents = 0;
        }
    } else {
        console.error("Can't add non-Currency type", other);
    }
    return this;
};

/**
 * Gets just the dollars as a formatted string.
 * @returns {string}
 */
Currency.prototype.getDollarsString = function() {
    if( this.useThousandsSeparators) {
        return this.dollars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
        return this.dollars.toString();
    }
}

/**
 * Gets just the cents as a formatted string.
 * @returns {string}
 */
Currency.prototype.getCentsString = function() {
    if( this.cents >= 10 ) {
        return this.cents.toString();
    }
    return '0' + this.cents;
}

/**
 * Gets this as formatted currency string.
 * @returns {string}
 */
Currency.prototype.toString = function() {
  return '$' + this.getDollarsString() + '.' + this.getCentsString();
};