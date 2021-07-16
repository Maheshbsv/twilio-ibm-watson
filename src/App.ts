require('dotenv').config();

const accountSid = process.env.AccountSid as string;
const authToken = process.env.AuthToken as string;
const WATSON_ASSISTANT_API_KEY = process.env.WATSON_ASSISTANT_API_KEY as string;
const WATSON_ASSISTANT_ID = process.env.WATSON_ASSISTANT_ID as string;
const WATSON_ASSISTANT_URL = process.env.WATSON_ASSISTANT_URL as string;
const WATSON_ASSISTANT_VERSION = process.env.WATSON_ASSISTANT_VERSION as string;

import * as twilio from 'twilio';
var client = twilio(accountSid, authToken);
import { createServer } from 'http';
import * as express from 'express';
import { urlencoded } from 'body-parser';
import { WatsonAssistant } from './Watson';
import AssistantV2 = require('ibm-watson/assistant/v2');


export class App {
    public app: express.Application;
    constructor() {
        this.app = express();
        this.app.use(urlencoded({ extended: true }));
        const watson = new WatsonAssistant(WATSON_ASSISTANT_VERSION, WATSON_ASSISTANT_API_KEY, WATSON_ASSISTANT_URL, WATSON_ASSISTANT_ID);
        this.app.route('/sms')
            .post(async (req, res) => {
                var twilio = require('twilio');
                var twiml = new twilio.twiml.MessagingResponse();
                const session = await watson.getSession();
                console.log("Session: " + session);

                try {

                    const watsonresponse: AssistantV2.MessageResponse = await watson.getAssistantOutput(req.body.Body, session);
                    const generic: AssistantV2.RuntimeResponseGeneric[] = watsonresponse.output.generic as AssistantV2.RuntimeResponseGeneric[];
                    twiml.message(generic[0].text);
                } catch (error) {
                    twiml.message("Error from watson response");
                }
                // }
                res.writeHead(200, { 'Content-Type': 'text/xml' });
                res.end(twiml.toString());
            });
    }

}
export default new App().app;
