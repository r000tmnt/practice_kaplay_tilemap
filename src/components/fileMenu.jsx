import { useSelector, useDispatch } from "react-redux"
import { setMenu } from "../store/game"
import { pixelatedBorder } from "../utils/ui"
import { useEffect } from "react"

export default function FileMenu({
    mode, 
    menuIndex, 
    setMenuIndex, 
    enterPressed, 
    setEnterPressed
}){
    const scale = useSelector(state => state.setting.scale)
    const gameHeight = useSelector(state => state.setting.height)
    const saveSlot = useSelector(state => state.setting.saveSlot)

    const setMenuPosition = ($el) => {
        if($el) $el.classList.add('show')
    }    

    useEffect(() => {
        if(mode === 6){
            // SAVE
        }else{
            // LOAD
        }
        setEnterPressed(false)
    }, [enterPressed])

    return(
        <div className="menu sub_menu hide" ref={($el) => setMenuPosition($el)} style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px` }}>
            <div className="title" style={{ boxShadow: pixelatedBorder(scale * 10, 'black'), textAlign: 'center' }}>{ (mode === 6)? 'SAVE' : 'LOAD' }</div>
            <ul className="files" style={{ height: `${gameHeight * 0.7}px` }}>
                { 
                    Array.from(Array(saveSlot).keys()).map((slot, index) =>
                        <li className="w-full relative" style={{ 
                            boxShadow: pixelatedBorder(scale * 10, (index === menuIndex)? 'black' : 'grey'), 
                            textAlign: 'center',
                            height: '20%',
                            margin: `${scale * 50}px 0`,
                        }}><span className="p-center">EMPTY</span></li>                    
                    )
                }
            </ul>
        </div>
    )
}