/* Author-confirmed public updates only. Empty recent/photo lists stay out of the UI. */
window.PUBLIC_UPDATES={
  experience:[
    {role:'Art Director & Visual Designer',organization:'Game Studio (Stealth)',dates:'Sep 2026–present',description:'Leading art direction for a game developed for a fashion brand, shaping its visual language across research, world-building, characters, environments and UI/UX.'},
    {role:'Independent Builder & Designer',organization:'Self-employed',dates:'Feb 2026–present',description:'Designing payment and operational workflows for a restaurant client, auditing websites for design and usability, and building web tools around specific user needs. Producing visuals for live performances and digital campaigns.'},
    {role:'Contract Designer',organization:'Amplift.AI',dates:'Jun–Jul 2026',description:'Turned an initial concept into a visual identity for a digital product. Delivered the logo, motion variations for different product functions and states, and promotional animations.'},
    {role:'Code Tutor',organization:'Parsons School of Design · The New School',dates:'Feb 2025–May 2026',description:'Guided students through interactive web and creative coding projects, from concept and visual structure to implementation and debugging with HTML, CSS and JavaScript.'}
  ],
  research:'Visual perception research and experiment design at the NSSR Perception Lab, alongside independent research (Jul 2026–present).',
  education:'BFA in Communication Design · Parsons School of Design, 2021–2026. Graduated with Honors.',
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
