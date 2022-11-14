import { useFBX } from "@react-three/drei"
import { useEffect, useRef, useState } from "react";
import { EigenModule } from "../Eigen/EigenModule";
import { Geometry } from "../GeometryCore/geometry";
import { Mesh } from "../GeometryCore/mesh";
import { HeatMethod } from "../HeatMethod";
import { DenseMatrix } from "../LinearAlgebra/dense-matrix";
import { Vector } from "../LinearAlgebra/vector";
import { colormap, hot } from "../utils/colormap";
import { MeshIO } from "../utils/meshio";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'
import { Float32BufferAttribute } from "three";

const ORANGE = new Vector(1.0, 0.5, 0.0);
function getColors(phi?: DenseMatrix, mesh?: Mesh) {
    let maxPhi = 0.0;
    if (phi) {
        for (let i = 0; i < phi.nRows(); i++) {
            maxPhi = Math.max(phi.get(i, 0), maxPhi);
        }
    }
    let colors = [];

    for (let v of mesh!.vertices) {
        let i = v.index;

        let color;
        if (phi) {
            color = colormap(maxPhi - phi.get(i, 0), 0, maxPhi, hot);

        } else {
            color = ORANGE;
        }

        colors[3 * i + 0] = color.x;
        colors[3 * i + 1] = color.y;
        colors[3 * i + 2] = color.z;
    }
    return colors;
}


export const Cone = () => {
    const model = useFBX("cone-with-logo.fbx");
    const [colors, setColors] = useState<number[]>([]);
    const initMeshRef = useRef<THREE.Mesh>(null);
    useEffect(() => {
        (async () => {
            await EigenModule.init();
            const model = await fetch('test.obj');
            console.log(EigenModule.module())
            const m = new Mesh()
            const meshSoup = MeshIO.readOBJ(await model.text())
            m.build(meshSoup);
            console.log(meshSoup?.v.length, m)

            const geometry = new Geometry(m, meshSoup?.v || []);

            let V = m.vertices.length;
            const delta = DenseMatrix.zeros(V, 1);
            const heatMethod = new HeatMethod(geometry);
            let i = heatMethod.vertexIndex[100];
            delta.set(1, i, 0);
           
            let phi = delta.sum() > 0 ? heatMethod.compute(delta) : undefined;
            const c = getColors(phi, m);
            console.log(c);

            initMeshRef.current!.geometry = BufferGeometryUtils.mergeVertices(initMeshRef.current?.geometry!);
            initMeshRef.current!.geometry.setAttribute("color", new Float32BufferAttribute(new Float32Array(c), 3))
        })();
    }, [])
    return <>
        <mesh ref={initMeshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" name="position" args={[(model.children[0] as THREE.Mesh).geometry.attributes.position.array, 3]} />
                <bufferAttribute attach="attributes-normal" name="normal" args={[(model.children[0] as THREE.Mesh).geometry.attributes.normal.array, 3]} />
            </bufferGeometry>
            <meshPhongMaterial vertexColors/>
        </mesh>
       
    </>
}