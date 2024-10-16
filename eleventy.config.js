const {DateTime} = require ("luxon"); 
module.exports = async function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("./src/style.css");
    eleventyConfig.addPassthroughCopy("./src/assets");
    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj)
        .toLocaleString(DateTime.DATETIME_MED)
    });
    eleventyConfig.setInputDirectory("src");
    eleventyConfig.setOutputDirectory("public");
};