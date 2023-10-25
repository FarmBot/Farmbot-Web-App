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

export const ATTENTION = "Run `_helper.js`, not `_helper.ts`.";

import { join as pathJoin } from "path";
import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";

type Translations = Record<string, string>;

interface FileContent {
  translated: Translations;
  untranslated: Translations;
  other_translations: Translations;
}

interface GenerateSummaryArgs {
  langCode: string;
  untranslated: Translations;
  foundTags: Translations;
  unmatchedTags: Translations;
  translated: Translations;
  countExisting: number;
  metricsOnly: boolean | undefined;
}

interface SummaryData {
  percent: number;
  orphans: number;
  total: number;
  untranslated: number;
  current: number;
  translated: number;
  language: string;
}

/**
 * Build a list of all the files that are children of a directory.
 * @param dir The directory to search.
 * @param fileList The list of directories/files already detected.
 * @param ext A list of file extensions to filter the files.
 */
function walkSync(
  dir: string,
  fileList: string[],
  extensions: string[],
): string[] {
  const files = readdirSync(dir);
  files.map(file => {
    if (statSync(pathJoin(dir, file)).isDirectory()) {
      fileList = walkSync(pathJoin(dir, file), fileList, extensions);
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        fileList.push(pathJoin(dir, file));
      }
    }
  });
  return fileList;
}

/**
 * Search for phrases in the file using the provided regex.
 */
function searchInFile(path: string, regex: RegExp): string[] {
  // load the file
  const fileContent = readFileSync(path, "utf8");
  const strArray: string[] = [];
  // match all the groups
  let match = regex.exec(fileContent);
  while (match != undefined) {
    strArray.push(match[1].replace(/\s+/g, " "));
    match = regex.exec(fileContent);
  }
  return strArray;
}

/** Locale-aware sort */
function localeSort(a: string, b: string): number { return a.localeCompare(b); }

// '.t("")' or '{t("")' or ' t("")' or '(t("")' or '[t("")'
// '.t(``)' or '{t(``)' or ' t(``)' or '(t(``)' or '[t(``)'
// Also finds ' t("some {{data}}", \n {data})'
const T_REGEX = /[.{[(\s]t\(["`]([\w\s{}().,:'\-=\\?/%!]*)["`],*\s*.*\)/g;

// '``'
const C_REGEX = /[`]([\w\s{}().,*:'\-=/\\?"+!]*)[`].*/g;

/** Some additional phrases the regex can't find. */
const EXTRA_TAGS = [
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
  "Binomial Name", "Common Names", "Sun", "Sowing", "Companions",
];

/** For debugging. Replace all characters except whitespace and {{ words }}. */
function repl(string: string, character: string): string {
  const parts = string.split("{{");
  if (parts.length < 2) { return string.replace(/\S/g, character); }
  const insideAndAfter = parts[1].split("}}");
  const before = parts[0].replace(/\S/g, character);
  const inside = insideAndAfter[0];
  const after = insideAndAfter[1].replace(/\S/g, character);
  const firstPart = [before, inside].join("{{");
  return [firstPart, after].join("}}");
}

/**
 * For debugging. Replace all translations with a debug string.
 * Example usage: `node _helper.js xx _ n`
 */
function replaceWithDebugString(
  key: string,
  debugString: string,
  debugStringOption: string | undefined,
): string {
  const debugChar = debugString[0];
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
  const languageCodes = walkSync(__dirname, [], [".json"])
    .filter(s => !s.includes("metrics.json"))
    .filter(s => !s.includes("en.json"))
    .map(s => s.slice(-"en.json".length, -".json".length));
  const metrics: SummaryData[] = [];
  languageCodes.map(lang => {
    const summaryData = Helper.createOrUpdateTranslationFile(lang, true);
    summaryData && metrics.push(summaryData);
  });
  // console.log(metrics);
  // const jsonMetrics = JSON.stringify(metrics, undefined, 2);
  // writeFileSync(pathJoin(__dirname, "metrics.json"), jsonMetrics);
  let markdown = "";
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
  writeFileSync(pathJoin(__dirname, "translation_metrics.md"), markdown);
}

/** Print some translation file metrics. */
function generateSummary(args: GenerateSummaryArgs): SummaryData {
  const current = Object.keys(args.foundTags).length;
  const orphans = Object.keys(args.unmatchedTags).length;
  const untranslated = Object.keys(args.untranslated).length;
  const translated = Object.keys(args.translated).length;
  const total = untranslated + translated + orphans;
  const percent = Math.round(translated / current * 100);
  const existingUntranslated = args.countExisting - translated;
  if (!args.metricsOnly) {
    console.log(`${current} strings found.`);
    console.log(`  ${args.countExisting} existing items match.`);
    console.log(`    ${translated} existing translations match.`);
    console.log(`    ${existingUntranslated} existing untranslated items.`);
    console.log(`  ${current - args.countExisting} new items added.`);
    console.log(`${percent}% of found strings translated.`);
    console.log(`${orphans} unused, outdated, or extra items.`);
    console.log(`Updated file '${args.langCode}.js' with ${total} items.`);
  }
  return {
    percent: percent, orphans: orphans, total: total, untranslated: untranslated,
    current: current, translated: translated, language: args.langCode
  };
}

namespace Helper {
  /** Get all the tags in the .ts and .tsx files of the current project */
  export function getAllTags(): string[] {
    const srcPath = pathJoin(__dirname, "../../../frontend");

    const listFilteredFiles = walkSync(srcPath, [], [".ts", ".tsx"]);
    const allTags = listFilteredFiles.map(x => searchInFile(x, T_REGEX));
    const constantsTags = searchInFile(pathJoin(srcPath, "constants.ts"), C_REGEX);

    // flatten list of list in a simple list
    const flatAllTags = allTags.flat();
    const flatConstantsTags = constantsTags.flat();
    const flatExtraTags = EXTRA_TAGS.flat();
    const flattenedTags = [flatAllTags, flatConstantsTags, flatExtraTags].flat();

    // distinct
    const uniq = Array.from(new Set(flattenedTags));

    const sorted = uniq.sort(localeSort);

    return sorted;
  }

  /** For debugging */
  export function logAllTags() {
    console.dir(getAllTags());
  }

  /**
   * Create the translation file or update it with new tags.
   * The tags are in the following order:
   * 1. New tags in English that need to be translated (ASC)
   * 2. Tags already translated that match an existing tag in src (ASC)
   * 3. Tags already in the file before but not found at the moment in src (ASC)
   * @param  langInput The short name of the language, i.e., `en`.
   */
  // eslint-disable-next-line complexity
  export function createOrUpdateTranslationFile(
    langInput: string | undefined = "en",
    metricsOnly?: boolean,
  ): SummaryData | undefined {
    const lang = langInput.slice(0, 2);
    // check current file entry
    const langFilePath = pathJoin(__dirname, `${lang}.json`);

    let summaryData: SummaryData | undefined = undefined;

    try {
      const tagsResult = getAllTags();

      const jsonCurrentTagData: Translations = {};
      tagsResult.map(tag => {
        jsonCurrentTagData[tag] = tag;
      });

      const ordered: Translations = {};
      const translatedKeys: string[] = [];
      let fileContent;
      try {
        // check the file can be opened
        statSync(langFilePath);

        // load the file
        fileContent = readFileSync(langFilePath, "utf8");
        if (lang == "en") {
          console.log(`Current file '${lang}.json' content: `);
          console.log(fileContent);
          console.log("Try entering a language code.");
          console.log("For example: node _helper.js en");
          return;
        }
      } catch (e) {
        if (!metricsOnly) {
          console.log(`New file created: '${lang}.json'`);
        }
        // If there is no current file, we will create it.
      }

      try {
        if (fileContent != undefined) {
          const jsonParsed: Partial<FileContent> = JSON.parse(fileContent);
          translatedKeys.push(...Object.keys(jsonParsed.translated || []));
          const combinedContent = jsonParsed.translated || [] as unknown as Translations;
          Object.entries(jsonParsed.untranslated || [])
            .map(([untranslated_key, untranslated_value]) => {
              combinedContent[untranslated_key] = untranslated_value;
            });
          Object.entries(jsonParsed.other_translations || [])
            .map(([other_key, other_value]) => {
              combinedContent[other_key] = other_value;
            });
          const count = Object.keys(combinedContent).length;
          if (!metricsOnly) {
            console.log(`Loaded file '${lang}.json' containing ${count} items.`);
          }

          Object.keys(combinedContent).sort(localeSort).map(key => {
            ordered[key] = combinedContent[key];
          });
        }
      } catch (e) {
        if (!metricsOnly) {
          console.log(`file: ${langFilePath} contains an error: ${e}`);
        }
        // If there is an error with the current file content, abort.
        return;
      }

      // For debugging
      const debug = process.argv[3] as string | undefined;
      const debugOption = process.argv[4] as string | undefined;

      // merge new tags with existing translation
      const untranslated: Translations = {};
      const translated: Translations = {};
      const other_translations: Translations = {};
      let existing = 0;
      // all current tags in English
      Object.keys(jsonCurrentTagData).sort(localeSort).map(key => {
        untranslated[key] = jsonCurrentTagData[key];
        if (debug) {
          untranslated[key] = replaceWithDebugString(key, debug, debugOption);
        }
      });
      Object.entries(ordered).map(([key, value]) => {
        // replace current tag with an existing translation
        if (untranslated.hasOwnProperty(key)) {
          existing++;
          if ((key !== value) || translatedKeys.includes(key)) {
            delete untranslated[key];
            translated[key] = value;
            if (debug) {
              translated[key] = replaceWithDebugString(key, debug, debugOption);
            }
          }
        } else {
          if (key !== value) {
            // if the tag doesn't exist but a translation exists,
            // put the key/value at the end of the json
            other_translations[key] = value;
          }
        }
      });

      summaryData = generateSummary({
        langCode: lang, untranslated: untranslated,
        foundTags: jsonCurrentTagData, unmatchedTags: other_translations,
        translated: translated, countExisting: existing,
        metricsOnly: metricsOnly
      });

      const jsonContent: FileContent = {
        translated: translated,
        untranslated: untranslated,
        other_translations: other_translations,
      };
      const stringJson = JSON.stringify(jsonContent, undefined, 2) + "\n";

      if (!metricsOnly) { writeFileSync(langFilePath, stringJson); }
    } catch (e) {
      if (!metricsOnly) {
        console.log(`file: ${langFilePath}. error append: ${e}`);
      }
    }
    return summaryData;
  }
}

const language = process.argv[2] as string | undefined;
Helper.createOrUpdateTranslationFile(language);
generateMetrics();
