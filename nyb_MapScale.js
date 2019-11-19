/* nyb_MapScale.js
 * Version: 20191118c
*/
/*:
 * @plugindesc Scales the map, everything else normal size.
 * @author MrNybbles
 *
 * @help [Description]
 *  Allows a Map Scale to be set. This can be changed at any
 *  time using the specified plugin command name.
 *
 * [Notes]
 * 1) Map Scale can be any real number >= 1.0. Fractions are allowed
 *   (and somehow look decent).
 * 2) Plugin Command Name can be blank to disable the command.
 * 3) If other plugins break due to needing the real tile width/height they
 *    they can be modified to use tileRealWidth() and tileRealHeight() if
 *    the license permits modifications. This option is disabled by default.
 *
 * [Known Issues]
 *  This plugin does not ask the game to redraw the map after changing scale
 *  which may cause immediate issues (event if not noticed right away).
 *  After changing the Map Scale during game play either reload the map or
 *  transfer to another map.
 *  It is left up to the game dev to account for this.
 *
 *  Any scale < 1.0 causes the game to not render correctly and is not supported.
 *
 *  Currently the Parallax functions are untouched (but use
 *  Game_Map.tileWidth() and Game_Map.tileHeight()). This may be an issue for
 *  anyone using a Parallax Mapping technique.
 *
 * [License]
 *  MIT https://opensource.org/licenses/MIT
 *
 *  Copyright 2019 MrNybbles
 *
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
 *
 * @param    Map Scale
 * @type     string
 * @desc     Value to scale the game's map by. Must be at least 1.00.
 * Default:  1.0
 * @default  1.0
 * @min      1.0
 * @decimals 2
 *
 * @param    Command Name
 * @type     string
 * @desc     Name of Plugin Command change the Map's Scale.
 * Default:  mapscale
 * @default  mapscale
 *
 * @param   Export Real Width/Height
 * @type    boolean
 * @desc    Adds tileRealWidth() and tileRealHeight() to Game_Map.prototype.
 * Default: false
 * @default false
*/
'use strict';

(function() {
	
	const module = {
		plugin_name:'nyb_MapScale',
		scale:1.0,
		coefficient:1.0,
		string:function(name, def) {
			const value = PluginManager.parameters(this.plugin_name)[name];
			return 'string' === typeof(value) ? value : def;
		},
		bool:function(name, def) {
			const value = PluginManager.parameters(this.plugin_name)[name];
			return value ? 'true' === value : def;
		},
		real:function(name, def) {
			const value = Number(PluginManager.parameters(this.plugin_name)[name]);
			return !isNaN(value) ? value : def;
		},
		update:function(scale) {
			if(!isNaN(scale)) {
				this.scale = Math.max(1.0, scale);
				this.coefficient = 1.0 / this.scale;
			}
		}
	};
	
	const cmdName = module.string('Command Name', '');
	
	const Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
	const Spriteset_Map_loadTileset   = Spriteset_Map.prototype.loadTileset;
	const Game_Map_screenTileX = Game_Map.prototype.screenTileX;
	const Game_Map_screenTileY = Game_Map.prototype.screenTileY;
	const Game_Map_tileWidth   = Game_Map.prototype.tileWidth;
	const Game_Map_tileHeight  = Game_Map.prototype.tileHeight;
	
	Spriteset_Map.prototype.createTilemap = function() {
		Spriteset_Map_createTilemap.call(this);
		
		this._tilemap.scale.x = module.scale;
		this._tilemap.scale.y = module.scale;
	};
	
	Spriteset_Map.prototype.loadTileset = function() {
		this._tilemap.tileWidth  = Game_Map_tileWidth.call(this);
		this._tilemap.tileHeight = Game_Map_tileHeight.call(this);
		Spriteset_Map_loadTileset.call(this);
	};
	
	Spriteset_Map.prototype.updateTilemap = function() {
		this._tilemap.origin.x = $gameMap.displayX() * Game_Map_tileWidth.call(this);
		this._tilemap.origin.y = $gameMap.displayY() * Game_Map_tileHeight.call(this);
	};
	
	Game_CharacterBase.prototype.screenX = function() {
		var tw = Game_Map_tileWidth.call(this);
		return Math.round(this.scrolledX() * tw + tw * 0.5);
	};
	
	Game_CharacterBase.prototype.screenY = function() {
		var th = Game_Map_tileWidth.call(this);
		return Math.round(this.scrolledY() * th + th -
						  this.shiftY() - this.jumpHeight());
	};
	
	Game_Map.prototype.tileWidth = function() {
		return Game_Map_tileWidth.call(this) * module.scale;
	};
	
	Game_Map.prototype.tileHeight = function() {
		return Game_Map_tileHeight.call(this) * module.scale;
	};
	
	Game_Map.prototype.screenTileX = function() {
		return Game_Map_screenTileX.call(this) * module.coefficient;
	};
	
	Game_Map.prototype.screenTileY = function() {
		return Game_Map_screenTileY.call(this) * module.coefficient;
	};
	
	if(module.bool('Export Real Width/Height', false)) {
		Game_Map.prototype.tileRealWidth = function() {
			return Game_Map_tileWidth.call(this);
		};
		
		Game_Map.prototype.tileRealHeight = function() {
			return Game_Map_tileHeight.call(this);
		};
	}
	
	if(cmdName.length > 0) {
		const	Game_Interpreter_pluginCommand =
				Game_Interpreter.prototype.pluginCommand;

		Game_Interpreter.prototype.pluginCommand = function(command, argv) {
			if(cmdName === command) {
				module.update(argv[0] || null);
			} else {
				Game_Interpreter_pluginCommand.call(this, command, argv);
			}
		};
	}
	
	module.update(module.real('Map Scale', null));
	
})();
