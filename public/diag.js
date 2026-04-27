/**
 * 배포 환경에서도 콘솔로 원인을 보기 위한 전역 진단(프로덕션에서도 동작)
 */
(function installEsfDiagnostics() {
  if (globalThis.__ESF_LOG__) {
    return;
  }
  const TAG = "[easyshortform]";
  const t = () => new Date().toISOString();
  const pack = (msg, data) => {
    const a = [TAG, t(), msg];
    if (data !== undefined) a.push(data);
    return a;
  };
  const L = {
    t,
    d(msg, data) {
      console.log.apply(console, pack(msg, data));
    },
    i(msg, data) {
      console.info.apply(console, pack(msg, data));
    },
    w(msg, data) {
      console.warn.apply(console, pack(msg, data));
    },
    e(msg, data) {
      console.error.apply(console, pack(msg, data));
    },
  };
  globalThis.__ESF_LOG__ = L;

  globalThis.addEventListener(
    "error",
    (ev) => {
      console.error(
        TAG,
        t(),
        "[window error] (JS/리소스)",
        {
          message: ev.message,
          file: ev.filename,
          line: ev.lineno,
          col: ev.colno,
          error: ev.error,
          stack: ev.error && ev.error.stack,
        },
      );
    },
    true,
  );
  globalThis.addEventListener("unhandledrejection", (ev) => {
    const r = ev.reason;
    console.error(TAG, t(), "[unhandledrejection] (처리되지 않은 Promise)", {
      reason: r,
      asString: r != null ? String(r) : r,
      stack: r && r.stack,
    });
  });
  L.i("[diag] 콘솔 로그 활성. 모든 [easyshortform] 항목을 열어 배포·재현에 사용하세요.", {
    href: String(globalThis.location && globalThis.location.href),
  });
})();
