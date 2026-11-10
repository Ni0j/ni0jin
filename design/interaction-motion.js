/* Local feedback shares the node network's connected, monochrome material. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  const linkSelector='a,button:not(.orbit-art):not(.art-open):not(.event-photo):not(#themeToggle):not(#paletteToggle)';
  function mark(){document.querySelectorAll(linkSelector).forEach(el=>{
    const title=el.querySelector('.title');(title||el).classList.add('motion-link');
  });}
  function target(event){return event.target.closest?.('button')?.querySelector('.title.motion-link')||event.target.closest?.('.motion-link');}
  mark();
  let scheduled=false;
  new MutationObserver(records=>{
    if(!records.some(r=>r.addedNodes.length&&[...r.addedNodes].some(n=>n.nodeType===1&&!n.matches?.('canvas,[data-letter-run],.field-letter,.letter-word'))))return;
    if(!scheduled){scheduled=true;queueMicrotask(()=>{scheduled=false;mark();});}
  }).observe(document.body,{childList:true,subtree:true});
  const lineAnimations=new WeakMap();
  function line(el,event,enter){
    if(!el||reduced.matches||!fine.matches)return;
    const rect=el.getBoundingClientRect(),from=(event.clientX-rect.left)/Math.max(1,rect.width)<.5?'0%':'100%';
    el.style.setProperty('--line-origin',from);lineAnimations.get(el)?.cancel();
    const animation=el.animate(enter?[{'--line-progress':'0%'},{'--line-progress':'100%'}]:[{'--line-progress':'100%'},{'--line-progress':'0%'}],{duration:enter?310:220,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});lineAnimations.set(el,animation);
  }
  document.addEventListener('pointerover',event=>{
    const link=target(event),control=event.target.closest?.('button')||link;
    if(link&&!control.contains(event.relatedTarget))line(link,event,true);
  });
  document.addEventListener('pointerout',event=>{
    const link=target(event),control=event.target.closest?.('button')||link;
    if(link&&!control.contains(event.relatedTarget))line(link,event,false);
  });
})();
