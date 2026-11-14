// Geometry of the illuminated hemisphere, viewed with lunar north at the top.
// The photograph supplies surface detail; it is not a dated forecast photograph.
export function illuminatedPath(angle){
 const waxing=angle<180,c=Math.cos(angle*Math.PI/180),points=[];
 for(let i=0;i<=64;i++){const y=-1+i/32,x=(waxing?c:-c)*Math.sqrt(Math.max(0,1-y*y));points.push([50+48*x,50+48*y]);}
 for(let i=64;i>=0;i--){const y=-1+i/32,x=(waxing?1:-1)*Math.sqrt(Math.max(0,1-y*y));points.push([50+48*x,50+48*y]);}
 return points.map((p,i)=>(i?'L':'M')+p.map(v=>v.toFixed(3)).join(' ')).join('')+'Z';
}
export function moonSVG(angle,id='moon',label='Kuun valaistus'){
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${label}"><defs><clipPath id="${id}"><path d="${illuminatedPath(angle)}"/></clipPath></defs><circle cx="50" cy="50" r="48" fill="#17252f"/><image href="/assets/photos/moon-surface.jpg" x="2" y="2" width="96" height="96" clip-path="url(#${id})"/><circle cx="50" cy="50" r="48" fill="none" stroke="#8e9fa8" stroke-opacity=".35" stroke-width=".5"/></svg>`;
}
