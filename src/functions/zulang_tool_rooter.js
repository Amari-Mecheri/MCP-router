import { app } from '@azure/functions';

// Get the base URL from environment variable or construct it
const BASE_URL = process.env.FUNCTION_BASE_URL;

app.http('zulang_tool_rooter', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            // GET request - return available tools with their URLs
            if (request.method === 'GET') {
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
                                method: 'POST',
                                parameters: {
                                    expression: {
                                        type: 'string',
                                        description: 'The Zuglang expression to translate',
                                        required: true
                                    }
                                }
                            },
                            {
                                name: 'zuglang_calculator',
                                description: 'Performs a calculation on two Zuglang expressions',
                                url: `${BASE_URL}/zuglang_calculator`,
                                method: 'POST',
                                parameters: {
                                    expression1: {
                                        type: 'string',
                                        description: 'The first Zuglang expression',
                                        required: true
                                    },
                                    expression2: {
                                        type: 'string',
                                        description: 'The second Zuglang expression',
                                        required: true
                                    },
                                    operator: {
                                        type: 'string',
                                        description: 'The operator to apply',
                                        enum: ['+', '-', '*', '/'],
                                        required: true
                                    }
                                }
                            }
                        ]
                    })
                };
            }

            // POST requests are not handled by router anymore
            // Tools have their own endpoints
            return {
                status: 405,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'This is a router endpoint. Use GET to discover tools, then call the tool-specific URLs returned.'
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

// Translator tool endpoint
app.http('zuglang_translator', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { expression } = body;

            if (!expression) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Missing required parameter: expression' })
                };
            }

            const result = translateZuglang(expression);

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'zuglang_translator',
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

// Calculator tool endpoint
app.http('zuglang_calculator', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { expression1, expression2, operator } = body;

            if (!expression1 || !expression2 || !operator) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: 'Missing required parameters: expression1, expression2, operator' 
                    })
                };
            }

            if (!['+', '-', '*', '/'].includes(operator)) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
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
        "xelgo kravid timzor pluven?": "Hello guys, what's up?",
        "morgat flixu": "Good morning",
        "zynthar polken": "Thank you",
        "brevix qaltor myx?": "How are you?"
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

// Zuglang calculation logic
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
                    return `Error: Zuglang has not defined Division by zero`;
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