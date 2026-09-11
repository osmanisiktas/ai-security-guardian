// AI Security Guardian - Advanced Background Worker

const ENTROPY_THRESHOLD = 4.5;

const RULES = {
  // DLP Patterns
  TCKN: /\b[1-9]\d{10}\b/g,
  CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/g,
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  OPENAI_KEY: /\bsk-[a-zA-Z0-9T3BlbkFJ]{20,}\b|\bsk-proj-[a-zA-Z0-9_-]{20,}\b/g,
  AWS_KEY: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g,
  GITHUB_TOKEN: /\bghp_[a-zA-Z0-9]{36}\b/g,
  JWT_TOKEN: /\beyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\b/g,
  PRIVATE_KEY: /-----BEGIN (RSA|EC|OPENSSH|DSA)? PRIVATE KEY-----[\s\S]*?-----END \1 PRIVATE KEY-----/g,
  IBAN: /\bTR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}\b/gi,
  IPV4: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,

  // OWASP LLM01 - Prompt Injection / Jailbreak Patterns
  SYSTEM_PROMPT_EXTRACTION: /(ignore\s+all\s+previous\s+instructions|system\s+prompt|repeat\s+the\s+text\s+above|reveal\s+your\s+instructions)/i,
  JAILBREAK_DAN: /(dan\s+mode|do\ privilege\ anything\ now|jailbreak|bypass\s+filter)/i
};

function calculateEntropy(str) {
  if (!str) return 0;
  const len = str.length;
  const frequencies = {};
  for (let char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  return Object.values(frequencies).reduce((sum, count) => {
    const p = count / len;
    return sum - p * Math.log2(p);
  }, 0);
}

function detectHighEntropyTokens(text) {
  const words = text.split(/\s+/);
  const detectedTokens = [];
  
  for (let word of words) {
    const cleanWord = word.replace(/[^a-zA-Z0-9_-]/g, "");
    if (cleanWord.length >= 20 && calculateEntropy(cleanWord) >= ENTROPY_THRESHOLD) {
      detectedTokens.push(cleanWord);
    }
  }
  return detectedTokens;
}

function inspectText(text) {
  let warnings = [];
  let sanitizedText = text;

  // 1. Regex Bazlı Kontroller
  if (RULES.TCKN.test(text)) {
    warnings.push("TCKN Detected");
    sanitizedText = sanitizedText.replace(RULES.TCKN, "[REDACTED_TCKN]");
  }
  if (RULES.CREDIT_CARD.test(text)) {
    warnings.push("Credit Card Number Detected");
    sanitizedText = sanitizedText.replace(RULES.CREDIT_CARD, "[REDACTED_CARD]");
  }
  if (RULES.EMAIL.test(text)) {
    warnings.push("E-mail Address Detected");
    sanitizedText = sanitizedText.replace(RULES.EMAIL, "[REDACTED_EMAIL]");
  }
  if (RULES.OPENAI_KEY.test(text)) {
    warnings.push("OpenAI API Key Detected");
    sanitizedText = sanitizedText.replace(RULES.OPENAI_KEY, "[REDACTED_API_KEY]");
  }
  if (RULES.AWS_KEY.test(text)) {
    warnings.push("AWS Key Detected");
    sanitizedText = sanitizedText.replace(RULES.AWS_KEY, "[REDACTED_AWS_KEY]");
  }
  if (RULES.GITHUB_TOKEN.test(text)) {
    warnings.push("GitHub Token Detected");
    sanitizedText = sanitizedText.replace(RULES.GITHUB_TOKEN, "[REDACTED_GITHUB_TOKEN]");
  }
  if (RULES.JWT_TOKEN.test(text)) {
    warnings.push("JWT Token Detected");
    sanitizedText = sanitizedText.replace(RULES.JWT_TOKEN, "[REDACTED_JWT]");
  }
  if (RULES.PRIVATE_KEY.test(text)) {
    warnings.push("Private Key Detected");
    sanitizedText = sanitizedText.replace(RULES.PRIVATE_KEY, "[REDACTED_PRIVATE_KEY]");
  }
  if (RULES.IBAN.test(text)) {
    warnings.push("IBAN Detected");
    sanitizedText = sanitizedText.replace(RULES.IBAN, "[REDACTED_IBAN]");
  }

  // 2. High Entropy (Rastgele Şifre/Token) Kontrolü
  const entropyTokens = detectHighEntropyTokens(text);
  if (entropyTokens.length > 0) {
    warnings.push("High-Entropy Secret / Token Detected");
    entropyTokens.forEach(token => {
      sanitizedText = sanitizedText.replace(token, "[REDACTED_SECRET]");
    });
  }

  // 3. Prompt Injection Kontrolleri
  if (RULES.SYSTEM_PROMPT_EXTRACTION.test(text)) {
    warnings.push("Prompt Injection: System Prompt Extraction Attempt");
  }
  if (RULES.JAILBREAK_DAN.test(text)) {
    warnings.push("Prompt Injection: Jailbreak Attempt (DAN Mode)");
  }

  return {
    isViolation: warnings.length > 0,
    warnings: warnings,
    sanitizedPrompt: sanitizedText
  };
}

function updateAuditStats(warningsCount) {
  chrome.storage.local.get(["blocked_count"], (result) => {
    const current = result.blocked_count || 0;
    chrome.storage.local.set({ blocked_count: current + warningsCount });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INSPECT_PROMPT") {
    const analysis = inspectText(request.prompt);

    if (analysis.isViolation) {
      updateAuditStats(analysis.warnings.length);
      sendResponse({
        success: true,
        data: {
          action: "WARN",
          warnings: analysis.warnings,
          sanitized_prompt: analysis.sanitizedPrompt,
          target_site: request.site
        }
      });
    } else {
      sendResponse({
        success: true,
        data: { action: "ALLOW" }
      });
    }
  }
  return true;
});