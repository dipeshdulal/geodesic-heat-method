import { useFBX } from "@react-three/drei"
import { useEffect } from "react";
import { EigenModule } from "../Eigen/EigenModule";

export const Cone = () => {
    const model = useFBX("cone-with-logo.fbx");
    useEffect(() => {
        (async () => {
            await EigenModule.init();
            console.log(EigenModule.module())
            console.log(model)
        })();
    }, [])
    return <>
        {(model.children as THREE.Mesh[]).map((g: THREE.Mesh) => {
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