module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "src/_images/*": "images" });
    eleventyConfig.addPassthroughCopy({ "src/_fonts/*": "fonts" }); 

    return {
        dir: {
            input: "src",
            output: "public"
        }
    };
};

