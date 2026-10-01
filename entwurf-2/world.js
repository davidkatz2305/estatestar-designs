import * as THREE from './vendor/three.module.js';

export async function createWorld(canvas,{reduced=false,onState=()=>{}}={}){
 const mobile=()=>innerWidth<=900;
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});}catch{return null;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,mobile()?1.25:1.5));
 renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,140);
 scene.add(new THREE.HemisphereLight(0xffffff,0x787b77,3.2));
 const key=new THREE.DirectionalLight(0xfff5de,4);key.position.set(4,9,7);scene.add(key);
 const rim=new THREE.DirectionalLight(0xc1d3e6,2.2);rim.position.set(-8,5,-5);scene.add(rim);
 const stageRoot=new THREE.Group();scene.add(stageRoot);
 const root=new THREE.Group();root.name='estate-pavilion';stageRoot.add(root);
 const concrete=new THREE.MeshStandardMaterial({color:0xeeeae2,roughness:.4,metalness:.08});
 const metal=new THREE.MeshStandardMaterial({color:0x262b2b,roughness:.28,metalness:.75});
 const glass=new THREE.MeshPhysicalMaterial({color:0x78898c,roughness:.14,metalness:.5,transparent:true,opacity:.72,clearcoat:1});
 const orange=new THREE.MeshStandardMaterial({color:0xff6200,emissive:0xff3600,emissiveIntensity:.12,roughness:.3,metalness:.22});
 const slab=new THREE.BoxGeometry(4.9,.11,3.5),windowGeo=new THREE.BoxGeometry(4.62,.34,3.24),finGeo=new THREE.BoxGeometry(.055,.4,.09);
 const floors=[];const count=13;const fins=new THREE.InstancedMesh(finGeo,metal,(count-1)*38);root.add(fins);const dummy=new THREE.Object3D();
 for(let i=0;i<count;i++){
   const g=new THREE.Group();g.position.y=i*.48;
   const plate=new THREE.Mesh(slab,concrete);g.add(plate);
   if(i<count-1){const win=new THREE.Mesh(windowGeo,glass);win.position.y=.24;g.add(win);}
   const edge=new THREE.Mesh(new THREE.BoxGeometry(4.94,.033,3.54),metal);edge.position.y=-.044;g.add(edge);
   root.add(g);floors.push(g);
 }
 const core=new THREE.Mesh(new THREE.BoxGeometry(.8,6.2,.8),orange);core.position.set(.65,2.85,0);root.add(core);
 const plinth=new THREE.Mesh(new THREE.CylinderGeometry(4.1,4.1,.11,96),concrete);plinth.position.y=-.54;root.add(plinth);
 const circle=new THREE.Mesh(new THREE.TorusGeometry(4.35,.018,8,100),orange);circle.rotation.x=Math.PI/2;circle.position.y=-.48;root.add(circle);
 const rings=new THREE.Group();root.add(rings);
 for(let i=0;i<2;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(4.9+i*.45,.007,4,100),metal);r.rotation.x=Math.PI/2;r.position.y=-.51;rings.add(r);}
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;const ctx=shadowCanvas.getContext('2d');const gradient=ctx.createRadialGradient(128,128,0,128,128,128);gradient.addColorStop(0,'rgba(0,0,0,.30)');gradient.addColorStop(.45,'rgba(0,0,0,.17)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);
 const shadowTexture=new THREE.CanvasTexture(shadowCanvas);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(14,12),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.62;root.add(shadow);
 let progress=0,target=0,raf=0,last=0,dirty=true,pointer={x:0,y:0},pointerNow={x:0,y:0},active=true;const times=[];const renderTimes=[];
 const textureLoader=new THREE.TextureLoader();const textures=[];let destroyed=false,hover=0;
 function texture(url){const t=textureLoader.load(url,()=>{if(t.userData.cover)t.userData.cover();dirty=true;},undefined,()=>{dirty=true;});t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(t);return t;}
 function frame(width,height,map){const g=new THREE.Group();const border=new THREE.Mesh(new THREE.BoxGeometry(width+.12,height+.12,.13),metal);g.add(border);const image=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map,toneMapped:false}));image.position.z=.075;g.add(image);g.userData.image=image;map.userData.cover=()=>{const ratio=map.image.width/map.image.height,box=width/height;map.repeat.set(Math.min(1,box/ratio),Math.min(1,ratio/box));map.offset.set((1-map.repeat.x)/2,(1-map.repeat.y)/2);};if(map.image)map.userData.cover();return g;}
 const photoGroup=new THREE.Group();photoGroup.name='photo-gallery';stageRoot.add(photoGroup);
 const westhafen=frame(6.5,4.3,texture('assets/westhafen-full.webp'));westhafen.rotation.y=-.12;westhafen.rotation.z=-.055;photoGroup.add(westhafen);
 const aerial=frame(3.8,2.65,texture('assets/berlin-full.webp'));aerial.position.set(2.7,2,-2.6);aerial.rotation.set(.03,-.33,.12);photoGroup.add(aerial);
 const interior=frame(3.5,2.35,texture('assets/interior.webp'));interior.position.set(-1.9,-2.1,-1.9);interior.rotation.set(.08,.16,-.12);photoGroup.add(interior);
 const filmGroup=new THREE.Group();filmGroup.name='cinema';stageRoot.add(filmGroup);
 const filmFrame=frame(8.4,4.725,texture('assets/hero-poster.webp'));filmGroup.add(filmFrame);
 const filmBack=new THREE.Mesh(new THREE.BoxGeometry(8.7,4.95,.04),orange);filmBack.position.z=-.1;filmGroup.add(filmBack);
 const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';let videoLoaded=false;const videoTexture=new THREE.VideoTexture(video);videoTexture.colorSpace=THREE.SRGBColorSpace;textures.push(videoTexture);
 video.addEventListener('playing',()=>{filmFrame.userData.image.material.map=videoTexture;dirty=true;});
 const tourGroup=new THREE.Group();tourGroup.name='spatial-portal';stageRoot.add(tourGroup);
 const tourPhoto=frame(7,4.9,texture('assets/tour.webp'));tourPhoto.position.z=-6;tourGroup.add(tourPhoto);
 for(let n=0;n<5;n++){const gate=new THREE.Group();for(const x of [-3.7,3.7]){const side=new THREE.Mesh(new THREE.BoxGeometry(.12,5.3,.12),n%2?concrete:orange);side.position.x=x;gate.add(side);}for(const y of [-2.6,2.6]){const bar=new THREE.Mesh(new THREE.BoxGeometry(7.5,.12,.12),n%2?concrete:orange);bar.position.y=y;gate.add(bar);}gate.position.z=2-n*1.6;gate.rotation.z=n*.026;tourGroup.add(gate);}
 const labGroup=new THREE.Group();labGroup.name='digital-lab';stageRoot.add(labGroup);
 const labMaterial=new THREE.ShaderMaterial({uniforms:{mapA:{value:texture('assets/lab-before.webp')},mapB:{value:texture('assets/lab-after.webp')},split:{value:.5}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D mapA;uniform sampler2D mapB;uniform float split;varying vec2 vUv;void main(){vec4 a=texture2D(mapA,vUv);vec4 b=texture2D(mapB,vUv);gl_FragColor=mix(a,b,step(split,vUv.x));if(abs(vUv.x-split)<.0015)gl_FragColor=vec4(1.,.32,0.,1.);\n#include <colorspace_fragment>\n}',toneMapped:false});
 const labPlane=new THREE.Mesh(new THREE.PlaneGeometry(8,4.5),labMaterial);labPlane.position.z=.08;labGroup.add(labPlane);labGroup.add(new THREE.Mesh(new THREE.BoxGeometry(8.12,4.62,.12),metal));
 const chapters=[
  {camera:[11,8,17],look:[-3.3,2.7,0],fov:33,building:[0,0,0],rotation:0,spread:0,photo:[7,3,-9,0],film:[8,3,-15,0],tour:[10,3,-20,0],lab:[12,3,-25,0],dark:0},
  {camera:[5,5.4,16],look:[-3,2.8,0],fov:35,building:[-7,-1,-7],rotation:-.55,spread:1,photo:[.9,3.2,0,1],film:[8,3,-12,0],tour:[10,3,-20,0],lab:[12,3,-25,0],dark:0},
  {camera:[.7,4.3,15],look:[-3,3,0],fov:36,building:[-12,-2,-17],rotation:-1.1,spread:1.2,photo:[-12,8,-16,0],film:[1.1,3.4,0,1],tour:[8,3,-15,0],lab:[12,3,-20,0],dark:1},
  {camera:[4,4.8,16],look:[-3,2.9,0],fov:35,building:[-13,-2,-18],rotation:-1.55,spread:.4,photo:[-10,7,-18,0],film:[-12,6,-16,0],tour:[1,3.2,0,1],lab:[8,3,-15,0],dark:0},
  {camera:[.5,4.3,15],look:[-3,2.9,0],fov:36,building:[10,-2,-18],rotation:-2,spread:.2,photo:[-12,7,-20,0],film:[-10,4,-18,0],tour:[-12,6,-17,0],lab:[1.1,3.2,0,1],dark:0}
 ];
 const tempV=new THREE.Vector3(),look=new THREE.Vector3();let dark=0;
 function resolveWorld(){const a=chapters[Math.floor(progress)],b=chapters[Math.min(4,Math.floor(progress)+1)],t=THREE.MathUtils.smoothstep(progress%1,0,1);const mix=(x,y)=>THREE.MathUtils.lerp(x,y,t);dark=mix(a.dark,b.dark);
   root.position.fromArray(a.building).lerp(tempV.fromArray(b.building),t);root.rotation.y=mix(a.rotation,b.rotation);root.visible=progress<1.85;root.scale.setScalar(1-THREE.MathUtils.smoothstep(progress,1.2,1.85));updateBuilding(mix(a.spread,b.spread));
   for(const [name,g] of [['photo',photoGroup],['film',filmGroup],['tour',tourGroup],['lab',labGroup]]){const x=a[name],y=b[name];g.position.set(mix(x[0],y[0]),mix(x[1],y[1]),mix(x[2],y[2]));const scale=mix(x[3],y[3]);g.scale.setScalar(Math.max(.0001,scale));g.visible=scale>.015;g.rotation.y=(1-scale)*.55;if(!mobile()){g.position.x-=1.8;g.scale.multiplyScalar(.74);}else if(name!=='photo'){g.position.x-=1.1;g.scale.multiplyScalar(innerWidth>650?1.2:.92);}}
   if(mobile()&&progress>1.6)photoGroup.visible=false;
   westhafen.rotation.y=-.12+hover*.04;
   if(mobile()){camera.position.set(4,6,21);look.set(-.6,4.8,0);camera.fov=44;stageRoot.position.set(-.3,-1.2,0);stageRoot.scale.setScalar(.76);}
   else{camera.position.fromArray(a.camera).lerp(tempV.fromArray(b.camera),t);look.fromArray(a.look).lerp(tempV.fromArray(b.look),t);camera.fov=mix(a.fov,b.fov);stageRoot.position.set(1.9,0,0);stageRoot.scale.setScalar(1);}
   camera.position.x+=pointerNow.x*.32;camera.position.y+=pointerNow.y*.2;camera.lookAt(look);camera.updateProjectionMatrix();
   key.intensity=4-dark*1.8;rim.intensity=2.2+dark;const playing=target>1.55&&target<2.5&&!reduced&&active&&!document.hidden;
   if(playing&&!videoLoaded){video.src='assets/hero-reel.mp4';videoLoaded=true;video.load();}
   if(playing&&video.paused)video.play().catch(()=>{});else if(!playing&&!video.paused)video.pause();
 }
 function updateBuilding(p){
  let idx=0;
  for(let i=0;i<count;i++){
   const f=floors[i],spread=Math.min(p,1);
   f.position.y=i*.48+(i-count/2)*spread*.15;f.rotation.y=.027*i+spread*.12*i;f.position.x=Math.sin(i*.38)*spread*.32;
   for(let j=0;j<38&&i<count-1;j++){
    let x,z;
    if(j<12){x=-2.2+j*.4;z=1.65;}else if(j<24){x=-2.2+(j-12)*.4;z=-1.65;}else if(j<31){x=2.35;z=-1.4+(j-24)*.45;}else{x=-2.35;z=-1.4+(j-31)*.45;}
    dummy.position.set(x,f.position.y+.24,z);dummy.rotation.y=f.rotation.y;dummy.position.applyAxisAngle(new THREE.Vector3(0,1,0),f.rotation.y);dummy.position.x+=f.position.x;dummy.updateMatrix();fins.setMatrixAt(idx++,dummy.matrix);
   }
  }fins.instanceMatrix.needsUpdate=true;
 }
 function draw(now){if(!active||document.hidden)return;const rawFrameMs=last?now-last:16.67;const dt=Math.min(rawFrameMs/1000,.034);last=now;progress+=((reduced?target:target)-progress)*(reduced?1:1-Math.exp(-5.5*dt));pointerNow.x+=(pointer.x-pointerNow.x)*.08;pointerNow.y+=(pointer.y-pointerNow.y)*.08;
   const moving=Math.abs(progress-target)>.0001||Math.abs(pointer.x-pointerNow.x)>.001||Math.abs(pointer.y-pointerNow.y)>.001;
   if(dirty||moving||!video.paused){const start=performance.now();resolveWorld();renderer.render(scene,camera);dirty=false;times.push(rawFrameMs);renderTimes.push(performance.now()-start);if(times.length>180){times.shift();renderTimes.shift();}onState({progress,dark,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,renderMs:renderTimes[renderTimes.length-1],frameMs:rawFrameMs});}
   raf=requestAnimationFrame(draw);
 }
 function resize(){renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,mobile()?1.25:1.5));camera.aspect=innerWidth/innerHeight;dirty=true;}
 function move(e){if(reduced||mobile()||e.pointerType==='touch')return;pointer.x=e.clientX/innerWidth*2-1;pointer.y=1-e.clientY/innerHeight*2;}
 function vis(){cancelAnimationFrame(raf);last=0;dirty=true;if(active&&!document.hidden&&!destroyed)raf=requestAnimationFrame(draw);else video.pause();}
 addEventListener('resize',resize);addEventListener('pointermove',move,{passive:true});document.addEventListener('visibilitychange',vis);
 resolveWorld();renderer.render(scene,camera);document.documentElement.classList.add('webgl-ready');raf=requestAnimationFrame(draw);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(raf);document.documentElement.classList.remove('webgl-ready');document.documentElement.classList.add('no-webgl');video.pause();});
 return {setProgress(p,immediate=false){target=Math.max(0,Math.min(4,p));if(immediate)progress=target;dirty=true;},setCompare(v){labMaterial.uniforms.split.value=v;dirty=true;},setHover(v){hover=v;dirty=true;},setReduced(v){reduced=v;pointer.x=pointer.y=0;dirty=true;},setActive(v){if(active===v)return;active=v;vis();},getMetrics(){return {drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures,dpr:renderer.getPixelRatio(),frameSamples:times.slice(),renderSamples:renderTimes.slice()};},destroy(){destroyed=true;active=false;video.pause();video.removeAttribute('src');video.load();cancelAnimationFrame(raf);removeEventListener('resize',resize);removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',vis);const geometries=new Set(),materials=new Set();scene.traverse(n=>{if(n.geometry)geometries.add(n.geometry);if(n.material)materials.add(n.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());shadowTexture.dispose();renderer.dispose();}};
}
