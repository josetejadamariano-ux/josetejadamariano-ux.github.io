// Spotlight, smooth card expand, and scroll reveal. Pages work fine without this file.
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cursor spotlight: desktop pointers only
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var spot = document.createElement('div');
    spot.className = 'spotlight';
    document.body.prepend(spot);
    var raf;
    addEventListener('pointermove', function(e){
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function(){
        spot.style.setProperty('--mx', e.clientX + 'px');
        spot.style.setProperty('--my', e.clientY + 'px');
        spot.classList.add('on');
      });
    }, {passive:true});
    document.documentElement.addEventListener('pointerleave', function(){ spot.classList.remove('on'); });
  }

  // Light/dark switch (remembers the choice when storage is available)
  var btn = document.querySelector('.theme-toggle');
  if (btn) {
    var root = document.documentElement, dark = matchMedia('(prefers-color-scheme: dark)');
    var current = function(){ return root.dataset.theme || (dark.matches ? 'dark' : 'light'); };
    var paint = function(){
      var next = current() === 'dark' ? 'light' : 'dark';
      btn.querySelector('.tt-label').textContent = next === 'dark' ? 'Dark mode' : 'Light mode';
      btn.querySelector('.tt-sun').hidden = next !== 'light';
      btn.querySelector('.tt-moon').hidden = next !== 'dark';
      btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = current() === 'dark' ? '#121212' : '#1F3A5F';
    };
    btn.addEventListener('click', function(){
      root.dataset.theme = current() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      paint();
    });
    dark.addEventListener('change', paint);
    paint();
    btn.hidden = false;
  }

  // Card glow follows the cursor
  document.querySelectorAll('.entry').forEach(function(c){
    c.addEventListener('pointermove', function(e){
      var r = c.getBoundingClientRect();
      c.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
  });

  if (reduce) return;

  // Smooth open/close for expandable cards
  document.querySelectorAll('details.entry').forEach(function(d){
    var s = d.querySelector('summary'), b = d.querySelector('.entry-body');
    if (!s || !b) return;
    s.addEventListener('click', function(e){
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = '1';
      var a;
      if (!d.open) {
        d.open = true;
        a = b.animate({height:['0px', b.scrollHeight + 'px'], opacity:[0,1]}, {duration:280, easing:'cubic-bezier(.2,.7,.3,1)'});
        a.onfinish = function(){ delete d.dataset.busy; };
      } else {
        a = b.animate({height:[b.offsetHeight + 'px', '0px'], opacity:[1,0]}, {duration:220, easing:'ease-in'});
        a.onfinish = function(){ d.open = false; delete d.dataset.busy; };
      }
    });
  });

  // Cards fade up, staggered, as they scroll into view
  var cards = document.querySelectorAll('.entry');
  if (!cards.length || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('reveal-ready');
  var io = new IntersectionObserver(function(entries){
    var i = 0;
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      en.target.style.setProperty('--d', (i++ * 70) + 'ms');
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, {rootMargin:'0px 0px -8% 0px'});
  cards.forEach(function(c){ io.observe(c); });
})();
