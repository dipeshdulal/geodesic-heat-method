import { OrbitControls} from '@react-three/drei'
import { Model } from './Model'

export const ThreeScreen = () => {
    return <mesh>
        <mesh scale={1} position={[0, 0, 0]}>
            <Model />
        </mesh>
        <axesHelper />
        <ambientLight color={"white"}/>
        <OrbitControls />
    </mesh>
}