---
title: How to Register Blocks with ACF and block.json
description: Let's set the ground work and scaffold our first ACF block.
date: 2022-10-09
permalink: "lessons/{{ page.fileSlug }}/index.html"
---

## Steps in this guide: {#ignore-toc .ignore-toc x-intersect:enter="$store.showToc = false" x-intersect:leave="$store.showToc = true"}

1. [Register our blocks with block.json](#register-block)
1. [Handle our block data](#block-data)
1. [Create the block render template](#render-template)
1. [Using the block](#using-block)

## Register the block {#register-block}

Since WP 6.0, the recommended way of registering blocks is [via block.json](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/). This is a big deal, because keeping our ACF blocks as close to Core as possible allows us to take advantage of many native block features.

You can register blocks from a plugin or your theme. For simplicity, and to make this guide more accessible to beginners, I’ll be doing this directly in my theme. Go ahead and stub out the following structure:

``` text
/theme-root
│
└─── /blocks
│   │   register-blocks.php
│   │
│   └─── /my-first-block
│       │   block.json
│       │   block.php
│       │   template.php
```

In `/blocks/my-first/block.json`, we'll configure our block. The JSON example below is just about the bare minimum you need to register a block.

``` json
{
    "name": "my-first-block",
    "title": "My First Block",
    "description": "Displays my very first ACF block.",
    "category": "theme",
    "apiVersion": 2,
    "acf": {
        "mode": "preview",
        "renderTemplate": "blocks/my-first-block/block.php"
    },
    "supports": {
        "anchor": true
    }
}
```

Inside of `/blocks/register-blocks.php`, we’ll include the path to our block’s json file. This is where we’ll register all future blocks:

``` php
register_block_type( get_template_directory() . '/blocks/my-first-block/block.json' );
```

In your `functions.php` you can include the path to `/blocks/register-blocks.php.`.

``` php
/**
 * Register ACF Blocks
 */
require get_template_directory() . '/blocks/register-blocks.php';
```


Just to recap what's going on:

Our `function.php` file includes our `/blocks/register-blocks.php` file. `/blocks/register-blocks.php` will be where we register all of our future blocks by pointing to each block's block.json.

## Handle our block data {#block-data}
`/blocks/my-first-block/block.php` will serve as the *model / controller* for our block. It’s where we’ll handle all of the data that gets passed into the render template. This helps keep things clean and organized so our logic is in one place (block.php) and our front-end template (template.php) is in another.


``` php
<?php
/**
 * My First Block
 */

// $data is what we're going to expose to our render template
$data = array(
	'example_field' => get_field( 'example_field' ),
    'another_field' => get_field( 'another_field' )
);

// Dynamic block ID
$block_id = 'my-first-block-' . $block['id'];

// Check if a custom ID is set in the block editor
if( !empty($block['anchor']) ) {
    $block_id = $block['anchor'];
}

// Block classes
$class_name = 'my-first-block';
if( !empty($block['class_name']) ) {
    $class_name .= ' ' . $block['class_name'];
}

/** 
 * Pass the block data into the template part
 */ 
get_template_part(
	'blocks/my-first-block/template',
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
Now we can create the block’s render template: `/blocks/my-first-block/template.php`.

``` php
<?php
/**
 * Block Name: My First Block
 *
 * Description: Displays my very first block.
 */

// The block attributes
$block = $args['block'];

// The block data
$data = $args['data'];

// The block ID
$block_id = $args['block_id'];

// The block class names
$class_name = $args['class_name'];
?>

<!-- Our front-end template -->
<div id="<?php echo $block_id; ?>" class="<?php echo $class_name; ?>">
    <?php
        if ( $data['example_field']) {
            echo "<p>" . $data['example_field'] . "</p>";
        }

        if ( $data['another_field']) {
            echo "<p>" . $data['another_field'] . "</p>";
        }
    ?>
</div>
```

All of the data exposed to our block's render template is found in the `$args` variable.