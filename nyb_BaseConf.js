/* nyb_BaseConf.js
 * Version: 20191115
*/
/*:
 * @plugindesc Basic Configuration for any game.
 * @author MrNybbles
 *
 * @help [Description]
 *  Extended from Community_Basic.js by RM CoreScript team.
 *
 * [Game Client Area Sizes]
 *  Grid  | Pixel    | Aspect | Notes
 *  17x13 | 816x624  | 4:3    | RPG Maker MV (Default)
 *  26x15 | 1248x720 | 16:9   | Wide Screen
 *
 *  In package.json change 'width' and 'height'
 *  to match 'gameWidth' and 'gameHeight' to prevent
 *  the window from spawning before snapping to the correct size.
 *
 * [License]
 *  MIT https://opensource.org/licenses/MIT
 *
 *  Copyright 2019 MrNybbles
 *  Copyright 2015 RM CoreScript team
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
 *
 * @param   imageCacheLimit
 * @text    Image Cache Limit
 * @type    number
 * @desc    Maximum size of the ImageCache (in MegaPixels).
 * Default: 10
 * @default 10
 * @max     2147483647
 * @decimals 0
 *
 *
 * @param   Window Options
 * @type    struct<group>
 *
 * @param   startAlwaysOnTop
 * @text    Always On Top
 * @type    boolean
 * @desc    Start with the game window always on top.
 * Default: false
 * @default false
 * @parent  Window Options
 *
 * @param   startMaximized
 * @text    Start Maximized
 * @type    boolean
 * @desc    Start game with window Maximized.
 * Default: false
 * @default false
 * @parent  Window Options
 *
 * @param   maxToFullscreen
 * @text    Maximize To Fullscreen
 * @type    boolean
 * @desc    The Maximize button will full-screen the window.
 * Default: false
 * @default false
 * @parent  Window Options
 *
 * @param   disableResize
 * @text    Disable Resize
 * @type    boolean
 * @desc    Disable window Resizing.
 * Default: false
 * @default false
 * @parent  Window Options
 *
 *
 * @param   Game Dimensions
 * @type    struct<group>
 *
 * @param   gameWidth
 * @text    Game Width
 * @type    number
 * @desc    Sets the client/draw area width, in pixels.
 * Default: 1248
 * @default 1248
 * @max     2147483647
 * @decimals 0
 * @parent  Game Dimensions
 *
 * @param   gameHeight
 * @text    Game Height
 * @type    number
 * @desc    Sets the client/draw area height, in pixels.
 * Default: 720
 * @default 720
 * @max     2147483647
 * @decimals 0
 * @parent  Game Dimensions
 *
 * @param   menuWidth
 * @text    Menu Width
 * @type    number
 * @desc    Sets the in-game menu area width, in pixels.
 * @default 816
 * Default: 816
 * @max     2147483647
 * @decimals 0
 * @parent  Game Dimensions
 *
 * @param   menuHeight
 * @text    Menu Height
 * @desc    Sets the in-game menu area height, in pixels.
 * @type    number
 * Default: 624
 * @default 624
 * @max     2147483647
 * @decimals 0
 * @parent  Game Dimensions
 *
 *
 * @param   Disable Hotkeys
 * @type    struct<group>
 *
 * @param   disableFullscreen
 * @text    Disable Full-screen
 * @type    boolean
 * @desc    Disables full-screen mode (via F4) when true.
 * Default: false
 * @default false
 * @parent  Disable Hotkeys
 *
 * @param   disableStretch
 * @text    Disable Stretch
 * @type    boolean
 * @desc    Disables stretch-to-fit graphics mode (via F3) when true.
 * Default: false
 * @default false
 * @parent  Disable Hotkeys
 *
 * @param   disableFpsMeter
 * @text    Disable Fps Meter
 * @type    boolean
 * @desc    Disables Fps Toggling (via F2) when true.
 * Default: false
 * @default false
 * @parent  Disable Hotkeys
 *
 *
 * @param   Start Enabled
 * @type    struct<group>
 *
 * @param   startFullscreen
 * @text    Start Full-screen
 * @type    boolean
 * @desc    Start the game in Full-screen mode.
 * Default: false
 * @default false
 * @parent  Start Enabled
 *
 * @param   startStretched
 * @text    Start Stretch Enabled
 * @type    boolean
 * @desc    Start game with graphics stretched to fit the window.
 * Default: false
 * @default false
 * @parent  Start Enabled
 *
 * @param   startFpsMeter
 * @text    Start FPS Meter
 * @type    boolean
 * @desc    Start the game with FPS Meter.
 * Default: false
 * @default false
 * @parent  Start Enabled
 *
 *
 * @param   Default Values
 * @type    struct<group>
 *
 * @param   alwaysDash
 * @text    Default Always Dash
 * @type    boolean
 * @desc    If true then Always Dash is enabled by default.
 * Default: false
 * @default false
 * @parent  Default Values
 *
 * @param   commandRemember
 * @text    Default Command Remember
 * @type    boolean
 * @desc    If true then Command Remember is enabled by default.
 * @default false
 * @parent  Default Values
 *
 * @param   bgmVolume
 * @text    BGM Volume
 * @type    number
 * @desc    Set default Background Music volume.
 * Default: 100
 * @default 100
 * @max     100
 * @decimals 0
 * @parent  Default Values
 *
 * @param   bgsVolume
 * @text    BGS Volume
 * @type    number
 * @desc    Set default Background Sound volume.
 * Default: 100
 * @default 100
 * @max     100
 * @decimals 0
 * @parent  Default Values
 *
 * @param   meVolume
 * @text    ME Volume
 * @type    number
 * @desc    Set default Music Effect volume.
 * Default: 100
 * @default 100
 * @max     100
 * @decimals 0
 * @parent  Default Values
 *
 * @param   seVolume
 * @text    SE Volume
 * @type    number
 * @desc    Set default Sound Effect volume.
 * Default: 100
 * @default 100
 * @max     100
 * @decimals 0
 * @parent  Default Values
*/
'use strict';

(function() {
	
	const module = {
		plugin_name:'nyb_BaseConf',
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
			return !isNaN(value) ? value.clamp(0, 2147483647) : def;
		}
	};

	ImageCache.limit = module.uint('imageCacheLimit', 10) * 1000000;

	SceneManager._screenWidth  = module.uint('gameWidth', 1248);
	SceneManager._screenHeight = module.uint('gameHeight', 720);
	SceneManager._boxWidth     = Math.min(module.uint('menuWidth',  816), SceneManager._screenWidth);
	SceneManager._boxHeight    = Math.min(module.uint('menuHeight', 720), SceneManager._screenHeight);

	if(module.bool('disableFullscreen', false)) {
		Graphics._switchFullScreen = function() {
		};
	}

	if(module.bool('disableStretch', false)) {
		Graphics._switchStretchMode = function() {
		};
	}

	if(module.bool('disableFpsMeter', false)) {
		Graphics._switchFPSMeter = function() {
		};
	}

	{
		const Scene_Boot_initialize = Scene_Boot.prototype.initialize;
		const startFullscreen  = module.bool('startFullscreen',  false);
		const startStretched   = module.bool('startStretched',   false);
		const startFpsMeter    = module.bool('startFpsMeter',    false);
		
		const startMaximized   = module.bool('startMaximized',   false);
		const startAlwaysOnTop = module.bool('startAlwaysOnTop', false);
		const maxToFullscreen  = module.bool('maxToFullscreen',  false);
		const unmToFullscreen  = module.bool('unmToFullscreen',  false);
		const disableResize    = module.bool('disableResize',    false);
		let   ignoreOnceHack; // Stop startMaximized triggering maxToFullscreen
		
		Scene_Boot.prototype.initialize = function() {
			const win = require('nw.gui').Window.get();
			Scene_Boot.prototype.initialize = Scene_Boot_initialize;
			Scene_Boot_initialize.apply(this, arguments);
			
			if(startFpsMeter) {
				Graphics.showFps();
				Graphics._fpsMeter.showFps();
			}
			
			if(Graphics._stretchEnabled != startStretched) {
				Graphics._stretchEnabled = startStretched;
				Graphics._updateAllElements();
			}
			
			if(startFullscreen) {
				Graphics._requestFullScreen();
			}
			
			if(startAlwaysOnTop) {
				win.setAlwaysOnTop(true);
			}
			
			if(startMaximized) {
				win.maximize();
				if(maxToFullscreen) {
					ignoreOnceHack = true;
				}
			}
			
			if(maxToFullscreen) {
				win.on('maximize', function() {
					if(!ignoreOnceHack) {
						Graphics._requestFullScreen();
						return;
					}
					
					ignoreOnceHack = null;
				});
			}
			
			if(disableResize) {
				win.setResizable(false);
				
			}
		};
	}

	{
		const ConfigManager_applyData = ConfigManager.applyData;
		
		ConfigManager.applyData = function(config) {
			ConfigManager_applyData.apply(this, arguments);

			if(config['alwaysDash'] === undefined) {
				this.alwaysDash = module.bool('alwaysDash', false);
			}

			if(config['commandRemember'] === undefined) {
				this.commandRemember = module.bool('commandRemember', false);
			}

			if(config['bgmVolume'] === undefined) {
				this.bgmVolume = module.uint('bgmVolume', 100);
			}

			if(config['bgsVolume'] === undefined) {
				this.bgsVolume = module.uint('bgsVolume', 100);
			}

			if(config['meVolume'] === undefined) {
				this.meVolume = module.uint('meVolume', 100);
			}

			if(config['seVolume'] === undefined) {
				this.seVolume = module.uint('seVolume', 100);
			}
		};
	}

})();
