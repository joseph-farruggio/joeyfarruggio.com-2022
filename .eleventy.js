const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItAttrs = require('markdown-it-attrs');

module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "src/_images/*": "images" });
    eleventyConfig.addPassthroughCopy({ "src/_fonts/*": "fonts" }); 
    eleventyConfig.addPlugin(syntaxHighlight);
    
    let options = {
      // optional, these are default options
      html: true,
      leftDelimiter: '{',
      rightDelimiter: '}',
      allowedAttributes: []  // empty array = all attributes are allowed
    };

    let markdownLib = markdownIt(options).use(markdownItAttrs);

    eleventyConfig.setLibrary("md", markdownLib);

    eleventyConfig.addFilter("relativeURL", function(url) {
      return 'https://joseph-farruggio.github.io/joeyfarruggio.com-2022' + url;
    });

    // /* Markdown Overrides */
    // let markdownLibrary = markdownIt({
    //   html: true,
    //   breaks: true,
    //   linkify: true
    // }).use(markdownItAnchor, {
    //   permalink: true,
    //   permalinkClass: "direct-link",
    //   permalinkSymbol: "#"
    // });
    // eleventyConfig.setLibrary("md", markdownLibrary);
        

    // Alias `layout: post` to `layout: layouts/post.njk`
    // eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

    // function filterTagList(tags) {
    // return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
    // }

    // eleventyConfig.addFilter("filterTagList", filterTagList);

    // eleventyConfig.addCollection("blog", function(collection) {
    //     return collection.getFilteredByGlob("blog/*.md");
    // });

    // // Create an array of all tags
    // eleventyConfig.addCollection("tagList", function(collection) {
    //     let tagSet = new Set();
    //     collection.getAll().forEach(item => {
    //     (item.data.tags || []).forEach(tag => tagSet.add(tag));
    //     });

    //     return filterTagList([...tagSet]);
    // });

    eleventyConfig.addFilter("readableDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
    });
    
      // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
      eleventyConfig.addFilter('htmlDateString', (dateObj) => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
      });

    return {
        dir: {
            input: "src",
            output: "public"
        }
    };
};

