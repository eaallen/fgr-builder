/**
 * @typedef {import('firebase/ai').GenerativeModel} GenerativeModel
 * @typedef {import('firebase/ai').Schema} Schema
 * @typedef {import('firebase/ai').AI} AI
 */

import { getGenerativeModel } from 'firebase/ai';
import { collectFormData } from '../form/formManager';
import { formatRecordAsText } from '../export/export';

/**
 * Runs a generative model with a prompt and schema to generate structured output
 * @param {AI} ai - The Firebase AI instance
 * @param {string} userInput - The user's text input containing family information
 * @param {Schema} schema - The schema to use for structured output
 * @returns {Promise<Object>} The structured FGR data object
 */
export async function run(ai, userInput, schema) {
    const currentFGR = collectFormData();
    const currentFGRText = formatRecordAsText(currentFGR);
    const prompt = `
## Instructions
Given this user input, create a Family Group Record (FGR). Extract all available information about the family, including:

- Father's name and information (birth, death, marriage dates, parents, etc.)
- Mother's name and information (birth, death, marriage dates, parents, etc.)
- Children's names and information (birth, death, marriage dates, spouses, etc.)
- Any events (birth, death, marriage, etc.) with dates, places, and sources
- Preparer information if mentioned
- Any comments or additional notes

The user input may be in any format or order. Extract and organize the information into a structured Family Group Record.

The User Input will be HTML formatted. Get the text out of the html, and be sure to include any given links with the respective sources. 

When dealing with links/urls, use <a> tags with the href attribute to include the link. With greater than or less than signs, DO NOT use the &gt; and &lt; Just use > and <.

## Steps
1. Read the current FGR and the user input (it might be an empty template or full of information).
2. Extract the information from the user input.
3. Organize the information into a structured Family Group Record.
4. Return the structured Family Group Record.

## Current FGR
${currentFGRText}

## User Input
${userInput}
`;

    // Create a model instance with the schema configured
    const model = getGenerativeModel(ai, {
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        },
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}