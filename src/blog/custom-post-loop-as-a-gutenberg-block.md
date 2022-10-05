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

What fields will our block will need to control an output of posts? Sometimes I like to start here because it gets me thinking about how I’m going to use the block. I know this block will interface with the WP_Query class, so a few fields immediately come to mind.

1. **Selection Type** <br/>Will we display the most recent posts or do we want to hand pick them?
2. **Category**  <br/>If we’re displaying the most recent posts, do we want to limit them to a specific category?
3. **Limit**  <br/>If we’re displaying the most recent posts, do we want to set a limit for how many are returned?
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
│   └─── /posts-block
│       │   block.json
│       │   block.php
│       │   template.php
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
`/blocks/posts-block/block.php` will serve as the *model / controller* for our block. It’s where we’ll handle all of the data that gets passed into the render template or the *view*. This helps keep things clean and organized so our logic is one place (block.php) and our front-end template (template.php) is in another.

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
 * @param array $block contains attributes and data for the block coming from Gutenberg
 * @param boolean $is_preview whether the block is in the preview state (the Gutenberg editor) or not (the front-end)
 * @param integer $post_id the post id of the post that the block is in
 * @param array $data is what we're going to expose to our render template
 */ 

get_template_part(
	'blocks/posts-loop/template',
	null,
	array(
		'block'      => $block,
		'is_preview' => $is_preview,
		'post_id'    => $post_id,
		'data'       => $data,
	)
);
```

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

// Check for custom block ID
if( !empty($block['anchor']) ) {
    $block_id = $block['anchor'];
}

// Block classes
$className = 'posts-loop-block';
if( !empty($block['className']) ) {
    $className .= ' ' . $block['className'];
}
?>

<!-- Our front-end template to loop the posts -->
<div id="<?php echo $block_id; ?>" class="<?php echo $className; ?>">
    <?php
    if( $data['posts']->have_posts() ) {
        while( $data['posts']->have_posts() ) {
            $data['posts']->the_post();
            ?>
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

Within our render template, our block attributes, such as the block’s ID or classnames, are found in `$args['block']`. Our block data, fields we specified in `blocks/posts-loop/block.php`, are found in `$args[’data’]`.

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

---

🤜 🤛 You did it!

If you've followed along, let me know how this went or if you have any questions.

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