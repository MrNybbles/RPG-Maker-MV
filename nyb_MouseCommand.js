/* nyb_MouseCommand.js
 * Version: 20191115b
*/
/*:
 * @plugindesc Hide Mouse Pointer when Idle and set the mouse cursor with plugin commands.
 * @author MrNybbles
 *
 * @help [Description]
 * Automatically hide the mouse pointer after going idle
 * (i.e. not being moved for a while). Provides plugin commands to
 * enable/disable going idle and setting the timeout.
 *
 * Provides plugin commands to set the cursor type and to lock/unlock
 * the mouse to this program.
 *
 * Mouse Idle Wiggle allows the mouse to be moved ±X pixels without counting
 * as being moved. Some optical mice will detect slight movement on glossy
 * surfaces and often times a mouse will move (be bumped) slightly when the
 * user lets go of the mouse. This setting is in Screen Pixels, not game pixels
 * (when the screen is stretched).
 *
 * [Note]
 * Setting the Mouse Idle Timeout value too low will cause the mouse
 * cursor to flicker while being moved. This is why the minimum is set to 100.
 *
 * [Mouse Plugin Commands]
 * mouse cursor URL
 * mouse cursor alias|auto|cell|col-resize|copy|crosshair|default|
 *              help|move|no-drop|none|not-allowed|pointer|progress|
 *              row-resize|text|vertical-text|wait|zoom-in|zoom-out
 *   Sets the mouse pointer to the specified cursor.
 *   This may also be a URL/URI to a cursor file and a comma-separated list of
 *   fallback cursors.
 *
 *   auto    -- Chooses a cursor based on current UI under the cursor.
 *   default -- The Platform-dependent default cursor.
 *   none    -- Hides the cursor.
 *
 * mouse timeout enable|disable
 *    Enable or disable hiding the mouse after it is idle.
 *
 * mouse timeout MS
 *    How much time must elapse before the mouse becomes idle (in milliseconds).
 *
 * mouse wiggle PX
 *    How far the mouse may move before being shown again (in screen pixels).
 *
 * mouse show
 *    Shows the mouse and restores the mouse cursor.
 *
 * mouse hide
 *    Hides the mouse. The current mouse cursor will be saved.
 *
 * mouse lock
 *    Locks the mouse. A locked mouse will be hidden from all programs
 *    as long as this program is active.
 *
 * mouse unlock
 *    Unlocks the mouse.
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
 * @param   Auto-hide Mouse
 * @type    boolean
 * @desc    Hide the mouse if it goes idle.
 * Default: true
 * @default true
 *
 * @param   Initially Hide Mouse
 * @type    boolean
 * @desc    Start the game with the mouse initially hidden.
 * Default: true
 * @default true
 *
 * @param   Mouse Idle Timeout
 * @type    number
 * @desc    Time (in milliseconds) before the mouse pointer is hidden.
 * Default: 2000 (2 seconds)
 * @default 2000
 * @min     100
 * @max     2147483647
 *
 * @param   Mouse Idle Wiggle
 * @type    number
 * @desc    How much movement counts as intentional movement.
 * Default: 2 (±2 Pixels)
 * @default 2
 * @min     1
 * @max     100
 *
 * @param   Mouse Command Name
 * @type    string
 * @desc    Command Name used to issue Plugin Commands (or leave blank to disable).
 * Default: mouse
 * @default mouse
 *
*/
'use strict';

(function() {
	const fs      = require('fs');
	const path    = require('path');
	
	const module = {
		plugin_name:'nyb_MouseCommand',
		uint_clamp:function(value) {
			return value <= 2147483647 ? value >= 0 ?
			(value<<0) : 0 : 2147483647;
		},
		string:function(name, def) {
			let value = PluginManager.parameters(this.plugin_name)[name];
			return 'string' === typeof(value) ? value : def;
		},
		bool:function(name, def) {
			let value = PluginManager.parameters(this.plugin_name)[name];
			return 'string' === typeof(value) ? 'true' === value : def;
		},
		uint:function(name, def) {
			let value = parseInt(PluginManager.parameters(this.plugin_name)[name]);
			return !isNaN(value) ? Math.max(0, value) : def;
		}
	};
	
	const cmdName = module.string('Mouse Command Name', '');
	
	const mouse = {
		cursor:null,
		timeout:2000,
		x:0,
		y:0,
		wiggle:2,
		tid:0,
		isHooked:false,
		hide:function() {
			if(null === this.cursor) {
				this.cursor = document.body.style.cursor;
				document.body.style.cursor = 'none';
				
				if(this.isHooked) {
					clearTimeout(this.tid);
					this.tid = 0;
				}
			}
		},
		show:function() {
			if(null !== this.cursor) {
				document.body.style.cursor = this.cursor;
				this.cursor = null;
				
				if(this.isHooked) {
					this.start_timer();
				}
			}
		},
		start_timer:function() {
			if(this.tid > 0) {
				clearTimeout(this.tid);
			}
			this.tid = window.setTimeout(function() {
				this.tid = 0;
				mouse.hide();
			}, this.timeout);
		},
		on_move:function(evt) {
			if(null === this.cursor) {
				this.x = evt.clientX;
				this.y = evt.clientY;
				this.start_timer();
			} else {
				if(	this.x < evt.clientX-this.wiggle ||
					this.x > evt.clientX+this.wiggle ||
					this.y < evt.clientY-this.wiggle ||
					this.y > evt.clientY+this.wiggle ){
					this.show();
					this.start_timer();
				}
			}
		},
		enable_timeout:function() {
			if(!this.isHooked) {
				window.addEventListener("mousemove",
				this.on_move.bind(this), {once:false}, false);
				this.isHooked = true;
				this.start_timer();
			}
		},
		disable_timeout:function() {
			if(this.isHooked) {
				window.removeEventListener("mousemove",
				this.on_move.bind(this), {once:false}, false);
				this.isHooked = false;
			}
		},
		// https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
		set_cursor(type) {
			if(null === this.cursor) {
				document.body.style.cursor = type;
			} else {
				this.cursor = type;
			}
		},
		// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
		lock:function() {
			window.Graphics._canvas.requestPointerLock();
		},
		unlock:function() {
			document.exitPointerLock();
		}
	};
	
	if(cmdName.length > 0) {
		const Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
		Game_Interpreter.prototype.pluginCommand = function(command, args) {
			switch(args[0]) {
				case 'cursor': {
					mouse.set_cursor(args[1]);
				} break;
				case 'hide': {
					mouse.hide();
				} break;
				case 'show': {
					mouse.show();
				} break;
				case 'timeout': {
					switch(args[1]) {
						case 'true':
						case 'enable': {
							mouse.enable_timeout();
						} break;
						case 'false':
						case 'disable': {
							mouse.disable_timeout();
						} break;
						default: {
							if(!isNaN(args[1])) {
								mouse.timeout = module.uint_clamp(args[1]);
							}
						} break;
					}
				} break;
				case 'wiggle': {
					if(!isNaN(args[1])) {
						mouse.wiggle = module.uint_clamp(args[1]);
					}
				} break;
				case 'lock': {
					mouse.lock();
				} break;
				case 'unlock': {
					mouse.unlock();
				} break;
			}
		}
	}
	
	mouse.timeout = module.uint('Mouse Idle Timeout', 2000);
	mouse.wiggle  = module.uint('Mouse Idle Wiggle',  2);
	
	if(module.bool('Auto-hide Mouse', false)) {
		window.addEventListener("load", function(evt) {
			mouse.enable_timeout();
			if(module.bool('Initially Hide Mouse', false)) {
				mouse.hide();
			}
		}, {once:true}, false);
	}
	
})();
