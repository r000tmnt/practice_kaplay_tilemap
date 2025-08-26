import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect, useImperativeHandle } from "react"
import { setMenu, setList } from '../store/game'
import { pixelatedBorder } from '../utils/ui'
import { ITEMFILTER } from "../utils/ui"

import MenuArrow from './menuArrow'

function ItemMenu({ menuIndex, innerMenuIndex, setMenuIndex, setInnerMenuIndex }, ref){
    const menuOpen = useSelector(state => state.game.menuOpen)
    const innerMenuOpen = useSelector(state => state.game.innerMenuOpen)
    const gameWidth = useSelector(state => state.setting.width)
    const scale = useSelector(state => state.setting.scale)
    const [activeFilter, setFilter] = useState(ITEMFILTER[0])
    const units = useSelector(state => state.game.units)  
    const itemList = useSelector(state => state.game.items)
    const dispatch = useDispatch()

    useImperativeHandle(ref, () => {
        return {
            ITEMFILTER: ITEMFILTER.length
        }
    })

    useEffect(() => {
        setMenuIndex(menuIndex + ITEMFILTER.length)
    }, [])

    return(
        <div 
            className={`menu sub_menu`} 
            style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px`, fontSize: `${8 * (scale * 10)}px`}}>
            <div className="flex filter" style={{ boxShadow: pixelatedBorder(scale * 10, 'black') }}>
                {
                    ITEMFILTER.map((filter, index) => (
                        <div 
                            className="item flex" 
                            key={index}
                            onMouseOver={() => setMenuIndex(index)} 
                            onClick={() => setFilter(filter)}>
                            { menuOpen === 2 && menuIndex === index ? 
                                <MenuArrow /> : null
                            }
                            <span style={{ color: `${filter === activeFilter? 'black' : 'grey'}` }}>{filter}</span>
                        </div>
                    ))
                }
            </div>
            <div 
                className="items"
                style={{
                    rowGap: scale * 10 + 'px',
                    columnGap: scale * 20 + 'px',
                    paddingTop: scale * 10 + 'px'
                }}>
                {
                    itemList.map((item, index) => 
                    <div 
                        className="item flex" 
                        key={index} 
                        style={{ border: `${scale * 10}px solid transparent`, }}
                        onMouseOver={() => {
                            if(innerMenuOpen > 0) return
                            setMenuIndex(index + ITEMFILTER.length)
                        }}
                        onClick={() => {
                            if(item.type === 1) dispatch(setMenu({ type: 2, value: 1 }))
                        }}>
                        { menuOpen === 2 && menuIndex === (index + ITEMFILTER.length)? 
                            <MenuArrow /> : null
                        }                        
                        <div className="flex" style={{
                            width: `${gameWidth * 0.3}px`,
                            marginLeft: 'auto',
                            justifyContent: 'space-around'
                        }}>
                            <span>{ item.name }</span>
                            <span style={{ marginLeft: 'auto' }}>{ item.amount }</span>                                
                        </div>
                    </div>)
                }
            </div>
            <div className="bottom">
                <div className="desc" style={{ 
                    width: '100%',
                    boxShadow: pixelatedBorder(scale * 10, 'black'), 
                    padding: `${scale * 10}px`,
                    boxSizing: 'border-box'
                }}>
                    { innerMenuOpen > 0? 
                        <div className="innerMenu">
                            { innerMenuOpen === 1?
                                <div className="flex flex-col">
                                    { units.map((unit, index) => 
                                        <div 
                                            className="flex" 
                                            key={index} 
                                            onMouseOver={() => setInnerMenuIndex(index)}
                                            onClick={() => { console.log('use item') }}>
                                            { menuOpen === 2 && innerMenuIndex === index? 
                                                <span style={{ position: 'absolute', zIndex: 11 }}>
                                                    <MenuArrow /> 
                                                </span>
                                                : null
                                            }                                                
                                            <div 
                                                className="flex w-full" 
                                                style={{
                                                    whiteSpace: 'nowrap',
                                                    justifyContent: 'space-around'
                                                }} >
                                                <div>{ unit.name }</div>
                                                <div>HP {unit.attribute.hp}/{unit.attribute.maxHp}</div>
                                                <div>MP {unit.attribute.mp}/{unit.attribute.maxMp}</div>
                                            </div>                                                
                                        </div>
                                        ) 
                                    }
                                </div> : null
                            }
                        </div> : itemList[menuIndex - ITEMFILTER.length]? itemList[menuIndex - ITEMFILTER.length].desc : ''
                    }
                </div>
                <button style={{ 
                    width: '100%', 
                    backgroundColor: 'white', 
                    margin: `${scale * 10}px 0`,
                    color: 'black', 
                    fontSize: `${8 * (scale * 10)}px` 
                }} onClick={() => {
                    if(innerMenuIndex > 0){
                        // Close inner menu
                        dispatch(setMenu({ type: 2, value: 0 }))
                        setInnerMenuIndex(0)
                    }else{
                        // Close parent menu
                        dispatch(
                            setMenu({type: 1, value: 1})
                        )                           
                        setMenuIndex(menuOpen - 1)
                        dispatch(setList({ type: 2, data: [] }))                            
                    }
                }}>BACK</button>
            </div>
        </div>        
    )
};

export default ItemMenu
