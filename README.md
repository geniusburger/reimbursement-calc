# reimbursement-calc.com

[reimbursement-calc.com](http://reimbursement-calc.com/) calculates tuition reimbursement expiration dates and displays a running total of the amount owed.

When companies provide tuition reimbursement to employees they may require that the employee stay with the company for a certain amount of time or have to pay back the money. This site allows someone to enter the dates/amounts they were reimbursed along with the duration of the obligation and displays a running total of the amount owed.

Dates/amounts are stored using local storage or cookies.

Built using [Bootstrap](http://getbootstrap.com/) and the [Slate](http://bootswatch.com/slate/) Color Theme.

## Created

2/2014

## Project

A [PhpStorm](http://www.jetbrains.com/phpstorm/) project was used to keep everything together. I chose it because I was looking for a better web development IDE and it provided file watchers that made automatic Less compilation and javascript minification easier.

### JavaScript Minification

JavaScript minification is accomplished using Google's [Closure Compiler](https://developers.google.com/closure/compiler/).
The resulting files are combined into master.min.js using the [Node.js](http://nodejs.org/) script in [loadOrder.js](js/loadOrder.js).
