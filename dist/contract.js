import { Type } from "typebox";
import { defineFeatureContract } from "openclaw/plugin-sdk/feature-contract";
export const contract = defineFeatureContract({
    pluginId: "jarvis-policy",
    operations: {
        analyze: {
            kind: "query",
            description: "Count words and lines and list Markdown headings in a draft.",
            input: Type.Object({ text: Type.String({ maxLength: 32000 }) }, { additionalProperties: false }),
            output: Type.Object({ words: Type.Integer(), lines: Type.Integer(), headings: Type.Array(Type.String()) }),
            tool: { name: "jarvis_policy_analyze", label: "Analyze draft" },
        },
    },
    events: {},
});
