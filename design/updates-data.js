/* Author-confirmed public updates only. Empty recent/photo lists stay out of the UI. */
window.PUBLIC_UPDATES={
  experience:[
    {role:'Art Director & Visual Designer',organization:'Game studio',dates:'Sep 2026–present',description:'Currently developing a game for a fashion brand.'},
    {role:'Independent Builder & Designer · Freelance',organization:'Self-employed',dates:'Aug 2026–present',description:'Researching and building software products from early concepts to working prototypes, alongside web design and real-time visuals.'},
    {role:'Contract Brand & Visual Designer',organization:'Amplift.AI',dates:'Jun–Jul 2026',description:'Developed the visual identity and motion language for a digital product, working directly with the founder from concept through execution.'},
    {role:'Code Tutor',organization:'Parsons School of Design · The New School',dates:'Feb 2025–May 2026',description:'Guided students through interactive web and creative coding projects, connecting visual decisions with HTML, CSS and JavaScript.'}
  ],
  research:'At the NSSR Perception Lab, I collaborate with professors and PhD researchers on visual perception research and experimental development (Jul 2026–present).',
  education:'BFA in Communication Design · Parsons School of Design, 2022–2026. Graduated with Honors.',
  tools:'I move between visual design, web development, real-time graphics and sound. My working tools include TouchDesigner, JavaScript, motion design software and audio environments.',
  events:[{
    id:'saga-mini-gems-5',title:'SAGA · 5th Mini Gems',project:'photoetching',personalUrl:'../?work=photoetching',
    start:'2026-12-05',end:'2027-01-09',dates:'5 Dec 2026 — 9 Jan 2027',location:'New York',
    url:'https://www.instagram.com/p/DfFSvZSDSj4/',
    source:'https://sagaprints.com/5th-mini-gems-open-call/',images:[]
  }],
  making:[]
};
window.publicEventState=function(event){
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  const today=`${parts.year}-${parts.month}-${parts.day}`;
  return today<event.start?'next':today<=event.end?'on show':'recent';
};
