'use strict';

const os = require('os');
const fs = require('fs');
const jsdom = require("jsdom");
const { buffer } = require('stream/consumers');
const { JSDOM } = jsdom;

// HELP text
if (process.argv[2]) {
    const firstArg = process.argv[2].toLowerCase();
    if (firstArg === "-h" || firstArg == "--h") {
        console.log("USAGE");
        console.log("$ node exporter.js <PATH_TO_FILE_OR_FOLDER> <OUTPUT_FILE_NAME>")
        console.log("- PATH_TO_FILE_OR_FOLDER is required - provide a path to an html file or a folder of html files")
        console.log("- OUTPUT_FILE_NAME - optional - desired name of the csv output file without file extension")
    
        console.log()
            
        console.log("OUTPUT")
        console.log("Program will generate a csv containing text and links of the a tags in the html file(s) called \"a-tag-output.csv\" (or name provided).")
        console.log("Note: if you already have a file called \"a-tag-output.csv\" (or name provided) in same location, it will be overwritten.")
    
        console.log()
    
        console.log("EXAMPLES");
        console.log("- Specify path to folder")
        console.log("    $ node exporter.js path/to/htmls")
        console.log("- Specify path to file")
        console.log("    $ node exporter.js path/to/example.html")
    
        process.exit()
    }
}

const SLASH = isWindows() ? "\\" : "/";
const TAG = "a";

// argv[0] is node executable path
// argv[1] is path to this file
const pathToFolderOrFile = process.argv[2];
verifyArgs()
const outputFileName = (verifyOutputFileName() || "a-tag-output") + ".csv";

work();

////////////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////////
function verifyArgs() {
    if (pathToFolderOrFile === undefined || pathToFolderOrFile === null || pathToFolderOrFile.trim() === "") {
        console.error("Error: path to folder or file is required.")
        process.exit()
    }

    if (pathToFolderOrFile.includes(".") && !pathToFolderOrFile.includes(".htm")) {
        console.error("Error: file must be an html file.")
        process.exit()
    }

    let pathExists = fs.existsSync(pathToFolderOrFile)
    if (!pathExists) {
        console.error("Error: specified path does not exist.")
        process.exit()
    }
}

function verifyOutputFileName() { 
    const name = process.argv[3];
    if (name === undefined || name === null || name.trim() === "") {
        return false;
    }
    if (name.includes(".")) {
        console.error("Error: specify output file name without file extension.")
        process.exit()
    }
    return name;
}

function work() {
    console.log("......working......"); 

    const files = getFileListFromPath()

    const promises = files.map(file => {
        const fileName = getFileName(file);
        return JSDOM.fromFile(file).then(dom => {
            const aTags = dom.window.document.querySelectorAll("a");
            const output = [];
            aTags.forEach(tag => {
                console.log(tag.children)
                output.push(`${fileName},${tag.innerHTML},${tag.href}`)
            })
            return output;
        })
    })
    Promise.all(promises).then(values => {
        const flattenedVals = values.flat();
        fs.writeFileSync(outputFileName, flattenedVals.join("\n"));
        console.log("Done. Output file: " + outputFileName);
    })

    // JSDOM.fromFile(files[0]).then(dom => {
    //     const fileName = getFileName(files[3]);
    //     console.log(fileName)
    //     const aTags = dom.window.document.querySelectorAll("a");
    //     const output = [];
    //     console.log(aTags.length)
    //     aTags.forEach(tag => {
    //         console.log(tag.children)
    //         output.push(`${fileName},${tag.innerHTML},${tag.href}`)
    //     })
    //     return output;
    // })
}

function getFileName(path) {
    const lastSlash = path.lastIndexOf(SLASH);
    const period = path.lastIndexOf(".")
    return path.substring(lastSlash + 1, period)
}

function getFileListFromPath() {
    const files = [];

    readPath(files, pathToFolderOrFile)

    return files;
}

function readPath(files, path) {
    fs.readdirSync(path).forEach(fileOrDir => {
        const fullPath = path + SLASH + fileOrDir;
        if (fileOrDir.includes(".")) {
            if (fileOrDir.toLocaleLowerCase().includes(".htm")) {
                files.push(fullPath)
            }
        } else {
            // its another directory
            readPath(files, fullPath)
        }
    })
}

function isWindows() {
    return os.platform() === 'win32';
}

