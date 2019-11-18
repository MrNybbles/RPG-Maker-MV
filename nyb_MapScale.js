/* nyb_MapScale.js
 * Version: 20191117
*/
/*:
 * @plugindesc Scales only the map leaving the GUI at normal size.
 * @author MrNybbles
 *
 * @help [Description]
 *  Allows a default Map Scale to be set. This can be changed at any
 *  time using the specified plugin command name.
 *
 * [Notes]
 * 1) Map Scale can be any real number >= 1.0 so fractions are allowed.
 * 2) Plugin Command Name can be blank to disable the command.
 *
 * [Known Issues]
 *  This plugin does not ask the game to redraw the map after changing the scale.
 *  Changing the map scale is best done in the pause menu which keeps a
 *  blurred copy as a background, then redraws the map when you exit the
 *  menu. It is left up to the game dev to account for this.
 *
 *  When scale is < 1.0 the game acts weird
 *  (like walking off the edge of the map weird).
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
 * @param   Command Name
 * @type    string
 * @desc    Name of Plugin Command change the Map's Scale.
 * Default: mapscale
 * @default mapscale
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
	const Game_Map_screenTileX = Game_Map.prototype.screenTileX;
	const Game_Map_screenTileY = Game_Map.prototype.screenTileY;
	const Game_Player_centerX = Game_Player.prototype.centerX;
	const Game_Player_centerY = Game_Player.prototype.centerY;
	
	Spriteset_Map.prototype.createTilemap = function() {
		Spriteset_Map_createTilemap.call(this);
		
		this._tilemap.scale.x = module.scale;
		this._tilemap.scale.y = module.scale;
	};
	
	Game_Map.prototype.screenTileX = function() {
		return Game_Map_screenTileX.call(this) * module.coefficient;
	};
	
	Game_Map.prototype.screenTileY = function() {
		return Game_Map_screenTileY.call(this) * module.coefficient;
	};
	
	Game_Map.prototype.canvasToMapX = function(x) {
		var tileWidth = this.tileWidth() * module.scale;
		var originX = this._displayX * tileWidth;
		var mapX = Math.floor((originX + x) / tileWidth);
		return this.roundX(mapX);
	};

	Game_Map.prototype.canvasToMapY = function(y) {
		var tileHeight = this.tileHeight() * module.scale;
		var originY = this._displayY * tileHeight;
		var mapY = Math.floor((originY + y) / tileHeight);
		return this.roundY(mapY);
	};

	Game_Player.prototype.centerX = function() {
		return Game_Player_centerX.call(this) * module.coefficient;
	};

	Game_Player.prototype.centerY = function() {
		return Game_Player_centerY.call(this) * module.coefficient;
	};
	
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
