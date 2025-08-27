import { playerPositionRef, pixelatedBorder } from "../utils/ui"
import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setList, setMenu } from "../store/game";

import MenuArrow from './menuArrow'

const TeamMenu = forwardRef(({
    menuIndex, 
    innerMenuIndex,
    enterPressed,
    setEnterPressed,     
    setMenuIndex, 
    setInnerMenuIndex,    
}, ref) => {
    const menuOpen = useSelector(state => state.game.menuOpen)
    const gameWidth = useSelector(state => state.setting.width)
    const scale = useSelector(state => state.setting.scale)
    const units = useSelector(state => state.game.units)  
    const [frontLine, setFrontLine] = useState([])
    const [backLine, setBackLine] = useState([])
    const [selectedTarget, setSelectedTarget] = useState(-1)
    const dispatch = useDispatch()
    const menuRef = useRef(null)

    useImperativeHandle(ref, () => ({
        frontLine,
        backLine
    }))

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
                    // Place the arrow at the center vertically
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

    const setTarget = (index) => {
        if(selectedTarget < 0){
            setSelectedTarget(index)
        }else{
            // SWAPE
            const copy = JSON.parse(JSON.stringify(units))
            const firstUnit = copy[selectedTarget]
            const target = copy[index]

            copy[selectedTarget] = target
            copy[selectedTarget].index = index
            copy[index] = firstUnit
            copy[index].index = selectedTarget

            dispatch(setList({ type: 1, data: copy }))

            // Reset value
            setSelectedTarget(-1)
        }
    }

    const changePosition = () => {
        const newBackLine = frontLine.map(p => {
            p[0] = 0.8
            return p
        })
        const newFrontLine = backLine.map(p => {
            p[0] = 0.7
            return p
        })

        const frontUnits = []
        const backUnits = []

        frontLine.forEach((p, index) => {
            const unit = units.find(u => u.index === index)
            if(unit) frontUnits.push(JSON.parse(JSON.stringify(unit)))
        })

        backLine.forEach((p, index) => {
            const unit = units.find(u => u.index === (index + frontLine.length))
            if(unit) backUnits.push(JSON.parse(JSON.stringify(unit)))
        })

        const newFormation = newFrontLine.concat(newBackLine)
        newFormation.forEach((p, index) => {
            // Update playerPositionRef
            playerPositionRef[index] = p
        })
    
        const newTeam = backUnits.concat(frontUnits)
        newTeam.forEach((u, index) => {
            u.index = index
        })
    
        setFrontLine(newFrontLine)
        setBackLine(newBackLine)
        dispatch(setList({ type: 1, data: newTeam }))
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
                <button style={{ 
                    margin: `${scale * 10}px 0`, 
                    color: 'black', 
                    backgroundColor: 'white', 
                    width: 'fit-content', 
                    boxShadow: pixelatedBorder(scale * 10, 'black') 
                }}
                onClick={() => changePosition()}
                >CHANGE</button>
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
                            onClick={() => setTarget(index)}
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
                                    }}>
                                        { units[index].name }    
                                    </div>                                  
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
                            onClick={() => setTarget(index + frontLine.length)}
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
                                    }}>
                                        { units[index + frontLine.length].name }
                                    </div>                                 
                            </div>
                        )}                        
                    </div>                        
                </div>
            </div>
            <div className="bottom">
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
});

export default TeamMenu