import * as AssistantV2 from "ibm-watson/assistant/v2";
import { RuntimeIntent, MessageResponse } from "ibm-watson/assistant/v2";
import { IamAuthenticator } from "ibm-watson/auth";

export class WatsonAssistant {
    private assistant: AssistantV2;
    private sessionCreation: number;
    private sessionId: string = "";

    constructor(
        private version: string,
        private apiKey: string,
        private url: string,
        private assistantId: string,
    ) {
        if (!version) {
            throw new Error(`[${WatsonAssistant.name}]: Missing parameter. watson lib version is required`);
        }
        if (!apiKey) {
            throw new Error(`[${WatsonAssistant.name}]: Missing parameter. watson key is required`);
        }
        if (!url) {
            throw new Error(`[${WatsonAssistant.name}]: Missing parameter. watson url is required`);
        }
        if (!assistantId) {
            throw new Error(`[${WatsonAssistant.name}]: Missing parameter. watson assistant id required`);
        }
        this.assistant = new AssistantV2({
            version: this.version,
            authenticator: new IamAuthenticator({ apikey: this.apiKey }),
            url: this.url,
            headers: {
                "X-Watson-Learning-Opt-Out": "true", // Prevent IBM usage of API requests data
            },
        });
        this.sessionCreation = Date.now();

    }

    public async getAssistantOutput(text: string, session: string): Promise<MessageResponse> {
        try {
            // const session = await this.getSession();
            const response = await this.message(text, session);
            return response;
        } catch (error) {
            throw error;
        }
    }

    public async getSession(): Promise<string> {

        if (this.currentSessionExpired() || this.sessionId === "") {
            this.sessionId = await this.createSession();
            this.sessionCreation = Date.now();
        }
        return this.sessionId;
    }

    public async createSession(): Promise<string> {
        return this.assistant
            .createSession({ assistantId: this.assistantId })
            .then(response => response.result.session_id);
    }

    public async deleteSession(session: string): Promise<any> {
        return this.assistant.deleteSession({
            sessionId: session,
            assistantId: this.assistantId,
        });
    }

    private async message(text: string, session: string): Promise<MessageResponse> {
        return this.assistant.message({
            assistantId: this.assistantId,
            sessionId: session,
            input: {
                message_type: "text",
                text,
                options: {
                    return_context: true,
                    debug: true,
                },
            },

        })
            .then(response => response.result);
    }

    private currentSessionExpired(): boolean {
        const fourMinutes = 240000;
        const currentTime = new Date();
        const elapsed = currentTime.valueOf() - this.sessionCreation.valueOf();
        // const elapsed = currentTime.valueOf() - lastInteraction;
        return elapsed > fourMinutes;
    }
}
