"use strict";
/* Liladip — application state, cart and totals. */
/* ============ STATE ============ */
const S={
  products:[],cart:ls.get('au_cart',[]),user:null,lastOrder:lastOrderGet(),
  terms:{audience:['Women','Men','Unisex'],scent:[]},   // the lists administrators manage (Admin > Categories and scents)
  filter:{cat:'All',aud:'All',brand:'All',q:'',sort:'featured',inStock:false},
  area:'male',adminTab:'products',acctTab:'in',pdQty:1,confirmDel:null
};
const getP=id=>S.products.find(p=>p.id===id);
/* Terminology: product.audience is the CATEGORY customers shop by (Women, Men, Unisex ...);
   product.category holds the SCENT (Floral, Woody ...). Scent information is shown only when CFG.showScents is on. */
const showScents=()=>!!CFG.showScents;
const usedBy=(field,list)=>{const used=new Set(S.products.map(p=>p[field]).filter(Boolean));return[...list.filter(n=>used.has(n)),...[...used].filter(n=>!list.includes(n))]};
const audShown=()=>usedBy('audience',S.terms.audience);      // categories that have at least one product
const scentsShown=()=>usedBy('category',S.terms.scent);       // scents that have at least one product
const cats=()=>['All',...scentsShown()];
const termsFromProducts=()=>({audience:[...new Set(S.products.map(p=>p.audience).filter(Boolean))],scent:[...new Set(S.products.map(p=>p.category).filter(Boolean))]});
const brands=()=>[...new Set(S.products.map(p=>p.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
const isAdmin=()=>S.user&&S.user.role==='admin';
const saveCart=()=>{ls.set('au_cart',S.cart);updateChrome()};
function cartLines(){return S.cart.map(c=>({p:getP(c.id),qty:c.qty})).filter(l=>l.p)}
function addToCart(id,n=1){
  const p=getP(id);if(!p||p.stock<=0)return toast('Sold out');
  const c=S.cart.find(x=>x.id===id),cur=c?c.qty:0,q=Math.min(p.stock,cur+n);
  if(c)c.qty=q;else S.cart.push({id,qty:q});
  saveCart();renderDrawer();
  toast(q<cur+n?`Added to your bag (limited to ${p.stock} in stock)`:'Added to your bag');
  const cc=$('#cc');cc.classList.remove('bump');void cc.offsetWidth;cc.classList.add('bump');
}
function setQty(id,q){
  const p=getP(id);q=Math.max(0,Math.min(p?p.stock:0,q));
  S.cart=q?S.cart.map(c=>c.id===id?{...c,qty:q}:c):S.cart.filter(c=>c.id!==id);
  saveCart();renderDrawer();
}
function totals(co){
  const sub=cartLines().reduce((s,l)=>s+l.p.price*l.qty,0);
  const sh=(co&&S.area==='male'&&sub)?(sub>CFG.delivery.maleFreeAbove?0:CFG.delivery.maleFee):0;
  const tax=Math.round(sub*CFG.taxRate*100)/100;
  return{sub,sh,tax,total:sub+sh+tax};
}
