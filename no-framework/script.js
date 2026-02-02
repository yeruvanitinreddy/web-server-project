// Basic interactions for the five-file site

// Utility to set all year spans
(function setYears(){
  const y = new Date().getFullYear();
  const ids = ['year','year-2','year-3'];
  ids.forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.textContent = y;
  });
})();

// Mobile nav toggle(s)
function wireNav(toggleId, navId){
  const btn = document.getElementById(toggleId);
  const nav = document.getElementById(navId);
  if(!btn || !nav) return;
  btn.addEventListener('click', ()=>{
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    // use aria-hidden style hook
    nav.style.display = expanded ? '' : 'block';
    nav.setAttribute('aria-hidden', String(expanded));
  });
}

// wire up the three header toggles (one per page copy)
wireNav('nav-toggle','site-nav');
wireNav('nav-toggle-2','site-nav-2');
wireNav('nav-toggle-3','site-nav-3');

// Contact form: client-side validation & fake submit
(function(){
  const form = document.getElementById('contact-form');
  if(!form) return;

  const status = document.getElementById('form-status');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    status.textContent = '';
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    // basic checks
    if(name.length < 2){
      status.textContent = 'Please enter your name (at least 2 characters).';
      return;
    }
    if(!/^\S+@\S+\.\S+$/.test(email)){
      status.textContent = 'Please enter a valid email address.';
      return;
    }
    if(message.length < 10){
      status.textContent = 'Please enter a longer message (10+ characters).';
      return;
    }

    // fake submit: show loading, then success
    status.textContent = 'Sending…';
    setTimeout(()=>{
      status.textContent = 'Thanks — your message was received (demo).';
      form.reset();
    }, 700);
  });
})();