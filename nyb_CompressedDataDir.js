/* nyb_CompressedDataDir.js
 * Version: 20191115
*/
/*:
 * @plugindesc Compressed Data Directory.
 *
 * @author MrNybbles
 * 
 * @help [Description]
 *  Run once after Deployment and the data/ directory contents will be compressed.
 *  Compresses the plain-text .json files of the game's data/ directory using
 *  Base64 Encoding + RLE Compression. Has a side-effect of obfuscating the data.
 *
 * [Instructions]
 * 1) Add this plugin to your Project and Enable it.
 * 2) In RPG Maker MV select 'File->Deployment'.
 * 3) Export and Encrypt as normal.
 * 4) Run the Exported Game. This will encode all deployed data files
 *    and delete the deployed unencrypted files.
 *
 * [License]
 *  MIT https://opensource.org/licenses/MIT
 *
 *  Copyright 2019 MrNybbles
 *  Permission is hereby granted, free of charge, to any person obtaining
 *  a copy of this software and associated documentation files
 *  (the "Software"), to deal in the Software without restriction,
 *  including without limitation the rights to use, copy, modify, merge,
 *  publish, distribute, sublicense, and/or sell copies of the Software,
 *  and to permit persons to whom the Software is furnished to do so,
 *  subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be
 *  included in all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 *  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 *  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
'use strict';

(function() {
	const fs        = require('fs');
	const path      = require('path');
	const dataDir   = path.join(path.dirname(process.mainModule.filename), 'data');
	const suffix    = 'x';  // Encoded file names have this appended to them.
	
	
	const encodeFile = function(fileSpec) {
		
		const src = path.join(dataDir, fileSpec)
		const dst = src + suffix;
		
		fs.writeFileSync(src + suffix,
			LZString.compressToBase64(fs.readFileSync(src, 'utf8'))
		);
		
		if(src != dst) {
			fs.unlinkSync(src);
		}
	};
	
	
	const decodeFile = function(name, uri) {
		const xhr = new XMLHttpRequest();

		xhr.open('GET', 'data/' + uri + suffix);
		xhr.overrideMimeType('application/json');
		xhr.onload = function() {
			if (xhr.status < 400) {
				window[name] = JSON.parse(
					LZString.decompressFromBase64(xhr.responseText)
				);
				DataManager.onLoad(window[name]);
			}
			
			xhr.onerror = this._mapLoader || function() {
				DataManager._errorUrl = DataManager._errorUrl || uri;
			};
		};
		
		window[name] = null;
		xhr.send();
	};
	
	
	if(!Utils.isOptionValid('test')) {
		const DataManager_loadDatabase = DataManager.loadDatabase;
		
		DataManager.loadDataFile = decodeFile;
		
		DataManager.loadDatabase = function() {
			if(!fs.existsSync(path.join(dataDir, this._databaseFiles[0].src + suffix))) {
				
				fs.readdirSync(dataDir)
				.filter(entry => entry.endsWith('.json'))
				.forEach(function(entry) {
					encodeFile.call(this, entry);
				});
				
			}
			
			DataManager.loadDatabase = DataManager_loadDatabase;
			DataManager_loadDatabase.call(this);
		};
	}

})();
