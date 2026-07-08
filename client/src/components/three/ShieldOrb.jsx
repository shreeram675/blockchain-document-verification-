import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Icosahedron } from '@react-three/drei';

export default function ShieldOrb({ className = '' }) {
    return (
        <div className={className} aria-hidden="true">
            <Canvas camera={{ position: [0, 0, 4.6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[3, 3, 4]} intensity={1.4} color="#a5b4fc" />
                <directionalLight position={[-3, -2, -2]} intensity={0.7} color="#67e8f9" />

                <Float speed={1.3} rotationIntensity={0.55} floatIntensity={1.1}>
                    <Sphere args={[1.35, 64, 64]}>
                        <MeshDistortMaterial
                            color="#6366f1"
                            distort={0.38}
                            speed={1.4}
                            roughness={0.15}
                            metalness={0.65}
                        />
                    </Sphere>
                </Float>

                <Float speed={1.8} rotationIntensity={1.1} floatIntensity={1.6}>
                    <Icosahedron args={[0.32, 0]} position={[1.7, 1.1, 0.6]}>
                        <meshStandardMaterial color="#22d3ee" roughness={0.2} metalness={0.5} wireframe />
                    </Icosahedron>
                </Float>

                <Float speed={1.5} rotationIntensity={1} floatIntensity={1.4}>
                    <Icosahedron args={[0.2, 0]} position={[-1.6, -1, 0.8]}>
                        <meshStandardMaterial color="#a78bfa" roughness={0.2} metalness={0.5} wireframe />
                    </Icosahedron>
                </Float>
            </Canvas>
        </div>
    );
}
