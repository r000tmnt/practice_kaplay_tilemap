import { useSelector, useDispatch } from "react-redux"
import { setMenu } from "../store/game"
import { pixelatedBorder } from "../utils/ui"

import MenuArrow from "./menuArrow"
import Sprite from "./sprite"
import { useEffect } from "react"

export default function StatusMenu({ 
    menuIndex, 
    innerMenuIndex,
    enterPressed,
    setEnterPressed,     
    setMenuIndex, 
    setInnerMenuIndex,    
 }){
    const gameWidth = useSelector(state => state.setting.width)
    const scale = useSelector(state => state.setting.scale)
    const units = useSelector(state => state.game.units)
    const menuOpen = useSelector(state => state.game.menuOpen)
    const innerMenuOpen = useSelector(state => state.game.innerMenuOpen)
    const dispatch = useDispatch()

    const setMenuPosition = ($el) => {
        if($el) $el.classList.add('show')
    }    

    useEffect(() => {
        if(innerMenuOpen === 0){
            dispatch(setMenu({type: 2, value: 1}))
            setInnerMenuIndex(0)
        }
        setEnterPressed(false)
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
            <div className="flex" style={{margin: `${scale * 100}px 0`, justifyContent: 'space-around'}}>
                {
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
                                        onMouseOver: () => setMenuIndex(index),
                                        onClick: () => {
                                            dispatch(setMenu({type: 2, value: 1}))
                                            setInnerMenuIndex(0)
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
                                    gridTemplateColumns: `${gameWidth * 0.2}px 1fr`
                                }} 
                                key={index}
                                onMouseOver={() => {
                                    if(innerMenuOpen > 0) setInnerMenuIndex(index)
                                }}
                                onClick={() => {
                                    if(innerMenuOpen > 0) console.log('open item sub menu')
                                }}
                            >
                                { innerMenuOpen > 0 && innerMenuIndex === index ? 
                                    <span
                                    className="arrow" 
                                    style={{ 
                                        position: 'absolute', 
                                        zIndex: 11,
                                        left: `${(Math.abs(scale * 10) * -1)}px`
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
                {innerMenuOpen > 0 && innerMenuIndex >= 0?
                    <></> : <></>
                }
                <button style={{ 
                    width: '100%', 
                    backgroundColor: 'white', 
                    margin: `${scale * 10}px 0`,
                    color: 'black', 
                    fontSize: `${8 * (scale * 10)}px` 
                }} onClick={() => {
                    // Close parent menu
                    dispatch(
                        setMenu({type: 1, value: 1})
                    )                           
                    setMenuIndex(menuOpen - 1)      
                }}>BACK</button>
            </div>                
        </div>
    )
}