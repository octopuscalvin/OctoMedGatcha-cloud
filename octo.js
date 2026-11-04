/* Octo mascot: a floating octopus at the bottom right of the page that blinks now and then and
   says a random line in a deep-green "cyber" speech box (5 s shown, 2 s hidden, repeating).
   Click or tap it for another line at once.

   Use:  <script src="octo.js" defer></script>
   Options, as attributes on that script tag (all optional):
     data-open="assets/octo_open.webp"     eyes-open picture
     data-closed="assets/octo_closed.webp" eyes-closed picture (same size, used for blinking)
     data-lines="declare.txt"              text file, one line per message ("" = only built-in lines)
     data-show="5000" data-rest="2000"     ms the box is shown / hidden
     data-label="> OCTO.SAY"               small header in the box
   Or set window.OCTO_CONFIG = {open, closed, lines: [...] or "url", show, rest, label} before it loads.
   window.Octo.say("text") makes it say something; window.Octo.say() says a random line. */
(() => {
  if (window.Octo) return;
  const me = document.currentScript, here = me && me.src ? me.src.replace(/[^/]*$/, '') : '';
  const attr = (k, d) => (me && me.dataset[k] != null ? me.dataset[k] : d);
  const C = Object.assign({
    open: attr('open', here + 'assets/octo_open.webp'),
    closed: attr('closed', here + 'assets/octo_closed.webp'),
    lines: attr('lines', here + 'declare.txt'),
    show: +attr('show', 5000), rest: +attr('rest', 2000),
    label: attr('label', '> OCTO.SAY'),
  }, window.OCTO_CONFIG || {});

  const css = `
#octo{position:fixed;right:22px;bottom:14px;z-index:2147483000;pointer-events:none}
#octo .body{position:relative;width:118px;height:110px;cursor:pointer;pointer-events:auto;border:0;padding:0;background:none;
  animation:octoFloat 3.2s ease-in-out infinite;-webkit-tap-highlight-color:transparent}
#octo .body:focus-visible{outline:2px dashed #2bd98f;outline-offset:4px;border-radius:50%}
#octo .body img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 6px 8px rgba(0,0,0,.35))}
#octo .body img.shut{visibility:hidden}
#octo.blink .body img.shut{visibility:visible}
#octo.blink .body img.wide{visibility:hidden}
#octo .body:active{animation-play-state:paused;transform:scale(.94)}
@keyframes octoFloat{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-12px) rotate(1.5deg)}}
#octo .say{position:absolute;right:128px;bottom:52px;width:max-content;max-width:290px;min-width:140px;padding:13px 16px 11px 18px;
  font:15px/1.8 "DFKai-SB","BiauKai","STKaiti","KaiTi","PMingLiU",serif;color:#4a3018;letter-spacing:.5px;
  background:radial-gradient(ellipse at 18% 15%,rgba(139,101,55,.14) 0%,transparent 42%),radial-gradient(ellipse at 85% 80%,rgba(139,101,55,.12) 0%,transparent 45%),repeating-linear-gradient(100deg,rgba(139,101,55,.06) 0 2px,transparent 2px 7px),linear-gradient(160deg,#f8ead0 0%,#eed9a8 55%,#e2c384 100%);
  border:1px solid #a9772f;border-radius:3px 14px 3px 14px;
  box-shadow:inset 0 0 0 1px rgba(176,52,38,.3),2px 4px 10px rgba(80,55,20,.35);
  opacity:0;transform:translateY(6px) scale(.97);transform-origin:right bottom;
  transition:opacity .25s,transform .25s;text-align:left;white-space:normal;overflow-wrap:anywhere}
#octo .say::before{content:var(--octo-label);display:block;font-size:15px;font-weight:700;letter-spacing:1px;color:#a0302a;opacity:.9;margin-bottom:5px;padding-bottom:4px;border-bottom:1px dashed rgba(160,48,42,.35)}
#octo .tail{position:absolute;right:112px;bottom:66px;width:18px;height:2px;background:#a9772f;
  opacity:0;transition:opacity .25s;transform:rotate(18deg);transform-origin:right center}
#octo.talk .say{opacity:1;transform:none}
#octo.talk .tail{opacity:1}
@media (prefers-reduced-motion:reduce){#octo .body{animation:none}}
@media (max-width:600px){#octo .body{width:84px;height:78px}#octo .say{right:92px;bottom:36px;max-width:min(240px,calc(100vw - 130px))}#octo .tail{right:78px;bottom:48px}}`;

  const start = () => {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const box = document.createElement('div'); box.id = 'octo';
    box.style.setProperty('--octo-label', JSON.stringify(C.label));
    box.innerHTML = '<div class="tail"></div><div class="say" aria-live="polite"></div>' +
      '<button class="body" type="button" title="Click me" aria-label="Octopus: click for another line">' +
      '<img class="wide" alt=""><img class="shut" alt=""></button>';
    box.querySelector('.wide').src = C.open; box.querySelector('.shut').src = C.closed;
    document.body.appendChild(box);
    const say = box.querySelector('.say');

    let lines = ['記得自己FINE TUNE！'], last = -1, timer = 0, typing = 0;
    const use = t => { const l = t.split(/\r?\n/).map(s => s.trim()).filter(Boolean); if (l.length) lines = l; };
    if (Array.isArray(C.lines)) lines = C.lines.length ? C.lines.slice() : lines;
    else if (C.lines) fetch(C.lines).then(r => r.ok ? r.text() : '').then(use).catch(() => {});

    const pick = () => {
      let i = Math.floor(Math.random() * lines.length);
      if (lines.length > 1) while (lines[i] === lines[last]) i = Math.floor(Math.random() * lines.length);
      last = i; return lines[i];
    };
    const speak = text => {   // types the line out, keeps it C.show ms, hides it C.rest ms, then the next one
      clearTimeout(timer); clearInterval(typing);
      const s = [...(typeof text === 'string' ? text : pick())]; let n = 0;
      say.textContent = ''; box.classList.add('talk');
      typing = setInterval(() => { say.textContent = s.slice(0, ++n).join(''); if (n >= s.length) clearInterval(typing); }, 45);
      timer = setTimeout(() => { box.classList.remove('talk'); timer = setTimeout(speak, C.rest); }, C.show);
    };
    const blink = () => {   // one blink every 2.2-6.2 s, a double blink one time in four
      box.classList.add('blink');
      setTimeout(() => box.classList.remove('blink'), 140);
      if (Math.random() < .25) setTimeout(() => { box.classList.add('blink'); setTimeout(() => box.classList.remove('blink'), 120); }, 280);
      setTimeout(blink, 2200 + Math.random() * 4000);
    };
    box.querySelector('.body').onclick = () => speak();
    setTimeout(speak, 1500); setTimeout(blink, 2500);
    window.Octo = { say: speak, el: box, setLines: l => { lines = l.slice(); last = -1; } };
  };
  window.Octo = {};
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
