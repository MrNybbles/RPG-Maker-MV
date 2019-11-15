/* nyb_TileOffsets.js
 * Version: 20191115b
*/
/*:
 * @plugindesc Enables Tile Offsets via Terrain Tags!
 * @author MrNybbles
 *
 * @help [Description]
 * Useful for moving counters, furniture and wall decoration tiles
 * without sacrificing any additional tiles in the sprite sheet.
 *
 * [Layering & Layering Issues]
 * RPG Maker MV places rows of tiles, from left to right,
 * then the next row down.
 * This means shifting a Tile Up and/or Left will cause no Layering
 * issues because the tiles being covered have already been placed.
 *
 * However, tiles shifted Down and/or Right will be rendered over
 * unless placed in the Upper Layer in the Tileset Database.
 *
 *
 * [How to Change a Tile's Terrain Tag]
 * 1) Open the project in RPG Maker MV.
 * 2) Open the Database (click the Gear Icon or press F9).
 * 3) Inside the Database Window click the Tilesets tab on the left
 * 4) Click the Terrain Tag button on the right to edit the Tags.
 *    Left-click increments the Tag, Right-click decrements it.
 * 5) Set the Terrain Tag to match the Offsets below as desired.
 *
 *
 * [Notes]
 * 1) Every Tile has a Terrain Tag. By Default it is Tag 0.
 * 2) There are a total of 8 Terrain Tags (0 to 7). However, it is
 *    recommended you only use 1 to 7 and avoid the Default Tag 0.
 * 3) Offset tiles can be layered on top of each other.
 * 4) Shifted tiles will only show in-game (and not in the Editor).
 * 5) The origin is in the upper-left corner of the window so:
 * -X Moves tiles Left
 * -Y Moves tiles Up
 * +X Moves Tiles Right
 * +Y Moves tiles Down
 *
 *
 * [Tips]
 * 1) You can offset shelves and bookcases by half a tile and make
 *    the terrain walkable, players will have more room to walk.
 * 2) For small items (less than a tile in size) try using an existing
 *    Tile Offset and move the object on the Tileset Sheet the rest of the way.
 * 3) If you need the same tile at multiple offsets you will need
 *    multiple copies of the tile.
 * 4) It is STRONGLY recommended that you NEVER use Tag 0!
 *    Although unlikely, you may have a legit use for using it.
 *    However, Terrain Tag 0 is listed last to discourage its use!
 *
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
 * @param    Tag 1 Enable
 * @type     boolean
 * @desc     Enable Offsets for Terrain Tag 1 tiles.
 * Default:  false
 * @default  false
 *
 * @param    X Offset Tag 1
 * @type     number
 * @desc     X Offset of Terrain Tag 1 (-X moves Left).
 * @max      2147483647
 * @min     -2147483548
 * @default  0
 * @decimals 0
 * @parent   Tag 1 Enable
 *
 * @param    Y Offset Tag 1
 * @type     number
 * @desc     Y Offset of Terrain Tag 1 (-Y moves Up).
 
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 1 Enable
 *
 * @param    Layer Tag 1
 * @type     select
 * @desc     Override the tile Layer.
 * @option   Upper
 * @option   Normal
 * @option   Lower
 * @default  Normal
 * @parent   Tag 1 Enable
 *
 *
 * @param    Tag 2 Enable
 * @type     boolean
 * @desc     Enable Offsets for Terrain Tag 2 tiles.
 * @default  false
 *
 * @param    X Offset Tag 2
 * @type     number
 * @desc     X Offset of Terrain Tag 2 (-X moves Left).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 2 Enable
 *
 * @param    Y Offset Tag 2
 * @type     number
 * @desc     Y Offset of Terrain Tag 2 (-Y moves Up).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 2 Enable
 *
 * @param    Layer Tag 2
 * @type     select
 * @desc     Override the tile Layer.
 * @option   Upper
 * @option   Normal
 * @option   Lower
 * @default  Normal
 * @parent   Tag 2 Enable
 *
 *
 * @param    Tag 3 Enable
 * @type     boolean
 * @desc     Enable Offsets for Terrain Tag 3 tiles.
 * @default  false
 *
 * @param    X Offset Tag 3
 * @type     number
 * @desc     X Offset of Terrain Tag 3 (-X moves Left).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 3 Enable
 *
 * @param    Y Offset Tag 3
 * @type     number
 * @desc     Y Offset of Terrain Tag 3 (-Y moves Up).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 3 Enable
 *
 * @param    Layer Tag 3
 * @type     select
 * @desc     Override the tile Layer.
 * @option   Upper
 * @option   Normal
 * @option   Lower
 * @default  Normal
 * @parent   Tag 3 Enable
 *
 *
 * @param    Tag 4 Enable
 * @type     boolean
 * @desc     Enable Offsets for Terrain Tag 4 tiles.
 * @default  false
 *
 * @param    X Offset Tag 4
 * @type     number
 * @desc     X Offset of Terrain Tag 4 (-X moves Left).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 4 Enable
 *
 * @param    Y Offset Tag 4
 * @type     number
 * @desc     Y Offset of Terrain Tag 4 (-Y moves Up).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 4 Enable
 *
 * @param    Layer Tag 4
 * @type     select
 * @desc     Override the tile Layer.
 * @option   Upper
 * @option   Normal
 * @option   Lower
 * @default  Normal
 * @parent   Tag 4 Enable
 *
 *
 * @param    Tag 5 Enable
 * @type     boolean
 * @desc     Enable Offsets for Terrain Tag 5 tiles.
 * @default  false
 *
 * @param    X Offset Tag 5
 * @type     number
 * @desc     X Offset of Terrain Tag 5 (-X moves Left).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 5 Enable
 *
 * @param    Y Offset Tag 5
 * @type     number
 * @desc     Y Offset of Terrain Tag 5 (-Y moves Up).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 5 Enable
 *
 * @param    Layer Tag 5
 * @type     select
 * @desc     Override the tile Layer.
 * @option   Upper
 * @option   Normal
 * @option   Lower
 * @default  Normal
 * @parent   Tag 5 Enable
 *
 *
 * @param    Tag 6 Enable
 * @type     boolean
 * @desc     Enable Offsets for Terrain Tag 1 tiles.
 * @default  false
 *
 * @param    X Offset Tag 6
 * @type     number
 * @desc     X Offset of Terrain Tag 6 (-X moves Left).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 6 Enable
 *
 * @param    Y Offset Tag 6
 * @type     number
 * @desc     Y Offset of Terrain Tag 6 (-Y moves Up).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 6 Enable
 *
 * @param    Layer Tag 6
 * @type     select
 * @desc     Override the tile Layer.
 * @option   Upper
 * @option   Normal
 * @option   Lower
 * @default  Normal
 * @parent   Tag 6 Enable
 *
 *
 * @param    Tag 7 Enable
 * @type     boolean
 * @desc     Enable Offsets for Terrain Tag 7 tiles.
 * @default  false
 *
 * @param    X Offset Tag 7
 * @type     number
 * @desc     X Offset of Terrain Tag 7 (-X moves Left).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 7 Enable
 *
 * @param    Y Offset Tag 7
 * @type     number
 * @desc     Y Offset of Terrain Tag 7 (-Y moves Up).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 7 Enable
 *
 * @param    Layer Tag 7
 * @type     select
 * @desc     Override the tile Layer.
 * @option   Upper
 * @option   Normal
 * @option   Lower
 * @default  Normal
 * @parent   Tag 7 Enable
 *
 *
 * @param    Tag 0 Enable
 * @type     boolean
 * @desc     Enable Offsets for Terrain Tag 0 tiles. All tiles default to this so you probably want to leave this one alone!!!
 * @default  false
 *
 * @param    X Offset Tag 0
 * @type     number
 * @desc     X Offset of Terrain Tag 0 (-X moves Left).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 0 Enable
 *
 * @param    Y Offset Tag 0
 * @type     number
 * @desc     Y Offset of Terrain Tag 0 (-Y moves Up).
 * @default  0
 * @decimals 0
 * @max      2147483647
 * @min     -2147483548
 * @parent   Tag 0 Enable
 *
 * @param    Layer Tag 0
 * @type     select
 * @desc     Override the tile Layer.
 * @option   Upper
 * @option   Normal
 * @option   Lower
 * @default  Normal
 * @parent   Tag 0 Enable
*/
'use strict';

(function() {
	const module = {
		plugin_name:'nyb_TileOffsets',
		string:function(name, def) {
			let value = PluginManager.parameters(this.plugin_name)[name];
			return 'string' === typeof(value) ? value : def;
		},
		bool:function(name, def) {
			let value = PluginManager.parameters(this.plugin_name)[name];
			return 'string' === typeof(value) ? 'true' === value : def;
		},
		sint:function(name, def) {
			let value = parseInt(PluginManager.parameters(this.plugin_name)[name]);
			return !isNaN(value) ? value : def;
		}
	};
	
	let ConfigInfo = [];

	ConfigInfo[1] = module.bool('Tag 1 Enable', false) ? {
		x:(module.sint('X Offset Tag 1', 0)),
		y:(module.sint('Y Offset Tag 1', 0)),
		layer:(module.string('Layer Tag 1', ''))
	} : {x:0, y:0, layer:''};

	ConfigInfo[2] = module.bool('Tag 2 Enable', false) ? {
		x:(module.sint('X Offset Tag 2', 0)),
		y:(module.sint('Y Offset Tag 2', 0)),
		layer:(module.string('Layer Tag 2', ''))
	} : {x:0, y:0, layer:''};

	ConfigInfo[3] = module.bool('Tag 3 Enable', false) ? {
		x:(module.sint('X Offset Tag 3', 0)),
		y:(module.sint('Y Offset Tag 3', 0)),
		layer:(module.string('Layer Tag 3', ''))
	} : {x:0, y:0, layer:''};

	ConfigInfo[4] = module.bool('Tag 4 Enable', false) ? {
		x:(module.sint('X Offset Tag 4', 0)),
		y:(module.sint('Y Offset Tag 4', 0)),
		layer:(module.string('Layer Tag 4', ''))
	} : {x:0, y:0, layer:''};

	ConfigInfo[5] = module.bool('Tag 5 Enable', false) ? {
		x:(module.sint('X Offset Tag 5', 0)),
		y:(module.sint('Y Offset Tag 5', 0)),
		layer:(module.string('Layer Tag 5', ''))
	} : {x:0, y:0, layer:''};

	ConfigInfo[6] = module.bool('Tag 6 Enable', false) ? {
		x:(module.sint('X Offset Tag 6', 0)),
		y:(module.sint('Y Offset Tag 6', 0)),
		layer:(module.string('Layer Tag 6', ''))
	} : {x:0, y:0, layer:''};

	ConfigInfo[7] = module.bool('Tag 7 Enable', false) ? {
		x:(module.sint('X Offset Tag 7', 0)),
		y:(module.sint('Y Offset Tag 7', 0)),
		layer:(module.string('Layer Tag 7', ''))
	} : {x:0, y:0, layer:''};

	ConfigInfo[0] = module.bool('Tag 0 Enable', false) ? {
		x:(module.sint('X Offset Tag 0', 0)),
		y:(module.sint('Y Offset Tag 0', 0)),
		layer:(module.string('Layer Tag 0', ''))
	} : {x:0, y:0, layer:''};
	
	const terrainTag = function(x, y, idx) {
		if ($gameMap.isValid(x, y)) {
			const flags = $gameMap.tilesetFlags();
			const tiles = $gameMap.layeredTiles(x, y);
			
			if(idx < tiles.length) {
				const tag = flags[tiles[idx]] >> 12;
				
				if (tag > 0) {
					return tag;
				}
			}
		}
		
		return 0;
	};
	
	ShaderTilemap.prototype._paintTiles = function(startX, startY, x, y) {
		const mx = startX + x;
		const my = startY + y;
		const dx = x * this._tileWidth;
		const dy = y * this._tileHeight;
		const tileId0 = this._readMapData(mx, my, 0);
		const tileId1 = this._readMapData(mx, my, 1);
		const tileId2 = this._readMapData(mx, my, 2);
		const tileId3 = this._readMapData(mx, my, 3);
		const shadowBits   = this._readMapData(mx, my, 4);
		const upperTileId1 = this._readMapData(mx, my - 1, 1);
		const lowerLayer   = this.lowerLayer.children[0];
		const upperLayer   = this.upperLayer.children[0];
		
		let infoA = ConfigInfo[terrainTag(mx, my, 3)];
		let infoB = ConfigInfo[terrainTag(mx, my, 2)];

		if ((this._isHigherTile(tileId0) || 'Upper' === infoA.layer) && 'Lower' !== infoA.layer) {
			this._drawTile(upperLayer, tileId0, dx + infoA.x, dy + infoA.y);
		} else {
			this._drawTile(lowerLayer, tileId0, dx + infoA.x, dy + infoA.y);
		}
		
		if ((this._isHigherTile(tileId1) || 'Upper' === infoB.layer) && 'Lower' !== infoB.layer) {
			this._drawTile(upperLayer, tileId1, dx + infoB.x, dy + infoB.y);
		} else {
			this._drawTile(lowerLayer, tileId1, dx + infoB.x, dy + infoB.y);
		}

		this._drawShadow(lowerLayer, shadowBits, dx, dy);
		
		if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
			if (!Tilemap.isShadowingTile(tileId0)) {
				this._drawTableEdge(lowerLayer, upperTileId1, dx, dy);
			}
		}
		
		infoA = ConfigInfo[terrainTag(mx, my, 1)];
		infoB = ConfigInfo[terrainTag(mx, my, 0)];

		if (this._isOverpassPosition(mx, my)) {
			this._drawTile(upperLayer, tileId2, dx + infoA.x, dy + infoA.y);
			this._drawTile(upperLayer, tileId3, dx + infoB.x, dy + infoB.y);
		} else {
			if ((this._isHigherTile(tileId2) || 'Upper' === infoA.layer) && 'Lower' !== infoA.layer) {
				this._drawTile(upperLayer, tileId2, dx + infoA.x, dy + infoA.y);
			} else {
				this._drawTile(lowerLayer, tileId2, dx + infoA.x, dy + infoA.y);
			}
			
			if ((this._isHigherTile(tileId3) || 'Upper' === infoB.layer) && 'Lower' !== infoB.layer) {
				this._drawTile(upperLayer, tileId3, dx + infoB.x, dy + infoB.y);
			} else {
				this._drawTile(lowerLayer, tileId3, dx + infoB.x, dy + infoB.y);
			}
		}
	};

})();
