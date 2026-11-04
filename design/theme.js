/* One palette for the graph, About, project Orbit and enlarged media. */
(() => {
  const system=matchMedia('(prefers-color-scheme: dark)'),modes=['system','light','dark'];
  let mode='system';try{const saved=localStorage.getItem('nio-design-theme');if(modes.includes(saved))mode=saved;}catch{}
  const button=document.createElement('button');button.id='themeToggle';button.type='button';
  function apply(){
    const theme=mode==='system'?(system.matches?'dark':'light'):mode;
    document.documentElement.dataset.theme=theme;document.documentElement.dataset.themeMode=mode;
    button.textContent='Theme: '+(mode==='system'?'Auto':mode[0].toUpperCase()+mode.slice(1));
    button.setAttribute('aria-label','Color theme: '+(mode==='system'?'follow device':mode)+'. Activate to change.');
    window.dispatchEvent(new CustomEvent('portfolio:theme',{detail:{theme,mode}}));
  }
  function position(){const top=document.querySelector('#bookingDialog[open]')||document.querySelector('#lightbox[open]')||document.querySelector('#projectDialog[open]')||document.body;if(button.parentElement!==top)top.append(button);}
  button.addEventListener('click',()=>{mode=modes[(modes.indexOf(mode)+1)%modes.length];try{localStorage.setItem('nio-design-theme',mode);}catch{}apply();});
  system.addEventListener('change',()=>{if(mode==='system')apply();});
  new MutationObserver(position).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  position();apply();
})();
