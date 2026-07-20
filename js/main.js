/* ==========================================================
   main.js — all site data + behaviour. Plain jQuery.
   Edit your projects & tools in the DATA block below.
   ========================================================== */

/* ===================== DATA ===================== */
/* ============================================================
   SITE DATA — the single source of truth for projects & tools.
   Edit here; the build script regenerates the pages from it.

   IMAGES (all optional — grey placeholder shows if omitted):
     image  : 'images/foo.jpg'                    // card, hero, dot, next-thumb
     images : ['images/a.jpg','images/b.jpg', …]  // hover slideshow frames
     media  : ['images/m.jpg','images/c.mp4', …]  // project-page grid
              // .mp4/.webm/.mov autoplay muted+loop; full-width shows at the
              // media's natural height, paired items are 600px tall.

   TAGS: add  tag:'New'  or  tag:'Coming Soon'  to any project.
     "Coming Soon" also makes the project non-navigable (no page, hidden
     from the bottom nav). "New" is cosmetic only.
   ============================================================ */


const SECTIONS = [
  { label:'Freelance work', items:[
    {slug:'fl-01',client:'Client One',  title:'Placeholder Project',year:'2026',scope:'Design & Build',type:'Freelance',tag:'New'},
    {slug:'fl-02',client:'Client Two',  title:'Placeholder Project',year:'2025',scope:'Art Direction', type:'Freelance'},
    {slug:'fl-03',client:'Client Three',title:'Placeholder Project',year:'2025',scope:'Design & Build',type:'Freelance'},
    {slug:'fl-04',client:'Client Four', title:'Placeholder Project',year:'2025',scope:'Motion',        type:'Freelance',tag:'Coming Soon'},
    {slug:'fl-05',client:'Client Five', title:'Placeholder Project',year:'2024',scope:'Design & Build',type:'Freelance'},
    {slug:'fl-06',client:'Client Six',  title:'Placeholder Project',year:'2024',scope:'Identity',      type:'Freelance'},
    {slug:'fl-07',client:'Client Seven',title:'Placeholder Project',year:'2024',scope:'Design & Build',type:'Freelance'},
    {slug:'fl-08',client:'Client Eight',title:'Placeholder Project',year:'2023',scope:'Design',        type:'Freelance'}
  ]},
  { label:'In-house', locked:true, password:'catarina', items:[
    {slug:'ih-01',client:'Company Name',title:'Placeholder Project',year:'2025',scope:'Product Design',type:'In-house',tag:'New'},
    {slug:'ih-02',client:'Company Name',title:'Placeholder Project',year:'2025',scope:'Design System', type:'In-house'},
    {slug:'ih-03',client:'Company Name',title:'Placeholder Project',year:'2024',scope:'Campaign',      type:'In-house'},
    {slug:'ih-04',client:'Company Name',title:'Placeholder Project',year:'2024',scope:'Web',           type:'In-house'}
  ]},
  { label:'Pet projects', items:[
    {slug:'pp-01',client:'Self-initiated',title:'Placeholder Project',year:'2026',scope:'Everything',type:'Pet project',tag:'Coming Soon'},
    {slug:'pp-02',client:'Self-initiated',title:'Placeholder Project',year:'2025',scope:'Everything',type:'Pet project'},
    {slug:'pp-03',client:'Self-initiated',title:'Placeholder Project',year:'2025',scope:'Everything',type:'Pet project'},
    {slug:'pp-04',client:'Self-initiated',title:'Placeholder Project',year:'2024',scope:'Everything',type:'Pet project'}
  ]}
];

const TOOLS = [
  { label:'Design tools', items:[
    {slug:'dt-01',client:'Tool One',  title:'Placeholder tool', url:'#'},
    {slug:'dt-02',client:'Tool Two',  title:'Placeholder tool', url:'#'},
    {slug:'dt-03',client:'Tool Three',title:'Placeholder tool', url:'#'},
    {slug:'dt-04',client:'Tool Four', title:'Placeholder tool', url:'#'}
  ]},
  { label:'Resources', items:[
    {slug:'rs-01',client:'Resource One',  title:'Placeholder resource', url:'#'},
    {slug:'rs-02',client:'Resource Two',  title:'Placeholder resource', url:'#'},
    {slug:'rs-03',client:'Resource Three',title:'Placeholder resource', url:'#'},
    {slug:'rs-04',client:'Resource Four', title:'Placeholder resource', url:'#'}
  ]}
];

/* Media layout for each project page (reorder/swap freely) */
const PROJECT_MEDIA = [
  'media--full',
  'media--half','media--half',
  'media--unit','media--unit','media--unit','media--unit',
  'media--tall','media--half',
  'media--full'
];

/* Optional per-project copy: keyed by slug. Falls back to placeholder text. */
const COPY = {
  // 'fl-01': { lede1:'…', lede2:'…' },
};

/* ===================== CORE ===================== */
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

/* ===================== PAGES ==================== */
let syncAccordionRef = null;
/* ============================================================
   app.js — page-aware runtime for the multi-page site.
   Detects the current page via <body data-page> and builds it.
   Password unlock is persisted in sessionStorage so it survives
   navigation between the separate .html files.
   ============================================================ */

  // tag each project with its section + locked flag
  SECTIONS.forEach(s => s.items.forEach(it => { it._section = s.label; it._locked = !!s.locked; }));
  const ALL = SECTIONS.flatMap(s => s.items);

  // unlock state persisted across pages
  const unlocked = {};
  try {
    JSON.parse(sessionStorage.getItem('unlocked') || '[]').forEach(l => unlocked[l] = true);
  } catch(e){}
  const saveUnlocked = () => {
    try { sessionStorage.setItem('unlocked', JSON.stringify(Object.keys(unlocked))); } catch(e){}
  };
  const sectionOf  = label => SECTIONS.find(s => s.label === label);
  const isUnlocked = it => !it._locked || unlocked[it._section];
  const isLive     = p => p.tag !== 'Coming Soon' && isUnlocked(p);
  let LIVE = ALL.filter(isLive);
  const refreshLive = () => { LIVE = ALL.filter(isLive); };

  const LOCK_SVG = '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="2.5" y="6.2" width="9" height="6.3" rx="1.2"/><path d="M4.4 6.2V4.6a2.6 2.6 0 0 1 5.2 0v1.6"/></svg>';

  /* ---------- grid builder (work + tools) ---------- */
  function buildGrid($target, sections, opts){
    opts = opts || {};
    const clickable = opts.clickable, external = opts.external;
    sections.forEach(function(section){
      const locked = section.locked && !unlocked[section.label];
      $target.append(
        '<header class="section__head'+(locked ? ' is-locked' : '')+'" data-section="'+section.label+'">'+
          '<h2 class="section__label">'+section.label+
            (section.locked ? '<span class="section__lock" aria-label="'+(locked?'Locked':'Unlocked')+'">'+LOCK_SVG+'</span>' : '')+
          '</h2>'+
          '<span class="section__right">'+
            '<span class="section__count">'+String(section.items.length).padStart(2,'0')+'</span>'+
            '<span class="section__chev" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M2 4.5 6 8.5l4-4"/></svg></span>'+
          '</span>'+
        '</header>');
      const $grid = $('<div class="grid"></div>');
      section.items.forEach(function(item, i){
        const tag = item.tag ? '<span class="card__tag card__tag--'+item.tag.toLowerCase().replace(/\s+/g,'-')+'">'+item.tag+'</span>' : '';
        const gated = clickable && item._locked && !unlocked[item._section];
        const live  = clickable && isLive(item);
        const frames = 5 + (i % 6);
        const arrow = external ? '<span class="card__ext" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M3.5 8.5 8.5 3.5M4.2 3.5h4.3v4.3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' : '';
        const href = external ? (item.url || '#') : (live ? (item.slug + '.html') : '#');
        const dimg  = item.image ? ' data-img="'+item.image+'"' : '';
        const dimgs = item.images ? ' data-imgs="'+item.images.join(',')+'"' : '';
        $grid.append(
          '<a class="card'+(live ? '' : ' card--static')+
               (external ? ' card--ext-link' : '')+
               (item.tag === 'Coming Soon' ? ' card--soon' : '')+
               (gated ? ' card--locked' : '')+'" '+
             'href="'+href+'"'+
             (external ? ' target="_blank" rel="noopener noreferrer"' : '')+
             (gated ? ' data-lock="'+item._section+'"' : '')+
             ' data-frames="'+frames+'" data-i="'+i+'">'+
            '<div class="card__frame">'+
              '<img class="card__img" data-ph="4:3" data-ph-label="'+item.client+'"'+dimg+dimgs+' alt="">'+
              (gated ? '<span class="card__lockveil">'+LOCK_SVG+'</span>' : '')+
              tag+
            '</div>'+
            '<div class="card__meta">'+
              '<span class="card__client" data-final="'+item.client+'">'+item.client+'</span>'+
              '<span class="card__title" data-final="'+item.title+'">'+item.title+'</span>'+
              arrow+
            '</div>'+
          '</a>');
      });
      $target.append($grid);
    });
  }

  /* ---------- password modal ---------- */
  let pendingSection = null;
  function tryUnlock(label){
    const section = sectionOf(label);
    if(!section || unlocked[label]) return;
    pendingSection = label;
    $('#lock-modal-text').text('“'+label+'” is password-protected. Enter the password to view these projects.');
    $('#lock-modal-input').val('').removeClass('is-wrong');
    $('#lock-modal-error').addClass('hidden');
    $('#lock-modal').removeClass('hidden');
    setTimeout(() => $('#lock-modal-input').trigger('focus'), 30);
  };
  function closeLockModal(){ $('#lock-modal').addClass('hidden'); pendingSection = null; };
  function submitUnlock(){
    const section = sectionOf(pendingSection);
    if(!section) return closeLockModal();
    const entry = $('#lock-modal-input').val();
    if(entry === section.password){
      SECTIONS.forEach(s => { if(s.locked && s.password === entry) unlocked[s.label] = true; });
      saveUnlocked();
      refreshLive();
      // rebuild whichever grid is on this page
      if($('#work').length){ $('#work').empty(); buildGrid($('#work'), SECTIONS, {clickable:true}); paintPlaceholders(); replayReveal('#work'); if(syncAccordionRef) syncAccordionRef(); }
      closeLockModal();
    } else {
      $('#lock-modal-input').addClass('is-wrong').trigger('select');
      $('#lock-modal-error').removeClass('hidden');
    }
  }
  function wireModal(){
    $('#lock-modal-submit').on('click', submitUnlock);
    $('#lock-modal-cancel, #lock-modal-close, #lock-modal-backdrop').on('click', closeLockModal);
    $('#lock-modal-input').on('keydown', function(e){ if(e.key === 'Enter') submitUnlock(); else $(this).removeClass('is-wrong'); })
                          .on('input', function(){ $('#lock-modal-error').addClass('hidden'); });
    $(document).on('click', '.card--locked', function(e){ e.preventDefault(); tryUnlock($(this).data('lock')); });
    $(document).on('click', '.section__head.is-locked .section__lock', function(e){ e.stopPropagation(); tryUnlock($(this).closest('.section__head').data('section')); });
    // a locked card that becomes live after unlock should navigate on next click (handled by href)
  }

  /* ---------- mobile accordion (work + tools grids) ---------- */
  function initAccordion(){
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
      else { $grid.removeClass('is-shut').css('max-height', $grid[0].scrollHeight+'px'); $grid.one('transitionend', () => $grid.css('max-height','')); }
    });
    sync();
    let rt; $(window).on('resize', () => { clearTimeout(rt); rt = setTimeout(sync, 150); });
  }

  /* ---------- card hover (scramble + slideshow) ---------- */
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
    // home cards
    $(document).on('mouseenter', '.hcard', function(){
      startSlideshow(this);
      $(this).find('.scram').each(function(){ scrambleText(this, $(this).data('final') || this.textContent); });
    }).on('mouseleave', '.hcard', function(){
      stopSlideshow(this);
      $(this).find('.scram').each(function(){ if(this._scrambleRAF) cancelAnimationFrame(this._scrambleRAF); if(this._origHTML != null) this.innerHTML = this._origHTML; else this.textContent = $(this).data('final') || this.textContent; });
    });
  }
  function replayReveal(sel){
    document.querySelectorAll(sel + ' .card').forEach(el => el.classList.remove('is-in'));
    void (document.querySelector(sel) || {}).offsetHeight;
    requestAnimationFrame(() => reveal(sel + ' .card'));
  };

  /* ---------- project page ---------- */
  function buildProjectPage(slug){
    const idx  = Math.max(0, LIVE.findIndex(p => p.slug === slug));
    const p    = LIVE[idx];
    if(!p) return;
    const prev = LIVE[(idx - 1 + LIVE.length) % LIVE.length];
    const next = LIVE[(idx + 1) % LIVE.length];
    const copy = COPY[p.slug] || {};

    document.title = p.client + ' — ' + p.title;

    // fields with scramble + height-locked so layout doesn't jump
    const fields = [
      { el:'#p-title', text:p.title },
      { el:'#p-year',  text:p.year  },
      { el:'#p-type',  text:p.type  },
      { el:'#p-scope', text:p.scope }
    ];
    if(copy.lede1) $('#p-copy-1').text(copy.lede1).data('final', copy.lede1);
    if(copy.lede2) $('#p-copy-2').text(copy.lede2).data('final', copy.lede2);
    ['#p-copy-1','#p-copy-2'].forEach(sel => {
      const t = $(sel).data('final') || $(sel)[0].textContent.replace(/\s+/g,' ').trim();
      $(sel).data('final', t); fields.push({ el:sel, text:t, fast:true });
    });
    $('#next-title').text(next.title).attr('data-final', next.title);
    $('#next-title')[0]._origHTML = null;
    $('#next-link').attr('href', next.slug + '.html');
    $('#next-img').attr('data-ph-label', next.client);
    if(next.image) $('#next-img').attr('data-img', next.image); else $('#next-img').removeAttr('data-img');

    // media grid
    const media = p.media || [];
    const $media = $('#media').empty();
    PROJECT_MEDIA.forEach(function(cls, i){
      const ratio = cls === 'media--full' ? '16:7' : cls === 'media--tall' ? '3:4' : cls === 'media--unit' ? '1:1' : '4:3';
      const src = media[i];
      let inner;
      if(src && /\.(mp4|webm|mov)$/i.test(src)) inner = '<video src="'+src+'" autoplay muted loop playsinline></video>';
      else if(src) inner = '<img data-ph="'+ratio+'" data-ph-label="'+String(i+1).padStart(2,'0')+'" data-img="'+src+'" alt="">';
      else inner = '<img data-ph="'+ratio+'" data-ph-label="'+String(i+1).padStart(2,'0')+'" alt="">';
      $media.append('<figure class="'+cls+' media" data-i="'+i+'">'+inner+'</figure>');
    });

    // bottom navigator
    $('#prev-project').attr('href', prev.slug + '.html');
    $('#next-project').attr('href', next.slug + '.html');
    const $dots = $('#projbar-dots').empty();
    LIVE.forEach(function(item){
      const thumb = item.image ? ' data-img="'+item.image+'"' : '';
      $dots.append(
        '<a class="dot'+(item.slug === p.slug ? ' is-current' : '')+'" href="'+item.slug+'.html" aria-label="'+item.client+' — '+item.title+'">'+
          '<span class="dot__card"><span class="dot__thumb"><img data-ph="4:3" data-ph-label="'+item.client+'"'+thumb+' alt=""></span>'+
          '<span class="dot__name">'+item.client+' — '+item.title+'</span></span><i></i></a>');
    });
    $('#projbar').removeClass('hidden');

    paintPlaceholders();

    // intro scramble
    fields.forEach(f => {
      const el = $(f.el)[0];
      el.style.minHeight = ''; el.textContent = f.text; el.style.minHeight = el.offsetHeight + 'px';
      $(f.el).css('opacity', 0);
    });
    $('.project__head').removeClass('is-in');
    requestAnimationFrame(() => $('.project__head').addClass('is-in'));
    setTimeout(function(){
      fields.forEach(f => {
        $(f.el).css('opacity', 1);
        const opts = f.fast ? { speed:1, settle: Math.min(0.6, 34 / f.text.length) } : {};
        scrambleText($(f.el)[0], f.text, opts);
      });
    }, 120);

    // next-project hover
    $(document).on('mouseenter', '#next-link', function(){
      $(this).find('.scram').each(function(){ scrambleText(this, $(this).data('final') || this.textContent); });
    }).on('mouseleave', '#next-link', function(){
      $(this).find('.scram').each(function(){ if(this._scrambleRAF) cancelAnimationFrame(this._scrambleRAF); this.textContent = $(this).data('final') || this.textContent; });
    });

    // keyboard arrows
    $(document).on('keydown', function(e){
      if(!$('#lock-modal').hasClass('hidden')) return;
      if(e.key === 'ArrowLeft')  location.href = prev.slug + '.html';
      if(e.key === 'ArrowRight') location.href = next.slug + '.html';
    });
  }

  /* ---------- home shuffle (FLIP) ---------- */
  function initShuffle(){
    const banner = document.getElementById('home-banner');
    if(!banner) return;
    let layoutIndex = 0;
    banner.classList.add('lay-0');
    $('#home-shuffle').on('click', function(){
      const items = Array.from(banner.querySelectorAll('.bi'));
      const first = items.map(el => el.getBoundingClientRect());
      let next = layoutIndex; while(next === layoutIndex) next = Math.floor(Math.random()*10);
      banner.classList.remove('lay-'+layoutIndex); banner.classList.add('lay-'+next); layoutIndex = next;
      items.forEach((el, i) => {
        const last = el.getBoundingClientRect();
        el.style.transform = 'translate('+(first[i].left-last.left)+'px,'+(first[i].top-last.top)+'px)';
        el.style.transition = 'none';
      });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        items.forEach(el => { el.style.transition = 'transform .55s cubic-bezier(.22,.61,.36,1)'; el.style.transform = ''; });
      }));
      setTimeout(() => items.forEach(el => { el.style.transition = ''; }), 640);
    });
  }

  /* ============ PAGE BOOT ============ */
  $(function(){
    initTheme();
    initHeader();
    wireModal();
    initCardHover();
    initClock();

    const page = document.body.getAttribute('data-page');

    if(page === 'home'){
      paintPlaceholders();
      initShuffle();
    }
    if(page === 'work'){
      buildGrid($('#work'), SECTIONS, {clickable:true});
      paintPlaceholders();
      reveal('.card');
      initAccordion();
    }
    if(page === 'tools'){
      buildGrid($('#tools'), TOOLS, {clickable:false, external:true});
      paintPlaceholders();
      reveal('.card');
      initAccordion();
    }
    if(page === 'project'){
      const slug = document.body.getAttribute('data-slug');
      buildProjectPage(slug);
    }
  });
