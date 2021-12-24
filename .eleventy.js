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

