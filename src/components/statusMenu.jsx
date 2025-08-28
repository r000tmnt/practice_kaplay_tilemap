import { useSelector, useDispatch } from "react-redux"
import { setMenu } from "../store/game"
import { pixelatedBorder } from "../utils/ui"

export function StatusMenu({ menuIndex, setMenuIndex }){
    const gameWidth = useSelector(state => state.setting.width)
    const scale = useSelector(state => state.setting.scale)
    const units = useSelector(state => state.game.units)
    const menuOpen = useSelector(state => state.game.menuOpen)
    const dispatch = useDispatch()

    return(
        <div className={`menu sub_menu_menu hide`} style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px`, fontSize: `${8 * (scale * 10)}px`  }}>
            <div className="title" style={{ boxShadow: pixelatedBorder(scale * 10, 'black'), textAlign: 'center' }}>STATUS</div>
            <div className="flex">
                {
                    units.map((unit, index) => 
                        <div>
                            { menuIndex === index ? 
                                <span
                                className="arrow" 
                                style={{ 
                                    position: 'relative', 
                                    zIndex: 11,
                                    left: `${(Math.abs(scale * 10) * -1)}px`
                                }}>
                                    <MenuArrow />
                                </span> : <span style={{width: `${8 * Math.floor(scale * 10)}px`}}></span>
                            }                            
                            <div className="avatar" style={{
                                backgroundImage: 'url("/character/swordsman_spritesheet.png")',
                                backgroundPosition: `-${(9 * 64) + 22}px -${(9 * 64) + 17}px`,
                            }}
                            onMouseOver={() => setMenuIndex(index)}
                            ></div>                            
                        </div>
                    )
                }
            </div>
            <div 
            className="status items"
            style={{
                rowGap: scale * 10 + 'px',
                columnGap: scale * 20 + 'px',
                paddingTop: scale * 10 + 'px'
            }}>
            { 
                Object.entries(units[menuIndex].attribute).forEach((param, index) => 
                    <div className="flex" key={index}
                    style={{
                        width: `${gameWidth * 0.3}px`,
                        marginLeft: 'auto',
                        justifyContent: 'space-around'
                    }}>
                        <span>{ param[0] }</span>
                        <span style={{ marginLeft: 'auto' }}>{ param[1] }</span>                                
                    </div>
                )
            }
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
}