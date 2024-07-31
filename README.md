# Page speed tool
This tool helps to improve page speed score by delaying loading of non-critical resources.

> Note: it's always better to optimize your resources to reach the best performance without using similar tools as optimized pages create better UX.

## Installation
### Method 1
Download and include `page-speed-tool.min.js` after opening `<head>` tag:
```html
<html>
    <head>
        <script src="/path/to/page-speed-tool.js"></script>
        ...
    </head>
```

Do not use `defer` or `async` in the `<script>` tag.


### Method 2
Copy and paste contents of the `page-speed-tool.min.js` file after opening `<head>` tag:
```html
<html>
    <head>
        <script>
            var PageSpeedTool = new function () { ...
        </script>
        ...
    </head>
```

## How it works
All deferred resources are loaded when a user interacts with the page (scroll, click, touch, mousemove).

Also it is possible to trigger loading after some timeout even if the user hasn't interacted with the page yet.

And a cookie can be set in the user's browser to trigger resource loading right away on subsequent requests when resources are already cached in the browser.

## Usage
All delayed resources are loading in the same order they appear in the code. They are being loaded one by one to preserve any dependencies that still may exists between them.

If you want to load delayed resources asynchronously, use low-level `afterInit()` method.

### Delay styles
```javascript
PageSpeedTool.deferredStyle('/path/to/style.css');
```

### Delay scripts
```javascript
PageSpeedTool.deferredScript('/path/to/script.js');
PageSpeedTool.deferredScript(async () => {
    await do_something();
    return;
});
PageSpeedTool.deferredScript(function () {
    return new Promise(function (resolve) {
        ...
        return resolve();
    });
});
```

### Enable timeout
```javascript
PageSpeedTool.enableTimeout(); // start loading everything in 1 second
PageSpeedTool.enableTimeout(3000); // start loading everything in 3 seconds
PageSpeedTool.disableTimeout();
```

### Enable cookie
Cookie TTL is 30 days.

```javascript
PageSpeedTool.enableCookie(); // use "pst_skip_delay" cookie as a marker of subsequent requests
PageSpeedTool.enableCookie("my_custom_cookie"); // use "my_custom_cookie" cookie as a marker of subsequent requests
```

### Defer arbitrary code
```javascript
PageSpeedTool.afterInit(async () => {
    do_something();
    return;
});
```