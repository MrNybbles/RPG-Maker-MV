# RPG Maker MV Plugins

## Introduction
This is a growing collection of RPG Maker MV Plugins made by MrNybbles for his own projects.
They are available to others to use in commercial and/or non-commercial projects via the 
[The MIT License](https://opensource.org/licenses/MIT).

### nyb_BaseConf.js
* Set Image Cache Limit
* Window Options
  * Game Window Always on Top
  * Game Window starts Maximized
  * Game Window Maximize will Full-screen
  * Game Window disable Resizing
* Game Dimensions
  * Game Window Width
  * Game Window Height
  * Game Menu Width
  * Game Menu Height
* Disable Hotkeys
  * Disable Full-screen Hotkey
  * Disable Stretch Hotkey
  * Disable FPS/Delay Meter Hotkey
* Start Enabled
  * Start with Full-screen
  * Start with Stretched Mode
  * Start with FPS Meter
* Default Settings
  * Always Dash
  * Command Remember
  * BGM Volume
  * BGS Volume
  * ME Volume
  * SE Volume

This very useful plugin mostly deals with the Game Window and Default Settings.


### nyb_Commands.js
Adds the following Plugin Commands:
`comevt` -- Allows a Map Event to call a Common Event as if the event were inside the Calling Map Event.
`mapevt` -- Allows Map Events to call another Map Event as if the Calling Map Event contained the Event Commands.
`scene` --  Allows telling the Scene Manager to push/pop/goto the specified scene.

This very useful plugin allows for common Event Commands to be executed by different events.
Just make sure the common Event Commands refer to 'This Event' when the Calling Map Event is the one needing to do something.


### nyb_CompressedDataDir.js
Compresses the .json database files in the `data/` directory (including map files).
After deployment run the game once to compress all the database files.
This effectivly compresses and obfuscates the file contents.

Does not compress during Play Test mode.


### nyb_DB.js
Adds a way to load additional database files to a global location when the game starts.
This is a very situational plugin.


### nyb_DevTools.js
* Show the Dev Console during Play Testing.
* Allow/Disallow the Console to steal Input focus.
* Skip the distracting PIXI banner from you-know-where. . .
* Skip the Title Screen and begin with a new game.

A very useful Developer Tools plugin.


### nyb_MapScale.js
A simple plug-in to magnify the size of the map without affecting parallaxing or GUIs. Works well with 


### nyb_MouseCommand.js
* Provides automatic hiding of the mouse after being idle for a specified amount of time.
* The `mouse` command has several uses.
  * Graphically change the mouse pointer.
  * Lock/unlock the mouse.
  * Directly show/hide the mouse.
  * Enable/disable/adjust the idle timeout.

Useful for getting rid of the mouse cursor for those playing with a keyboard or gamepad.


### nyb_TileOffsets.js
This plugin makes use of the Tile Terrain IDs to offset the placement of the specified tiles.
Useful for moving counters, furniture and wall decoration tiles without sacrificing any additional tiles in the sprite sheet.


## License
Free to use in both commercial and non-commercial projects.
[The MIT License](https://opensource.org/licenses/MIT)
