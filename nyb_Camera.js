/* nyb_Camera.js
 * Version: 20191127b
*/
/*:
 * @plugindesc Camera Controls
 * @author MrNybbles
 *
 * @help [Description]
 *  'Encounter Effect Patch' can be disabled to provide comparability for
 *  another plugins replacing Scene_Map.prototype.updateEncounterEffect().
 *
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
 *  Game_Player.prototype.center();
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
 *
 * @param   Encounter Effect Patch
 * @type    boolean
 * @desc    Replaces Scene_Map.updateEncounterEffect to look better while zoomed.
 * Default: true
 * @default true
*/
'use strict';

(function() {
	
	const camera = {
		plugin_name:'nyb_Camera',
		on_map:true,
		is_bound:true,
		is_locked:false,
		scale:1.0,
		coefficient:1.0,
		ttl:0,
		target:null,
		next_event_movement:null,
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
		vstring:function(arg, def) {
			return	(arg && '$' === arg.charAt(0)) ?
					($gameVariables._data[arg.slice(1)]) :
					(arg || def);
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
		event_update_movement:function() {
			camera.next_event_movement.call(this);
			this.center(this._realX, this._realY);
//			camera.update_scroll.call(this, this.scrolledX(), this.scrolledY());
		},
		unlock:function() {
			if(this.is_locked) {
				if(this.is_player(this.target)) {
					this.target.updateScroll = this.nop;
				} else {
					this.target.updateMove = this.next_event_movement;
				}
				this.is_locked = false;
			}
		},
		lock:function() {
			if(!this.is_locked && this.target) {
				switch(this.target.constructor.name) {
					case 'Game_Player': {
						this.next_event_update   = this.nop;
						this.target.updateScroll = this.update_scroll;
					} break;
					case 'Game_Event':
					case 'Game_Follower':
					case 'Game_Vehicle': {
//						console.info('Event Hooked');
						this.next_event_movement = this.target.updateMove;
						this.target.updateMove = this.event_update_movement.bind(this.target);
					} break;
				}
				
				this.is_locked = true;
			}
		},
		apply_scale:function() {
			if(null != $gameScreen) {
				if(this.on_map) {
					$gameScreen._zoomScale = this.scale;
					if(SceneManager._scene._spriteset) {
						SceneManager._scene._spriteset._pictureContainer.scale.x = camera.coefficient;
						SceneManager._scene._spriteset._pictureContainer.scale.y = camera.coefficient;
					}
				} else {
					$gameScreen._zoomScale = 1.0;
				}
			}
		},
		set_target:function(obj) {
//			console.info(obj);
			if(obj && obj !== this.target) {
				if(this.is_locked) {
					this.unlock();
					this.target = obj;
					this.lock();
				} else {
					this.target = obj;
				}
			}
		},
		set_scale:function(scale) {
			if(!isNaN(scale)) {
				this.scale       = scale;
				this.coefficient = 1.0 / scale;
				
				this.apply_scale();
			}
		},
		set_mode:function(on_map) {
			this.on_map = on_map;
			this.apply_scale();
		},
		init:function() {
			this.set_scale(camera.real('Initial Scale', 1.0));
			this.set_target($gamePlayer);
			this.lock($gamePlayer);
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
		center_scaled_x:function(coefficient) {
			return = ((Graphics.width * camera.coefficient - Graphics.width * coefficient)/$gameMap.tileWidth())>>1;
		},
		center_scaled_y:function(coefficient) {
			return ((Graphics.height * camera.coefficient - Graphics.height * coefficient)/$gameMap.tileHeight())>>1;
		},
		do_move:function(x, y, scale, duration) {
			if(null === this.next_scene_update && !isNaN(x) && !isNaN(y) && !isNaN(scale) && !isNaN(duration) && --duration > 0) {
				const coefficient = 1.0/scale;
				this.ttl = duration;
				this.tx  = x;
				this.dx  = (x + this.center_scaled_x(coefficient)) / duration;
				this.ty  = y;
				this.dy  = (y + this.center_scaled_y(coefficient)) / duration;
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
		cmd_event:function(argv) {
			switch(argv.length) {
				case 2: {
					camera.set_target($gameMap.event(this.vuint(argv[1], 0)));
				} break;
				case 3: {
					if(3 === argv.length && 'name' === argv[1]) {
						const name = this.vstring(argv[2]);
						const data = $dataMap.events().find((entry) => entry.name === name);
						if(data) {
							camera.set_target($gameMap.event(data.id));
						}
					}
				} break;
			}
		},
	};
	
	const cmdName = camera.string('Command Name', 'camera');
	
	const Game_Screen_clearZoom = Game_Screen.prototype.clearZoom;
	const Scene_Map_start       = Scene_Map.prototype.start;
	const Scene_Map_create      = Scene_Map.prototype.create;
	const Scene_Battle_start    = Scene_Battle.prototype.start;
	
	Scene_Map.prototype.create = function() {
		Scene_Map_create.call(this);
		camera.init();
		
		Scene_Map.prototype.create = Scene_Map_create;
	};
	
	Scene_Map.prototype.start = function() {
		Scene_Map_start.call(this);
		camera.set_mode(true);
	};
	
	if(camera.bool('Encounter Effect Patch', true)) {
		Scene_Map.prototype.updateEncounterEffect = function() {
			if (this._encounterEffectDuration > 0) {
				this._encounterEffectDuration--;
				
				const speed = this.encounterEffectSpeed();
				const n = speed - this._encounterEffectDuration;
				const p = n / speed;
				const q = ((p - 1) * 20 * p + 5) * p + 1;
				const zoomX = ($gamePlayer.screenX()*camera.coefficient);
				const zoomY = ($gamePlayer.screenY()*camera.coefficient - 24);
				
				if (n === 2) {
					$gameScreen.setZoom(zoomX, zoomY, camera.scale);
					this.snapForBattleBackground();
					this.startFlashForEncounter(speed / 2);
				}
				
				$gameScreen.setZoom(zoomX, zoomY, q + camera.scale - 1);
				
				if (n === Math.floor(speed / 6)) {
					this.startFlashForEncounter(speed / 2);
				}
				
				if (n === Math.floor(speed / 2)) {
					BattleManager.playBattleBgm();
					this.startFadeOut(this.fadeSpeed());
				}
			}
		};
	}
	
	Scene_Battle.prototype.start = function() {
		camera.set_mode(false);
		Scene_Battle_start.call(this);
	};
	
	Game_Screen.prototype.clearZoom = function() {
		Game_Screen_clearZoom.call(this);
		
		camera.apply_scale();
	}
	
	Game_Map.prototype.screenTileX = function() {
		return Graphics.width / $gameMap.tileWidth() * camera.coefficient;
	};

	Game_Map.prototype.screenTileY = function() {
		return Graphics.height / $gameMap.tileHeight() * camera.coefficient;
	};
	
	Game_Map.prototype.canvasToMapX = function(x) { // Translates mouse/touch input.
		const tileWidth = this.tileWidth() * camera.scale;
		const originX = (this._displayX * tileWidth);
		const mapX = Math.floor(((originX + x) / tileWidth));
		return this.roundX(mapX);
	};

	Game_Map.prototype.canvasToMapY = function(y) { // Translates mouse/touch input.
		const tileHeight = this.tileHeight() * camera.scale;
		const originY = (this._displayY * tileHeight);
		const mapY = Math.floor(((originY + y) / tileHeight));
		return this.roundY(mapY);
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
	
	Game_Player.prototype.center = function(x, y) { // Centers Player when starting on map.
		return $gameMap.setDisplayPos(this.x - this.centerX() * camera.coefficient, this.y - this.centerY() * camera.coefficient);
	};
	
	Game_Character.prototype.centerX = Game_Player.prototype.centerX;
	Game_Character.prototype.centerY = Game_Player.prototype.centerY;
	Game_Character.prototype.center  = Game_Player.prototype.center;

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
					case 'player': {
						camera.set_target($gamePlayer);
					} break;
//					case 'event': {
//						camera.cmd_event(argv);
//					} break;
					default: {
						console.warning('Unknown ' + cmdName + ' sub-command' + argv[0] + '.');
					} break;
				}
				
			} else {
				Game_Interpreter_pluginCommand.call(this, command, argv);
			}
		};
	}
	
})();
