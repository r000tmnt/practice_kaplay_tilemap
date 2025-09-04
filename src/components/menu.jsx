import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pixelatedBorder } from '../utils/ui'
import { setMenu, setList } from "../store/game"
import store from "../store/store";
import { ITEMFILTER, LANGUAGELIST } from "../utils/ui"

import MenuArrow from './menuArrow'
import ItemMenu from "./itemMenu";
import SkillMenu from "./skillMenu";
import TeamMenu from "./teamMenu";
import StatusMenu from "./statusMenu";
import FileMenu from "./fileMenu";
import OptionMenu from "./optionMenu";

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
    const skillList = useSelector(state => state.game.skills)
    const saveSlot = useSelector(state => state.setting.saveSlot)
    const [menuIndex, setMenuIndex] = useState(0)
    const [innerMenuIndex, setInnerMenuIndex] = useState(0)
    const [enterPressed, setEnterPressed] = useState(false)

    // A shared state ref
    const menuIndexRef = useRef(0)
    const skillRef = useRef(null)
    const teamRef = useRef(null)
    const optionRef = useRef(null)

    const dispath = useDispatch()

    const setMenuPosition = ($el) => {
        if($el){
            // console.log($el)
            const parentEl = $el.parentElement
            // console.log(parentEl)
            $el.style.left = `${(parentEl.clientWidth - $el.clientWidth) - Math.floor(scale * 10)}px`
            if(menuOpen === 1) $el.classList.add('show')
            else $el.classList.remove('show')
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
            case 2: // ITEM
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
                    const itemList = store.getState().game.items
                    setMenuIndex(preState => preState === (ITEMFILTER.length + (itemList.length - 1))? preState : 
                    ((preState + 2) % 2) === 0? preState + 1 : preState)
                }
                if($event.key === 'ArrowLeft'){
                    if(store.getState().game.innerMenuOpen > 0) return
                    setMenuIndex(preState => ((preState + 2) % 2) > 0? preState - 1 : preState)
                }
                if($event.key === 'Enter') setEnterPressed(true)
            break;
            case 3: // SKILL
                console.log('skillRef', skillRef.current)
                if(skillRef.current){
                    if($event.key === 'ArrowUp'){
                        if(store.getState().game.innerMenuOpen === 1){
                            setMenuIndex(preState => (preState === 0)? 0 : preState - 1)
                            return
                        }
                        if(store.getState().game.innerMenuOpen === 2){
                            setInnerMenuIndex(preState => (preState === 0)? 0 : preState - 1)
                            return
                        }
                    }
                    if($event.key === 'ArrowDown'){              
                        if(store.getState().game.innerMenuOpen === 1){   
                            setMenuIndex(preState => (preState < (skillRef.current.skill.length - 1))? preState + 1 : preState)                             
                            return
                        }else{
                            setInnerMenuIndex(preState => (preState === (units.length - 1))? preState : preState + 1)
                            return                        
                        }
                    }
                    if($event.key === 'ArrowRight'){
                        if(store.getState().game.innerMenuOpen === 0) setMenuIndex(preState => (preState < (units.length - 1))? preState + 1 : preState)
                    }
                    if($event.key === 'ArrowLeft'){
                        if(store.getState().game.innerMenuOpen === 0) setMenuIndex(preState => (preState === 0)? 0 : preState - 1)
                    }            
                    if($event.key === 'Enter') setEnterPressed(true)    
                }
            break;
            case 4: // TEAM
                if(teamRef.current){
                    const {  functions, frontLine, backLine } = teamRef.current
                    if($event.key === 'ArrowUp'){
                        setMenuIndex(preState => {
                            if(preState === 0 || preState === frontLine.length) return -1
                            return preState - 1
                        })
                    }
                    if($event.key === 'ArrowDown'){
                        setMenuIndex(preState => {
                            if(preState < 0) return 0
                            if(preState === (frontLine.length - 1) || preState === ((frontLine.length + backLine.length) - 1)) return preState
                            else return preState + 1
                        })   
                    }      
                    if($event.key === 'ArrowRight'){
                        setMenuIndex(preState => {
                            if(preState < 0 && preState > (Math.abs(functions.length) * -1)) return preState - 1
                            if((preState + frontLine.length) > ((frontLine.length + backLine.length) - 1)) return (frontLine.length + backLine.length) - 1
                            else return preState + frontLine.length 
                        })
                    }
                    if($event.key === 'ArrowLeft'){
                        setMenuIndex(preState => {
                            if(preState < 0) return preState + 1
                            if((preState - backLine.length) < 0) return 0
                            else return preState - backLine.length
                        })  
                    }
                    if($event.key === 'Enter') setEnterPressed(true)
                }
            break;
            case 5: // STATUS
                if(store.getState().game.innerMenuOpen === 1){
                    const equipment = Object.entries(units[menuIndexRef.current].equip).length
                    if($event.key === 'ArrowUp') setMenuIndex(preState => (preState === 0 || preState === 1)? preState : preState - 2)
                    if($event.key === 'ArrowDown') setMenuIndex(preState => (preState + 2 > (equipment - 1))? equipment - 1 : preState + 2)   
                    if($event.key === 'ArrowLeft') setMenuIndex(preState => {
                        const remain = preState % 2
                        return (remain > 0)? preState - 1 : preState
                    })
                    if($event.key === 'ArrowRight') setMenuIndex(preState => {
                        console.log(preState % 2)
                        const remain = preState % 2
                        return preState === (equipment - 1)? preState : (remain === 0)? preState + 1 : preState
                    })                         
                }

                if(store.getState().game.innerMenuOpen === 2){
                    // TODO - Select item to equip
                }
                if(store.getState().game.innerMenuOpen === 0){
                    if($event.key === 'ArrowLeft') setMenuIndex(preState => (preState === 0)? 0 : preState - 1)
                    if($event.key === 'ArrowRight') setMenuIndex(preState => (preState === (units.length - 1))? preState : preState + 1) 
                }
                if($event.key === 'Enter') setEnterPressed(true)            
            break; 
            case 6: case 7: // SAVE, LOAD
                if($event.key === 'ArrowUp') setMenuIndex(preState => preState === 0? 0 : preState - 1)
                if($event.key === 'ArrowDown') setMenuIndex(preState => preState === (saveSlot - 1)? preState : preState + 1)
                if($event.key === 'Enter') setEnterPressed(true)    
            break;
            case 8:
                if(optionRef.current){
                    const { options } = optionRef.current

                    if($event.key === 'ArrowUp') 
                        setMenuIndex(preState => {
                            if(preState === 0) return preState

                            if(preState > 1) return 1
                            else return preState - 1
                        })

                    if($event.key === 'ArrowDown')
                        setMenuIndex(preState => {
                            if(preState < 2) return preState +1
                            else return preState
                        })                      
                        
                    if($event.key === 'ArrowRight'){
                        if(menuIndexRef === 0 && options[0].value < 100) options[0].set(options[0].value + 1)
                        if(menuIndexRef === 1 && options[1].value < 100) options[1].set(options[1].value + 1)
                        else{
                            if(menuIndex < (LANGUAGELIST.length + 1)) setMenuIndex(preState => preState + 1)
                        }
                    }

                    if($event.key === 'ArrowLeft'){
                        if(menuIndexRef === 0 && options[0].value > 0) options[0].set(options[0].value - 1)
                        if(menuIndexRef === 1 && options[1].value > 0) options[1].set(options[1].value - 1)
                        else{
                            if(menuIndex < (LANGUAGELIST.length + 1)) setMenuIndex(preState => preState - 1)
                        }
                    }
                }
            break;
        }

        if($event.key === 'Escape'){
            const innerMenuOpen = store.getState().game.innerMenuOpen
            if(innerMenuOpen > 0){
                // CLose inner menu
                setInnerMenuIndex(0)
                dispath(setMenu({ type: 2, value: innerMenuOpen - 1 }))
                if(innerMenuOpen === 1 && menuOpen === 3) skillRef.current?.reset()
            }else{
                // Close parent menu
                store.dispatch(
                    setMenu({type: 1, value: 1})
                )                           
                setMenuIndex(menuOpen - 1)
            }
        }        
    }

    useEffect(()=> {
        console.log('menuOpen updated', menuOpen)

        switch(menuOpen){
            case 1: // SYSTEM
            case 5: // STATUS
            case 6: // SAVE
            case 7: // LOAD
            case 8: // OPTION            
                setMenuIndex(0)
            break;
            case 2: // ITEM
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
            case 3: // SKILL
                import('../data/skill.json').then(data => {
                    console.log(data)
                    dispath(setList({ type: 3, data: data.default }))
                    setMenuIndex(0)
                })                
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
                className="menu hide"
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
                                    onClick={() => dispath(setMenu({ type: 1, value: index + 2 }))}
                                >
                                    { menuOpen === 1 && menuIndex === index? 
                                        <MenuArrow /> : null
                                    }
                                    
                                    <span style={{ 
                                        width: `${(gameWidth * 0.3) * 2/3}px`,
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
                    enterPressed={enterPressed}
                    setEnterPressed={setEnterPressed}
                    setMenuIndex={setMenuIndex}
                    setInnerMenuIndex={setInnerMenuIndex} 
                /> : null
            }

            {/*  SKILL  */}
            { menuOpen === 3 && skillList.length? 
                <SkillMenu
                    menuIndex={menuIndex}
                    innerMenuIndex={innerMenuIndex}
                    enterPressed={enterPressed}
                    setEnterPressed={setEnterPressed}                    
                    setMenuIndex={setMenuIndex}
                    setInnerMenuIndex={setInnerMenuIndex}
                    ref={skillRef}            
                /> : null
            }        

            {/*  TEAM  */}
            { menuOpen === 4?
                <TeamMenu
                    menuIndex={menuIndex}
                    innerMenuIndex={innerMenuIndex}
                    enterPressed={enterPressed}
                    setEnterPressed={setEnterPressed}                    
                    setMenuIndex={setMenuIndex}
                    setInnerMenuIndex={setInnerMenuIndex}   
                    ref={teamRef}              
                /> : null
            }
            
            {/*  STATUS  */}
            { menuOpen === 5? 
                <StatusMenu
                    menuIndex={menuIndex}
                    innerMenuIndex={innerMenuIndex}
                    enterPressed={enterPressed}
                    setEnterPressed={setEnterPressed}                    
                    setMenuIndex={setMenuIndex}
                    setInnerMenuIndex={setInnerMenuIndex}                    
                /> : null
            }
            
            {/*  SAVE  */}
            {/*  LOAD  */}
            { menuOpen === 6 || menuOpen === 7?
                <FileMenu 
                    mode={menuOpen}
                    menuIndex={menuIndex}
                    setMenuIndex={setMenuIndex}
                    enterPressed={enterPressed}
                    setEnterPressed={setEnterPressed}                         
                /> : null
            }

            {/*  OPTION  */}
            { menuOpen === 8?
                <OptionMenu 
                    menuIndex={menuIndex}
                    setMenuIndex={setMenuIndex}
                    enterPressed={enterPressed}
                    setEnterPressed={setEnterPressed}
                    ref={optionRef}
                /> : null
            }
        </div>
    )
}