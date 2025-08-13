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

        // setCamPos(map.pos)
        // setCamScale(5)

        map.add([sprite("map"), pos(0, 0), layer('bg'), scale(5)])

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
                            scale(5),
                            {
                                speed: 300,
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
    const gameWidth = store.getState().setting.width
    const gameHeight = store.getState().setting.height

    player.onUpdate(() => {
        if(!isKeyDown()){
            player.stop()
        }

        // 
        if (isKeyDown("left")){
            if(player.curAnim() === undefined){
                player.play("left")
            }
            
            const pos = checkPosition()
            if(pos.x > 0) player.move(-player.speed, 0)
            
            checkStep()
        }
        if (isKeyDown("right")){
            if(player.curAnim() === undefined){
                player.play("right")
            }

            const pos = checkPosition()
            if((pos.x + player.width) < gameWidth) player.move(player.speed, 0)

            checkStep()
        }
        if (isKeyDown("up")){
            if(player.curAnim() === undefined){
                player.play("up")
            }

            const pos = checkPosition()
            if((pos.y - player.height) > 0) player.move(0, -player.speed)

            checkStep()
        }
        if (isKeyDown("down")){
            if(player.curAnim() === undefined){
                player.play("down")
            }

            const pos = checkPosition()
            if((pos.y + player.height) < gameHeight) player.move(0, player.speed)

            checkStep()
        }

        if (isKeyDown('escape')){
            store.dispatch(
                setMenu(1)
            )
        }
    })
}

const checkPosition = () => {
    const worldPos = player.worldPos()
    console.log('worldPos', worldPos)
    return worldPos
}


const checkStep = () => {
    // setCamPos(player.pos)
    player.step += 1

    const limit = 10
    if(player.step === limit){
        // Decide if player encounter a battle
        player.step = 0
    }
}
