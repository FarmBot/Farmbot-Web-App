var HelperNamespace = (function () {
  /**
   * @desc Build a list of all the files that are children of a directory
   * @param {string} dir The directory to search
   * @param {list} filelist The list of the directories/files already detected
   * @param {string} ext The extension to filter for the files
   */
  function walkSync(dir, filelist, ext) {
    var path = path || require('path');
    var fs = fs || require('fs'),
      files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = walkSync(path.join(dir, file), filelist, ext);
      }
      else {
        if (file.indexOf(ext) > 0)
          filelist.push(path.join(dir, file));
      }
    });
    return filelist;
  };

  /**
   * @desc search in the file in parameter to detect the tags
   */
  function searchInFile(path, regex) {
    var fs = fs || require('fs')
    // load the file
    var fileContent = fs.readFileSync(path, 'utf8');
    var strArray = [];
    // match all the groups
    var match = regex.exec(fileContent);
    while (match != null) {
      strArray.push(match[1].replace(/\s+/g, ' '))
      match = regex.exec(fileContent);
    }
    return strArray;
  }

  /** Locale-aware sort */
  function localeSort(a, b) { return a.localeCompare(b); }

  // '.t("")' or '{t("")' or ' t("")' or '(t("")' or '[t("")'
  // '.t(``)' or '{t(``)' or ' t(``)' or '(t(``)' or '[t(``)'
  // Also finds ' t("some {{data}}", \n {data})'
  var T_REGEX = /[.{[(\s]t\(["`]([\w\s{}().,:'\-=\\?\/%!]*)["`],*\s*.*\)/g;

  // '``'
  var C_REGEX = /[`]([\w\s{}().,:'\-=\\?"+!]*)[`].*/g;

  /** Some additional phrases the regex can't find. */
  const EXTRA_TAGS = [
    "Fun", "Warn", "Controls", "Device", "Farm Designer", "on",
    "Map Points", "Spread", "Row Spacing", "Height", "Taxon",
    "Growing Degree Days", "Svg Icon", "Invalid date", "yes"
  ];

  /**
   * Get all the tags in the files with extension .ts of the current project
   */
  function getAllTags() {
    const srcPath = __dirname + '/../../../webpack';

    var listFilteredFiles = walkSync(srcPath, [], '.ts');
    var allTags = listFilteredFiles.map(function (x) {
      return searchInFile(x, T_REGEX)
    });
    var constantsTags = searchInFile(srcPath + '/constants.ts', C_REGEX);
    const DIAG_MESSAGE_FILE = '/devices/connectivity/diagnostic_messages.ts';
    var diagnosticTags = searchInFile(srcPath + DIAG_MESSAGE_FILE, C_REGEX);

    // flatten list of list in a simple list
    var flatAllTags = [].concat.apply([], allTags);
    var flatConstantsTags = [].concat.apply([], constantsTags);
    var flatDiagnosticTags = [].concat.apply([], diagnosticTags);
    var flatExtraTags = [].concat.apply([], EXTRA_TAGS);
    var flattenedTags = [].concat.apply([],
      [flatAllTags, flatConstantsTags, flatDiagnosticTags, flatExtraTags]);

    // distinct
    var uniq = Array.from(new Set(flattenedTags));

    var sorted = uniq.sort(localeSort);

    return sorted;
  }

  /**
   * For debugging
   */
  function logAllTags() {
    console.dir(getAllTags());
  }

  /**
   * Label a section of tags with a comment before the first tag in the section.
   */
  function labelTags(string, tags, label) {
    var firstUnusedKey = Object.keys(tags)[0];
    var replacement = '\n  // ' + label + '\n  "' + firstUnusedKey + '"';
    var labeledString = string.replace('"' + firstUnusedKey + '"', replacement);
    return labeledString;
  }

  /** Print some translation file status metrics. */
  function generateSummary(args) {
    // {foundTags, unmatchedTags, allTags, countTranslated, countExisting, langCode}
    const current = Object.keys(args.foundTags).length;
    const orphans = Object.keys(args.unmatchedTags).length;
    const total = Object.keys(args.allTags).length;
    const percent = Math.round(args.countTranslated / current * 100);
    const existingUntranslated = args.countExisting - args.countTranslated;
    console.log(current + ' strings found.');
    console.log('  ' + args.countExisting + ' existing items match.');
    console.log('    ' + args.countTranslated + ' existing translations match.');
    console.log('    ' + existingUntranslated + ' existing untranslated items.');
    console.log('  ' + (current - args.countExisting) + ' new items added.');
    console.log(percent + '% of found strings translated.');
    console.log(orphans + ' unused, outdated, or extra items.');
    console.log('Updated file (' + args.langCode + '.js) with ' + total + ' items.');
  }

  /**
   * Create the translation file or update it with new tags
   * The tags are in the following order:
   * 1. New tags in English that need to be translated (ASC)
   * 2. Tags already translated that match an existing tag in src (ASC)
   * 3. Tags already in the file before but not found at the moment in src (ASC)
   * @param {string} lang The short name of the language.
   */
  function createOrUpdateTranslationFile(lang) {
    lang = lang || 'en';

    // check current file entry
    const langFilePath = __dirname + '/' + lang + '.js';
    var fs = fs || require('fs')

    try {
      var columnsResult = HelperNamespace.getAllTags();

      var jsonCurrentTagData = {};
      columnsResult.forEach(function (column) {
        jsonCurrentTagData[column] = column;
      });

      var ordered = {};
      var fileContent;
      try {
        // check the file can be opened
        var stats = fs.statSync(langFilePath);

        // load the file
        var fileContent = fs.readFileSync(langFilePath, 'utf8');
        if (lang == 'en') {
          console.log('Current file (' + lang + '.js) content: ');
          console.log(fileContent);
          console.log('Try entering a language code.');
          console.log('For example: node _helper.js en');
          return;
        }
      }
      catch (e) {
        console.log('we will create the file: ' + langFilePath);
        // If there is no current file, we will create it
      };

      try {
        if (fileContent != undefined) {
          var jsonContent = fileContent
            .replace('module.exports = ', '')
            // regex to delete all comments // and :* in the JSON file
            .replace(/(\/\*(\n|\r|.)*\*\/)|(\/\/.*(\n|\r))/g, '');

          var jsonParsed = JSON.parse(jsonContent);
          const count = Object.keys(jsonParsed).length;
          console.log('Loaded file ' + lang + '.js with ' + count + ' items.');

          Object.keys(jsonParsed).sort().forEach(function (key) {
            ordered[key] = jsonParsed[key];
          });
        }
      } catch (e) {
        console.log('file: ' + langFilePath + ' contains an error: ' + e);
        // If there is an error with the current file content, abort
        return;
      }

      // For debugging
      const debug = process.argv[3];

      // merge new tags with existing translation
      var result = {};
      var unexistingTag = {};
      var existing = 0;
      var translated = 0;
      // all current tags in English
      Object.keys(jsonCurrentTagData).sort(localeSort).map(function (key) {
        result[key] = jsonCurrentTagData[key];
        if (debug) { result[key] = debug[0].repeat(key.length) }
      })
      for (var key in ordered) {
        // replace current tag with an existing translation
        if (result.hasOwnProperty(key)) {
          delete result[key];
          result[key] = ordered[key];
          if (debug) { result[key] = debug[0].repeat(key.length) }
          existing++;
          if (key !== result[key]) { translated++; }
        }
        // if the tag doesn't exist but a translation exists,
        // put the key/value at the end of the json
        else {
          unexistingTag[key] = ordered[key];
        }
      }
      for (var key in unexistingTag) result[key] = unexistingTag[key];

      generateSummary({
        langCode: lang, allTags: result,
        foundTags: jsonCurrentTagData, unmatchedTags: unexistingTag,
        countTranslated: translated, countExisting: existing
      });

      var stringJson = JSON.stringify(result, null, 2);
      var label = 'Unmatched (English phrase outdated or manually added)';
      var labeledStringJson = labelTags(stringJson, unexistingTag, label);
      var newFileContent = 'module.exports = ' + labeledStringJson;

      fs.writeFileSync(langFilePath, newFileContent);
    } catch (e) {
      console.log('file: ' + langFilePath + '. error append: ' + e);
    }
  }

  // public functions
  return {
    logAllTags: logAllTags,
    getAllTags: getAllTags,
    createOrUpdateTranslationFile: createOrUpdateTranslationFile
  };
})();

// Need to run this cmd in this folder: node _helper.js
var language = process.argv[2];
HelperNamespace.createOrUpdateTranslationFile(language)
