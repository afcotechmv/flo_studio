"use strict";
/* Liladip — storefront views: home, collection, product, bag, checkout, order confirmation. */
/* ============ VIEWS ============ */
const stBadge=p=>p.stock<=0?'<span class="st bad">Sold out</span>':p.stock<=CFG.lowStock?`<span class="st warn">Only ${p.stock} left</span>`:'<span class="st ok">In stock</span>';
const plural=(n,w)=>n+' '+w+(n===1?'':'s');
/* accent-insensitive search: "vetiver" finds Vétiver */
const fold=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const countBy=fn=>S.products.filter(fn).length;
/* Fragrance notes (rows labelled Top / Heart / Base) are shown as a pyramid; every other detail row is a plain fact. */
const noteRx=/^(top|heart|base)\b/i;
const splitSpecs=p=>{const s=Array.isArray(p.specs)?p.specs:[];return{notes:showScents()?s.filter(r=>noteRx.test(r[0])):[],rest:s.filter(r=>!noteRx.test(r[0]))}};   // notes stay hidden unless scent information is on
const shownSpecs=p=>{const sp=splitSpecs(p);return[...sp.notes,...sp.rest]};
const kindOf=p=>[p.audience,showScents()?p.category:''].filter(Boolean).join(', ');
const stockFlag=p=>p.stock<=0?'Sold out':p.stock<=CFG.lowStock?`Only ${p.stock} left`:'';

function card(p){const f=stockFlag(p);return `<article class="card ${p.stock<=0?'gone':''}"><a class="thumb" href="#/product/${p.id}">${pic(p)}${f?`<span class="flag">${f}</span>`:''}</a><div class="cbody">
  <span class="by">${esc(p.brand||p.category)}</span><a class="cname" href="#/product/${p.id}">${esc(p.name)}</a>
  <span class="kind">${esc(kindOf(p))}</span><span class="price">${fmt(p.price)}</span>
  <button class="add" data-act="add" data-id="${p.id}" ${p.stock<=0?'disabled':''}>${p.stock<=0?'Sold out':'Add to bag'}</button></div></article>`}
function filtered(){
  const f=S.filter;let a=S.products.filter(p=>(!showScents()||f.cat==='All'||p.category===f.cat)&&(f.aud==='All'||p.audience===f.aud)&&(f.brand==='All'||p.brand===f.brand)&&(!f.inStock||p.stock>0)&&(!f.q||fold(p.name+' '+p.brand+' '+p.audience+' '+(showScents()?p.category:'')+' '+p.description+' '+shownSpecs(p).map(s=>s[1]).join(' ')).includes(fold(f.q))));
  const s={price_asc:(x,y)=>x.price-y.price,price_desc:(x,y)=>y.price-x.price,name:(x,y)=>x.name.localeCompare(y.name),featured:(x,y)=>(!!y.featured)-(!!x.featured)}[f.sort];
  return a.sort(s);
}
function gridHtml(){const a=filtered();return a.length?a.map(card).join(''):'<div class="empty" style="grid-column:1/-1">No fragrances match these filters. <button class="link" data-act="clear">Clear filters</button></div>'}

/* Collection page: filter sidebar on the left, tall product cards on the right. */
function facet(title,items,act,cur){return `<div class="facet"><h3>${title}</h3><ul>${items.map(([v,l,n])=>`<li><button class="fi ${cur===v?'on':''}" data-act="${act}" data-v="${esc(v)}"><span>${esc(l)}</span><i>${n}</i></button></li>`).join('')}</ul></div>`}
function facetsHtml(){const f=S.filter,all=S.products.length;
  return facet('Category',[['All','All categories',all],...audShown().map(a=>[a,a,countBy(p=>p.audience===a)])],'aud',f.aud)
   +(showScents()?facet('Scent',[['All','All scents',all],...cats().slice(1).map(c=>[c,c,countBy(p=>p.category===c)])],'cat',f.cat):'')
   +facet('Brand',[['All','All brands',all],...brands().map(b=>[b,b,countBy(p=>p.brand===b)])],'brand',f.brand)}
const isFiltered=()=>{const f=S.filter;return (showScents()&&f.cat!=='All')||f.aud!=='All'||f.brand!=='All'||f.q||f.inStock};
const activeHtml=()=>isFiltered()?'<button class="link" data-act="clear">Clear all filters</button>':'';
function catalogue(){
  const f=S.filter;
  return `<div class="shop"><aside class="side" id="side"><div class="sq"><input type="search" id="q" placeholder="Name, note or brand" value="${esc(f.q)}" data-in="q" aria-label="Search the collection"></div>
  <div id="facets">${facetsHtml()}</div>
  <label class="chk"><input type="checkbox" data-in="stock" ${f.inStock?'checked':''}> Only what is in stock</label></aside>
  <section class="results"><div class="rhead"><h1 class="rt">The collection</h1><span class="mono" id="count">${plural(filtered().length,'fragrance')}</span><span class="sp"></span>
  <button class="btn ghost sm fbtn" data-act="ftoggle">Filters</button>
  <select data-in="sort" aria-label="Sort"><option value="featured">Featured first</option><option value="price_asc">Price, low to high</option><option value="price_desc">Price, high to low</option><option value="name">Name</option></select></div>
  <div id="active" class="fclear">${activeHtml()}</div>
  <div class="grid" id="grid">${gridHtml()}</div></section></div>`;
}
function refreshGrid(){const g=$('#grid');if(!g)return;g.innerHTML=gridHtml();$('#count').textContent=plural(filtered().length,'fragrance');$('#facets').innerHTML=facetsHtml();$('#active').innerHTML=activeHtml()}

/* Hero: a dark stage tinted by each fragrance, an arched window with the bottle, the notes pyramid on one side and the details on the other. */
function heroSlide(h,i,n){
  const hue=Number.isFinite(+h.hue)?+h.hue:30,sp=splitSpecs(h),list=(sp.notes.length?sp.notes:sp.rest).slice(0,3);
  const gs=Math.max(6,Math.min(14,184/Math.max(8,h.name.length)));
  return `<article class="slide ${i===0?'active':''}" style="--h:${hue};--gs:${gs.toFixed(1)}" role="group" aria-roledescription="slide" aria-label="${i+1} of ${n}">
   <div class="hname" aria-hidden="true">${esc(h.name)}</div>
   <div class="frame">
    <ul class="tiers">${list.map(s=>`<li><span>${esc(s[0])}</span>${esc(s[1])}</li>`).join('')}</ul>
    <div class="arch"><div class="archin">${pic(h,{eager:true})}</div></div>
    <div class="copy"><span class="by">${esc(h.brand||h.category)}</span><h1>${esc(h.name)}</h1><p>${esc(h.description)}</p>
     <div class="row"><span class="price">${fmt(h.price)}</span><button class="btn" data-act="add" data-id="${h.id}">Add to bag</button></div>
     <a class="more" href="#/product/${h.id}">Discover this fragrance</a></div>
   </div></article>`;
}
const sparks=()=>`<div class="sparks" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i style="--x:${(i*53+11)%96}%;--y:${(i*37+7)%80+6}%;--d:${(i%6)*.8}s;--s:${6+(i*7)%9}px"></i>`).join('')}</div>`;
function viewHome(){
  let hs=S.products.filter(p=>p.featured&&p.stock>0).slice(0,CFG.heroMax||5);
  if(!hs.length){const f=S.products.find(p=>p.stock>0);if(f)hs=[f]}
  const n=hs.length;
  const ui=n>1?`<div class="htabs" role="group" aria-label="Choose a fragrance">${hs.map((h,i)=>`<button class="hdot ${i===0?'on':''}" data-hero="${i}">${esc(h.name)}</button>`).join('')}</div><div class="hbar"><i id="hbar"></i></div>`:'';
  const hero=n?`<section class="hero" id="hero" role="region" aria-roledescription="carousel" aria-label="Featured fragrances">${sparks()}<div class="slides">${hs.map((h,i)=>heroSlide(h,i,n)).join('')}</div>${ui}</section>`:'';

  const rep=a=>S.products.find(p=>p.audience===a&&p.stock>0)||S.products.find(p=>p.audience===a);
  const portals=audShown().map(a=>{const p=rep(a);return p?`<button class="portal" data-act="aud" data-v="${a}" data-go="1"><span class="parch">${pic(p)}</span><span class="plabel"><b>${esc(a)}</b><span>${plural(countBy(x=>x.audience===a),'fragrance')}</span></span></button>`:''}).join('');
  const rail=[...S.products].sort((x,y)=>(!!y.featured)-(!!x.featured)).slice(0,8).map(card).join('');
  const sc=showScents()&&cats().length>1?`<section class="sect"><div class="sech"><h2>Browse by scent</h2></div><div class="fams">${cats().slice(1).map(c=>`<button class="fam" data-act="cat" data-v="${esc(c)}" data-go="1"><span>${esc(c)}</span><i>${plural(countBy(p=>p.category===c),'fragrance')}</i></button>`).join('')}</div></section>`:'';
  const bl=brands().map(b=>`<button class="fam" data-act="brand" data-v="${esc(b)}" data-go="1"><span>${esc(b)}</span><i>${plural(countBy(p=>p.brand===b),'fragrance')}</i></button>`).join('');
  return hero+`
  <section class="sect"><div class="sech"><h2>Who are you shopping for?</h2></div><div class="portals">${portals}</div></section>
  <section class="sect"><div class="sech"><h2>Signature fragrances</h2><a class="more" href="#/shop">See the whole collection</a></div><div class="rail">${rail}</div></section>
  <section class="sect"><div class="sech"><h2>Browse by brands</h2></div><div class="fams">${bl}</div></section>${sc}
  <section class="bleed"><div class="wrap"><div class="promise">
   <div><h3>Delivery in Malé</h3><p>Free on orders above MVR ${CFG.delivery.maleFreeAbove}. Below that, MVR ${CFG.delivery.maleFee}.</p></div>
   <div><h3>Delivery to the islands</h3><p>We arrange it with you and hand your order to the island supply boat.</p></div>
   <div><h3>Pay when it arrives</h3><p>Cash on delivery or pickup, or a bank transfer after you order.</p></div>
  </div></div></section>`;
}
function viewShop(){return catalogue()}

/* Product page image pane: all images, cycled with arrows, thumbnails, swipe or keyboard (see gallery.js). */
function gallery(p){
  const imgs=Array.isArray(p.images)?p.images.filter(Boolean):[];
  if(!imgs.length)return `<div class="pleft"><div class="pimg">${art(p)}</div></div>`;
  const n=imgs.length;
  const slides=imgs.map((u,i)=>`<div class="gs ${i===0?'active':''}"><img src="${esc(u)}" alt="${esc(p.name)} (${i+1} of ${n})" ${i===0?'fetchpriority="high"':'loading="lazy"'} decoding="async" draggable="false"></div>`).join('');
  const ui=n>1?`<button class="gbtn prev" data-g="prev" aria-label="Previous image">‹</button><button class="gbtn next" data-g="next" aria-label="Next image">›</button><div class="gcount mono"><b id="gc">1</b> of ${n}</div>`:'';
  const thumbs=n>1?`<div class="gthumbs">${imgs.map((u,i)=>`<button class="gt ${i===0?'on':''}" data-g="${i}" aria-label="Show image ${i+1}"><img src="${esc(u)}" alt="" loading="lazy" decoding="async" draggable="false"></button>`).join('')}</div>`:'';
  return `<div class="pleft"><div class="pimg gallery" id="gallery" role="region" aria-roledescription="carousel" aria-label="Product images"><div class="gslides">${slides}</div>${ui}</div>${thumbs}</div>`;
}
function viewProduct(id){
  const p=getP(id);if(!p)return '<div class="empty" style="margin-top:30px">Product not found. <a href="#/shop" style="color:var(--accent)">Back to the collection</a></div>';
  const q=Math.min(S.pdQty,Math.max(1,p.stock));S.pdQty=q;
  const rel=S.products.filter(x=>x.id!==p.id&&((p.brand&&x.brand===p.brand)||(showScents()&&p.category&&x.category===p.category)||x.audience===p.audience)).sort((a,b)=>(b.brand===p.brand)-(a.brand===p.brand)).slice(0,4);
  const sp=splitSpecs(p);
  return `<div class="crumb"><a href="#/">Home</a> / <a href="#/shop">Collection</a> / ${esc(p.audience||'')}</div>
  <div class="pgrid">${gallery(p)}<div class="pinfo">
  <span class="by">${esc(p.brand||p.category)}</span><h1>${esc(p.name)}</h1>
  <div class="kind">${esc(kindOf(p))}</div>
  <div class="row pr"><span class="price">${fmt(p.price)}</span>${stBadge(p)}</div>
  <p class="desc">${esc(p.description)}</p>
  ${sp.notes.length?`<div class="pyramid" aria-label="Fragrance notes">${sp.notes.map(s=>`<div class="tier"><span>${esc(s[0])}</span><b>${esc(s[1])}</b></div>`).join('')}</div>`:''}
  <div class="row buy"><div class="qty"><button data-act="pdq" data-d="-1" aria-label="Fewer">−</button><span>${q}</span><button data-act="pdq" data-d="1" aria-label="More">+</button></div>
  <button class="btn" data-act="add" data-id="${p.id}" data-q="pd" ${p.stock<=0?'disabled':''}>${p.stock<=0?'Sold out':'Add to bag'}</button></div>
  <dl class="facts">${sp.rest.map(s=>`<div><dt>${esc(s[0])}</dt><dd>${esc(s[1])}</dd></div>`).join('')}<div><dt>Reference</dt><dd>${esc(p.sku||String(p.id).slice(0,8)).toUpperCase()}</dd></div></dl></div></div>
  ${rel.length?`<section class="sect"><div class="sech"><h2>You may also like</h2></div><div class="grid">${rel.map(card).join('')}</div></section>`:''}`;
}

function lineHtml(l){return `<div class="line"><a class="lt" href="#/product/${l.p.id}">${pic(l.p)}</a>
  <div><a href="#/product/${l.p.id}" style="font-weight:500">${esc(l.p.name)}</a><div class="mono">${fmt(l.p.price)}</div>
  <div class="row" style="margin-top:8px"><div class="qty"><button data-act="qty" data-id="${l.p.id}" data-d="-1">−</button><span>${l.qty}</span><button data-act="qty" data-id="${l.p.id}" data-d="1">+</button></div>
  <button class="link" data-act="rm" data-id="${l.p.id}">Remove</button></div></div><div class="price">${fmt(l.p.price*l.qty)}</div></div>`}
function sumHtml(co){const t=totals(co);
  const dl=!t.sub?'—':!co?'Calculated at checkout':S.area==='island'?'To be arranged':(t.sh?fmt(t.sh):'Free');
  return `<div class="sum"><div><span>Subtotal</span><span>${fmt(t.sub)}</span></div>
  <div><span>Delivery</span><span>${dl}</span></div>${CFG.taxRate?`<div><span>Tax</span><span>${fmt(t.tax)}</span></div>`:''}
  <div class="tot"><span>Total</span><span>${fmt(t.total)}</span></div></div>`}
function viewCart(){
  const L=cartLines();
  if(!L.length)return '<h2 class="sec">Shopping bag</h2><div class="empty">Your bag is empty. <a href="#/shop" style="color:var(--accent)">Browse the collection</a></div>';
  return `<h2 class="sec">Shopping bag <span class="mono">${L.reduce((s,l)=>s+l.qty,0)} items</span></h2>
  <div class="cols"><div class="panel">${L.map(lineHtml).join('')}</div>
  <div class="panel"><h3 style="margin-top:0">Order summary</h3>${sumHtml()}<p class="mono">Delivery is calculated at checkout.</p><a class="btn block" href="#/checkout">Checkout</a></div></div>`;
}

function fld(name,label,val='',opts={}){return `<div class="field" data-f="${name}"><label>${label}</label><input name="${name}" type="${opts.type||'text'}" value="${esc(val)}" autocomplete="${opts.ac||'on'}" placeholder="${esc(opts.ph||'')}"><div class="em">${opts.err||'Required'}</div></div>`}
function viewCheckout(){
  const L=cartLines();
  if(!L.length)return '<h2 class="sec">Checkout</h2><div class="empty">Your bag is empty. <a href="#/shop" style="color:var(--accent)">Browse the collection</a></div>';
  const u=S.user||{},nm=(u.name||'').split(' ');
  return `<h2 class="sec">Checkout <span class="mono">${S.user?'Signed in as '+esc(u.email):'Guest checkout'}</span></h2>
  <div class="cols"><form id="co" class="panel" novalidate>
  <fieldset><legend>Contact</legend>${fld('email','Email',u.email||'',{type:'email',ac:'email',err:'Enter a valid email address'})}
  ${S.user?'':'<p class="mono" style="margin:0">Have an account? <a href="#/account" style="color:var(--accent)">Sign in</a></p>'}</fieldset>
  <fieldset><legend>Delivery</legend>
  <div class="field"><label>Delivery area</label><select name="area"><option value="male" ${S.area==='male'?'selected':''}>Malé</option><option value="island" ${S.area==='island'?'selected':''}>Other island</option></select></div>
  <div class="two">${fld('first','First name',nm[0]||'',{ac:'given-name'})}${fld('last','Last name',nm.slice(1).join(' '),{ac:'family-name'})}</div>
  ${fld('address','Address / house name',u.address||'',{ac:'street-address'})}
  <div id="islandf" class="two" style="display:${S.area==='island'?'grid':'none'}">${fld('island','Island',u.island||'')}${fld('atoll','Atoll',u.atoll||'')}</div>
  ${fld('phone','Phone number (required)',u.phone||'',{type:'tel',ac:'tel',ph:'e.g. 7771234',err:'Enter a valid phone number (at least 7 digits)'})}</fieldset>
  <fieldset><legend>Delivery information</legend><div class="note" style="margin:0">Delivery in Male' free for items price exceeding ${CFG.delivery.maleFreeAbove} MVR. If less than ${CFG.delivery.maleFreeAbove}MVR, a delivery fee of MVR ${CFG.delivery.maleFee} will be charged. Delivery to islands will be arranged through contact with the customer and the store will deliver the item to the requested island boat. Applicable fees will be charged.</div></fieldset>
  <fieldset><legend>Payment</legend>
  <div class="opt"><label><input type="radio" name="pay" value="cod" checked>Cash on delivery / pickup</label></div>
  <div class="opt"><label><input type="radio" name="pay" value="bank">Bank transfer (details sent after order)</label></div>
  <div class="opt dis"><label><input type="radio" name="pay" value="card" disabled>Card payment (gateway not yet connected)</label></div></fieldset>
  ${S.user?'':`<fieldset><label class="chk"><input type="checkbox" name="mk"> Create an account with this order</label>
  <div id="pw" style="display:none;margin-top:10px">${fld('password','Choose a password (min. 6 characters)','',{type:'password',ac:'new-password',err:'Minimum 6 characters'})}</div></fieldset>`}
  <button class="btn block" type="submit">Place order</button></form>
  <div class="panel" style="position:sticky;top:80px"><h3 style="margin-top:0">Order summary</h3>${L.map(l=>`<div class="row" style="justify-content:space-between;padding:6px 0;flex-wrap:nowrap"><span>${esc(l.p.name)} <span class="mono">× ${l.qty}</span></span><span class="price">${fmt(l.p.price*l.qty)}</span></div>`).join('')}
  <div id="cosum" style="margin-top:10px;border-top:1px solid var(--line);padding-top:8px">${sumHtml(true)}</div></div></div>`;
}

const PAY={cod:'Cash on delivery / pickup',bank:'Bank transfer'};
async function viewOrder(id){
  let o=S.lastOrder&&S.lastOrder.id===id?S.lastOrder:null;
  if(!o&&S.user){o=(await db.listOrders()).find(x=>x.id===id)||null}
  if(!o)return '<div class="empty" style="margin-top:30px">Order not found. Guest confirmations are only shown on the device that placed the order; signed-in customers can find their orders under Account.</div>';
  return `<h2 class="sec">Order received <span class="mono">${esc(o.id)}</span></h2><div class="panel" style="max-width:640px">
  <p>Thank you, ${esc(o.customer.first)}. We will contact you on the phone number or email you provided to confirm your order.</p>
  <p class="mono">Phone: ${esc(o.customer.phone||'—')} · Email: ${esc(o.customer.email||'—')}</p>
  ${o.items.map(i=>`<div class="row" style="justify-content:space-between;flex-wrap:nowrap;padding:5px 0"><span>${esc(i.name)} <span class="mono">× ${i.qty}</span></span><span class="price">${fmt(i.price*i.qty)}</span></div>`).join('')}
  <div class="sum" style="border-top:1px solid var(--line);margin-top:8px;padding-top:8px"><div><span>Delivery</span><span>${o.area==='island'?'To be arranged':(o.shipping?fmt(o.shipping):'Free')}</span></div><div class="tot"><span>Total</span><span>${fmt(o.total)}</span></div></div>
  <p class="mono">Status: ${esc(o.status)} · Payment: ${esc(PAY[o.payment]||o.payment)}</p><a class="btn" href="#/shop">Continue shopping</a></div>`;
}
