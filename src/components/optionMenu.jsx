import { useSelector, useDispatch } from "react-redux"
import { pixelatedBorder } from "../utils/ui"
import { useEffect, useState, useImperativeHandle, forwardRef  } from "react"

import { LANGUAGELIST } from '../utils/ui'

const OptionMenu = forwardRef(({
    menuIndex,
    setMenuIndex,
    enterPressed,
    setEnterPressed
}, ref) => {
    const scale = useSelector(state => state.setting.scale)
    const [bgmVolumn, setBgmVolumn] = useState(100)
    const [seVolumn, setSEVolumn] = useState(100)
    const [currentLang, setCurrentLang] = useState(LANGUAGELIST[0])

    useImperativeHandle(ref, () => ({
        options: [
            {
                name: 'BGM',
                value: bgmVolumn,
                set: (v) => setBgmVolumn(v)
            },
            {
                name: 'SE',
                value: seVolumn,
                set: (v) => setSEVolumn(v)
            },
            {
                name: 'lang',
                value: currentLang,
                set: (v) => setCurrentLang(v)
            }
        ]
    }))

    const setMenuPosition = ($el) => {
        if($el) $el.classList.add('show')
    }    

    useEffect(() => {
        if(enterPressed){
            // ...
            setEnterPressed(false)
        }
    }, [enterPressed])

    return(
        <div 
            className="menu sub_menu hide" 
            ref={($el) => setMenuPosition($el)} 
            style={{ padding: `${(8 * Math.floor(scale * 10)) / 2}px` }}>
            <div className="title" style={{ boxShadow: pixelatedBorder(scale * 10, 'black'), textAlign: 'center' }}>OPTION</div>
            <ul>
                <li>
                    <div className="sub_title">BGM</div>
                    <input 
                        className="w-full" 
                        type="range" 
                        value={bgmVolumn} 
                        onMouseOver={() => setMenuIndex(0)}
                        onChange={(v) => setBgmVolumn(v)} 
                        style={{ 
                            boxShadow: (menuIndex === 0)? pixelatedBorder(scale * 5, 'grey') : 'unset',
                        }}
                    />
                </li>
                <li>
                    <div className="sub_title">SE</div>
                    <input 
                        className="w-full" 
                        type="range" 
                        value={seVolumn} 
                        onMouseOver={() => setMenuIndex(1)}
                        onChange={(v) => setSEVolumn(v)} 
                        style={{ 
                            boxShadow: (menuIndex === 1)? pixelatedBorder(scale * 5, 'grey') : 'unset',
                        }}
                    />
                </li>
                <li>
                    <div className="sub_title">LANGUAGE</div>
                    <div className="flex">
                        {
                            LANGUAGELIST.map((lang, index) => 
                                <button 
                                    style={{ 
                                        background: (menuIndex === index + 2)? 'white' : 'lightgrey', 
                                        fontSize: `${6 * (scale * 10)}px`,
                                        marginRight: `${scale * 10}px`,
                                    }}
                                    onMouseOver={() => setMenuIndex(index + 2)}
                                    onClick={() => setCurrentLang(lang)}
                                    disabled={currentLang === lang}    
                                >{lang}</button>
                            )
                        }
                    </div>
                </li>                
            </ul>
        </div>
    )
});

export default OptionMenu