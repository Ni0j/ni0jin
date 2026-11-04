/* A single orbit renderer for the portfolio and each project's media. */
(() => {
  const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const ease='cubic-bezier(.22,.76,.22,1)';
  function animate(el,frames,options={}){if(reduced.matches)return null;return el.animate(frames,{duration:650,easing:ease,...options});}
  window.createOrbit=function({stage,label,onActivate,onChange,automatic=true,media=false}){
    let entries=[],cards=[],phase=0,target=0,velocity=0,raf=0,last=0,running=false,visible=true,hover=-1;
    let px=0,py=0,mx=0,my=0,clock=0,lastInput=0,timer=0,selectedIndex=-1,suspended=false,auto=automatic,touchY=null,movedTouch=false;
    const horizon=document.createElement('canvas'),ground=horizon.getContext('2d');
    let lineColor='#80b8c2';
    let groundSize='',perspective=1100;
    if(horizon){horizon.className='orbit-horizon';horizon.setAttribute('aria-hidden','true');}
    const mod=(v,n)=>(v%n+n)%n,current=()=>entries[mod(Math.round(phase),entries.length)];
    stage.classList.add('orbit-stage');stage.tabIndex=0;stage.setAttribute('role','group');
    stage.setAttribute('aria-label',media?'Project media orbit. Scroll, swipe vertically, or use arrow keys. Select the front asset to examine.':'Orbit of artworks. Scroll, swipe vertically, or use arrow keys. Select the front work to examine.');
    function pauseVideos(){cards.forEach(c=>{if(c.video)c.img.pause();});}
    function particleBorder(el){
      const canvas=document.createElement('canvas');canvas.className='particle-border';canvas.setAttribute('aria-hidden','true');el.append(canvas);
      return {canvas,ctx:canvas.getContext('2d'),particles:Array.from({length:420},(_,i)=>({u:i/420,seed:mod(Math.sin(i*127.1+19)*43758.5453,1),x:0,y:0,vx:0,vy:0})),previous:null,ready:false};
    }
    function drawBorder(card,width,height,cx,cy,force,pointer,dt){
      const border=card.border,pad=48,dpr=Math.min(2,devicePixelRatio||1),cw=width+pad*2,ch=height+pad*2;
      // Keep a stable raster allocation while the physical surface changes size.
      if(!border.rw||Math.abs(cw/border.rw-1)>.15||Math.abs(ch/border.rh-1)>.15){
        border.rw=cw;border.rh=ch;border.canvas.width=Math.ceil(cw*dpr);border.canvas.height=Math.ceil(ch*dpr);
      }
      const ctx=border.ctx;ctx.setTransform(border.canvas.width/cw,0,0,border.canvas.height/ch,0,0);ctx.clearRect(0,0,cw,ch);
      const dx=border.previous?Math.max(-12,Math.min(12,cx-border.previous.x)):0,dy=border.previous?Math.max(-12,Math.min(12,cy-border.previous.y)):0;
      border.previous={x:cx,y:cy};
      const bw=width+4,bh=height+4,perimeter=2*(bw+bh),step=Math.min(.024,dt);
      ctx.fillStyle='rgba(10,10,14,.86)';ctx.beginPath();
      for(const p of border.particles){
        const distance=p.u*perimeter;
        let tx,ty;
        if(distance<bw){tx=distance-bw/2;ty=-bh/2;}
        else if(distance<bw+bh){tx=bw/2;ty=distance-bw-bh/2;}
        else if(distance<2*bw+bh){tx=bw/2-(distance-bw-bh);ty=bh/2;}
        else{tx=-bw/2;ty=bh/2-(distance-2*bw-bh);}
        if(!border.ready||reduced.matches){p.x=tx;p.y=ty;p.vx=p.vy=0;}
        else{
          // World-space inertia, then local spring recovery to the perimeter.
          const drag=.18+p.seed*.7;
          p.x-=dx*drag;p.y-=dy*drag;
          const energy=Math.min(5,Math.abs(velocity)*1.8)+force.kick;
          const nearX=pointer?tx-pointer.x:0,nearY=pointer?ty-pointer.y:0,nearDistance=Math.hypot(nearX,nearY)||1;
          const repel=pointer?Math.max(0,1-nearDistance/48)*9:0;
          const fx=force.x*2+energy*Math.sin(p.seed*71+clock*4)+nearX/nearDistance*repel,fy=force.y*2+energy*Math.cos(p.seed*113+clock*3)+nearY/nearDistance*repel;
          const spring=95+p.seed*100,damping=14+p.seed*5;
          p.vx+=((tx+fx-p.x)*spring-p.vx*damping)*step;p.vy+=((ty+fy-p.y)*spring-p.vy*damping)*step;
          p.x+=p.vx*step;p.y+=p.vy*step;
          p.x=tx+Math.max(-24,Math.min(24,p.x-tx));p.y=ty+Math.max(-24,Math.min(24,p.y-ty));
        }
        const radius=.55+.18*Math.sin(p.u*173)**2;
        ctx.moveTo(cw/2+p.x+radius,ch/2+p.y);ctx.arc(cw/2+p.x,ch/2+p.y,radius,0,Math.PI*2);
      }
      ctx.fill();border.ready=true;
    }
    // The shared anchor and its threads use the artworks' camera and clock.
    function drawHorizon(w,h){
      if(!ground)return;
      const dpr=Math.min(2,devicePixelRatio||1),key=`${w}:${h}:${dpr}`;
      if(key!==groundSize){groundSize=key;horizon.width=Math.round(w*dpr);horizon.height=Math.round(h*dpr);ground.setTransform(dpr,0,0,dpr,0,0);perspective=parseFloat(getComputedStyle(stage).perspective)||1100;}
      ground.clearRect(0,0,w,h);
      ground.lineWidth=.6;
    }
    function thread(w,h,x,y,z,width,height,depth){
      if(!ground)return;
      const ox=w*(.5+px*.06),oy=h*(.5+py*.16),scale=perspective/(perspective-z);
      const ax=w*.5+px*18,ay=h*.48+py*18;
      const cx=ox+(w*.5+x-ox)*scale,cy=oy+(h*.5+y-oy)*scale;
      const dx=cx-ax,dy=cy-ay,length=Math.hypot(dx,dy)||1;
      const reach=Math.min(width*.5*scale/Math.max(.001,Math.abs(dx)),height*.5*scale/Math.max(.001,Math.abs(dy)),.94);
      const ex=cx-dx*reach,ey=cy-dy*reach;
      const sag=reduced.matches?0:Math.sin(clock*.55+depth*2)*3+velocity*8;
      ground.strokeStyle=media?lineColor:`rgba(52,52,60,${.13+(depth+1)*.045})`;ground.globalAlpha=media?.62:1;
      ground.beginPath();ground.moveTo(ax,ay);
      ground.bezierCurveTo(ax+dx*.28-dy/length*sag,ay+dy*.28+dx/length*sag,ex-dx*.17,ey-dy*.17,ex,ey);ground.stroke();ground.globalAlpha=1;
    }
    function draw(dt){
      const w=stage.clientWidth,h=stage.clientHeight,n=entries.length,small=w<600;
      if(!w||!n)return;
      px+=(mx-px)*Math.min(1,dt*5);py+=(my-py)*Math.min(1,dt*5);
      // The horizon shifts the shared vanishing point, not each image independently.
      stage.style.perspectiveOrigin=`${50+px*6}% ${50+py*16}%`;
      drawHorizon(w,h);
      const rect=stage.getBoundingClientRect(),activeIndex=mod(Math.round(phase),n);
      cards.forEach((card,i)=>{
        const offset=media&&n>7?mod(i-phase+n/2,n)-n/2:i-phase;
        const inWindow=!media||n<=7||Math.abs(offset)<3.55;card.el.hidden=!inWindow;
        if(!inWindow){if(card.border)card.border.previous=null;if(card.video){card.img.pause();card.previewing=false;}return;}
        const a=offset*2*Math.PI/(media?Math.min(n,7):n),depth=Math.cos(a),s=Math.sin(a);
        const breath=reduced.matches?0:Math.sin(clock*.45+i*1.7)*3;
        const x=s*w*.34,y=depth*h*(media?.12:.19)+breath-(media?0:Math.min(28,h*.045)),z=depth*(small?100:230);
        const force=window.motionField?.sample(rect.left+w/2+x,rect.top+h/2+y)||{x:0,y:0,kick:0};
        card.lift+=(Number(hover===i||(card.mounted&&document.activeElement===card.el))-card.lift)*Math.min(1,dt*8);
        const ratio=card.ratio||1;
        const width=Math.min(w*(media?(small?.43:.30):(small?.30:.19)),h*(media?.50:.39)*ratio)*(.79+.21*depth);
        // Flatten each artwork into one surface and order it before it can paint.
        const liftDepth=card.mounted?28:55,liftHeight=card.mounted?7:12;
        const settle=card.mounted?card.lift:0;
        card.el.style.zIndex=String(Math.round((z+card.lift*liftDepth)*100)+30000);
        const mount=0,bottom=0;
        card.el.style.padding=`${mount}px ${mount}px ${bottom}px`;
        card.el.style.width=(width+mount*2)+'px';card.el.style.height=(width/ratio+mount+bottom)+'px';
        if(media)thread(w,h,x+px*(12+depth*9)+force.x*.5,y+py*18-card.lift*liftHeight+force.y*.5,z+card.lift*liftDepth,width,width/ratio,depth);
        if(!media){
          const weight=(depth+1)/2;
          card.el.style.boxShadow=`${3+weight*3-px*4}px ${5+weight*12-py*3}px ${10+weight*18}px ${-3-weight*6}px rgba(24,24,31,${.15+weight*.07})`;
          thread(w,h,x+px*(12+depth*9)+force.x*.5,y+py*18-card.lift*liftHeight+force.y*.5,z+card.lift*liftDepth,width,width/ratio,depth);
        }
        card.el.style.transform=`translate3d(${x+px*(12+depth*9)+force.x*.5}px,${y+py*18-card.lift*liftHeight+force.y*.5}px,${z+card.lift*liftDepth}px) rotateX(${(-py*9+Math.sin(clock*.23+i)*1.5+force.kick*.65)*(1-settle*.45)}deg) rotateY(${(-s*34+px*4)*(1-settle*.18)}deg) rotateZ(${(s*1.4-velocity*.8)*(1-settle*.7)}deg) translate(-50%,-50%)`;
        const projection=perspective/(perspective-z-card.lift*liftDepth);
        const pointer=window.motionField?.pointer;
        const localPointer=pointer?{x:(pointer.x-rect.left-w/2)/projection-x-px*(12+depth*9),y:(pointer.y-rect.top-h/2)/projection-y-py*18+card.lift*liftHeight}:null;
        if(!media)drawBorder(card,width,width/ratio,(x+px*(12+depth*9))*projection,(y+py*18-card.lift*liftHeight)*projection,force,localPointer,dt);
        card.el.classList.add('is-positioned');
        const active=i===activeIndex;
        card.el.setAttribute('aria-label',entries[i].label+(active?(media?' — examine':' — view work'):' — bring forward'));
        card.el.setAttribute('aria-current',String(active));
        if(card.video){
          const play=active&&running&&!suspended&&visible&&!document.hidden&&!reduced.matches;
          if(play&&!card.previewing){card.previewing=true;card.img.play().catch(()=>{});}else if(!play&&card.previewing){card.previewing=false;card.img.pause();}
        }
      });
      if(ground){const ax=w*.5+px*18,ay=h*.48+py*18;ground.strokeStyle=media?lineColor:'rgba(52,52,60,.26)';ground.beginPath();ground.arc(ax,ay,6,0,Math.PI*2);ground.stroke();ground.fillStyle=media?lineColor:'#35353c';ground.beginPath();ground.arc(ax,ay,1.8,0,Math.PI*2);ground.fill();}
      if(activeIndex!==selectedIndex){selectedIndex=activeIndex;label.textContent=current()?.label||'';
        if(!media){const context=$('studyContext');if(context)context.textContent=current()?.context||'';const count=$('studyCount');if(count)count.textContent=String(activeIndex+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');}
        animate(label,[{transform:'translateY(9px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:420});onChange?.(activeIndex,current());}
    }
    function tick(t){raf=0;if(!running||!visible||document.hidden||suspended)return;
      const dt=Math.min(.032,(t-last)/1000||.016);last=t;if(auto||media)clock+=dt;
      const reading=stage.closest('.entry-motion')?.matches(':focus-within')||stage.closest('.entry-motion')?.querySelector('.study-bottom:hover,.study-controls:hover');
      if(auto&&!reduced.matches&&hover<0&&!stage.matches(':focus-within')&&!reading&&t-lastInput>1200)target+=dt*.12;
      const idle=auto&&!reduced.matches&&hover<0?Math.sin(clock*.21)*.025:0;
      if(reduced.matches){phase=target;velocity=0;}else{velocity+=((target+idle-phase)*38-velocity*10)*dt;phase+=velocity*dt;}
      draw(dt);
      const moving=Math.abs(target-phase)>.001||Math.abs(velocity)>.001||Math.abs(mx-px)+Math.abs(my-py)>.001||cards.some((c,i)=>Math.abs(c.lift-Number(hover===i||(c.mounted&&document.activeElement===c.el)))>.001);
      if(((auto||media)&&!reduced.matches)||moving)raf=requestAnimationFrame(tick);
    }
    function wake(){if(running&&visible&&!document.hidden&&!suspended&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}}
    function move(delta){lastInput=performance.now();target=Math.round(target)+delta;hover=-1;wake();}
    function scroll(delta){if(!entries.length)return;lastInput=performance.now();const magnitude=Math.abs(delta),step=magnitude>=24?Math.max(.6,Math.min(magnitude/100,1)):magnitude/80;target+=Math.sign(delta)*step;clearTimeout(timer);timer=setTimeout(()=>{target=Math.round(target);wake();},180);wake();}
    function activate(){const card=cards[mod(Math.round(phase),cards.length)];if(card)onActivate?.(current(),card.img.getBoundingClientRect());}
    stage.addEventListener('wheel',e=>{if(!running||suspended||entries.length<2)return;const delta=(e.deltaY||e.deltaX)*(e.deltaMode===1?16:1);if(delta){e.preventDefault();scroll(delta);}},{passive:false});
    stage.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY;movedTouch=false;},{passive:true});
    stage.addEventListener('touchmove',e=>{if(touchY===null||!running||entries.length<2||e.touches.length!==1)return;const y=e.touches[0].clientY,delta=touchY-y;touchY=y;if(Math.abs(delta)>1){e.preventDefault();movedTouch=true;scroll(delta*2);}},{passive:false});
    stage.addEventListener('touchend',()=>{touchY=null;});
    stage.addEventListener('touchcancel',()=>{touchY=null;movedTouch=false;});
    stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=stage.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5;wake();});
    stage.addEventListener('focusout',()=>{lastInput=performance.now();wake();});
    stage.addEventListener('pointerleave',()=>{mx=my=0;hover=-1;wake();});
    stage.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow')&&e.target!==stage)return;if(e.key.startsWith('Arrow')){e.preventDefault();move(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1);}if(e.key==='Enter'){e.preventDefault();phase=target=Math.round(target);velocity=0;draw(.016);activate();}});
    new ResizeObserver(()=>{perspective=parseFloat(getComputedStyle(stage).perspective)||1100;draw(.016);wake();}).observe(stage);
    new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;pauseVideos();}},{threshold:.05}).observe(stage);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;pauseVideos();cards.forEach(c=>c.previewing=false);}else wake();});
    reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;mx=my=0;pauseVideos();wake();});
    return {
      start(items,index=0){
        const same=entries.map(e=>e.src).join('|')===items.map(e=>e.src).join('|');entries=items;
        if(!same){pauseVideos();stage.replaceChildren(...(horizon?[horizon]:[]));cards=items.map((entry,i)=>{
          const el=document.createElement('button'),video=entry.type==='video',img=document.createElement(video?'video':'img');el.className='orbit-art';el.classList.toggle('is-mounted',!media);if(entry.project)el.dataset.project=entry.project;
          const card={el,img,video,mounted:!media,ratio:entry.width&&entry.height?entry.width/entry.height:1,lift:0,previewing:false};
          if(video){img.muted=true;img.playsInline=true;img.loop=true;img.preload='metadata';if(entry.poster)img.poster=encodeURI(entry.poster);img.setAttribute('aria-hidden','true');img.addEventListener('loadedmetadata',()=>{card.ratio=img.videoWidth/img.videoHeight;img.currentTime=Math.min(.05,img.duration||0);draw(.016);});}
          else{img.alt='';img.draggable=false;img.onload=()=>{card.ratio=img.naturalWidth/img.naturalHeight;draw(.016);};}
          img.src=encodeURI(entry.src);el.append(img);
          if(media){
            el.classList.add('orbit-media-node');
            const header=document.createElement('span');header.className='media-node-header';header.textContent=String(i+1).padStart(2,'0')+' / '+entry.label;
            const port=document.createElement('span');port.className='media-node-port';el.append(header,port);
          }else card.border=particleBorder(el);
          el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=i;lastInput=performance.now();wake();}});el.addEventListener('pointerleave',()=>{hover=-1;wake();});
          el.addEventListener('click',()=>{if(movedTouch){movedTouch=false;return;}if(mod(Math.round(target),items.length)===i&&Math.abs(velocity)<.5)activate();else{target=phase+(mod(i-phase+items.length/2,items.length)-items.length/2);lastInput=performance.now();wake();}});
          stage.append(el);return card;
        });phase=target=index;}
        else {phase=target=index;}
        running=true;suspended=false;selectedIndex=-1;hover=-1;velocity=0;lastInput=performance.now();draw(.016);wake();
      },
      move,activate,current,
      setColor(color){lineColor=color||'#80b8c2';stage.style.setProperty('--node-color',lineColor);},
      setAuto(value){auto=value;target=Math.round(target);lastInput=performance.now();wake();},get automatic(){return auto;},
      suspend(value){suspended=value;if(value){cancelAnimationFrame(raf);raf=0;pauseVideos();cards.forEach(c=>c.previewing=false);}else{lastInput=performance.now();wake();}},
      setIndexMode(value){this.suspend(value);},
      stop(){running=false;cancelAnimationFrame(raf);raf=0;clearTimeout(timer);pauseVideos();cards.forEach(c=>c.previewing=false);}
    };
  };
  const stage=document.createElement('div');stage.id='orbitStage';$('motionCanvas').hidden=true;$('motionCanvas').after(stage);
  let carry=null,origin=null,transitionId=0,transitions=[],portal=null,concealed=null;
  function clearTransition(){transitionId++;transitions.forEach(a=>a?.cancel());transitions=[];portal?.remove();portal=null;if(concealed)concealed.style.visibility='';concealed=null;}
  function frontSurface(){return [...document.querySelectorAll('#projectOrbitStage .orbit-art')].find(el=>el.getAttribute('aria-label')?.endsWith('— examine'))||$('frame').querySelector('.single-media-node,img,video');}
  function remember(entry,rect){const el=document.querySelector('#orbitStage .orbit-art[aria-current="true"]');const img=el?.querySelector('img');return {el,rect:el?.getBoundingClientRect()||rect,src:img?.currentSrc||img?.src||entry?.preview||entry?.src,label:el?.querySelector('.node-header')?.textContent||entry?.label,color:window.projectNodeColor?.(entry?.project)||'#80b8c2'};}
  function makePortal(info,target){
    if(!info?.src||!target?.width||!info.rect?.width)return null;
    const node=document.createElement('div');node.className='node-portal';node.setAttribute('aria-hidden','true');node.style.setProperty('--node-color',info.color);
    const header=document.createElement('span');header.className='node-portal-label';header.textContent=info.label;
    const img=document.createElement('img');img.src=info.src;img.alt='';node.append(header,img);$('projectDialog').append(node);
    Object.assign(node.style,{left:target.left+'px',top:target.top+'px',width:target.width+'px',height:target.height+'px'});portal=node;return node;
  }
  const homeFactory=window.createNodeNetwork&&new URLSearchParams(location.search).get('home')!=='orbit'?window.createNodeNetwork:window.createOrbit;
  const home=homeFactory({stage,label:$('studyLabel'),onActivate:(entry,rect)=>{carry=remember(entry,rect);$('examineStudy').click();}});
  $('studyPrevious').addEventListener('click',()=>home.move(-1));$('studyNext').addEventListener('click',()=>home.move(1));
  window.artMotion=Object.assign(home,{
    async enter(){
      clearTransition();const id=transitionId,dialog=$('projectDialog'),surface=frontSurface();origin=carry;carry=null;
      if(reduced.matches)return;
      transitions.push(animate($('details'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{delay:220,duration:430,fill:'backwards'}));
      const end=surface?.getBoundingClientRect(),node=makePortal(origin,end);
      transitions.push(animate(dialog,[{opacity:0},{opacity:1}],{duration:180}));
      if(node){
        concealed=surface;surface.style.visibility='hidden';const r=origin.rect;
        const flight=animate(node,[{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',opacity:1},{left:end.left+'px',top:end.top+'px',width:end.width+'px',height:end.height+'px',opacity:1}],{duration:650});transitions.push(flight);
        document.querySelectorAll('#projectOrbitStage .orbit-art').forEach((el,i)=>{if(el!==surface)transitions.push(animate(el,[{opacity:0},{opacity:1}],{delay:180+i*28,duration:440}));});
        transitions.push(animate($('projectOrbitStage').querySelector('canvas')||surface,[{opacity:0},{opacity:1}],{delay:200,duration:500}));
        await flight?.finished.catch(()=>{});if(id!==transitionId)return;surface.style.visibility='';concealed=null;node.remove();portal=null;
      }else transitions.push(animate($('viewer'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:500}));
    },
    async leave(){
      clearTransition();if(reduced.matches)return;
      const surface=frontSurface(),start=surface?.getBoundingClientRect(),end=origin?.el?.isConnected?origin.el.getBoundingClientRect():null;
      const node=start?.bottom>60&&start.top<innerHeight?makePortal(origin,start):null;
      if(node&&end?.width){concealed=surface;surface.style.visibility='hidden';
        transitions.push(animate($('focusContent'),[{opacity:1},{opacity:0}],{duration:220,fill:'forwards'}));
        const flight=animate(node,[{left:start.left+'px',top:start.top+'px',width:start.width+'px',height:start.height+'px',opacity:1},{left:end.left+'px',top:end.top+'px',width:end.width+'px',height:end.height+'px',opacity:0}],{duration:500});transitions.push(flight);await flight?.finished.catch(()=>{});
      }else{const fade=animate($('projectDialog'),[{opacity:1},{opacity:0}],{duration:220});transitions.push(fade);await fade?.finished.catch(()=>{});}
      clearTransition();
    },media(){}
  });
})();
