import { useSelector, useDispatch } from "react-redux"
import { setMenu } from "../store/game"
import { pixelatedBorder } from "../utils/ui"
import { setList } from '../store/game'

import MenuArrow from "./menuArrow"
import Sprite from "./sprite"
import { useEffect, useState } from "react"

export default function StatusMenu({ 
    menuIndex, 
    innerMenuIndex,
    enterPressed,
    setEnterPressed,     
    setMenuIndex, 
    setInnerMenuIndex,    
 }){
    const gameWidth = useSelector(state => state.setting.width)
    const gameHeight = useSelector(state => state.setting.height)
    const scale = useSelector(state => state.setting.scale)
    const units = useSelector(state => state.game.units)
    const menuOpen = useSelector(state => state.game.menuOpen)
    const innerMenuOpen = useSelector(state => state.game.innerMenuOpen)
    const inventory = useSelector(state => state.game.inventory)
    const itemList = useSelector(state => state.game.items)
    const [inspectingUnit, setInspectingUnit] = useState(-1)
    const dispatch = useDispatch()

    const setMenuPosition = ($el) => {
        if($el) $el.classList.add('show')
    }    

    const setItemList = () => {
        dispatch(setMenu({type: 2, value: 2}))
        setInnerMenuIndex(0)
        // TODO - Filter item
        if(!itemList.length){
            import('../data/items.json').then(data => {
                console.log(data)
                const items = []
                for(const item of inventory){
                    const itemData = data.default.find(d => d.id === item.id)
                    if(itemData.stackable){
                        itemData.amount = item.amount
                    }else{
                        itemData.amount = 1
                    }
                    items.push(itemData)
                }
                dispatch(
                    setList({ type: 2, data: items })
                )                 
            })                    
        }        
    }

    useEffect(() => {
        if(innerMenuOpen === 0) setInspectingUnit(-1)
    }, [innerMenuOpen])

    useEffect(() => {
        if(enterPressed){
            if(innerMenuOpen === 0){
                dispatch(setMenu({type: 2, value: 1}))
                setInspectingUnit(menuIndex)
                setMenuIndex(0)
            }
            if(innerMenuOpen === 1){
                setItemList()
            }
            if(innerMenuOpen === 2){
                // TODO - Equip item
            }
            setEnterPressed(false)            
        }
    }, [enterPressed])

    return(
        <div 
            className={`menu sub_menu hide`} 
            ref={($el) => setMenuPosition($el)} 
            style={{ 
                padding: `${(8 * Math.floor(scale * 10)) / 2}px`, 
                fontSize: `${8 * (scale * 10)}px`  
            }}>
            <div className="title" style={{ boxShadow: pixelatedBorder(scale * 10, 'black'), textAlign: 'center' }}>STATUS</div>
            <div className="flex" style={{margin: `${scale * 100}px 0`, justifyContent: 'space-around', height: `${30 * 2}px`}}>
                {
                    inspectingUnit >= 0? 
                    <div style={{width: `${17}px`, transform: 'scale(4)'}}>
                        <Sprite 
                            width={17} 
                            height={30} 
                            image={'/character/swordsman_spritesheet.png'}
                            position={`-${(9 * 64) + 22}px -${(9 * 64) + 17}px`}
                            custom={{
                                style: { position: 'unset' },
                                className: 'avatar'
                            }}
                        />                            
                    </div> :
                    units.map((unit, index) => 
                        <div className="flex" key={index}>
                            { menuIndex === index ? 
                                <span
                                className="arrow" 
                                style={{ 
                                    position: 'relative', 
                                    zIndex: 11,
                                    left: `${(Math.abs(scale * 10) * -1)}px`
                                }}>
                                    <MenuArrow />
                                </span> : <span style={{width: `${8 * Math.floor(scale * 10)}px`}}></span>
                            }                            
                            <div style={{width: `${17}px`, transform: 'scale(4)'}}>
                                <Sprite 
                                    width={17} 
                                    height={30} 
                                    image={'/character/swordsman_spritesheet.png'}
                                    position={`-${(9 * 64) + 22}px -${(9 * 64) + 17}px`}
                                    custom={{
                                        style: { position: 'unset' },
                                        className: 'avatar',
                                        onMouseOver: () => {
                                            if(innerMenuOpen === 0) setMenuIndex(index)
                                        },
                                        onClick: () => {
                                            if(innerMenuOpen === 0){
                                                dispatch(setMenu({type: 2, value: 1}))
                                                setInspectingUnit(index)
                                                setMenuIndex(0)                                                
                                            }
                                        }
                                    }}
                                />                            
                            </div>                     
                        </div>
                    )
                }
            </div>
            <div style={{
                boxShadow: pixelatedBorder(scale * 10, 'black'), 
            }}>
                <div className="status items">
                    <div style={{display: 'grid', gridTemplateColumns: `${gameWidth * 0.2}px 1fr`}}>
                        <span>Lv</span>
                        <span>{ units[menuIndex].Lv }</span>                         
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: `${gameWidth * 0.2}px 1fr`}}>
                        <span>{ units[menuIndex].name }</span>
                        {/* <span>{ units[menuIndex].Lv }</span>                          */}
                    </div>                
                    { 
                        Object.entries(units[menuIndex].attribute).map((param, index) => 
                            param[0].includes('max') === false?
                            <div style={{display: 'grid', gridTemplateColumns: `${gameWidth * 0.2}px 1fr`}} key={index}>
                                <span>{ param[0] }</span>
                                { param[0].includes('hp')?
                                    <span>{ param[1] }/{ units[menuIndex].attribute['maxHp'] }</span> :
                                    param[0].includes('mp')?
                                    <span>{ param[1] }/{ units[menuIndex].attribute['maxMp'] }</span> :
                                    <span>{ param[1] }</span>  
                                }                          
                            </div> : null
                        )
                    }
                </div>

                <div className="equip items">
                    { 
                        Object.entries(units[menuIndex].equip).map((param, index) => 
                            <div 
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `${gameWidth * 0.2}px 1fr`,
                                    boxShadow: (innerMenuOpen === 2 && menuIndex === index)? pixelatedBorder(scale * 5, 'grey') : 'unset',
                                }} 
                                key={index}
                                onMouseOver={() => {
                                    if(innerMenuOpen === 1) setMenuIndex(index)
                                }}
                                onClick={() => {
                                    if(innerMenuOpen === 1) setItemList()
                                }}
                            >
                                { innerMenuOpen === 1 && menuIndex === index ? 
                                    <span
                                    className="arrow" 
                                    style={{ 
                                        position: 'absolute', 
                                        zIndex: 11,
                                        left: `${(index % 2) === 0? 
                                            (Math.abs(scale * 10) * -1) + (gameWidth * 0.2 * 0) :
                                            (Math.abs(scale * 10) * -1) + (gameWidth * 0.2 * 2.4)
                                        }px`
                                    }}>
                                        <MenuArrow />
                                    </span> : null
                                }                                   
                                <span>{ param[0] }</span>
                                { Object.entries(param[1]).length?
                                    <span>{ param[1].name }</span> : 
                                    <span>==</span>
                                }                                          
                            </div>
                        )
                    }                    
                </div>
            </div>

            <div className="bottom">
                {innerMenuOpen === 2?
                    <div className="items" style={{ 
                        boxShadow: pixelatedBorder(scale * 10, 'black'), 
                        fontSize: `${8 * (scale * 10)}px`,
                        height: `${gameHeight * 0.24}px`,
                        overflowY: 'scroll',
                    }}>
                        {
                            itemList.filter(item => item.type === (menuIndex + 5)).map((item, index) =>
                                <div 
                                    className="item flex" 
                                    key={index}
                                    onMouseOver={() => {
                                    }}
                                    onClick={() => {
                                    }}>
                                        {innerMenuOpen === 2 && innerMenuIndex === index? 
                                            <MenuArrow /> : null
                                        }                        
                                        <div className="" style={{
                                            width: `${gameWidth * 0.3}px`,
                                            marginLeft: 'auto',
                                        }}>
                                            <span>{ item.name }</span>
                                            {/* <span style={{ marginLeft: 'auto' }}>{ item.amount }</span>                                 */}
                                        </div>
                                </div>
                            )
                        }
                    </div> : null
                }
                <button style={{ 
                    width: '100%', 
                    backgroundColor: 'white', 
                    margin: `${scale * 10}px 0`,
                    color: 'black', 
                    fontSize: `${8 * (scale * 10)}px` 
                }} onClick={() => {
                    if(innerMenuOpen === 0){
                        // Close parent menu
                        dispatch(
                            setMenu({type: 1, value: 1})
                        )                           
                        setMenuIndex(menuOpen - 1)                            
                    }else{
                        dispatch(
                            setMenu({type: 2, value: innerMenuOpen - 1})
                        )
                        setInnerMenuIndex(0)
                    }
                }}>BACK</button>
            </div>                
        </div>
    )
}