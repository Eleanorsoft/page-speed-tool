/**
 * page-speed-tool
 * version 1.0.1
 */
;var PageSpeedTool = (typeof(PageSpeedTool) !== 'undefined') ? PageSpeedTool : new function () {

    let initTimeout = null;
    let cookieName = null;
    let afterInitInProgress = false;
    let afterInitQueue = [];

    function setCookie(name,value,days) {
        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }
    function getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for(let i=0;i < ca.length;i++) {
            let c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    this.initialized = false;
    this.userOnlyScriptsInitialized = false;
    this.listeners = [];
    this.userOnlyScripts = [];

    let initialize = async () => {
        if (this.initialized) { return; }
        this.initialized = true;
        for (let i = 0; i < this.listeners.length; i++) {
            await this.listeners[i]();
        }
    }
    let initializeUserOnlyScripts = async () => {
        if (this.userOnlyScriptsInitialized) { return; }
        this.userOnlyScriptsInitialized = true;
        await initialize();
        for (let i = 0; i < this.userOnlyScripts.length; i++) {
            await this.userOnlyScripts[i]();
        }
    };

    let interactionListener = () => {
        stopListening();
        initializeUserOnlyScripts();
    }

    let startListening = () => {
        document.addEventListener('mousemove', interactionListener);
        document.addEventListener('touchmove', interactionListener);
        document.addEventListener('click', interactionListener);
        document.addEventListener('scroll', interactionListener);
    };

    let stopListening = () => {
        document.removeEventListener('mousemove', interactionListener);
        document.removeEventListener('touchmove', interactionListener);
        document.removeEventListener('click', interactionListener);
        document.removeEventListener('scroll', interactionListener);
    };

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
  
    this.deferredStyle = (s) => {
        this.afterInit(function(){
            let styles = document.createElement('link');
            styles.rel = 'stylesheet';
            styles.type = 'text/css';
            styles.media = 'all';
            styles.href = s;
            document.getElementsByTagName('head')[0].appendChild(styles);
        });
    };
  
    this.deferredScript = (s) => {
        const method = 'afterInit';
        this[method](async function(){
            if (typeof(s) === 'string') {
                await (new Promise((resolve) => {
                    let script = document.createElement('script');
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

    window.addEventListener('load', () => {
        startListening();
        if (initTimeout) {
            setTimeout(initialize, initTimeout);
        }
    });
};
