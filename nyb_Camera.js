/* nyb_Camera.js
 * Version: 20191122d
*/
/*:
 * @plugindesc Camera Controls
 * @author MrNybbles
 *
 * @help [Description] 
 *  
 * [Command Syntax]
 *  camera move S
 *  camera move S D
 *  camera move X Y D
 *  camera move X Y S D
 *   Moves the camera by the X Y Offset to Scale S over Duration D.
 *
 *  camera bind
 *   Camera is limited to the map's boundaries. This is the normal behavior
 *   of the game's camera.
 *
 *  camera unbind
 *   Camera is not affected by the map's boundaries. This keeps the target
 *   at the center at all times when moving around the map.
 *
 *  camera lock
 *   Camera will now move then the target moves.
 *
 *  camera unlock
 *   Camera will not follow the target.
 *
 *  S  - Scale
 *  D  - Duration (in frames)
 *  X  - X Location (in tiles)
 *  Y  - Y Location (in tiles)
 *
 * [Function Overrides]
 *  Game_Map.prototype.screenTileX();
 *  Game_Map.prototype.screenTileY();
 *  Game_Map.prototype.scrollDown(distance);
 *  Game_Map.prototype.scrollLeft(distance);
 *  Game_Map.prototype.scrollRight(distance);
 *  Game_Map.prototype.scrollUp(distance);
 *  Game_Player.prototype.updateScroll(lastScrolledX, lastScrolledY);
 *
 * [Function Hooks]
 *  Game_Screen.prototype.clearZoom();
 *  Scene_Map.prototype.start();
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
 *
 * @param   Command Name
 * @type    string
 * @desc    Plugin Command name to use in Event Commands. Leave blank to disable.
 * Default: camera
 * @default camera
 *
 * @param   Initial Scale
 * @type    string
 * @desc    Scale to use then the game first begins. May be a real or integer number.
 * Default: 1.0
 * @default 1.0
*/
'use strict';

(function() {
	
	const camera = {
		plugin_name:'nyb_Camera',
		is_bound:true,
		scale:1.0,
		coefficient:1.0,
		ttl:0,
		target:null,
		next_event_update:null,
		next_scene_update:null,
//		queue:[],// Date().now()
		nop:function() {
		},
		sint_clamp:function(value, def) {
			return !isNaN(value) ? value <= 2147483647 ? value >= -2147483648 ?
			(value<<0): -2147483648 : 2147483647 : def;
		},
		uint_clamp:function(value, def) {
			return !isNaN(value) ? value <= 2147483647 ? value >= 0 ?
			(value<<0) : 0 : 2147483647 : def;
		},
		string:function(name, def) {
			const value = PluginManager.parameters(this.plugin_name)[name];
			return value ? value : def;
		},
		bool:function(name, def) {
			const value = PluginManager.parameters(this.plugin_name)[name];
			return value ? 'true' === value : def;
		},
		uint:function(name, def) {
			const value = parseInt(PluginManager.parameters(this.plugin_name)[name]);
			return !isNaN(value) ? Math.max(0, value) : def;
		},
		sint:function(name, def) {
			const value = parseInt(PluginManager.parameters(this.plugin_name)[name]);
			return !isNaN(value) ? value : def;
		},
		real:function(name, def) {
			const value = Number(PluginManager.parameters(this.plugin_name)[name]);
			return !isNaN(value) ? value : def;
		},
		vsint:function(arg, def) {
			return	(arg && '$' === arg.charAt(0)) ?
					(parseInt($gameVariables._data[arg.slice(1)]) || 0) :
					(parseInt(arg, 10) || def);
		},
		vuint:function(arg, def) {
			return	(arg && '$' === arg.charAt(0)) ?
					(parseInt($gameVariables._data[arg.slice(1)]) || 0) :
					(parseInt(arg, 10).clamp(0, 2147483648) || def);
		},
		vreal:function(arg, def) {
			return	(arg && '$' === arg.charAt(0)) ?
					(Number($gameVariables._data[arg.slice(1)]) || 0) :
					(Number(arg) || def);
		},
		json:function(name, def) {
			const value = PluginManager.parameters(this.plugin_name)[name];
			return value ? JSON.parse(value) : def;
		},
		eval:function(name, def) {
			const value = PluginManager.parameters(this.plugin_name)[name];
			return value ? eval(value) : def;
		},
		is_player:function(obj) {
			return ('Game_Player' === obj.constructor.name);
		},
		is_event:function(obj) {
			return ('Game_Event' === obj.constructor.name);
		},
		is_follower:function(obj) {
			return ('Game_Follower' === obj.constructor.name);
		},
		is_vehicle:function(obj) {
			return ('Game_Vehicle' === obj.constructor.name);
		},
		is_targetable:function(obj) {
			return this.is_player(obj) || is_event(obj) || is_follower(obj) || is_vehicle(obj);
		},
		set_scale:function(scale) {
			if(!isNaN(scale)) {
				this.scale       = scale;
				this.coefficient = 1.0 / scale;
				
				if($gameScreen) {
					$gameScreen._zoomScale = scale;
				}
			}
		},
		scrollX:function() {
			if(this.dx > 0) {
				$gameMap.scrollRight(this.dx);
			} else {
				$gameMap.scrollLeft(-this.dx);
			}
		},
		scrollY:function() {
			if(this.dy > 0) {
				$gameMap.scrollDown(this.dy);
			} else {
				$gameMap.scrollUp(-this.dy);
			}
		},
		update_position:function() {
			if(camera.next_scene_update) {
				camera.next_scene_update.call(this);
			}
			if(camera.ttl > 0) {
				camera.ttl--;
				camera.scrollX();
				camera.scrollY();
				camera.set_scale(camera.scale - camera.dz);
			} else {
				camera.set_scale(camera.tz);
				SceneManager._scene.updateChildren = camera.next_scene_update;
				camera.next_scene_update = null;
			}
		},
		update_scroll:function(x1, y1) {
			const x2 = this.scrolledX();
			const y2 = this.scrolledY();
			
			if (y2 > y1 && y2 > this.centerY() * camera.coefficient) {
				$gameMap.scrollDown(y2 - y1);
			}
			if (x2 < x1 && x2 < this.centerX() * camera.coefficient) {
				$gameMap.scrollLeft(x1 - x2);
			}
			if (x2 > x1 && x2 > this.centerX() * camera.coefficient) {
				$gameMap.scrollRight(x2 - x1);
			}
			if (y2 < y1 && y2 < this.centerY() * camera.coefficient) {
				$gameMap.scrollUp(y1 - y2);
			}
		},
		event_update_scroll:function() {
			this.next_event_update.apply(this, arguments);
			this.update_scroll.call(this, this.scrolledX(), this.scrolledY());
		},
		unlock:function() {
			if(this.target) {
				this.target.updateScroll = this.next_event_update;
			}
		},
		lock:function() {
			if(this.target) {
				this.unlock();
				switch(this.target.constructor.name) {
					case 'Game_Player': {
						this.next_event_update = this.nop;
						this.target.updateScroll       = this.update_scroll;
						
					} break;
					case 'Game_Event':
					case 'Game_Follower':
					case 'Game_Vehicle': {
						this.next_event_update = this.target.updateScroll;
						this.target.updateScroll       = this.event_update_scroll;
					} break;
				}
			}
		},
		set_target:function(obj) {
			if(obj && obj !== this.target) {
				this.target = obj;
			}
		},
		do_move:function(x, y, scale, duration) {
			if(null === this.next_scene_update && !isNaN(x) && !isNaN(y) && !isNaN(scale) && !isNaN(duration) && duration > 0) {
				this.ttl = duration;
				this.tx  = x;
				this.dx  = (x)  / duration;
				this.ty  = y;
				this.dy  = (y)  / duration;
				this.tz  = scale;
				this.dz  = (this.scale - scale) / duration;
				this.next_scene_update = SceneManager._scene.updateChildren;
				
				SceneManager._scene.updateChildren = this.update_position;
			}
		},
		cmd_move:function(argv) {
//			console.info(argv);
			switch(argv.length) {
				case 2: { // move S
					this.do_move(
						0,
						0,
						this.scale,
						1
					);
				} break;
				case 3: { // move S D
					this.do_move(
						0,
						0,
						this.vreal(argv[1], null),
						this.vuint(argv[2], null)
					);
				} break;
				case 4: { // move X Y D
					this.do_move(
						this.vreal(argv[1], null),
						this.vreal(argv[2], null),
						this.scale,
						this.vuint(argv[3], null)
					);
				} break;
				case 5: { // move X Y S D
					this.do_move(
						this.vreal(argv[1], null),
						this.vreal(argv[2], null),
						this.vreal(argv[3], null),
						this.vuint(argv[4], null)
					);
				} break;
			}
		},
	};
	
	const cmdName = camera.string('Command Name', 'camera');
	
	const Game_Screen_clearZoom       = Game_Screen.prototype.clearZoom;
	const Scene_Map_start             = Scene_Map.prototype.start;
	
	Game_Screen.prototype.clearZoom = function() {
		Game_Screen_clearZoom.call(this);
		this._zoomScale = camera.scale;
	}
	
	Game_Map.prototype.screenTileX = function() {
		return Graphics.width / $gameMap.tileWidth() * camera.coefficient;
	};

	Game_Map.prototype.screenTileY = function() {
		return Graphics.height / $gameMap.tileHeight() * camera.coefficient;
	};
	
	Game_Map.prototype.scrollDown = function(distance) {
		if (this.isLoopVertical()) {
			this._displayY += distance;
			this._displayY %= $dataMap.height;
			if (this._parallaxLoopY) {
				this._parallaxY += distance;
			}
		} else if (this.height()  >= this.screenTileY()) {
			const lastY = this._displayY;
			this._displayY = camera.is_bound ?
				(Math.min(this._displayY + distance, this.height() - this.screenTileY())) :
				(this._displayY + distance)
			;
			this._parallaxY += this._displayY - lastY;
		}
	};

	Game_Map.prototype.scrollLeft = function(distance) {
		if (this.isLoopHorizontal()) {
			this._displayX += $dataMap.width - distance;
			this._displayX %= $dataMap.width;
			if (this._parallaxLoopX) {
				this._parallaxX -= distance;
			}
		} else if (this.width() >= this.screenTileX()) {
			const lastX = this._displayX;
			this._displayX = camera.is_bound ?
				(Math.max(this._displayX - distance, 0)) :
				(this._displayX - distance)
			;
			this._parallaxX += this._displayX - lastX;
		}
	};

	Game_Map.prototype.scrollRight = function(distance) {
		if (this.isLoopHorizontal()) {
			this._displayX += distance;
			this._displayX %= $dataMap.width;
			if (this._parallaxLoopX) {
				this._parallaxX += distance;
			}
		} else if (this.width() >= this.screenTileX()) {
			const lastX = this._displayX;
			
			this._displayX = camera.is_bound ?
				(Math.min(this._displayX + distance, this.width() - this.screenTileX())) :
				(this._displayX = this._displayX + distance)
			;
			this._parallaxX += this._displayX - lastX;
		}
	};

	Game_Map.prototype.scrollUp = function(distance) {
		if (this.isLoopVertical()) {
			this._displayY += $dataMap.height - distance;
			this._displayY %= $dataMap.height;
			if (this._parallaxLoopY) {
				this._parallaxY -= distance;
			}
		} else if (this.height() >= this.screenTileY()) {
			const lastY = this._displayY;
			this._displayY = camera.is_bound ?
				(Math.max(this._displayY - distance, 0)) :
				(this._displayY = this._displayY - distance)
			;
			this._parallaxY += this._displayY - lastY;
		}
	};

	Game_Player.prototype.updateScroll = camera.update_scroll;
	
	if(cmdName.length > 0) {
		const	Game_Interpreter_pluginCommand =
				Game_Interpreter.prototype.pluginCommand;

		Game_Interpreter.prototype.pluginCommand = function(command, argv) {
			if(cmdName === command) {
				switch(argv[0]) {
					case 'move': {
						camera.cmd_move(argv);
					} break;
					case 'bind': {
						camera.is_bound = true;
					} break;
					case 'unbind': {
						camera.is_bound = false;
					} break;
					case 'lock': {
						camera.lock();
					} break;
					case 'unlock': {
						camera.unlock();
					} break;
					default: {
						console.warning('Unknown ' + cmdName + ' sub-command' + argv[0] + '.');
					} break;
				}
				
			} else {
				Game_Interpreter_pluginCommand.call(this, command, argv);
			}
		};
	}
	
	Scene_Map.prototype.start = function() {
		Scene_Map_start.call(this);
		camera.set_target($gamePlayer);
		camera.lock($gamePlayer);
	};
	
	camera.set_scale(camera.real('Initial Scale', 1.0));
})();
