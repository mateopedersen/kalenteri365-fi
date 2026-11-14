export function lunarLightStops(angle) {
  const a=angle*Math.PI/180;
  return Array.from({length:17},(_,i)=>{
    const x=-1+i/8,z=Math.sqrt(Math.max(0,1-x*x));
    const diffuse=Math.max(0,x*Math.sin(a)-z*Math.cos(a));
    return {offset:i/16,opacity:1-(.045+.955*Math.pow(diffuse,.55))};
  });
}

