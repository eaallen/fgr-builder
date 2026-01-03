import { Schema } from "firebase/ai";

/**
 * Schema for Family Group Record (FGR) data structure
 * Based on the form data structure in js/form/formManager.js
 */
export const fgrSchema = Schema.object({
    properties: {
        // Family header information
        fatherName: Schema.string(),
        motherName: Schema.string(),
        recordDate: Schema.string(),
        recordId: Schema.string(),
        created: Schema.string(),
        comments: Schema.string(),

        // Father information
        father: Schema.object({
            properties: {
                name: Schema.string(),
                father: Schema.string(),
                fatherSource: Schema.object({
                    properties: {
                        content: Schema.string(),
                        sourceNumber: Schema.number(),
                    },
                    optionalProperties: ["content", "sourceNumber"],
                }),
                mother: Schema.string(),
                motherSource: Schema.object({
                    properties: {
                        content: Schema.string(),
                        sourceNumber: Schema.number(),
                    },
                    optionalProperties: ["content", "sourceNumber"],
                }),
                events: Schema.array({
                    items: Schema.object({
                        properties: {
                            id: Schema.string(),
                            type: Schema.string(),
                            date: Schema.string(),
                            description: Schema.string(),
                            place: Schema.string(),
                            sources: Schema.string(),
                            sourceNumber: Schema.number(),
                        },
                        optionalProperties: ["place", "sources", "sourceNumber"],
                    }),
                }),
            },
            optionalProperties: ["father", "mother", "fatherSource", "motherSource"],
        }),

        // Mother information
        mother: Schema.object({
            properties: {
                name: Schema.string(),
                father: Schema.string(),
                fatherSource: Schema.object({
                    properties: {
                        content: Schema.string(),
                        sourceNumber: Schema.number(),
                    },
                    optionalProperties: ["content", "sourceNumber"],
                }),
                mother: Schema.string(),
                motherSource: Schema.object({
                    properties: {
                        content: Schema.string(),
                        sourceNumber: Schema.number(),
                    },
                    optionalProperties: ["content", "sourceNumber"],
                }),
                events: Schema.array({
                    items: Schema.object({
                        properties: {
                            id: Schema.string(),
                            type: Schema.string(),
                            date: Schema.string(),
                            description: Schema.string(),
                            place: Schema.string(),
                            sources: Schema.string(),
                            sourceNumber: Schema.number(),
                        },
                        optionalProperties: ["place", "sources", "sourceNumber"],
                    }),
                }),
            },
            optionalProperties: ["father", "mother", "fatherSource", "motherSource",],
        }),

        // Children array
        children: Schema.array({
            items: Schema.object({
                properties: {
                    id: Schema.string(),
                    name: Schema.string(),
                    spouses: Schema.array({
                        items: Schema.object({
                            properties: {
                                id: Schema.string(),
                                name: Schema.string(),
                                source: Schema.object({
                                    properties: {
                                        content: Schema.string(),
                                        sourceNumber: Schema.number(),
                                    },
                                    optionalProperties: ["content", "sourceNumber"],
                                }),
                            },
                        }),
                    }),
                    events: Schema.array({
                        items: Schema.object({
                            properties: {
                                id: Schema.string(),
                                type: Schema.string(),
                                date: Schema.string(),
                                description: Schema.string(),
                                place: Schema.string(),
                                sources: Schema.string(),
                                sourceNumber: Schema.number(),
                            },
                            optionalProperties: ["place", "sources", "sourceNumber"],
                        }),
                    }),
                },
            }),
        }),

        // Preparer information
        preparer: Schema.object({
            properties: {
                name: Schema.string(),
                address: Schema.string(),
                email: Schema.string(),
            },
            optionalProperties: ["address"],
        }),
    },
    optionalProperties: ["comments", "children", "created"],
});