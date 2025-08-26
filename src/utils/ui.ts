export const pixelatedBorder = (size: number, color: string) => {
    return `${size}px 0 0 0 ${color}, 
            -${size}px 0 0 0 ${color}, 
            0 ${size}px 0 0 ${color}, 
            0 -${size}px 0 0 ${color}`;
}

export const ITEMFILTER = [
    'ALL', 'EQUIP', 'CONSUME', 'MATERIAL', 'STORY'
]
