var EsOpt = new function () {
  this.afterInit = async (l) => {
      if (this.initialized) {
          return setTimeout(l, 0);
      }
      this.listeners.push(l);
  };
  this.onUserAction = async (l) => {
      if (this.userOnlyScriptsInitialized) {
          // return await l();
          return setTimeout(l, 0);
      }
      this.userOnlyScripts.push(l);
  };
  
  this.deferredStyle = (s) => {
      this.afterInit(function(){
          var styles = document.createElement('link');
          styles.rel = 'stylesheet';
          styles.type = 'text/css';
          styles.media = 'all';
          styles.href = s;
          document.getElementsByTagName('head')[0].appendChild(styles);
      });
  };
  
  this.deferredScript = (s, forUser) => {
      const method = (forUser ? 'onUserAction' : 'afterInit');
      this[method](async function(){
          if (typeof(s) === 'string') {
              await (new Promise((resolve) => {
                  var script = document.createElement('script');
                  script.onload = resolve;
                  script.src = s;
                  document.getElementsByTagName('head')[0].appendChild(script);
              }));
          } else {
              await s();
          }
      });
  };
  
  this.initialized = false;
  this.userOnlyScriptsInitialized = false;
  this.listeners = [];
  this.userOnlyScripts = [];
  var initialize = async () => {
      if (this.initialized) { return; }
      this.initialized = true;
      for (let i = 0; i < this.listeners.length; i++) {
          await this.listeners[i]();
      }
      // this.listeners.forEach(l => l());
  }
  var initializeUserOnlyScripts = async () => {
      if (this.userOnlyScriptsInitialized) { return; }
      this.userOnlyScriptsInitialized = true;
      await initialize();
      for (let i = 0; i < this.userOnlyScripts.length; i++) {
          await this.userOnlyScripts[i]();
      }
  };
  
  window.addEventListener('load', () => {
      document.addEventListener('mousemove', initializeUserOnlyScripts);
      document.addEventListener('touchmove', initializeUserOnlyScripts);
      document.addEventListener('click', initializeUserOnlyScripts);
  });
};
