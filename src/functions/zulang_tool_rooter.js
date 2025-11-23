import { app } from '@azure/functions';

// Get the base URL from environment variable or construct it
const BASE_URL = process.env.FUNCTION_BASE_URL || 'https://your-function-app.azurewebsites.net/api';

app.http('zulang_tool_rooter', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tools: [
                        {
                            name: 'zuglang_translator',
                            description: 'Translates a Zuglang expression to natural language',
                            url: `${BASE_URL}/zuglang_translator`,
                            method: 'GET',
                            parameters: {
                                expression: {
                                    type: 'string',
                                    description: 'The Zuglang expression to translate (passed as query parameter)',
                                    required: true
                                }
                            },
                            example: `${BASE_URL}/zuglang_translator?expression=xelgo%20kravid%20timzor%20pluven%3F`
                        },
                        {
                            name: 'zuglang_calculator',
                            description: 'Performs a calculation on two Zuglang expressions',
                            url: `${BASE_URL}/zuglang_calculator`,
                            method: 'GET',
                            parameters: {
                                expression1: {
                                    type: 'string',
                                    description: 'The first Zuglang expression (query parameter)',
                                    required: true
                                },
                                expression2: {
                                    type: 'string',
                                    description: 'The second Zuglang expression (query parameter)',
                                    required: true
                                },
                                operator: {
                                    type: 'string',
                                    description: 'The operator to apply (query parameter)',
                                    enum: ['+', '-', '*', '/'],
                                    required: true
                                }
                            },
                            example: `${BASE_URL}/zuglang_calculator?expression1=BC&expression2=CF&operator=%2B`
                        }
                    ]
                })
            };
        } catch (error) {
            context.log.error('Error processing request:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: error.message
                })
            };
        }
    }
});

// Translator tool endpoint - now GET with query parameters
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
                    expression: expression,
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

// Calculator tool endpoint - now GET with query parameters
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
                    status: 400, body: JSON.stringify({
                        error: 'Missing required parameters: expression1, expression2, operator',
                        usage: 'Call with ?expression1=BC&expression2=CF&operator=%2B'
                    })
                };
            }

            // Fix double-encoded +
            if (operator === '%2B') operator = '+';

            if (!['+', '-', '*', '/'].includes(operator)) {
                return {
                    status: 400, body: JSON.stringify({
                        error: 'Invalid operator. Must be one of: +, -, *, /'
                    })
                };
            }

            const result = calculateZuglang(expression1, expression2, operator);

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

// Implement your Zuglang translation logic here
function translateZuglang(expression) {
    // Zuglang is a fictional constructed language
    // Example translations:
    const translations = {
        "xelgo kravid timzor pluven": "Hello guys, what's up?",
        "morgat flixu": "Good morning",
        "zynthar polken": "Thank you",
        "brevix qaltor myx": "How are you?",
        "zyu ogu agrir": "This is a test"
    };

    // Normalize the input (trim whitespace, lowercase)
    const normalized = expression.trim().toLowerCase();

    // Check if we have a direct translation
    if (translations[normalized]) {
        return translations[normalized];
    }

    // Otherwise, return a note that this expression needs to be added
    return `Translation not found for "${expression}". This Zuglang expression is not in the dictionary yet.`;
}

// Implement your Zuglang calculation logic here
function calculateZuglang(expression1, expression2, operator) {
    // Zuglang numbers use letters A-J to represent 0-9
    // A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9

    // Convert Zuglang number to decimal
    function zuglangToDecimal(zuglangNum) {
        const letterMap = {
            'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4,
            'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9
        };

        let result = 0;
        const digits = zuglangNum.toUpperCase().split('');

        for (let i = 0; i < digits.length; i++) {
            const digit = letterMap[digits[i]];
            if (digit === undefined) {
                throw new Error(`Invalid Zuglang digit: ${digits[i]}`);
            }
            result = result * 10 + digit;
        }

        return result;
    }

    // Convert decimal number to Zuglang
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
        return `Error: ${error.message}`;
    }
}