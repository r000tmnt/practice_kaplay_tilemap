import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { pixelatedBorder } from '../utils/ui'
import store from "../store/store";

const MEMUITEM = [
    'ITEM', 'TEAM', 'STATUS', 'SAVE', 'OPTION'
]

export default function Menu() {
    const menuOpen = useSelector(state => state.game.menuOpen)
    const gameWidth = useSelector(state => state.setting.width)
    const scale = useSelector(state => state.setting.scale)
    // const uiOffsetV = useSelector(state => state.setting.uiOffsetV)
    // const uiOffsetH = useSelector(state => state.setting.uiOffsetH)   
    const [menuIndex, setMenuIndex] = useState(0) 

    useEffect(()=> {
        console.log('menuOpen updated', menuOpen)
    }, [menuOpen])

    const keyInputEvent = ($event) => {
        console.log('$event', $event)
        // Get latest state
        const menuOpen = store.getState().game.menuOpen
        switch(menuOpen){
            case 1:
                if($event.key === 'ArrowUp') setMenuIndex(preState => preState === 0? 0 : preState - 1)
                if($event.key === 'ArrowDown') setMenuIndex(preState => preState === (MEMUITEM.length - 1)? MEMUITEM.length - 1 : preState + 1)
            break;
        }
    }

    useEffect(() => {
        window.addEventListener('keyup', keyInputEvent)

        return () => {
            window.removeEventListener('keyup', keyInputEvent)
        }
    }, [])

    return(
        <ul 
            className={`menu ${menuOpen === 1? 'show' : 'hide'}`}
            style={{
                width: `${gameWidth * 0.3}px`, 
                fontSize: `${12 * (scale * 10)}px`,
                left: `${gameWidth - (gameWidth * 0.3)}px`,
                borderRadius: `${Math.floor(scale * 10)}px`,
                boxShadow: pixelatedBorder(Math.floor(scale * 10), 'black'),
                padding: `${(8 * Math.floor(scale * 10)) / 2}px`
            }}>
                {
                    MEMUITEM.map((item, index) => {
                        return (
                            <li className="menu-0 flex" key={index}>
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
    )
}