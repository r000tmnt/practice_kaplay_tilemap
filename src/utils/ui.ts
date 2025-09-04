export const pixelatedBorder = (size: number, color: string) => {
    return `${size}px 0 0 0 ${color}, 
            -${size}px 0 0 0 ${color}, 
            0 ${size}px 0 0 ${color}, 
            0 -${size}px 0 0 ${color}`;
}

export const ITEMFILTER = [
    'ALL', 'EQUIP', 'CONSUME', 'MATERIAL', 'STORY'
]

export const LANGUAGELIST = [
    'ENG', 'ZH-TW'
]

export const playerPositionRef = [
  // x, y in percentage
  [0.7, 0.6], [0.7, 0.7], [0.8, 0.55], [0.8, 0.65], [0.8, 0.75]
]
