# Install dependencies
This function uses an external library called jsdom.

For this to function you must install that dependency by doing:

`$ npm install`

You only need to do this after cloning the repo the first time.

Please ensure you only run exporter.js from this director - moving the file around will result in it losing reference to the required dependencies.

# How to run
After you have installed dependencies, run 

`$ node exporter.js path/to/htmls`

This will generate a csv file for you. 

For more help and aditional options and examples run:

`$ node exporter.js -h` 