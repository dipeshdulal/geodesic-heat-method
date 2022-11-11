import { Canvas } from '@react-three/fiber'
import { ThreeScreen } from './ThreeScreen'

function App() {
  return (
    <Canvas style={{width: "100vw", height: "100vh"}} >
      <ThreeScreen />
    </Canvas>
  )
}

export default App
