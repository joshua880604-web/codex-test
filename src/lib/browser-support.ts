// This small notice must run even if an unsupported browser cannot parse the
// application bundles. Keep the emitted script ES5; it does not polyfill them.
export const browserSupportScript = String.raw`(function () {
  var ua = navigator.userAgent || "", match, unsupported = false;
  function before(major, minor, targetMajor, targetMinor) {
    return major < targetMajor || (major === targetMajor && minor < targetMinor);
  }
  match = /(?:iPhone|iPad|iPod).*?OS (\d+)[._](\d+)/.exec(ua);
  if (match) {
    unsupported = before(+match[1], +match[2], 16, 4);
  } else if (/Safari\//.test(ua) && !/(?:Chrome|Chromium|Edg|OPR|Android)\//.test(ua) && (match = /Version\/(\d+)(?:\.(\d+))?/.exec(ua))) {
    unsupported = before(+match[1], +(match[2] || 0), 16, 4);
  } else if ((match = /(?:Chrome|Chromium|Edg|Firefox)\/(\d+)/.exec(ua))) {
    unsupported = +match[1] < 111;
  }
  if (!unsupported) return;
  function showNotice() {
    var notice = document.getElementById("browser-support-notice");
    if (notice) notice.hidden = false;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showNotice, false);
  else showNotice();
}());`;
