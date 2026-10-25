"use strict";
/* Liladip — admin views: products, orders, settings, product form. */
async function viewAdmin(){
  if(!isAdmin())return `<h2 class="sec">Admin</h2><div class="empty">Administrator access required. <a href="#/account" style="color:var(--accent)">Sign in</a>${demoHint()}</div>`;
  const tab=S.adminTab;
  let body='';
  if(tab==='products'){
    body=`<div class="row" style="margin-bottom:12px"><button class="btn" data-act="pform">Add product</button><span class="mono">${S.products.length} products</span></div>
    <div class="tw"><table><thead><tr><th>Product</th><th>Brand</th><th>Price (${CFG.currency})</th><th>Stock</th><th></th></tr></thead><tbody>
    ${S.products.map(p=>`<tr><td><div class="pname"><div class="athumb">${pic(p)}</div><div>${esc(p.name)} ${p.featured?'<span class="st ok">Hero</span>':''}<div class="mono">${esc(p.sku||String(p.id).slice(0,8))}</div></div></div></td><td>${esc(p.brand||'—')}<div class="mono">${esc([p.audience,p.category].filter(Boolean).join(', '))}</div></td>
    <td><input class="n" type="number" min="0" step="any" value="${p.price}" data-quick="price" data-id="${p.id}"></td>
    <td><input class="n" type="number" min="0" step="1" value="${p.stock}" data-quick="stock" data-id="${p.id}"></td>
    <td style="white-space:nowrap"><button class="btn ghost sm" data-act="pform" data-id="${p.id}">Edit</button> <button class="btn ${S.confirmDel===p.id?'danger':'ghost'} sm" data-act="del" data-id="${p.id}">${S.confirmDel===p.id?'Confirm delete':'Delete'}</button></td></tr>`).join('')}</tbody></table></div>`;
  }else if(tab==='terms'){
    body=`<div class="two termcols">${termPanel('audience','Categories','The groups customers shop by, such as Women, Men and Unisex. Every product belongs to one category.')}
    ${termPanel('scent','Scents','Scent names such as Woody or Floral. A product can have one scent or none. Customers see scents only when "Show scent information" is turned on in Settings.')}</div>
    <p class="mono">Renaming an entry also renames it on every product that uses it. An entry cannot be deleted while products still use it: change those products first.</p>`;
  }else if(tab==='orders'){
    const os=await db.listOrders();
    body=os.length?`<div class="tw"><table><thead><tr><th>Order</th><th>Customer</th><th>Delivery</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>
    ${os.map(o=>`<tr><td class="mono">${esc(o.id)}</td><td>${esc(o.customer.first)} ${esc(o.customer.last)}<div class="mono">${esc(o.customer.email)} · ${esc(o.customer.phone)}</div></td>
    <td>${o.area==='island'?esc(o.customer.island)+', '+esc(o.customer.atoll)+'<div class="mono">fee to be arranged</div>':'Malé<div class="mono">'+esc(o.customer.address)+'</div>'}</td>
    <td>${o.items.reduce((s,i)=>s+i.qty,0)}</td><td>${fmt(o.total)}</td>
    <td><select data-ostat="${o.uid}">${['Pending','Confirmed','Shipped','Delivered','Cancelled'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>
    <p class="mono">Cancelling an order returns its items to stock. A cancelled order cannot be reopened.</p>`:'<div class="empty">No orders yet.</div>';
  }else{
    body=`<form id="sf" class="panel" style="max-width:520px" novalidate>
    <div class="field" data-f="free"><label>Malé: delivery is free when the subtotal exceeds (${CFG.currency})</label><input name="free" type="number" min="0" step="any" value="${CFG.delivery.maleFreeAbove}"><div class="em">Enter a non-negative number</div></div>
    <div class="field" data-f="fee"><label>Malé: delivery fee at or below that amount (${CFG.currency})</label><input name="fee" type="number" min="0" step="any" value="${CFG.delivery.maleFee}"><div class="em">Enter a non-negative number</div></div>
    <div class="field" data-f="tax"><label>Tax rate as a fraction (0.08 = 8%; 0 = none)</label><input name="tax" type="number" min="0" max="1" step="any" value="${CFG.taxRate}"><div class="em">Enter a value between 0 and 1</div></div>
    <div class="field"><label class="chk" style="color:var(--text);font-size:.95rem"><input type="checkbox" name="show_scents" ${CFG.showScents?'checked':''}> Show scent information on the store</label><div class="mono" style="margin-top:4px">Shows each product's scent and its fragrance notes (top, heart and base), and adds a scent filter. Off by default. The information stays saved while it is hidden.</div></div>
    <button class="btn" type="submit">Save settings</button></form>`;
  }
  const T=(k,l)=>`<button class="${tab===k?'on':''}" data-act="admtab" data-v="${k}">${l}</button>`;
  return `<h2 class="sec">Admin <span class="mono">Store management</span></h2><div class="tabs">${T('products','Products')}${T('terms','Categories and scents')}${T('orders','Orders')}${T('settings','Settings')}</div>${body}`;
}
/* options for a managed list; a value no longer in the list (older data) is kept so saving does not lose it */
function optList(list,cur,blank){
  const items=[...list];if(cur&&!items.includes(cur))items.push(cur);
  return (blank?`<option value="" ${cur?'':'selected'}>None</option>`:'')+items.map(x=>`<option value="${esc(x)}" ${x===cur?'selected':''}>${esc(x)}</option>`).join('');
}
function termPanel(kind,title,help){
  const field=kind==='audience'?'audience':'category',list=S.terms[kind];
  return `<div class="panel"><h3 style="margin-top:0">${title}</h3><p class="mono">${help}</p>
  ${list.map(t=>{const n=S.products.filter(p=>p[field]===t).length,sure=S.confirmDel===kind+':'+t;
    return `<form class="trow" data-form="tr" novalidate><input type="hidden" name="kind" value="${kind}"><input type="hidden" name="old" value="${esc(t)}"><input name="name" value="${esc(t)}" maxlength="60" aria-label="Name"><span class="mono">${n} product${n===1?'':'s'}</span><button class="btn ghost sm" type="submit">Save</button><button class="btn ${sure?'danger':'ghost'} sm" type="button" data-act="termdel" data-kind="${kind}" data-v="${esc(t)}" ${n?'disabled title="Change those products first"':''}>${sure?'Confirm delete':'Delete'}</button></form>`}).join('')||'<div class="empty">None yet.</div>'}
  <form class="trow add" data-form="tf" novalidate><input type="hidden" name="kind" value="${kind}"><input name="name" placeholder="Add a new one" maxlength="60" aria-label="New name"><button class="btn sm" type="submit">Add</button></form></div>`;
}
function productForm(id){
  const p=id?getP(id):{name:'',sku:'',brand:'',audience:'Unisex',category:'',price:'',stock:0,description:'',specs:[],featured:false,hue:200,images:[]};
  PF={items:(p.images||[]).map(url=>({url})),orig:[...(p.images||[])]};
  const hue=p.hue??200;
  $('#modal').innerHTML=`<div class="box"><h3 style="margin-top:0">${id?'Edit product':'Add product'}</h3><form id="pf" novalidate>
  ${fld('name','Name',p.name)}
  <div class="two"><div class="field" data-f="brand"><label>Brand</label><input name="brand" list="bl" value="${esc(p.brand||'')}"><datalist id="bl">${brands().map(b=>`<option value="${esc(b)}">`).join('')}</datalist><div class="em">Required</div></div>
  <div class="field"><label>Category</label><select name="audience">${optList(S.terms.audience,p.audience||S.terms.audience[0],false)}</select></div></div>
  <div class="two">${fld('sku','SKU (optional, unique)',p.sku||'')}<div class="field"><label>Scent (optional)</label><select name="category">${optList(S.terms.scent,p.category||'',true)}</select></div></div>
  <div class="two">${fld('price','Price ('+CFG.currency+')',p.price,{type:'number',err:'Enter a non-negative number'})}${fld('stock','Stock',p.stock,{type:'number',err:'Enter a whole number ≥ 0'})}</div>
  <div class="field"><label>Images <span id="imgcount" class="mono"></span></label>
  <div class="imgs" id="imgs"></div>
  <input type="file" id="imgfile" accept="image/*" multiple>
  <div class="mono" style="margin-top:6px;text-transform:none;letter-spacing:0">The first image is the main one shown in the catalogue and banner; the product page lets customers browse all of them. Images are resized in the browser before saving. Portrait photos (4:5) fill the catalogue cards best.</div></div>
  <div class="field"><label>Description</label><textarea name="description" rows="3">${esc(p.description)}</textarea></div>
  <div class="field"><label>Fragrance details (one per line, “Label: value”). Rows starting with Top, Heart or Base notes are shown only when scent information is turned on in Settings.</label><textarea name="specs" rows="4">${esc((p.specs||[]).map(s=>s[0]+': '+s[1]).join('\n'))}</textarea></div>
  <div class="two"><div class="field"><label>Placeholder art hue (0–360)</label><input name="hue" type="number" min="0" max="360" value="${hue}"></div><label class="chk" style="align-self:end;margin-bottom:18px"><input type="checkbox" name="featured" ${p.featured?'checked':''}> Show in hero banner (several allowed)</label></div>
  <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-act="closeall">Cancel</button><button class="btn" type="submit">Save</button></div>
  <input type="hidden" name="id" value="${esc(id||'')}"></form></div>`;
  $('#modal').classList.add('open');
  pfRender();
}

/* ---- product form: image list (new files are resized immediately and uploaded on Save) ---- */
let PF={items:[],orig:[]};
function pfRender(){
  const box=$('#imgs');if(!box)return;
  const n=PF.items.length;
  box.innerHTML=PF.items.map((it,i)=>`<div class="imgi ${i===0?'main':''}"><img src="${esc(it.url)}" alt="">${i===0?'<span class="tag">MAIN</span>':''}<div class="ctl"><button type="button" data-act="imgl" data-i="${i}" ${i===0?'disabled':''} aria-label="Move earlier">◀</button><button type="button" data-act="imgx" data-i="${i}" aria-label="Remove image">✕</button><button type="button" data-act="imgr" data-i="${i}" ${i===n-1?'disabled':''} aria-label="Move later">▶</button></div></div>`).join('')||'<span class="mono">No images yet: the generated placeholder is shown until you add one.</span>';
  const c=$('#imgcount');if(c)c.textContent=n+' / '+CFG.images.maxPerProduct;
}
async function pfAdd(files){
  const max=CFG.images.maxPerProduct,room=max-PF.items.length,list=[...files];
  if(list.length>room)toast('Only '+max+' images per product: extra files were skipped');
  for(const f of list.slice(0,Math.max(0,room))){
    try{const blob=await compressImage(f);PF.items.push({blob,url:URL.createObjectURL(blob)});pfRender()}
    catch(err){toast(err.message)}
  }
}
function pfMove(i,d){const j=i+d;if(j<0||j>=PF.items.length)return;[PF.items[i],PF.items[j]]=[PF.items[j],PF.items[i]];pfRender()}
function pfRemove(i){const it=PF.items[i];if(it&&it.blob)URL.revokeObjectURL(it.url);PF.items.splice(i,1);pfRender()}
