/* Keeper — Cherry Creek Treatment Center website chat */
(function () {
  if (window.__keeperLoaded) return;
  window.__keeperLoaded = true;

  var MAX_TURNS = 30;
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  var userId = store.get('keeper_uid') || ('v-' + Math.random().toString(36).slice(2) + Date.now().toString(36));
  store.set('keeper_uid', userId);
  var sessionId = store.get('keeper_sid') || null;
  var turns = 0, busy = false, started = false;

  var css = '' +
  '#keeper-btn{position:fixed;right:20px;bottom:20px;z-index:9999;display:flex;align-items:center;gap:10px;background:#1E234D;color:#fff;border:0;border-radius:999px;padding:12px 18px 12px 14px;font:600 15px/1 inherit;font-family:inherit;box-shadow:0 8px 32px rgba(30,35,77,.25);cursor:pointer}' +
  '#keeper-btn:hover{background:#151936}' +
  '#keeper-btn .k-dot{width:30px;height:30px;border-radius:50%;background:#7B6FA8;display:flex;align-items:center;justify-content:center;font-size:15px}' +
  '#keeper-panel{position:fixed;right:20px;bottom:86px;z-index:9999;width:370px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 110px);background:#FAFAFC;border:1px solid #DDD8F0;border-radius:20px;box-shadow:0 8px 32px rgba(30,35,77,.2);display:none;flex-direction:column;overflow:hidden;font-family:inherit}' +
  '#keeper-panel.open{display:flex}' +
  '.k-head{background:#1E234D;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}' +
  '.k-head .k-dot{width:36px;height:36px;border-radius:50%;background:#7B6FA8;display:flex;align-items:center;justify-content:center;font-size:17px;flex:none}' +
  '.k-head b{display:block;font-size:16px}.k-head small{opacity:.8;font-size:12px}' +
  '.k-head button{margin-left:auto;background:none;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1}' +
  '.k-crisis{background:#EEEAF8;color:#1E234D;font-size:12px;padding:8px 14px;border-bottom:1px solid #DDD8F0}' +
  '.k-crisis a{color:#1E234D;font-weight:700}' +
  '.k-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}' +
  '.k-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:14.5px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}' +
  '.k-bot{background:#fff;border:1px solid #DDD8F0;color:#1E234D;align-self:flex-start;border-bottom-left-radius:4px}' +
  '.k-me{background:#7B6FA8;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}' +
  '.k-typing{color:#7A8395;font-size:13px;align-self:flex-start;padding:4px 6px}' +
  '.k-chips{display:flex;flex-wrap:wrap;gap:6px}' +
  '.k-chip{background:#EEEAF8;border:1px solid #CFC7EA;color:#1E234D;border-radius:999px;padding:7px 12px;font-size:13px;cursor:pointer;font-family:inherit}' +
  '.k-chip:hover{background:#CFC7EA}' +
  '.k-form{display:flex;gap:8px;padding:10px;border-top:1px solid #DDD8F0;background:#fff}' +
  '.k-form input{flex:1;border:1px solid #DDD8F0;border-radius:999px;padding:10px 14px;font-size:14.5px;font-family:inherit;outline:none}' +
  '.k-form input:focus{border-color:#7B6FA8}' +
  '.k-form button{background:#1E234D;color:#fff;border:0;border-radius:999px;padding:0 16px;font-weight:600;cursor:pointer;font-family:inherit}' +
  '.k-form button:disabled{opacity:.5;cursor:default}' +
  '.k-foot{font-size:11px;color:#7A8395;text-align:center;padding:0 10px 8px;background:#fff}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.id = 'keeper-btn';
  btn.setAttribute('aria-label', 'Chat with Keeper');
  btn.innerHTML = '<span class="k-dot">&#9752;</span>Chat with Keeper';

  var panel = document.createElement('div');
  panel.id = 'keeper-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Keeper chat');
  panel.innerHTML =
    '<div class="k-head"><span class="k-dot">&#9752;</span><div><b>Keeper</b><small>Cherry Creek’s 24/7 guide</small></div><button type="button" aria-label="Close chat">&times;</button></div>' +
    '<div class="k-crisis">In crisis? Call or text <a href="tel:988">988</a>. Emergency: <a href="tel:911">911</a>. Admissions 24/7: <a href="tel:+13163307126">(316) 330-7126</a></div>' +
    '<div class="k-log" aria-live="polite"></div>' +
    '<form class="k-form"><input type="text" maxlength="600" placeholder="Type a message…" aria-label="Message"><button type="submit">Send</button></form>' +
    '<div class="k-foot">Confidential. Please don’t share insurance IDs or other personal details here.</div>';

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  var log = panel.querySelector('.k-log');
  var form = panel.querySelector('.k-form');
  var input = form.querySelector('input');
  var sendBtn = form.querySelector('button');

  function add(text, who) {
    var d = document.createElement('div');
    d.className = 'k-msg ' + (who === 'me' ? 'k-me' : 'k-bot');
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function chips(list) {
    var wrap = document.createElement('div');
    wrap.className = 'k-chips';
    list.forEach(function (label) {
      var c = document.createElement('button');
      c.type = 'button'; c.className = 'k-chip'; c.textContent = label;
      c.onclick = function () { wrap.remove(); send(label); };
      wrap.appendChild(c);
    });
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
  }

  function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    if (turns >= MAX_TURNS) {
      add('To keep helping, please call our admissions team 24/7 at (316) 330-7126.', 'bot');
      return;
    }
    turns++; busy = true; sendBtn.disabled = true;
    var old = log.querySelector('.k-chips'); if (old) old.remove();
    add(text, 'me');
    var typing = document.createElement('div');
    typing.className = 'k-typing'; typing.textContent = 'Keeper is typing…';
    log.appendChild(typing); log.scrollTop = log.scrollHeight;

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, userId: userId, sessionId: sessionId })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.sessionId) { sessionId = data.sessionId; store.set('keeper_sid', sessionId); }
        add(data.reply, 'bot');
      })
      .catch(function () {
        add('I’m having trouble connecting. Please call admissions 24/7 at (316) 330-7126. In an emergency, call 911, or call or text 988.', 'bot');
      })
      .then(function () { typing.remove(); busy = false; sendBtn.disabled = false; input.focus(); });
  }

  function start() {
    if (started) return;
    started = true;
    add('Hi, I’m Keeper, Cherry Creek’s 24/7 guide. This chat is confidential and you don’t need to share your name. If this is an emergency, call 911.\n\nHow can I help today?', 'bot');
    chips(['I just need someone to talk to', 'I’m wondering if I need treatment', 'I have questions about Cherry Creek']);
  }

  btn.onclick = function () {
    var open = panel.classList.toggle('open');
    if (open) { start(); input.focus(); }
  };
  panel.querySelector('.k-head button').onclick = function () { panel.classList.remove('open'); btn.focus(); };
  form.onsubmit = function (e) { e.preventDefault(); var t = input.value; input.value = ''; send(t); };
})();
