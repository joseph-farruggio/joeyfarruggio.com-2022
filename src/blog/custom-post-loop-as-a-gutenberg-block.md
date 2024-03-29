---
title: 5-Step Guide To Creating a Posts Loop Block in Gutenberg with ACF and block.json
description: Build a custom block to loop through your WordPress blog posts with Advanced Custom Fields and block.json.
date: 2022-10-05
permalink: "wordpress/{{ page.fileSlug }}/index.html"
---

> This post was updated on October, 5th 2022 to reflect changes in how we register blocks in WordPress 6.0 and Advanced Custom Fields 6.0.

## Steps in this guide: {#ignore-toc .ignore-toc x-intersect:enter="$store.showToc = false" x-intersect:leave="$store.showToc = true"}

1. [Creating our fields](#create-fields)
1. [Register our blocks with block.json](#register-block)
1. [Handle our block data](#block-data)
1. [Create the block render template](#render-template)
1. [Using the block](#using-block)

## Creating our fields {#create-fields}

Sometimes I like to start with creating my field groups because it gets me thinking about how I’m going to use the block. I know this block will interface with the [WP_Query](https://developer.wordpress.org/reference/classes/wp_query/){target="_blank"} class, so a few fields immediately come to mind.

1. **Selection Type** <br/>We should be able to display the most recent posts or hand pick them.
2. **Category**  <br/>If we’re displaying the most recent posts, we should be able to limit them to a specific category.
3. **Limit**  <br/>If we’re displaying the most recent posts, we should be able to set a limit for how many are returned.
4. **Select Posts**  <br/>If we choose "select posts", we'll want a relationship field to hand pick our posts from a list.

!["Field Group"](/images/block-guide-field-group.jpg "Creating the block's field group")

The `Category` and `Limit` fields are conditionally displayed if the `Selection Type` is "recent". Likewise, the `Select Posts` field is only displayed if the `Selection type` is "select posts".

Want to import this field group into ACF Pro? [Get the JSON](https://gist.github.com/joseph-farruggio/72c69968b23c6701932af84690516240){target="_blank"} – Once you've imported the JSON into ACF, make sure to update the location rules to match your block name after you register your block.


## Register the block {#register-block}

Since WP 6.0, the recommended way of registering blocks is [via block.json](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/). This is a big deal, because keeping our ACF blocks as close to core as possible allows us to take advantage of many native block features.

You can register blocks from a plugin or your theme. For simplicity, and to make this guide more accessible to beginners, I’ll be doing this directly in my theme. Go ahead and stub out the following structure:

``` text
/theme-root
│
└─── /blocks
│   │   register-blocks.php
│   │
│   └─── /posts-loop
│       │   block.json
│       │   block.php
│       │   template.php
```

In `/blocks/posts-loop/block.json`, we'll configure our block:

``` json
{
    "name": "posts-loop",
    "title": "Posts Loop Block",
    "description": "Displays a list of posts.",
    "category": "theme",
    "apiVersion": 2,
    "keywords": [
        "posts",
        "blog"
    ],
    "acf": {
        "mode": "preview",
        "renderTemplate": "blocks/posts-loop/block.php"
    },
    "supports": {
        "anchor": true
    }
}
```

Inside of `/blocks/register-blocks.php`, we’ll include the path to our block’s json file. This is where we’ll register all of our future blocks:

``` php
register_block_type( get_template_directory() . '/blocks/posts-loop/block.json' );
```

In your `functions.php` you can include the path to `/blocks/register-blocks.php.`

``` php
/**
 * Register ACF Blocks
 */
require get_template_directory() . '/blocks/register-blocks.php';
```

## Handle our block data {#block-data}
`/blocks/posts-loop/block.php` will serve as the *model / controller* for our block. It’s where we’ll handle all of the data that gets passed into the render template or the *view*. This helps keep things clean and organized so our logic is one place (block.php) and our front-end template (template.php) is in another.

Make sure to read the comments in the code sample to understand what's happening:

``` php
<?php
/**
 * Posts Loop Block
 */

// $data is what we're going to expose to our render template
$data = array(
	'selection_type' => get_field( 'selection_type' ),
	'category' => get_field( 'category' ),
	'limit' => get_field( 'limit' ),
	'select_posts' => get_field('select_posts')
);

// Dynamic block ID
$block_id = 'posts-loop-block-' . $block['id'];

// Check if a custom ID is set in the block editor
if( !empty($block['anchor']) ) {
    $block_id = $block['anchor'];
}

// Block classes
$class_name = 'posts-loop-block';
if( !empty($block['class_name']) ) {
    $class_name .= ' ' . $block['class_name'];
}

// WP Query Args
$queryArgs = array(
    'post_type' => 'post',
);

// If the selection type is "recent", check  for categories and limit
if ( $data['selection_type'] == 'recent' ) {
    $queryArgs['category__in'] = $data['category'];
    $queryArgs['posts_per_page'] = $data['limit'];
}

// If the selection type is "select", pass in the selected post IDs
if ( $data['selection_type'] == 'select' ) {
    $queryArgs['post__in'] = $data['select_posts'];
}

// Create a new WP_Query instance
$posts = new WP_Query( $queryArgs );

// Expose the response of WP_Query to the render template
$data['posts'] = $posts;

/** 
 * Pass the block data into the template part
 */ 

get_template_part(
	'blocks/posts-loop/template',
	null,
	array(
		'block'      => $block,
		'is_preview' => $is_preview,
		'post_id'    => $post_id,

		'data'       => $data,
        'class_name' => $class_name,
        'block_id'   => $block_id,
	)
);
```

`$block`, `$is_preview`, and `$post_id` are variables given to us by the block registration API.

**$block**  
Contains all of the attributes of our block from the block API. We have access to the block's name, description, ID, class names, and many other attributes that come from the block editor.

**$is_preview**  
Either `true` or `false` – it tells us whether the block is currently being viewed in the block editor (`true`) or the front-end (`false`).

**$post_id**  
The ID of the post or page that the block is being viewed on.

The other three variables, `$data`, `$class_name`, and `$block_id` are variables that we have defined ourselves.

## Create the block render template {#render-template}
Now we can create the block’s render template: `/blocks/posts-loop/template.php`.

``` php
<?php
/**
 * Block Name: Posts Loop Block
 *
 * Description: Displays a list of posts.
 */

// The block attributes
$block = $args['block'];

// The block data
$data = $args['data'];

// Dynamic block ID
$block_id = 'posts-loop-block-' . $block['id'];

// The block ID
$block_id = $args['block_id'];

// The block class names
$class_name = $args['class_name'];
?>


<div id="<?php echo $block_id; ?>" class="<?php echo $class_name; ?>">
    <!-- Our front-end template to loop the posts -->
    <?php
    if( $data['posts']->have_posts() ) {
        while( $data['posts']->have_posts() ) {
            $data['posts']->the_post(); ?>
            <div class="post">
                <h2><?php the_title(); ?></h2>
                <div class="post-content">
                    <?php the_excerpt(); ?>
                </div>
            </div>
            <?php
        }
    }
    ?>
</div>
```

All of the data exposed to our block's render template is found in the `$args` variable.

The response of WP_Query is exposed to this render template in `$data['posts']`. This is because of the work we did in `/blocks/posts-loop/block.php`. Here's the line specifically:

``` php
// Create a new WP_Query instance
$posts = new WP_Query( $queryArgs );

// Expose the response of WP_Query to the render template
$data['posts'] = $posts;
```

## Using the block {#using-block}
!["Block backend UI"](/images/block-guide-editor.jpg "Using the block in the editor")

This is what our block looks like when we insert it into the editor. The block's preview is on the left in the content column and our block's fields are in the right sidebar.

!["Block backend UI - Select Posts"](/images/block-guide-select-posts.jpg "Using the block in the editor to select posts")

If I change the "Selection Type" from `Recent` to `Select posts` I'll be able to use the "Select Posts" relationship field.

<aside 
  x-data="visibleNavHighlighter" 
  x-on:scroll.window.throttle.50ms="onScroll()" 
  x-show.important="$store.showToc"
  x-transition.opacity
  x-cloak>
  <div class="fixed mt-20 right-0 bottom-0 hidden w-64 overflow-y-auto py-8 px-6 md:top-[4rem] xl:block">
    <p class="text-base">In This Guide</p>
    <ul class="space-y-3 list-none m-0 p-0">
        <template x-for="heading in headings">
            <li class="text-base p-0">
                <a :href="'#'+heading.id" class="no-underline" 
                :class="visibleHeadingId == heading.id ? 'font-medium text-orange-400 dark:text-orange-400' : 'text-slate-800 dark:text-white'" x-text="heading.innerText"></a>
            </li>
        </template>
    </ul>
  </div>
</aside>