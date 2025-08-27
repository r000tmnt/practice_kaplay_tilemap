import { playerPositionRef } from "../utils/ui"
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pixelatedBorder } from '../utils/ui'

import MenuArrow from './menuArrow'

export default function TeamMenu({
    menuIndex, 
    innerMenuIndex,
    enterPressed,
    setEnterPressed,     
    setMenuIndex, 
    setInnerMenuIndex,    
}){
    const gameWidth = useSelector(state => state.setting.width)
    const scale = useSelector(state => state.setting.scale)
    const [frontLine, setFrontLine] = useState([])
    const [backLine, setBackLine] = useState([])
    const [selectedTarget, setSelectedTarget] = useState({})
    const dispatch = useDispatch()
    const menuRef = useRef(null)

    const setMenuPosition = ($el) => {
        if($el) $el.classList.add('show')
        menuRef.current = $el
    }

    const setArrowPosition = (index) => {
        if(!menuRef.current) return
        const posEl = menuRef.current.children[2].children[0]

        let line

        if(index <= (frontLine.length - 1)){
            console.log(posEl.children[0])
            line = posEl.children[0]
        }else{
            console.log(posEl.children[1])
            line = posEl.children[1]
        }

        if(line.children.length){
            const block = Array.from(line.children).find(child => {
                // console.log(child)
                if(Number(child.dataset.index) === index) return child
            })

            // console.log('block', block)

            if(block){
                const arrow = document.querySelector('.arrow')
                console.log('arrow', arrow)

                if(arrow){
                    // Place the arrow at the center vertcally
                    let times = 1
                    if(frontLine.length < backLine.length){
                        times = (index <= (frontLine.length - 1))? 
                            3 + (index * 4): 1 + ((index - frontLine.length) * 4)
                    }else{
                        times = (index <= (frontLine.length - 1))? 
                            1 + (index * 4) : 3 + ((index - frontLine.length) * ((index - frontLine.length) * 4))
                    }
                    arrow.style.top = `${(27 / 2) * times}px`
                    arrow.style.left = `${index <= (frontLine.length - 1)? -27 : 0}px` 
                }                   
            }            
        }
    }

    useEffect(() => {
        console.log('menuIndex updated', menuIndex)
        setArrowPosition(menuIndex)
    }, [menuIndex])

    useEffect(() => {
        setMenuIndex(0)
        setFrontLine(playerPositionRef.filter(pos => pos[0] === 0.7))
        setBackLine(playerPositionRef.filter(pos => pos[0] === 0.8))
    }, [])    

    return(
        <div 
            className={`menu sub_menu hide`} 
            ref={($el) => setMenuPosition($el)} 
            style={{ 
                padding: `${(8 * Math.floor(scale * 10)) / 2}px`, 
                position: 'absolute', 
                fontSize: `${8 * (scale * 10)}px` 
            }}>
            <div className="title" style={{ boxShadow: pixelatedBorder(scale * 10, 'black'), textAlign: 'center' }}>TEAM FORMATION</div>
            <div className="flex" style={{ flexDirection: 'row-reverse' }}>
                <button style={{ margin: `${scale * 10}px 0`, color: 'black', backgroundColor: 'white', width: 'fit-content', boxShadow: pixelatedBorder(scale * 10, 'black'), }}>SWITCH</button>
            </div>
            <div className="pos" style={{ width: `${gameWidth / 5}px`, top: '40%', position: 'relative', margin: '0 auto', transform: 'translate(0, -40%) scale(5)' }}>
                <div className="flex p-center" style={{ position: 'absolute' }}>
                    <div style={{ height: 'fit-content', margin: 'auto 0' }}>
                        { frontLine.map((pos, index) =>
                            <div style={{ 
                                width: `${17 + 10}px`, 
                                height: `${17 + 10}px`,
                                margin: `${17 + 10}px 0`,
                                background: 'lightgrey'
                            }}
                            key={index}
                            data-index={index}
                            onMouseOver={() => setMenuIndex(index)}
                            >
                                { menuIndex === index ? 
                                    <span
                                    className="arrow" 
                                    style={{ 
                                        position: 'absolute', 
                                        zIndex: 11, 
                                        transform: 'scale(0.2)', 
                                    }}>
                                        <MenuArrow />
                                    </span> : null
                                }
                                <div 
                                    className="front"
                                    style={{
                                        position: 'absolute',
                                        margin: `-10px 0 auto ${17 /4}px`,
                                        backgroundImage: 'url("/character/swordsman_spritesheet.png")',
                                        backgroundPosition: `-${(9 * 64) + 22}px -${(9 * 64) + 17}px`,
                                        width: '17px',
                                        height: '30px',
                                        backgroundSize: 'auto',
                                    }}></div>                                  
                            </div>
                        )}                        
                    </div>
                    <div style={{ height: 'fit-content', margin: 'auto 0' }}>
                        { backLine.map((pos, index) =>
                            <div style={{ 
                                width: `${17 + 10}px`, 
                                height: `${17 + 10}px`,
                                margin: `${17 + 10}px 0`,
                                background: 'lightgrey'
                            }}
                            data-index={index + frontLine.length}
                            key={index}
                            onMouseOver={() => setMenuIndex(index + frontLine.length)}
                            >
                                { menuIndex === (index + frontLine.length) ? 
                                    <span 
                                    className="arrow"
                                    style={{ 
                                        position: 'absolute', 
                                        zIndex: 11, 
                                        transform: 'scale(0.2)', 
                                    }}>
                                        <MenuArrow />
                                    </span> : null
                                }
                                <div 
                                    className="back"
                                    style={{
                                        position: 'absolute',
                                        margin: `-10px 0 auto ${17 /4}px`,
                                        backgroundImage: 'url("/character/swordsman_spritesheet.png")',
                                        backgroundPosition: `-${(9 * 64) + 22}px -${(9 * 64) + 17}px`,
                                        width: '17px',
                                        height: '30px',
                                        backgroundSize: 'auto',
                                    }}></div>                                 
                            </div>
                        )}                        
                    </div>                        
                </div>
            </div>
        </div>
    )
}