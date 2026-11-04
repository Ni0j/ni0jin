/* Appearance controls share the same small outlined-node language as the interface. */
(() => {
 const system=matchMedia('(prefers-color-scheme: dark)'),modes=['system','light','dark'];
 let mode='system',palette='mono';try{const saved=localStorage.getItem('nio-design-theme');if(modes.includes(saved))mode=saved;if(localStorage.getItem('nio-design-palette')==='color')palette='color';}catch{}
 const controls=document.createElement('div');controls.id='appearanceControls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Appearance');
 const theme=document.createElement('button'),color=document.createElement('button');theme.id='themeToggle';color.id='paletteToggle';theme.type=color.type='button';controls.append(theme,color);
 theme.innerHTML='<svg class="theme-symbol" viewBox="0 0 24 24" aria-hidden="true"><g class="theme-rays"><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></g><circle class="theme-disc" cx="12" cy="12" r="6"/><path class="theme-half" d="M12 6a6 6 0 0 1 0 12Z"/><circle class="theme-cutout" cx="16" cy="8" r="6"/></svg>';
 color.innerHTML='<svg class="palette-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="9" r="5"/><circle cx="16" cy="9" r="5"/><circle cx="12" cy="16" r="5"/></svg>';
 function apply(){
  const resolved=mode==='system'?(system.matches?'dark':'light'):mode, label=mode==='system'?'Auto':mode[0].toUpperCase()+mode.slice(1);
  document.documentElement.dataset.theme=resolved;document.documentElement.dataset.themeMode=mode;document.documentElement.dataset.palette=palette;
  theme.dataset.mode=mode;theme.removeAttribute('title');theme.setAttribute('aria-label','Switch appearance. Current theme: '+label+'. Next: '+(modes[(modes.indexOf(mode)+1)%3]==='system'?'automatic':modes[(modes.indexOf(mode)+1)%3])+'.');
  color.setAttribute('aria-pressed',String(palette==='color'));color.setAttribute('aria-label',palette==='color'?'Use black and white nodes':'Use colored nodes');color.removeAttribute('title');
  window.dispatchEvent(new CustomEvent('portfolio:theme',{detail:{theme:resolved,mode}}));window.dispatchEvent(new CustomEvent('portfolio:palette',{detail:{palette}}));
 }
 function position(){const top=document.querySelector('#bookingDialog[open]')||document.querySelector('#lightbox[open]')||document.querySelector('#projectDialog[open]')||document.body;if(controls.parentElement!==top)top.append(controls);}
 theme.addEventListener('click',()=>{mode=modes[(modes.indexOf(mode)+1)%3];try{localStorage.setItem('nio-design-theme',mode);}catch{}apply();});
 color.addEventListener('click',()=>{palette=palette==='mono'?'color':'mono';try{localStorage.setItem('nio-design-palette',palette);}catch{}apply();});
 system.addEventListener('change',()=>{if(mode==='system')apply();});new MutationObserver(position).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});position();apply();
})();
