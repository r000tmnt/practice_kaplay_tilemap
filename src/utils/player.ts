import k from '../lib/kaplay'
import { GameObj } from "kaplay";

import store from '../store/store';
import { setMenu, setTextLabel } from '../store/game';
import { collidedObjs } from '../scene/game';

const { 
    go,
    get,
    sprite,
    area,
    body,
    pos,
    Rect,
    // rect,
    // color,
    // bezier,
    // text,
    vec2,
    getData,
    setData,
    setCamPos,
    isKeyDown,
    isKeyPressed,
    onUpdate,
    tween,
    easings,
    usePostEffect,
} = k

export const createPlayerSprite = (map: GameObj, x: number, y: number, mapWidth: number, mapHeight: number, direction=8) => {
    const player = map.add([
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
        area({ shape: new Rect(vec2(0), map.tileWidth, map.tileWidth) }),
        // Position relative to the player
        pos(0, player.height),
    ])

    // #region Player control
    player.onUpdate(() => {
        if(!getData('ready', false)) return

        const menuOpen = store.getState().game.menuOpen
        const label = store.getState().game.textLabel
        const dialogue = store.getState().dialogue.dialogue

        if(menuOpen > 0 || label.length || dialogue.length) return

        if(!isKeyDown()){
            player.stop()
            // setCameraPosition(mapWidth, mapHeight)
        }

        if (isKeyDown("left") && !isKeyDown([ "right", "up", "down" ])){
            setCameraPosition(map, player, mapWidth, mapHeight)
            if(player.getCurAnim()?.name !== "left") player.play("left")

            const wPos = player.worldPos()
            if(wPos && wPos.x > 0 ) player.move(-player.speed, 0)
            // Move the invisible area
            player.children[0].pos.x = -map.tileWidth
            player.children[0].pos.y = (player.height - map.tileWidth)
                
            checkStep(player)
        }
        if (isKeyDown("right") && !isKeyDown([ "left", "up", "down" ])){
            setCameraPosition(map, player, mapWidth, mapHeight)
            if(player.getCurAnim()?.name !== "right") player.play("right")

            const wPos = player.worldPos()
            if(wPos && (wPos.x + player.width) < mapWidth ) player.move(player.speed, 0)
            // Move the invisible area
            player.children[0].pos.x = player.width
            player.children[0].pos.y = (player.height - map.tileWidth)                

            checkStep(player)
        }
        if (isKeyDown("up") && !isKeyDown([ "right", "left", "down" ])){
            setCameraPosition(map, player, mapWidth, mapHeight)
            if(player.getCurAnim()?.name !== "up") player.play("up")

            const wPos = player.worldPos()
            if(wPos && wPos.y > 0 ) player.move(0, -player.speed)
            // Move the invisible area
            player.children[0].pos.x = 0
            player.children[0].pos.y = -map.tileWidth                

            checkStep(player)
        }
        if (isKeyDown("down") && !isKeyDown([ "right", "up", "left" ])){
            setCameraPosition(map, player, mapWidth, mapHeight)
            if(player.getCurAnim()?.name !== "down") player.play("down")

            const wPos = player.worldPos()
            if(wPos && (wPos.y + player.height) < mapHeight ) player.move(0, player.speed)
            // Move the invisible area
            player.children[0].pos.x = 0
            player.children[0].pos.y = player.height              

            checkStep(player)
        }
    })

    onUpdate(() => {
        if(!getData('ready', false)) return

        if (isKeyPressed('escape')){
            console.log('escape key pressed')
            const menuOpen = store.getState().game.menuOpen
            const innerMenuOpen = store.getState().game.innerMenuOpen

            if(innerMenuOpen > 0) return
            if(menuOpen > 1){
                return
            }else{
                store.dispatch(
                    setMenu({type: 1, value: menuOpen? 0 : 1})
                )                
            }

            const mapArrows = map.get('arrow')

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
        if(!getData('exitTouched', 0)){
            setData('exitTouched', 1)
            console.log('onCollide', exit)
            console.log('player leaving the map')

            // Stop everything
            setData('ready', false)

            // const gameWidth = store.getState().setting.width
            // const gameHeight = store.getState().setting.height

            // Go to the pointed position
            if(exit.linked > 0){
                setData('exitTouched', exit.linked) 
            }else{
                // Go to the relative position
                switch(true){
                    case exit.direction >= 8: // top
                        setData('exitTouched', exit.direction.minus(6))
                    break;
                    case exit.direction >= 6: // right
                        setData('exitTouched', exit.direction.minus(2))
                    break;
                    case exit.direction >= 2: // down
                        setData('exitTouched', exit.direction.plus(6))
                    break;
                    case exit.direction >= 4: // left
                        setData('exitTouched', exit.direction.plus(2))
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
                const mapArrows = map.get('arrow')
                mapArrows.forEach(arrow => {
                    arrow.timer.cancel()
                })

                // TODO - Load the next map
                go('game', exit.map)
            })   
        }
    })
    // #endregion   

    // If map switched
    let exitTouched = getData('exitTouched', 0)
    if( exitTouched && exitTouched > 0){
        // Reset value
        setData('exitTouched', 0)
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
    setData('ready', true)

    return player
}

// #region Camera position
const setCameraPosition = (map: GameObj, player: GameObj, mapWidth: number, mapHeight: number) => {
    // Decide to move the camera or not
    // const { x, y } = player.pos
    const middleX = (map['tileWidth'] * 9) / 2 
    const middleY = (map['tileWidth'] * 16) / 2 

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
                            const item = object.item?? null
                            if(item){
                                let content : string[] = []
                                Object.entries(item).forEach(([key, value], index) => {
                                    content.push(`<div key='${index}'>Obtained ${(Number(value) > 1)? `${value} ` : ''}<span style="color: yellow">${key}</span><div>`)
                                })

                                // setItemLabelPosition(object, content)
                                store.dispatch(setTextLabel(content))
                                // Remove item content
                                delete object.item
                            }else{
                                setTextLabel('Nothing found')
                            }
                        }
                    })
                }else{
                    // TODO - Display text message
                    setTextLabel('Nothing found')
                }
            break;
        }
    }
}

// Set item label position based on item position
// const setItemLabelPosition = (item: GameObj, content: string[] ) => {
//     const { x, y } = item.pos
//     const map = get('map')
//     const { mapWidth, mapHeight, tileWidth } = map[0]
//     const middleX = mapWidth / 2
//     const middleY = mapHeight / 2
//     const halfTileWidth = tileWidth / 2
//         // Set position to down right of the item
//         // Set 4 points to follow
//         const path = [
//             [halfTileWidth, halfTileWidth + 4],
//             [halfTileWidth + 1, halfTileWidth + 10],
//             [halfTileWidth + 5, halfTileWidth + 14],
//             [halfTileWidth + 7, halfTileWidth + 15],
//             [halfTileWidth + 8, halfTileWidth + 16],
//             // [halfTileWidth + 12, halfTileWidth + 18],
//         ]

//         item.add([
//             rect(content[0].length * (halfTileWidth / 2), tileWidth),
//             pos(halfTileWidth, halfTileWidth),
//             // tags
//             "itemLabel",
//         ])    

//         item.children[0].add([
//             text(content[0], { size: halfTileWidth, align: 'center', width: item.children[0].width, font: 'bebasNeue_regular' }),
//             color(0, 0, 0),
//             pos(0, halfTileWidth / 2)
//         ])

//         const showLabel = (index = 0) => {
//             tween(
//                 item.children[0].pos,
//                 vec2(path[index][0], path[index][1]),
//                 0.1,
//                 (v) => { 
//                     console.log('item pos', v)
//                     item.children[0].pos = v
//                 },
//                 easings.easeInOutQuad
//             ).onEnd(() => { 
//                 if(index < path.length - 1){
//                     showLabel(index + 1)
//                 }else{
//                     // item.children[0].destroy()
//                     // // TODO - Display text label
//                     // store.dispatch(setTextLabel(content))
//                 }
//             })
//         }

//         showLabel()

//     if((x - middleX) <= 0 && (y - middleY) <= 0){ // top left


//         // if(content.length > 1){

//         // }else{
        
//         // }
//     }

//     if((x + middleX) >= mapWidth && (y - middleY) <= 0){ // top right
//         // Set position to down left of the item
//     }

//     if((x + middleX) <= mapWidth && (x - middleX) >= 0 && // In the middle
//         (y - middleY) >= 0 && (y + middleY) <= mapHeight){
//         // Set position on top of the item
//     }

//     if((x + middleX) <= mapWidth && (y + middleY) >= mapHeight){ // down right
//         // Set position to top left of the item
//     }    

//     if((x - middleX) >= 0 && (y + middleY) >= mapHeight){ // down left
//         // Set position top right of the item
//     }    
// }

const checkStep = (player: GameObj) => {
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
