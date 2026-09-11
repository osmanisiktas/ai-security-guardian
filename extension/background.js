const PATTERNS = {
  NATIONAL_ID_TR: {
    regex: /\b[1-9][0-9]{10}\b/g,
    label: "National ID (TCKN)",
    token: "[REDACTED_TCKN]",
    compliance: "KVKK, GDPR"
  },
  SSN_US: {
    regex: /\b(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}\b/g,
    label: "Social Security Number (SSN)",
    token: "[REDACTED_SSN]",
    compliance: "HIPAA, CCPA, GDPR"
  },
  CREDIT_CARD: {
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/g,
    label: "Credit Card",
    token: "[REDACTED_CREDIT_CARD]",
    compliance: "PCI-DSS"
  },
  EMAIL: {
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    label: "Email Address",
    token: "[REDACTED_EMAIL]",
    compliance: "GDPR, HIPAA, CCPA, KVKK"
  },
  API_KEY: {
    regex: /\b(sk-[a-zA-Z0-9_\-]{20,})\b/g,
    label: "API Key",
    token: "[REDACTED_API_KEY]",
    compliance: "OWASP LLM06, MITRE ATLAS"
  }
};

const INJECTION_PATTERNS = [
  { regex: /ignore\s+(all\s+)?previous\s+instructions/i, type: "Jailbreak" },
  { regex: /system\s+prompt/i, type: "System Prompt Extraction" },
  { regex: /bypass\s+filters/i, type: "Filter Bypass" },
  { regex: /override\s+rules/i, type: "Rule Override" },
  { regex: /dan\s+mode/i, type: "DAN Mode (Roleplay)" },
  { regex: /you\s+are\s+now\s+in\s+developer\s+mode/i, type: "Developer Mode" }
];

function logToSIEM(severity, eventType, targetSite, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    severity: severity,
    event: eventType,
    site: targetSite,
    details: details
  };
  console.log(`🛡️ [SIEM AUDIT TRAIL] [${severity}]`, logEntry);
  chrome.storage.local.get({ siem_logs: [] }, (result) => {
    const logs = result.siem_logs;
    logs.push(logEntry);
    chrome.storage.local.set({ siem_logs: logs });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INSPECT_PROMPT") {
    const rawPrompt = request.prompt;
    const targetSite = request.site;
    let sanitizedPrompt = rawPrompt;
    let warnings = [];
    let hasViolation = false;

    for (const [key, config] of Object.entries(PATTERNS)) {
      if (config.regex.test(rawPrompt)) {
        hasViolation = true;
        warnings.push(`[${config.compliance}] - Sensitive Data (${config.label}) detected.`);
        sanitizedPrompt = sanitizedPrompt.replace(config.regex, config.token);
        logToSIEM("HIGH", "DATA_LEAKAGE_PREVENTION", targetSite, { entity: config.label, framework: config.compliance });
      }
      config.regex.lastIndex = 0;
    }

    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.regex.test(rawPrompt)) {
        hasViolation = true;
        warnings.push(`[OWASP LLM01, MITRE ATLAS] - Injection Pattern: '${pattern.type}'`);
        logToSIEM("CRITICAL", "PROMPT_INJECTION_DETECTED", targetSite, { type: pattern.type });
      }
    }

    if (hasViolation) {
      sendResponse({
        success: true,
        data: {
          action: "WARN",
          warnings: warnings,
          sanitized_prompt: sanitizedPrompt,
          target_site: targetSite
        }
      });
    } else {
      sendResponse({ success: true, data: { action: "ALLOW" } });
    }
  }
  return true;
});