import { useEffect, useState, useRef } from "react"
// import store from "../store/store"
import { setTextLabel } from "../store/game";
import { setDialogue } from "../store/dialogue";
import { useDispatch, useSelector } from "react-redux"
import parse from 'html-react-parser';

export default function Dialogue(){
    const uiOffsetV = useSelector((state) => state.setting.uiOffsetV)
    // const gameWidth = useSelector((state) => state.setting.width)
    const gameHeight = useSelector((state) => state.setting.height)
    const scale = useSelector((state) => state.setting.scale)
    const label = useSelector((state) => state.game.textLabel)
    const dialogue = useSelector(state => state.dialogue.dialogue)
    const name = useSelector(state => state.dialogue.name)
    // const index = useSelector(state => state.index)
    // const speed = useSelector(state => state.speed)
    // const mode = useSelector(state => state.mode)
    // const flag = useSelector(state => state.flag) 
    // const point = useSelector(state => state.point)    
    const [isVisible, setIsVisible] = useState(false)
    const dialogueRef = useRef(null)
    const dispath = useDispatch()

    const setDialoguePosition = ($el) => {
        if($el){
            setTimeout(() => {
                $el.style.bottom = 0
            }, 5)
        }
    }

    const handleContinue = ($event) => {
        console.log('clicked or pressed', $event)

        if(!dialogueRef.current) return

        if(dialogueRef.current.childElementCount > 1){
            if($event.type === 'click' || $event.key === 'Enter'){
                if(label.length) dispath(setTextLabel([]))
                if(dialogue.length) dispath(setDialogue(''))
            }            
        }
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
                style={{ 
                    bottom: `-${gameHeight}px`, 
                    fontSize: `${8 * (scale * 10)}px`
                }}
                ref={($el) => setDialoguePosition($el)}
                onClick={(e) => handleContinue(e)}  
            >
                <div className='name_tag border bg-black' style={{ visibility: isVisible? 'visible' : 'hidden', zIndex: name.length? 11 : -1 }}>
                    { /** name  */ }
                </div>
                <div className='dialogue border disable-scrollbars' ref={($el) => dialogueRef.current = $el}>
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