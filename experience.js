/* ══════════════════════════════════════════════════════════
   GIRLFRIEND'S DAY — SHARED SCENE EXPERIENCE
   renderExperience(mountEl, data, opts)
     data: { recipient, sender, passcode, hint, message, photos:[url1,url2,url3] }
     opts: { preview: boolean }  // preview = passcode auto-skippable via "skip" link
══════════════════════════════════════════════════════════ */
(function () {
  if (!document.getElementById('exp-styles')) {
    const style = document.createElement('style');
    style.id = 'exp-styles';
    style.textContent = `
      .exp-root { min-height: 100vh; font-family:'Inter',sans-serif; }
      @keyframes expFadeIn   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      @keyframes expShake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-8px)} 80%{transform:translateX(8px)} }
      @keyframes expFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
      @keyframes expPulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      @keyframes expFlicker  { 0%,100%{opacity:1} 50%{opacity:.55} }
      @keyframes expDrift    { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(-100px) rotate(20deg)} }
      @keyframes expOpen     { from{transform:scale(0.85);opacity:0} to{transform:scale(1);opacity:1} }
      .exp-fade   { animation: expFadeIn .5s ease both; }
      .exp-shake  { animation: expShake .5s ease; }
      .exp-float  { animation: expFloat 3s ease-in-out infinite; }
      .exp-pulse  { animation: expPulse 1.6s ease-in-out infinite; }
      .exp-flick  { animation: expFlicker 1.3s ease-in-out infinite; }
      .exp-open   { animation: expOpen .4s ease both; }
      .exp-btn {
        padding:12px 30px;border-radius:30px;font-size:13px;font-weight:600;letter-spacing:2px;
        text-transform:uppercase;cursor:pointer;border:2.5px solid #fff;background:#fff;color:#b83b5e;
        font-family:'Inter',sans-serif;transition:transform .15s,background .2s;
      }
      .exp-btn:hover { transform:scale(1.05); }
      .exp-btn-outline {
        padding:12px 30px;border-radius:30px;font-size:13px;font-weight:600;letter-spacing:2px;
        text-transform:uppercase;cursor:pointer;border:2.5px solid #fff;background:transparent;color:#fff;
        font-family:'Inter',sans-serif;transition:transform .15s,background .2s;
      }
      .exp-btn-outline:hover { background:rgba(255,255,255,.15); transform:scale(1.05); }
      .exp-key {
        width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.14);
        border:1.5px solid rgba(255,255,255,.35);color:#fff;font-size:22px;font-weight:600;
        display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;
        transition:background .15s,transform .1s; font-family:'Inter',sans-serif;
      }
      .exp-key:hover { background:rgba(255,255,255,.28); }
      .exp-key:active { transform:scale(0.92); }
      .exp-pin-dot { width:14px;height:14px;border-radius:50%;border:1.5px solid #fff; }
      .exp-pin-dot.filled { background:#fff; }
    `;
    document.head.appendChild(style);
  }
})();

function renderExperience(mountEl, data, opts) {
  opts = opts || {};
  const photos = data.photos || [null, null, null];
  let scene = 'locked';
  let pin = '';
  let wrongShake = false;

  function r() { mountEl.innerHTML = ''; draw(); }
  function draw() {
    mountEl.className = 'exp-root';
    if (scene === 'locked')       drawLocked();
    else if (scene === 'greeting') drawGreeting();
    else if (scene === 'gifts')    drawGifts();
    else if (scene === 'cake')     drawCake();
    else if (scene === 'photos')   drawPhotos();
    else if (scene === 'letter')   drawLetter();
  }

  /* ── SCENE: LOCKED ── */
  function drawLocked() {
    mountEl.innerHTML = `
    <div style="min-height:100vh;background:linear-gradient(160deg,#8f1d3a,#5a1226);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;position:relative;overflow:hidden">
      <div class="exp-fade" style="position:relative;z-index:1">
        <div style="width:170px;height:200px;background:#fff;padding:12px 12px 34px;border-radius:4px;box-shadow:0 18px 40px -12px rgba(0,0,0,.5);transform:rotate(-3deg);margin:0 auto 26px">
          <img src="${photos[0] || ''}" style="width:100%;height:150px;object-fit:cover;border-radius:2px;background:#eee" />
        </div>
        <div class="font-dancing" style="font-family:'Dancing Script',cursive;font-size:34px;color:#fff;margin-bottom:22px">For ${escapeHtml(data.recipient || 'you')}, my love</div>

        <div style="display:flex;justify-content:center;gap:10px;margin-bottom:26px" id="exp-pin-dots">
          ${[0,1,2,3].map(i => `<div class="exp-pin-dot ${i < pin.length ? 'filled' : ''}"></div>`).join('')}
        </div>

        <div id="exp-keypad" style="display:grid;grid-template-columns:repeat(3,64px);gap:14px;justify-content:center;margin:0 auto 22px ${wrongShake ? '' : ''}" class="${wrongShake ? 'exp-shake' : ''}">
          ${['1','2','3','4','5','6','7','8','9','','0','back'].map(k => {
            if (k === '') return `<div></div>`;
            if (k === 'back') return `<div class="exp-key" onclick="__expKey('back')">⌫</div>`;
            return `<div class="exp-key" onclick="__expKey('${k}')">${k}</div>`;
          }).join('')}
        </div>

        ${data.hint ? `<p style="color:rgba(255,255,255,.75);font-size:13px;margin-bottom:6px">hint: ${escapeHtml(data.hint)}</p>` : ''}
        ${opts.preview ? `<p style="color:rgba(255,255,255,.6);font-size:11px;margin-top:14px;cursor:pointer;text-decoration:underline" onclick="__expSkip()">skip (preview only)</p>` : ''}
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
    <div style="min-height:100vh;background:linear-gradient(160deg,#fff6f7,#fdeaef 55%,#fbe1e9);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;position:relative;overflow:hidden">
      <div style="position:absolute;top:10%;left:8%;font-size:26px" class="exp-float">💗</div>
      <div style="position:absolute;top:20%;right:10%;font-size:20px" class="exp-float" style2="">💕</div>
      <div style="position:absolute;bottom:14%;left:14%;font-size:22px" class="exp-float">✨</div>
      <div class="exp-fade" style="position:relative;z-index:1;max-width:520px">
        <div style="font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#c2708a;margin-bottom:14px">You unlocked it</div>
        <div style="font-family:'Dancing Script',cursive;font-size:clamp(38px,8vw,60px);color:#1a0f0a;line-height:1.15;margin-bottom:18px">Happy Girlfriend's Day, ${escapeHtml(data.recipient || '')} 💕</div>
        <p style="font-family:'Caveat',cursive;font-size:20px;color:#5a1f33">A few little surprises are waiting for you. Ready?</p>
        <div style="margin-top:30px">
          <button class="exp-btn" style="background:#b83b5e;border-color:#b83b5e;color:#fff" onclick="__expGo('gifts')">Let's go →</button>
        </div>
      </div>
    </div>`;
    window.__expGo = (s) => { scene = s; r(); };
  }

  /* ── SCENE: GIFTS ── */
  let giftOpened = false;
  function drawGifts() {
    mountEl.innerHTML = `
    <div style="min-height:100vh;background:#fdf2f4;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center">
      <div class="exp-fade">
        <div style="font-family:'Dancing Script',cursive;font-size:32px;color:#b83b5e;margin-bottom:8px">Gift for you</div>
        <p style="font-family:'Caveat',cursive;font-size:18px;color:#5a1f33;margin-bottom:28px">${giftOpened ? 'Every day with you feels like unwrapping something new.' : 'Click any box to open it'}</p>
        <div style="display:flex;gap:22px;justify-content:center">
          ${[0,1,2].map(i => giftBoxSVG(i)).join('')}
        </div>
        <div style="margin-top:34px;${giftOpened ? '' : 'visibility:hidden'}">
          <button class="exp-btn" style="background:#b83b5e;border-color:#b83b5e;color:#fff" onclick="__expGo('cake')">Next →</button>
        </div>
      </div>
    </div>`;
    window.__expGo = (s) => { scene = s; r(); };
    window.__expOpenGift = () => { giftOpened = true; r(); };
  }
  function giftBoxSVG(i) {
    return `<div onclick="__expOpenGift()" style="cursor:pointer;width:90px" class="${giftOpened ? '' : 'exp-pulse'}">
      <svg viewBox="0 0 90 90" width="90" height="90">
        <rect x="14" y="34" width="62" height="46" rx="6" fill="#f06595"/>
        <rect x="14" y="34" width="62" height="14" fill="#e64980"/>
        <rect x="40" y="34" width="10" height="46" fill="#c2255c"/>
        <rect x="10" y="20" width="70" height="16" rx="4" fill="#e64980"/>
        <circle cx="45" cy="18" r="10" fill="#c2255c"/>
      </svg>
    </div>`;
  }

  /* ── SCENE: CAKE ── */
  let blown = false;
  function drawCake() {
    mountEl.innerHTML = `
    <div style="min-height:100vh;background:linear-gradient(160deg,#8f1d3a,#5a1226);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center">
      <div class="exp-fade">
        <div style="font-family:'Dancing Script',cursive;font-size:32px;color:#fff;margin-bottom:20px">${blown ? 'Wish made ✨' : 'Make a wish'}</div>
        <svg viewBox="0 0 200 160" width="200" height="160">
          <rect x="40" y="100" width="120" height="45" rx="6" fill="#fff6f7"/>
          <rect x="40" y="100" width="120" height="10" fill="#f8a5c2"/>
          <rect x="55" y="70" width="90" height="35" rx="6" fill="#ffffff"/>
          <rect x="55" y="70" width="90" height="8" fill="#f8a5c2"/>
          ${[0,1,2,3,4].map(i => `
            <rect x="${68 + i*16}" y="46" width="4" height="24" fill="#f8a5c2"/>
            <ellipse cx="${70 + i*16}" cy="${blown ? 46 : 40}" rx="4" ry="8" fill="#ffd43b" class="${blown ? '' : 'exp-flick'}" opacity="${blown ? 0 : 1}"/>
          `).join('')}
        </svg>
        <div style="margin-top:22px">
          ${blown
            ? `<button class="exp-btn" style="background:#fff;color:#b83b5e" onclick="__expGo('photos')">Next →</button>`
            : `<button class="exp-btn-outline" onclick="__expBlow()">Blow 🕯️</button>`}
        </div>
      </div>
    </div>`;
    window.__expGo = (s) => { scene = s; r(); };
    window.__expBlow = () => { blown = true; r(); };
  }

  /* ── SCENE: PHOTOS ── */
  function drawPhotos() {
    mountEl.innerHTML = `
    <div style="min-height:100vh;background:#fdf2f4;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 20px;text-align:center">
      <div class="exp-fade">
        <div style="font-family:'Dancing Script',cursive;font-size:30px;color:#1a0f0a;margin-bottom:26px">Little moments, big love</div>
        <div style="display:flex;gap:18px;justify-content:center;flex-wrap:wrap">
          ${[1,2].map((i, idx) => `
            <div style="width:150px;background:#fff;padding:10px 10px 26px;border-radius:4px;box-shadow:0 12px 26px -10px rgba(184,59,94,.4);transform:rotate(${idx===0?-4:4}deg)">
              <img src="${photos[i] || ''}" style="width:100%;height:170px;object-fit:cover;border-radius:2px;background:#eee" />
            </div>`).join('')}
        </div>
        <p style="font-family:'Caveat',cursive;font-size:19px;color:#5a1f33;max-width:420px;margin:26px auto 0">Every picture we've taken is a page in the story I never want to stop writing with you.</p>
        <div style="margin-top:26px">
          <button class="exp-btn" style="background:#b83b5e;border-color:#b83b5e;color:#fff" onclick="__expGo('letter')">Next →</button>
        </div>
      </div>
    </div>`;
    window.__expGo = (s) => { scene = s; r(); };
  }

  /* ── SCENE: LETTER ── */
  let envelopeOpen = false;
  function drawLetter() {
    mountEl.innerHTML = `
    <div style="min-height:100vh;background:linear-gradient(160deg,#8f1d3a,#5a1226);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center">
      ${!envelopeOpen ? `
        <div class="exp-fade">
          <div style="font-family:'Dancing Script',cursive;font-size:28px;color:#fff;margin-bottom:22px">One last thing...</div>
          <div onclick="__expOpenEnv()" style="cursor:pointer;width:150px;margin:0 auto" class="exp-pulse">
            <svg viewBox="0 0 150 100" width="150" height="100">
              <rect x="0" y="10" width="150" height="90" rx="6" fill="#fff6f7"/>
              <polygon points="0,10 75,60 150,10" fill="#f8a5c2"/>
              <circle cx="75" cy="55" r="10" fill="#b83b5e"/>
            </svg>
          </div>
          <p style="color:rgba(255,255,255,.75);font-size:13px;margin-top:16px">tap to open</p>
        </div>` : `
        <div class="exp-open" style="background:#fffdfc;border-radius:6px;padding:40px 30px;max-width:520px;width:100%;box-shadow:0 20px 50px -14px rgba(0,0,0,.5)">
          <div style="font-family:'Dancing Script',cursive;font-size:26px;color:#1a0f0a;margin-bottom:10px;text-align:left">Dear ${escapeHtml(data.recipient || '')},</div>
          <div style="font-family:'Caveat',cursive;font-size:19px;color:#5a1f33;white-space:pre-wrap;line-height:1.7;text-align:left">${escapeHtml(data.message || '')}</div>
          <div style="font-family:'Dancing Script',cursive;font-size:24px;color:#b83b5e;margin-top:20px;text-align:right">With love, ${escapeHtml(data.sender || '')} ♥</div>
          <div style="margin-top:26px">
            <button class="exp-btn-outline" style="color:#b83b5e;border-color:#b83b5e" onclick="__expGo('photos')">← Back</button>
          </div>
        </div>`}
    </div>`;
    window.__expGo = (s) => { scene = s; r(); };
    window.__expOpenEnv = () => { envelopeOpen = true; r(); };
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  r();
}