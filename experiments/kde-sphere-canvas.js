/* Portable kinetic-depth sphere renderer.
   Pass scroll progress (0..1) to draw(). */
export function createKDESphereRenderer(canvas,options={}){
  const context=canvas.getContext('2d');
  const palette=options.palette||['#252526','#585859','#8C8C8C','#BFBFBF','#F2F2F2'];
  const count=options.pointCount||1100;
  const points=[];
  const goldenAngle=Math.PI*(3-Math.sqrt(5));
  for(let index=0;index<count;index++){
    const y=1-(index/(count-1))*2;
    const radius=Math.sqrt(1-y*y),angle=goldenAngle*index;
    points.push({x:Math.cos(angle)*radius,y,z:Math.sin(angle)*radius});
  }
  let width=1,height=1;
  function resize(){
    const ratio=Math.min(window.devicePixelRatio||1,2);
    width=canvas.clientWidth||window.innerWidth;height=canvas.clientHeight||window.innerHeight;
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    context.setTransform(ratio,0,0,ratio,0,0);
  }
  function draw(progress){
    context.clearRect(0,0,width,height);
    const turn=progress*Math.PI*1.65,tilt=Math.sin(progress*Math.PI)*.34;
    const cosTurn=Math.cos(turn),sinTurn=Math.sin(turn),cosTilt=Math.cos(tilt),sinTilt=Math.sin(tilt);
    const radius=Math.min(width,height)*.39;
    const projected=points.map(point=>{
      const x1=point.x*cosTurn-point.z*sinTurn,z1=point.x*sinTurn+point.z*cosTurn;
      return {x:x1,y:point.y*cosTilt-z1*sinTilt,z:point.y*sinTilt+z1*cosTilt};
    }).sort((a,b)=>a.z-b.z);
    projected.forEach(point=>{
      const depth=(point.z+1)/2,perspective=.82+depth*.28,size=2+depth*8;
      context.globalAlpha=.28+depth*.72;
      context.fillStyle=palette[Math.min(palette.length-1,Math.floor(depth*palette.length))];
      context.fillRect(width/2+point.x*radius*perspective-size/2,height/2+point.y*radius*perspective-size/2,size,size);
    });
    context.globalAlpha=1;
  }
  resize();
  return {resize,draw};
}
