BV House Styles
===============

Quick start
-----------

Clone the repo and run 'npm run setup'. For all subsequent uses, just run 'gulp'.

Note, Windows users may need to run the initial command more than once for it to complete successfully.

General usage notes
-------------------

- Make all changes in src/ directory, minified/compressed stuff is then output by gulp to dist/ (dist/ is deleted everytime gulp is run).
- Images should be put in src/static/img/. Gulp will apply compression without reducing their quality.
- JavaScript should go in src/static/js/main.js. Gulp will perform jslint on your code and compress main.js (and any other js files in that directory) into a single, minified js file.
- Bower components e.g. jQuery should be added to bower.json. Files will be installed in src/static/bower_components/.
- Anything not CSS/JS/images should go in src/static/assets/ e.g. fonts, videos, other files.
- Browser support included for IE8 and above

Coding standards
----------------

The BV house styles have been written using the following coding standards, which should be used for all projects. These guidelines will likely evolve over time.

General

- be consistent
- code should be clean, commented and readable
- use graceful degradation
- leave your code tidy, delete commented sections of code prior to completion
- assume someone else will need to work on your code after you do
- indent code logically
- use a tab width of 4
- don't repeat yourself

HTML

- lowercase everything
- new tag, new line
- ensure HTML is valid
- no inline styles

CSS

- use lowercase and hyphens for class names
- newline for each style property and classname
- don't use IDs for class names
- don't use !important
- use names based on structure, not presentation e.g. btn-primary not btn-green
- don't qualify class names with attribute types e.g. .well, not div.well 
- include a comment where a selector is included for a specific, not immediately obvious reason
- write CSS in a modular way if possible, assume that any element could be included anywhere on the site
- try to avoid excessive class hierarchy such as .basket .summary .details .product .description .price {color:#FF000;}
- don't use page specific classes
- apply styles using a class name rather than an element name (except for base styles)
- styles for a specific purpose should be grouped together, not scattered e.g. media queries, browser specific styles

JavaScript

- scripts should only be inline where necessary
- JS should interact with the DOM using either element IDs, data* attributes or class names that have no styles associated with them, and use the naming convention js-classname, to make it really obvious that they are used only by the JavaScript
- use braces with all multiline blocks
- every function should have a comment that briefly explains what it does
- name functions and variables descriptively
- camelcase for objects, functions and instances

Remember SEO

- page meta tags including og and any related extra stuff
- image alt tags
- correct heading structure
- semantic markup
- CSS, JS etc. should be minified
- image sizes should be optimised
- overall page size should ideally be less than 2MB!


Use of Gulp
------------

There is a `gulpfile.js` within this repository to make development much quicker for the house styles. All you need to do is:

- Install Node (http://nodejs.org) & Gulp (https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)
- Run `npm run setup`

This will install all the dependencies found in `package.json` (The `node_modules` folder that is generated when you run this command should be created on a case-by-case basis and not pushed to a repository), install the Bower dependencies found in `package.json` and run the local server through the `gulp` command.

Note for Windows users with Git Bash: you may need to run 'npm run setup' a couple of times for it to finally work.
  
This will open up a tab in your browser, running a server at `localhost:3000` (unless you have set up a proxy server address - details on how to change this are in the `gulpfile.js` file).

Gulp features
-------------

Name | Version | Description
--- | --- | ---
**gulp** | ^3.9.0 | Task runner to automate various tasks
**browser-sync** | ^2.8.0 | Local server enabling instant DOM injection to all devices connected when a file is changed
**gulp-bytediff** | ^1.0.0 | Shows a the difference between file sizes before and after gulp tasks have run.
**gulp-concat** | ^2.6.0 | Concatenates multiple files into one
**gulp-cache** | ^0.2.10 | Enables caching of piped files to prevent tasks being run unnecessarily
**gulp-imagemin** | ^2.3.0 | Compresses images - packaged with gifsicle, jpegtran, optipng, and svgo
**gulp-jshint** | ^1.11.2 | Provides JS validation and hinting. Settings for this are in the `.jshintrc` file
**gulp-less** | ^3.0.3 | Converts LESS files in CSS
**gulp-load-plugins** | ^1.0.0-rc.1 | Handles the `require()` functions for all plugins in `package.json`
**gulp-minify-css** | ^1.2.0 | Minifies CSS files to reduce file sizes
**gulp-newer** | ^0.5.1 | Ensure that gulp tasks only run on files that have changed rather than all files.
**gulp-notify** | ^2.2.0 | Enables the use of native notifications to display when tasks are complete
**gulp-plumber** | ^1.0.1 | Prevent pipe breaking caused by errors from gulp plugins
**gulp-rename** | ^1.2.2 | Allows files to be renamed via JS
**gulp-uglify** | ^1.2.0 | Minifies JS files
**gulp-util** | ^3.0.6 | Utility functions for gulp plugins
**jshint-stylish** | ^2.0.1 | Stylish reporter for JSHint
**path** | ^0.11.14 | Copy of Node.JS path module
**del** | ^1.2.0 | Enables the deleting of files

### BrowserSync
  
The main component of this Gulp setup is BrowserSync. This plugin provides the following advantages for development:  
* Simultaneous page scrolling for all devices connected to the same link  
* Clicking links or populating form fields on one device will duplicate this behaviour on all other linked devices  
* A dashboard at `localhost:3001` where you can send commands to all connected devices, perform actions and do network throttle testing.

