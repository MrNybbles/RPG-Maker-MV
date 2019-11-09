/* nyb_OpaqueData.js
 * Version: 20191108
*/
/*:
 * @plugindesc Obfuscates plain-text files in the game's data/ directory after Deployment.
 * @author Mr.Nybbles
 *
 * @help [Instructions]
 * 1) Enable this plugin.
 * 2) In RPG Maker MV select 'File->Deployment'.
 * 3) Export and Encrypt as normal.
 * 4) Run the Exported Game one time (this will encode the data files).
 * 5) Run the Exported Game a second time. It should run normally.
 *
 * [Notes]
 * 1) Create a backup of your project. This is normal.
 * 2) The game window should get stuck at the Loading Screen only
 *    if the files have not been encoded already. This is normal.
 * 3) The Console window will open and print info messages. This is normal.
 * 4) When encoding files you should see a red error about a missing file.
 *    This is the plugin checking if the encoded files exist and is normal.
 * 5) Never pet a burning dog. This is not normal.
 * 6) The plugin will automatically delete the original unencoded files
 *    after encoding. This is normal.
 * 7) NEVER set 'debugMode' to true. This will cause your _original_
 *    undeployed data files to be encrypted and deleted during Test Mode.
 *
 * [License]
 * MIT https://opensource.org/licenses/MIT
 *
 * Copyright 2019 MrNybbles
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
*/
'use strict';

(function() {
	const path     = require('path');
	const gamePath = path.join(path.dirname(process.mainModule.filename), 'data');
	const suffix   = 'x'; // Encoded file names have this appended to them.
	const debugMode = false; // WARNING: NEVER EVER ENABLE THIS !!!!
	
	
	const fileExists = function(uri) {
		return require('fs').existsSync(path.join(gamePath, uri));
	};
	
	
	const fileSave = function(uri, data) {
		require('fs').writeFileSync(path.join(gamePath, uri), data);
	};
	
	
	const fileLoad = function(uri) {
		return JSON.parse(require('fs').readFileSync(path.join(gamePath, uri)));
	};
	
	
	const fileDelete = function(uri) {
		require('fs').unlinkSync(path.join(gamePath, uri));
	};
	
	
	const encodeFile = function(uri) {
		const xhr = new XMLHttpRequest();
		console.info('Encoding ' + uri);
		
		xhr.open('GET', 'data/' + uri);
		xhr.overrideMimeType('application/json');
		xhr.onload = function() {
			if (xhr.status < 400) {
				fileSave(uri + suffix, LZString.compressToBase64(xhr.responseText));
				fileDelete(uri); // Delete original file after encoding a new one!
			}
		};
		
		xhr.onerror = this._mapLoader || function() {
			DataManager._errorUrl = DataManager._errorUrl || uri;
		};
		
		xhr.send();
	};
	
	
	const decodeFile = function(name, uri) {
		const xhr = new XMLHttpRequest();
//		console.info('Decoding ' + uri);

		xhr.open('GET', 'data/' + uri + suffix);
		xhr.overrideMimeType('application/json');
		xhr.onload = function() {
			if (xhr.status < 400) {
				window[name] = JSON.parse(LZString.decompressFromBase64(xhr.responseText));
				DataManager.onLoad(window[name]);
			}
			
			xhr.onerror = this._mapLoader || function() {
				DataManager._errorUrl = DataManager._errorUrl || uri;
			};
		};
		
		window[name] = null;
		xhr.send();
	};
	
	
	if(!Utils.isOptionValid('test') || debugMode) {
		const DataManager_loadDatabase = DataManager.loadDatabase;
		
		if(Utils.isOptionValid('test') && debugMode) {
			console.warn('Debug Mode! You made a backup recently, right?');
		}
		
		DataManager.loadDataFile = decodeFile;
		
		DataManager.loadDatabase = function() {
			
			if(!fileExists(this._databaseFiles[0].src + suffix)) {
				
				console.info('[Encoding Databases]');
				for(let i = 0; i < this._databaseFiles.length; ++i) {
					encodeFile.call(this, this._databaseFiles[i].src);
				}
				
				console.info('[Encoding Maps]');
				const mapInfo = fileLoad('MapInfos.json');
				
				for(let i = 0; i < mapInfo.length; ++i) {
					if(null != mapInfo[i]) {
						const fileSpec = 'Map%1.json'.format(mapInfo[i].id.padZero(3));
						encodeFile.call(this, fileSpec);
					}
				}
				
				console.info('Encoding Finished!');
			} else {
				DataManager_loadDatabase.call(this);
			}
		};
	}
	
})();
