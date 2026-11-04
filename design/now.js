/* Professional details live within the original About panel. */
(() => {
  const $=id=>document.getElementById(id);
  function el(tag,text,className){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}
  const button=$('nowToggle'),panel=$('nowPanel'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let open=false,animation=null;
  for(const item of window.PUBLIC_UPDATES.experience){
    const entry=el('article',null,'experience-entry');
    entry.append(el('h3',item.role),el('p',item.organization),el('p',item.dates,'experience-date'));if(item.organization==='Game studio'||item.organization==='Amplift.AI')entry.append(el('p',item.description,'experience-description'));
    $('experienceContent').append(entry);
  }
  for(const event of window.PUBLIC_UPDATES.events){
    const row=el('article',null,'now-entry'),link=el('a',event.title);link.href=event.url;link.target='_blank';link.rel='noopener';
    row.append(link,el('p',event.dates+' · '+event.location,'now-date'));
    const work=window.PROJECTS.find(p=>p.id===event.project);
    if(event.personalUrl){const a=el('a',work?.title||'52.05718° N, 4.40660° E','now-work');a.href=event.personalUrl;row.append(a);}
    else if(work){const button=el('button',work.title,'now-work');button.addEventListener('click',()=>{setOpen(false);document.dispatchEvent(new CustomEvent('portfolio:open-project',{detail:{id:work.id,trigger:button}}));});row.append(button);}
    if(event.images?.length){const grid=el('div',null,'now-photo-grid');
      for(const photo of event.images){const button=el('button',null,'event-photo');button.setAttribute('aria-label',photo.alt);const img=el('img');img.src=photo.preview||photo.src;img.alt='';img.width=600;img.height=600;img.loading='lazy';button.append(img);
        button.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('portfolio:open-image',{detail:{src:photo.src,alt:photo.alt,title:event.title,trigger:button}})));grid.append(button);}
      row.append(grid);
    }
    $('appearancesContent').append(row);
  }
  function setOpen(value){
    open=value;animation?.cancel();button.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('now-open',open);document.querySelector('main').inert=open;document.querySelector('footer').inert=open;
    panel.hidden=!open;
    if(open){
      $('projects').classList.remove('expanded');document.querySelector('.index-toggle').setAttribute('aria-expanded','false');$('orbitStage').inert=false;
      window.artMotion.suspend(true);
      if(!reduced.matches)animation=panel.animate([{opacity:0,transform:'perspective(900px) rotateX(-8deg) translateY(-6px)'},{opacity:1,transform:'perspective(900px) rotateX(0) translateY(0)'}],{duration:420,easing:'cubic-bezier(.22,.76,.22,1)'});
    }else{if(location.hash==='#experience')history.replaceState(null,'',location.pathname+location.search);if(!$('projectDialog').open)window.artMotion.suspend(false);button.focus({preventScroll:true});}
  }
  button.addEventListener('click',()=>setOpen(!open));
  document.addEventListener('pointerdown',event=>{if(open&&!event.target.closest('dialog[open],#themeToggle')&&!panel.contains(event.target)&&!button.contains(event.target)){setOpen(false);event.preventDefault();event.stopPropagation();}},true);
  document.addEventListener('keydown',event=>{if(open&&!document.querySelector('dialog[open]')&&event.key==='Escape'){event.preventDefault();event.stopPropagation();setOpen(false);}},true);
  document.addEventListener('portfolio:open-project',()=>{if(open)setOpen(false);});
  function openExperience(){if(location.hash==='#experience'){setOpen(true);panel.scrollTop=0;}}
  window.addEventListener('hashchange',openExperience);openExperience();
})();
