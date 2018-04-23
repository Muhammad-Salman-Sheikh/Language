/**
	* The syntax of the language is as follow :
		* Math expression are just normal. i.e : 2 + 1 etc..
		* Supports addition , subtraction , multiplication , division , modulo , parenthesis.
		* assignment operator ( = )
		* variable declaration is : (x = 12 )
		* functions : 
			* ` fn nameOfFunc arg1 arg2 => (return what ever )`
----------------------------------------------------------------------------------------------------------------------------------------
**/

// JSON stringifying the input
i = _ => JSON.stringify(_);

/**
	* The Interpreter
**/

const Interpreter = function () {
	this.functions = {};
	this.variables = {};
	/**
		* Takes an input and tokenizes it
		* Then parses that tokenized input
		* And finally interprets it.
		*
		* @params {program} _ 
	**/
	this.input = _ => this.interpret(this.parse(this.tokenize(_)))
	/**
		* The interpreter
		* 
		* @param {parsed input or Tree} T
	**/
	this.interpret = T => {
		/*
			* Switching over different inputs
		*/
		switch (T.type) {
		case "operator":
			var 
				l = this.interpret(T.left) ,
				r = this.interpret(T.right),
				o = T.operator;
			return (
				o == '+' ? 
					l + r : 
				o == '*' ? 
					l * r : 
				o == '-' ? 
					l - r : 
				o == '/' ? 
					l / r : 
				o == '%' ? 
					l % r : 
				(() => {
				throw (
		`Unknown operator ? ${i(T)}`
				)
				})()
			)
		case "number":
			return +T.value
		case "assignment":
			if (T.name in this.functions)
				throw `Variable name collides with function name : ${T.name}`;
			var V = this.interpret(T.value);
			this.variables[T.name] = V;
			return V;
		case "identifier":
			return (
				T.value in this.variables ?
					this.variables[T.value] :
				(() => {
	throw `Missing identifier : ${T.value}`
				})()
			)
		case "function":
			if (T.name in this.variables)
	throw `Function name collides with variable name: ${T.name}`
			this.functions[T.name] = T;
			return "";
		case "fnCall":
			var that = this;
			var fn = this.functions[T.name];
			var args = T.args.reduce((args, pair) => (
args[pair[0]] = that.interpret(pair[1]), 
				args
			), Object.create(this.variables));
			var oldVars = this.variables;
			this.variables = args;
			var R = this.interpret(fn.body);
			this.variables = oldVars;
			return R;
		case "container":
			return this.interpret(T.child);
		case "noop":
			return ""
		default:
			throw `What type is ${i(T)}`;
		}
	}
	/*
		* Tokenize the given input 
		* @param {program} P
	*/
	this.tokenize = P => P == "" ? 
		[] : 
	P.split(
/\s*(=>|[-+*\/\%=\(\)]|[A-Za-z_][A-Za-z0-9_]*|[0-9]*\.?[0-9]+)\s*/g
		).filter(_ => !_.match(/^\s*$/)
	);
	/**
		* The parser
		* 
		* @param {tokenized input} T
	**/
	this.parse = T => (P = new Parser(this.functions, T).parse(), T.length != 0 ? `Extra tokens : ${i(T)}` : P)
	/**
		* Parsing strings
		*
		* @param {code} C
	**/
	this.parseString = C => this.parse(this.tokenize(C));
	
}

/**
	* The parser constructor
	*
	* @param {functions} function
	* @param {tokens} tokens
**/

const Parser = function (functions, tokens) {
	this.functions = functions;
	this.tokens = tokens;
	/**
		* Parser
	**/
	this.parse = () => this.tokens.length == 0 ? 
		(() => {
		return {
			type: 'noop'
		}
	})() : 
	this.tokens[0] === 'fn' ? 
		(() => {
			this.shift();
				var N = this.tokens.shift(),
					A = this.parseFnArgs();
			this.shift();
			var B = this.parseExpr();
			this.validateIdentifiers(A, B);
			return {
				type: "function",
				name: N,
				args: A,
				body: B
			};
	})() : 
	this.parseExpr()
	
	this.shift = () => this.tokens.shift();

	this.parseExpr = () => {
		var leftExpr = null ,
			rightExpr = null;
		if (this.tokens.length === 0)
			throw "Empty Program";
		if (this.isIdentifier() && this.tokens[1] === '=') {
			leftExpr = this.parseAssignment();
		} else if (this.tokens[0].match(/^[0-9][\.0-9]*$/)) {
			leftExpr = {
				type: "number",
				value: this.tokens.shift()
			};
		} else if (this.isIdentifier() && this.functions[this.tokens[0]]) {
			leftExpr = this.parseFnCall();
		} else if (this.isIdentifier()) {
			leftExpr = {
				type: "identifier",
				value: this.tokens.shift()
			};
		} else if (this.tokens[0][0] === '(') {
			leftExpr = this.parseContainer();
		} else if (this.tokens[0] === 'fn') {
			leftExpr = this.parseFn();
		} else if (this.tokens[0][0] === ')') {
			throw `What is : ${i(this.tokens)}`
		}
		if (!this.tokens.length || !this.isOperator()) return leftExpr;
		var operator = this.shift();
		var rightExpr = this.parseExpr();
		if ((rightExpr.type !== 'operator') || (!this.shouldSwapOperators(operator, rightExpr.operator)))
			return {
				type: "operator",
				operator: operator,
				left: leftExpr,
				right: rightExpr
			};

		rightExpr.left = {
			type: "operator",
			operator: operator,
			left: leftExpr,
			right: rightExpr.left,
		}
		return rightExpr;
	}
	/**
		* Check to see if it is an operator
	**/
	this.isOperator = () => (t = this.tokens[0], t === '+' || t === '-' || t === '*' || t === '/' || t === '%')
	
	/**
		* Wheter or not to swap operators
		* @param {expression} left expr
		* @param {expression} right expr
	**/
	this.shouldSwapOperators = (l, r) => l == '*' || l == '/' || l == '%' || r == '+' || r == '-'
	/**
		* Whether it is an identifier
	**/
	this.isIdentifier = () => this.tokens[0].match(/^[a-zA-Z][_a-zA-Z0-9]*$/)
	
	/**
		* Parse Assignments
	**/
	this.parseAssignment = () => {
		var N = this.tokens.shift();
		this.shift();
		var V = this.parseExpr();
		return {
			type: "assignment",
			name: N,
			value: V
		};
	}
	
	this.parseFnCall = () => {
		var that = this;
		var name = this.tokens.shift();
		var fn = this.functions[name];
		var args = fn.args.map(_ => {
			if (that.tokens.length === 0)
				throw "Too few arguments!";
			return [_, that.parse()];
		});
		return {
			type: "fnCall",
			name: name,
			args: args,
		};
	}
	this.parseContainer = () => {
		this.shift();
		var E = this.parseExpr();
		this.shift();
		return {
			type: 'container',
			child: E
		};
	}
	this.parseFnArgs = () => {
		var args = [];
		while (this.tokens[0] !== "=>")
			args.push(this.tokens.shift());
		if (this.containsDuplicates(args))
			throw "Duplicate argument names";
		return args;
	}
	this.containsDuplicates = array => {
		for (var i = 0; i < array.length; ++i)
			for (var j = i + 1; j < array.length; ++j)
				if (array[i] === array[j])
					return true;
		return false;
	}
	this.validateIdentifiers = (names, tree) => {
		var used = this.varNames(tree);
		used.forEach(function (name) {
			if (-1 === names.indexOf(name))
		throw `Unknown identifier: ${name}`
		});
	}
	this.varNames = T => {
		switch (T.type) {
		case "operator":
			return this.varNames(T.left).concat(this.varNames(T.right));
		case "number":
			return [];
		case "assignment":
			return this.varNames(T.value);
		case "identifier":
			return [T.value];
		case "function":
			return [];
		case "fnCall":
			var all = [];
			args.forEach(_ => 
			all = all.concat(crnt));
			return all;
		case "container":
			return this.varNames(T.child);
		case "noop":
			return [];
		default:
			throw `What type is : ${i(T)}`
		}
	}
}
a = new Interpreter;
document.write(a.input('1 + 3'))
