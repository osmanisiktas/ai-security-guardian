console.log("🛡️ [AI Guardian] Reliable Selector Active.");

let isEvaluating = false;
let bypassGuardian = false;

window.addEventListener("keydown", handleUserAction, true);
window.addEventListener("click", handleUserAction, true);

function handleUserAction(e) {
  if (bypassGuardian) return;

  const isEnter = e.type === "keydown" && e.key === "Enter" && !e.shiftKey;
  const sendBtn = getSendBtn();
  const isClick = e.type === "click" && sendBtn && (sendBtn === e.target || sendBtn.contains(e.target));

  if (!isEnter && !isClick) return;

  const promptBox = getPromptBox();
  if (!promptBox) return;

  const text = getBoxText(promptBox);
  if (!text.trim()) return;

  if (isEvaluating) return;

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  isEvaluating = true;

  chrome.runtime.sendMessage(
    { action: "INSPECT_PROMPT", prompt: text, site: window.location.hostname },
    (response) => {
      if (chrome.runtime.lastError) {
        isEvaluating = false;
        approvedSend(promptBox);
        return;
      }

      if (response && response.success && response.data && response.data.action === "WARN") {
        showWarningModal(response.data, promptBox);
      } else {
        approvedSend(promptBox);
      }
    }
  );
}

function getPromptBox() {
  return document.querySelector('rich-textarea div[contenteditable="true"]') ||
         document.querySelector('div[contenteditable="true"][aria-label*="Gemini"]') ||
         document.getElementById("prompt-textarea") ||
         document.querySelector('div[contenteditable="true"]') ||
         document.querySelector('textarea');
}

function getBoxText(el) {
  if (!el) return "";
  if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
    return el.value || "";
  }
  return el.innerText || el.textContent || "";
}

function getSendBtn() {
  return document.querySelector('button[aria-label*="Gönder"], button[aria-label*="gönder"], button[aria-label*="Send"], button[aria-label*="send"], button[data-testid="send-button"], button.send-button');
}

function showWarningModal(data, promptBox) {
  let old = document.getElementById("ai-guardian-overlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "ai-guardian-overlay";
  overlay.innerHTML = `
    <h4>⚠️ AI Security Warning</h4>
    <div>Sensitive entity / Injection pattern detected on <strong>${data.target_site}</strong>:</div>
    <div id="ai-guardian-warnings">${data.warnings.join("<br>")}</div>
    <div class="ai-guardian-btn-group">
      <button class="ai-guardian-btn ai-guardian-btn-mask" id="btn-mask">Mask & Send</button>
      <button class="ai-guardian-btn ai-guardian-btn-ignore" id="btn-ignore">Allow & Send</button>
      <button class="ai-guardian-btn ai-guardian-btn-cancel" id="btn-cancel">Cancel</button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("btn-mask").onclick = () => {
    setBoxText(promptBox, data.sanitized_prompt);
    overlay.remove();
    approvedSend(promptBox);
  };

  document.getElementById("btn-ignore").onclick = () => {
    overlay.remove();
    approvedSend(promptBox);
  };

  document.getElementById("btn-cancel").onclick = () => {
    overlay.remove();
    isEvaluating = false;
    bypassGuardian = false;
  };
}

function setBoxText(el, newText) {
  el.focus();
  if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
    el.value = newText;
  } else {
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, newText);
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

function approvedSend(promptBox) {
  bypassGuardian = true;
  isEvaluating = false;

  const btn = getSendBtn();
  if (btn && !btn.disabled) {
    btn.click();
  } else {
    promptBox.focus();
    promptBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
  }

  setTimeout(() => {
    bypassGuardian = false;
  }, 400);
}