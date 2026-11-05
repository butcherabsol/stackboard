// Local-only implementation of the bookmark storage used by Stackboard.
(() => {
  const key = 'stackboard-standalone-tree-v1';
  const event = () => { const listeners = new Set(); return { addListener: f => listeners.add(f), removeListener: f => listeners.delete(f), emit: (...a) => listeners.forEach(f => f(...a)) }; };
  const changed = event();
  const events = Object.fromEntries(['onCreated','onRemoved','onChanged','onMoved','onChildrenReordered'].map(k => [k,event()]));
  const initial = () => ({id:'0',title:'',children:[{id:'1',parentId:'0',title:'Bookmarks bar',children:[]},{id:'2',parentId:'0',title:'Other bookmarks',folderType:'other',children:[]}]});
  const load = () => JSON.parse(localStorage.getItem(key) || JSON.stringify(initial()));
  const find = (root,id) => { if(root.id === id) return root; for(const c of root.children || []) { const n=find(c,id); if(n) return n; } };
  const node = (root,id) => { const n=find(root,id); if(!n) throw Error('Item not found'); return n; };
  const reindex = p => (p.children || []).forEach((n,i) => { n.index=i; n.parentId=p.id; });
  const save = (root, e) => { localStorage.setItem(key,JSON.stringify(root)); events[e].emit(); };
  window.addEventListener('storage', e => { if(e.key===key) events.onChanged.emit(); });
  const bookmarks = {
    ...events,
    async getTree() { return [load()]; },
    async get(id) { return [node(load(),id)]; },
    async getSubTree(id) { return [node(load(),id)]; },
    async getChildren(id) { return node(load(),id).children || []; },
    async create(info) { const root=load(), p=node(root,info.parentId); if(!p.children) throw Error('Not a folder'); const n={id:crypto.randomUUID(),parentId:p.id,title:info.title || '',dateAdded:Date.now(),...(info.url ? {url:info.url} : {children:[]})}; p.children.splice(info.index ?? p.children.length,0,n); reindex(p); save(root,'onCreated'); return n; },
    async update(id,info) { const root=load(), n=node(root,id); Object.assign(n,info); save(root,'onChanged'); return n; },
    async move(id,info) { const root=load(), n=node(root,id), old=node(root,n.parentId), p=node(root,info.parentId || n.parentId); old.children.splice(old.children.indexOf(n),1); reindex(old); p.children.splice(info.index ?? p.children.length,0,n); reindex(p); save(root,'onMoved'); return n; },
    async removeTree(id) { const root=load(), n=node(root,id), p=node(root,n.parentId); p.children.splice(p.children.indexOf(n),1); reindex(p); save(root,'onRemoved'); },
    async remove(id) { return this.removeTree(id); }
  };
  const storage = {onChanged:changed, local:{
    async get(keys) { const data=JSON.parse(localStorage.getItem('stackboard-standalone-settings') || '{}'); if(typeof keys==='string') return {[keys]:data[keys]}; if(Array.isArray(keys)) return Object.fromEntries(keys.map(k=>[k,data[k]])); return {...(keys || {}),...data}; },
    async set(values) { const data=JSON.parse(localStorage.getItem('stackboard-standalone-settings') || '{}'); const changes={}; for(const [k,v] of Object.entries(values)) { changes[k]={oldValue:data[k],newValue:v}; data[k]=v; } localStorage.setItem('stackboard-standalone-settings',JSON.stringify(data)); changed.emit(changes,'local'); },
    async remove(keys) { const data=JSON.parse(localStorage.getItem('stackboard-standalone-settings') || '{}'); for(const k of [keys].flat()) delete data[k]; localStorage.setItem('stackboard-standalone-settings',JSON.stringify(data)); }
  }};
  window.chrome = {bookmarks,storage};
})();
