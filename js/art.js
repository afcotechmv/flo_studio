"use strict";
/* Liladip — generated placeholder product art: a perfume bottle drawn in inline SVG and tinted by the product's hue.
   It is shown until real photographs are added in Admin. */
let artN=0;
const trunc=(s,n)=>{s=String(s||'');return s.length>n?s.slice(0,n-1)+'…':s};
function bottleKind(p){
  if(/oud|attar/i.test(p.category||''))return 4;
  let k=0;const key=String(p.id||p.name||'');
  for(let i=0;i<key.length;i++)k=(k*31+key.charCodeAt(i))>>>0;
  return k%4;
}
function art(p){
  const h=Number.isFinite(+p.hue)?+p.hue:30,id='a'+(++artN),kind=bottleKind(p);
  const brand=esc(trunc(String(p.brand||'').toUpperCase(),16));
  const label=(x,y,w,hh)=>`<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="3" fill="hsl(${h} 30% 7% / .55)" stroke="url(#${id}g)" stroke-width="1.2"/>`
    +(brand?`<text x="${x+w/2}" y="${y+hh/2-1}" text-anchor="middle" font-family="Marcellus,Georgia,serif" font-size="9" letter-spacing="2.2" fill="#ecd49b">${brand}</text><path d="M${x+w/2-14} ${y+hh/2+9}h28" stroke="#ecd49b" stroke-opacity=".55"/>`:'');
  const gold=`fill="url(#${id}g)"`;
  /* body uses "@" as a placeholder for its paint attributes; clip is the inner shape the liquid is cut to */
  const K=[
    {body:'<rect x="112" y="132" width="176" height="208" rx="20" @/>',clip:'<rect x="122" y="142" width="156" height="188" rx="14"/>',liq:176,
     cap:`<rect x="168" y="64" width="64" height="54" rx="5" ${gold}/><rect x="184" y="118" width="32" height="16" ${gold} opacity=".8"/>`,
     lab:label(152,226,96,62),hl:'<rect x="128" y="148" width="9" height="166" rx="4.5" fill="#fff" opacity=".2"/>'},
    {body:'<circle cx="200" cy="238" r="104" @/>',clip:'<circle cx="200" cy="238" r="94"/>',liq:198,
     cap:`<circle cx="200" cy="86" r="26" ${gold}/><rect x="186" y="108" width="28" height="36" ${gold} opacity=".8"/>`,
     lab:label(152,214,96,60),hl:'<path d="M122 206a84 84 0 0 1 30-52" stroke="#fff" stroke-opacity=".28" stroke-width="7" fill="none" stroke-linecap="round"/>'},
    {body:'<rect x="146" y="124" width="108" height="216" rx="10" @/>',clip:'<rect x="156" y="134" width="88" height="196" rx="6"/>',liq:166,
     cap:`<rect x="178" y="54" width="44" height="76" rx="4" ${gold}/><rect x="172" y="118" width="56" height="10" rx="2" ${gold}/>`,
     lab:label(160,214,80,66),hl:'<rect x="158" y="140" width="8" height="184" rx="4" fill="#fff" opacity=".2"/>'},
    {body:'<polygon points="104,340 296,340 272,156 128,156" stroke-linejoin="round" @/>',clip:'<polygon points="114,330 286,330 264,166 136,166"/>',liq:190,
     cap:`<rect x="170" y="84" width="60" height="50" rx="5" ${gold}/><rect x="184" y="130" width="32" height="28" ${gold} opacity=".8"/>`,
     lab:label(150,238,100,60),hl:'<polygon points="126,330 138,330 150,178 142,178" fill="#fff" opacity=".2"/>'},
    {body:'<path d="M200 176C142 226 126 296 166 330C186 346 214 346 234 330C274 296 258 226 200 176Z" @/>',clip:'<path d="M200 176C142 226 126 296 166 330C186 346 214 346 234 330C274 296 258 226 200 176Z"/>',liq:228,
     cap:`<rect x="191" y="112" width="18" height="68" fill="url(#${id}l)" stroke="hsl(${h} 45% 82% / .5)"/><rect x="186" y="116" width="28" height="8" ${gold}/><circle cx="200" cy="98" r="20" ${gold}/><circle cx="200" cy="70" r="8" ${gold}/>`,
     lab:'',hl:'<path d="M160 262c-4 16 0 34 12 48" stroke="#fff" stroke-opacity=".3" stroke-width="6" fill="none" stroke-linecap="round"/>'}
  ][kind];
  const glass=`fill="url(#${id}l)" stroke="hsl(${h} 45% 82% / .5)" stroke-width="1.6"`;
  return `<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(p.name)}" xmlns="http://www.w3.org/2000/svg">
  <defs>
   <radialGradient id="${id}b" cx="50%" cy="36%" r="80%"><stop offset="0" stop-color="hsl(${h} 38% 25%)"/><stop offset="1" stop-color="hsl(${h} 32% 6%)"/></radialGradient>
   <radialGradient id="${id}h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="hsl(${h} 75% 55%)" stop-opacity=".4"/><stop offset="1" stop-color="hsl(${h} 75% 55%)" stop-opacity="0"/></radialGradient>
   <radialGradient id="${id}s" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
   <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dca4"/><stop offset=".5" stop-color="#b8893a"/><stop offset="1" stop-color="#e6c985"/></linearGradient>
   <linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="hsl(${h} 30% 70%)" stop-opacity=".34"/><stop offset=".4" stop-color="hsl(${h} 30% 92%)" stop-opacity=".1"/><stop offset="1" stop-color="hsl(${h} 30% 60%)" stop-opacity=".26"/></linearGradient>
   <linearGradient id="${id}q" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h} 72% 60%)"/><stop offset="1" stop-color="hsl(${h} 78% 36%)"/></linearGradient>
   <clipPath id="${id}c">${K.clip}</clipPath>
  </defs>
  <rect class="abg" width="400" height="400" fill="url(#${id}b)"/>
  <ellipse cx="200" cy="250" rx="190" ry="150" fill="url(#${id}h)"/>
  <ellipse cx="200" cy="346" rx="124" ry="12" fill="url(#${id}s)"/>
  ${K.body.replace('@',glass)}
  <g clip-path="url(#${id}c)"><rect x="90" y="${K.liq}" width="220" height="260" fill="url(#${id}q)" opacity=".92"/><rect x="90" y="${K.liq}" width="220" height="3" fill="#fff" opacity=".35"/></g>
  ${K.body.replace('@','fill="none" stroke="hsl('+h+' 45% 82% / .55)" stroke-width="1.6"')}
  ${K.cap}${K.lab}${K.hl}
  <text class="acap" x="200" y="378" text-anchor="middle" font-family="Marcellus,Georgia,serif" font-size="16" fill="hsl(${h} 45% 80%)" opacity=".8">${esc(trunc(p.name,26))}</text></svg>`;
}
