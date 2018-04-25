# SIMPLE
A simple programming language

## Install
Make sure to have `node` installed. If you don't, head over to [nodejs.org](https://nodejs.org/en/)
and follow the installation instructions. Also make sure to have [git](https://git-scm.com) installed.
Then run the following commands:
```bash
git clone https://github.com/Muhammad-Salman-Sheikh/Language/
cd Language
node code-min.js
```
If this gives an error, contact me at "vikramvdurai@gmail.com". If not (and you see a lot of output), congrats!
You just installed `SIMPLE`!

## Syntax
The syntax of the language is as follows:
  * Compute expressions like usual, i.e `2 + 1`, `5 % 2` etc..
		
  * Supports addition, subtraction, multiplication, division, modulo (`%`), parenthesis.
		
  * Supports variables, to declare one simply type the variable's name, an equals sign and the number you want to assign it to.
  `( x = 12 )` will declare a variable `x` with a value of `12`.
	
  * Functions are declared with `Func nameOfFunc arg1 arg2 => ( return what ever )`, e.g `Func double x => x * 2` will
  make a function `double` that has an argument `x` and returns the results of the expression `x * 2`. Entering the expression
  `double 3` will expand to `6`.

## Quirks
An empty program will display FizBuzz program and exits with an error.
A program containing any operator but no numbers will display `Hello World!` and exit with an error


## Roadmap
  * Input/Output
  * Advanced logic flow (ternary operator, if/else/elif)
  * Improved functions
  * Loops
