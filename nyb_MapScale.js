/* nyb_MapScale.js
 * Version: 20191119d
*/
/*:
 * @plugindesc Scales only the map.
 * @author MrNybbles
 *
 * @help [Description]
 *  Allows a Map Scale to be set. This can be changed at any
 *  time using the specified plugin command name.
 *
 * [Command Syntax]
 *  mapscale S
 *  mapscale S F
 *   S -- Scale
 *   F -- Duration of zoom, in frames.
 *
 *   Any parameter prefixed with a $ will use the contents of the variable
 *   as the parameter.
 *
 * [Plugin Command Example]
 *  mapscale 2.5 30
 *
 * [Notes]
 * 1) Map Scale can be any real number >= 1.0. Fractions are allowed
 *   (and somehow look decent).
 * 2) The zoom effect looks odd when bound by the map edge.
 * 3) If other plugins break due to needing the real tile width/height they
 *    they can be modified to use tileRealWidth() and tileRealHeight() if
 *    the license permits modifications. This option is disabled by default.
 * 4) Plugin Command Name can be blank to disable the command.
 * 5) Because this scales only the map, Parallax Mapping techniques will
 *    not be scaled by this plugin.
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
 * @desc     Scale the map by this value. Must be at least 1.0.
 * Default:  1.0
 * @default  1.0
 *
 * @param    Tile Width
 * @type     number
 * @desc     Width of map a tile, in pixels.
 * Default:  48
 * @default  48
 * @min      1
 * @max      2147483647
 *
 * @param    Tile Height
 * @type     number
 * @desc     Height of a map tile, in pixels.
 * Default:  48
 * @default  48
 * @min      1
 * @max      2147483647
 *
 * @param    Command Name
 * @type     string
 * @desc     Plugin Command Name used to change the Map's Scale.
 * Default:  mapscale
 * @default  mapscale
 *
 * @param    Export Real Width/Height
 * @type     boolean
 * @desc     Adds tileRealWidth(), tileRealHeight(), setTileRealWidth(), and setTileRealHeight() to Game_Map.prototype.*
 * Default:  false
 * @default  false
*/
'use strict';

(function() {
	
	const module = {
		plugin_name:'nyb_MapScale',
		scale:1.0,
		coefficient:1.0,
		tileRealWidth:48,
		tileRealHeight:48,
		ttl:0,
		delta:0,
		target:0,
		next_update:null,
		string:function(name, def) {
			const value = PluginManager.parameters(this.plugin_name)[name];
			return value ? value : def;
		},
		bool:function(name, def) {
			const value = PluginManager.parameters(this.plugin_name)[name];
			return value ? 'true' === value : def;
		},
		uint:function(name, def) {
			let value = parseInt(PluginManager.parameters(this.plugin_name)[name]);
			return !isNaN(value) ? Math.max(0, value) : def;
		},
		real:function(name, def) {
			const value = Number(PluginManager.parameters(this.plugin_name)[name]);
			return !isNaN(value) ? value : def;
		},
		varg:function(arg, def) {
			return	(arg && '$' === arg.charAt(0))            ?
					($gameVariables._data[arg.slice(1)] || def) :
					(parseInt(arg, 10) || def);
		},
		set_scale:function(scale) {
			if(!isNaN(scale)) {
				this.scale = Math.max(1.0, scale);
				this.coefficient = 1.0 / this.scale;
				
				return true;
			}
		},
		get_tilemap:function() {
			if(SceneManager._scene) {
				const spriteset = SceneManager._scene.children.find(
					(child) => 'Spriteset_Map' === child.constructor.name
				);
				if(spriteset) return spriteset._tilemap;
			}
			
			return null;
		},
		update:function(scale) {
			const tilemap = module.get_tilemap();
			
			if(tilemap) {
				if(this.set_scale(scale)) {
					tilemap.scale.x = module.scale;
					tilemap.scale.y = module.scale;
					$gamePlayer.center($gamePlayer.x, $gamePlayer.y);
				}
			}
		},
		zoomUpdate:function() {
			module.next_update.call(this);
			
			if(module.ttl > 0) {
				--module.ttl;
				
				module.update(module.scale - module.delta);
			} else {
				module.update(module.target);
				SceneManager._scene.updateChildren = module.next_update;
				module.next_update = null;
			}
		},
		zoom:function(scale, duration) {
			if(null === this.next_update && scale && duration && duration > 0) {
				this.ttl = duration;
				this.delta = (this.scale - scale) / duration;
				
				this.target = scale;
				this.next_update = SceneManager._scene.updateChildren;
				
				SceneManager._scene.updateChildren = this.zoomUpdate;
			}
		}
	};
	
	const cmdName = module.string('Command Name', '');
	
	const Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
	const Spriteset_Map_loadTileset   = Spriteset_Map.prototype.loadTileset;
	const Game_Map_screenTileX = Game_Map.prototype.screenTileX;
	const Game_Map_screenTileY = Game_Map.prototype.screenTileY;
	
	Sprite_Destination.prototype.updatePosition = function() {
		this.x = ($gameMap.adjustX($gameTemp.destinationX()) + 0.5)
			* $gameMap.tileWidth()
			* module.coefficient
		;
		this.y = ($gameMap.adjustY($gameTemp.destinationY()) + 0.5)
			* $gameMap.tileHeight()
			* module.coefficient
		;
	};
	
	Spriteset_Map.prototype.createTilemap = function() {
		Spriteset_Map_createTilemap.call(this);
		
		this._tilemap.scale.x = module.scale;
		this._tilemap.scale.y = module.scale;
	};
	
	Spriteset_Map.prototype.loadTileset = function() {
		this._tilemap.tileWidth  = module.tileRealWidth;
		this._tilemap.tileHeight = module.tileRealHeight;
		
		Spriteset_Map_loadTileset.call(this);
	};
	
	Spriteset_Map.prototype.updateTilemap = function() {
		this._tilemap.origin.x = $gameMap.displayX() * module.tileRealWidth;
		this._tilemap.origin.y = $gameMap.displayY() * module.tileRealHeight;
	};
	
	Game_CharacterBase.prototype.screenX = function() {
		return Math.round(this.scrolledX() * module.tileRealWidth + module.tileRealWidth * 0.5);
	};
	
	Game_CharacterBase.prototype.screenY = function() {
		return Math.round(this.scrolledY() * module.tileRealHeight + module.tileRealHeight -
						  this.shiftY() - this.jumpHeight());
	};
	
	Game_Map.prototype.tileWidth = function() {
		return module.tileRealWidth * module.scale;
	};
	
	Game_Map.prototype.tileHeight = function() {
		return module.tileRealHeight * module.scale;
	};
	
	Game_Map.prototype.screenTileX = function() {
		return Game_Map_screenTileX.call(this) * module.coefficient;
	};
	
	Game_Map.prototype.screenTileY = function() {
		return Game_Map_screenTileY.call(this) * module.coefficient;
	};
	
	if(module.bool('Export Real Width/Height', false)) {
		Game_Map.prototype.tileRealWidth = function() {
			return module.tileRealWidth;
		};
		
		Game_Map.prototype.tileRealHeight = function() {
			return module.tileRealHeight;
		};
		
		Game_Map.prototype.setTileRealWidth = function(w) {
			module.tileRealWidth = w;
		};
		
		Game_Map.prototype.setTileRealHeight = function(h) {
			module.tileRealHeight = h;
		};
	}
	
	if(cmdName.length > 0) {
		const	Game_Interpreter_pluginCommand =
				Game_Interpreter.prototype.pluginCommand;

		Game_Interpreter.prototype.pluginCommand = function(command, argv) {
			if(cmdName === command) {
				switch(argv.length) {
					case 1: {
						module.update(Number(module.varg(argv[0]), null));
					} break;
					case 2: {
						module.zoom(Number(module.varg(argv[0]), null), parseInt(module.varg(argv[1]), null));
					} break;
				}
			} else {
				Game_Interpreter_pluginCommand.call(this, command, argv);
			}
		};
	}
	
	module.tileRealWidth  = module.uint('Tile Width',  48);
	module.tileRealHeight = module.uint('Tile Height', 48);
	module.set_scale(module.real('Map Scale', null));
	
})();
