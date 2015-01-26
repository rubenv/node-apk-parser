# apk-parser - Android apk-file parser

> Extract Android Manifest info from an APK file.

[![Build Status](https://travis-ci.org/rubenv/node-apk-parser.png?branch=master)](https://travis-ci.org/rubenv/node-apk-parser)

While there are some implementations for this out in the wild, none of them handle all of the intricacies of the APK file-format. This module uses the `aapt` tool from the Android SDK to solve that problem. The tool will be downloaded and installed during `npm install`. Tested on Linux and OS X.

## Getting started

Add apk-parser to your project: `npm install --save apk-parser`.

Sample usage:

```js
var parseApk = require('apk-parser');
parseApk('myApkFile.apk', function (err, data) {
    // Handle error or do something with data.
});
```

The returned data object is an object-representation of the `AndroidManifest.xml` file. Here's a sample file:

```js
{
    "manifest": [
        {
            "@package": "com.example.android.snake",
            "uses-permission": [
                {
                    "@android:name": "android.permission.INTERNET"
                }
            ],
            "application": [
                {
                    "@android:label": "Snake on a Phone",
                    "activity": [
                        {
                            "@android:theme": "@0x1030006",
                            "@android:name": "Snake",
                            "@android:screenOrientation": 1,
                            "@android:configChanges": "(type 0x11)0xa0",
                            "intent-filter": [
                                {
                                    "action": [
                                        {
                                            "@android:name": "android.intent.action.MAIN"
                                        }
                                    ],
                                    "category": [
                                        {
                                            "@android:name": "android.intent.category.LAUNCHER"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
```

Things to note:

* The top-level element is a key named `manifest`.
* Attributes are encoded by prepending their name with `@`.
* Child nodes can be accessed by name. The value is always an array, as there might be more than one array.
* This representation is unaware of the meaning of this file (you might know that there will always only be one `application` tag, the module does not). This make sure that it never breaks with future Android releases.

You can increase the buffer size when needed, but do note that it comes with a memory cost:

```js
parseApk('myApkFile.apk', 8 * 1024 * 1024, function (err, data) {
    // Handle error or do something with data.
});
```

## Contributing
All code lives in the `lib` folder. Try to stick to the style conventions used in existing code.

Tests can be run using `grunt test`. A convenience command to automatically run the tests is also available: `grunt watch`. Please add test cases when adding new functionality: this will prove that it works and ensure that it will keep working in the future.
    
## License 

    (The MIT License)

    Copyright (C) 2013-2015 by Ruben Vermeersch <ruben@rocketeer.be>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
