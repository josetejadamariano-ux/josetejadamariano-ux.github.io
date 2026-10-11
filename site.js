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
