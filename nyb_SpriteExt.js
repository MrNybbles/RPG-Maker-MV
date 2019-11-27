/* nyb_SpriteExt.js
 * Version: 20191126a
*/
/*:
 * @plugindesc Customized Grid-based Sprites.
 * @author MrNybbles
 *
 * @help [Description]
 *  Applies custom Sprite animation based on filename suffix to both
 *  Events and the Player.
 *
 * _______RpgMV_CPACK *
 * Row   |  3  |  9
 * Col   |  4  |  8
 * Idle  |  1  |  0
 * First |  0  |  1
 * Total |  3  |  8
 * Shift |  6  |  0
 *
 * RpgMV -- ((ch) => (9 - ch.realMoveSpeed()) * 3)
 * CPACK -- ((ch) => (9 - ch.realMoveSpeed()))
 *
 * * RpgMV -- RPG Maker MV default character sprites.
 *   CPACK -- Customizable Pixel Art Character Kit.
 *
 * [Notes]
 *  Rows are the number of animation frames in the sequence.
 *  Cols are the number of animation sequences.
 *  You can add as many custom animation sequences as you want.
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
 * @param   Sprites
 * @type    struct<Sprite>[]
 * @desc    Animation sequences
*/
/*~struct~Sprite:
 * @param    suffix
 * @text     Sprite Filename Suffix
 * @type     string
 * @desc     Only apply this Animation to files with this suffix.
 *           Leave blank to apply to all files.
 * @default
 *
 * @param    eight_way
 * @text     Enable 8-Way Movement
 * @type     boolean
 * @desc     Enable moving the player character in 8 directions.
 * Default:  false
 * @default  false
 *
 * @param    xcells
 * @text     Cells per Row
 * @type     number
 * @desc     Number of Sprite cells per row.
 * Default:  3
 * @default  3
 * @min      0
 * @max      2147483647
 * @decimals 0
 *
 * @param    ycells
 * @text     Cells per Column
 * @type     number
 * @desc     Number of Sprite cells per column. Must be 4 or 8.
 * Default:  4
 * @default  4
 * @min      0
 * @max      2147483647
 * @decimals 0
 *
 * @param    idle
 * @text     Idle Frame Index
 * @type     number
 * @desc     The frame index used when not moving.
 * Default:  1
 * @default  1
 * @min      0
 * @max      2147483647
 * @decimals 0
 *
 * @param    first
 * @text     Start Sequence Frame
 * @type     number
 * @desc     The first frame index of each movement sequence.
 * Default:  0
 * @default  0
 * @min      0
 * @max      2147483647
 * @decimals 0
 *
 * @param    total
 * @text     Sequence Frames
 * @type     number
 * @desc     The total number of frames in a sequence.
 * Default:  3
 * @default  3
 * @min      0
 * @max      2147483647
 * @decimals 0
 *
 * @param    shiftY
 * @text     Shift Y
 * @type     number
 * @desc     How far up to shift the sprite relative to the tile.
 * Default:  6
 * @default  6
 * @min     -2147483648
 * @max      2147483647
 * @decimals 0
 *
 * @param    wait
 * @text     Animation Wait Function
 * @type     string
 * @desc     Returns the delay used before cycling to the next frame.
 * Default:  ((ch) => (9 - ch.realMoveSpeed()) * 3)
 * @default  ((ch) => (9 - ch.realMoveSpeed()) * 3)

*/
'use strict';

(function() {
	
	const module = {
		plugin_name:'nyb_SpriteExt',
		sint_clamp:function(value, def) {
			return !isNaN(value) ? value <= 2147483647 ? value >= -2147483648 ?
			(value<<0): -2147483648 : 2147483647 : def;
		},
		uint_clamp:function(value, def) {
			return !isNaN(value) ? value <= 2147483647 ? value >= 0 ?
			(value<<0) : 0 : 2147483647 : def;
		},
		json:function(name, def) {
			const value = PluginManager.parameters(this.plugin_name)[name];
			return value ? JSON.parse(value) : def;
		}
	};
	
	const sprites = module.json('Sprites', null) || [];

	sprites.forEach(function(sprite, idx, arr) {
		const tmp  = JSON.parse(sprite);
		tmp.wait   = eval(tmp.wait);
		tmp.first  = module.uint_clamp(tmp.first,  0);
		tmp.total  = module.uint_clamp(tmp.total,  3);
		tmp.idle   = module.uint_clamp(tmp.idle,   1);
		tmp.xcells = module.uint_clamp(tmp.xcells, 3);
		tmp.ycells = module.uint_clamp(tmp.ycells, 4);
		tmp.shiftY = module.sint_clamp(tmp.shiftY, 6);
		arr[idx]   = tmp;
	});
	{
		const Sprite_Character_characterBlockX = function() {
			return this._character.characterIndex() % this._character._customSprite.xcells * this._character._customSprite.ycells;
		};

		const Sprite_Character_characterBlockY = function() {
			return Math.floor(this._character.characterIndex() / this._character._customSprite.xcells) * this._character._customSprite.xcells;
		};

		const Sprite_Character_characterPatternX = function() {
			return this._character.pattern();
		};

		const Sprite_Character_characterPatternY = function() {
			switch(this._character.direction()) {
				case 1:  return 1;
				case 2:  return 0;
				case 3:  return 7;
				case 4:  return 2;
				case 5:  return 0;
				case 6:  return 6;
				case 7:  return 3;
				case 8:  return 4;
				case 9:  return 5;
				default: return 0;
			}
		};

		const Sprite_Character_patternWidth = function() {
			return this.bitmap.width / this._character._customSprite.xcells;
		};

		const Sprite_Character_patternHeight = function() {
			return this.bitmap.height / this._character._customSprite.ycells;
		};
		
		const Game_Player_getInputDirection = function() {
			return Input.dir8;
		};
		
		const Game_Player_executeMove = function(direction) {
			if(!(direction & 1)) {
				this.moveStraight(direction);
			} else {
				this.moveDiagonally(direction);
			}
		};
		
		const Game_CharacterBase_moveDiagonally8 = function(direction) {
			const horz = 1 === direction || 7 === direction ? 4 : 6
			const vert = direction <= 5 ? 2 : 8;
			
			this.setMovementSuccess(this.canPassDiagonally(this._x, this._y, horz, vert));
			
			if (this.isMovementSucceeded()) {
				this._x = $gameMap.roundXWithDirection(this._x, horz);
				this._y = $gameMap.roundYWithDirection(this._y, vert);
				this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(horz));
				this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(vert));
				this.increaseSteps();
			}
			
			this.setDirection(direction);
		};
		
		const Game_CharacterBase_moveDiagonally4 = function(direction) {
			Game_CharacterBase.prototype.moveDiagonally.call(this,
				1 === direction || 7 === direction ? 4 : 6,
				direction <= 5 ? 2 : 8
			);
		}
		
		const Game_CharacterBase_shiftY = function() {
			return this._customSprite.shiftY;
		};
		
		const Game_CharacterBase_straighten = function() {
			if ((this.hasWalkAnime() || this.hasStepAnime())) {
				this._pattern = this._customSprite.idle;
			}
			
			this._animationCount = 0;
		};
		
		const Game_CharacterBase_maxPattern = function() {
			return (this._customSprite.first+this._customSprite.total);
		};
		
		const Game_CharacterBase_pattern = function() {
			if(this.isMoving() || this._moveFrequency >= 5 || ("Game_Player" === this.constructor.name && 0 !== this.getInputDirection())) {
				return (this._pattern < this.maxPattern()) && (this._pattern >= this._customSprite.first) ?
					this._pattern : this._customSprite.first;
			}
			
			if("Game_Player" !== this.constructor.name) {
				console.info(this._pattern);
			}
			
			return this._customSprite.idle;
		};
		
		const Game_CharacterBase_resetPattern = function() {
			this.setPattern(this._customSprite.first);
		};
		
		const Game_CharacterBase_animationWait = function() {
			return this._customSprite.wait(this);
		};
		
		const Sprite_Character_initialize = Sprite_Character.prototype.initialize;
		
		Sprite_Character.prototype.initialize = function(character) {
			Sprite_Character_initialize.call(this, character);
			
			const sprite = sprites.find((sprite) =>
				character._characterName.endsWith(sprite.suffix)
			);
			
			if(sprite) {
				this.characterBlockX    = Sprite_Character_characterBlockX;
				this.characterBlockY    = Sprite_Character_characterBlockY;
				this.characterPatternX  = Sprite_Character_characterPatternX;
				this.characterPatternY  = Sprite_Character_characterPatternY;
				this.patternWidth       = Sprite_Character_patternWidth;
				this.patternHeight      = Sprite_Character_patternHeight;
				
				character._customSprite = sprite;
				character.executeMove   = Game_Player_executeMove;
				
				if(sprite.eight_way) {
					character.getInputDirection  = Game_Player_getInputDirection;
					if(8 === sprite.ycells) {
						character.moveDiagonally = Game_CharacterBase_moveDiagonally8;
					} else {
						character.moveDiagonally = Game_CharacterBase_moveDiagonally4;
					}
				}
				
				character.shiftY        = Game_CharacterBase_shiftY;
				character.straighten    = Game_CharacterBase_straighten;
				character.maxPattern    = Game_CharacterBase_maxPattern;
				character.pattern       = Game_CharacterBase_pattern;
				character.resetPattern  = Game_CharacterBase_resetPattern;
				character.animationWait = Game_CharacterBase_animationWait;
			}
		}
	}
})();
