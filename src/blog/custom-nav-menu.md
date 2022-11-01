---
title: How to create a custom nav menu without a nav walker
description: If you need to control the markup of your nav menu, and want to avoid wp_nav_menu() and nav walkers, this is for you.
date: 2022-10-31
permalink: "wordpress/{{ page.fileSlug }}/index.html"

---

The traditional way of building a navigation menu in WordPress is to use `wp_nav_menu()`. This WordPress function returns your menu as simple HTML:

``` php
   wp_nav_menu( array(
      'menu' => 'Primary'
   ));
```

``` html
<div class="menu-primary-container">
   <ul id="menu-primary" class="menu">
      <li id="menu-item-5" class="menu-item menu-item-has-children menu-item-5">
         <a href="#">Menu Item A</a>
      </li>
      <li id="menu-item-8" class="menu-item menu-item-8">
         <a href="#">Menu Item B</a>
      </li>
   </ul>
</div>
```

You can pass in additional arguments to gain some control over the menu's markup. More about that [in the docs](https://developer.wordpress.org/reference/functions/wp_nav_menu/){target="_blank"}. 

Some options include:

1. Container - defaults to a `<div>`
1. Container class - in our case it's `menu-primary-container`
1. Items wrap - defaults to `<ul>`

There are a few more options, but beyond that we don't have much control over the markup. For many cases, `wp_nav_menu()` may be completely sufficient and I'd recommend using it if so.


## The problem
What if we wanted to build a nav menu with our own custom markup? Maybe our markup is too different from what is possible with `wp_nav_menu()`. Maybe we want to use a component library or our favorite CSS framework, like Tailwind CSS.

## Solutions
There are a couple ways to gain more control over our markup. The right solution for you depends on your needs and your own preferences. Ideally, we'll be able to just loop through our menu items as an array with the option of checking if the current menu item has children so that we can also control the markup of sub menus.

### Nav Walker
The `Walker_Nav_Menu` PHP Class allows you to modify the HTML that's returned from `wp_nav_menu()`. If gives you more flexibility than the arguments you pass directly into the function. Many people struggle with this Class. It's far from intuitive and it takes some time to get used to. It also doesn't let us simply loop over our menu items. Here's the gist of how it works though:

There are four primary methods you'll use to modify your menu's markup:

1. start_el — Modifies the start of an elements output  
1. end_el — Modifies the end of an elements output  
1. start_lvl — Modifies the list before the elements are added
1. end_lvl — Modidies the list of after the elements are added

We're going to pass on this solution for something simpler.

### Navi  
There's a Composer package called [Navi by @Log1x](https://github.com/Log1x/navi){target="_blank"}. This package handles all of the heavy lifting, giving you a clean array of menu items to loop through. With Navi, we can loop our nav menu like this:

``` php
<?php if ( $navigation->isNotEmpty() ) : ?>
   <ul>
      <?php foreach ( $navigation->toArray() as $item ) : ?>
         <li class="<?php echo $item->classes; ?> <?php echo $item->active ? 'current-item' : ''; ?>">
            <a href="<?php echo $item->url; ?>">
               <?php echo $item->label; ?>
            </a>
         </li>
      <?php endforeach; ?>
   </ul>
<?php endif; ?>
```

Navi also lets you check for sub menus too:

``` php
<?php if ( $item->children ) : ?>
   <ul>
      <?php foreach ( $item->children as $child ) : ?>
         <li class="<?php echo $child->classes; ?> <?php echo $child->active ? 'current-item' : ''; ?>">
            <a href="<?php echo $child->url; ?>">
               <?php echo $child->label; ?>
            </a>
         </li>
      <?php endforeach; ?>
   </ul>
<?php endif; ?>
```


### wp_get_nav_menu_items()  
`wp_get_nav_menu_items()` is a WordPress function that returns an array of your menu items. It's also what Navi uses under the hood. The problem is that it returns a single dimensional array. Child menu items are not nested under their parents in a `children[]` array. Instead, they reference their parent by ID. This makes it difficult to just loop over our menu. However, this is a great place start to build our own solution.

The rest of this guide will show you how to create a custom menu with `wp_get_nav_menu_items()`.


## Custom nav menu builder

We're going to wrap `wp_get_nav_menu_items()` inside of a new function that transforms the returned array into something that's loopable.

Here's what our function will do:

1. Retrieve our nav menu with `wp_get_nav_menu_items()`
1. Loop the menu items
1. Reassemble a new array while nesting children items inside their parent's `children` array

This is a simplified solution. The final array only includes the menu item's `ID`, `title`, `url`, and `children`. You may want to include the menu item's CSS ID and CSS class names along with other data avalailable from `wp_get_nav_menu_items()`.

``` php
function my_menu_builder($menu_id = '') {
	$menu = wp_get_nav_menu_items($menu_id);
	$new_menu = array();
	
	foreach ($menu as $item) {
		// If menu item has children
		if (menu_item_has_children($menu, $item->ID) != false) {
			$new_menu[] = [
				'ID' => $item->ID,
				'title' => $item->title,
				'url' => $item->url,
				'children' => []
			];
			continue;
		}

		// If menu item is a child
		if ($item->menu_item_parent != 0)  {
         /** 
          * Children menu items are preceeded by their parent.
          * That means we can safely assume the last menu item is the parent
          */
			$parent = array_key_last($new_menu);
			array_push($new_menu[$parent]['children'],
				[
					'ID' => $item->ID,
					'title' => $item->title,
					'url' => $item->url,
				]);
			continue;
		}

		// Just a normal menu item
		$new_menu[] = [
			'ID' => $item->ID,
			'title' => $item->title,
			'url' => $item->url,
		];

	}
	return $new_menu;
}
```

You may have noticed another custom function used in the above code sample: `menu_item_has_children()`.

This function checks if the menu item is a parent by searching the array of items for a matching `menu_item_parent` ID.

``` php
function menu_item_has_children($menu, $parent_id) {
	$parent_IDs = array_column($menu, 'menu_item_parent');
	$found_menu_items = array_search($parent_id, $parent_IDs);

	return $found_menu_items;
}
```

## Looping our new menu

With these two functions we can now loop our menu array and build our nav menu's markup. Let's build a nav menu using markup I get from [Tailwind UI](https://tailwindui.com/components/application-ui/navigation/navbars){target="_blank"}. We'll provide the JS functionality of the dropdown with Alpine.js. 

I'm going to simplify this markup and only include the desktop layout. I'll let you handle the mobile menu yourself.

Here's a quick scaffold of our nav menu component:
``` php
<!-- Outer Nav wrapper -->
<nav class="bg-gray-800">
   <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div class="relative flex h-16 items-center justify-between">
         <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div class="flex flex-shrink-0 items-center">
               <!-- Your Logo -->
               <img class="hidden h-8 w-auto lg:block" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company">
            </div>

            <!-- Desktop Menu -->
            <div class="hidden sm:ml-6 sm:block">
               <div class="flex space-x-4">
                  <!-- Menu loop goes here -->
               </div>
            </div>
         </div>
      </div>
   </div>
</nav>
```

Inside the placeholder for our menu loop, we'll include our use of our custom `my_menu_builder()` function. This might be something that we move into a partial so that our template doesn't become unweildy:

``` php
<?php
// Select our menu
$menu = custom_menu('primary');

// Set class names if the menu item is active
$menu_item_active_class = get_the_ID() == $item->ID ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
$sub_menu_item_active_class = get_the_ID() == $item->ID ? 'bg-gray-100 text-gray-900' : 'text-gray-700';

// Loop the menu
foreach ($menu as $item) :    
   // If menu item has children
   if (isset($item['children'])) : ?>
      <div x-data="{open: false}" class='relative inline-block text-left'>
         
         <!-- Parent Menu Item Button -->
         <div>
            <button type='button' @click='open = !open'
                  class='<?= $menu_item_active_class; ?> inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100'
                  id='menu-button' aria-expanded='true' aria-haspopup='true'>
                  <?= $item['title'] ?>

                  <svg class='-mr-1 ml-2 h-5 w-5' xmlns='http://www.w3.org/2000/svg'
                     viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
                     <path fill-rule='evenodd'
                        d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
                        clip-rule='evenodd' />
                  </svg>
            </button>
         </div>

         <!-- Child menu wrapper -->
         <div x-show='open' @click.away='open = false' x-transition
            class='absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
            role='menu' aria-orientation='vertical' aria-labelledby='menu-button' tabindex='-1'>
            <div class='py-1' role='none'>
               
               <!-- Loop child items -->
               <?php foreach ($item['children'] as $child) : ?>
                  <a href='<?= $child['url'] ?>'
                     class='<?= $sub_menu_item_active_class; ?> hover:bg-gray-100 block px-4 py-2 text-sm'
                     role='menuitem' tabindex='-1' id='menu-item-0'><?= $child['title'] ?></a>
               <?php endforeach; ?>

            </div>
         </div>
      </div>
   
   <?php else: ?>
      <!-- Non-parent Top Level Menu Item -->
      <a href='<?= $item['url'] ?>' class='<?= $menu_item_active_class; ?> px-3 py-2 rounded-md text-sm font-medium' aria-current='page'>
         <?= $item['title']; ?>
      </a>
   <?php endif; ?>

<?php endforeach;?>
```

![Tailwind Nav Menu](/images/tailwind-nav.jpg)

Each parent menu item is wrapped in a div with an Alpine x-data to manage the state of the dropdown: 

``` html
<div x-data="{open: false}">
   <div>
      <button type='button' @click='open = !open'>
         Parent Menu Item
      </button>
   </div>

   <div x-show='open' @click.away='open = false' x-transition>
      ... Sub menu contents
   </div>
</div>
```

Clicking the button toggles the state of `open` allowing the sub menu to be hidden/shown.

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