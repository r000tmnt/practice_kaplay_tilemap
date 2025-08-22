import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pixelatedBorder } from '../utils/ui'
import { setMenu } from "../store/game"
import store from "../store/store";

import MenuArrow from './menuArrow'

const MEMUITEM = [
    'ITEM', 'SKILL', 'TEAM', 'STATUS', 'SAVE', 'LOAD', 'OPTION'
]

const ITEMFILTER = [
    'ALL', 'EQUIP', 'CONSUME', 'MATERIAL', 'STORY'
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
    const [skillList, setSkillList] = useState([])
    const [itemList, setItemList] = useState([])    
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
                if($event.key === 'Enter') dispath(setMenu(menuIndex + 2))                 
            break;  
            case 2: case 3: // ITEM, SKILL
                if($event.key === 'ArrowUp') setMenuIndex(preState => (preState - 2) < 0? preState : preState - 2)
                if($event.key === 'ArrowDown') setMenuIndex(preState => preState + 2)
                if($event.key === 'ArrowRight') setMenuIndex(preState => preState + 1)
                if($event.key === 'ArrowLeft') setMenuIndex(preState => preState === 0? 0 : preState - 1)  
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
                setMenuIndex(ITEMFILTER.length)
                import('../data/items.json').then(data => {
                    console.log(data)
                    for(const item of inventory){
                        const itemData = data.default.find(d => d.id === item.id)
                        if(itemData.stackable){
                            itemData.amount = item.amount
                        }else{
                            itemData.amount = 1
                        }
                        
                        setItemList(prev => {
                            return [...prev, itemData]
                        })
                    }
                })
            break;
            case 3:
                import('../data/skill.json').then(data => {
                    console.log(data)
                    setSkillList(data.default)
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
        // console.log('menuIndex updated', menuIndex)
        if(menuIndex > ((itemList.length - 1) + ITEMFILTER.length)){
            setMenuIndex((itemList.length - 1) + ITEMFILTER.length)
        }

        if(menuIndex < 0){
            setMenuIndex(0)
        }
    }, [menuIndex, itemList])

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
            <div 
                className={`menu sub_menu hide ${menuOpen === 2? 'show' : ''}`} 
                style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px`, fontSize: `${8 * (scale * 10)}px`}}>
                <div className="flex filter">
                    {
                        ITEMFILTER.map((filter, index) => (
                            <div className="item flex" key={index}>
                                { menuOpen === 2 && menuIndex === index ? 
                                    <MenuArrow /> : null
                                }
                                <span>{filter}</span>
                            </div>
                        ))
                    }
                </div>
                <div 
                    className="items"
                    style={{
                        rowGap: scale * 10 + 'px',
                        columnGap: scale * 20 + 'px',
                    }}>
                    {
                        itemList.map((item, index) => 
                        <div 
                            className="item flex" 
                            key={index} 
                            style={{
                                border: `${scale * 10}px solid transparent`,
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
                        boxShadow: pixelatedBorder(scale * 10, 'black'), 
                        padding: `${scale * 10}px`,
                        boxSizing: 'border-box'
                    }}>
                        { itemList[menuIndex - ITEMFILTER.length]? itemList[menuIndex - ITEMFILTER.length].desc : '' }
                    </div>
                    <button style={{ 
                        width: '100%', 
                        backgroundColor: 'white', 
                        margin: `${scale * 10}px 0`,
                        color: 'black', 
                        fontSize: `${8 * (scale * 10)}px` 
                    }} onClick={() => dispath(setMenu(1))}>BACK</button>
                </div>
            </div>

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