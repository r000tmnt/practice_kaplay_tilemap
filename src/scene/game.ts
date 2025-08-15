import k from '../lib/kaplay'

import store from '../store/store'; // Assuming RootState is defined in your store
import {
  setMenu
} from '../store/game';
import { GameObj, TweenController } from 'kaplay';

const {
    add,
    pos, 
    sprite,
    scale,    
    anchor,
    area,
    scene, 
    loadSprite, 
    loadSpriteAtlas,
    body,
    opacity,
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
    onClick,
    isKeyDown,
    isKeyPressed,
    tween,
    loop,
    vec2,
    easings,
} = k

let player : GameObj = {} as GameObj
let mapArrows : TweenController[] = []

// region Init Game
export default function initGame(){
    // Scenes can accept argument from go()

    // Define layers
    const layers = getLayers()
    if(!layers) setLayers(['bg', 'game', "fg"], "game")

    scene('game', async() => {
        const gameWidth = store.getState().setting.width
        const gameHeight = store.getState().setting.height

        // Reference: https://jslegenddev.substack.com/p/how-to-use-tiled-with-kaboomjs
        loadSpriteAtlas('character/swordsman_spritesheet.png', 'character/swordsman_spritesheet.json')

        loadSprite('map', 'bg/test_map.png')

        loadSprite('arrow', 'ui/arrow.png')

        loadFont('bebasNeue_regular', 'font/BebasNeue-Regular.ttf', { outline: 4 })

        const mapData = await (await fetch('bg/test_map.json')).json()
        const map = add([pos(0, 0)])

        const { width, height, tilewidth } = mapData

        setCamPos(map.pos.x + ((tilewidth * width) / 2), map.pos.y + ((tilewidth * height) / 2))
        setCamScale(5)

        map.add([sprite("map"), pos(0, 0), layer('bg')])

        for(const layer of mapData.layers){
            if (layer.type === "tilelayer") continue;

            if (layer.name === "colliders") {
                for (const object of layer.objects) {
                    map.add([
                        area({ shape: new k.Rect(k.vec2(0), object.width, object.height)   }),
                        body({ isStatic: true }),
                        pos(object.x, object.y),
                        // tags
                        "pit"
                    ]);
                }
                continue;
            }    

            if (layer.name === 'exits'){
                let index = -1
                for (const object of layer.objects) {
                    index += 1
                    map.add([
                        area({ shape: new k.Rect(k.vec2(0), object.width, object.height)   }),
                        body(),
                        pos(object.x, object.y),
                        // tags
                        "exit"
                    ]);

                    const arrow = map.add([
                        sprite('arrow'),
                        opacity(1),
                        anchor('center'),
                        pos(object.x + (tilewidth /2) - 1, object.y - 10),
                        // tags
                        "arrow"
                    ])

                    setMapArrow(arrow, true, index)
                }
                continue;
            }
            
            if (layer.name === "positions") {
                for (const object of layer.objects) {
                    if (object.name === "player") {
                        player = map.add([
                            sprite("player", { frame: 2 }), // idle frame of the player sprite
                            area(),
                            body(),
                            pos(object.x, object.y),
                            {
                                speed: 75,
                                step: 0
                            },
                            // tags
                            "player"
                        ]);
                        console.log('player', player)
                        setControl(width * tilewidth, height * tilewidth)
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

const setControl = (mapWidth: number, mapHeight: number) => {
    player.onUpdate(() => {
        const menuOpen = store.getState().game.menuOpen

        if(menuOpen > 0){
            player.stop()
            return
        }

        if(!isKeyDown()){
            player.stop()
        }

        if (isKeyDown("left")){
            if(player.curAnim() !== "left") player.play("left")

            const pos = checkPosition()
            if(pos.x > 0 ) player.move(-player.speed, 0)
            
            checkStep()
        }
        if (isKeyDown("right")){
            if(player.curAnim() !== "right") player.play("right")

            const pos = checkPosition()
            if((pos.x + player.width) < mapWidth ) player.move(player.speed, 0)

            checkStep()
        }
        if (isKeyDown("up")){
            if(player.curAnim() !== "up") player.play("up")

            const pos = checkPosition()
            if(pos.y > 0 ) player.move(0, -player.speed)

            checkStep()
        }
        if (isKeyDown("down")){
            if(player.curAnim() !== "down") player.play("down")

            const pos = checkPosition()
            if((pos.y + player.height) < mapHeight ) player.move(0, player.speed)

            checkStep()
        }
    })

    player.onCollide("exit", (any) => {
        console.log('onCollide', any)
        console.log('player leaveing the map')
    })

    // onClick('player', (sprite) => {
    //     console.log('player', sprite)
    // })

    // player.onCollideUpdate("pit", (any) => {
    //     console.log('onCollideUpdate', any)
    // })

    // player.onCollideEnd("pit", (any) => {
    //     console.log('onCollideEnd', any)
    // })

    onUpdate(() => {
        if (isKeyPressed('escape')){
            console.log('escape key pressed')
            const menuOpen = store.getState().game.menuOpen
            store.dispatch(
                setMenu(menuOpen? 0 : 1)
            )

            // Pause moving objects
            mapArrows.forEach(arrow => {
                arrow.paused = menuOpen > 0? false : true
            })
        }
    })
}

const checkPosition = () => {
    const worldPos = player.worldPos()
    // console.log('worldPos', worldPos)
    return worldPos
}

const setMapArrow = (arrow: GameObj, floating: boolean, index: number) => {
    const controller = tween(
        arrow.pos,
        vec2(arrow.pos.x, floating? arrow.pos.y + 5 : arrow.pos.y - 5),
        0.5,
        (p) => arrow.pos = p,
        easings.easeInOutBounce
    )
    
    controller.onEnd(() => { setMapArrow(arrow, !floating, index) })

    mapArrows[index] = controller
}

const checkStep = () => {
    // setCamPos(player.pos)
    player.step += 1

    const limit = 10
    const rate = 8
    if(player.step === limit){
        // Decide if player encounter a battle
        const rng = Math.random() * 10

        if(rng <= rate){
            console.log('Battle encounter!')
        }

        player.step = 0
    }
}
