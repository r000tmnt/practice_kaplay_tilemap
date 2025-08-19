import k from '../lib/kaplay'

import store from '../store/store'; // Assuming RootState is defined in your store
import {
  setMenu
} from '../store/game';
import { Game, GameObj, TweenController } from 'kaplay';
import Big from 'big.js';

const {
    add,
    pos, 
    sprite,
    scale,    
    rotate,
    get,
    usePostEffect,
    anchor,
    area,
    color,
    scene, 
    loadSprite, 
    loadSpriteAtlas,
    loadShaderURL,
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
    getAsset,
    onUpdate,
    onClick,
    isKeyDown,
    isKeyPressed,
    tween,
    loop,
    vec2,
    easings,
    uvquad
} = k

let map : GameObj = {} as GameObj
let player : GameObj = {} as GameObj
let mapArrows : { timer: TweenController, sprite: GameObj }[] = []
let collidedObjs: GameObj[] = []

/**
 * If player leaves the map and direction. Mark with num pad notation.
 * @value 8 - top
 * @value 6 - right
 * @value 2 - down
 * @value 4 - left
 * @value 1 - exiting
 * @value 0 - null
 * @PS Floating number means the direction with multiple exits 
 */
let exitTouched: number = 0

let ready = false

// region Init Game
export default function initGame(){
    // Scenes can accept argument from go()

    // Define layers
    const layers = getLayers()
    if(!layers) setLayers(['bg', 'game', "fg"], "game")

    scene('game', async(map = null) => {
        // Reference: https://jslegenddev.substack.com/p/how-to-use-tiled-with-kaboomjs
        loadSpriteAtlas('character/swordsman_spritesheet.png', 'character/swordsman_spritesheet.json')

        loadSprite('arrow', 'ui/arrow.png')

        loadFont('bebasNeue_regular', 'font/BebasNeue-Regular.ttf', { outline: 4 })

        loadShaderURL("fadeTransition", null, 'shaders/fade_transition.frag')

        setMap(map?? 'test_map')
    })
    
    go('game')
}
// endregion

const setMap = async(name: string) => {
    if(!getAsset(name)){
        loadSprite(name, `bg/${name}.png`)
    }

    const mapData = await (await fetch(`bg/${name}.json`)).json()
    map = add([pos(0, 0)])

    const { width, height, tilewidth } = mapData

    const mapWidth = width * tilewidth
    const mapHeight = height * tilewidth

    setCamPos(map.pos.x + ((tilewidth * 9) / 2), map.pos.y + ((tilewidth * 16) / 2))
    setCamScale(5)

    map.add([
        sprite(name), 
        pos(0, 0), 
        layer('bg'),
    ])

    // custom property
    map.tileWidth = tilewidth
    map.aspectRatio = [9, 16]

    for(const layer of mapData.layers){
        if (layer.type === "tilelayer") continue;

        if (layer.name === "colliders") {
            for (const object of layer.objects) {
                map.add([
                    area({ shape: new k.Rect(k.vec2(0), object.width, object.height)   }),
                    body({ isStatic: true }),
                    pos(object.x, object.y),
                    // tags
                    "obstacle"
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
                    "exit",
                    // Get direction from name
                    {
                        direction: new Big(Number(object.name)),
                        linked: object.properties.find(param => param.name === 'linked').value,
                        map: object.properties.find(param => param.name === 'map').value
                    }
                ]);

                // TODO - Rotate the sprite if needed
                const arrow = map.add([
                    sprite('arrow'),
                    opacity(1),
                    anchor('center'),
                    rotate(),
                    Number(object.name) >= 8? 
                    pos(
                        object.x + (tilewidth /2) - 1, // center    
                        object.y + 10  // top                        
                    ):
                    Number(object.name) >= 6?
                    pos(
                        object.x - 10, // right
                        object.y + (tilewidth /2) - 1 // center,                        
                    ):
                    Number(object.name) >= 4?
                    pos(
                        object.x + 10, // left
                        object.y + (tilewidth /2) - 1 // center                            
                    ):
                    pos(
                        object.x + (tilewidth /2) - 1, // center                           
                        object.y - 10, // down
                    ),
                    // tags
                    "arrow",
                    // Get direction from name
                    {
                        direction: Number(object.name)
                    }                    
                ])

                setMapArrow(arrow, true, index)
            }
            continue;
        }

        if(layer.name === 'items'){
            for (const object of layer.objects) {
                createItemSprite(object.name, object.x, object.y, object.width, object.height, object.properties)
            }            
        }
        
        if (layer.name === "positions") {
            for (const object of layer.objects) {
                if (object.name === "player" && !exitTouched) {
                    createPlayerSprite(object.x, object.y, mapWidth, mapHeight)
                    continue;
                }
            }
        }       
    }

    if(exitTouched > 0){
        const exit = map.children.find(child => child.direction && child.direction.eq(exitTouched))
        if(exit){
            switch(true){
                case exitTouched >= 8: // top
                    createPlayerSprite(exit.pos.x, exit.pos.y + 5, mapWidth, mapHeight)
                break;
                case exitTouched >= 6: // right
                    createPlayerSprite(exit.pos.x - (player.width + 5), exit.pos.y, mapWidth, mapHeight)
                break;
                case exitTouched >= 2: // down
                    createPlayerSprite(exit.pos.x, exit.pos.y - (player.height + 5), mapWidth, mapHeight)
                break;
                case exitTouched >= 4: // left
                    createPlayerSprite(exit.pos.x + 5, exit.pos.y, mapWidth, mapHeight)
                break;   
            }            
        }
    }    

    console.log(map)    
}

const createPlayerSprite = (x: number, y: number, mapWidth: number, mapHeight: number, direction=8) => {
    player = map.add([
        sprite("player", { 
            frame: (direction === 2)? 20: // down, facing top
                   (direction === 4)? 8 : // left, facing right
                   (direction === 6)? 14 : // right, facing left
                   (direction === 8)? 2 : 0, // top, facing down
        }), // idle frame of the player sprite
        area(),
        body(),
        pos(x, y),
        {
            speed: 75,
            step: 0
        },
        // tags
        "player"
    ]);
    console.log('player', player)

    // Add an invisible area for the player
    player.add([
        area({ shape: new k.Rect(k.vec2(0), map.tileWidth, map.tileWidth) }),
        // Position relative to the player
        pos(0, player.height),
    ])

    // #region Player control
    player.onUpdate(() => {
        if(!ready) return

        const menuOpen = store.getState().game.menuOpen

        if(menuOpen > 0) return

        if(!isKeyDown()){
            player.stop()
            // setCameraPosition(mapWidth, mapHeight)
        }

        if (isKeyDown("left")){
            setCameraPosition(mapWidth, mapHeight)
            if(player.curAnim() !== "left") player.play("left")

            const pos = player.worldPos()
            if(pos.x > 0 ) player.move(-player.speed, 0)
            // Move the invisible area
            player.children[0].pos.x = -map.tileWidth
            player.children[0].pos.y = (player.height - map.tileWidth)
                
            checkStep()
        }
        if (isKeyDown("right")){
            setCameraPosition(mapWidth, mapHeight)
            if(player.curAnim() !== "right") player.play("right")

            const pos = player.worldPos()
            if((pos.x + player.width) < mapWidth ) player.move(player.speed, 0)
            // Move the invisible area
            player.children[0].pos.x = player.width
            player.children[0].pos.y = (player.height - map.tileWidth)                

            checkStep()
        }
        if (isKeyDown("up")){
            setCameraPosition(mapWidth, mapHeight)
            if(player.curAnim() !== "up") player.play("up")

            const pos = player.worldPos()
            if(pos.y > 0 ) player.move(0, -player.speed)
            // Move the invisible area
            player.children[0].pos.x = 0
            player.children[0].pos.y = -map.tileWidth                

            checkStep()
        }
        if (isKeyDown("down")){
            setCameraPosition(mapWidth, mapHeight)
            if(player.curAnim() !== "down") player.play("down")

            const pos = player.worldPos()
            if((pos.y + player.height) < mapHeight ) player.move(0, player.speed)
            // Move the invisible area
            player.children[0].pos.x = 0
            player.children[0].pos.y = player.height              

            checkStep()
        }
    })

    onUpdate(() => {
        if(!ready) return

        if (isKeyPressed('escape')){
            console.log('escape key pressed')
            const menuOpen = store.getState().game.menuOpen

            // TODO - Close inner menu
            store.dispatch(
                setMenu(menuOpen? 0 : 1)
            )

            // Pause moving objects
            mapArrows.forEach(arrow => {
                arrow.timer.paused = menuOpen > 0? false : true
            })
        }

        if (isKeyPressed('enter')){
            for(const obj of collidedObjs){
                const isOverlapping = player.children[0].isOverlapping(obj)

                if(isOverlapping && obj.tags.find(t => t === 'item')){
                    // Interact with the object    
                    InteractWithObject(obj) 
                    return
                }
            }  
        }
    })

    // #region Player exit
    player.onCollide("exit", (exit: GameObj) => {
        if(!exitTouched){
            exitTouched = 1
            console.log('onCollide', exit)
            console.log('player leaving the map')

            // Stop everything
            ready = false

            // const gameWidth = store.getState().setting.width
            // const gameHeight = store.getState().setting.height

            // Go to the pointed position
            if(exit.linked > 0){
                exitTouched = exit.linked 
            }else{
                // Go to the relative position
                switch(true){
                    case exit.direction >= 8: // top
                        exitTouched = exit.direction.minus(6)
                    break;
                    case exit.direction >= 6: // right
                        exitTouched = exit.direction.minus(2)
                    break;
                    case exit.direction >= 2: // down
                        exitTouched = exit.direction.plus(6)
                    break;
                    case exit.direction >= 4: // left
                        exitTouched = exit.direction.plus(2)
                    break;                                        
                }               
            }

            // TODO - Map transition
            // Reference: https://play.kaplayjs.com/?example=postEffect
            let progress = 0
            tween(
                progress,
                1,
                0.3,
                (v) => { 
                    usePostEffect("fadeTransition", () => ({ "u_progress": v }))
                },
                easings.easeInOutQuad
            ).onEnd(() => {
                // TODO - Destroy game objects when the screen black out
                console.log("screen filled")
                map.children.forEach(child => child.destroy())
                map.destroy()
                mapArrows.forEach(arrow => {
                    arrow.timer.cancel()
                })
                mapArrows.splice(0)

                // TODO - Load the next map
                // setMap(exit.map)
                go('game', exit.map)
            })   
        }
    })
    // #endregion   

    // If map switched
    if(exitTouched > 0){
        // Reset value
        exitTouched = 0
        let opacity = 1

        // TODO - Reveal the screen when everything is ready
        tween(
            opacity,
            0,
            0.3,
            (v) => { 
                usePostEffect("fadeTransition", () => ({ "u_progress": v }))
            },
            easings.easeInOutQuad
        )        
    }

    // Enable control
    ready = true
}

// #region Camera position
const setCameraPosition = (mapWidth: number, mapHeight: number) => {
    // Decide to move the camera or not
    // const { x, y } = player.pos
    const { tileWidth, aspectRatio } = map
    const middleX = (tileWidth * aspectRatio[0]) / 2 
    const middleY = (tileWidth * aspectRatio[1]) / 2 

    const wPos = player.worldPos()
    let inX = false, inY = false;

    console.log(wPos)

    // Player pos relative to the game world
    if((wPos.x + middleX) <= mapWidth && (wPos.x - middleX) >= 0){ 
        inX = true
    }

    if((wPos.y - middleY) >= 0 && (wPos.y + middleY) <= mapHeight){ 
        inY = true
    }
    
    // Camera follows player
    if(inX && inY){
        console.log('camera follows player')
        setCamPos(player.pos)
    }
        
    if(inX && !inY){
        // Reached top?
        if((wPos.y - middleY) <= 0){
            console.log('camera top')
            setCamPos(wPos.x, middleY)
        }

        // Reached down?
        if((wPos.y + middleY) >= mapHeight){
            console.log('camera down')
            setCamPos(wPos.x, mapHeight - middleY)
        }
    }

    if(!inX && inY){
        // Reached right?
        if((wPos.x + middleX) >= mapWidth){
            console.log('camera right')
            setCamPos(mapWidth - middleX, wPos.y)
        }

        // Reached left?
        if((wPos.x - middleX) <= 0){
            console.log('camera left')
            setCamPos(middleX, wPos.y)
        }
    }

    if(!inX && !inY){
        // Reached top right?
        if((wPos.y - middleY) <= 0 && (wPos.x + middleX) >= mapWidth){
            console.log('camera top right')
            setCamPos(mapWidth - middleX, middleY)
        }

        // Reached down right?
        if((wPos.y + middleY) >= mapHeight && (wPos.x + middleX) >= mapWidth){
            console.log('camera down right')
            setCamPos(mapWidth - middleX, mapHeight - middleY)
        }

        // Reached down left?
        if((wPos.y + middleY) >= mapHeight && (wPos.x - middleX) <= 0){
            console.log('camera down left')
            setCamPos(middleX, mapHeight - middleY)
        }
        
        // Reached top left?
        if((wPos.y - middleY) <= 0 && (wPos.x - middleX) <= 0){
            console.log('camera top left')
            setCamPos(middleX, middleY)
        }
    }
}
// #endregion

const InteractWithObject = (object: GameObj) => {
    if(object.hasOwnProperty('sprite')){
        switch(object.sprite){
            case 'chest':
                if(object.frame < 1){
                    // Open chest
                    object.play('open', {
                        onEnd: () => {
                            // TODO - Obtain items
                            // TODO - Display text message
                        }
                    })
                }else{
                    // TODO - Display text message
                }
            break;
        }
    }
}

const createItemSprite = (name: string, x: number, y: number, objWidth: number, objHeight: number, customProperty: any) => {
    switch(name){
        case 'chest':
            if(!getAsset(name)){
                loadSprite(name, `item/${name}.png`, {
                    sliceX: 2,
                    anims: {
                        open: { from: 0, to: 1, loop: false }
                    }
                })
            }

            const chest = map.add([
                sprite(name, {
                    frame: 0
                }),
                area({ shape: new k.Rect(k.vec2(0), objWidth, objHeight)   }),
                pos(x, y),
                body({ isStatic: true }),
                // tags
                "item",
            ])

            // custom properties
            for(const property of customProperty){
                chest[`${property.name}`] = property.value
            }

            setItemCollision(chest)

            console.log('chest', chest)
        break;
    }
}

const setItemCollision = (item: GameObj) => {
    item.onCollide("player", () => {
        if(!collidedObjs.find(c => c.id === item.id)){
            collidedObjs.push(item)
        }
    })

    item.onCollideEnd("player", () => {
        const index = collidedObjs.findIndex(c => c.id === item.id)
        if(index >= 0){
            collidedObjs.splice(index, 1) 
        }
    })
}
// #endregion


const setMapArrow = (arrow: GameObj, floating: boolean, index: number) => {
    // Check direction
    switch(true){
        case arrow.direction >= 8: // top
            arrow.angle = 180
        break;
        case arrow.direction >= 6: // right
            arrow.angle = 270
        break;
        case arrow.direction >= 4: // left
            arrow.angle = 90
        break;
    }

    const gap = 5

    const controller = tween(
        arrow.pos,
        (arrow.direction >= 8)? // top
        vec2(
            arrow.pos.x, 
            (floating)? arrow.pos.y - gap : arrow.pos.y + gap
        ) :        
        (arrow.direction >= 6)? // right
        vec2(
            (floating)? arrow.pos.x + gap : arrow.pos.x - gap, 
            arrow.pos.y
        ) :
        (arrow.direction >= 4)? // left
        vec2(
            (floating)? arrow.pos.x - gap : arrow.pos.x + gap, 
            arrow.pos.y
        ) :
        vec2( // down
            arrow.pos.x, 
            (floating)? arrow.pos.y + gap : arrow.pos.y - gap
        ),
        0.5,
        (p) => arrow.pos = p,
        easings.easeInOutBounce
    )
    
    controller.onEnd(() => { setMapArrow(arrow, !floating, index) })

    mapArrows[index] = { timer: controller, sprite: arrow }
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

