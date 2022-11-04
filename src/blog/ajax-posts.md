---
title: WordPress Posts Filter with Alpine.JS
description: How to build a filter posts by category feature with Alpine.JS in WordPress.
date: 2022-11-04
permalink: "wordpress/{{ page.fileSlug }}/index.html"
---


## What we're building

We'll build a feature for our WordPress theme to filter posts by category. This will happen asynchronously - so the browser won't reload as new posts appear. We'll use Alpine.JS on the front-end for fetching data and displaying new posts.

![Filter Posts by Category in WordPress](/images/posts-filter.png)

## Project structure

How you structure this is up to you, but I want to clearly present the parts involved in this project:

``` text
/theme-root
│
└─── /template-parts/posts-filter
│   │   template.php
│   │   single-post.php
│   │   default-query.php
|
└─── /javascript
│   │   post-filter.js
|
└─── /inc
│   │   query-posts.php
```

**/template-parts/posts-filter/**  
`template.php` will serve as our parent template. It's where we'll have most of our layout defined.

`single-post.php` will hold the markup for an individual blog post. If your theme already has a template partial for posts displayed in a grid than you can use that instead.

`default-query.php` will hold our post query and args for the intitial page load. We don't need JavaScript for this.

**/javascript/**  
`posts-filter.js` will hold our Alpine.JS component. It's responsible for handling the category drop down and "load more" button.

This guide assumes you understand how to enqueue JavaScript in WordPress. Whether you want to include Alpine.js via CDN or NPM is up to you. Hit those [docs](https://alpinejs.dev/essentials/installation){target="_blank"}!

**/inc/**  
`query-posts.php` will hold our post query and args for filtering and loading more posts. Our JavaScript will make requests to this file to receive back a list of blog posts.

We need to require this file from `functions.php`:

``` php
/**
 * API for querying posts
 */
require get_template_directory() . '/inc/query-posts.php';
```

---

## Base template and default state

Here's the skeleton of our base template. The wrapper div references an Alpine.js component called `filterPosts()`. We'll create that component later.

```html
<div 
    class="flex items-start gap-8 alignwide mt-32"
    x-data="filterPosts('<?php echo admin_url('admin-ajax.php'); ?>')">
    <!-- Category Filter Sidebar -->
    <aside class="w-1/4"></aside>

    <!-- Posts Column -->
    <div class="w-3/4"></div>
</div>
```

First, let's setup the default state for the posts column. The following code goes in `/template-parts/default-query.php`.

This is a simple query that returns ten blog posts and returns each post as our `/template-parts/posts-filter/post` template.

``` php
$query_args = array(
    'posts_per_page' => 10,
    'post_status' => 'publish',
    'post_type' => 'post'
);

$the_query = new WP_Query($query_args);

if ($the_query->have_posts()) :
    while ($the_query->have_posts()) : $the_query->the_post();
        get_template_part('template-parts/posts-filter/post');
    endwhile;
    wp_reset_postdata();
endif;
```

Inside of our posts column div lets call display the result of that query:

``` php
<!-- Posts Column -->
<div class="w-3/4">
    <!-- Default posts query -->
    <div class="grid grid-cols-2 gap-6">
        <?php get_template_part( 'template-parts/posts-filter/default-query' ); ?>
    </div>
</div>
```

This is what we've built so far:
1. A shell for our sidebar
2. A content area for posts
3. A defalt query that returns 10 posts w/o JavaScript

![Default Query](/images/default-query.png)

---

## Category Sidebar

Our filter won't work right away, but lets get our categories display as a list of buttons.

``` php
<!-- Category Filter Sidebar -->
<aside class="w-1/4">
    <p class="text-xl font-medium">Categories</p>
    <?php 
        $categories = get_categories();
        if ( ! empty( $categories ) ) : 
    ?>
    <ul class="list-none px-0">
        <?php foreach ( $categories as $category ) :
        
        // Skip "Uncategorized" category
        if ($category->name == 'Uncategorized') continue; ?>    

            <li class="hover:bg-slate-100 my-1 px-4 py-2 -ml-4 rounded-md">
                <button class="text-xl text-slate-800 w-full text-left">
                    <?= esc_html( $category->name ); ?>
                </button>
            </li>
        
        <?php endforeach; ?>
    </ul>
    <?php endif; ?>
</aside>
```

This gives us a list of categories in the sidebar:

![Category filter](/images/category-list.png)

--- 

## Filtering by category

Now we're getting into the complex stuff. Here's what we need to do:

1. Create an Alpine.js component to fetch posts
2. Create a dynamic instance of `WP_Query()` that Alpine.js will talk to
3. Intitiate a fetch when a category button is clicked.

### Alpine.js component

If you're new to Alpine.js, hit the [docs](https://alpinejs.dev/essentials/installation){target="_blank"} to learn how to install Alpine via NPM or just grab a link from the CDN.

In my example I've installed Alpine via NPM. That's why you see `import` and `Alpine.start()`. Ignore those if you're using the CDN.

``` js
import Alpine from 'alpinejs'


Alpine.data("filterPosts", (adminURL) => ({
	posts: null,
	category: null,
    touched: false,

	filterPosts(id) {
        this.touched = true;
        this.category = id;
		this.fetchPosts();
	},

	fetchPosts(category) {
		var formData = new FormData();
		formData.append("action", "filterPosts");
		formData.append("limit", this.limit);
		formData.append("offset", this.offset);

		if (this.category) {
			formData.append("category", category);
		}

		fetch(adminURL, {
			method: "POST",
			body: formData,
		})
        .then((res) => res.json())
        .then((res) => {
            this.posts = res.posts;
        });
	}
}));
 
window.Alpine = Alpine
Alpine.start()
```

Let's walk through this component:

``` js
posts: null,
category: null,
touched: false,
```

`posts`: will contain our post data that we receive back from WordPress.

`category`: will be the category ID from clicking a button in the sidebar.

`touched`: we need to track if the user has filtered posts or not. If `touched` is true, we'll hide the default posts and show the filtered ones.

``` js
filterPosts(id) {
    this.touched = true;
    this.category = id;
    this.fetchPosts();
},
```

`filterPosts(id)` takes in a category ID. It sets the current `category` to that ID and calls the `fetchPosts()` method.

``` js
fetchPosts(category) {
    var formData = new FormData();
    formData.append("action", "filterPosts");

    if (this.category) {
        formData.append("category", this.category);
    }

    fetch(adminURL, {
        method: "POST",
        body: formData,
    })
    .then((res) => res.json())
    .then((res) => {
        this.posts = res.posts;
    });
}
```

`fetchPosts(category)` is responsible for making an API call to WordPress. We give WordPress a category ID and we get back a list of blog posts. We can add data to our API call with `FormData()`.

Here we prep our form data:
``` js
var formData = new FormData();
```

Then we add to that data with a key/value pair:
``` js
formData.append("action", "filterPosts");
```

`action` is the key and `filterPosts` is the value. 

`filterPosts` is the name of a PHP function we'll create soon that handles the request made from our `fetchPosts()` method.

If there's a category ID set, we can add `category` as the key in our form data and the ID as the value.

``` js
if (this.category) {
    formData.append("category", this.category);
}
```

When `fetchPosts()` is called is tells WordPress:

1. Run the PHP function name `filterPosts`
1. And pass into that function a `category` from our category ID


### Query Posts API

Earlier you should have created `inc/query-posts.php` and required it in `functions.php`.

``` php
<?php
// the ajax function
add_action('wp_ajax_filterPosts', 'filterPosts');
add_action('wp_ajax_nopriv_filterPosts', 'filterPosts');

function filterPosts()
{
    $response = [
        'posts' => "",
    ];

    $filter_args = array(
        'posts_per_page' => 10,
        'post_status' => 'publish',
        'post_type' => 'post'
    );


    if ($_POST['category']) {
        $filter_args['cat'] = $_POST['category'];
    }

    $filter_query = new WP_Query($filter_args);

    if ($filter_query->have_posts()) :
        while ($filter_query->have_posts()) : $filter_query->the_post();
            $response['posts'] .= load_template_part('/template-parts/posts-filter/post');
        endwhile;
        wp_reset_postdata();
    endif;

    echo json_encode($response);
    die();
}
```

Let's break this down:

These two actions allow us to call the `filterPosts()` PHP function asynchronously on the front-end.
``` php
add_action('wp_ajax_filterPosts', 'filterPosts');
add_action('wp_ajax_nopriv_filterPosts', 'filterPosts');
```

Now we prep that response that holds our `posts`. It's in an array so that we can add more data to our reponse if we expand our code and add new features.
``` php
$response = [
    'posts' => "",
];
```

In order to query posts we need to pass in arguments. `$filter_args` is pretty standard and self explanatory. If our request contains a category ID (`$_POST['category']`), we add a category filter to our args.
``` php
$filter_args = array(
    'posts_per_page' => 10,
    'post_status' => 'publish',
    'post_type' => 'post'
);

if ($_POST['category']) {
    $filter_args['cat'] = $_POST['category'];
}
```

Finally, we loop our query and return our posts with the posts template.

``` php
$filter_query = new WP_Query($filter_args);

if ($filter_query->have_posts()) :
    $i = 1;
    while ($filter_query->have_posts()) : $filter_query->the_post();
        $response['posts'] .= load_template_part('/template-parts/posts-filter/post');
    endwhile;
    wp_reset_postdata();
endif;

echo json_encode($response);
die();
```

### Helper function for loading templates

WordPress has a `get_template_part()` function for returning a template in a loop, but this function doesn't allow us to save the response to our `$response['posts]` variable. 

The solution is to create a wrapper that allows to do just that:

You can create the `load_template_part()` function and place it in your `functions.php` or in another place that makes sense.
``` php
function load_template_part($template_name, $part_name = null, $args = [])
{
    ob_start();
    get_template_part($template_name, $part_name, $args);
    $var = ob_get_contents();
    ob_end_clean();
    return $var;
}
```

## Connecting Category Buttons to Alpine

When you click a category button, we need to call our `filterPosts(id)` method and pass in that category's ID.

Let's go back to the `<aside>` that holds our category buttons. We'll be updating the `<li>` and `<button>` in our loop.

``` php
<li :class="category == <?php echo $category->term_id; ?> ? 'bg-slate-100' : ''"
    class="hover:bg-slate-100 my-1 px-4 py-2 -ml-4 rounded-md">
    <button 
        @click="filterPosts(<?= $category->term_id; ?>)"
        class="text-xl text-slate-800 w-full text-left">
            <?= esc_html( $category->name ); ?></button>
</li>
```

We've made two changes:

1. Style the `<li>` if the category is active:
    ``` php
    :class="category == <?php echo $category->term_id; ?> ? 'bg-slate-100' : ''"
    ```
2. Call `filterPosts()` when the button is clicked
    ``` php
    @click="filterPosts(<?= $category->term_id; ?>)"
    ```

### Display the fitlered posts

Now let's display the filtered posts that we receieved:

``` php
<!-- Posts Column -->
<div class="w-3/4">
    <!-- Default posts query -->
    <div x-show.important="!touched" class="grid grid-cols-2 gap-6">
        <?php get_template_part( 'template-parts/posts-filter/default-query' ); ?>
    </div>

    <!-- Filtered posts -->
    <div x-show.important="touched" class="grid grid-cols-2 gap-6" x-html="posts"></div>
</div>
```

Changes we've made:

1. We've added `x-show.important="!touched"` to our default posts
2. We've added in our filtered posts


## Final result

Once we're done, we should be able to click a category in the sidebar to retrieve and display a filtered list of posts.

<div style="position: relative; padding-bottom: 61.32879045996593%; height: 0;"><iframe src="https://www.loom.com/embed/1d69642a8ec54a2e9231fe324143f1af" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>


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