const {DateTime} = require ("luxon"); 
const readingTime = require('eleventy-plugin-reading-time');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const editOnGithub = require('eleventy-plugin-edit-on-github');
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
module.exports = async function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("./src/style.css");
    eleventyConfig.addPassthroughCopy("./src/assets");
    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj)
        .toLocaleString(DateTime.DATE_HUGE)
    });
    eleventyConfig.setInputDirectory("src");
    eleventyConfig.setOutputDirectory("public");
    eleventyConfig.addPlugin(readingTime);
    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.addPlugin(editOnGithub, {
        // required
        github_edit_repo: 'https://github.com/avikjis27/avikjis27.github.io',
        // optional: defaults
        github_edit_path: undefined, // non-root location in git url. root is assumed
        github_edit_branch: 'main',
        github_edit_text: 'Edit on Github', // html accepted, or javascript function: (page) => { return page.inputPath}
        github_edit_class: 'edit-on-github',
        github_edit_tag: 'a',
        github_edit_attributes: 'target="_blank" rel="noopener"',
        github_edit_wrapper: undefined, //ex: "<div stuff>${edit_on_github}</div>"
      });
      eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// which file extensions to process
		extensions: "html",

		// Add any other Image utility options here:

		// optional, output image formats
		//formats: ["webp", "jpeg"],
		formats: ["auto"],

		// optional, attributes assigned on <img> override these values.
		defaultAttributes: {
			loading: "lazy",
			decoding: "async",
		},
	});
};