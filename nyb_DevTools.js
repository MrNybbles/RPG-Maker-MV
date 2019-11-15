/* nyb_DevTools.js
 * Version: 20191114
*/
/*:
 * @plugindesc Developer Tools
 * @author MrNybbles
 *
 * @help [Features]
 *  1) Show the Dev Console during Play Testing.
 *  2) Allow/Disallow the Console to steal Input focus.
 *  3) Skip the distracting PIXI banner from you-know-where. . .
 *  4) Skip the Title Screen and begin with a new game.
 *
 * [Notes]
 *  This plugin only functions during Play Test mode and should be removed
 *  before deployment (although won't hurt anything if left in).
 *
 *  When the Dev Console starts with focus you can hit TAB and start typing
 *  commands directly into the console.
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
 *
 * @param   showDevConsole
 * @text    Show Dev Console
 * @type    boolean
 * @desc    Display the Dev Console when Play Testing.
 * Default: false
 * @default false
 *
 * @param   focusDevConsole
 * @text    Focus Dev Console
 * @type    boolean
 * @desc    Allow the Dev Console to have window focus when displayed.
 * Default: false
 * @default false
 *
 * @param   skipPixiHello
 * @text    Skip PIXI Hello
 * @type    boolean
 * @desc    Skip the eye-catching PIXI Hello Banner.
 * Default: false
 * @default false
 *
 * @param   skipTitleScreen
 * @text    Skip Title Screen
 * @type    boolean
 * @desc    Skip the Title Screen and start with a new game.
 * Default: false
 * @default false
*/
'use strict';

(function() {
	
	const module = {
		plugin_name:'nyb_DevTools',
		bool:function(name, def) {
			let value = PluginManager.parameters(this.plugin_name)[name];
			return 'string' === typeof(value) ? 'true' === value : def;
		}
	};
	
	if(Utils.isOptionValid('test')) {
		
		if(module.bool('showDevConsole', false)) {
			const win = require('nw.gui').Window.get();
			
			if(module.bool('focusDevConsole', false)) {
				win.showDevTools();
			} else {
				win.showDevTools('', function() {
					win.focus();
				});
			}
		}
		
		if(module.bool('skipPixiHello', false)) {
			PIXI.utils.skipHello();
		}
		
		if(module.bool('skipTitleScreen', false)) {
			Scene_Boot.prototype.start = function() {
				Scene_Base.prototype.start.call(this);
				DataManager.setupNewGame();
				SceneManager.goto(Scene_Map);
				this.updateDocumentTitle();
			}
		}
	}
})();
