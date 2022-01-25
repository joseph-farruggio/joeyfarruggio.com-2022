const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItAttrs = require('markdown-it-attrs');
var ghpages = require('gh-pages');
var fs = require('fs');

const sitemap = require("@quasibit/eleventy-plugin-sitemap");

fs.writeFile('public/CNAME', "joeyfarruggio.com", function (err) { });
ghpages.publish('public', function (err) { });

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/_images/*": "images" });
  eleventyConfig.addPassthroughCopy({ "src/_fonts/*": "fonts" });
  eleventyConfig.addPassthroughCopy({ "src/css/*": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js/*": "js" });
  eleventyConfig.addPassthroughCopy({ "node_modules/@builder.io/partytown/lib": "/~partytown" });

  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: "https://joeyfarruggio.com",
    },
  });

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
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  return {
    dir: {
      input: "src",
      output: "public",
      data: "_data"
    }
  };
};

