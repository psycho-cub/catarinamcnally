/* ==========================================================
   main.js — behaviour only.

   All page CONTENT (cards, images, project text, media) lives
   in the .html files. This file just makes things work:
   placeholders, hover effects, theme, sidebar, password gate,
   the project navigator and the home shuffle.

   Images: any <img data-ph="…"> shows a grey placeholder until
   you give it a real file. In the HTML add either
       data-img="images/photo.jpg"                 (single)
       data-imgs="images/a.jpg,images/b.jpg"       (hover slideshow)
   or just replace the tag with a normal <img src="…">.
   ========================================================== */

let theme = 'light';

/* ---------- images ---------- */
function placeholder(ratio, label, frame){
  const [w,h] = (ratio || '4:3').split(':').map(Number);
  const W = 1200, H = Math.round(W * h / w);
  const step = frame ? (frame % 6) : 0;
  const shift = v => Math.max(0, Math.min(255, v - step * 6));
  const hex = n => n.toString(16).padStart(2,'0');
  const g = (r) => '#'+hex(shift(r))+hex(shift(r))+hex(shift(r));
  const bg = g(0xE8), fg = g(0xDB), ink = g(0xAF);
  const rawCaption = frame ? (label || '')+' · '+(frame+1) : (label || (w+':'+h));
  const caption = String(rawCaption).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'">'+
    '<rect width="'+W+'" height="'+H+'" fill="'+bg+'"/>'+
    '<line x1="0" y1="0" x2="'+W+'" y2="'+H+'" stroke="'+fg+'" stroke-width="1.5"/>'+
    '<line x1="'+W+'" y1="0" x2="0" y2="'+H+'" stroke="'+fg+'" stroke-width="1.5"/>'+
    '<text x="50%" y="50%" fill="'+ink+'" font-family="ui-monospace,monospace" font-size="22" '+
    'text-anchor="middle" dominant-baseline="middle">'+caption+'</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function imageFor($img){
  const real = $img.attr('data-img');
  return real ? real : placeholder($img.data('ph'), $img.data('ph-label'));
}
function framesFor($img, count){
  const list = ($img.attr('data-imgs') || '').split(',').map(s => s.trim()).filter(Boolean);
  if(list.length) return list;
  const ratio = $img.data('ph'), label = $img.data('ph-label');
  const out = [];
  for(let f = 0; f < count; f++) out.push(placeholder(ratio, label, f));
  return out;
}
function paintPlaceholders(){
  $('img[data-ph]').each(function(){ $(this).attr('src', imageFor($(this))); });
}

/* ---------- scramble text ---------- */
const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________';
function scrambleText(el, finalText, opts){
  opts = opts || {};
  const speed  = opts.speed  || 1;
  const perLtr = opts.settle != null ? opts.settle : 1.6;
  if(el._scrambleRAF) cancelAnimationFrame(el._scrambleRAF);
  const chars = SCRAMBLE_CHARS, total = finalText.length;
  let frame = 0;
  const settleAt = i => 3 + i * perLtr;
  function tick(){
    let out = '', done = 0;
    for(let i = 0; i < total; i++){
      const ch = finalText[i];
      if(ch === ' '){ out += ' '; done++; continue; }
      if(frame >= settleAt(i)){ out += ch; done++; }
      else out += chars[Math.floor(Math.random() * chars.length)];
    }
    el.textContent = out;
    frame += speed;
    if(done < total) el._scrambleRAF = requestAnimationFrame(tick);
    else el._scrambleRAF = null;
  }
  tick();
}

/* ---------- hover slideshow ---------- */
function startSlideshow(card){
  const $img = $(card).find('.card__img, .hcard__img').first();
  const count = Number($(card).data('frames')) || 6;
  const frames = framesFor($img, count);
  if(frames.length < 2) return;
  let f = 0;
  stopSlideshow(card);
  card._slideTimer = setInterval(function(){
    f = (f + 1) % frames.length;
    $img.attr('src', frames[f]);
  }, 130);
}
function stopSlideshow(card){
  if(card._slideTimer){ clearInterval(card._slideTimer); card._slideTimer = null; }
  const $img = $(card).find('.card__img, .hcard__img').first();
  $img.attr('src', imageFor($img));
}

/* ---------- theme ---------- */
function setTheme(mode){
  theme = mode;
  $('html').attr('data-theme', mode);
  try { localStorage.setItem('theme', mode); } catch(e){}
  $('.theme-toggle').attr('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}
function initTheme(){
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch(e){}
  setTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
}

/* ---------- scroll reveal ---------- */
function reveal(sel){
  const els = document.querySelectorAll(sel);
  if(!('IntersectionObserver' in window)){ els.forEach(el => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      const i = Number(e.target.dataset.i || 0);
      setTimeout(() => e.target.classList.add('is-in'), (i % 4) * 55);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));
}

/* ---------- sidebar collapse + shared header behaviour ---------- */
/* Was the sidebar left open on the previous page? Falls back to open on
   desktop / closed on mobile the very first time. */
function sidebarShouldBeOpen(){
  let saved = null;
  try { saved = localStorage.getItem('sidebar'); } catch(e){}
  if(saved === 'open')   return true;
  if(saved === 'closed') return false;
  return !window.matchMedia('(max-width:860px)').matches;
}

/* Apply the saved state immediately — this script sits at the end of <body>,
   so doing it here (rather than waiting for DOM-ready) means the sidebar is
   already in the right position on the first paint, with no visible slide. */
(function applySidebarEarly(){
  if(!document.body) return;
  if(!sidebarShouldBeOpen()) document.body.classList.add('is-collapsed');
  document.body.classList.add('no-anim');          // suppress the transition once
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ document.body.classList.remove('no-anim'); });
  });
})();

function initHeader(){
  const isNarrow = () => window.matchMedia('(max-width:860px)').matches;
  function setSidebar(open, remember){
    $('body').toggleClass('is-collapsed', !open);
    $('#menu-btn').attr('aria-expanded', open);
    // remember the choice so the next page opens the same way
    if(remember !== false){
      try { localStorage.setItem('sidebar', open ? 'open' : 'closed'); } catch(e){}
    }
  }
  // restore the state from the last page (default: open on desktop, closed on
  // mobile). Passing `false` means "don't re-save what we just read".
  setSidebar(sidebarShouldBeOpen(), false);
  $('#menu-btn').on('click', () => setSidebar(true));
  $('#sidebar-close, #scrim').on('click', () => setSidebar(false));
  $('.theme-toggle').on('click', () => setTheme(theme === 'dark' ? 'light' : 'dark'));
  $(document).on('keydown', function(e){
    if(e.key === 'Escape'){
      if(!$('#lock-modal').hasClass('hidden')){ closeLockModal(); return; }
      setSidebar(false);
    }
  });
  $('.year').text(new Date().getFullYear());

  // nav label + close-button scramble on hover
  $(document).on('mouseenter', '.scram', function(){
    if(this._origHTML == null) this._origHTML = this.innerHTML;
    const short = this.getAttribute('data-short');
    const full  = this.getAttribute('data-final');
    const target = (short && isNarrow()) ? short : full;
    scrambleText(this, target || this.textContent);
  }).on('mouseleave', '.scram', function(){
    if(this._scrambleRAF){ cancelAnimationFrame(this._scrambleRAF); this._scrambleRAF = null; }
    if(this._origHTML != null) this.innerHTML = this._origHTML;
  });

  // mark the active nav link
  const page = document.body.getAttribute('data-page');
  if(page) $('.nav__links a[data-nav="'+page+'"]').addClass('is-active');
}

/* live GMT clock (only present on the home page) */
function initClock(){
  const el = document.getElementById('home-clock');
  if(!el) return;
  (function tick(){
    const n = new Date();
    const p = x => String(x).padStart(2,'0');
    el.textContent = p(n.getUTCHours())+':'+p(n.getUTCMinutes())+':'+p(n.getUTCSeconds())+' GMT';
    setTimeout(tick, 1000);
  })();
}

/* ===================== PAGE BEHAVIOUR ===================== */

/* Order of the project pages — used by the bottom navigator only.
   Add/remove a line when you add/remove a project page. */
const PROJECT_ORDER = [
  {slug:'fl-01', name:'Client One — Placeholder Project'},
  {slug:'fl-02', name:'Client Two — Placeholder Project'},
  {slug:'fl-03', name:'Client Three — Placeholder Project'},
  {slug:'fl-05', name:'Client Five — Placeholder Project'},
  {slug:'fl-06', name:'Client Six — Placeholder Project'},
  {slug:'fl-07', name:'Client Seven — Placeholder Project'},
  {slug:'fl-08', name:'Client Eight — Placeholder Project'},
  {slug:'ih-01', name:'Company Name — Placeholder Project'},
  {slug:'ih-02', name:'Company Name — Placeholder Project'},
  {slug:'ih-03', name:'Company Name — Placeholder Project'},
  {slug:'ih-04', name:'Company Name — Placeholder Project'},
  {slug:'pp-02', name:'Self-initiated — Placeholder Project'},
  {slug:'pp-03', name:'Self-initiated — Placeholder Project'},
  {slug:'pp-04', name:'Self-initiated — Placeholder Project'}
];

let syncAccordionRef = null;

/* ---------- password gate ---------- */
/* Sections are marked in the HTML with  class="section__head is-locked"
   and  data-password="…". Unlocking is remembered for the browser session. */
let pendingSection = null;
function unlockedSections(){
  try { return JSON.parse(sessionStorage.getItem('unlocked') || '[]'); } catch(e){ return []; }
}
function applyUnlocked(){
  unlockedSections().forEach(function(label){
    $('.section__head[data-section="'+label+'"]').removeClass('is-locked')
      .find('.section__lock').attr('aria-label','Unlocked');
    $('.card--locked[data-lock="'+label+'"]').each(function(){
      $(this).removeClass('card--locked').attr('href', $(this).data('href'));
      $(this).find('.card__lockveil').remove();
    });
  });
}
function tryUnlock(label){
  pendingSection = label;
  $('#lock-modal-text').text('“'+label+'” is password-protected. Enter the password to view these projects.');
  $('#lock-modal-input').val('').removeClass('is-wrong');
  $('#lock-modal-error').addClass('hidden');
  $('#lock-modal').removeClass('hidden');
  setTimeout(function(){ $('#lock-modal-input').trigger('focus'); }, 30);
}
function closeLockModal(){ $('#lock-modal').addClass('hidden'); pendingSection = null; }
function submitUnlock(){
  const $head = $('.section__head[data-section="'+pendingSection+'"]');
  const pw = $head.data('password');
  if($('#lock-modal-input').val() === String(pw)){
    const list = unlockedSections();
    if(list.indexOf(pendingSection) === -1) list.push(pendingSection);
    try { sessionStorage.setItem('unlocked', JSON.stringify(list)); } catch(e){}
    applyUnlocked();
    closeLockModal();
  } else {
    $('#lock-modal-input').addClass('is-wrong').trigger('select');
    $('#lock-modal-error').removeClass('hidden');
  }
}
function initLock(){
  $('#lock-modal-submit').on('click', submitUnlock);
  $('#lock-modal-cancel, #lock-modal-close, #lock-modal-backdrop').on('click', closeLockModal);
  $('#lock-modal-input').on('keydown', function(e){ if(e.key === 'Enter') submitUnlock(); else $(this).removeClass('is-wrong'); })
                        .on('input', function(){ $('#lock-modal-error').addClass('hidden'); });
  $(document).on('click', '.card--locked', function(e){ e.preventDefault(); tryUnlock($(this).data('lock')); });
  $(document).on('click', '.section__head.is-locked .section__lock', function(e){
    e.stopPropagation(); tryUnlock($(this).closest('.section__head').data('section'));
  });
  applyUnlocked();
}

/* ---------- mobile accordion ---------- */
function initAccordion(){
  if(!$('.grid').length) return;
  const isNarrow = () => window.matchMedia('(max-width:860px)').matches;
  function sync(){
    if(isNarrow()) $('.grid').addClass('is-collapsible');
    else { $('.grid').removeClass('is-collapsible is-shut').css('max-height',''); $('.section__head').removeClass('is-shut'); }
  }
  syncAccordionRef = sync;
  $(document).on('click', '.section__head', function(){
    if(!isNarrow()) return;
    const $head = $(this), $grid = $head.next('.grid');
    const shut = $head.toggleClass('is-shut').hasClass('is-shut');
    if(shut){ $grid.css('max-height', $grid[0].scrollHeight+'px'); $grid[0].offsetHeight; $grid.addClass('is-shut'); }
    else { $grid.removeClass('is-shut').css('max-height', $grid[0].scrollHeight+'px');
           $grid.one('transitionend', function(){ $grid.css('max-height',''); }); }
  });
  sync();
  let rt; $(window).on('resize', function(){ clearTimeout(rt); rt = setTimeout(sync, 150); });
}

/* ---------- card hover ---------- */
function initCardHover(){
  $(document).on('mouseenter', '.card', function(){
    if($(this).hasClass('card--soon') || $(this).hasClass('card--locked')) return;
    const $c = $(this).find('.card__client'), $t = $(this).find('.card__title');
    if($c.length) scrambleText($c[0], $c.data('final') || $c.text());
    if($t.length) scrambleText($t[0], $t.data('final') || $t.text());
    startSlideshow(this);
  }).on('mouseleave', '.card', function(){
    stopSlideshow(this);
    const $c = $(this).find('.card__client'), $t = $(this).find('.card__title');
    if($c.length){ if($c[0]._scrambleRAF) cancelAnimationFrame($c[0]._scrambleRAF); $c.text($c.data('final') || $c.text()); }
    if($t.length){ if($t[0]._scrambleRAF) cancelAnimationFrame($t[0]._scrambleRAF); $t.text($t.data('final') || $t.text()); }
  });
  $(document).on('mouseenter', '.hcard', function(){
    startSlideshow(this);
    $(this).find('.scram').each(function(){ scrambleText(this, $(this).data('final') || this.textContent); });
  }).on('mouseleave', '.hcard', function(){
    stopSlideshow(this);
    $(this).find('.scram').each(function(){
      if(this._scrambleRAF) cancelAnimationFrame(this._scrambleRAF);
      if(this._origHTML != null) this.innerHTML = this._origHTML;
      else this.textContent = $(this).data('final') || this.textContent;
    });
  });
  $(document).on('mouseenter', '#next-link', function(){
    $(this).find('.scram').each(function(){ scrambleText(this, $(this).data('final') || this.textContent); });
  }).on('mouseleave', '#next-link', function(){
    $(this).find('.scram').each(function(){
      if(this._scrambleRAF) cancelAnimationFrame(this._scrambleRAF);
      this.textContent = $(this).data('final') || this.textContent;
    });
  });
}

/* ---------- project page: intro scramble + bottom navigator ---------- */
function initProjectPage(){
  const slug = document.body.getAttribute('data-slug');
  if(!slug) return;

  /* scramble the info that's already in the HTML, with the height locked
     first so nothing below it jumps while the letters settle */
  const sels = ['#p-title','#p-year','#p-type','#p-scope','#p-copy-1','#p-copy-2'];
  const fields = sels.map(function(sel){
    const el = $(sel)[0];
    if(!el) return null;
    const text = el.textContent.replace(/\s+/g,' ').trim();
    el.style.minHeight = ''; el.textContent = text;
    el.style.minHeight = el.offsetHeight + 'px';
    $(sel).css('opacity', 0);
    return { el:el, text:text, fast: sel.indexOf('copy') > -1 };
  }).filter(Boolean);
  $('.project__head').removeClass('is-in');
  requestAnimationFrame(function(){ $('.project__head').addClass('is-in'); });
  setTimeout(function(){
    fields.forEach(function(f){
      $(f.el).css('opacity', 1);
      scrambleText(f.el, f.text, f.fast ? { speed:1, settle: Math.min(0.6, 34 / f.text.length) } : {});
    });
  }, 120);

  /* bottom navigator */
  const idx  = Math.max(0, PROJECT_ORDER.findIndex(function(p){ return p.slug === slug; }));
  const prev = PROJECT_ORDER[(idx - 1 + PROJECT_ORDER.length) % PROJECT_ORDER.length];
  const next = PROJECT_ORDER[(idx + 1) % PROJECT_ORDER.length];
  $('#prev-project').attr('href', prev.slug + '.html');
  $('#next-project').attr('href', next.slug + '.html');
  const $dots = $('#projbar-dots').empty();
  PROJECT_ORDER.forEach(function(p){
    $dots.append(
      '<a class="dot'+(p.slug === slug ? ' is-current' : '')+'" href="'+p.slug+'.html" aria-label="'+p.name+'">'+
        '<span class="dot__card"><span class="dot__thumb"><img data-ph="4:3" data-ph-label="'+p.name+'" alt=""></span>'+
        '<span class="dot__name">'+p.name+'</span></span><i></i></a>');
  });
  $('#projbar').removeClass('hidden');
  paintPlaceholders();

  $(document).on('keydown', function(e){
    if(!$('#lock-modal').hasClass('hidden')) return;
    if(e.key === 'ArrowLeft')  location.href = prev.slug + '.html';
    if(e.key === 'ArrowRight') location.href = next.slug + '.html';
  });
}

/* ---------- home: shuffle the footer layout (FLIP) ---------- */
function initShuffle(){
  const banner = document.getElementById('home-banner');
  if(!banner) return;
  let layoutIndex = 0;
  banner.classList.add('lay-0');
  $('#home-shuffle').on('click', function(){
    const items = Array.from(banner.querySelectorAll('.bi'));
    const first = items.map(function(el){ return el.getBoundingClientRect(); });
    let next = layoutIndex;
    while(next === layoutIndex) next = Math.floor(Math.random() * 10);
    banner.classList.remove('lay-' + layoutIndex);
    banner.classList.add('lay-' + next);
    layoutIndex = next;
    items.forEach(function(el, i){
      const last = el.getBoundingClientRect();
      el.style.transform = 'translate('+(first[i].left-last.left)+'px,'+(first[i].top-last.top)+'px)';
      el.style.transition = 'none';
    });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      items.forEach(function(el){ el.style.transition = 'transform .55s cubic-bezier(.22,.61,.36,1)'; el.style.transform = ''; });
    }); });
    setTimeout(function(){ items.forEach(function(el){ el.style.transition = ''; }); }, 640);
  });
}

/* ===================== BOOT ===================== */
$(function(){
  initTheme();
  initHeader();
  initLock();
  initCardHover();
  initAccordion();
  initClock();
  initShuffle();
  paintPlaceholders();
  reveal('.card');
  initProjectPage();
});
