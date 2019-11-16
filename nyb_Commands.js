/* nyb_Commands.js
 * Version: 20191115
*/
/*:
 * @plugindesc Adds Plugin Commands: comevt, mapevt, scene.
 * @author MrNybbles
 *
 * @help [Description]
 * comevt SID [AID]
 *   SID -- Id of which Common Event Script to run.
 *   AID -- Id of which event will Actively carry out the Script.
 *          Defaults to ID of calling Event, then to 0 (no event).
 *
 * mapevt SID [AID]
 *   SID -- Id of which Map Event Script to run.
 *   AID -- Id of which event will Actively carry out the Script.
 *          Defaults to ID of calling Event, then to 0 (no event).
 *
 * scene push|pop|goto SCENE_NAME
 *       push -- Push new scene on the stack.
 *       pop  -- Pop current scene off the stack.
 *       goto -- Pop current scene, then push new scene on the stack.
 *
 * [Notes]
 *  1) Scripts will always be run as the ID of the AID event.
 *     Normally Common Events have no associated Event when run.
 *  2) Prepend '$' to a SID or AID to fetch the ID from a Game Variable.
 *  3) The active page of the called event is always is used.
 *  4) Erased Events will no longer work with comevt or mapevt.
 *  5) The prototype of SCENE_NAME must be derived from Scene_Base
 *     or otherwise be a compatible scene prototype.
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
 * @param   Scene Command
 * @type    string
 * @desc    Command Name to goto/push/pop scene objects.
 * Default: scene
 * @default scene
 *
 * @param   Common Event Command
 * @type    string
 * @desc    Command Name for Common Events to be run as Map Events.
 * Default: comevt
 * @default comevt
 *
 * @param   Map Event Command
 * @type    string
 * @desc    Command Name for Map Events to be run as other Map Events.
 * Default: mapevt
 * @default mapevt
*/
'use strict';

(function() {
	const module = {
		plugin_name:'nyb_Commands',
		string:function(name, def) {
			const value = PluginManager.parameters(this.plugin_name)[name];
			return 'string' === typeof(value) ? value : def;
		}
	};
	
	const parse = function(arg, def) {
		return	(arg && '$' === arg.charAt(0))            ?
			($gameVariables._data[arg.slice(1)] || 0) :
			(parseInt(arg, 10) || def || 0);
	};
	
	const do_comevt = function(argv) {
		const sid = parse(argv[0], 0);
		const aid = parse(argv[1], $gameMap._interpreter._eventId);
		const scr = $dataCommonEvents[sid];
		const evt = $dataMap.events[aid];
		
		if (evt) {
			evt._eventId = sid;
			evt.list = scr.list;
			
			if(!$gameMap._interpreter.isRunning()) {
				$gameMap._interpreter.setup(evt.list, aid);
			} else {
				const oldId = $gameMap._interpreter._eventId;
				$gameMap._interpreter._eventId = aid;
				$gameMap._interpreter.setupChild(evt.list,
					$gameMap._interpreter.isOnCurrentMap() ?
					$gameMap._interpreter._eventId : 0
				);
				$gameMap._interpreter._eventId = oldId;
			}
			evt._eventId = aid;
		}
	};

	const do_mapevt = function(argv) {
		const sid = parse(argv[0], 0);
		const aid = parse(argv[1], $gameMap._interpreter._eventId);
		const scr = $gameMap.event(sid);
		const evt = $dataMap.events[aid];
		
		if(evt && scr && !scr._erased) {
			evt._eventId = sid;
			evt.list = scr.list();
			
			if(!$gameMap._interpreter.isRunning()) {
				$gameMap._interpreter.setup(evt.list, aid);
			} else {
				const oldId = $gameMap._interpreter._eventId;
				
				$gameMap._interpreter._eventId = aid;
				$gameMap._interpreter.setupChild(evt.list,
					$gameMap._interpreter.isOnCurrentMap() ?
					$gameMap._interpreter._eventId : 0
				);
				$gameMap._interpreter._eventId = oldId;
			}
			evt._eventId = aid;
		}
	};
	
	const do_scene = function(argv) {
		switch(argv[0]) {
			case 'goto': {
				SceneManager.goto(eval(argv[1]));
			} break;
			case 'push': {
				SceneManager.push(eval(argv[1]));
			} break;
			case 'pop': {
				if(SceneManager._stack.length > 1) {
					SceneManager.pop();
				} else {
					console.error('Will not empty the SceneManager.');
				}
			} break;
			default: {
				console.error('Unknown scene sub-command ' + argv[0]);
			} break;
		}
	};

	const cmd = {
		map:new Map(),
		add:function(name, fcn) {
			if(!this.map.has(name)) {
				this.map.set(name, fcn);
			} else {
				console.error('A command named ' + name + ' already exists.');
			}
		},
		call:function(name, argv) {
			return this.map.has(name)? (this.map.get(name)(argv), true): false;
		}
	};

	{
		const	Game_Interpreter_pluginCommand =
				Game_Interpreter.prototype.pluginCommand;

		Game_Interpreter.prototype.pluginCommand = function(command, argv) {
			if(!cmd.call(command, argv)) {
				Game_Interpreter_pluginCommand.apply(this, arguments);
			}
		}
	}
	
	cmd.add(module.string('Scene Command',        'scene'),  do_scene);
	cmd.add(module.string('Common Event Command', 'comevt'), do_comevt);
	cmd.add(module.string('Map Event Command',    'mapevt'), do_mapevt);
	
})();
