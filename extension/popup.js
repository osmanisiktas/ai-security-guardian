document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["blocked_count"], (result) => {
    const count = result.blocked_count || 0;
    document.getElementById("stat-count").textContent = count;
  });
});