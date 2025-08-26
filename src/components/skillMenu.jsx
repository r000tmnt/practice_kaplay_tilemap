import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from "react"
import { setMenu, setList } from '../store/game'
import { pixelatedBorder } from '../utils/ui'
import store from "../store/store";

import MenuArrow from './menuArrow'

function SkillMenu({ 
    menuIndex, 
    innerMenuIndex,
    enterPressed,
    setEnterPressed,     
    setMenuIndex, 
    setInnerMenuIndex,
}){
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

    useEffect(() => {
        if(enterPressed){
            if(innerMenuOpen === 1){
                units[menuIndex].skill.forEach(id => {
                    const skillList = store.getState().game.skills
                    const data = skillList.find(s => s.id === id)
                    if(data){
                        setSkill(preState => [...preState, data])
                    }
                });
                dispatch(setMenu({ type: 2, value: 2 }))
                setMenuIndex(0)
            }
            if(innerMenuOpen === 2){
                if(skill[innerMenuIndex].type === 'Support') dispatch(setMenu({ type: 2, value: 3 }))
            }
            if(innerMenuOpen === 3){
                console.log(`use item`)
            }
            setEnterPressed(false)
        }
    }, [enterPressed])    

    useEffect(() => {
        setMenuIndex(0)
        dispatch(setMenu({type: 2, value: 1}))
    }, [])

    return(
        <div 
            className={`menu sub_menu hide`} 
            style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px`, fontSize: `${8 * (scale * 10)}px`}}
            ref={($el) => setMenuPosition($el)}>
            <div className="flex filter" style={{ boxShadow: pixelatedBorder(scale * 10, 'black') }}>
                { inspectingUnit >= 0?
                    <div 
                        className="flex w-full" 
                        style={{
                            whiteSpace: 'nowrap',
                            justifyContent: 'space-around'
                        }} >
                        <div>{ units[inspectingUnit].name }</div>
                        <div>HP {units[inspectingUnit].attribute.hp}/{units[inspectingUnit].attribute.maxHp}</div>
                        <div>MP {units[inspectingUnit].attribute.mp}/{units[inspectingUnit].attribute.maxMp}</div>
                    </div>   :
                    'Whose skill to inspect?'
                }
            </div>

            {  innerMenuOpen === 1?
                units.map((unit, index) => 
                <div 
                    className="flex" 
                    key={index} 
                    onMouseOver={() => setMenuIndex(index)}
                    onClick={() => {
                        setInspectingUnit(index)
                        dispatch(setMenu({type: 2, value: 2}))
                        unit.skill.forEach(id => {
                            const data = skillList.find(s => s.id === id)
                            if(data){
                                setSkill(preState => [...preState, data])
                            }
                        });
                    }}>
                    { menuOpen === 3 && menuIndex === index? 
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
                ) : null
            }

            <div 
                className={`flex flex-col hide ${innerMenuOpen > 1? 'show' : ''}`}
                style={{
                    paddingTop: scale * 10 + 'px'
                }}>
                {
                    skill.map((item, index) => 
                    <div 
                        className="skill flex" 
                        key={index}
                        onMouseOver={() => {
                            if(innerMenuOpen > 0) return
                            setMenuIndex(index)
                        }}
                        onClick={() => {
                            // if(item.type === 1) dispatch(setMenu({ type: 2, value: 1 }))
                        }}>
                        { menuOpen === 3 && menuIndex === index? 
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
                    { innerMenuOpen === 3? 
                        <div className="innerMenu">
                            <div className="flex flex-col">
                                { units.map((unit, index) => 
                                    <div 
                                        className="flex" 
                                        key={index} 
                                        onMouseOver={() => setInnerMenuIndex(index)}
                                        onClick={() => { console.log('use item') }}>
                                        { menuOpen === 3 && innerMenuIndex === (index + units.length)? 
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
                        </div> : skill[innerMenuIndex]? skill[innerMenuIndex].desc : ''
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

export default SkillMenu
