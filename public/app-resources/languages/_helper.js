var HelperNamespace = (function () {
  /**
   * @desc Build a list of all the files that are children of the root isDirectory
   * @param {string} dir The rot isDirectory
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
      strArray.push(match[1].replace(/\s+/g, " "))
      match = regex.exec(fileContent);
    }
    return strArray;
  }

  // '.t("")' or '{t("")' or ' t("")' or '(t("")' or
  // '.t(``)' or '{t(``)' or ' t(``)' or '(t(``)'
  var T_REGEX = /[.{(\s]t\(["`]([\w\s{}().,:'\-=\\?\/%!]*)["`].*\)/g;

  // '``'
  var C_REGEX = /[`]([\w\s{}().,:'\-=\\?"+!]*)[`].*/g;

  /**
   * Get all the tags in the files with extension .ts of the current project
   */
  function getAllTags() {
    const srcPath = __dirname + '/../../../';

    var listFilteredFiles = walkSync(srcPath, [], '.ts');
    var allTags = listFilteredFiles.map(function (x) {
      return searchInFile(x, T_REGEX)
    });
    var constantsTags = searchInFile(srcPath + 'webpack/constants.ts', C_REGEX);

    //flatten list of list in a simple list
    var flatAllTags = [].concat.apply([], allTags);
    var flatConstantsTags = [].concat.apply([], constantsTags);
    var flatExtraTags = [].concat.apply([],
      ["DISCONNECTED", "Controls", "Device", "Farm Designer"]);
    var flattenedTags = [].concat.apply([],
      [flatAllTags, flatConstantsTags, flatExtraTags]);

    //distinct
    var uniq = Array.from(new Set(flattenedTags));

    var sorted = uniq.sort(function (a, b) { return a.localeCompare(b); });

    return sorted;
  }

  /**
   * For debugging
   */
  function logAllTags() {
    console.dir(getAllTags());
  }

  /**
   * Create the translation file or update it with new tags
   * The tags are in the following order:
   * 1. New tags in English that need to be translated (ASC)
   * 2. Tags already translated, and kept because it match an existing tag in src (ASC)
   * 3. Tags already in the file before but not found at the moment in the src (ASC)
   * @param {string} lang The short name of the language.  for the language in parameter
   */
  function createOrUpdateTranslationFile(lang) {
    lang = lang || 'en';

    //check current file entry
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
        //check the file can be opened
        var stats = fs.statSync(langFilePath);

        // load the file
        var fileContent = fs.readFileSync(langFilePath, 'utf8');
        console.log("Current file content: ");
        console.log(fileContent);
      }
      catch (e) { // do this
        console.log("we will create the file: " + langFilePath);
        //If there is no current file, we will create it
      };

      try {
        if (fileContent != undefined) {
          var jsonContent = fileContent
            .replace("module.exports = ", "")
            //regex to delete all comments // and :* in the JSON file
            .replace(/(\/\*(\n|\r|.)*\*\/)|(\/\/.*(\n|\r))/g, "");

          var jsonParsed = JSON.parse(jsonContent);

          Object.keys(jsonParsed).sort().forEach(function (key) {
            ordered[key] = jsonParsed[key];
          });
        }
      } catch (e) {
        console.log("file: " + langFilePath + " contains an error: " + e);
        //If there is an error with the current file content, abort
        return;
      }

      // merge new tags with existing translation
      var result = {};
      var unexistingTag = {};
      // all current tags in English
      for (var key in jsonCurrentTagData) result[key] = jsonCurrentTagData[key];
      for (var key in ordered) {
        // replace current tag with an existing translation
        if (result.hasOwnProperty(key)) {
          delete result[key];
          result[key] = ordered[key];
        }
        // if the tag doesn't exist but a translation exists,
        // put the key/value at the end of the json
        else {
          unexistingTag[key] = ordered[key];
        }
      }
      for (var key in unexistingTag) result[key] = unexistingTag[key];

      var stringJson = JSON.stringify(result, null, "    ");
      var newFileContent = "module.exports = " + stringJson;

      fs.writeFileSync(langFilePath, newFileContent);
    } catch (e) {
      console.log("file: " + langFilePath + ". error append: " + e);
    }
  }

  //public functions
  return {
    logAllTags: logAllTags,
    getAllTags: getAllTags,
    createOrUpdateTranslationFile: createOrUpdateTranslationFile
  };
})();

// Need to run this cmd in this folder: node _helper.js
var language = process.argv[2];
HelperNamespace.createOrUpdateTranslationFile(language)
