/* ============ 1. DATA — edit this, everything follows ============

   IMAGES: every project shows a grey placeholder until you add a path.
   Add these optional fields to any item below:
     image  : 'images/foo.jpg'                     // card thumb + hero + dot
     images : ['images/a.jpg','images/b.jpg', …]   // hover slideshow frames
     media  : ['images/m1.jpg', …]                 // the project page's image grid
   Put files in the /images folder. Example:
     {slug:'fl-01', client:'Acme', title:'Rebrand', year:'2026',
      scope:'Design & Build', type:'Freelance',
      image:'images/acme.jpg',
      images:['images/acme-1.jpg','images/acme-2.jpg','images/acme-3.jpg'],
      media:['images/acme-hero.jpg','images/acme-2.jpg','images/acme-3.jpg']}
   ================================================================ */
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

/* Tools & Resources — same grid, two sections of 4 */
const TOOLS = [
  { label:'Design tools', items:[
    {slug:'dt-01',client:'Tool One',  title:'Placeholder tool'},
    {slug:'dt-02',client:'Tool Two',  title:'Placeholder tool'},
    {slug:'dt-03',client:'Tool Three',title:'Placeholder tool'},
    {slug:'dt-04',client:'Tool Four', title:'Placeholder tool'}
  ]},
  { label:'Resources', items:[
    {slug:'rs-01',client:'Resource One',  title:'Placeholder resource'},
    {slug:'rs-02',client:'Resource Two',  title:'Placeholder resource'},
    {slug:'rs-03',client:'Resource Three',title:'Placeholder resource'},
    {slug:'rs-04',client:'Resource Four', title:'Placeholder resource'}
  ]}
];

/* Media layout on a project page — reorder/swap freely */
const PROJECT_MEDIA = [
  'media--full',
  'media--half','media--half',
  'media--unit','media--unit','media--unit','media--unit',
  'media--tall','media--half',
  'media--full'
];

/* Tag each project with its section so gating logic can reach it */
SECTIONS.forEach(s => s.items.forEach(it => {
  it._section = s.label;
  it._locked  = !!s.locked;
}));
const ALL = SECTIONS.flatMap(s => s.items);

/* Which locked sections have been opened this session. NOTE: this is a
   light gate, not real security — the password lives in the page source,
   so it only keeps out casual visitors, which is all it's meant to do. */
const unlocked = {};
const sectionOf = label => SECTIONS.find(s => s.label === label);
const isUnlocked = item => !item._locked || unlocked[item._section];

/* Projects you can actually open: not "Coming Soon", and not behind a
   still-locked section. Excluded items get no page and no bottom-nav dot. */
const isLive = p => p.tag !== 'Coming Soon' && isUnlocked(p);
let LIVE = ALL.filter(isLive);
const refreshLive = () => { LIVE = ALL.filter(isLive); };
let theme = 'light';
let syncAccordionRef = null;   // set once the accordion is initialised

/* ============ 2. PLACEHOLDER IMAGES ============ */
/* ============ 2. IMAGES ============================================
   HOW TO USE REAL IMAGES
   ------------------------------------------------------------------
   Every <img> here starts as a generated grey placeholder. To use a
   real photo, give the image data a path — you never touch this code.

   • Single image (grid card, project hero, home card, etc.):
       add   data-img="images/my-photo.jpg"   to the <img>, OR set an
       `image:'images/my-photo.jpg'` field on the project in SECTIONS.

   • Hover slideshow (the little "gif" of several frames):
       add   data-imgs="images/a.jpg,images/b.jpg,images/c.jpg"
       to the <img>, OR set an `images:[ ... ]` array on the project.

   Put the files in the /images folder. If no path is given, the grey
   placeholder is used automatically, so the site always renders.
   ================================================================== */

/* Placeholders are fixed neutral greys, not theme-linked — real photos
   don't invert when you switch modes, so these shouldn't either. */
function placeholder(ratio, label, frame){
  const [w,h] = (ratio || '4:3').split(':').map(Number);
  const W = 1200, H = Math.round(W * h / w);
  // frame tints the grey slightly so each slideshow frame is visibly different
  const step = frame ? (frame % 6) : 0;
  const shift = v => Math.max(0, Math.min(255, v - step * 6));
  const hex = n => n.toString(16).padStart(2,'0');
  const g = (r) => '#'+hex(shift(r))+hex(shift(r))+hex(shift(r));
  const bg = g(0xE8), fg = g(0xDB), ink = g(0xAF);
  const rawCaption = frame ? (label || '')+' · '+(frame+1) : (label || (w+':'+h));
  const caption = String(rawCaption)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'">'+
    '<rect width="'+W+'" height="'+H+'" fill="'+bg+'"/>'+
    '<line x1="0" y1="0" x2="'+W+'" y2="'+H+'" stroke="'+fg+'" stroke-width="1.5"/>'+
    '<line x1="'+W+'" y1="0" x2="0" y2="'+H+'" stroke="'+fg+'" stroke-width="1.5"/>'+
    '<text x="50%" y="50%" fill="'+ink+'" font-family="ui-monospace,monospace" font-size="22" '+
    'text-anchor="middle" dominant-baseline="middle">'+caption+'</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* Return the resting src for an <img>: its real image if one was given
   (data-img), otherwise a generated placeholder. */
function imageFor($img){
  const real = $img.attr('data-img');
  if(real) return real;
  return placeholder($img.data('ph'), $img.data('ph-label'));
}

/* Return the list of slideshow frames for a card image: real files from
   data-imgs if given, otherwise generated placeholder frames. */
function framesFor($img, count){
  const list = ($img.attr('data-imgs') || '').split(',').map(s => s.trim()).filter(Boolean);
  if(list.length) return list;                       // real frames
  const ratio = $img.data('ph'), label = $img.data('ph-label');
  const out = [];
  for(let f = 0; f < count; f++) out.push(placeholder(ratio, label, f));
  return out;                                        // generated frames
}

function paintPlaceholders(){
  $('img[data-ph]').each(function(){
    $(this).attr('src', imageFor($(this)));
  });
}

/* ============ 2b. HOVER EFFECTS ============ */
/* Scramble text: cycle random glyphs then settle each letter left-to-right.
   Self-contained (no GSAP dependency) so it runs anywhere. */
const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________';
function scrambleText(el, finalText, opts){
  opts = opts || {};
  const speed  = opts.speed  || 1;      // letters settled per frame multiplier
  const perLtr = opts.settle != null ? opts.settle : 1.6;   // frames between letter locks
  if(el._scrambleRAF) cancelAnimationFrame(el._scrambleRAF);
  const chars = SCRAMBLE_CHARS;
  const total = finalText.length;
  let frame = 0;
  const settleAt = i => 3 + i * perLtr;
  function tick(){
    let out = '';
    let done = 0;
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

/* Hover slideshow: cycle the card image through its frames while hovered.
   Real frames (data-imgs) if provided, else generated placeholder frames.
   Works for both grid cards (.card__img) and the home cards (.hcard__img). */
function startSlideshow(card){
  const $img = $(card).find('.card__img, .hcard__img').first();
  const count = Number($(card).data('frames')) || 6;
  const frames = framesFor($img, count);
  if(frames.length < 2) return;        // nothing to animate
  let f = 0;
  stopSlideshow(card);                 // clear any prior loop
  card._slideTimer = setInterval(function(){
    f = (f + 1) % frames.length;
    $img.attr('src', frames[f]);
  }, 130);
}
function stopSlideshow(card){
  if(card._slideTimer){ clearInterval(card._slideTimer); card._slideTimer = null; }
  const $img = $(card).find('.card__img, .hcard__img').first();
  $img.attr('src', imageFor($img));    // reset to the resting image
}

/* ============ 3. THEME ============ */
function setTheme(mode){
  theme = mode;
  $('html').attr('data-theme', mode);
  $('.theme-toggle').attr('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

/* ============ 4. SCROLL REVEAL ============ */
function reveal(sel){
  const els = document.querySelectorAll(sel);
  if(!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('is-in')); return;
  }
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

/* Replay the entrance animation every time a view is shown: strip is-in so the
   cards drop back to their hidden state, force a reflow, then reveal again. */
function replayReveal(containerSel){
  const cards = document.querySelectorAll(containerSel + ' .card');
  cards.forEach(el => el.classList.remove('is-in'));
  void document.querySelector(containerSel)?.offsetHeight;   // flush the reset
  requestAnimationFrame(() => reveal(containerSel + ' .card'));
}

/* ============ 5. GRID VIEWS ============ */
const LOCK_SVG = '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="2.5" y="6.2" width="9" height="6.3" rx="1.2"/><path d="M4.4 6.2V4.6a2.6 2.6 0 0 1 5.2 0v1.6"/></svg>';

function buildGrid($target, sections, clickable, external){
  sections.forEach(function(section){
    const locked = section.locked && !unlocked[section.label];
    $target.append(
      '<header class="section__head'+(locked ? ' is-locked' : '')+'" data-section="'+section.label+'">'+
        '<h2 class="section__label">'+section.label+
          (section.locked ? '<span class="section__lock" aria-label="'+
            (locked ? 'Locked' : 'Unlocked')+'">'+LOCK_SVG+'</span>' : '')+
        '</h2>'+
        '<span class="section__right">'+
          '<span class="section__count">'+String(section.items.length).padStart(2,'0')+'</span>'+
          '<span class="section__chev" aria-hidden="true">'+
            '<svg viewBox="0 0 12 12"><path d="M2 4.5 6 8.5l4-4"/></svg>'+
          '</span>'+
        '</span>'+
      '</header>');
    const $grid = $('<div class="grid"></div>');
    section.items.forEach(function(item, i){
      const tag = item.tag
        ? '<span class="card__tag card__tag--'+item.tag.toLowerCase().replace(/\s+/g,'-')+'">'+item.tag+'</span>'
        : '';
      const gated = clickable && item._locked && !unlocked[item._section];
      const live  = clickable && isLive(item);
      const frames = 5 + (i % 6);   // 5–10 frames per card for the hover slideshow
      const arrow = external
        ? '<span class="card__ext" aria-hidden="true"><svg viewBox="0 0 12 12">'+
          '<path d="M3.5 8.5 8.5 3.5M4.2 3.5h4.3v4.3" fill="none" stroke="currentColor" '+
          'stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
        : '';
      const href = external ? (item.url || '#') : (live ? '#' : '#');
      $grid.append(
        '<a class="card'+(live ? '' : ' card--static')+
             (external ? ' card--ext-link' : '')+
             (item.tag === 'Coming Soon' ? ' card--soon' : '')+
             (gated ? ' card--locked' : '')+'" '+
           (live ? 'data-slug="'+item.slug+'"' : 'href="'+href+'"')+
           (external ? ' target="_blank" rel="noopener noreferrer"' : '')+
           (gated ? ' data-lock="'+item._section+'"' : '')+
           ' data-frames="'+frames+'" data-i="'+i+'">'+
          '<div class="card__frame">'+
            '<img class="card__img" data-ph="4:3" data-ph-label="'+item.client+'"'+
              (item.image ? ' data-img="'+item.image+'"' : '')+
              (item.images ? ' data-imgs="'+item.images.join(',')+'"' : '')+' alt="">'+
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

/* Re-render the work grid (used after an unlock) */
function rebuildWork(){
  $('#work').empty();
  buildGrid($('#work'), SECTIONS, true);
  paintPlaceholders();
  reveal('.card');
  if(typeof syncAccordionRef === 'function') syncAccordionRef();
}

/* Open the password modal for a section */
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
}

function closeLockModal(){
  $('#lock-modal').addClass('hidden');
  pendingSection = null;
}

function submitUnlock(){
  const section = sectionOf(pendingSection);
  if(!section) return closeLockModal();
  const entry = $('#lock-modal-input').val();
  if(entry === section.password){
    // unlock every locked section that shares this password, so one correct
    // entry opens all protected work at once
    SECTIONS.forEach(function(s){
      if(s.locked && s.password === entry) unlocked[s.label] = true;
    });
    refreshLive();
    rebuildWork();
    closeLockModal();
  } else {
    $('#lock-modal-input').addClass('is-wrong').trigger('select');
    $('#lock-modal-error').removeClass('hidden');
  }
}

function showView(name){
  $('#home, #work, #tools, #project').addClass('hidden');
  $('#' + name).removeClass('hidden');
  $('#projbar').toggleClass('hidden', name !== 'project');
  $('.nav__links a').removeClass('is-active');
  if(name === 'work' || name === 'project') $('.nav__links a[data-go="work"]').addClass('is-active');
  if(name === 'tools') $('.nav__links a[data-go="tools"]').addClass('is-active');
  window.scrollTo(0, 0);
  if(name === 'work')  replayReveal('#work');
  if(name === 'tools') replayReveal('#tools');
}

/* ============ 6. PROJECT VIEW ============ */
function openProject(slug){
  let idx = LIVE.findIndex(p => p.slug === slug);
  if(idx === -1){                       // locked, coming-soon, or unknown → gate or ignore
    const target = ALL.find(p => p.slug === slug);
    if(target && target._locked && !unlocked[target._section]) tryUnlock(target._section);
    return;
  }
  const p    = LIVE[idx];
  const prev = LIVE[(idx - 1 + LIVE.length) % LIVE.length];
  const next = LIVE[(idx + 1) % LIVE.length];

  $('#next-title').text(next.title).attr('data-final', next.title);
  $('#next-title')[0]._origHTML = null;   // reset cached markup for the scrambler
  $('#next-link').data('slug', next.slug);
  $('#next-img').attr('data-ph-label', next.client);
  if(next.image) $('#next-img').attr('data-img', next.image);
  else $('#next-img').removeAttr('data-img');

  // intro: fade the head in, then scramble every info field at once (no stagger)
  $('.project__head').removeClass('is-in');
  requestAnimationFrame(function(){ $('.project__head').addClass('is-in'); });

  const fields = [
    { el: '#p-title', text: p.title },
    { el: '#p-year',  text: p.year  },
    { el: '#p-type',  text: p.type  },
    { el: '#p-scope', text: p.scope }
  ];
  ['#p-copy-1', '#p-copy-2'].forEach(function(sel){
    const t = $(sel).data('final') || $(sel)[0].textContent.replace(/\s+/g, ' ').trim();
    $(sel).data('final', t);
    fields.push({ el: sel, text: t, fast: true });
  });

  fields.forEach(function(f){
    const el = $(f.el)[0];
    // Put the FINAL text in place first and pin the element's height, so the
    // scramble (which swaps chars in place) can't collapse or grow the layout.
    el.style.minHeight = '';           // reset from any previous project
    el.textContent = f.text;
    el.style.minHeight = el.offsetHeight + 'px';
    $(f.el).css('opacity', 0);
  });
  setTimeout(function(){
    fields.forEach(function(f){
      $(f.el).css('opacity', 1);
      // copy: scale the per-letter settle to the text length so long and short
      // columns take a similar total time and both visibly scramble
      const opts = f.fast ? { speed: 1, settle: Math.min(0.6, 34 / f.text.length) } : {};
      scrambleText($(f.el)[0], f.text, opts);
    });
  }, 120);

  // bottom navigator: arrows + one square per project
  $('#prev-project').data('slug', prev.slug);
  $('#next-project').data('slug', next.slug);

  const $dots = $('#projbar-dots').empty();
  LIVE.forEach(function(item){
    const thumbImg = item.image ? ' data-img="'+item.image+'"' : '';
    $dots.append(
      '<button class="dot'+(item.slug === p.slug ? ' is-current' : '')+'" '+
        'data-slug="'+item.slug+'" '+
        'aria-label="'+item.client+' — '+item.title+'">'+
        '<span class="dot__card">'+
          '<span class="dot__thumb"><img data-ph="4:3" data-ph-label="'+item.client+'"'+thumbImg+' alt=""></span>'+
          '<span class="dot__name">'+item.client+' — '+item.title+'</span>'+
        '</span>'+
        '<i></i>'+
      '</button>');
  });

  // project media: use the project's own `media:[...]` image paths if given,
  // otherwise fall back to generated placeholders in the PROJECT_MEDIA layout.
  const media = p.media || [];
  const $media = $('#media').empty();
  PROJECT_MEDIA.forEach(function(cls, i){
    const ratio = cls === 'media--full' ? '16:7'
                : cls === 'media--tall' ? '3:4'
                : cls === 'media--unit' ? '1:1' : '4:3';
    const real = media[i] ? ' data-img="'+media[i]+'"' : '';
    $media.append(
      '<figure class="'+cls+' media" data-i="'+i+'">'+
        '<img data-ph="'+ratio+'" data-ph-label="'+String(i+1).padStart(2,'0')+'"'+real+' alt=""></figure>');
  });

  showView('project');
  paintPlaceholders();
}

/* ============ 7. BOOT ============ */
$(function(){
  buildGrid($('#work'),  SECTIONS, true);   // cards open a project page
  buildGrid($('#tools'), TOOLS,    false, true);  // external links w/ outbound arrow
  setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  paintPlaceholders();   // once — placeholders don't react to the theme
  reveal('.card');
  showView('home');      // land on the home page
  $('.year').text(new Date().getFullYear());

  // live GMT clock in the home footer
  (function tickClock(){
    const now = new Date();
    const hh = String(now.getUTCHours()).padStart(2, '0');
    const mm = String(now.getUTCMinutes()).padStart(2, '0');
    const ss = String(now.getUTCSeconds()).padStart(2, '0');
    $('#home-clock').text(hh + ':' + mm + ':' + ss + ' GMT');
    setTimeout(tickClock, 1000);
  })();

  // shuffle the footer layout with a FLIP animation, so each item is seen
  // sliding from its old position to its new one.
  let layoutIndex = 0;
  $('#home-banner').addClass('lay-0');
  $('#home-shuffle').on('click', function(){
    const banner = document.getElementById('home-banner');
    const items = Array.from(banner.querySelectorAll('.bi'));

    // FIRST: record current positions
    const first = items.map(el => el.getBoundingClientRect());

    // choose a different layout and apply it (LAST positions take effect now)
    let next = layoutIndex;
    while(next === layoutIndex) next = Math.floor(Math.random() * 10);
    banner.classList.remove('lay-' + layoutIndex);
    banner.classList.add('lay-' + next);
    layoutIndex = next;

    // LAST + INVERT: for each item, jump it back to where it was…
    items.forEach(function(el, i){
      const last = el.getBoundingClientRect();
      const dx = first[i].left - last.left;
      const dy = first[i].top  - last.top;
      // translate only — scaling text/blocks mid-flight looks like a glitch
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      el.style.transition = 'none';
    });

    // …then PLAY: release to the new position on the next frame
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        items.forEach(function(el){
          el.style.transition = 'transform .55s cubic-bezier(.22,.61,.36,1)';
          el.style.transform = '';
        });
      });
    });

    // clean up inline styles once the motion settles
    setTimeout(function(){
      items.forEach(function(el){ el.style.transition = ''; });
    }, 640);
  });

  $('.theme-toggle').on('click', function(){
    setTheme(theme === 'dark' ? 'light' : 'dark');
  });

  $(document).on('click', '.card[data-slug]', function(){ openProject($(this).data('slug')); });
  $(document).on('click', '.card--locked', function(e){ e.preventDefault(); tryUnlock($(this).data('lock')); });
  $(document).on('click', '.card--static:not(.card--ext-link)', function(e){ e.preventDefault(); }); // inert placeholders only
  $(document).on('click', '#next-link', function(){ openProject($(this).data('slug')); });
  $(document).on('click', '#prev-project, #next-project, .dot', function(){ openProject($(this).data('slug')); });
  /* click the lock on a locked section header to unlock (desktop: header isn't an accordion toggle) */
  $(document).on('click', '.section__head.is-locked .section__lock', function(e){
    e.stopPropagation(); tryUnlock($(this).closest('.section__head').data('section'));
  });

  /* --- password modal --- */
  $('#lock-modal-submit').on('click', submitUnlock);
  $('#lock-modal-cancel, #lock-modal-close, #lock-modal-backdrop').on('click', closeLockModal);
  $('#lock-modal-input').on('keydown', function(e){
    if(e.key === 'Enter') submitUnlock();
    else $(this).removeClass('is-wrong');
  }).on('input', function(){ $('#lock-modal-error').addClass('hidden'); });
  $(document).on('click', '[data-go]', function(e){
    e.preventDefault();
    showView($(this).data('go'));
  });

  /* --- nav label scramble (Info / Selected Work / Tools & Resources) --- */
  $(document).on('mouseenter', '.scram', function(){
    const el = this;
    if(el._origHTML == null) el._origHTML = el.innerHTML;   // capture markup once
    const short = el.getAttribute('data-short');
    const full  = el.getAttribute('data-final');
    const target = (short && window.matchMedia('(max-width:860px)').matches) ? short : full;
    scrambleText(el, target);
  }).on('mouseleave', '.scram', function(){
    if(this._scrambleRAF){ cancelAnimationFrame(this._scrambleRAF); this._scrambleRAF = null; }
    if(this._origHTML != null) this.innerHTML = this._origHTML;   // restore lbl-long spans
  });

  /* --- card hover: scramble caption + image slideshow --- */
  $(document).on('mouseenter', '.card', function(){
    if($(this).hasClass('card--soon') || $(this).hasClass('card--locked')) return;   // inert cards
    const $client = $(this).find('.card__client');
    const $title  = $(this).find('.card__title');
    if($client.length) scrambleText($client[0], $client.data('final') || $client.text());
    if($title.length)  scrambleText($title[0],  $title.data('final')  || $title.text());
    startSlideshow(this);
  }).on('mouseleave', '.card', function(){
    stopSlideshow(this);
    // restore clean text in case a scramble was mid-flight
    const $client = $(this).find('.card__client');
    const $title  = $(this).find('.card__title');
    if($client.length){ if($client[0]._scrambleRAF) cancelAnimationFrame($client[0]._scrambleRAF); $client.text($client.data('final') || $client.text()); }
    if($title.length){  if($title[0]._scrambleRAF)  cancelAnimationFrame($title[0]._scrambleRAF);  $title.text($title.data('final')  || $title.text()); }
  });

  /* --- home card hover: slideshow + scramble both caption lines together
     (mirrors the grid card, where hovering anywhere scrambles both texts) --- */
  $(document).on('mouseenter', '.hcard', function(){
    startSlideshow(this);
    $(this).find('.scram').each(function(){
      scrambleText(this, $(this).data('final') || this.textContent);
    });
  }).on('mouseleave', '.hcard', function(){
    stopSlideshow(this);
    $(this).find('.scram').each(function(){
      if(this._scrambleRAF) cancelAnimationFrame(this._scrambleRAF);
      if(this._origHTML != null) this.innerHTML = this._origHTML;
      else this.textContent = $(this).data('final') || this.textContent;
    });
  });

  /* --- next-project hover: scramble title + sub from anywhere in the module --- */
  $(document).on('mouseenter', '#next-link', function(){
    $(this).find('.scram').each(function(){
      scrambleText(this, $(this).data('final') || this.textContent);
    });
  }).on('mouseleave', '#next-link', function(){
    $(this).find('.scram').each(function(){
      if(this._scrambleRAF) cancelAnimationFrame(this._scrambleRAF);
      this.textContent = $(this).data('final') || this.textContent;
    });
  });

  /* --- sidebar collapse --- */
  const isNarrow = () => window.matchMedia('(max-width:860px)').matches;

  function setSidebar(open){
    $('body').toggleClass('is-collapsed', !open);
    $('#menu-btn').attr('aria-expanded', open);
  }

  setSidebar(!isNarrow());                       // open on desktop, tucked away on mobile
  $('#menu-btn').on('click', function(){ setSidebar(true); });   // opens only
  $('#sidebar-close, #scrim').on('click', function(){ setSidebar(false); });

  /* --- section accordion (mobile only) --- */
  function syncAccordion(){
    if(isNarrow()){
      $('.grid').addClass('is-collapsible');
    } else {
      // back on desktop: everything open, no inline heights left behind
      $('.grid').removeClass('is-collapsible is-shut').css('max-height', '');
      $('.section__head').removeClass('is-shut');
    }
  }
  syncAccordionRef = syncAccordion;   // let rebuildWork() re-sync after an unlock

  $(document).on('click', '.section__head', function(){
    if(!isNarrow()) return;
    const $head = $(this);
    const $grid = $head.next('.grid');
    const shut  = $head.toggleClass('is-shut').hasClass('is-shut');

    if(shut){
      $grid.css('max-height', $grid[0].scrollHeight + 'px');   // pin current height
      $grid[0].offsetHeight;                                    // force reflow
      $grid.addClass('is-shut');
    } else {
      $grid.removeClass('is-shut').css('max-height', $grid[0].scrollHeight + 'px');
      $grid.one('transitionend', function(){ $grid.css('max-height', ''); });
    }
  });

  syncAccordion();
  let rt;
  $(window).on('resize', function(){ clearTimeout(rt); rt = setTimeout(syncAccordion, 150); });

  $(document).on('keydown', function(e){
    const modalOpen = !$('#lock-modal').hasClass('hidden');
    if(e.key === 'Escape'){
      if(modalOpen){ closeLockModal(); return; }
      setSidebar(false);
    }
    if(modalOpen) return;                      // don't navigate behind the modal
    if($('#projbar').hasClass('hidden')) return;
    if(e.key === 'ArrowLeft')  openProject($('#prev-project').data('slug'));
    if(e.key === 'ArrowRight') openProject($('#next-project').data('slug'));
  });
});
