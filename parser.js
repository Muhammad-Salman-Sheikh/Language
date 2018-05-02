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
	this.tokens[0] === 'Func' ? 
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
	})() : this.tokens[0] == 'Prime' ?
		(() => {
			this.shift();
				var N = this.tokens.shift(),
				    A = this.parsePrimeArgs();
			this.shift()
			var B = this.parseExpr();
			this.validateIdentifiers(A, B);
			return {
				type: "reserved",
				name: N,
				args: A
			};
	})() :
	this.parseExpr()
	
	this.shift = () => this.tokens.shift();

	this.parseExpr = () => {
		var leftExpr = null ,
			rightExpr = null;
		if (this.tokens.length === 0)
			throw "Hello, World!";
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
		} else if (this.tokens[0] === 'Func') {
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
	/**
		* Parse function calls
	**/
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
	/** 
		* Parse prime calls
	**/
	this.parsePrimeCall = () => {
		var that = this;
		var name = this.tokens.shift();
		var that = this;
		var name = this.tokens.shift();
		var args = '';
	}	
	/**
		* Parse container
	**/
	this.parseContainer = () => {
		this.shift();
		var E = this.parseExpr();
		this.shift();
		return {
			type: 'container',
			child: E
		};
	}
	/**
		* Parse function arguments. 
	**/
	this.parseFnArgs = () => {
		var args = [];
		while (this.tokens[0] !== "=>")
			args.push(this.tokens.shift());
		if (this.containsDuplicates(args))
			throw "Duplicate argument names";
		return args;
	}
	/**
		* Parse prime arguments
	**/
	this.parsePrimeArgs = () => {
		var args = [];
		while(this.tokens[0] !== ';')
			args.push(this.tokens.shift());
		return args;
	}	
	/**
		* Check to see for duplicate arguments
	**/
	this.containsDuplicates = A => {
		for (var i = 0; i < A.length; ++i)
			for (var j = i + 1; j < A.length; ++j)
				if (A[i] === A[j])
					return true;
		return false;
	}
	/**
		* Check for valid identifiers
	**/
	this.validateIdentifiers = (names, tree) => {
		var used = this.varNames(tree);
		used.forEach(_ => {
			if (names.indexOf(_) === -1)
				throw `Unknown identifier: ${_}`
		});
	}
	/**
		* Check for different Types of intput operators , numbers etc...
	**/
	this.varNames = T => {
		switch (T.type) {
		case "operator" :
			return this.varNames(T.left).concat(this.varNames(T.right));
		case "number" :
			return [];
		case "assignment" :
			return this.varNames(T.value);
		case "identifier" :
			return [T.value];
		case "function" :
			return [];
		case "fnCall" :
			var all = [];
			args.forEach(_ => 
				all = all.concat(_));
			return all;
		case "container" :
			return this.varNames(T.child);
		case "noop" :
			return [];
		default:
			throw `What type is : ${i(T)}`
		}
	}
}
