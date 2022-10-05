// Utils
export const composeValidate = (...functions) => value => {
    for(const fn of functions){
        const result = fn(value);
        if(typeof result === 'string' && result.length > 0){
            return result;
        };
    };
};

// String
export const validateStringIs = (value: unknown): string | undefined => typeof value === 'string' ? undefined : "Value is not a string.";
export const validateStringNoSpaces = (value: string): string | undefined => /^\S*$/.test(value) ? undefined : "It can't contain spaces.";
export const validateStringNoEmpty = (value: string): string | undefined => {
    if(typeof value === 'string'){
        if(value.length === 0){
            return "Value can not be empty."
        }else{
            return undefined;
        }
    };
};

export const validateStringMultipleLines = (options: {min?: number, max?: number} = {}) => (value: number) => {
    const lines = value.split(/\r\n|\r|\n/).length;
    if(typeof options.min !== 'undefined' && lines < options.min){
        return `The string should have more or equal to ${options.min} line/s.`;
    };
    if(typeof options.max !== 'undefined' && lines > options.max){
        return `The string should have less or equal to ${options.max} line/s.`;
    };
};

export const validateStringNoInvalidCharacters = (...invalidCharacters: string[]) => (value: string): string | undefined => invalidCharacters.some(invalidCharacter => value.includes(invalidCharacter)) ? `It can't contain invalid characters: ${invalidCharacters.join(', ')}.` : undefined;

export const validateStringNoStartWith = (...invalidStartingCharacters: string[]) => (value: string): string | undefined => invalidStartingCharacters.some(invalidStartingCharacter => value.startsWith(invalidStartingCharacter)) ? `It can't start with: ${invalidStartingCharacters.join(', ')}.` : undefined;

export const validateStringNoLiteral = (...invalidLiterals: string[]) => (value: string): string | undefined => invalidLiterals.some(invalidLiteral => value === invalidLiteral) ? `It can't be: ${invalidLiterals.join(', ')}.` : undefined;

// Boolean
export const validateBooleanIs = (value: string): string | undefined => typeof value === 'boolean' ? undefined : "It should be a boolean. Allowed values: true or false.";

// Number
export const validateNumber = (options: {min?: number, max?: number} = {}) => (value: number) => {
    if(typeof options.min !== 'undefined' && value < options.min){
        return `Value should be greater or equal than ${options.min}.`;
    };
    if(typeof options.max !== 'undefined' && value > options.max){
        return `Value should be lower or equal than ${options.max}.`;
    };
};

// Complex
export const validateJSON = (validateParsed: (object: any) => string | undefined) => (value: string) => {
    let jsonObject;
    // Try to parse the string as JSON
    try{
        jsonObject = JSON.parse(value);
    }catch(error){
        return "Value can't be parsed. There is some error.";
    };

    return validateParsed ? validateParsed(jsonObject) : undefined;
};

export const validateObjectArray = (validationElement: (json: any) => string | undefined) => (value: unknown[]) => {
    // Check the JSON is an array
    if(!Array.isArray(value)){
        return 'Value is not a valid list.';
    };

    return validationElement ? value.reduce((accum, elementValue) => {
        if(accum){
            return accum;
        };

        const resultValidationElement = validationElement(elementValue);
        if(resultValidationElement){
            return resultValidationElement;
        };

        return accum;
    }, undefined) : undefined;
};

export const validateLiteral = (literals) => (value: any): string | undefined => literals.includes(value) ? undefined : `Invalid value. Allowed values: ${literals.map(String).join(', ')}.`;
