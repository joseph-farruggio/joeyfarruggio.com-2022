---
title: How To Enable Core Block Features In ACF Blocks
description: Take advantage of the Core color picker, add margin and padding, or set custom borders on your ACF block.
date: 2022-10-06
permalink: "wordpress/{{ page.fileSlug }}/index.html"
hidden: true
---

## Create a more consistent editing experience
I was really excited when Elliot Codon launched ACF blocks back in 2019. However, I was concerned with the difference in the editing experience  when commingling ACF and Core blocks. I saw this in two ways: 

1. **The way you edit your content is different.** </br>Rich editing UIs for Core blocks and custom fields for ACF bocks.
1. **The UI for sidebar controls were completely different.** </br>ACF and Core blocks had very different UIs for controls. From color pickers to radio inputs, everything was different.

ACF blocks, and the block editor as a whole, have come a long way since then. We're getting closer to providing a better, more consistent editing experience. In a future guide I'll cover `<InnerBlocks>` and how we can insert Core blocks into a parent ACF block as children. This will help with addressing point #1 above, but in this guide I'll cover how to enable Core sidebar controls in your ACF block.

## Block Controls

We'll be enabling controls within our block's `block.json` file. <span class="hidden xl:inline">Feel free to use the table of contents to the right to jump around and learn about a block control that interests you.</span>

### Alignment
Alignment lets you side the width of your block or center it. Alignment should come enabled by default, but we'll set the pattern of defining our block's capabilities here.

``` json
{
    "name": "posts-loop",
    "title": "Posts Loop Block",
    ...
    "supports": {
        "align": true
    }
}
```

If you're using `theme.json`, we define our content width and our wide width under the `settings` object:

``` json
"settings": {
    "layout": {
        "contentSize": "50rem",
        "wideSize": "80rem"
    }
}
```

!["Alignment Settings"](/images/alignment-ui.jpg "Alignment Settings")

Both ACF and Core blocks use these alignment sizes and have corresponding classnames. If you set your block to the wide alignment, the classname would be `alignwide` while the full width alignment would be `alignfull`.

Here's how we access our block's alignment and apply the appropriate classname. From our block's render template: `template.php`

``` php
<?php
    // Block classes
    $className = 'posts-loop-block';
    if( !empty($block['className']) ) {
        $className .= ' ' . $block['className'];
    }

    // Block alignment
    if( !empty($block['align']) ) {
        $className .= ' align' . $block['align'];
    }
?>

<div id="<?= $block_id; ?>" class="<?= $className; ?>">
    ...
</div>
```

In your CSS, make sure you provide styles for your wide and full width classnames.

``` css
.alignwide {
	/* Styles for your wide width content */
}

.alignfull {
	/* Styles for your full width content */
}
```

### Text Alignment
!["Text alignment Settings"](/images/text-alignment-ui.jpg "Alignment Settings")

Enable the text alignment control in your block's block.json:

``` json
{
    "name": "posts-loop",
    "title": "Posts Loop Block",
    ...
    "supports": {
        ...
        "alignText": true
    }
}
```

And in your block's template, you can apply the appropriate text alignment classname:

``` php
// Block text alignment
if( !empty($block['alignText']) ) {
    $className .= ' has-text-align-' . $block['alignText'];
}
```

The classnames generated would be:

``` css
.has-text-align-left {
    text-align: left;
}

.has-text-align-center {
    text-align: center;
}

.has-text-align-right {
    text-align: right;
}
```

### Full hight + content alignment
Enable the full height control ACF blocks to create engaging content that stretches 100% of the browser's height with `fullHeight`.  

You can control the vertical alignment of the inner content with `alignContent: true` and gain even more control with `alignContent: 'matrix'`. The matrix setting allows you to align low your content to a quadrant of a 3x3 grid.

!["Full height and alignment Settings"](/images/full-height.jpg "Full height and alignment Settings")


``` json
{
    "name": "posts-loop",
    "title": "Posts Loop Block",
    ...
    "supports": {
        ...
        "fullHeight": true,
        "alignContent": true or "matrix"
    }
}
```

### Spacing
Achieve a bit more design flexibility with spacing controls and apply margin and padding to your ACF block.

``` json
{
    "name": "posts-loop",
    "title": "Posts Loop Block",
    ...
    "supports": {
        ...
        "spacing": {
            "margin": [
                "top",
                "bottom"
            ],
            "padding": true
        }
    }
}
```

For both margin and padding, you can specify where an editor can apply values (top,right,bottom,left) or simply just set it to true.

To access your spacing values in your template, you might want to create a helper function. Otherwise, things get a bit verbose and repetitive. In `functions.php` or `template-functions.php`, we'll create a helper function that accepts one parameter, our blocks styles:


``` php
if ( ! function_exists( 'get_block_styles' ) ) :
    function get_block_styles($attributes) {
        $styles = "";

        // Get our top, right, bottom, and left padding values
        if ( ! empty( $attributes['spacing']['padding'] ) ) {
            $paddingTop = $attributes['spacing']['padding']['top'] ? "padding-top: {$attributes['spacing']['padding']['top']};" : '';
            $paddingRight = $attributes['spacing']['padding']['right'] ? "padding-right: {$attributes['spacing']['padding']['right']};" : '';
            $paddingBottom = $attributes['spacing']['padding']['bottom'] ? "padding-bottom: {$attributes['spacing']['padding']['bottom']};" : '';
            $paddingLeft = $attributes['spacing']['padding']['left'] ? "padding-left: {$attributes['spacing']['padding']['left']};" : '';
            $styles .= "{$paddingTop}{$paddingRight}{$paddingBottom}{$paddingLeft}";
        }

        // Get our top, right, bottom, and left margin values
        if ( ! empty( $attributes['spacing']['margin'] ) ) {
            $marginTop = $attributes['spacing']['margin']['top'] ? "margin-top: {$attributes['spacing']['margin']['top']};" : '';
            $marginRight = $attributes['spacing']['margin']['right'] ? "margin-right: {$attributes['spacing']['margin']['right']};" : '';
            $marginBottom = $attributes['spacing']['margin']['bottom'] ? "margin-bottom: {$attributes['spacing']['margin']['bottom']};" : '';
            $marginLeft = $attributes['spacing']['margin']['left'] ? "margin-left: {$attributes['spacing']['margin']['left']};" : '';
            $styles .= "{$marginTop}{$marginRight}{$marginBottom}{$marginLeft}";
        }

        return $styles;
    }
endif;
```

Back in our block's render template:

``` php
<?php
    $blockStyles = get_block_styles($block['style']);
?>

<div 
    style="<?= $blockStyles; ?>"
    id="<?php echo $block_id; ?>" 
    class="<?php echo $className; ?>">
    ...
</div>
```

### Color Picker
By far my favorite control is the Core color picker. You can enable the color picker for the background of your block, the text color for its contents, and (for some reason) the color of links in your content.

``` json
{
    "name": "posts-loop",
    "title": "Posts Loop Block",
    ...
    "supports": {
        ...
        "color": {
            "background": true,
            "text": true,
            "link": false
        }
    }
}
```

!["Color Picker Settings"](/images/color-picker.jpg "Color Picker Settings")

Gutenberg generates a few classes for Core blocks with colors applied. If a Core block has a background class applied you'll get:

``` html
<div class="has-background has-{color_slug}-background-color">
    ...
</div>
```

If you apply text color you'll get:

``` html
<div class="has-text-color has-{color_slug}-color">
    ...
</div>
```

Let's bring these classes into your block template:

``` php
<?php
    // Set the background color classnames
    if ( ! empty( $block['backgroundColor'] ) ) {
        $className .= ' has-background';
        $className .= ' has-' . $block['backgroundColor'] . '-background-color';
    }

    // Set the text color classnames
    if ( ! empty( $block['textColor'] ) ) {
        $className .= ' has-text-color';
        $className .= ' has-' . $block['textColor'] . '-color';
    }
?>
```

The classnames `has-background` and `has-text-color` are really handy. There are times where you may want to globally apply styles to blocks that have a background color. One example might be group blocks. If a group block has a background color you can pretty much guarantee you'll want to apply padding. Otherwise the group's contents will sit on the edge of the background.

### Other controls

This isn't a full list of the controls available in the block API. Dig around in the [Block Editor Handbook](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/){target="_blank"} and you'll discover other controls and capabilities to bring into your block.

---

🤜 🤛 You did it!

If you've followed along, let me know how this went or if you have any questions.

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