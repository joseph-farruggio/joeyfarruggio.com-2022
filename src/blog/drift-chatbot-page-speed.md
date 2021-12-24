---
title: Drift Chat Bot – Optimize for Page Speed
description: How to optimize the Drift chat bot's page speed by delaying the execution of JavaScript 
date: 2020-07-01
hidden: true
permalink: "javascript/{{ page.fileSlug }}/index.html"
---

Update July 9th 2020: I’ve created a WP plugin called [Chatbot Lazy Loader](https://wordpress.org/plugins/chatbot-lazy-loader/) to handle the optimization of your chatbot. It even hit #2 on Product Hunt.

![chatbot page speed!](/images/chatbot-slide-1.png "chatbot page speed!")
<a href="https://www.producthunt.com/posts/chatbot-lazy-loader?utm_source=badge-top-post-badge&amp;utm_medium=badge&amp;utm_souce=badge-chatbot-lazy-loader" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=213951&amp;theme=light&amp;period=daily" alt="Chatbot Lazy Loader - Eliminate page speed issues caused by chatbots on WordPress | Product Hunt Embed" style="width: 250px; height: 54px;" width="250px" height="54px"></a>

When we’re considering JS dependent functionality, we need to weight its benefits against its costs. Chat bots are powerful support and lead gen tools, but like any JavaScript resource it adds weight to your web page, slows TTI, and delays other resources from loading.

We should also consider smarter ways of including our JavaScript. The easiest optimization to make is to only include JavaScript on the pages that require it. That’s simple enough, right? But with Chatbots, it’s less of a `page specific issue` and a `timed intent issue`.

So if you want to keep your Drift chat bot, but avoid the hit to your page speed, here’s how to optimize the way you include Drift’s JavaScript.

## Put your visitors first

Think of the way visitors are using your website. It’s a safe assumption to make that most visitors are not using a chatbot every time they view a page on your website. They are most likely going to hit an entry point, move through a flow, and at some point they may have a question that prompts them to use a chatbot.

So let’s not make them download that JavaScript when they don’t need it. Instead we can allow visitors to download that JavaScript on-demand, that is – only when they want to use the chatbot.


## Drift’s standard install instructions

When you create a Drift account, you’re given this JavaScript snippet with instructions to add it to the <head> of your website:

``` javascript
Inline Drift JavaScript
<!-- Start of Async Drift Code -->
<script>
"use strict";

!function() {
  var t = window.driftt = window.drift = window.driftt || [];
  if (!t.init) {
    if (t.invoked) return void (window.console && console.error && console.error("Drift snippet included twice."));
    t.invoked = !0, t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on" ], 
    t.factory = function(e) {
      return function() {
        var n = Array.prototype.slice.call(arguments);
        return n.unshift(e), t.push(n), t;
      };
    }, t.methods.forEach(function(e) {
      t[e] = t.factory(e);
    }), t.load = function(t) {
      var e = 3e5, n = Math.ceil(new Date() / e) * e, o = document.createElement("script");
      o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + n + "/" + t + ".js";
      var i = document.getElementsByTagName("script")[0];
      i.parentNode.insertBefore(o, i);
    };
  }
}();
drift.SNIPPET_VERSION = '0.3.1';
drift.load('hrypg4pnzn33');
</script>
<!-- End of Async Drift Code -->
```

I ran this inline Drift code trough Lighthouse on a simple page driftand this is what I got:

![chatbot page speed!](/images/drift-test-1.png "chatbot page speed!")

Not too impressive, especially since the the page is very thin and the rest of the site scores in the upper 90s/100.

So let’s see what we can do to improve things.

## Optimizing Drift for page speed
Instead of loading that JavaScript on every page, let’s only add the JavaScript when someone clicks a “Chat with us” button.

### Step 1 – Add Drift’s JavaScript as a function
``` javascript
Custom Drift JavaScript
function LoadDriftWidget(el) {
// Paste all of the JavaScript in here
}
```

Then, somewhere on your page add a button that, when clicked, calls the LoadDriftWidget() function.

``` html
An HTML Button
<button id="a-unique-id" onclick="LoadDriftWidget(this.id)">Let’s Chat</button>
Clicking that button will download the Drift JavaScript on-demand and then launch the chat widget. And this is great. It’s much better than what we had before.
```

But we can do better.

With that implementation, what happens when someone clicks the button?

1. You click the button
1. Wait a second or so
1. Chat bot appears

That’s fine if the chat bot appears very quickly, but if there’s even just a slight delay it may appear that the button is broken. What we want to do is give the visitor feedback so that they know that clicking the button worked and that the chat bot is loading.

### Step 2 – Provide feedback

The HTML button should have a unique ID. That’s easy enough to automate in JavaScript or PHP. And we’ll use that ID when the visitor clicks the button:

``` javascript
Adding a loading indicator
// Code to run when a Drift button is clicked
function LoadDriftWidget(el) {
    // Get the initial button text and store it for later
    var text = document.getElementById(el).innerText;

    // Change the button text to a loading indicator
    document.getElementById(el).innerText = "loading...";

    // ... the rest of the Drift JavaScript

    // Once Drift is loaded and ready
    drift.on('ready', function(api, payload) {
       // Reset the button text to its initial state
      document.getElementById(el).innerText = text;
    }

}
```

Now when someone clicks the button, the button text changes to “loading…” and as soon as the chatbot appears it changes back to its original state.

Again, much better. But I noticed one small hick up in this implementation. If someone were to click the chatbot a second time, after the script has already loaded, nothing happens. The Drift JavaScript has already been loaded, so there’s nothing we should expect this code to do.

### Step 3 – Launch the Drift sidebar
Drift has example JavaScript to interact with the chat widget. One of the features is the ability to programmatically open and close the sidebar widget.

So here’s how I changed the code to open the sidebar widget if the chat button was clicked two or more times:

``` javascript
Open Drift Sidebar Widget
// Initiate the counter
var i = 0;

// Code to run when a Drift button is clicked
function LoadDriftWidget(el) {
    // Increment the counter
    i++;
  
    // ... rest of the example JavaScript

    // Once Drift is loaded and ready
    drift.on('ready', function(api, payload) {
    
        // Reset the button text to its initial state
        document.getElementById(el).innerText = text;

        // If a Drift button is clicked more than once, open the chat sidebar
        // If this is not the first time the button was clicked, open the sidebar
        if (i >= 2) {
            api.sidebar.open();
        }
    });
});
```

I replaced the inline Drift implementation with our new optimized implementation:

![chatbot page speed!](/images/drift-test-2.png "chatbot page speed!")


Obviously that’s much better considering the fact that this was 3 minutes worth of work.

Here’s the final code in full:

``` javascript
Full Optimized Drift JavaScript
"use strict";

// Initiate the counter
var i = 0;

// Code to run when a Drift button is clicked
function LoadDriftWidget(el) {
  // Increment the counter
  i++;
  
  // Get the intial button text
  var text = document.getElementById(el).innerText;

  // Change the button text to a loading indicator
  document.getElementById(el).innerText = "loading...";
  

  // Start Drift Widget Code
  var t = window.driftt = window.drift = window.driftt || [];
  if (!t.init) {
    if (t.invoked) {
      api.sidebar.open()
      return void (window.console && console.error && console.error("Drift snippet included twice."));
    }
    t.invoked = !0, t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on" ], 
    t.factory = function(e) {
      return function() {
        var n = Array.prototype.slice.call(arguments);
        return n.unshift(e), t.push(n), t;
      };
    }, t.methods.forEach(function(e) {
      t[e] = t.factory(e);
    }), t.load = function(t) {
      var e = 3e5, n = Math.ceil(new Date() / e) * e, o = document.createElement("script");
      o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + n + "/" + t + ".js";
      var i = document.getElementsByTagName("script")[0];
      i.parentNode.insertBefore(o, i);
    };
  }
  
  drift.SNIPPET_VERSION = '0.3.1';
  // Add your own Drift ID here
  drift.load('XXXXXXXXXX');

  // Once Drift is loaded and ready
  drift.on('ready', function(api, payload) {
    
    // Reset the button text to its initial state
    document.getElementById(el).innerText = text;

    // If a Drift button is clicked more than once, open the chat sidebar
    if (i >= 2) {
      api.sidebar.open();
    }
  });
};
```