import { OrbitControls} from '@react-three/drei'
import { Cone } from './Cone'

export const ThreeScreen = () => {
    return <mesh>
        <mesh scale={0.005} position={[0, -1, 0]}>
            <Cone />
        </mesh>
        <axesHelper />
        <ambientLight color={"white"}/>
        <OrbitControls />
    </mesh>
}