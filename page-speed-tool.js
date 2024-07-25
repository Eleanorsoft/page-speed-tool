var PageSpeedTool = new function () {

  let initTimeout = null;
  let cookieName = null;
  let afterInitInProgress = false;
  let afterInitQueue = [];

  this.afterInit = async (l) => {
      if (this.initialized) {
        if (afterInitInProgress) {
            afterInitQueue.push(l);
        } else {
            afterInitInProgress = true;
            await l();
            while (afterInitQueue.length > 0) {
                cb = afterInitInProgress.shift();
                await cb();
            }
            afterInitInProgress = false;
        }
        return;
      }
      this.listeners.push(l);
  };
  this.onUserAction = async (l) => {
      throw new Error('deprecated');
      if (this.userOnlyScriptsInitialized) {
          return await l();
        //   return setTimeout(l, 0);
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

  this.enableTimeout = (t) => {
    initTimeout = (t ? t : 1000);
  };

  this.disableTimeout = () => {
    initTimeout = null;
  }

  this.enableCookie = (n) => {
    cookieName = (n ? n : 'pst_skip_delay');
    if (getCookie(cookieName)) {
        initializeUserOnlyScripts();
    }
    setCookie(cookieName, 1, 30);
  };

    function setCookie(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }
  
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

      if (initTimeout) {
        setTimeout(initialize, initTimeout);
      }
  });
};
