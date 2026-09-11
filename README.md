# 🛡️ AI Security Guardian - Browser Extension

AI Security Guardian is a privacy-first browser extension designed to audit and secure data sent to Large Language Model (LLM) platforms, such as ChatGPT, Claude, and Gemini, in real time. It performs client-side Data Loss Prevention (DLP) and Prompt Injection protection before sensitive information leaves the user's browser.

## 🚀 Features

- **Advanced DLP (Data Loss Prevention):** Automatically detects national IDs (TCKN), credit card numbers, email addresses, IBANs, IPv4 addresses, OpenAI/AWS API keys, GitHub tokens, JWTs, and Private Keys (PEM format).
- **Shannon Entropy Analysis:** Detects high-entropy, unstructured secrets, tokens, and complex passwords dynamically in the background.
- **Prompt Injection & Jailbreak Protection:** Intercepts System Prompt Extraction and DAN Mode / Jailbreak attempts based on OWASP LLM01 guidelines.
- **Flexible Modal Interception:** Prompts the user with "Mask & Send" (redacts sensitive entities), "Allow & Send" (bypasses restriction), or "Cancel" upon rule violations.
- **Minimalist Audit Dashboard:** Clean popup UI displaying total blocked threats recorded in `chrome.storage.local`.
- **Multi-Platform Support:** Seamlessly integrated with ChatGPT, Gemini, and Claude interfaces.

## 🛠️ Installation

1. Clone or download this repository:
   ```bash
   git clone [https://github.com/osmanisiktas/ai-security-guardian.git](https://github.com/osmanisiktas/ai-security-guardian.git)