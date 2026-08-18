import trackingTemplate from "../protected/tracking-template.html";
import { createWorkerApp } from "./app.js";
import { sealedTrackingConfig } from "./tracking-sealed.js";

export default createWorkerApp({ trackingTemplate, sealedTrackingConfig });
