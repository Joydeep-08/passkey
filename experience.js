/* ══════════════════════════════════════════════════════════
   "MENDED" — SORRY EXPERIENCE
   renderExperience(mountEl, data, opts)
     data: { recipient, sender, passcode, hint, message, photos:[url1,url2,url3] }
     opts: { preview: boolean, onGenerate: fn }
       preview   → shows a "skip" link on the lock screen and, once the
                   final scene finishes, a small floating "Generate Link"
                   pill that calls opts.onGenerate()
══════════════════════════════════════════════════════════ */
(function () {
  if (!document.getElementById('exp-styles')) {
    const style = document.createElement('style');
    style.id = 'exp-styles';
    style.textContent = `
      .exp-root { min-height: 100vh; font-family:'Inter',sans-serif; }
      @keyframes expFadeIn   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      @keyframes expShake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-8px)} 80%{transform:translateX(8px)} }
      @keyframes expPulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      @keyframes expOpen     { from{transform:scale(0.9) translateY(10px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
      @keyframes expRise     { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
      @keyframes expSeam     { to { stroke-dashoffset: 0; } }
      @keyframes expGlow     { 0%,100%{opacity:.55} 50%{opacity:1} }
      @keyframes expBob      { 0%,100%{transform:translateY(0) rotate(var(--r,0deg))} 50%{transform:translateY(-6px) rotate(var(--r,0deg))} }
      @keyframes expPillIn   { from{opacity:0;transform:translate(-50%,14px)} to{opacity:1;transform:translate(-50%,0)} }
      .exp-fade   { animation: expFadeIn .55s ease both; }
      .exp-shake  { animation: expShake .5s ease; }
      .exp-pulse  { animation: expPulse 2s ease-in-out infinite; }
      .exp-open   { animation: expOpen .45s cubic-bezier(.2,.7,.3,1) both; }
      .exp-rise   { animation: expRise .6s ease both; }
      .exp-glow   { animation: expGlow 2.4s ease-in-out infinite; }
      .exp-seam   { stroke-dasharray: 220; stroke-dashoffset: 220; animation: expSeam 1.1s ease forwards; }
      .exp-card   { animation: expBob 5s ease-in-out infinite; }
      .exp-btn {
        padding:12px 30px;border-radius:30px;font-size:13px;font-weight:600;letter-spacing:.6px;
        cursor:pointer;border:1.5px solid #e6c25c;background:#e6c25c;color:#241f2e;
        font-family:'Inter',sans-serif;transition:transform .15s,background .2s;
      }
      .exp-btn:hover { transform:scale(1.04); background:#f0d27a; }
      .exp-btn-outline {
        padding:12px 30px;border-radius:30px;font-size:13px;font-weight:600;letter-spacing:.6px;
        cursor:pointer;border:1.5px solid rgba(230,194,92,.7);background:transparent;color:#e6c25c;
        font-family:'Inter',sans-serif;transition:transform .15s,background .2s;
      }
      .exp-btn-outline:hover { background:rgba(230,194,92,.12); transform:scale(1.04); }
      .exp-key {
        width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.06);
        border:1.5px solid rgba(230,194,92,.3);color:#f2ece0;font-size:20px;font-weight:500;
        display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;
        transition:background .15s,transform .1s; font-family:'Inter',sans-serif;
      }
      .exp-key:hover { background:rgba(230,194,92,.14); }
      .exp-key:active { transform:scale(0.92); }
      .exp-pin-dot { width:12px;height:12px;border-radius:50%;border:1.5px solid #e6c25c; }
      .exp-pin-dot.filled { background:#e6c25c; }
      .exp-gen-pill {
        position:fixed; left:50%; bottom:26px; transform:translate(-50%,0); z-index:40;
        animation: expPillIn .5s ease both; padding:11px 26px; border-radius:999px;
        background:#241f2e; color:#e6c25c; border:1px solid rgba(230,194,92,.55);
        font-family:'Inter',sans-serif; font-size:12.5px; font-weight:600; letter-spacing:.5px;
        cursor:pointer; box-shadow:0 10px 30px -10px rgba(0,0,0,.5); transition:transform .15s;
      }
      .exp-gen-pill:hover { transform:translate(-50%,-2px); }
      .exp-mute {
        width:34px;height:34px;border-radius:50%;border:1px solid #e4dcc8;background:#fffdf7;
        display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;
      }
      .exp-board-card { background:#fffdf9; padding:10px 10px 30px; box-shadow:0 16px 30px -14px rgba(36,31,46,.35); position:relative; }
      .exp-tape { position:absolute; width:64px; height:22px; background:rgba(230,194,92,.35); top:-11px; left:50%; transform:translateX(-50%) rotate(-3deg); box-shadow:0 1px 2px rgba(0,0,0,.08); }
      .exp-pin { position:absolute; top:-9px; left:50%; transform:translateX(-50%); width:16px; height:16px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #f0d27a, #b5842a); box-shadow:0 3px 5px rgba(0,0,0,.3); }
    `;
    document.head.appendChild(style);
  }
})();

const VISION_CAPTIONS = ['before the noise', 'still us, underneath', "what i don't want to lose"];

function renderExperience(mountEl, data, opts) {
  opts = opts || {};
  const photos = data.photos || [null, null, null];
  let scene = 'locked';
  let pin = '';
  let wrongShake = false;
  let soundOn = true;

  function r() { mountEl.innerHTML = ''; draw(); }
  function draw() {
    mountEl.className = 'exp-root';
    if (scene === 'locked')       drawLocked();
    else if (scene === 'greeting') drawGreeting();
    else if (scene === 'mend')     drawMend();
    else if (scene === 'final')    drawFinal();
  }

  /* ── tiny inline audio: soft typewriter tick, no external files ── */
  let audioCtx = null;
  function tick() {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = 1150 + Math.random() * 260;
      gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.045);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  /* ── SCENE: LOCKED ── */
  function drawLocked() {
    mountEl.innerHTML = `
    <div style="min-height:100vh;background:linear-gradient(165deg,#241f2e,#171320);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;position:relative;overflow:hidden">
      ${kintsugiVeins(0.14)}
      <div class="exp-fade" style="position:relative;z-index:1">
        <div style="width:150px;height:180px;background:#fffdf7;padding:10px 10px 30px;border-radius:3px;box-shadow:0 18px 40px -12px rgba(0,0,0,.55);transform:rotate(-3deg);margin:0 auto 26px;position:relative">
          <img src="${photos[0] || ''}" style="width:100%;height:132px;object-fit:cover;border-radius:2px;background:#e9e2d3" />
          <svg viewBox="0 0 130 132" style="position:absolute;top:10px;left:10px;width:calc(100% - 20px);height:132px;pointer-events:none">
            <path d="M10 0 L58 46 L40 70 L78 132" stroke="#e6c25c" stroke-width="2.4" fill="none" opacity="0.9" stroke-linecap="round"/>
          </svg>
        </div>
        <div style="font-family:'Fraunces',serif;font-style:italic;font-size:32px;color:#f2ece0;margin-bottom:22px">For ${escapeHtml(data.recipient || 'you')}</div>

        <div style="display:flex;justify-content:center;gap:10px;margin-bottom:26px">
          ${[0,1,2,3].map(i => `<div class="exp-pin-dot ${i < pin.length ? 'filled' : ''}"></div>`).join('')}
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,60px);gap:13px;justify-content:center;margin:0 auto 22px" class="${wrongShake ? 'exp-shake' : ''}">
          ${['1','2','3','4','5','6','7','8','9','','0','back'].map(k => {
            if (k === '') return `<div></div>`;
            if (k === 'back') return `<div class="exp-key" onclick="__expKey('back')">⌫</div>`;
            return `<div class="exp-key" onclick="__expKey('${k}')">${k}</div>`;
          }).join('')}
        </div>

        ${data.hint ? `<p style="color:rgba(242,236,224,.65);font-size:13px;margin-bottom:6px">hint: ${escapeHtml(data.hint)}</p>` : ''}
        ${opts.preview ? `<p style="color:rgba(242,236,224,.5);font-size:11px;margin-top:14px;cursor:pointer;text-decoration:underline" onclick="__expSkip()">skip (preview only)</p>` : ''}
      </div>
    </div>`;

    window.__expKey = (k) => {
      if (k === 'back') { pin = pin.slice(0, -1); r(); return; }
      if (pin.length >= 4) return;
      pin += k;
      if (pin.length === 4) {
        if (pin === String(data.passcode)) {
          setTimeout(() => { scene = 'greeting'; pin = ''; r(); }, 250);
          r();
        } else {
          r();
          setTimeout(() => { pin = ''; wrongShake = true; r(); setTimeout(() => { wrongShake = false; }, 500); }, 350);
        }
      } else {
        r();
      }
    };
    window.__expSkip = () => { scene = 'greeting'; r(); };
  }

  /* ── SCENE: GREETING ── */
  function drawGreeting() {
    mountEl.innerHTML = `
    <div style="min-height:100vh;background:linear-gradient(160deg,#241f2e 0%,#392c2c 55%,#513c2a 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;position:relative;overflow:hidden">
      ${kintsugiVeins(0.1)}
      <div class="exp-fade" style="position:relative;z-index:1;max-width:520px">
        <div style="font-family:'Fraunces',serif;font-style:italic;font-size:clamp(34px,7vw,52px);color:#f6f0e2;line-height:1.2;margin-bottom:18px">I'm sorry, ${escapeHtml(data.recipient || '')}.</div>
        <p style="font-family:'Kalam',cursive;font-size:19px;color:#d8c9a8">I know sorry doesn't undo it. But I need you to hear it anyway.</p>
        <div style="margin-top:32px">
          <button class="exp-btn" onclick="__expGo('mend')">Continue</button>
        </div>
      </div>
    </div>`;
    window.__expGo = (s) => { scene = s; r(); };
  }

  /* ── SCENE: MEND (interactive kintsugi vessel) ── */
  let mended = false;
  function drawMend() {
    mountEl.innerHTML = `
    <div style="min-height:100vh;background:linear-gradient(165deg,#241f2e,#171320);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center">
      <div class="exp-fade">
        <div style="font-family:'Fraunces',serif;font-style:italic;font-size:22px;color:#f2ece0;margin-bottom:8px">${mended ? 'Mended, not erased.' : 'Some things break.'}</div>
        <p style="font-family:'Kalam',cursive;font-size:17px;color:#c9bda3;margin-bottom:30px;max-width:340px">${mended ? 'The cracks are still part of it — just filled with something better than before.' : 'This one can still hold something beautiful. Tap it.'}</p>
        ${vesselSVG(mended)}
        <div style="margin-top:30px;${mended ? '' : 'visibility:hidden'}">
          <button class="exp-btn" onclick="__expGo('final')">Continue</button>
        </div>
      </div>
    </div>`;
    window.__expGo = (s) => { scene = s; r(); };
    window.__expMend = () => { mended = true; r(); };
  }
  function vesselSVG(done) {
    const leftShift = done ? 0 : -7;
    const rightShift = done ? 0 : 7;
    return `
    <div onclick="${done ? '' : '__expMend()'}" style="cursor:${done ? 'default' : 'pointer'}" class="${done ? '' : 'exp-pulse'}">
      <svg viewBox="0 0 160 130" width="160" height="130">
        <g transform="translate(${leftShift},0)" style="transition:transform .5s ease">
          <path d="M20 30 Q22 100 50 112 L78 112 Q80 60 76 30 Z" fill="#3a3244"/>
        </g>
        <g transform="translate(${rightShift},0)" style="transition:transform .5s ease">
          <path d="M78 30 Q82 62 80 112 L108 112 Q136 96 138 30 Z" fill="#453b52"/>
        </g>
        ${done ? `<path d="M78 30 Q79 70 78 112" stroke="#e6c25c" stroke-width="3.5" fill="none" stroke-linecap="round" class="exp-seam"/>
                  <path d="M40 40 L62 58" stroke="#e6c25c" stroke-width="2.5" fill="none" stroke-linecap="round" class="exp-seam" style="animation-delay:.2s"/>` : ''}
      </svg>
    </div>`;
  }

  /* ── SCENE: FINAL — letter (typed, with sound) + vision board + (preview) generate link ── */
  let envelopeOpen = false;
  let typingDone = false;
  let boardShown = false;
  function drawFinal() {
    mountEl.innerHTML = `
    <div style="min-height:100vh;background:linear-gradient(180deg,#241f2e 0,#241f2e 280px,#faf5ea 280px);padding:40px 20px 100px;display:flex;flex-direction:column;align-items:center">
      ${!envelopeOpen ? `
        <div class="exp-fade" style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-family:'Fraunces',serif;font-style:italic;font-size:26px;color:#f2ece0;margin-bottom:24px">One more thing...</div>
          <div onclick="__expOpenEnv()" style="cursor:pointer;width:150px;margin:0 auto" class="exp-pulse">
            <svg viewBox="0 0 150 100" width="150" height="100">
              <rect x="0" y="10" width="150" height="90" rx="4" fill="#fffdf7"/>
              <polygon points="0,10 75,58 150,10" fill="#efe4c9"/>
              <circle cx="75" cy="52" r="11" fill="#c9a227"/>
            </svg>
          </div>
          <p style="color:rgba(242,236,224,.6);font-size:13px;margin-top:16px">tap to open</p>
        </div>` : `
        <div class="exp-open" style="background:#fffdf7;border-radius:3px;padding:40px 32px;max-width:540px;width:100%;box-shadow:0 24px 55px -18px rgba(0,0,0,.4);margin-top:6px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
            <div style="font-family:'Fraunces',serif;font-style:italic;font-size:24px;color:#241f2e;text-align:left">Dear ${escapeHtml(data.recipient || '')},</div>
            <div class="exp-mute" onclick="__expToggleSound()" title="toggle sound">${soundOn ? soundOnIcon() : soundOffIcon()}</div>
          </div>
          <div id="exp-letter-body" style="font-family:'Kalam',cursive;font-size:18px;color:#3a3228;white-space:pre-wrap;line-height:1.75;text-align:left;min-height:120px;cursor:pointer"></div>
          <div id="exp-sign" style="font-family:'Fraunces',serif;font-style:italic;font-size:21px;color:#8a6a22;margin-top:18px;text-align:right;opacity:0;transition:opacity .6s">— ${escapeHtml(data.sender || '')}</div>
        </div>
        ${boardShown ? visionBoardHtml() : ''}
      `}
    </div>`;

    window.__expOpenEnv = () => {
      envelopeOpen = true; r();
      setTimeout(startTyping, 320);
    };
    // Toggling sound never touches the letter DOM directly — that would wipe out
    // whatever's mid-type — it just flips the flag and swaps the icon in place.
    window.__expToggleSound = () => {
      soundOn = !soundOn;
      const muteBtn = document.querySelector('.exp-mute');
      if (muteBtn) muteBtn.innerHTML = soundOn ? soundOnIcon() : soundOffIcon();
    };

    if (typingDone) {
      const signEl = document.getElementById('exp-sign');
      if (signEl) signEl.style.opacity = '1';
      const letterEl = document.getElementById('exp-letter-body');
      if (letterEl) { letterEl.textContent = data.message || ''; letterEl.dataset.typed = '1'; }
    }
    if (boardShown && opts.preview && !document.getElementById('exp-gen-pill')) {
      const pill = document.createElement('div');
      pill.id = 'exp-gen-pill';
      pill.className = 'exp-gen-pill';
      pill.textContent = 'Generate Link';
      pill.onclick = () => { if (opts.onGenerate) opts.onGenerate(); };
      document.body.appendChild(pill);
    }
  }

  function startTyping() {
    const el = document.getElementById('exp-letter-body');
    if (!el) return;
    const text = data.message || '';
    let i = 0;
    el.textContent = '';
    function step() {
      if (i >= text.length) {
        typingDone = true;
        finishLetter();
        return;
      }
      const ch = text[i];
      el.textContent += ch;
      if (ch.trim() !== '') tick();
      i++;
      window.__expTypeTimer = setTimeout(step, 26);
    }
    el.onclick = () => {
      clearTimeout(window.__expTypeTimer);
      el.textContent = text;
      typingDone = true;
      finishLetter();
    };
    step();
  }
  function finishLetter() {
    const signEl = document.getElementById('exp-sign');
    if (signEl) signEl.style.opacity = '1';
    setTimeout(() => { boardShown = true; r(); }, 500);
  }
  function visionBoardHtml() {
    const rot = [-5, 3, -3];
    const tapeOrPin = ['tape', 'pin', 'tape'];
    return `
    <div class="exp-rise" style="max-width:640px;width:100%;margin-top:44px;text-align:center">
      <div style="font-family:'Fraunces',serif;font-style:italic;font-size:24px;color:#241f2e;margin-bottom:26px">Little moments</div>
      <div style="display:flex;gap:22px;justify-content:center;flex-wrap:wrap">
        ${[0,1,2].map(i => `
          <div class="exp-board-card exp-card" style="--r:${rot[i]}deg;width:150px;transform:rotate(${rot[i]}deg)">
            ${tapeOrPin[i] === 'tape' ? '<div class="exp-tape"></div>' : '<div class="exp-pin"></div>'}
            <img src="${photos[i] || ''}" style="width:100%;height:168px;object-fit:cover;background:#eee4d0" />
            <div style="font-family:'Kalam',cursive;font-size:14px;color:#5a4d38;margin-top:8px">${VISION_CAPTIONS[i]}</div>
          </div>`).join('')}
      </div>
    </div>`;
  }

  function soundOnIcon() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="#241f2e"/><path d="M16 8.5c1.2 1 1.9 2.2 1.9 3.5s-.7 2.5-1.9 3.5" stroke="#241f2e" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  }
  function soundOffIcon() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="#8a8072"/><path d="M16 9l5 6M21 9l-5 6" stroke="#8a8072" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  }

  function kintsugiVeins(op) {
    return `<svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" preserveAspectRatio="none" viewBox="0 0 400 800">
      <path d="M0 90 L120 160 L90 260 L200 330" stroke="#e6c25c" stroke-width="1.4" fill="none" opacity="${op}"/>
      <path d="M400 620 L280 560 L320 470 L220 400" stroke="#e6c25c" stroke-width="1.4" fill="none" opacity="${op}"/>
    </svg>`;
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  r();
}
