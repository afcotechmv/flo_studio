"use strict";
/* Liladip — demo backend, used when CFG.mode is 'demo'.
   Simulates the database and sign-in entirely inside the visitor's browser (localStorage).
   Nothing is sent anywhere, and nothing is shared between visitors. It follows the same rules as
   sql/schema.sql (pricing, stock, delivery fee, cancellation restores stock) so the behaviour is representative. */
const demoBackend=(()=>{
  const KEY={p:'au_demo_products',o:'au_demo_orders',s:'au_demo_settings',t:'au_demo_terms',u:'au_demo_users',me:'au_demo_me',n:'au_demo_seq'};
  const DEMO_ADMIN={email:'admin@demo.mv',password:'demo1234'};
  const mem={};
  const get=(k,d)=>{try{const v=localStorage.getItem(k);if(v!==null)return JSON.parse(v)}catch(e){}return k in mem?mem[k]:d};
  const isQuota=e=>!!e&&(e.name==='QuotaExceededError'||e.code===22||e.code===1014||/quota/i.test(e.message||''));
  const set=(k,v)=>{mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){if(isQuota(e))throw new Error('Browser storage is full: the demo keeps product images inside the browser. Remove some images, or use "Reset demo data".')}};
  const clone=x=>JSON.parse(JSON.stringify(x));
  const P=(sku,name,brand,audience,category,price,stock,description,specs,featured,hue)=>({id:'d-'+sku.toLowerCase(),sku,name,brand,audience,category,price,stock,description,specs,featured,hue});
  const SEED=[
    P("PF-OS-001","Nuit de Safran","Maison Veyra","Unisex","Oriental & Spicy",2950,8,"A warm, resinous blend of saffron and amber for long evenings. Placeholder product content.",[["Concentration","Eau de Parfum"],["Size","100 ml"],["Top notes","Saffron, bergamot"],["Heart notes","Rose, cinnamon"],["Base notes","Amber, oud, vanilla"],["Longevity","8–10 hours"]],true,32),
    P("PF-FL-001","Rose Éclat","Atelier Solenne","Women","Floral",2250,12,"Fresh-cut Damask rose lifted with lychee and soft musk. Placeholder product content.",[["Concentration","Eau de Parfum"],["Size","75 ml"],["Top notes","Lychee, pink pepper"],["Heart notes","Damask rose, peony"],["Base notes","White musk, cedar"],["Longevity","6–8 hours"]],true,345),
    P("PF-WD-001","Cèdre Noir","Kestrel & Rye","Men","Woody",2650,6,"Dark cedar and smoked vetiver with a leathery edge. Placeholder product content.",[["Concentration","Eau de Parfum"],["Size","100 ml"],["Top notes","Black pepper, cardamom"],["Heart notes","Cedarwood, leather"],["Base notes","Vetiver, tonka bean"],["Longevity","8–10 hours"]],true,22),
    P("PF-FC-001","Agrumes Blancs","Maison Veyra","Unisex","Fresh & Citrus",1650,20,"Bright lemon and grapefruit over white tea and clean musk. Placeholder product content.",[["Concentration","Eau de Toilette"],["Size","100 ml"],["Top notes","Lemon, grapefruit"],["Heart notes","Neroli, white tea"],["Base notes","Musk, driftwood"],["Longevity","4–6 hours"]],false,70),
    P("PF-OA-001","Oud Royale","Sahra Attars","Unisex","Oud & Attar",4800,4,"Deep agarwood softened with saffron, rose and creamy sandalwood. Placeholder product content.",[["Concentration","Extrait de Parfum"],["Size","50 ml"],["Top notes","Saffron, rose"],["Heart notes","Agarwood (oud)"],["Base notes","Amber, sandalwood"],["Longevity","12+ hours"]],false,12),
    P("PF-OA-002","Musk Al Layl","Sahra Attars","Unisex","Oud & Attar",890,25,"A soft, skin-close musk attar in a roll-on bottle. Placeholder product content.",[["Concentration","Attar (alcohol-free oil)"],["Size","12 ml roll-on"],["Top notes","Jasmine"],["Heart notes","White musk"],["Base notes","Sandalwood"],["Longevity","8–10 hours"]],false,48),
    P("PF-FL-002","Jasmin Soleil","Atelier Solenne","Women","Floral",1990,15,"Sun-warmed jasmine with orange blossom and a touch of honey. Placeholder product content.",[["Concentration","Eau de Parfum"],["Size","75 ml"],["Top notes","Mandarin, green leaves"],["Heart notes","Jasmine, orange blossom"],["Base notes","Honey, vanilla"],["Longevity","6–8 hours"]],false,52),
    P("PF-FC-002","Vétiver Bleu","Kestrel & Rye","Men","Fresh & Citrus",1890,18,"Cool, aromatic vetiver with sea salt and fresh herbs. Placeholder product content.",[["Concentration","Eau de Toilette"],["Size","100 ml"],["Top notes","Bergamot, sea salt"],["Heart notes","Sage, geranium"],["Base notes","Vetiver, cedar"],["Longevity","5–7 hours"]],false,205),
    P("PF-GM-001","Vanille Poudrée","House of Amara","Women","Gourmand",2100,0,"Powdery vanilla with almond and a hint of caramel. Placeholder product content.",[["Concentration","Eau de Parfum"],["Size","50 ml"],["Top notes","Almond, pear"],["Heart notes","Heliotrope, iris"],["Base notes","Vanilla, caramel, musk"],["Longevity","6–8 hours"]],false,330),
    P("PF-WD-002","Santal Doré","House of Amara","Unisex","Woody",3200,9,"Creamy sandalwood glowing with golden amber and spice. Placeholder product content.",[["Concentration","Eau de Parfum"],["Size","100 ml"],["Top notes","Cardamom, nutmeg"],["Heart notes","Sandalwood, iris"],["Base notes","Amber, cashmeran"],["Longevity","8–10 hours"]],false,38),
    P("PF-OS-002","Ambre Impérial","Maison Veyra","Women","Oriental & Spicy",2750,5,"Opulent amber and incense wrapped in spiced plum. Placeholder product content.",[["Concentration","Eau de Parfum"],["Size","75 ml"],["Top notes","Plum, pink pepper"],["Heart notes","Incense, labdanum"],["Base notes","Amber, benzoin"],["Longevity","8–10 hours"]],false,8),
    P("PF-GS-001","Travel Spray Trio","Atelier Solenne","Unisex","Gift Sets",450,30,"Three pocket-size sprays in a gift box. Placeholder product content.",[["Concentration","Eau de Parfum"],["Size","3 x 10 ml"],["Contents","Rose Éclat, Jasmin Soleil, Agrumes Blancs"]],false,290)
  ];
  const products=()=>{let p=get(KEY.p,null);if(!p){p=clone(SEED);set(KEY.p,p)}return p};
  const settings=()=>({delivery_male_free_above:500,delivery_male_fee:50,tax_rate:0,show_scents:0,...get(KEY.s,{})});
  /* the lists administrators manage: categories (Women, Men, Unisex ...) and scents (Floral, Woody ...) */
  const terms=()=>{let t=get(KEY.t,null);if(!t){t={audience:['Women','Men','Unisex'],scent:[...new Set(SEED.map(p=>p.category).filter(Boolean))]};set(KEY.t,t)}return t};
  const termField=kind=>kind==='audience'?'audience':'category';
  const termCheck=(t,kind,name,old)=>{
    if(!t[kind])throw new Error('Unknown list');
    if(!name||name.length>60)throw new Error('Enter a name of 1 to 60 characters');
    if(t[kind].some(x=>x!==old&&x.toLowerCase()===name.toLowerCase()))throw new Error('That name already exists');
  };
  const me=()=>get(KEY.me,null);
  const needAdmin=()=>{const u=me();if(!u||u.role!=='admin')throw new Error('Not permitted: administrator sign-in required')};
  const STATUSES=['Pending','Confirmed','Shipped','Delivered','Cancelled'];
  const emailRx=/^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  const db={
    async settings(){return settings()},
    async saveSettings(o){needAdmin();set(KEY.s,{...settings(),...o})},
    async listTerms(){return clone(terms())},
    async addTerm(kind,name){needAdmin();const t=terms(),n=String(name||'').trim();termCheck(t,kind,n);t[kind].push(n);set(KEY.t,t)},
    async renameTerm(kind,old,name){
      needAdmin();const t=terms(),n=String(name||'').trim();termCheck(t,kind,n,old);
      const i=t[kind].indexOf(old);if(i<0)throw new Error('That entry no longer exists');
      t[kind][i]=n;set(KEY.t,t);const f=termField(kind);
      set(KEY.p,products().map(p=>p[f]===old?{...p,[f]:n}:p));   // products that used the old name follow the rename
    },
    async deleteTerm(kind,name){
      needAdmin();const t=terms(),f=termField(kind),n=products().filter(p=>p[f]===name).length;
      if(n)throw new Error(n+' product(s) still use "'+name+'". Change those products first.');
      if(kind==='audience'&&t.audience.length<=1)throw new Error('Keep at least one category');
      t[kind]=t[kind].filter(x=>x!==name);set(KEY.t,t);
    },
    async listProducts(){return clone(products())},
    async saveProduct(p){
      needAdmin();
      if(!(p.price>=0)||!Number.isInteger(p.stock)||p.stock<0)throw new Error('Invalid price or stock');
      const all=products(),sku=(p.sku||'').trim();
      if(sku&&all.some(x=>x.sku===sku&&x.id!==p.id))throw new Error('That value must be unique (is the SKU already used?)');
      const row={sku,name:p.name,brand:String(p.brand||'').trim(),audience:String(p.audience||'').trim()||terms().audience[0]||'Unisex',category:String(p.category||'').trim(),price:p.price,stock:p.stock,description:p.description||'',specs:p.specs||[],featured:!!p.featured,hue:p.hue,images:Array.isArray(p.images)?p.images.filter(Boolean):[]};
      if(p.id){const i=all.findIndex(x=>x.id===p.id);if(i<0)throw new Error('Not permitted, or the record no longer exists');all[i]={...all[i],...row};set(KEY.p,all);return p.id}
      const id='d-'+Date.now().toString(36);all.push({id,...row});set(KEY.p,all);return id;
    },
    async uploadImage(blob){ // demo: the image is kept inside the product record as a data address
      needAdmin();
      return await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('Could not read the image'));r.readAsDataURL(blob)});
    },
    async deleteImages(){},
    async deleteProduct(id){needAdmin();const all=products();if(!all.some(x=>x.id===id))throw new Error('Not permitted, or the record no longer exists');set(KEY.p,all.filter(x=>x.id!==id))},
    async placeOrder(items,c,area,payment){
      const t=k=>String(c[k]==null?'':c[k]).trim();
      const email=t('email').toLowerCase(),first=t('first'),last=t('last'),phone=t('phone'),address=t('address'),island=t('island'),atoll=t('atoll');
      if(!emailRx.test(email)||email.length>254)throw new Error('Enter a valid email address');
      if(!first||!last)throw new Error('First and last name are required');
      if(phone.replace(/\D/g,'').length<7||phone.length>30)throw new Error('Enter a valid phone number');
      if(!['male','island'].includes(area))throw new Error('Invalid delivery area');
      if(!['cod','bank'].includes(payment))throw new Error('Invalid payment method');
      if(area==='male'&&!address)throw new Error("Address is required for delivery in Male'");
      if(area==='island'&&(!island||!atoll))throw new Error('Island and atoll are required for island delivery');
      if(!Array.isArray(items)||!items.length||items.length>50)throw new Error('The cart is empty or invalid');
      const merged=new Map();
      for(const it of items){if(!/^[0-9]{1,4}$/.test(String(it.qty))||Number(it.qty)<1)throw new Error('The cart contains an invalid item');merged.set(it.id,(merged.get(it.id)||0)+Number(it.qty))}
      const all=products();let sub=0;const lines=[];
      for(const [id,qty] of merged){
        const p=all.find(x=>x.id===id);
        if(!p)throw new Error('A product in your cart is no longer available');
        if(p.stock<qty)throw new Error(`Insufficient stock for ${p.name} (${p.stock} available)`);
        sub+=p.price*qty;lines.push({id:p.id,name:p.name,price:p.price,qty});
      }
      const st=settings(),fee=area==='male'?(sub>st.delivery_male_free_above?0:st.delivery_male_fee):0,tax=Math.round(sub*st.tax_rate*100)/100;
      lines.forEach(l=>{all.find(x=>x.id===l.id).stock-=l.qty});set(KEY.p,all);
      const n=get(KEY.n,1001);set(KEY.n,n+1);
      const order={uid:'o'+n,id:'LD-'+n,userId:(me()||{}).id||null,created:new Date().toISOString(),status:'Pending',payment,area,
        customer:{email,first,last,phone,address,island,atoll},items:lines,shipping:fee,tax,total:sub+fee+tax};
      const os=get(KEY.o,[]);os.unshift(order);set(KEY.o,os);
      return clone(order);
    },
    async listOrders(){ // mirrors the row-level security rules: admins see all, customers their own, guests none
      const u=me(),os=get(KEY.o,[]);
      if(!u)return[];
      return clone(u.role==='admin'?os:os.filter(o=>o.userId===u.id));
    },
    async updateOrderStatus(uid,status){
      needAdmin();
      if(!STATUSES.includes(status))throw new Error('Invalid status');
      const os=get(KEY.o,[]),o=os.find(x=>x.uid===uid);
      if(!o)throw new Error('Not permitted, or the record no longer exists');
      if(status!==o.status){
        if(o.status==='Cancelled')throw new Error('A cancelled order cannot be reopened');
        if(status==='Cancelled'){const all=products();o.items.forEach(i=>{const p=all.find(x=>x.id===i.id);if(p)p.stock+=i.qty});set(KEY.p,all)}
        o.status=status;set(KEY.o,os);
      }
    }
  };

  const setMe=u=>set(KEY.me,u);
  const auth={
    async current(){return me()},
    async signUp(email,password,fullName,phone){
      email=String(email).trim().toLowerCase();
      if(!emailRx.test(email))throw new Error('Enter a valid email address');
      if(String(password).length<6)throw new Error('Password must be at least 6 characters');
      phone=String(phone||'').trim();
      if(phone.replace(/\D/g,'').length<7||phone.length>30)throw new Error('Enter a valid phone number');
      if(email===DEMO_ADMIN.email)throw new Error('That address is reserved for the demo administrator');
      const users=get(KEY.u,[]);
      if(users.some(x=>x.email===email))throw new Error('An account with this email already exists in this demo. Please sign in.');
      const user={id:'u'+Date.now().toString(36),email,name:fullName||email.split('@')[0],role:'customer',phone,address:'',island:'',atoll:''};
      users.push(user);set(KEY.u,users);setMe(user);   // passwords are never stored in the demo
      return{user,needsConfirmation:false};
    },
    async signIn(email,password){
      email=String(email).trim().toLowerCase();
      if(email===DEMO_ADMIN.email){
        if(password!==DEMO_ADMIN.password)throw new Error('Invalid login credentials');
        const a={id:'u-admin',email,name:'Demo Administrator',role:'admin',phone:'',address:'',island:'',atoll:''};setMe(a);return a;
      }
      if(String(password).length<6)throw new Error('Invalid login credentials');
      const user=get(KEY.u,[]).find(x=>x.email===email);
      if(!user)throw new Error('No demo account exists for this email. Please create an account first.');
      setMe(user);return user;
    },
    async signOut(){setMe(null)},
    async updateProfile(fields){
      const u=me();if(!u||u.role==='admin')return;
      const nu={...u,...fields};setMe(nu);set(KEY.u,get(KEY.u,[]).map(x=>x.id===u.id?nu:x));
    },
    onChange(){}
  };

  return{name:'demo',db,auth,async init(){products();terms();return{}},
    reset(){
      Object.values(KEY).forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});
      ['au_cart'].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});
      try{sessionStorage.removeItem('au_last')}catch(e){}
      location.hash='#/';location.reload();
    }};
})();
