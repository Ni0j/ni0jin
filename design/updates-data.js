/* Author-confirmed public updates only. Empty recent/photo lists stay out of the UI. */
window.PUBLIC_UPDATES={
  experience:[
    {role:'Art Director & Visual Designer',organization:'Fashion brand game',dates:'Oct 2026–present',description:'Shaping the visual direction of a game for a fashion brand, from early development.'},
    {role:'Art Director & Visual Designer',organization:'Amplift.AI',dates:'Jun–Jul 2026',description:'Established the visual identity and motion language for a digital product, working directly with the founder from concept to execution.'}
  ],
  research:'Visual perception research at the NSSR Perception Lab.',
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
