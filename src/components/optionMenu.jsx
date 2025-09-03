import { useSelector, useDispatch } from "react-redux"
import { pixelatedBorder } from "../utils/ui"
import { useEffect } from "react"

const LANGUAGELIST = [
    'ENG', 'ZH-TW'
]

export default function OptionMenu({
    menuIndex,
    setMenuIndex,
    enterPressed,
    setEnterPressed
}){
    const scale = useSelector(state => state.setting.scale)

    const setMenuPosition = ($el) => {
        if($el) $el.classList.add('show')
    }    

    useEffect(() => {}, [])

    return(
        <div 
            className="menu sub_menu hide" 
            ref={($el) => setMenuPosition($el)} 
            style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px` }}>
            <div className="title" style={{ boxShadow: pixelatedBorder(scale * 10, 'black'), textAlign: 'center' }}>OPTION</div>
            <ul>
                <li>
                    <div className="sub_title">BGM</div>
                    <input className="w-full" type="range" />
                </li>
                <li>
                    <div className="sub_title">SE</div>
                    <input className="w-full" type="range" />
                </li>
                <li>
                    <div className="sub_title">LANGUAGE</div>
                    <button style={{ background: 'lightgrey', fontSize: `${6 * (scale * 10)}px` }}>ENG</button>
                </li>                
            </ul>
        </div>
    )
}