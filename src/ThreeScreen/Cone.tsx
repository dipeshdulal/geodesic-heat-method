import { useFBX } from "@react-three/drei"
import { Mesh } from "three";

export const Cone = () => {

    const model = useFBX("cone-with-logo.fbx");
    return <>
        {(model.children as Mesh[]).map((g: Mesh) => {
            console.log(g.geometry.attributes)
            return <mesh key={g.id}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" name="position" args={[g.geometry.attributes.position.array, 3]} />
                    <bufferAttribute attach="attributes-normal" name="normal" args={[g.geometry.attributes.normal.array, 3]} />
                </bufferGeometry>
                <meshBasicMaterial wireframe color="green" />
            </mesh>
        })}
    </>
}