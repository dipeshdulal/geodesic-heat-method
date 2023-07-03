import { useEffect, useRef } from "react";
import { Mesh } from "../GeometryCore/mesh";
import { DenseMatrix } from "../LinearAlgebra/dense-matrix";
import { Vector } from "../LinearAlgebra/vector";
import { colormap, hot } from "../utils/colormap";
import * as THREE from "three";
import { EigenModule } from "../Eigen/EigenModule";
import { HeatMethod } from "../HeatMethod";
import { Geometry } from "../GeometryCore/geometry";
import { Float32BufferAttribute } from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { useLoader } from "@react-three/fiber";

// @ts-ignore
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

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


export const Model = () => {
    const model = useLoader(OBJLoader, "doghead.obj");
    
    const initMeshRef = useRef<THREE.Mesh>(null);
    const heatMethodRef = useRef<HeatMethod>();
    const deltaRef= useRef<DenseMatrix>();

    const calculateDistances = (x: number) => {
        let i = heatMethodRef.current!.vertexIndex[x];
        deltaRef.current!.set(1, i, 0);
        let phi = deltaRef.current!.sum() > 0 ? heatMethodRef.current!.compute(deltaRef.current!) : undefined;
        deltaRef.current!.set(0, i, 0);

        const c = getColors(phi, heatMethodRef.current?.geometry.mesh);
        initMeshRef.current!.geometry.setAttribute("color", new Float32BufferAttribute(new Float32Array(c), 3))
    }

    useEffect(() => {
        (async () => {

            await EigenModule.init();
            const g = BufferGeometryUtils.mergeVertices(initMeshRef.current!.geometry);
            const m = new Mesh();
            const vertices = [];
            const positions = g.getAttribute("position");
            for (let i = 0; i < positions.count; i++) {
                vertices.push(new Vector(positions.getX(i), positions.getY(i), positions.getZ(i)))
            }
            const soup = {
                f: g.index?.array,
                v: vertices,
            }
            m.build(soup);
            const geometry = new Geometry(m, soup.v);
            let V = m.vertices.length;
            deltaRef.current = DenseMatrix.zeros(V, 1);
            heatMethodRef.current = new HeatMethod(geometry);
            calculateDistances(3393);
            initMeshRef.current!.geometry = g;
        })();
    }, [])
    return <>
        <mesh
            ref={initMeshRef}
            onClick={({face}) => {
                calculateDistances(face!.a);
            }} >
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" name="position" args={[(model.children[0] as THREE.Mesh).geometry.attributes.position.array, 3]} />
                <bufferAttribute attach="attributes-normal" name="normal" args={[(model.children[0] as THREE.Mesh).geometry.attributes.normal.array, 3]} />
            </bufferGeometry>
            <meshPhongMaterial vertexColors />
        </mesh>

    </>
}