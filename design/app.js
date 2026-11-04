/* Shared content and behavior: only the CSS layout and placement differ. */
(() => {
  const allProjects=window.PROJECTS, projects=allProjects.filter(p=>p.featured!==false), layout=document.body.dataset.layout, playheads=new Map();
  const $=id=>document.getElementById(id), viewer=$('viewer'), details=$('details');
  const params=new URLSearchParams(location.search), reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let selected=allProjects.find(p=>p.id===(params.get('project')==='iron-fulu'?'echoes':params.get('project')))||projects[0];
  let filter=params.get('filter')||'all', mediaIndex=Math.max(0,Number(params.get('media'))||0), preview=null, lightboxTrigger=null, lastProjectTrigger=null;
  const filters=['all',...['music','type','web','print','game','motion'].filter(category=>projects.some(p=>p.category.split(' ').includes(category)))];
  if(!filters.includes(filter))filter='all';
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const matches=p=>filter==='all'||p.category.split(' ').includes(filter);
  const index=document.querySelector('.project-index'), gallery=$('gallery');
  const inlineMotion=layout==='b'||layout==='c';
  let entryMotion=null,miniPreview=null;
  const projectStage=document.createElement('div');projectStage.id='projectOrbitStage';projectStage.hidden=true;
  const projectLabel=document.createElement('p');projectLabel.id='projectMediaLabel';projectLabel.hidden=true;
  viewer.prepend(projectStage);projectStage.after(projectLabel);
  const projectOrbit=window.createOrbit({stage:projectStage,label:projectLabel,automatic:false,media:true,
    onChange(i,entry){mediaIndex=i;renderDescription();$('mediaCount').textContent=String(i+1).padStart(2,'0')+' / '+String(selected.media.length).padStart(2,'0');$('enlarge').textContent=entry?.type==='video'?'View video':'Enlarge';updateLinks();},
    onActivate(){openLightbox();}
  });
  function renderProjectOrbit(){
    const color=window.projectNodeColor?.(selected.id)||'#80b8c2';viewer.style.setProperty('--node-color',color);projectOrbit.setColor(color);
    const multiple=selected.media.length>1;
    projectStage.hidden=projectLabel.hidden=!multiple;$('frame').hidden=multiple;
    viewer.classList.toggle('has-media-orbit',multiple);$('enlarge').textContent='Enlarge';
    if(multiple){pauseWithin($('frame'));$('frame').replaceChildren();projectOrbit.start(selected.media,mediaIndex);}
    else projectOrbit.stop();
  }
  function updateLinks(){
    const query=new URLSearchParams();
    if($('projectDialog').open){query.set('project',selected.id);if(mediaIndex>0)query.set('media',String(mediaIndex));}
    if(params.get('home')==='orbit')query.set('home','orbit');
    history.replaceState(null,'',location.pathname+(query.size?'?'+query:'')+location.hash);
    document.querySelectorAll('[data-variant]').forEach(a=>{
      a.href=a.dataset.variant+'.html?'+query;
      if(a.dataset.variant===layout)a.setAttribute('aria-current','page');
    });
  }
  function makeMedia(p,i,cover=false){
    const m=cover&&p.cover?{src:p.cover,type:'image',label:p.title,width:p.coverWidth,height:p.coverHeight}:p.media[i];
    if(!m)return null;
    const el=document.createElement(m.type==='video'?'video':'img');
    el.src=encodeURI(m.src);el.dataset.original=m.original||p.originalCover||'';
    if(m.type==='video'){
      el.controls=true;el.playsInline=true;el.preload='metadata';if(m.poster)el.poster=encodeURI(m.poster);el.setAttribute('aria-label',m.label);
      el.addEventListener('loadedmetadata',()=>{
        const time=playheads.get(el.src);
        if(time>0&&time<el.duration)el.currentTime=time;
      });
    } else {el.alt=m.label;el.decoding='async';el.draggable=false;if(m.width)el.width=m.width;if(m.height)el.height=m.height;}
    return el;
  }
  function pauseWithin(el){el.querySelectorAll('video').forEach(v=>{if(v.currentTime>0)playheads.set(v.src,v.currentTime);v.pause();});}
  function renderFrame(p,i,isPreview=false){
    pauseWithin($('frame'));
    $('frame').replaceChildren();
    const media=makeMedia(p,i,isPreview||i===-1);
    if(media){
      media.addEventListener('error',()=>{
        $('status').textContent='Unable to load '+p.title+'. Try another media item.';
        if(!$('frame').querySelector('.media-error')){
          const note=document.createElement('p');note.className='unavailable media-error';note.textContent='Unable to load this media. Use next to continue.';$('frame').append(note);
        }
      });
      if(media.tagName==='IMG')media.addEventListener('click',openLightbox);
      if(layout==='c'&&!isPreview&&p.media.length===1){
        const surface=document.createElement('div');surface.className='single-media-node';surface.style.setProperty('--node-color',window.projectNodeColor?.(p.id)||'#80b8c2');
        const header=document.createElement('span');header.className='media-node-header';header.textContent=p.media[i]?.label||p.title;surface.append(header,media);$('frame').append(surface);
      }else $('frame').append(media);
    } else {
      const note=document.createElement('div');note.className='unavailable';
      note.innerHTML='<p>'+escape(p.title)+'</p><p>'+escape(p.previewNote||'No artwork file identified.')+'</p>';$('frame').append(note);
    }
    const count=p.media.length;
    const mediaLabel=!isPreview&&p.media[i]?.label!==p.title?p.media[i]?.label:'';
    $('previewLabel').textContent=(isPreview?'preview: ':'selected: ')+p.title+(isPreview?' · selected: '+selected.title:mediaLabel?' · '+mediaLabel:'');
    $('mediaCount').textContent=count?(i===-1?'cover':String(i+1).padStart(2,'0'))+' / '+String(count).padStart(2,'0'):'—';
    $('previousMedia').disabled=$('nextMedia').disabled=count<2;
    $('enlarge').disabled=!media;$('motionStudy').disabled=inlineMotion?false:!p.cover;
    viewer.dataset.showing=p.id;
  }
  function renderDescription(){
    const text=selected.media[mediaIndex]?.description||selected.description;
    $('selectedDescription').textContent=text;
    $('selectedDescription').hidden=!text;
  }
  function renderDetails(){
    $('selectedTitle').textContent=selected.title;
    $('selectedMeta').textContent=(selected.scope||selected.meta)+(selected.year?' / '+selected.year:'');
    renderDescription();$('selectedMeta').hidden=selected.id==='music';
    $('musicQuickBooking')?.remove();if(selected.id==='music'){const quick=document.createElement('button');quick.id='musicQuickBooking';quick.textContent='Book a project';quick.addEventListener('click',()=>window.openBooking?.(quick));$('backToOverview').before(quick);}
    $('projectWebsite')?.remove();details.querySelectorAll('.project-context').forEach(node=>node.remove());
    if(selected.website){
      const a=document.createElement('a');a.id='projectWebsite';a.href=selected.website;a.target='_blank';a.rel='noopener';a.textContent='Visit website';details.append(a);
    }
    for(const id of selected.eventIds||[]){
      const event=window.PUBLIC_UPDATES.events.find(item=>item.id===id);if(!event)continue;
      const state=window.publicEventState(event),line=document.createElement('p');line.className='project-context';
      const label=document.createElement('span');label.className='muted';label.textContent=state==='next'?'next on show · ':state==='on show'?'on show · ':'shown at · ';
      const link=document.createElement('a');link.href=event.url;link.target='_blank';link.rel='noopener';link.textContent=event.title+' ↗';
      const date=document.createElement('span');date.className='context-date muted';date.textContent=event.dates;line.append(label,link,date);details.append(line);
    }
    if(selected.id==='music'){
      const section=document.createElement('section');section.className='project-context music-commissions';section.setAttribute('aria-label','Music visual commissions');
      const heading=document.createElement('h3');heading.textContent='Open for commissions';
      const link=document.createElement('button');link.type='button';link.className='booking-launch';link.textContent='Book a project';link.addEventListener('click',()=>window.openBooking?.(link));
      section.append(heading,link);details.append(section);
    }else if(selected.inquiry){const line=document.createElement('p');line.className='project-context';const link=document.createElement('a');link.href=selected.inquiry;link.textContent='Discuss a project';line.append(link);details.append(line);}
    details.hidden=false;
    document.querySelectorAll('[data-project]').forEach(b=>{
      if(b.closest('.project-index'))b.removeAttribute('aria-current');
      else if(b.dataset.project===selected.id)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');
    });
  }
  function normalizeIndex(){if(mediaIndex>=selected.media.length)mediaIndex=0;}
  function commit(p,open=true){
    selected=p;preview=null;mediaIndex=0;
    if(inlineMotion){window.artMotion.stop();if(layout==='b')showDetail();}
    renderDetails();renderFrame(selected,0);updateLinks();
    if(layout==='c'&&open){
      $('projects').classList.remove('expanded');const toggle=document.querySelector('.index-toggle');if(toggle){toggle.textContent='Index';toggle.setAttribute('aria-expanded','false');}document.querySelector('#orbitStage')?.removeAttribute('inert');window.artMotion.setIndexMode?.(false);
      if(!$('projectDialog').open){$('projectDialog').showModal();document.body.style.overflow='hidden';}
      $('projectDialog').scrollTop=0;renderProjectOrbit();updateLinks();$('backToOverview').focus({preventScroll:true});requestAnimationFrame(()=>window.artMotion.enter?.());
    }
    $('status').textContent='Selected '+p.title+'.';
  }
  function restore(){preview=null;renderFrame(selected,mediaIndex);}
  function bindProjectButton(button,p,hover=true){
    button.dataset.project=p.id;button.setAttribute('aria-label',p.number+' '+p.title+' '+p.category.replaceAll(' ', ', '));
    button.addEventListener('click',()=>{lastProjectTrigger=button;commit(p);});
    if(hover){
      button.addEventListener('pointerenter',e=>{
        if(e.pointerType!=='mouse'||layout==='c')return;
        if(layout==='b'){miniPreview?.show(p);return;}
        if(p.id===selected.id)return;
        preview=p;renderFrame(p,-1,true);
      });
      button.addEventListener('pointerleave',()=>{if(layout==='b')miniPreview?.idle();else if(preview)restore();});
    }
  }
  function renderIndex(){
    index.replaceChildren();gallery.replaceChildren();
    projects.filter(matches).forEach(p=>{
      const li=document.createElement('li');li.className='project-row';
      const button=document.createElement('button');
      button.innerHTML=`<span class="number">${p.number}</span><span class="title">${escape(p.title)}</span><span class="category">${escape(p.category.replaceAll(' ', ', '))}</span>`;
      button.style.setProperty('--node-color',window.projectNodeColor?.(p.id)||'#80b8c2');bindProjectButton(button,p);li.append(button);index.append(li);
      if(p.cover&&layout==='c'){
        const article=document.createElement('article');article.className='artwork';article.dataset.work=p.id;
        const open=document.createElement('button');open.className='art-open';
        const img=makeMedia(p,0,true);img.alt='';img.loading=gallery.children.length<3?'eager':'lazy';
        open.append(img);const caption=document.createElement('span');caption.className='caption';
        caption.innerHTML=`<span class="number">${p.number}</span><span class="title">${escape(p.title)}</span><span class="category">${escape(p.category.replaceAll(' ', ', '))}</span>`;
        open.append(caption);bindProjectButton(open,p,false);article.append(open);gallery.append(article);
      }
    });
    projects.filter(p=>layout==='c'&&matches(p)&&!p.cover).forEach(p=>{
      const row=document.createElement('article');row.className='missing-artwork';
      const b=document.createElement('button');b.textContent=p.number+' '+p.title;bindProjectButton(b,p,false);
      const note=document.createElement('span');note.className='muted';note.textContent=p.previewNote||'artwork not available';row.append(b,note);gallery.append(row);
    });
    renderDetails();
  }
  document.querySelector('.filters').innerHTML=filters.map(f=>`<button data-filter="${f}" aria-pressed="${filter===f}">${f[0].toUpperCase()+f.slice(1)}</button>`).join('<span aria-hidden="true">/</span>');
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
    filter=b.dataset.filter;
    if(!matches(selected)){selected=projects.find(matches);mediaIndex=0;}
    preview=null;
    document.querySelectorAll('[data-filter]').forEach(f=>f.setAttribute('aria-pressed',String(f===b)));
    renderIndex();renderFrame(selected,0);updateLinks();if(inlineMotion&&entryMotion&&!entryMotion.hidden)showEntry();
    $('status').textContent='Showing '+projects.filter(matches).length+' projects. Selected '+selected.title+'.';
  }));
  function changeMedia(delta){
    if(preview)preview=null;
    if(!selected.media.length)return;
    mediaIndex=(mediaIndex+delta+selected.media.length)%selected.media.length;
    if(!projectStage.hidden)projectOrbit.move(delta);else {renderFrame(selected,mediaIndex);updateLinks();}
  }
  $('previousMedia').addEventListener('click',()=>changeMedia(-1));
  $('nextMedia').addEventListener('click',()=>changeMedia(1));
  $('closeSelection').addEventListener('click',()=>{
    if(layout==='c')closeProject();else if(layout==='b')showEntry();else {details.hidden=true;pauseWithin(viewer);$('status').textContent='Project details closed. Preview retained.';}
  });
  let closingProject=false;
  async function closeProject(){
    if(closingProject)return;closingProject=true;
    projectOrbit.stop();await window.artMotion.leave?.();
    pauseWithin(viewer);$('projectDialog').close();document.body.style.overflow='';closingProject=false;updateLinks();
    if(inlineMotion&&layout==='c'){if(window.createNodeNetwork&&params.get('home')!=='orbit')window.artMotion.suspend(false);else showEntry(false);}
    (lastProjectTrigger?.isConnected&&lastProjectTrigger.getClientRects().length?lastProjectTrigger:document.querySelector('.orbit-art[aria-current=true]')||gallery.querySelector(`[data-project="${selected.id}"]`))?.focus({preventScroll:true});
  }
  $('backToOverview').addEventListener('click',closeProject);
  $('projectDialog').addEventListener('cancel',e=>{e.preventDefault();closeProject();});
  const isPreviewMedia=(p,i)=>Boolean(preview)||i===-1;
  function openLightbox(){
    const p=preview||selected,i=preview?-1:mediaIndex;
    lightboxTrigger=document.activeElement;
    pauseWithin(viewer);projectOrbit.suspend(true);$('lightboxTitle').textContent=p.title;
    const enlarged=makeMedia(p,i,isPreviewMedia(p,i));
    $('lightboxMedia').replaceChildren(enlarged);
    $('fullResolution').hidden=enlarged.tagName!=='IMG';
    $('fullResolution').href=encodeURI('../'+enlarged.dataset.original);
    $('lightbox').showModal();$('closeLightbox').focus();
  }
  $('enlarge').addEventListener('click',openLightbox);
  function closeLightbox(){pauseWithin($('lightbox'));$('lightbox').close();if($('projectDialog').open&&!projectStage.hidden)projectOrbit.suspend(false);lightboxTrigger?.focus({preventScroll:true});}
  $('closeLightbox').addEventListener('click',closeLightbox);
  $('lightbox').addEventListener('cancel',e=>{e.preventDefault();closeLightbox();});
  $('motionStudy').addEventListener('click',()=>{
    if(inlineMotion){if(layout==='c'&&$('projectDialog').open)closeProject();else showEntry();return;}
    preview=null;restore();pauseWithin(viewer);$('motionDialog').showModal();
    const stills=selected.media.filter(m=>m.type==='image');
    const entries=stills.length>=3?stills.map(m=>({src:m.src,label:m.label,project:selected.id})):projects.filter(p=>p.cover).map(p=>({src:p.cover,label:p.title,project:p.id}));
    window.artMotion.start(entries,Math.max(0,entries.findIndex(e=>e.project===selected.id)));$('motionMode').focus();
  });
  function closeMotion(){window.artMotion.stop();$('motionDialog').close();$('motionStudy').focus({preventScroll:true});}
  $('closeMotion').addEventListener('click',closeMotion);
  $('motionDialog').addEventListener('cancel',e=>{e.preventDefault();closeMotion();});
  $('examineStudy').addEventListener('click',()=>{
    if(inlineMotion)lastProjectTrigger=document.querySelector('.orbit-art[aria-current=true]')||$('motionCanvas');
    const item=$('orbitStage')?.hidden?{project:selected.id}:window.artMotion.current();if(inlineMotion)window.artMotion.stop();else closeMotion();
    const p=projects.find(p=>p.id===item?.project);if(p){commit(p);const i=p.media.findIndex(m=>m.src===item.src);if(i>=0){mediaIndex=i;if(!projectStage.hidden)renderProjectOrbit();else renderFrame(p,i);updateLinks();}}
  });
  if(layout==='c'){
    $('focusContent').append(viewer,details);
    const toggle=document.createElement('button');toggle.className='index-toggle';toggle.textContent='Index';toggle.setAttribute('aria-expanded','false');
    toggle.addEventListener('click',()=>{const expanded=$('projects').classList.toggle('expanded');toggle.textContent='Index';toggle.setAttribute('aria-expanded',String(expanded));document.querySelector('#orbitStage')?.toggleAttribute('inert',expanded);window.artMotion.setIndexMode?.(expanded);});
    $('projects').insertBefore(toggle,$('projects').firstChild);toggle.setAttribute('aria-controls','projectIndex');index.id='projectIndex';
  }
  function showDetail(){
    if(!entryMotion)return;
    entryMotion.hidden=true;$('frame').hidden=false;$('previewLabel').hidden=false;
    document.querySelector('.media-controls').hidden=false;details.hidden=false;
  }
  function showEntry(scroll=true){
    if(!entryMotion)return;
    if(layout==='b'){
      pauseWithin(viewer);$('frame').hidden=true;$('previewLabel').hidden=true;
      document.querySelector('.media-controls').hidden=true;details.hidden=true;
    }
    entryMotion.hidden=false;
    const entries=projects.filter(p=>p.cover&&matches(p)).sort((a,b)=>a.orbitOrder-b.orbitOrder).map(p=>({src:p.cover,label:p.title,project:p.id,context:p.scope||p.meta,width:p.coverWidth,height:p.coverHeight}));
    const empty=!entries.length;
    entryMotion.classList.toggle('awaiting-work',empty);
    if($('orbitStage'))$('orbitStage').hidden=empty;
    entryMotion.querySelector('.study-controls').hidden=empty;
    $('examineStudy').textContent=empty?'about this project':'view work';
    entryMotion.querySelector('p.muted').hidden=true;
    if(empty){window.artMotion.stop();$('studyLabel').textContent=selected.title;return;}
    window.artMotion.start(entries,Math.max(0,entries.findIndex(e=>e.project===selected.id)),{scroll:true,mode:$('motionMode').value});
    if(scroll)entryMotion.scrollIntoView({block:'nearest'});
  }
  function installInlineMotion(){
    entryMotion=document.createElement('section');entryMotion.className='entry-motion';entryMotion.id='entryMotion';entryMotion.setAttribute('aria-label','Selected works');
    const source=$('motionDialog');
    [...source.children].filter(el=>!el.classList.contains('dialog-top')).forEach(el=>entryMotion.append(el));
    const caption=document.createElement('div');caption.className='study-caption';
    const title=entryMotion.querySelector('#studyLabel');title.before(caption);caption.append(title);
    const context=document.createElement('p');context.id='studyContext';caption.append(context);
    const count=document.createElement('span');count.id='studyCount';count.setAttribute('aria-hidden','true');entryMotion.querySelector('.study-controls').prepend(count);
    if(layout==='b')viewer.prepend(entryMotion);else document.querySelector('.composition').insertBefore(entryMotion,gallery);
    $('motionMode').value='orbit';
    entryMotion.querySelector('label').hidden=true;$('motionMode').hidden=true;
    $('examineStudy').textContent='view work';
    entryMotion.querySelector('p.muted').hidden=true;
    $('motionStudy').textContent='back to motion';
    $('motionCanvas').addEventListener('click',()=>$('examineStudy').click());
    $('motionCanvas').addEventListener('keydown',e=>{if(e.key==='Enter')$('examineStudy').click();});
    if(layout==='b')miniPreview=window.createIndexPreview($('projects'));
    showEntry(false);
  }
  document.addEventListener('portfolio:open-image',event=>{
    const image=document.createElement('img');image.src=encodeURI(event.detail.src);image.alt=event.detail.alt;
    lightboxTrigger=event.detail.trigger;pauseWithin(viewer);projectOrbit.suspend(true);
    $('lightboxTitle').textContent=event.detail.title;$('lightboxMedia').replaceChildren(image);
    $('fullResolution').hidden=false;$('fullResolution').href=encodeURI(event.detail.src);
    $('lightbox').showModal();$('closeLightbox').focus({preventScroll:true});
  });
  document.addEventListener('portfolio:open-project',event=>{const work=allProjects.find(p=>p.id===event.detail?.id);if(work){lastProjectTrigger=event.detail.trigger||document.activeElement;commit(work);}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video').forEach(v=>v.pause());});
  normalizeIndex();renderIndex();renderFrame(selected,mediaIndex);updateLinks();
  if(inlineMotion)installInlineMotion();
  if(layout==='c'&&params.has('project')){const initialMedia=mediaIndex;commit(selected);mediaIndex=initialMedia;normalizeIndex();renderProjectOrbit();if(projectStage.hidden)renderFrame(selected,mediaIndex);updateLinks();}
})();
