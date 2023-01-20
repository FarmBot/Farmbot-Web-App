"use strict";
/**
 *
 * Web App translation file helper
 *   This script gathers translatable phrases from the web app and adds them
 *   to translation files. It also organizes and sorts existing translation
 *   files and generates the `translation_metrics.md` file.
 *
 *
 * Run via: `node _helper.js en`, where "en" is the desired language code.
 *
 *
 * IMPORTANT DEVELOPER NOTE:
 *   Edit `_helper.ts` and generate `_helper.js` via `npx tsc _helper.ts`.
 *   Do not edit `_helper.js` directly; any changes will be overwritten.
 *
 *
 * */
exports.__esModule = true;
exports.ATTENTION = void 0;
exports.ATTENTION = "Run `_helper.js`, not `_helper.ts`.";
var path_1 = require("path");
var fs_1 = require("fs");
/**
 * Build a list of all the files that are children of a directory.
 * @param dir The directory to search.
 * @param fileList The list of directories/files already detected.
 * @param ext A list of file extensions to filter the files.
 */
function walkSync(dir, fileList, extensions) {
    var files = (0, fs_1.readdirSync)(dir);
    files.map(function (file) {
        if ((0, fs_1.statSync)((0, path_1.join)(dir, file)).isDirectory()) {
            fileList = walkSync((0, path_1.join)(dir, file), fileList, extensions);
        }
        else {
            if (extensions.some(function (ext) { return file.endsWith(ext); })) {
                fileList.push((0, path_1.join)(dir, file));
            }
        }
    });
    return fileList;
}
/**
 * Search for phrases in the file using the provided regex.
 */
function searchInFile(path, regex) {
    // load the file
    var fileContent = (0, fs_1.readFileSync)(path, "utf8");
    var strArray = [];
    // match all the groups
    var match = regex.exec(fileContent);
    while (match != undefined) {
        strArray.push(match[1].replace(/\s+/g, " "));
        match = regex.exec(fileContent);
    }
    return strArray;
}
/** Locale-aware sort */
function localeSort(a, b) { return a.localeCompare(b); }
// '.t("")' or '{t("")' or ' t("")' or '(t("")' or '[t("")'
// '.t(``)' or '{t(``)' or ' t(``)' or '(t(``)' or '[t(``)'
// Also finds ' t("some {{data}}", \n {data})'
var T_REGEX = /[.{[(\s]t\(["`]([\w\s{}().,:'\-=\\?/%!]*)["`],*\s*.*\)/g;
// '``'
var C_REGEX = /[`]([\w\s{}().,*:'\-=/\\?"+!]*)[`].*/g;
/** Some additional phrases the regex can't find. */
var EXTRA_TAGS = [
    "Fun", "Warn", "Map Points", "Row Spacing", "Height", "Taxon",
    "Growing Degree Days", "Svg Icon", "Invalid date",
    "Sequence Editor", "Commands", "back to sequences",
    "SYNC NOW", "Run", "SYNCING", "SYNCED", "UNKNOWN",
    "Else Execute", "Connecting FarmBot to the Internet", "move to home",
    "emergency stop", "SYNC ERROR", "inactive", "error", "No messages.",
    "Verify Password", "Camera Calibration", "Installing FarmBot OS",
    "For IT Security Professionals", "visualize", "{{ axis }}-axis profile",
    "Using another device, search for and connect to the `farmbot-xxxx` WiFi network",
    "GROUP MEMBERS ({{count}})", "FarmBot's current position", "# of plants",
    "Binomial Name", "Common Names", "Sun Requirements", "Sowing Method",
];
/** For debugging. Replace all characters except whitespace and {{ words }}. */
function repl(string, character) {
    var parts = string.split("{{");
    if (parts.length < 2) {
        return string.replace(/\S/g, character);
    }
    var insideAndAfter = parts[1].split("}}");
    var before = parts[0].replace(/\S/g, character);
    var inside = insideAndAfter[0];
    var after = insideAndAfter[1].replace(/\S/g, character);
    var firstPart = [before, inside].join("{{");
    return [firstPart, after].join("}}");
}
/**
 * For debugging. Replace all translations with a debug string.
 * Example usage: `node _helper.js xx _ n`
 */
function replaceWithDebugString(key, debugString, debugStringOption) {
    var debugChar = debugString[0];
    switch (debugStringOption) {
        case "r": return debugString; // replace with: string as provided
        case "s": return debugChar; // single character
        case "n": return repl(key, debugChar); // maintain whitespace
        case "l": return debugChar.repeat(key.length); // replace whitespace
        default: return key;
    }
}
/** Generate translation summary data for all languages. */
function generateMetrics() {
    var languageCodes = walkSync(__dirname, [], [".json"])
        .filter(function (s) { return !s.includes("metrics.json"); })
        .filter(function (s) { return !s.includes("en.json"); })
        .map(function (s) { return s.slice(-"en.json".length, -".json".length); });
    var metrics = [];
    languageCodes.map(function (lang) {
        var summaryData = Helper.createOrUpdateTranslationFile(lang, true);
        summaryData && metrics.push(summaryData);
    });
    // console.log(metrics);
    // const jsonMetrics = JSON.stringify(metrics, undefined, 2);
    // writeFileSync(pathJoin(__dirname, "metrics.json"), jsonMetrics);
    var markdown = "";
    markdown += "# Translation summary\n\n";
    markdown += "_This summary was automatically generated by running the";
    markdown += " language helper._\n\n";
    markdown += "Auto-sort and generate translation file contents using:\n\n";
    markdown += "```bash\nnode public/app-resources/languages/_helper.js en\n```\n\n";
    markdown += "Where `en` is your language code.\n\n";
    markdown += "Translation file format can be checked using:\n\n";
    markdown += "```bash\nnpm run translation-check\n```\n\n";
    markdown += "_Note: If using Docker, add `sudo docker compose run web`";
    markdown += " before the commands.\nFor example, `sudo docker compose";
    markdown += " run web npm run translation-check`._\n\n";
    markdown += "See the [README](https://github.com/FarmBot/Farmbot-Web-App";
    markdown += "#translating-the-web-app) for contribution instructions.\n\n";
    markdown += "Total number of phrases identified by the language helper";
    markdown += " for translation: __" + metrics[0].current + "__\n\n";
    markdown += "|Language|Percent translated";
    markdown += "|Translated|Untranslated|Other Translations|\n";
    markdown += "|:---:|---:|---:|---:|---:|\n";
    metrics.map(function (langMetrics) {
        markdown += "|" + langMetrics.language;
        markdown += "|" + langMetrics.percent + "%";
        markdown += "|" + langMetrics.translated;
        markdown += "|" + langMetrics.untranslated;
        markdown += "|" + langMetrics.orphans;
        markdown += "|\n";
    });
    markdown += "\n**Percent translated** refers to the percent of phrases";
    markdown += " identified by the\nlanguage helper that have been";
    markdown += " translated. Additional phrases not identified\n";
    markdown += "by the language helper may exist in the Web App.\n\n";
    markdown += "\n**Untranslated** includes phrases not yet translated";
    markdown += " or phrases that do not\nneed translation. Phrases that are";
    markdown += " identical before and after translation\ncan be moved to";
    markdown += " `translated` to indicate translation status to the language";
    markdown += "\nhelper.\n\n";
    markdown += "**Other Translations** include translated phrases";
    markdown += " that do not match any of\nthe phrases identified by the";
    markdown += " language helper. These are usually phrases\nnot identified";
    markdown += " by the language helper or phrases that have been changed";
    markdown += "\nor removed from the Web App.";
    markdown += "\n";
    (0, fs_1.writeFileSync)((0, path_1.join)(__dirname, "translation_metrics.md"), markdown);
}
/** Print some translation file metrics. */
function generateSummary(args) {
    var current = Object.keys(args.foundTags).length;
    var orphans = Object.keys(args.unmatchedTags).length;
    var untranslated = Object.keys(args.untranslated).length;
    var translated = Object.keys(args.translated).length;
    var total = untranslated + translated + orphans;
    var percent = Math.round(translated / current * 100);
    var existingUntranslated = args.countExisting - translated;
    if (!args.metricsOnly) {
        console.log("".concat(current, " strings found."));
        console.log("  ".concat(args.countExisting, " existing items match."));
        console.log("    ".concat(translated, " existing translations match."));
        console.log("    ".concat(existingUntranslated, " existing untranslated items."));
        console.log("  ".concat(current - args.countExisting, " new items added."));
        console.log("".concat(percent, "% of found strings translated."));
        console.log("".concat(orphans, " unused, outdated, or extra items."));
        console.log("Updated file '".concat(args.langCode, ".js' with ").concat(total, " items."));
    }
    return {
        percent: percent, orphans: orphans, total: total, untranslated: untranslated,
        current: current, translated: translated, language: args.langCode
    };
}
var Helper;
(function (Helper) {
    /** Get all the tags in the .ts and .tsx files of the current project */
    function getAllTags() {
        var srcPath = (0, path_1.join)(__dirname, "../../../frontend");
        var listFilteredFiles = walkSync(srcPath, [], [".ts", ".tsx"]);
        var allTags = listFilteredFiles.map(function (x) { return searchInFile(x, T_REGEX); });
        var constantsTags = searchInFile((0, path_1.join)(srcPath, "constants.ts"), C_REGEX);
        // flatten list of list in a simple list
        var flatAllTags = allTags.flat();
        var flatConstantsTags = constantsTags.flat();
        var flatExtraTags = EXTRA_TAGS.flat();
        var flattenedTags = [flatAllTags, flatConstantsTags, flatExtraTags].flat();
        // distinct
        var uniq = Array.from(new Set(flattenedTags));
        var sorted = uniq.sort(localeSort);
        return sorted;
    }
    Helper.getAllTags = getAllTags;
    /** For debugging */
    function logAllTags() {
        console.dir(getAllTags());
    }
    Helper.logAllTags = logAllTags;
    /**
     * Create the translation file or update it with new tags.
     * The tags are in the following order:
     * 1. New tags in English that need to be translated (ASC)
     * 2. Tags already translated that match an existing tag in src (ASC)
     * 3. Tags already in the file before but not found at the moment in src (ASC)
     * @param  langInput The short name of the language, i.e., `en`.
     */
    // eslint-disable-next-line complexity
    function createOrUpdateTranslationFile(langInput, metricsOnly) {
        if (langInput === void 0) { langInput = "en"; }
        var lang = langInput.slice(0, 2);
        // check current file entry
        var langFilePath = (0, path_1.join)(__dirname, "".concat(lang, ".json"));
        var summaryData = undefined;
        try {
            var tagsResult = getAllTags();
            var jsonCurrentTagData_1 = {};
            tagsResult.map(function (tag) {
                jsonCurrentTagData_1[tag] = tag;
            });
            var ordered_1 = {};
            var translatedKeys_1 = [];
            var fileContent = void 0;
            try {
                // check the file can be opened
                (0, fs_1.statSync)(langFilePath);
                // load the file
                fileContent = (0, fs_1.readFileSync)(langFilePath, "utf8");
                if (lang == "en") {
                    console.log("Current file '".concat(lang, ".json' content: "));
                    console.log(fileContent);
                    console.log("Try entering a language code.");
                    console.log("For example: node _helper.js en");
                    return;
                }
            }
            catch (e) {
                if (!metricsOnly) {
                    console.log("New file created: '".concat(lang, ".json'"));
                }
                // If there is no current file, we will create it.
            }
            try {
                if (fileContent != undefined) {
                    var jsonParsed = JSON.parse(fileContent);
                    translatedKeys_1.push.apply(translatedKeys_1, Object.keys(jsonParsed.translated || []));
                    var combinedContent_1 = jsonParsed.translated || [];
                    Object.entries(jsonParsed.untranslated || [])
                        .map(function (_a) {
                        var untranslated_key = _a[0], untranslated_value = _a[1];
                        combinedContent_1[untranslated_key] = untranslated_value;
                    });
                    Object.entries(jsonParsed.other_translations || [])
                        .map(function (_a) {
                        var other_key = _a[0], other_value = _a[1];
                        combinedContent_1[other_key] = other_value;
                    });
                    var count = Object.keys(combinedContent_1).length;
                    if (!metricsOnly) {
                        console.log("Loaded file '".concat(lang, ".json' containing ").concat(count, " items."));
                    }
                    Object.keys(combinedContent_1).sort(localeSort).map(function (key) {
                        ordered_1[key] = combinedContent_1[key];
                    });
                }
            }
            catch (e) {
                if (!metricsOnly) {
                    console.log("file: ".concat(langFilePath, " contains an error: ").concat(e));
                }
                // If there is an error with the current file content, abort.
                return;
            }
            // For debugging
            var debug_1 = process.argv[3];
            var debugOption_1 = process.argv[4];
            // merge new tags with existing translation
            var untranslated_1 = {};
            var translated_1 = {};
            var other_translations_1 = {};
            var existing_1 = 0;
            // all current tags in English
            Object.keys(jsonCurrentTagData_1).sort(localeSort).map(function (key) {
                untranslated_1[key] = jsonCurrentTagData_1[key];
                if (debug_1) {
                    untranslated_1[key] = replaceWithDebugString(key, debug_1, debugOption_1);
                }
            });
            Object.entries(ordered_1).map(function (_a) {
                var key = _a[0], value = _a[1];
                // replace current tag with an existing translation
                if (untranslated_1.hasOwnProperty(key)) {
                    existing_1++;
                    if ((key !== value) || translatedKeys_1.includes(key)) {
                        delete untranslated_1[key];
                        translated_1[key] = value;
                        if (debug_1) {
                            translated_1[key] = replaceWithDebugString(key, debug_1, debugOption_1);
                        }
                    }
                }
                else {
                    if (key !== value) {
                        // if the tag doesn't exist but a translation exists,
                        // put the key/value at the end of the json
                        other_translations_1[key] = value;
                    }
                }
            });
            summaryData = generateSummary({
                langCode: lang, untranslated: untranslated_1,
                foundTags: jsonCurrentTagData_1, unmatchedTags: other_translations_1,
                translated: translated_1, countExisting: existing_1,
                metricsOnly: metricsOnly
            });
            var jsonContent = {
                translated: translated_1,
                untranslated: untranslated_1,
                other_translations: other_translations_1
            };
            var stringJson = JSON.stringify(jsonContent, undefined, 2) + "\n";
            if (!metricsOnly) {
                (0, fs_1.writeFileSync)(langFilePath, stringJson);
            }
        }
        catch (e) {
            if (!metricsOnly) {
                console.log("file: ".concat(langFilePath, ". error append: ").concat(e));
            }
        }
        return summaryData;
    }
    Helper.createOrUpdateTranslationFile = createOrUpdateTranslationFile;
})(Helper || (Helper = {}));
var language = process.argv[2];
Helper.createOrUpdateTranslationFile(language);
generateMetrics();
