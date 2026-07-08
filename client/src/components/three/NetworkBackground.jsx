import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Nodes({ count = 70, radius = 6 }) {
    const groupRef = useRef();

    const { positions, linePositions } = useMemo(() => {
        const pts = [];
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * (0.45 + Math.random() * 0.55);
            pts.push(new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            ));
        }

        const positions = new Float32Array(pts.length * 3);
        pts.forEach((p, i) => {
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
        });

        const linePts = [];
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                if (pts[i].distanceTo(pts[j]) < radius * 0.5) {
                    linePts.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
                }
            }
        }

        return { positions, linePositions: new Float32Array(linePts) };
    }, [count, radius]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y += delta * 0.045;
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.12;
    });

    return (
        <group ref={groupRef}>
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        array={linePositions}
                        count={linePositions.length / 3}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#818cf8" transparent opacity={0.22} />
            </lineSegments>
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        array={positions}
                        count={positions.length / 3}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial color="#6366f1" size={0.14} sizeAttenuation transparent opacity={0.85} />
            </points>
        </group>
    );
}

export default function NetworkBackground({ className = '' }) {
    return (
        <div className={className} aria-hidden="true">
            <Canvas
                camera={{ position: [0, 0, 9], fov: 50 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.6} />
                <Nodes />
            </Canvas>
        </div>
    );
}
