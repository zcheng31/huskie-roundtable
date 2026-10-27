'use strict';
const ICONS = {
 arrow:'M4 12h16m-6-6 6 6-6 6',search:'M21 21l-5-5m2-6a7 7 0 1 1-14 0 7 7 0 0 1 14 0',bookmark:'M6 3h12v18l-6-4-6 4Z',
 basket:'m3 9 2 11h14l2-11ZM8 9l4-6 4 6M9 13v3m6-3v3M2 9h20',book:'M12 5v16m0-16C8 2 4 3 2 4v15c3-1 6-1 10 2m0-16c4-3 8-2 10-1v15c-3-1-6-1-10 2',wallet:'M3 6V4h16v4M3 6v14h19V8H5a2 2 0 0 1-2-2Zm14 6h5v4h-5Z',heart:'M12 21S2 15 2 8a5 5 0 0 1 10-1A5 5 0 0 1 22 8c0 7-10 13-10 13Z',cap:'m2 8 10-5 10 5-10 5Zm4 3v6c4 3 8 3 12 0v-6m4-3v8',briefcase:'M3 7h18v14H3ZM8 7V3h8v4M3 12c6 4 12 4 18 0m-9 0v4',people:'M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 11v-3a7 7 0 0 1 14 0v3m2-18a4 4 0 0 1 0 8m1 3c2 1 3 3 3 6v1',home:'m2 11 10-9 10 9M5 9v13h14V9M9 22v-8h6v8',pin:'M19 10c0 6-7 12-7 12S5 16 5 10a7 7 0 0 1 14 0Zm-4 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',info:'M12 11v6m0-10v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',compass:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-7-3-2 5-5 2 2-5Z',spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',grid:'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z'
};
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name] || ICONS.book}"></path></svg>`;
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = selector => document.querySelector(selector);
const categoryFor = id => CATEGORIES.find(c => c.id === id);
const storageKey = 'huskie-roundtable-saved-v1';
let saved = new Set();
let storageAvailable = true;
try { const raw = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(raw)) saved = new Set(raw.filter(id => typeof id === 'string' && RESOURCES.some(r => r.id === id))); } catch (_) { storageAvailable = false; }
let state = {category:'all',query:'',cost:'all',online:false,saved:false,sort:'featured'};
let toastTimer;
let lastFocused;
let lastResourceId;
document.querySelectorAll('[data-icon]').forEach(el => {el.outerHTML = icon(el.dataset.icon);});
$('#resource-total').textContent = RESOURCES.length;
function toast(message) {$('#toast').textContent = message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer = setTimeout(()=>$('#toast').classList.remove('visible'),2800);}
function syncControls(){
 $('#search').value=state.query;$('#access-filter').value=state.cost;$('#online-filter').checked=state.online;$('#sort').value=state.sort;
 $('#saved-filter').setAttribute('aria-pressed',String(state.saved));$('#saved-count').textContent=saved.size;
}
function updateURL(){
 const url=new URL(location.href);const params=url.searchParams;
 ['q','category','access','online','saved','sort'].forEach(key=>params.delete(key));
 if(state.query)params.set('q',state.query);if(state.category!=='all')params.set('category',state.category);if(state.cost!=='all')params.set('access',state.cost);if(state.online)params.set('online','1');if(state.saved)params.set('saved','1');if(state.sort!=='featured')params.set('sort',state.sort);
 history.replaceState(null,'',url);
}
function readURL(){const p=new URLSearchParams(location.search);state.query=p.get('q')||'';state.category=CATEGORIES.some(c=>c.id===p.get('category'))?p.get('category'):'all';state.cost=['free','eligible','check'].includes(p.get('access'))?p.get('access'):'all';state.online=p.get('online')==='1';state.saved=p.get('saved')==='1';state.sort=p.get('sort')==='az'?'az':'featured';}
function matchesQuery(resource){
 const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const haystack=normalize([resource.title,resource.description,resource.category,categoryFor(resource.category).name,resource.location,...resource.tags,resource.costLabel].join(' '));
 const words=normalize(state.query).split(/\s+/).filter(Boolean).map(w=>({tutoring:'tutor',scholarships:'scholarship',laptops:'laptop',fees:'fee',resources:'resource'}[w]||w));
 return words.every(word=>haystack.includes(word));
}
function getResults(){return RESOURCES.filter(r=>(state.category==='all'||r.category===state.category)&&(state.cost==='all'||r.cost===state.cost)&&(!state.online||r.mode.toLowerCase().includes('online'))&&(!state.saved||saved.has(r.id))&&matchesQuery(r)).sort((a,b)=>state.sort==='az'?a.title.localeCompare(b.title):(Number(Boolean(b.featured))-Number(Boolean(a.featured))));}
function renderCategories(){
 const items=[{id:'all',name:'All resources',icon:'grid'},...CATEGORIES];
 $('#category-filters').innerHTML=items.map(c=>`<button class="category-filter" data-category="${c.id}" aria-pressed="${state.category===c.id}">${icon(c.icon)}<span>${c.name}</span><span class="category-number">${c.id==='all'?RESOURCES.length:RESOURCES.filter(r=>r.category===c.id).length}</span></button>`).join('');
}
function saveButton(r){return `<button class="save-button" data-save="${r.id}" aria-label="${saved.has(r.id)?'Unsave':'Save'} ${escapeHTML(r.title)}" aria-pressed="${saved.has(r.id)}">${icon('bookmark')}</button>`;}
function renderCard(r){const cat=categoryFor(r.category);return `<article class="resource-card"><div class="card-top"><span class="category-icon ${cat.id}">${icon(cat.icon)}</span>${saveButton(r)}</div><p class="card-category">${cat.name}</p><h3>${escapeHTML(r.title)}</h3><p class="card-description">${escapeHTML(r.description)}</p><span class="cost-tag ${r.cost}">${escapeHTML(r.costLabel)}</span><p class="card-location">${icon('pin')}<span>${escapeHTML(r.location)}</span></p><div class="card-actions"><button class="details-button" data-details="${r.id}" aria-label="Explore ${escapeHTML(r.title)}">Explore resource ${icon('arrow')}</button><a class="source-link" href="${r.url}" target="_blank" rel="noopener noreferrer" aria-label="Official page for ${escapeHTML(r.title)} (opens in a new tab)">Official page ↗</a></div></article>`;}
function renderActiveFilters(){let chips=[];if(state.category!=='all')chips.push(['category',categoryFor(state.category).name]);if(state.query)chips.push(['query',`“${state.query}”`]);if(state.cost!=='all')chips.push(['cost',{free:'Free services',eligible:'Eligibility / availability',check:'Confirm fees'}[state.cost]]);if(state.online)chips.push(['online','Online access']);if(state.saved)chips.push(['saved','My saved']);$('#active-filters').innerHTML=chips.map(([key,label])=>`<button data-remove="${key}" aria-label="Remove ${escapeHTML(label)} filter">${escapeHTML(label)} <span aria-hidden="true">×</span></button>`).join('')+(chips.length?'<button data-remove="all">Clear all</button>':'');}
function render(){syncControls();renderCategories();const results=getResults();$('#results-count').innerHTML=`<b>${results.length} ${results.length===1?'resource':'resources'}</b> ${state.saved?'in your saved list':state.category==='all'?'for your next step':`in ${categoryFor(state.category).name.toLowerCase()}`}`;$('#resource-grid').innerHTML=results.map(renderCard).join('');$('#empty-state').hidden=results.length>0;renderActiveFilters();updateURL();}
function clearFilters(){state={category:'all',query:'',cost:'all',online:false,saved:false,sort:'featured'};render();}
function toggleSave(id){if(saved.has(id)){saved.delete(id);toast('Resource removed from your saved list.');}else{saved.add(id);toast('Saved for your next step.');}try{localStorage.setItem(storageKey,JSON.stringify([...saved]));storageAvailable=true;}catch(_){storageAvailable=false;toast('Saved for this visit. Your browser is blocking permanent saves.');}const focused=document.activeElement;const focusedId=focused&&focused.dataset.save;render();const dialogButton=$('#dialog-content [data-dialog-save]');if(dialogButton&&dialogButton.dataset.dialogSave===id){dialogButton.innerHTML=`${icon('bookmark')} ${saved.has(id)?'Saved to my list':'Save for later'}`;dialogButton.setAttribute('aria-pressed',String(saved.has(id)));}if(focusedId){document.querySelector(`[data-save="${focusedId}"]`)?.focus();}}
function openResource(id){const r=RESOURCES.find(r=>r.id===id);if(!r)return;const c=categoryFor(r.category);lastFocused=document.activeElement;lastResourceId=id;$('#dialog-content').innerHTML=`<span class="category-icon ${c.id}">${icon(c.icon)}</span><p class="eyebrow">${c.name}</p><h2 id="dialog-title">${escapeHTML(r.title)}</h2><span class="cost-tag ${r.cost}">${escapeHTML(r.costLabel)}</span><p style="margin-top:20px">${escapeHTML(r.description)}</p><h3>Who can use it?</h3><p>${escapeHTML(r.eligibility)}</p><h3>Your next step</h3><ol>${r.steps.map(s=>`<li>${escapeHTML(s)}</li>`).join('')}</ol><div class="dialog-meta"><p>${icon('pin')} ${escapeHTML(r.location)}</p><p><b>Access:</b> ${escapeHTML(r.mode)}</p>${r.email?`<p><a href="mailto:${r.email}">${r.email}</a></p>`:''}${r.phone?`<p><a href="tel:+1${r.phone.replace(/\D/g,'')}">${r.phone}</a></p>`:''}</div><div class="dialog-actions"><a href="${r.url}" class="button primary" target="_blank" rel="noopener noreferrer">Visit official resource page ↗</a><button class="button secondary" data-dialog-save="${r.id}" aria-pressed="${saved.has(r.id)}">${icon('bookmark')} ${saved.has(r.id)?'Saved to my list':'Save for later'}</button></div><p class="dialog-note">Source: <a href="${r.url}" target="_blank" rel="noopener noreferrer">${new URL(r.url).hostname}</a> · Researched October 27, 2026.<br>Confirm current hours, requirements, and availability with the office.</p>`;$('#resource-dialog').showModal();$('#dialog-close').focus();}
function closeResource(){$('#resource-dialog').close();}
$('#resource-dialog').addEventListener('close',()=>{if(lastFocused?.isConnected)lastFocused.focus();else document.querySelector(`[data-details="${lastResourceId}"]`)?.focus();});
document.addEventListener('click',e=>{const target=e.target.closest('button');if(!target)return;const d=target.dataset;if(d.category){state.category=d.category;render();document.querySelector(`[data-category="${d.category}"]`)?.focus();}if(d.save)toggleSave(d.save);if(d.dialogSave)toggleSave(d.dialogSave);if(d.details)openResource(d.details);if(d.search){state.query=d.search;state.category='all';state.saved=false;state.cost='all';state.online=false;render();$('#search').focus();}if(d.path){clearFilters();state.category=d.path;render();$('#directory').scrollIntoView({behavior:'smooth'});$('#search').focus({preventScroll:true});}if(d.remove){if(d.remove==='all')clearFilters();else{state[d.remove]=['online','saved'].includes(d.remove)?false:d.remove==='query'?'':'all';render();}}});
$('#search-form').addEventListener('submit',e=>{e.preventDefault();state.query=$('#search').value.trim();render();});
$('#search').addEventListener('input',e=>{state.query=e.target.value;render();});
$('#access-filter').addEventListener('change',e=>{state.cost=e.target.value;render();});$('#online-filter').addEventListener('change',e=>{state.online=e.target.checked;render();});$('#sort').addEventListener('change',e=>{state.sort=e.target.value;render();});
$('#saved-filter').addEventListener('click',()=>{state.saved=!state.saved;render();});
$('#saved-nav').addEventListener('click',()=>{clearFilters();state.saved=true;render();$('#directory').scrollIntoView({behavior:'smooth'});$('#search').focus({preventScroll:true});if(!storageAvailable)toast('Your saved list is available for this visit.');});
$('#empty-reset').addEventListener('click',clearFilters);$('#dialog-close').addEventListener('click',closeResource);$('#resource-dialog').addEventListener('click',e=>{if(e.target===$('#resource-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeResource();}});
$('#sources-button').addEventListener('click',()=>$('#sources-dialog').showModal());$('#sources-close').addEventListener('click',()=>$('#sources-dialog').close());
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();$('#directory').scrollIntoView();$('#search').focus();}});
window.addEventListener('popstate',()=>{readURL();render();});
window.addEventListener('storage',e=>{if(e.key===storageKey){try{const data=JSON.parse(e.newValue||'[]');saved=new Set(Array.isArray(data)?data.filter(id=>RESOURCES.some(r=>r.id===id)):[]);render();}catch(_){}}});
readURL();render();
