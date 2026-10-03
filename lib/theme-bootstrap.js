// This runs in <head> while HTML is parsed, before the page is painted.
// Keep the key and URL in sync with theme-preferences.js.
export const themeBootstrap = `(function(){
  var root=document.documentElement;
  try {
    var color=localStorage.getItem('theme');
    if(color==='light'||color==='dark')root.dataset.theme=color;
    if(localStorage.getItem('design')==='v2'){
      root.dataset.design='v2';
      var link=document.createElement('link');
      link.id='design-v2-styles';link.rel='stylesheet';link.href='/design-v2.css';
      link.onload=function(){link.dataset.loaded='true';root.dataset.designReady='true'};
      link.onerror=function(){link.remove();root.dataset.design='classic';root.dataset.designReady='true'};
      document.head.appendChild(link);
    }
  } catch(error) {}
})();`;
