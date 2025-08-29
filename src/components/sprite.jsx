import { useEffect, useState } from "react"

/**
 * Display sprite in sprite sheet
 * @param width - The width of sprite
 * @param height - The height of the sprite
 * @param image - The path of the sprite sheet
 * @param position - Css background-position to locate the sprite
 * @param custom - Optional parammeters for customization
 * @param custom.style - An object of css styles
 * @param custom.className - A string of class name(s)
 * @param custom.content - Anything to display within the component
 * @param custom.onMouseOver - A function to trigger when cursor hover on the component
 * @param custom.onClick - A function to trigger when cursor click on the component
 * @returns 
 */
export default function Sprite({
    width, 
    height, 
    image,
    position,
    custom={}
}){
    const { style, className, content, onMouseOver, onClick } = custom

    const [customStyle, setCustomStyle] = useState({
        position: 'absolute',
        backgroundImage: `url(${image})`,
        backgroundPosition: position,
        width: `${width}px`,
        height: `${height}px`,
        backgroundSize: 'auto',        
    })

    useEffect(() => {
        if(style){
            setCustomStyle(preState => {
                return {
                    ...preState,
                    ...style
                }
            })
        }
    }, [])

    return(
        <div 
        className={`sprite ${className}`}
        style={customStyle}
        onMouseOver={() => {
            console.log('sprite onMouseOver')
            if(onMouseOver) onMouseOver()
        }}
        onClick={() => {
            console.log('sprite onClick')
            if(onClick) onClick()
        }}
        >
            { content }    
        </div> 
    )
}