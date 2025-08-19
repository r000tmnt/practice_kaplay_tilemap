import k from '../lib/kaplay'

// import store from '../store/store'; // Assuming RootState is defined in your store
// import {
//   setMenu
// } from '../store/game';
import { GameObj } from 'kaplay';
import Big from 'big.js';
import { createPlayerSprite } from '../utils/player';

const {
    add,
    pos, 
    sprite,   
    rotate,
    setData,
    getData,
    anchor,
    area,
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
    setCamScale,
    getAsset,
    tween,
    vec2,
    easings,
} = k

let map : GameObj = {} as GameObj
let player : GameObj = {} as GameObj
export const collidedObjs: GameObj[] = []

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
const exitTouched = (): Big => new Big(getData('exitTouched', 0) ?? 0)

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

        setData('ready', false)
        
        if(!getData('exitTouched', 0)) setData('exitTouched', 0)

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
    map = add([pos(0, 0), "map"])

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
    map.mapWidth = mapWidth
    map.mapHeight = mapHeight

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
                if (object.name === "player" && exitTouched().eq(0)) {
                    player = createPlayerSprite(map, object.x, object.y, mapWidth, mapHeight)
                    continue;
                }
            }
        }       
    }

    const touched = exitTouched()

    if(touched.gt(0)){
        const exit = map.get('exit').find(exit => exit.direction.eq(touched))
        if(exit){
            switch(true){
                case touched.gte(8): // top
                    player = createPlayerSprite(map, exit.pos.x, exit.pos.y + 5, mapWidth, mapHeight)
                break;
                case touched.gte(6): // right
                    player = createPlayerSprite(map, exit.pos.x - (player.width + 5), exit.pos.y, mapWidth, mapHeight)
                break;
                case touched.gte(4): // left
                    player = createPlayerSprite(map, exit.pos.x + 5, exit.pos.y, mapWidth, mapHeight)
                break;
                case touched.gte(2): // down
                    player = createPlayerSprite(map, exit.pos.x, exit.pos.y - (player.height + 5), mapWidth, mapHeight)
                break;                   
            }            
        }
    }    

    console.log(map)    
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
                // custom properties
                {
                    item: {}
                }
            ])

            
            const item = {}

            for(const property of customProperty){
                item[`${property.name}`] = property.value
            }

            chest.item = item

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

    // Custom property
    arrow.timer = tween(
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
    
    arrow.timer.onEnd(() => { setMapArrow(arrow, !floating, index) })
}
