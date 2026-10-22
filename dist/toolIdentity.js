// JARVIS Policy Engine — Canonical Tool Identity v6
const VALID_DECISIONS = new Set([
    "ALLOW",
    "APPROVAL",
    "DENY",
]);
export const TOOL_REGISTRY = [
    {
        id: "n8n.call_my_sub_workflow_1",
        realName: "n8n__Call_My_Sub-Workflow_1_",
        aliases: [],
        decision: "APPROVAL",
    },
];
function compareKey(name) {
    return name.trim().toLowerCase();
}
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function validKeysOf(tool) {
    const keys = [];
    if (!isBlank(tool.realName))
        keys.push(compareKey(tool.realName));
    if (!isBlank(tool.id))
        keys.push(compareKey(tool.id));
    if (Array.isArray(tool.aliases)) {
        for (const alias of tool.aliases) {
            if (!isBlank(alias))
                keys.push(compareKey(alias));
        }
    }
    return keys;
}
function validateTool(tool) {
    const errors = [];
    if (isBlank(tool.id))
        errors.push("Boş kanonik id");
    if (isBlank(tool.realName))
        errors.push(`"${tool.id}" için boş realName`);
    if (!VALID_DECISIONS.has(tool.decision)) {
        errors.push(`"${tool.id}" için geçersiz karar: ${String(tool.decision)}`);
    }
    if (!Array.isArray(tool.aliases)) {
        errors.push(`"${tool.id}" için aliases bir dizi olmalıdır`);
        return errors;
    }
    for (const alias of tool.aliases) {
        if (isBlank(alias))
            errors.push(`"${tool.id}" içinde boş alias`);
    }
    const seenKeys = new Set();
    for (const key of validKeysOf(tool)) {
        if (seenKeys.has(key)) {
            errors.push(`"${tool.id}" içinde tekrarlanan anahtar: "${key}"`);
        }
        seenKeys.add(key);
    }
    return errors;
}
export function validateRegistry() {
    const errors = [];
    const ownerByKey = new Map();
    const seenIds = new Set();
    for (let i = 0; i < TOOL_REGISTRY.length; i++) {
        const tool = TOOL_REGISTRY[i];
        errors.push(...validateTool(tool));
        if (!isBlank(tool.id)) {
            const idKey = compareKey(tool.id);
            if (seenIds.has(idKey)) {
                errors.push(`Yinelenen kanonik id: "${tool.id}"`);
            }
            else {
                seenIds.add(idKey);
            }
        }
        for (const key of validKeysOf(tool)) {
            const ownerIndex = ownerByKey.get(key);
            if (ownerIndex !== undefined && ownerIndex !== i) {
                errors.push(`Anahtar çakışması: "${key}" → kayıt[${ownerIndex}] ` +
                    `("${TOOL_REGISTRY[ownerIndex].id}") ve kayıt[${i}] ("${tool.id}")`);
            }
            else if (ownerIndex === undefined) {
                ownerByKey.set(key, i);
            }
        }
    }
    if (errors.length > 0) {
        throw new Error(`Tool kimliği kayıt doğrulaması başarısız:\n${errors.join("\n")}`);
    }
}
export function assertNoCollisions() {
    validateRegistry();
}
export function resolveCanonicalTool(raw) {
    if (isBlank(raw))
        return null;
    const key = compareKey(raw);
    const matches = TOOL_REGISTRY.filter((tool) => validKeysOf(tool).includes(key));
    return matches.length === 1 ? matches[0] : null;
}
