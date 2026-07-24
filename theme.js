(function(){
  const KEY='tdc-theme';
  const MODES=['system','light','dark'];

  function stored(){
    const v=localStorage.getItem(KEY);
    return MODES.includes(v)?v:'system';
  }
  function resolved(mode){
    if(mode==='system') return matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
    return mode;
  }
  function label(mode){
    return mode==='light'?{icon:'☀',text:'Light'}:mode==='dark'?{icon:'☾',text:'Dark'}:{icon:'◐',text:'System'};
  }
  function apply(mode, persist){
    const actual=resolved(mode);
    document.documentElement.dataset.theme=actual;
    document.documentElement.dataset.themeMode=mode;
    document.documentElement.style.colorScheme=actual;
    if(persist) localStorage.setItem(KEY,mode);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn=>{
      const l=label(mode);
      btn.setAttribute('aria-label',`Theme: ${l.text}. Click to change.`);
      btn.setAttribute('title',`Theme: ${l.text}`);
      const icon=btn.querySelector('.theme-toggle-icon');
      const text=btn.querySelector('.theme-toggle-text');
      if(icon) icon.textContent=l.icon;
      if(text) text.textContent=l.text;
    });
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content',actual==='light'?'#f6f2ea':'#090909');
  }
  function cycle(){
    const current=stored();
    const next=MODES[(MODES.indexOf(current)+1)%MODES.length];
    apply(next,true);
  }
  function install(){
    document.querySelectorAll('[data-theme-toggle]').forEach(btn=>btn.addEventListener('click',cycle));
    apply(stored(),false);
  }

  // Apply before paint when loaded from <head>.
  apply(stored(),false);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  matchMedia('(prefers-color-scheme: light)').addEventListener?.('change',()=>{
    if(stored()==='system') apply('system',false);
  });
})();
