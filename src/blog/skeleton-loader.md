---
title: Skeleton Loader for AJAX Post Filter - Alpine.JS
description: Let your reader know something is loading by displaying a skeleton loader - a temporary UI to act as a placeholder for incoming content.
date: 2022-11-05
permalink: "wordpress/{{ page.fileSlug }}/index.html"
featuredImage: "/images/skeleton-loader.png"
---


## What we're building

In the last lesson we built a feature to [filter blog posts by category](/wordpress/posts-category-filter), but it's limited to the first 10 results. In this lesson, we'll add in a skeleton loader (a temporary loading UI) and a "Load More" button to fetch more posts.

![Filter Posts by Category in WordPress](/images/skeleton-loader.png)

---

## Simulate a delay from the server

If you're working on your local machine, you're probably not noticing much a delay when loading in new posts, but on a production server, there could be a slight delay for a number of reasons – your reader's internet speed being one of them. 

Lets simulate a 1.5 second delay from the server with a JavaScript `setTimeout()`.

Inside of your JavaScript, we'll wrap the `fetch()` method with a `setTimeout()`:

``` js
fetchPosts() {
    ...

    // Simulate delay from server
    setTimeout(() => ({
        fetch(adminURL, {
            method: "POST",
            body: formData,
        })
        .then((res) => res.json())
        .then((res) => {
            this.posts = res.posts;
        });
    }, 1500));
}
```

With that 1.5 second timeout, we should start to see what our post filter feature would look like in a production environment. There's a noticeable delay where there's not content at all until new posts appear:

<div style="position: relative; padding-bottom: 81.44796380090497%; height: 0;"><iframe src="https://www.loom.com/embed/835fde2b3c49405a87455f561d82d152" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

---

## The loading state

In order to display a skeleton loader, we need to know whether or not we're in a loading state.

1. When loading more posts, we'll set `loadingMore` to `true`. As soon as we get our posts, we'll set `loadingMore` to `false`.
1. When we change to a new category, we'll set `loadingNew` to `true` and later set it to `false` when we get our posts.

Let's add a `loadingNew` and `loadingMore` property to our Alpine component. They should both default to `false`.

``` js
Alpine.data("filterPosts", (adminURL) => ({
	posts: null,
	category: null,
    showDefault: true,
    showFiltered: false,
    loadingNew: false, // <--- defaults to false
    loadingMore: false, // <--- defaults to false

    ...
})
```

---

### Why two loading properties?

We're controlling the visibility of three sections:

1. The default posts
1. The dynamic posts
1. The skeleton loader

Having two loading properties helps us control the display of the default and filtered posts in four scenarios:

1. **Initial load**  
    Show the default posts (both loading states are false).
1. **Load new posts**  
    Still show the default posts while showing the skeleton loader with `loadingMore`
1. **Filter category**  
    Hide the default posts, show the skeleton loader with `loadingNew`, and then show the filtered posts.
1. **Filter category and then load new posts**  
    Hide the default posts, show the skeleton loader (both `loadingNew` and `loadingMore` equal true), and then show the filtered posts.

---

### Set the loading state

When changing categories, update `loadingNew` to true.
``` js
filterPosts(id) {
    this.loadingNew = true;
    ...
},
```

Create a new method called `loadMore()` and add it right after `filterPosts()`. When loading more posts, we'll update `loadingMore` to true.

``` js
loadMore() {
    this.loadingMore = true;
},
```

Once we've received our posts, reset both loading states to `false`:

``` js
fetchPosts(append = false) {
    ...

    fetch(adminURL, {
        method: "POST",
        body: formData,
    })
    .then((res) => res.json())
    .then((res) => {
        if (append) {
            this.posts = this.posts.concat(res.posts);
        } else {
            this.posts = res.posts;
        }

        // Reset both loading states
        this.loadingNew = false;
        this.loadingMore = false;
    });
},
```

---

## Skeleton Template

Let's update `template-parts/posts-filter/template.php` to include our skeleton loader template:

``` php
<!-- Posts Column -->
<div class="w-3/4">
    <!-- Default posts query -->
    <div x-show.important="showDefault" class="grid grid-cols-2 gap-6">
        <?php get_template_part( 'template-parts/posts-filter/default-query' ); ?>
    </div>

    <!-- Filtered posts -->
    <div x-show.important="showFiltered" class="grid grid-cols-2 gap-6" x-html="posts"></div>

    <!-- Skeleton Loader -->
    <template x-if="loadingNew || loadingMore">
        <div class="grid grid-cols-2 gap-6">
            <template x-for="i in 4">
                <div>
                    <div class="h-52 w-full bg-slate-200 rounded-lg"></div>
                    <div class="h-8 w-1/2 bg-slate-200 rounded-lg mt-4"></div>
                </div>
            </template>
        </div>
    </template>
</div>
```

There are a few things going on here worth mentioning:

1. We've added in a `<template>` tag to wrap our skelton UI:  

    The skeleton UI is displayed if either `loadNew` or `loadMore` are true.

1. We're using `x-if`  
    
    The difference between `x-show` and `x-if` is x-show hides elements with `display: none;` while x-if completely removes the markup from the DOM.

1. There's a second `<template>` to loop 4 iterations of a skeleton UI. This is the same as hardcoding 4 divs that look like a skeleton post. Looping it just makes it cleaner.

You should now have a functioning skeleton UI for the loading state:

<div style="position: relative; padding-bottom: 86.74698795180724%; height: 0;"><iframe src="https://www.loom.com/embed/c8a69d49aad043ff985525b51e9f1419" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

## Load More Button

A "Load More" button will allow readers to view more than the initial 10 posts. When the button is clicked, we'll append 10 new posts to the end of the list.

Let's add a button to the bottom of our posts column:

``` html
<!-- Posts Column -->
<div class="w-3/4">
    ...
    
    <!-- Load More Posts -->
    <div class="text-center mt-12">
        <button 
            @click="loadMore()" 
            class="bg-white border border-solid border-slate-200 hover:bg-slate-100 px-4 py-2">
            Load More</button>
    </div>
</div>
```

## Load more method in Alpine.JS

Our `loadMore()` method is responsible for loading 10 additional posts.

We don't want to load the same 10 posts again, but instead load the next 10 posts. To do this we'll pass an `offset` to `WP_Query` that increases by 10 every time we load new posts.


### Set a default offset
Add a new `offset` property to your Alpine component. It should default to zero:

``` js
Alpine.data("filterPosts", (adminURL) => ({
	posts: null,
	category: null,
    showDefault: true,
    showFiltered: false,
	loading: false,
    offset: 0,
```

When the Load More button is clicked, our `loadMore()` method will:

1. Set `loadingMore()` to true
1. Increase the `offset` by 10.
1. Set `showFiltered` to true - our dynamic posts only display if the reader requests posts by changing a category or loading more posts.
1. Call `fetchPosts(true)` with a new parameter for appending posts.

``` js
    ...

    loadMore() {
        this.loadingMore = true;
		this.offset += 10;
        this.showFiltered = true;
        this.fetchPosts(true);
	},

    ...
```

### Update `fetchPosts()` to support appending new posts

1. Add the new `append` parameter and default it to false.
1. Add `offset` to the form data.
1. Within `fetch()`, check if `append` is true and if so, append the new posts with `concat()`.

``` js
    ...

    // append defaults to false 
    fetchPosts(append = false) {
        var formData = new FormData();
        formData.append("action", "ajaxPosts");
		formData.append("offset", this.offset); // <-- Add new data to the form

        ...

        fetch(adminURL, {
            method: "POST",
            body: formData,
        })
        .then((res) => res.json())
        .then((res) => {
            if (append) {
                // Appends posts to the end of existing posts data
                this.posts = this.posts.concat(res.posts);
            } else {
                // Resets the posts data with new data
                this.posts = res.posts;
            }

            this.loading = false;
        });
    },
```

### Reset offset if changing categories

We need to reset the `offset` to zero if we change categories. Otherwise we'll load in the wrong set of posts for the new category selected.

``` js
filterPosts(id) {
    this.loadingNew = true;
    this.showFiltered = true;
    this.category = id;
    this.offset = 0; // <-- reset offset to zero
    this.fetchPosts();
},
```

## Final product

<div style="position: relative; padding-bottom: 73.46938775510203%; height: 0;"><iframe src="https://www.loom.com/embed/a62bf31a75ca48b2bd77d035b2495eaa" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>


<aside 
  x-data="visibleNavHighlighter" 
  x-on:scroll.window.throttle.50ms="onScroll()" 
  x-cloak>
  <div class="fixed mt-20 right-0 bottom-0 hidden w-64 overflow-y-auto py-8 px-6 md:top-[4rem] xl:block">
    <p class="text-base">In This Guide</p>
    <ul class="space-y-3 list-none m-0 p-0">
        <template x-for="heading in headings">
            <li class="text-base p-0" :class="if (heading.tagName.toLowerCase() === 'h3') { return 'ml-4' } else if (heading.tagName.toLowerCase() === 'h4') { return 'ml-8' }">
                <a :href="'#'+heading.id" class="no-underline" 
                :class="visibleHeadingId == heading.id ? 'font-medium text-orange-400 dark:text-orange-400' : 'text-slate-800 dark:text-white'" x-text="heading.innerText"></a>
            </li>
        </template>
    </ul>
  </div>
</aside>
