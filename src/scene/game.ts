import k from '../lib/kaplay'

import store from '../store/store'; // Assuming RootState is defined in your store
import {
  setMenu
} from '../store/game';
import { GameObj } from 'kaplay';

const {
    add,
    pos, 
    sprite,
    scale,    
    area,
    scene, 
    loadSprite, 
    loadSpriteAtlas,
    body,
    go, 
    setLayers,
    getLayers,
    layer,
    loadFont,
    setCamPos,
    getCamPos,
    setCamScale,
    getCamScale,
    onUpdate,
    isKeyDown,
    play,
} = k

let player : GameObj = {} as GameObj

// region Init Game
export default function initGame(){
    const gameWidth = store.getState().setting.width
    const gameHeight = store.getState().setting.height

    // Scenes can accept argument from go()

    // Define layers
    const layers = getLayers()
    if(!layers) setLayers(['bg', 'game', "fg"], "game")

    scene('game', async() => {
        // Reference: https://jslegenddev.substack.com/p/how-to-use-tiled-with-kaboomjs
        loadSpriteAtlas('character/swordsman_spritesheet.png', 'character/swordsman_spritesheet.json')

        loadSprite('map', 'bg/test_map.png')

        const mapData = await (await fetch('bg/test_map.json')).json()
        const map = add([pos(0, 0)])

        setCamPos(map.pos)
        setCamScale(5)

        map.add([sprite("map"), layer('bg')])

        for(const layer of mapData.layers){
            if (layer.type === "tilelayer") continue;

            if (layer.name === "colliders") {
                for (const object of layer.objects) {
                    map.add([
                        area({ shape: new k.Rect(k.vec2(0), object.width, object.height)   }),
                        body({ isStatic: true }),
                        pos(object.x, object.y),
                    ]);
                }
                continue;
            }    
            
            if (layer.name === "positions") {
                for (const object of layer.objects) {
                    if (object.name === "player") {
                        player = map.add([
                            sprite("player", { frame: 2 }), // idle frame of the player sprite
                            area(),
                            pos(object.x, object.y),
                            {
                                speed: 75,
                                step: 0
                            }
                        ]);
                        console.log('player', player)
                        setControl()
                        continue;
                    }
                }
            }            
        }

        console.log(map)
    })
    
    go('game')
}
// endregion

const setControl = () => {
    player.onUpdate(() => {
        if(!isKeyDown()){
            player.stop()
        }

        // 
        if (isKeyDown("left")){
            player.move(-player.speed, 0)
            if(player.curAnim() === undefined){
                player.play("left")
            }
            checkStep()
        }
        if (isKeyDown("right")){
            player.move(player.speed, 0)
            if(player.curAnim() === undefined){
                player.play("right")
            }
            checkStep()
        }
        if (isKeyDown("up")){
            player.move(0, -player.speed)
            if(player.curAnim() === undefined){
                player.play("up")
            }
            checkStep()
        }
        if (isKeyDown("down")){
            player.move(0, player.speed)
            if(player.curAnim() === undefined){
                player.play("down")
            }
            checkStep()
        }

        if (isKeyDown('escape')){
            store.dispatch(
                setMenu(1)
            )
        }
    })
}

const checkStep = () => {
    player.step += 1

    const limit = 10
    if(player.step === limit){
        // Decide if player encounter a battle
        player.step = 0
    }
}
