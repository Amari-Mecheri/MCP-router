import { app } from '@azure/functions';

// Get the base URL from environment variable
const BASE_URL = process.env.FUNCTION_BASE_URL;

// Validation to ensure the environment variable is present at runtime.
if (!BASE_URL) {
    throw new Error("FATAL: FUNCTION_BASE_URL environment variable must be set in Azure Function App settings.");
}

// --- Utility Functions (Consolidated and made globally available) ---

/**
 * Converts a Zuglang number (e.g., "BC") to its standard decimal integer.
 * Zuglang uses letters A-J to represent 0-9 (A=0, B=1, ..., J=9).
 * @param {string} zuglangNum - The Zuglang number string.
 * @returns {number} The decimal integer equivalent.
 */
function zuglangToDecimal(zuglangNum) {
    const letterMap = {
        'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4,
        'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9
    };

    let result = 0;
    const digits = zuglangNum.toUpperCase().split('');

    for (const digitChar of digits) {
        const digit = letterMap[digitChar];
        if (digit === undefined) {
            throw new Error(`Invalid Zuglang digit: ${digitChar}. Must be A-J.`);
        }
        result = result * 10 + digit;
    }

    return result;
}

/**
 * Converts a standard decimal integer to its Zuglang number representation.
 * @param {number} decimalNum - The decimal integer.
 * @returns {string} The Zuglang number string.
 */
function decimalToZuglang(decimalNum) {
    const digitMap = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    if (decimalNum === 0) return 'A';

    let result = '';
    let num = Math.abs(decimalNum);

    while (num > 0) {
        result = digitMap[num % 10] + result;
        num = Math.floor(num / 10);
    }

    return decimalNum < 0 ? '-' + result : result;
}

/**
 * Translates a Zuglang phrase to natural language.
 * @param {string} expression - The Zuglang phrase.
 * @returns {string} The translated result or a "not found" message.
 */
function translateZuglang(expression) {
    // Zuglang is a fictional constructed language
    const translations = {
        "xelgo kravid timzor pluven": "Hello guys, what's up?",
        "morgat flixu": "Good morning",
        "zynthar polken": "Thank you",
        "brevix qaltor myx": "How are you?",
        "zyu ogu agrir": "This is a test"
    };

    // Normalize the input (trim whitespace, lowercase, remove punctuation)
    const normalized = expression.trim().toLowerCase().replace(/[?.,!]/g, '');

    if (translations[normalized]) {
        return translations[normalized];
    }

    return `Translation not found for "${expression}". This Zuglang expression is not in the dictionary yet.`;
}

/**
 * Performs arithmetic on two Zuglang numbers.
 * @param {string} expression1 - The first Zuglang number.
 * @param {string} expression2 - The second Zuglang number.
 * @param {string} operator - The arithmetic operator (+, -, *, /).
 * @returns {string} The calculation result in Zuglang format, including the decimal breakdown, or an error message.
 */
function calculateZuglang(expression1, expression2, operator) {
    try {
        // Convert expressions to decimal
        const num1 = zuglangToDecimal(expression1);
        const num2 = zuglangToDecimal(expression2);

        // Perform calculation
        let result;
        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 === 0) {
                    return `Error: Division by zero`;
                }
                result = Math.floor(num1 / num2); // Integer division
                break;
            default:
                return `Error: Invalid operator ${operator}`;
        }

        const zuglangResult = decimalToZuglang(result);

        return `${expression1} ${operator} ${expression2} = ${zuglangResult} (${num1} ${operator} ${num2} = ${result} in decimal)`;

    } catch (error) {
        return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
}


// -------------------------------------------------------------------
// --- 1. Tool Rooter Function (Lists all available tools) ---

app.http('zulang_tool_rooter', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        // Array containing the definitions for all four exposed tools.
        const tools = [
            {
                name: 'zuglang_translator',
                description: 'Translates a Zuglang expression (sentence or phrase) to natural language. Use this for general text translation.',
                url: `${BASE_URL}/zuglang_translator`,
                method: 'GET',
                parameters: {
                    expression: {
                        type: 'string',
                        description: 'The Zuglang expression to translate (passed as query parameter)',
                        required: true
                    }
                },
                example: `${BASE_URL}/zuglang_translator?expression=xelgo%20kravid%20timzor%20pluven`
            },
            {
                name: 'zuglang_calculator',
                description: 'Performs basic arithmetic (+, -, *, /) on two Zuglang numbers and returns the result in Zuglang. Zuglang uses A=0, B=1, ..., J=9.',
                url: `${BASE_URL}/zuglang_calculator`,
                method: 'GET',
                parameters: {
                    expression1: {
                        type: 'string',
                        description: 'The first Zuglang number (query parameter)',
                        required: true
                    },
                    expression2: {
                        type: 'string',
                        description: 'The second Zuglang number (query parameter)',
                        required: true
                    },
                    operator: {
                        type: 'string',
                        description: 'The arithmetic operator to apply',
                        enum: ['+', '-', '*', '/'],
                        required: true
                    }
                },
                example: `${BASE_URL}/zuglang_calculator?expression1=BC&expression2=CF&operator=%2B`
            },
            {
                name: 'zuglang_number_to_decimal',
                description: 'Converts a Zuglang number (e.g., "BC") into its standard decimal (base-10) integer representation (e.g., 12).',
                url: `${BASE_URL}/zuglang_number_to_decimal`,
                method: 'GET',
                parameters: {
                    expression: {
                        type: 'string',
                        description: 'The Zuglang number to convert to decimal (query parameter)',
                        required: true
                    }
                },
                example: `${BASE_URL}/zuglang_number_to_decimal?expression=JIA`
            },
            {
                name: 'decimal_to_zuglang_number',
                description: 'Converts a standard decimal (base-10) integer (e.g., 980) into its Zuglang number representation (e.g., "JIA").',
                url: `${BASE_URL}/decimal_to_zuglang_number`,
                method: 'GET',
                parameters: {
                    expression: {
                        type: 'string',
                        description: 'The decimal integer to convert to Zuglang (query parameter)',
                        required: true
                    }
                },
                example: `${BASE_URL}/decimal_to_zuglang_number?expression=980`
            }
        ];

        try {
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tools })
            };
        } catch (error) {
            context.log.error('Error processing request in rooter:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Internal Server Error in tool rooter.' })
            };
        }
    }
});


// -------------------------------------------------------------------
// --- 2. Translator Tool Endpoint ---

app.http('zuglang_translator', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const expression = request.query.get('expression');

            if (!expression) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Missing required parameter: expression',
                        usage: 'Call with ?expression=your_zuglang_text'
                    })
                };
            }

            const result = translateZuglang(expression);

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'zuglang_translator',
                    input_expression: expression,
                    result: result
                })
            };
        } catch (error) {
            context.log.error('Translator error:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});


// -------------------------------------------------------------------
// --- 3. Calculator Tool Endpoint ---

app.http('zuglang_calculator', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const expression1 = request.query.get('expression1');
            const expression2 = request.query.get('expression2');
            let operator = (request.query.get('operator') || '').trim();

            if (!expression1 || !expression2 || !operator) {
                return {
                    status: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                        error: 'Missing required parameters: expression1, expression2, operator',
                        usage: 'Call with ?expression1=BC&expression2=CF&operator=%2B'
                    })
                };
            }

            // Fix double-encoded +
            if (operator === '%2B') operator = '+';

            if (!['+', '-', '*', '/'].includes(operator)) {
                return {
                    status: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                        error: 'Invalid operator. Must be one of: +, -, *, /'
                    })
                };
            }

            const result = calculateZuglang(expression1, expression2, operator);

            // Handle logic errors from calculateZuglang (e.g., division by zero, invalid digits)
            if (result.startsWith('Error:')) {
                return {
                    status: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: result })
                };
            }

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'zuglang_calculator',
                    expression1: expression1,
                    expression2: expression2,
                    operator: operator,
                    result: result
                })
            };
        } catch (error) {
            context.log.error('Calculator error:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});


// -------------------------------------------------------------------
// --- 4. Zuglang to Decimal Converter Tool Endpoint ---

app.http('zuglang_number_to_decimal', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const expression = request.query.get('expression');

            if (!expression) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Missing required parameter: expression',
                        usage: 'Call with ?expression=your_zuglang_number'
                    })
                };
            }

            const decimalResult = zuglangToDecimal(expression);

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'zuglang_number_to_decimal',
                    zuglang_number: expression,
                    decimal_result: decimalResult
                })
            };
        } catch (error) {
            context.log.error('Conversion error:', error);
            return {
                status: 400, // 400 Bad Request for invalid input format
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: `Invalid input for Zuglang conversion: ${error.message}` })
            };
        }
    }
});


// -------------------------------------------------------------------
// --- 5. Decimal to Zuglang Converter Tool Endpoint ---

app.http('decimal_to_zuglang_number', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const expression = request.query.get('expression');

            if (!expression) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Missing required parameter: expression',
                        usage: 'Call with ?expression=your_decimal_number'
                    })
                };
            }
            
            const decimalInput = parseInt(expression, 10);
            if (isNaN(decimalInput) || !Number.isInteger(decimalInput)) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Invalid input: expression must be a valid integer.',
                    })
                };
            }

            const zuglangResult = decimalToZuglang(decimalInput);

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'decimal_to_zuglang_number',
                    decimal_number: decimalInput,
                    zuglang_result: zuglangResult
                })
            };
        } catch (error) {
            context.log.error('Conversion error:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});