(async function(){
  const SECTION = window.DOCS_SECTION || location.pathname.split('/').pop().replace('.html','');
  const KEY = 'vrixadocs_authed';

  async function fetchDocs(){
    const res = await fetch('../docs.html');
    if(!res.ok) throw new Error('Failed to load docs.html');
    return await res.text();
  }

  try{
    const text = await fetchDocs();
    const parser = new DOMParser();
    const src = parser.parseFromString(text, 'text/html');

    // Grab parts from source
    const head = src.querySelector('head');
    const header = src.querySelector('header.topbar');
    const sidebar = src.querySelector('aside.sidebar');
    const toc = src.querySelector('aside.toc');
    const footer = src.querySelector('footer.doc__footer') || src.querySelector('footer');
    const toast = src.getElementById('toast');

    // Clear current document and build layout
    document.title = src.title || document.title;
    document.head.innerHTML = '';
    // copy head children (meta, link, style) and fix relative href/src so they work from /docs/
    if(head){
      Array.from(head.childNodes).forEach(n => {
        const node = document.importNode(n, true);
        if(node.nodeType === 1){
          const tag = node.tagName.toLowerCase();
          if(tag === 'link' && node.getAttribute('href')){
            const href = node.getAttribute('href');
            if(!href.startsWith('http') && !href.startsWith('/') && !href.startsWith('../')){
              node.setAttribute('href', '../' + href);
            }
          }
          if(tag === 'script' && node.getAttribute('src')){
            const src = node.getAttribute('src');
            if(!src.startsWith('http') && !src.startsWith('/') && !src.startsWith('../')){
              node.setAttribute('src', '../' + src);
            }
          }
        }
        document.head.appendChild(node);
      });
    }

    document.body.innerHTML = '';

    if(header) document.body.appendChild(document.importNode(header, true));

    const shell = document.createElement('div'); shell.className = 'shell';

    if(sidebar) shell.appendChild(document.importNode(sidebar, true));

    // main content: inject only the requested section inside an article.doc
    const main = document.createElement('main'); main.className = 'content';
    const article = document.createElement('article'); article.className = 'doc';
    const sectionNode = src.getElementById(SECTION);
    if(sectionNode){
      article.appendChild(document.importNode(sectionNode, true));
    } else {
      article.innerHTML = `<section class="doc__section"><h2 class="h2">Section '${SECTION}' not found</h2><p class="muted">Make sure <code>id=\"${SECTION}\"</code> exists in <code>docs.html</code>.</p></section>`;
    }
    main.appendChild(article);
    shell.appendChild(main);

    if(toc) shell.appendChild(document.importNode(toc, true));

    document.body.appendChild(shell);

    if(footer) document.body.appendChild(document.importNode(footer, true));
    if(toast) document.body.appendChild(document.importNode(toast, true));

    // Add logout button to topbar
    const topbar = document.querySelector('.topbar');
    if(topbar){
      const btn = document.createElement('button');
      btn.textContent = 'Logout';
      btn.className = 'iconbtn';
      btn.style.marginLeft = '12px';
      btn.title = 'Logout';
      btn.addEventListener('click', ()=>{
        localStorage.removeItem(KEY);
        location.href = '/';
      });
      topbar.appendChild(btn);
    }

    // Ensure app.js is loaded (append script)
    const existing = document.querySelector('script[src="../app.js"]');
    if(!existing){
      const s = document.createElement('script'); s.src = '../app.js'; s.defer = true; document.body.appendChild(s);
    }

    // Activate sidebar nav link for this section (if present)
    try{
      const navlink = document.querySelector('.navlink[href$="#'+SECTION+'"]') || document.querySelector('.navlink[href$="/'+SECTION+'.html"]');
      if(navlink) navlink.classList.add('is-active');
      // Also highlight any direct anchor
      const a = document.querySelector('.navlink[href$="'+SECTION+'"]'); if(a) a.classList.add('is-active');
    }catch(e){}

  }catch(err){
    document.body.innerHTML = `<main style="padding:24px"><h2>Error loading docs</h2><pre>${err.message}</pre></main>`;
  }
})();
