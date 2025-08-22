import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pixelatedBorder } from '../utils/ui'
import { setMenu } from "../store/game"
import store from "../store/store";

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
    const [menuIndex, setMenuIndex] = useState(0) 
    const [unitList, setUnitList] = useState([])
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
        console.log('$event', $event)
        // Get latest state
        const menuOpen = store.getState().game.menuOpen
        if(menuOpen === 1){
            if($event.key === 'ArrowUp') setMenuIndex(preState => preState === 0? 0 : preState - 1)
            if($event.key === 'ArrowDown') setMenuIndex(preState => preState === (MEMUITEM.length - 1)? MEMUITEM.length - 1 : preState + 1)
            if($event.key === 'Enter') dispath(setMenu(menuIndex + 2))            
        }
    }

    useEffect(()=> {
        console.log('menuOpen updated', menuOpen)

        switch(menuOpen){
            case 2:
                import('../data/items.json').then(data => {
                    console.log(data)
                    data.forEach(d => {
                        if(!Object.prototype.hasOwnProperty.call(d, 'amount')) d.amount = 1
                    })
                    setItemList(data)
                })
            break;
            case 3:
                import('../data/skill.json').then(data => {
                    console.log(data)
                    setSkillList(data)
                })                
            break;
            case 4:
                import('../data/player.json').then(data => {
                    console.log(data)
                    setUnitList(data)
                })                
            break;
            case 5:
                import('../data/player.json').then(data => {
                    console.log(data)
                    setUnitList(data)
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
            }}>
            <ul 
                className={`menu ${menuOpen !== 1? 'hide' : ''}`}
                ref={($el) => setMenuPosition($el)}
                style={{
                    width: `${gameWidth * 0.3}px`,
                    borderRadius: `${Math.floor(scale * 10)}px`,
                    boxShadow: pixelatedBorder(Math.floor(scale * 10), 'black'),
                    padding: `${(8 * Math.floor(scale * 10)) / 2}px`,
                    fontSize: `${12 * (scale * 10)}px`
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
                                    <img
                                        src="ui/arrow.png"
                                        style={{
                                            opacity: menuIndex === index? 1 : 0,
                                            transform: 'rotate(270deg)',
                                            filter: 'hue-rotate(20deg)',
                                            width: `${8 * Math.floor(scale * 10)}px`,
                                            height: `${8 * Math.floor(scale * 10)}px`,
                                            margin: `auto 0`
                                        }}></img>
                                    <span style={{ 
                                        width: `${(gameWidth * 0.3) - ((8 * Math.floor(scale * 10) * 1.5))}px`,
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
                style={{ 
                    padding: `${(8 * Math.floor(scale * 10)) / 2}px`,
                    fontSize: `${12 * (scale * 5)}px`
                }}>
                <div className="flex filter">
                    <div>ALL</div>
                    <div>EQUIP</div>
                    <div>CONSUME</div>
                    <div>MATERIAL</div>
                    <div>STORY</div>
                </div>
                <div className="items">
                    {
                        itemList.map((item, index) => 
                        <div className="item flex" key={index}>
                            <span>{ item.name }</span>
                            <span>{ item.amount }</span>
                        </div>)
                    }
                </div>
                <div className="desc"></div>
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