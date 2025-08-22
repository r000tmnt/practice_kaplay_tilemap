import { useSelector } from "react-redux"

export default function MenuArrow(){
    const scale = useSelector(state => state.setting.scale)

    return(
        <img
            src="ui/arrow.png"
            style={{
                transform: 'rotate(270deg)',
                filter: 'hue-rotate(20deg)',
                width: `${8 * Math.floor(scale * 10)}px`,
                height: `${8 * Math.floor(scale * 10)}px`,
                margin: `auto 0`
            }}></img>        
    )
}