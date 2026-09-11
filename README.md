# 🛡️ AI Security Guardian (Local DLP for LLMs)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-success.svg)
![Compliance](https://img.shields.io/badge/Compliance-OWASP%20%7C%20GDPR%20%7C%20HIPAA-orange.svg)
![Environment](https://img.shields.io/badge/Environment-Pure%20JS%20(Client--Side)-lightgrey.svg)

**AI Security Guardian** is a lightweight, fully local (Client-Side) browser extension designed to protect enterprise data and enforce security guardrails when users interact with Generative AI platforms like **ChatGPT, Claude, and Gemini**. 

It acts as a real-time Data Loss Prevention (DLP) endpoint firewall, preventing sensitive information leakage and blocking advanced prompt injection attacks before the data ever reaches the AI servers.

## ✨ Key Features

- **Zero External Dependencies:** Runs entirely in the browser using Pure JavaScript and Manifest V3. No Python servers, no backend API calls, no external latency.
- **Real-Time Data Redaction ("Mask & Send"):** Automatically detects and masks PII, PHI, Credit Cards, and API Keys.
- **Prompt Injection Defense:** Intercepts jailbreaks, roleplay bypasses, and system prompt extraction attempts.
- **Multi-Platform Support:** Seamlessly integrates with the dynamic DOMs of ChatGPT, Google Gemini, and Anthropic Claude.
- **Audit Trail & SIEM Integration:** Logs all security events locally for compliance and incident response tracking.
- **Zero False Positives in Clean Flow:** Does not interrupt the user experience when benign prompts are submitted.

## 🏛️ Security Frameworks & Compliance

This tool is built upon globally recognized cybersecurity and AI governance standards:

* **Threat Modeling:** Compliant with [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) (LLM01: Prompt Injection & LLM06: Sensitive Information Disclosure) and **MITRE ATLAS** (AML.T0051 & AML.T0057).
* **Execution Guardrails:** Inspired by **NVIDIA NeMo Guardrails** principles for runtime validation.
* **Global Privacy Regulations:** Features out-of-the-box regex detection for **GDPR, HIPAA, CCPA, KVKK, and PCI-DSS** (National IDs, SSNs, Credit Cards, Emails, etc.).

## 🚀 Installation (Developer Mode)

Since this is a custom enterprise extension, you can run it locally in Chrome, Brave, or Edge:

1. Clone or download this repository to your local machine.
2. Open your Chromium-based browser and navigate to the extensions page (`chrome://extensions/` or `brave://extensions/`).
3. Enable **"Developer mode"** in the top right corner.
4. Click on **"Load unpacked"** and select the folder containing this repository.
5. The extension is now active! Open ChatGPT, Claude, or Gemini to test it.

## 🛠️ How It Works (Architecture)

1. **Event Locking:** The `content.js` script attaches to the AI platform's input box, intercepting `Enter` key presses and `click/mousedown` events on the send button.
2. **Inspection:** It sends the raw prompt to `background.js` (Service Worker) where it is evaluated against security regex patterns and compliance tags.
3. **Intervention:** - If a violation is found, a UI overlay pops up warning the user. The user can choose to **"Mask & Send"**, which redacts the sensitive data (e.g., `[REDACTED_API_KEY]`) and securely transmits the sanitized payload.
   - If the prompt is clean, it passes through seamlessly with a background `PROMPT_CLEAN` log.

## 📝 Logging & Audit

All intercepted malicious attempts are securely logged in the browser's `chrome.storage.local` in a SIEM-ready JSON format. You can view real-time interception logs in the browser's Developer Tools Console (`F12`).

---
*Disclaimer: This is an open-source project created to demonstrate Client-Side AI security methodologies. Always ensure comprehensive security measures in production environments.*