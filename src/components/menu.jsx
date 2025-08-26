import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pixelatedBorder } from '../utils/ui'
import { setMenu, setList } from "../store/game"
import store from "../store/store";
import { ITEMFILTER } from "../utils/ui"

import MenuArrow from './menuArrow'
import ItemMenu from "./itemMenu";

const MEMUITEM = [
    'ITEM', 'SKILL', 'TEAM', 'STATUS', 'SAVE', 'LOAD', 'OPTION'
]

export default function Menu() {
    const menuOpen = useSelector(state => state.game.menuOpen)
    const gameWidth = useSelector(state => state.setting.width)
    const gameHeight = useSelector(state => state.setting.height)
    const scale = useSelector(state => state.setting.scale)
    const uiOffsetV = useSelector(state => state.setting.uiOffsetV)
    // const uiOffsetH = useSelector(state => state.setting.uiOffsetH) 
    const units = useSelector(state => state.game.units)  
    const inventory = useSelector(state => state.game.inventory)
    const [menuIndex, setMenuIndex] = useState(0)
    const [innerMenuIndex, setInnerMenuIndex] = useState(0)

    // A shared state ref
    const menuIndexRef = useRef(0)

    const dispath = useDispatch()

    const setMenuPosition = ($el) => {
        if($el){
            // console.log($el)
            const parentEl = $el.parentElement
            // console.log(parentEl)
            $el.style.left = `${parentEl.clientWidth - $el.clientWidth}px`
            if(menuOpen === 1) $el.classList.add('show')
        }
    }

    const keyInputEvent = ($event) => {
        // console.log('$event', $event)
        // Get latest state
        const menuOpen = store.getState().game.menuOpen
        switch(menuOpen){
            case 1:
                if($event.key === 'ArrowUp') setMenuIndex(preState => preState === 0? 0 : preState - 1)
                if($event.key === 'ArrowDown') setMenuIndex(preState => preState === (MEMUITEM.length - 1)? MEMUITEM.length - 1 : preState + 1)
                if($event.key === 'Enter') dispath(setMenu({ type: 1, value: menuIndexRef.current + 2 }))                 
            break;  
            case 2: case 3: // ITEM, SKILL
                if($event.key === 'ArrowUp'){
                    if(store.getState().game.innerMenuOpen > 0){
                        setInnerMenuIndex(preState => (preState === 0)? 0 : preState - 1)
                        return
                    }
                    setMenuIndex(preState => {
                        if((preState - ITEMFILTER.length) <= 1){
                            return 0
                        }else{
                            return preState - 2
                        }
                    })
                }
                if($event.key === 'ArrowDown'){
                    if(store.getState().game.innerMenuOpen > 0){
                        setInnerMenuIndex(preState => (preState === (units.length - 1))? preState : preState + 1)
                        return
                    }
                    const itemList = store.getState().game.items
                    setMenuIndex(preState => {
                        if(preState < ITEMFILTER.length){
                            return ITEMFILTER.length
                        }
                        if(preState + 2 > (ITEMFILTER.length + (itemList.length - 1))){
                            return ITEMFILTER.length + (itemList.length - 1)
                        }else{
                            return preState + 2
                        }    
                    })
                }
                if($event.key === 'ArrowRight'){
                    if(store.getState().game.innerMenuOpen > 0) return
                    setMenuIndex(preState => preState + 1)
                }
                if($event.key === 'ArrowLeft'){
                    if(store.getState().game.innerMenuOpen > 0) return
                    setMenuIndex(preState => preState === 0? 0 : preState - 1)
                }
                if($event.key === 'Escape'){
                    if(store.getState().game.innerMenuOpen > 0){
                        // CLose inner menu
                        setInnerMenuIndex(0)
                        dispath(setMenu({ type: 2, value: 0 }))
                    }else{
                        // Close parent menu
                        store.dispatch(
                            setMenu({type: 1, value: 1})
                        )                           
                        setMenuIndex(menuOpen - 1)
                    }
                }
                if($event.key === 'Enter'){
                    if(store.getState().game.innerMenuOpen > 0){
                        console.log(`use ${menuOpen === 2? 'item': 'skill'}`)
                        return
                    }
                    const itemList = store.getState().game.items
                    if(itemList[menuIndexRef.current - ITEMFILTER.length].type ===1) dispath(setMenu({ type: 2, value: 1 }))
                }
            break;
            case 5: case 6: 
                if($event.key === 'ArrowUp') setMenuIndex(preState => preState === 0? 0 : preState - 1)
                // if($event.key === 'ArrowDown') setMenuIndex(preState => preState === (MEMUITEM.length - 1)? MEMUITEM.length - 1 : preState + 1)
            break;
        }
    }

    useEffect(()=> {
        console.log('menuOpen updated', menuOpen)

        switch(menuOpen){
            case 1:
                setMenuIndex(0)
            break;
            case 2:
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
                    dispath(
                        setList({ type: 2, data: items })
                    )                 
                })
            break;
            case 3:
                import('../data/skill.json').then(data => {
                    console.log(data)
                    // setSkillList(data.default)
                })                
            break;       
            case 6:
            break;
            case 7:
            break;
            case 8:
            break;                                      
        }
    }, [menuOpen])

    useEffect(() => {
        if(innerMenuIndex === 0) {
            menuIndexRef.current = menuIndex
        }else{
            menuIndexRef.current = innerMenuIndex
        }
    }, [menuIndex, innerMenuIndex])

    useEffect(() => {
        window.addEventListener('keyup', keyInputEvent, true)

        return () => {
            window.removeEventListener('keyup', keyInputEvent , true)
        }
    }, [])

    return(
        <div 
            className='ui' 
            style={{
                left: `${uiOffsetV}px`, 
                height: gameHeight + 'px',
                fontSize: `${12 * (scale * 10)}px`
            }}>
            <ul 
                className={`menu ${menuOpen !== 1? 'hide' : ''}`}
                ref={($el) => setMenuPosition($el)}
                style={{
                    width: `${gameWidth * 0.3}px`,
                    borderRadius: `${Math.floor(scale * 10)}px`,
                    boxShadow: pixelatedBorder(Math.floor(scale * 10), 'black'),
                    padding: `${(8 * Math.floor(scale * 10)) / 2}px`,
                }}>
                    {
                        MEMUITEM.map((item, index) => {
                            return (
                                <li 
                                    className="menu-0 flex" 
                                    key={index}
                                    onMouseOver={() => setMenuIndex(index)}
                                    onClick={() => dispath(setMenu(index + 2))}
                                >
                                    { menuOpen === 1 && menuIndex === index? 
                                        <MenuArrow /> : null
                                    }
                                    
                                    <span style={{ 
                                        width: `${((gameWidth * 0.3) / 2) + 10}px`,
                                        marginLeft: 'auto'
                                    }}>
                                        {item}
                                    </span>
                                </li>                            
                            )
                        })
                    }
            </ul>  

            {/*  ITEM  */}
            { menuOpen === 2?
                <ItemMenu 
                    menuIndex={menuIndex}
                    innerMenuIndex={innerMenuIndex}
                    setMenuIndex={setMenuIndex}
                    setInnerMenuIndex={setInnerMenuIndex} 
                /> : null
            }

            {/*  SKILL  */}
            <div className={`menu sub_menu hide ${menuOpen === 3? 'show' : ''}`} style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px` }}>
                <div className="flex filter"></div>
                <div className="items"></div>
                <div className="desc"></div>
            </div>            

            {/*  TEAM  */}
            <div className={`menu sub_menu hide ${menuOpen === 4? 'show' : ''}`} style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px` }}>
                <div className="pos">
                    <div className="front"></div>
                    <div className="back"></div>
                </div>
            </div>
            
            {/*  STATUS  */}
            <div className={`menu sub_menu_menu hide ${menuOpen === 5? 'show' : ''}`} style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px` }}>
                <div className="flex">
                    <img className="avatar"></img>
                </div>
                <div className="status items"></div>
            </div>
            
            {/*  SAVE  */}
            <div className={`menu sub_menu hide ${menuOpen === 6? 'show' : ''}`} style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px` }}>
                <ul>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
            </div>

            {/*  LOAD  */}
            <div className={`menu sub_menu hide ${menuOpen === 7? 'show' : ''}`} style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px` }}>
                <ul>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>                    
                </ul>
            </div>

            {/*  OPTION  */}
            <div className={`menu sub_menu hide ${menuOpen === 8? 'show' : ''}`} style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px` }}></div>
        </div>
    )
}