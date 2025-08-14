import { lazy, useEffect } from 'react'
import './App.css'
import initGame from './scene/game'

// store
import { useSelector, useDispatch } from 'react-redux';
import { setScale, setUIoffset } from './store/setting';

// Components
const Menu = lazy(() => import('./components/menu'))

// Game init
initGame()

function App() {
  const gameWidth = useSelector(state => state.setting.width)
  const gameHeight = useSelector(state => state.setting.height)
  const uiOffsetV = useSelector(state => state.setting.uiOffsetV)
  const dispatch = useDispatch()

  // #region Scale UI
  // Reference from: https://jslegenddev.substack.com/p/how-to-display-an-html-based-ui-on
  const scaleUI = () => {
    const value = Math.min(
      window.innerWidth / gameWidth,
      window.innerHeight / gameHeight
    )

    dispatch(
      setScale(value)
    )

    console.log('window.innerHeight', window.innerHeight)
    console.log('gameHeight', gameHeight)

    dispatch(
      setUIoffset({
        v: (window.innerWidth - gameWidth) / 2,
        h: (window.innerHeight > gameHeight)? (window.innerHeight - gameHeight) / 2 : 0
      })
    )  
    
    document.documentElement.style.setProperty("--scale", value);
  }

  useEffect(() => {
    window.addEventListener('resize', scaleUI)

    // Fire the function on the first time
    scaleUI()        

    // Cleanup: Remove event listener on component unmount
    return () => {
      window.removeEventListener('resize', scaleUI)
    }
  }, [])
  // #endregion


  return (
    <div className='ui' style={{left: `${uiOffsetV}px`}}>
      <Menu />
    </div>
  )
}

export default App
