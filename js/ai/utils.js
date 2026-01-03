/**
 * @typedef {import('firebase/ai').GenerativeModel} GenerativeModel
 * @typedef {import('firebase/ai').Schema} Schema
 * @typedef {import('firebase/ai').AI} AI
 */

import { getGenerativeModel } from 'firebase/ai';

/**
 * Runs a generative model with a prompt and schema to generate structured output
 * @param {AI} ai - The Firebase AI instance
 * @param {string} userInput - The user's text input containing family information
 * @param {Schema} schema - The schema to use for structured output
 * @returns {Promise<Object>} The structured FGR data object
 */
export async function run(ai, userInput, schema) {
    const prompt = `Given this user input, create a Family Group Record (FGR). Extract all available information about the family, including:

- Father's name and information (birth, death, marriage dates, parents, etc.)
- Mother's name and information (birth, death, marriage dates, parents, etc.)
- Children's names and information (birth, death, marriage dates, spouses, etc.)
- Any events (birth, death, marriage, etc.) with dates, places, and sources
- Preparer information if mentioned
- Any comments or additional notes

The user input may be in any format or order. Extract and organize the information into a structured Family Group Record.

User input:
${userInput}`;

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