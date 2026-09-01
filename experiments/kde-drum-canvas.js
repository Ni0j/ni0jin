/* Portable ambiguous kinetic-depth cylinder renderer.
   Pass scroll progress (0..1) to draw(). */
export function createKDEDrumRenderer(canvas,options={}){
  const context=canvas.getContext('2d');
  const palette=options.palette||['#252526','#585859','#8C8C8C','#BFBFBF','#F2F2F2'];
  const columns=options.columns||64,rows=options.rows||28,points=[];
  for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
    points.push({angle:(column/columns)*Math.PI*2,y:row/(rows-1)*2-1});
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
    const turn=progress*Math.PI*2.15,radius=Math.min(width*.34,height*.46),halfHeight=height*.39;
    const projected=points.map(point=>{
      const angle=point.angle+turn;
      return {x:Math.sin(angle),y:point.y,z:Math.cos(angle)};
    }).sort((a,b)=>a.z-b.z);
    projected.forEach(point=>{
      const depth=(point.z+1)/2,size=2+depth*8;
      context.globalAlpha=.25+depth*.75;
      context.fillStyle=palette[Math.min(palette.length-1,Math.floor(depth*palette.length))];
      context.fillRect(width/2+point.x*radius-size/2,height/2+point.y*halfHeight-size/2,size,size);
    });
    context.globalAlpha=1;
  }
  resize();
  return {resize,draw};
}
