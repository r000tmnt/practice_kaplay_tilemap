import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { setMenu, setList } from '../store/game'
import { pixelatedBorder } from '../utils/ui'
import store from "../store/store";

import MenuArrow from './menuArrow'
import Sprite from './sprite'

// First and the second inner menu count as parent for the ease of use here
const SkillMenu = forwardRef(({ 
    menuIndex, 
    innerMenuIndex,
    enterPressed,
    setEnterPressed,     
    setMenuIndex, 
    setInnerMenuIndex,
}, ref) => {
    const menuOpen = useSelector(state => state.game.menuOpen)
    const innerMenuOpen = useSelector(state => state.game.innerMenuOpen)
    const gameWidth = useSelector(state => state.setting.width)
    const scale = useSelector(state => state.setting.scale)
    const units = useSelector(state => state.game.units)  
    const skillList = useSelector(state => state.game.skills)
    const [inspectingUnit, setInspectingUnit] = useState(-1)
    const [skill, setSkill] = useState([])
    const dispatch = useDispatch() 

    const setMenuPosition = ($el) => {
        if($el) $el.classList.add('show')
    }

    const getUnitSkillList = (index) => {
        console.log(units[index])
        if(units[index]){
            const list = []
            units[index].skill.forEach(id => {
                const skillList = store.getState().game.skills
                const data = skillList.find(s => s.id === id)
                if(data) list.push(data)
            });

            setSkill(list)
        }
    }

    const reset = () => {
        setMenuIndex(inspectingUnit)
        setInspectingUnit(-1)
    }

    useEffect(() => {
        if(enterPressed){
            if(innerMenuOpen === 0){
                setInspectingUnit(menuIndex)
                dispatch(setMenu({ type: 2, value: 1 }))
                setMenuIndex(0)
            }
            if(innerMenuOpen === 1){
                if(skill[menuIndex].type === 'Support') dispatch(setMenu({ type: 2, value: 2 }))
                setInnerMenuIndex(0)
            }
            if(innerMenuOpen === 2){
                console.log(`cast skill`)
            }
            setEnterPressed(false)
        }
    }, [enterPressed])  
    
    useEffect(() => {
        // console.log('menuIndex updated!', menuIndex)
        if(inspectingUnit < 0) getUnitSkillList(menuIndex)
    }, [menuIndex])

    useImperativeHandle(ref, () => ({
        skill,
        reset
    }))    

    return(
        <div 
            className={`menu sub_menu hide`} 
            style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px`, fontSize: `${8 * (scale * 10)}px`}}
            ref={($el) => setMenuPosition($el)}>
            <div className="title" style={{ boxShadow: pixelatedBorder(scale * 10, 'black'), textAlign: 'center' }}>SKILL</div>
            <div className="flex" style={{margin: `${scale * 100}px 0`, justifyContent: 'space-around'}}>
                {
                    inspectingUnit >= 0? 
                    <>
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
                        </div>
                        {/* <div>{ units[inspectingUnit].name }</div> */}
                        <div>HP {units[inspectingUnit].attribute.hp}/{units[inspectingUnit].attribute.maxHp}</div>
                        <div>MP {units[inspectingUnit].attribute.mp}/{units[inspectingUnit].attribute.maxMp}</div>                        
                    </>
                    :
                    units.map((unit, index) => 
                        <div className="flex" key={index}>
                            { innerMenuOpen === 0 && menuIndex === index ? 
                                <span
                                className="arrow" 
                                style={{ 
                                    position: 'relative', 
                                    zIndex: 11,
                                    left: `${(Math.abs(scale * 10) * -1)}px`
                                }}>
                                    <MenuArrow />
                                </span> :
                                <span style={{width: `${8 * Math.floor(scale * 10)}px`}}></span>
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
                                            setInspectingUnit(index)
                                            dispatch(setMenu({type: 2, value: 1}))
                                            unit.skill.forEach(id => {
                                                const data = skillList.find(s => s.id === id)
                                                if(data){
                                                    setSkill(preState => [...preState, data])
                                                }
                                            });                                        
                                        }
                                    }}
                                />                                
                            </div>
                        </div>
                    )
                }
            </div>
            
            <div 
                className={`flex flex-col`}
                style={{
                    boxShadow: pixelatedBorder(scale * 10, 'black'), 
                    padding: `${scale * 10}px`,
                    boxSizing: 'border-box',
                    display: skill.length? 'block' : 'none'
                }}>
                {
                    skill.map((item, index) => 
                    <div 
                        className="skill flex" 
                        key={index}
                        onMouseOver={() => {
                            if(inspectingUnit < 0) return
                            setMenuIndex(index)
                        }}
                        onClick={() => {
                            if(skill[menuIndex].type === 'Support') dispatch(setMenu({ type: 2, value: 2 }))
                            setInnerMenuIndex(0)
                        }}>
                        { inspectingUnit >= 0 && menuIndex === index? 
                            <span style={{ position: 'absolute', zIndex: 11 }}>
                                <MenuArrow /> 
                            </span> : null
                        }                        
                        <div className="flex" style={{
                            width: `${gameWidth * 0.75}px`,
                            marginLeft: 'auto',
                        }}>
                            <span style={{ width: '70%' }}>{ item.name }</span>
                            {
                                Object.keys(item.cost).map((key, i) => {
                                    return (
                                    <span key={i}>
                                        {key}: {item.cost[key]} 
                                    </span>
                                    )
                                })  
                            }
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
                    { innerMenuOpen === 2? 
                        <div className="innerMenu">
                            <div className="flex flex-col">
                                { units.map((unit, index) => 
                                    <div 
                                        className="flex" 
                                        key={index} 
                                        onMouseOver={() => setInnerMenuIndex(index)}
                                        onClick={() => { console.log('use item') }}>
                                        { innerMenuIndex === index? 
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
                            </div>
                        </div> : skill[menuIndex]? skill[menuIndex].desc : ''
                    }
                </div>
                <button style={{ 
                    width: '100%', 
                    backgroundColor: 'white', 
                    margin: `${scale * 10}px 0`,
                    color: 'black', 
                    fontSize: `${8 * (scale * 10)}px` 
                }} onClick={() => {
                    if(innerMenuOpen > 0){
                        // Close inner menu
                        dispatch(setMenu({ type: 2, value: innerMenuOpen - 1 }))
                        setInnerMenuIndex(0)
                        if(innerMenuOpen === 1) reset()
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
});

export default SkillMenu
