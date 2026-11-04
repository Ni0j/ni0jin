/* Google Forms handles intake without a custom account or upload requirement. */
(() => {
  const url='https://docs.google.com/forms/d/e/1FAIpQLSdY8PMxUqcBDbohm7wkL42QkNV4dFlkvBCYtwabgIg9OB6log/viewform';
  const dialog=document.createElement('dialog');
  dialog.id='bookingDialog';dialog.setAttribute('aria-labelledby','bookingTitle');
  dialog.innerHTML=`<div class="dialog-top"><span>Nio Jin</span><button type="button" id="bookingClose">Back</button></div>
    <div class="booking-live"><aside class="text-node"><h1 id="bookingTitle">Book music visuals</h1><p>Share your track, references and what you need. I will reply by email to confirm scope and availability. Projects start at $50.</p><dl class="booking-prices" aria-label="Music visuals pricing"><div><dt>15-second loop</dt><dd>From $50</dd></div><div><dt>Release package</dt><dd>From $350</dd></div><div><dt>Live visuals</dt><dd>From $100<br><span>Per scene, not length</span></dd></div></dl><p class="booking-rate-note">Lyric/text add-ons and rush delivery are quoted per project.</p><p>No payment or account required.</p><a href="${url}" target="_blank" rel="noopener noreferrer">Open form in a new tab ↗</a></aside><div class="booking-embed text-node"><iframe title="Music visuals project request" src="${url}?embedded=true" loading="lazy">Loading form…</iframe></div></div>`;
  document.body.append(dialog);let trigger=null;
  function close(){dialog.close();trigger?.focus({preventScroll:true});}
  dialog.querySelector('#bookingClose').addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  window.openBooking=el=>{trigger=el;if(!dialog.open)dialog.showModal();dialog.scrollTop=0;};
})();
