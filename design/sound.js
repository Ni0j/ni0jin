/* Small, original interaction cues. No ambient, hover or automatic Orbit audio. */
(() => {
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return;
  let context=null,enabled=true,lastCue=0;
  try{enabled=localStorage.getItem('portfolio-sound')!=='off';}catch{}
  function cue(kind){
    if(!enabled||document.hidden||[...document.querySelectorAll('video')].some(v=>!v.paused&&!v.muted))return;
    const now=performance.now();if(now-lastCue<65)return;lastCue=now;
    try{
      context ||= new Audio();
      if(context.state==='suspended')context.resume().catch(()=>{});
      const t=context.currentTime,osc=context.createOscillator(),gain=context.createGain();
      const frequency=kind==='back'?330:kind==='step'?520:kind==='open'?660:440;
      osc.type='sine';osc.frequency.setValueAtTime(frequency,t);osc.frequency.exponentialRampToValueAtTime(frequency*.64,t+.055);
      gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.025,t+.004);gain.gain.exponentialRampToValueAtTime(.0001,t+.065);
      osc.connect(gain);gain.connect(context.destination);osc.start(t);osc.stop(t+.07);
      osc.onended=()=>{osc.disconnect();gain.disconnect();};
    }catch{}
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('button,summary');if(!button||button.disabled)return;
    const id=button.id;
    cue(/back|close|exit/i.test(id)?'back':/next|previous/i.test(id)?'step':button.matches('.orbit-art,.project-row button')||/examine|index/i.test(id+' '+button.className)?'open':'tap');
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&context?.state==='running')context.suspend().catch(()=>{});});
})();
