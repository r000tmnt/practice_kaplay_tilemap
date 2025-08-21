import { useEffect, useState } from "react"
// import store from "../store/store"
import { useSelector } from "react-redux"
import parse from 'html-react-parser';

export default function Dialogue(){
    const uiOffsetV = useSelector((state) => state.setting.uiOffsetV)
    // const gameWidth = useSelector((state) => state.setting.width)
    const gameHeight = useSelector((state) => state.setting.height)
    // const scale = useSelector((state) => state.setting.scale)
    const label = useSelector((state) => state.game.textLabel)
    const dialogue = useSelector(state => state.dialogue.dialogue)
    const name = useSelector(state => state.dialogue.name)
    // const index = useSelector(state => state.index)
    // const speed = useSelector(state => state.speed)
    // const mode = useSelector(state => state.mode)
    // const flag = useSelector(state => state.flag) 
    // const point = useSelector(state => state.point)    
    const [isVisible, setIsVisible] = useState(false)

    const setDialoguePosition = ($el) => {
        if($el){
            setTimeout(() => {
                $el.style.bottom = 0
            }, 50)
        }
    }

    const handleContinue = ($event) => {
        console.log('clicked or pressed', $event)
    }    

    useEffect(() => {
        if(label.length || dialogue.length){
            setIsVisible(true)
        } else {
            setIsVisible(false)
        }
    }, [label, dialogue])

    useEffect(() => {
        window.addEventListener('keyup', handleContinue, true)

        return() => {
            window.removeEventListener('keyup', handleContinue, true)
        }
    }, [])

    return(
        <div 
            className='ui' style={{left: `${uiOffsetV}px`, height: `${gameHeight}px`}}>
            <div 
                className='dialogue_wrapper' 
                style={{ bottom: `-${gameHeight}px`}}
                ref={($el) => setDialoguePosition($el)}
                onClick={handleContinue}  
            >
                <div className='name_tag border bg-black' style={{ visibility: isVisible? 'visible' : 'hidden', zIndex: name.length? 11 : -1 }}>
                    { /** name  */ }
                </div>
                <div className='dialogue border disable-scrollbars'>
                    <p>{ /** dialogue  */  }</p>
                    {
                        label.length?
                        label.map((item) => parse(item)) :
                        null
                    }                    
                </div>
            </div>

        </div>
    )
}