const form = document.querySelector('#order-form');
const serviceNames = {express:'Express Website',custom:'Custom Website',redesign:'Website Redesign',updates:'Website Updates'};
const addonNames = {'additional-page':'Additional Page','image-editing':'Image Editing','visual-identity':'Visual Identity','advanced-interaction':'Advanced Interaction','custom-functionality':'Custom Functionality','additional-asset-creation':'Additional Asset Creation','domain-setup':'Domain Setup'};
const timelines = {express:'Estimated 4–7 days',custom:'Estimated 7–14 days',redesign:'Schedule after review',updates:'Schedule or cadence after review'};
const revisionTerms = {express:'One consolidated revision round. Further changes are quoted before work.',custom:'Three revision rounds within agreed scope.',redesign:'Revision terms in the written quote.',updates:'Correction/revision terms in the written quote.'};
const OrderDraft = {mainService:null,addons:[],contact:{name:'',email:''},business:{name:'',essentials:'',materials:'',extraNeeds:''},publicLinks:'',businessPriorities:'',deliveryPreference:'',policyConsent:false};
let currentTicket = null;
let muted = false;

function updateDraft(){
  const data = new FormData(form);
  OrderDraft.mainService = data.get('mainService') || null;
  OrderDraft.addons = data.getAll('addon');
  OrderDraft.contact = {name:String(data.get('clientName')||'').trim(),email:String(data.get('email')||'').trim()};
  OrderDraft.business = {name:String(data.get('businessName')||'').trim(),essentials:String(data.get('businessInfo')||'').trim(),materials:String(data.get('materials')||'').trim(),extraNeeds:String(data.get('extraNeeds')||'').trim()};
  OrderDraft.publicLinks = String(data.get('publicLinks')||'').trim();
  OrderDraft.businessPriorities = String(data.get('priorities')||'').trim();
  OrderDraft.deliveryPreference = String(data.get('delivery')||'');
  OrderDraft.policyConsent = data.has('policyConsent');
  renderTally();
  document.querySelector('#selection-recap').textContent=OrderDraft.mainService?`Selected: ${serviceNames[OrderDraft.mainService]}. Scope and pricing are reviewed before invoicing. You can change the service above.`:'No service selected yet. Choose one above before sending.';
}
function scrollToElement(element,block='center'){element.scrollIntoView({block,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
function renderTally(){
  const lines = document.querySelector('#tally-lines');
  lines.replaceChildren();
  if(!OrderDraft.mainService){const empty=document.createElement('p');empty.className='tally-empty';empty.innerHTML='Nothing marked yet.<br>Choose a main service to begin.';lines.append(empty)}
  else appendTallyLine(lines,serviceNames[OrderDraft.mainService]);
  for(const id of OrderDraft.addons) appendTallyLine(lines,addonNames[id]);
  const mobileService = OrderDraft.mainService ? serviceNames[OrderDraft.mainService] : 'No service selected';
  const mobileAddons = OrderDraft.addons.length ? ` · ${OrderDraft.addons.length} add-on${OrderDraft.addons.length===1?'':'s'}` : '';
  document.querySelector('#tally-mobile-summary').textContent = mobileService + mobileAddons;
  const tallyJump = document.querySelector('.tally-jump');
  tallyJump.href = OrderDraft.mainService ? '#intake' : '#main-services';
  tallyJump.textContent = OrderDraft.mainService ? 'Continue to order notes' : 'Choose a main service';
}
function appendTallyLine(parent,name){const row=document.createElement('div');row.className='tally-line';const label=document.createElement('span');label.textContent=name;row.append(label);parent.append(row)}
form.addEventListener('input',event=>{
  updateDraft();
  if(currentTicket){currentTicket=null;document.querySelector('#ticket-section').hidden=true;document.querySelector('#form-status').textContent='Your order changed. Prepare it again for an updated ticket.'}
  const name=event.target.name;
  if(['clientName','businessName','businessInfo'].includes(name)&&event.target.value.trim())setError(name,'');
  if(name==='email'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.target.value.trim()))setError(name,'');
});
form.addEventListener('change',event=>{
  updateDraft();
  if(event.target.name==='mainService'){
    document.querySelectorAll('.service-option').forEach(option=>{option.querySelector('details').open=option.dataset.service===OrderDraft.mainService});
    setError('mainService','');
  }
  if(event.target.name==='policyConsent') setError('policyConsent','');
  if(event.target.name==='delivery') setError('delivery','');
});

function setError(name,message){
  const target=document.getElementById(`${name}-error`);
  if(target) target.textContent=message;
  const field=form.elements[name];
  if(field && field instanceof HTMLElement){field.setAttribute('aria-invalid',String(Boolean(message)));if(message)field.setAttribute('aria-describedby',`${name}-error`);else field.removeAttribute('aria-describedby')}
  if(name==='delivery')document.querySelector('.delivery-choice').setAttribute('aria-invalid',String(Boolean(message)));
}
function validate(){
  let first=null;
  const required=[['clientName','Please enter your name.'],['email','Please enter a valid email address.'],['businessName','Please enter your business name.'],['businessInfo','Tell me the basics about your business.']];
  const service=form.querySelector('input[name="mainService"]:checked');
  setError('mainService',service?'':'Choose one main service.');
  if(!service)first=form.querySelector('input[name="mainService"]');
  for(const [name,message] of required){const input=form.elements[name];const valid=name==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()):Boolean(input.value.trim());setError(name,valid?'':message);if(!valid&&!first)first=input}
  const delivery=form.querySelector('input[name="delivery"]:checked');setError('delivery',delivery?'':'Choose a publishing preference.');if(!delivery&&!first)first=form.querySelector('input[name="delivery"]');
  setError('policyConsent',form.elements.policyConsent.checked?'':'Please read and accept the revision, scope, and payment terms.');if(!form.elements.policyConsent.checked&&!first)first=form.elements.policyConsent;
  if(first){document.querySelector('#form-status').textContent='Please complete the marked fields before preparing your order.';first.focus();scrollToElement(first);return false}
  document.querySelector('#form-status').textContent='';return true;
}

// The four-step guide stays separate from the real form controls; its result updates them.
const selector=document.querySelector('#selector');let step=0;
const stepEls=[...selector.querySelectorAll('.selector-step')];
function selected(name){return selector.querySelector(`input[name="${name}"]:checked`)?.value}
function showStep(){
  stepEls.forEach((el,i)=>el.hidden=i!==step);
  const need=selected('need');
  const newSite=need==='new';
  document.querySelector('#selector-progress').textContent=`Step ${step+1} of 4`;
  document.querySelector('#selector-back').hidden=step===0;
  document.querySelector('#selector-next').textContent=step===3?(need==='other'?'Save my note':'Use this recommendation'):'Next';
  document.querySelector('#selector-error').textContent='';
  selector.querySelector('.other-need').hidden=need!=='other';
  const note=selector.querySelector('.selector-skip-note');
  note.hidden=newSite;
  note.textContent=need==='other'?'I’ll read your note. You can choose the closest service on the menu afterward.':'For redesigns and updates, I’ll review your existing site before quoting.';
  selector.querySelector('.selector-step[data-step="2"] legend').textContent=newSite?'For a new site, how should we make decisions?':need==='other'?'Your note is ready':'I’ll review the current site';
  selector.querySelectorAll('input[name="direction"]').forEach(input=>input.parentElement.hidden=!newSite);
}
document.querySelector('#selector-open').addEventListener('click',()=>{step=0;selector.hidden=false;document.querySelector('#selector-result').textContent='';document.querySelector('#selector-open').setAttribute('aria-expanded','true');showStep();scrollToElement(selector)});
document.querySelector('#selector-close').addEventListener('click',()=>{selector.hidden=true;document.querySelector('#selector-open').setAttribute('aria-expanded','false');document.querySelector('#selector-open').focus()});
document.querySelector('#selector-back').addEventListener('click',()=>{step=Math.max(0,step-1);showStep()});
selector.addEventListener('change',event=>{
  if(event.target.name==='hasSite'){
    const hasSite=selected('hasSite')==='yes';
    selector.querySelectorAll('input[name="need"]').forEach(input=>{input.parentElement.hidden=!hasSite&&!['new','other'].includes(input.value);if(input.parentElement.hidden)input.checked=false});
    if(!hasSite)selector.querySelector('input[name="need"][value="new"]').checked=true;
  }
  if(['hasSite','need'].includes(event.target.name))showStep();
});
document.querySelector('#selector-next').addEventListener('click',()=>{
  const need=selected('need');
  const otherText=selector.querySelector('#other-need').value.trim();
  const checks=[selected('hasSite'),need&&(need!=='other'||otherText),need!=='new'||selected('direction'),true];
  if(!checks[step]){document.querySelector('#selector-error').textContent=step===1&&need==='other'?'Write a short note to continue.':'Choose an answer to continue.';return}
  if(step<3){step++;showStep();return}
  selector.querySelectorAll('input[name="selectorAddon"]:checked').forEach(item=>{const actual=form.querySelector(`input[name="addon"][value="${item.value}"]`);actual.checked=true});
  if(need==='other'){
    const extra=form.elements.extraNeeds;
    const note=`Other request: ${otherText}`;
    if(!extra.value.includes(note))extra.value=[extra.value.trim(),note].filter(Boolean).join('\n');
    const checked=form.querySelector('input[name="mainService"]:checked');if(checked)checked.checked=false;
    document.querySelectorAll('.service-option details').forEach(detail=>detail.open=false);
    updateDraft();
    selector.hidden=true;document.querySelector('#selector-open').setAttribute('aria-expanded','false');
    const result=document.querySelector('#selector-result');
    result.textContent='Your note is saved. Choose the closest website service below, or ';
    const inquiry=document.createElement('a');
    inquiry.href=`mailto:niojin.noi@gmail.com?subject=${encodeURIComponent('sēzn general inquiry')}&body=${encodeURIComponent(otherText)}`;
    inquiry.textContent='prepare a general inquiry email';
    result.append(inquiry,'.');
    document.querySelector('#form-status').textContent='Your note is saved. Choose a main service to prepare an order.';
    scrollToElement(document.querySelector('#main-services'),'start');
    return;
  }
  const recommendation=need==='redesign'?'redesign':need==='updates'?'updates':selected('direction')==='custom'?'custom':'express';
  const radio=form.querySelector(`input[name="mainService"][value="${recommendation}"]`);radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
  updateDraft();
  selector.hidden=true;document.querySelector('#selector-open').setAttribute('aria-expanded','false');
  document.querySelector('#selector-result').textContent=`Recommended: ${serviceNames[recommendation]}. You can change it below.`;
  document.querySelector('#form-status').textContent=`Recommended: ${serviceNames[recommendation]}. It is selected above; you can change it before sending.`;
  scrollToElement(document.querySelector('#intake'),'start');
});

function makeId(){const now=new Date();const date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('');const value=new Uint16Array(1);crypto.getRandomValues(value);return `SEZN-${date}-${String(value[0]%10000).padStart(4,'0')}`}
function ticketLines(ticket){const d=ticket.draft;return [
  ['Ticket',ticket.id],['Status','Order request / scope summary — not an invoice'],['Date',ticket.date],['Client',d.contact.name],['Email',d.contact.email],['Business',d.business.name],['Main service',serviceNames[d.mainService]],['Add-ons',d.addons.length?d.addons.map(id=>addonNames[id]).join(', ')+' — quoted after review':'None'],['Pricing','Quote after scope review'],['Estimated timing',timelines[d.mainService]],['Public links',d.publicLinks||'None supplied'],['Business essentials',d.business.essentials],['Anything you especially want people to know',d.businessPriorities||'Not specified'],['Material links or notes',d.business.materials||'None supplied'],['Publishing preference',{'project-url':'Nio-provided project URL','custom-domain':'Own custom domain','unsure':'Unsure'}[d.deliveryPreference]],['Additional needs',d.business.extraNeeds||'None'],['Revision terms',revisionTerms[d.mainService]],['Scope rule','A change to agreed concept, audience, structure, or functions is new scope, not a revision.'],['Publishing costs','A Nio-provided temporary/project URL is available for basic delivery. Custom domain, paid hosting, and third-party services are separate. Domain cost is actual price.'],['Payment','Nio reviews scope and emails a formal invoice. A 50% deposit paid within 24 hours reserves a slot. Balance is due before launch or final file delivery.'],['Delivery note','Request arrives only after you send the prepared email in your mail app.']];}
function addTicketField(parent,label,value){const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=value;parent.append(dt,dd)}
function renderTicket(ticket){const paper=document.querySelector('#ticket-paper');paper.replaceChildren();const h=document.createElement('h3');h.textContent='sēzn / order ticket';const meta=document.createElement('p');meta.className='ticket-meta';meta.textContent=`${ticket.id} · ${ticket.date} · Order request / scope summary — not an invoice`;paper.append(h,meta);const dl=document.createElement('dl');ticketLines(ticket).slice(3).forEach(([label,value])=>addTicketField(dl,label,value));paper.append(dl);document.querySelector('#ticket-section').hidden=false;document.querySelector('#email-order').href=makeMailto(ticket)}
function makeMailto(ticket){const text=ticketLines(ticket).map(([label,value])=>`${label}: ${value}`).join('\n');return `mailto:niojin.noi@gmail.com?subject=${encodeURIComponent(`sēzn order request ${ticket.id} — ${ticket.draft.business.name}`)}&body=${encodeURIComponent(text)}`}
function ringBell(){if(muted)return;try{const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return;const ctx=new AudioContextClass();const start=ctx.currentTime;[880,1320].forEach((frequency,i)=>{const oscillator=ctx.createOscillator();const gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(0.0001,start);gain.gain.exponentialRampToValueAtTime(i?0.045:0.075,start+.012);gain.gain.exponentialRampToValueAtTime(0.0001,start+.75);oscillator.connect(gain).connect(ctx.destination);oscillator.start(start);oscillator.stop(start+.8)});setTimeout(()=>ctx.close(),1000)}catch{}}
document.querySelector('.bell-button').addEventListener('click',ringBell);
document.querySelector('#mute-button').addEventListener('click',event=>{muted=!muted;event.currentTarget.setAttribute('aria-pressed',String(muted));event.currentTarget.textContent=muted?'Sound off · unmute':'Sound on · mute'});
form.addEventListener('submit',event=>{event.preventDefault();updateDraft();if(!validate())return;const draft=structuredClone(OrderDraft);currentTicket={id:makeId(),date:new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}),draft};renderTicket(currentTicket);document.querySelector('#form-status').textContent=`Ticket ${currentTicket.id} is ready. Send the prepared email to deliver your request.`;scrollToElement(document.querySelector('#ticket-section'),'start');window.location.href=makeMailto(currentTicket)});

// Local, client-side PDF: each page is rendered to canvas, then embedded as a JPEG page in a small PDF.
function wrapText(ctx,text,maxWidth){const words=String(text).split(/\s+/);const lines=[];let line='';for(const word of words){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width<=maxWidth){line=next;continue}if(line){lines.push(line);line=''}let part='';for(const char of word){if(ctx.measureText(part+char).width>maxWidth&&part){lines.push(part);part=char}else part+=char}line=part}if(line)lines.push(line);return lines}
function pdfPages(ticket){const scale=2;const width=612,height=792,pad=45;const pages=[];let canvas,ctx,y;
  function page(){canvas=document.createElement('canvas');canvas.width=width*scale;canvas.height=height*scale;ctx=canvas.getContext('2d');ctx.scale(scale,scale);ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.fillStyle='#343630';ctx.font='12px Georgia';ctx.fillText('sēzn / Order ticket',pad,34);ctx.textAlign='right';ctx.fillText(ticket.id,width-pad,34);ctx.textAlign='left';ctx.strokeStyle='#989b91';ctx.beginPath();ctx.moveTo(pad,46);ctx.lineTo(width-pad,46);ctx.stroke();y=70;if(pages.length){ctx.fillStyle='#343630';ctx.font='16px Georgia';ctx.fillText('Order ticket continued',pad,y);y+=28}}
  function finish(){ctx.font='10px Arial';ctx.fillStyle='#5e6259';ctx.fillText('Order request / scope summary — not an invoice',pad,height-27);ctx.textAlign='right';ctx.fillText(String(pages.length+1),width-pad,height-27);ctx.textAlign='left';pages.push(canvas.toDataURL('image/jpeg',.88).split(',')[1])}
  function section(label,value){const body=String(value);ctx.font='12px Arial';const rows=wrapText(ctx,body,width-pad*2);const block=22+rows.length*16;if(y+block>height-65){finish();page()}ctx.fillStyle='#5e6259';ctx.font='10px Arial';ctx.fillText(label,pad,y);y+=16;ctx.fillStyle='#343630';ctx.font='12px Arial';for(const row of rows){ctx.fillText(row,pad,y);y+=16}y+=7;ctx.strokeStyle='#989b91';ctx.beginPath();ctx.moveTo(pad,y-15);ctx.lineTo(width-pad,y-15);ctx.stroke()}
  page();for(const [label,value] of ticketLines(ticket))section(label,value);finish();return pages;
}
function buildPdf(images){const chunks=[];const offsets=[0];let length=0;const encoder=new TextEncoder();function put(value){const bytes=typeof value==='string'?encoder.encode(value):value;chunks.push(bytes);length+=bytes.length}function obj(id,body){offsets[id]=length;put(`${id} 0 obj\n`);put(body);put('\nendobj\n')}const count=images.length;const pageRefs=Array.from({length:count},(_,i)=>`${3+i*3} 0 R`).join(' ');put('%PDF-1.4\n');obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,`<< /Type /Pages /Kids [${pageRefs}] /Count ${count} >>`);images.forEach((base64,i)=>{const pageId=3+i*3,imageId=pageId+1,contentId=pageId+2;const binary=atob(base64);const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));obj(pageId,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im${i} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);offsets[imageId]=length;put(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width 1224 /Height 1584 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`);put(bytes);put('\nendstream\nendobj\n');const stream=`q 612 0 0 792 0 0 cm /Im${i} Do Q`;obj(contentId,`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)});const start=length;put(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);for(let i=1;i<offsets.length;i++)put(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);put(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);return new Blob(chunks,{type:'application/pdf'})}
document.querySelector('#download-pdf').addEventListener('click',()=>{if(!currentTicket)return;const blob=buildPdf(pdfPages(currentTicket));const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`${currentTicket.id}.pdf`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)});
updateDraft();showStep();
