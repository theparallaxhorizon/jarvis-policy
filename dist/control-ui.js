import { defineControlUiPlugin } from "openclaw/plugin-sdk/control-ui";
import { createFeatureClient } from "openclaw/plugin-sdk/feature-contract";
import { contract } from "./contract.js";
import "./control-ui.css";
export default defineControlUiPlugin({
    id: contract.pluginId,
    activate(host) {
        host.ui.registerNavigation({ id: "drafts", label: "JARVIS Policy Engine", page: { id: "drafts" }, icon: "fileText" });
        host.ui.registerPage({
            id: "drafts", label: "JARVIS Policy Engine",
            mount(container, context) {
                const feature = createFeatureClient(contract, context.host);
                const section = document.createElement("section");
                section.className = "feature-draft-page";
                const heading = document.createElement("h1");
                heading.textContent = "JARVIS Policy Engine";
                const input = document.createElement("textarea");
                input.placeholder = "Paste a draft to analyze";
                input.setAttribute("aria-label", "Draft to analyze");
                const button = document.createElement("button");
                button.textContent = "Analyze draft";
                const result = document.createElement("output");
                result.setAttribute("aria-live", "polite");
                button.onclick = async () => {
                    button.disabled = true;
                    try {
                        const report = await feature.invoke("analyze", { text: input.value });
                        if (!context.signal.aborted) {
                            result.textContent = report.words + " words · " + report.lines + " lines\n" + report.headings.join("\n");
                        }
                    }
                    catch (error) {
                        if (!context.signal.aborted)
                            result.textContent = String(error);
                    }
                    finally {
                        if (!context.signal.aborted)
                            button.disabled = false;
                    }
                };
                section.append(heading, input, button, result);
                container.append(section);
                return { dispose: () => section.remove() };
            },
        });
        host.ui.registerReplacement({
            id: "draft-composer", surface: "composer", label: "Draft composer",
            mount(container, context) {
                let current = context;
                const form = document.createElement("form");
                form.className = "feature-draft-composer";
                const input = document.createElement("textarea");
                input.setAttribute("aria-label", "Draft message");
                input.oninput = () => current.props.setDraft(input.value);
                const send = document.createElement("button");
                send.type = "submit";
                send.textContent = "Send message";
                const error = document.createElement("output");
                error.setAttribute("aria-live", "polite");
                form.onsubmit = async (event) => {
                    event.preventDefault();
                    if (!current.props.canSend)
                        return;
                    const submitted = current;
                    error.textContent = "";
                    try {
                        const accepted = await submitted.props.send();
                        if (!submitted.signal.aborted && accepted === false)
                            error.textContent = "Message was not sent. Check the connection and session permissions.";
                    }
                    catch (cause) {
                        if (!submitted.signal.aborted)
                            error.textContent = String(cause);
                    }
                };
                const update = (next) => {
                    current = next;
                    if (input.value !== next.props.draft)
                        input.value = next.props.draft;
                    send.disabled = !next.props.canSend;
                };
                update(context);
                form.append(input, send, error);
                container.append(form);
                return { update, focus: () => input.focus(), dispose: () => form.remove() };
            },
        });
    },
});
