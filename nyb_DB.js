/* nyb_DB.js
 * Version: 20191111
*/
/*:
 * @plugindesc Add additional databases to your project.
 * @author     MrNybbles
 *
 * @help [Description]
 *  Loads JSON database files to the specified game variable.
 *
 *  Also allows a decoder to be used to decode Compressed or Encrypted
 *  files.
 *  
 * [Example]
 *  Database Root: $DB
 *  Directory:     data/
 *  Decoder:       none
 *  Database[]:
 *   Name: info
 *   File: Info
 *
 *  This will load the file data/Info.json into $DB.info.
 *
 * @param   Database Root
 * @desc    Name of global variable where each database is stored.
 * Default: $DB
 * @default $DB
 * @type    string
 *
 * @param   Directory
 * @desc    Directory of Database files.
 * Default: data/
 * @default data/
 * @type    string
 *
 * @param   Database
 * @desc    Database files.
 * @type    struct<entry>[]
 *
 * @param   Decoder
 * @desc    Select which Decoder (Decompression/Decryption) function needs to be used.
 * Default: none
 * @default none
 * @type    combo
 * @option  none
 * @option  LZString.decompressFromBase64
 *
 * @param   Encoded File Suffix
 * @desc    File extension of encoded database files.
 * Default: .jsonx
 * @default .jsonx
 * @type    string
 *
 * @param   Playtest Decoder
 * @desc    Use specified Decoder during Playtest.
 * @on      Yes
 * @off     No
 * @type    boolean
 * @default false
*/
/*~struct~entry:
 * @param   Name
 * @desc    Name of the database property in Database Root.
 * @type    string
 *
 * @param   File
 * @desc    Database file name without the file extension.
 * @dir     ./
 * @type    string
 * @require 1
 *
 * @param   Enable
 * @desc    Enable Database
 * @on      Yes
 * @off     No
 * @type    boolean
 * @default true
*/
'use strict';

(function() {
	const plugin_name = 'nyb_DB';
	const fs      = require('fs');
	const path    = require('path');
	const none    = function(data) { return data; };
	const param = {
		string:function(name, def) {
			let value = PluginManager.parameters(plugin_name)[name];
			return 'string' === typeof(value) ? value : def;
		},
		bool:function(name, def) {
			let value = PluginManager.parameters(plugin_name)[name];
			return 'string' === typeof(value) ? 'true' === value : def;
		},
		json:function(name, def) {
			let value = PluginManager.parameters(plugin_name)[name];
			return value ? JSON.parse(value) : def;
		},
		eval:function(name, def) {
			let value = PluginManager.parameters(plugin_name)[name];
			return value ? eval(value) : def;
		}
	};
	
	const db_dir = path.join(
		path.dirname(process.mainModule.filename),
		param.string('Directory', '')
	);
	
	const decoder = (param.bool('Playtest Decoder', false) ||
		!Utils.isOptionValid('test') ?
		param.eval('Decoder', none) :
		none
	);
	
	const key = param.string('Database Root', '$DB');
	const db  = window[key] = window[key] || [];
	const ext = (decoder !== none ?
		param.string('Encoded File Suffix', '.jsonx') : '.json'
	);
	
	const load = function(name, src) {
		const fileSpec = path.join(db_dir, src + ext);
		fs.readFile(fileSpec, 'utf8', (err, data) => {
			if(!err) {
				db[name] = JSON.parse(decoder(data));
			} else {
				console.error(err);
			}
		});
	}
	
	if(!!decoder) {
		param.json("Database", []).forEach( (entry) => {
			entry = JSON.parse(entry);
			
			if('true' === entry['Enable']) {
				load(entry['Name'], entry['File']);
			}
		});
	} else {
		console.error(plugin_name + ': The specified Decoder ' +
			param.string('Decoder', 'undefined') +
			'does not exist.'
		);
	}
})();
