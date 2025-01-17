// Import React and necessary hooks
'use client'
import { useState, useEffect } from 'react';
import * as fal from "@fal-ai/serverless-client";
import Image from 'next/image';

// Import Excalidraw dynamically
fal.config({
  proxyUrl: "/api/fal/proxy",
});
const seed = Math.floor(Math.random() * 100000);

export default function Home() {
  const [input, setInput] = useState('human form, human bodies,  aztec, mayan, yanomami, NOIR,  african, entangled with oil bubbles like hanging from heaven, inner lights,  blood, fire, network of tendrils, veins, umbilical cords, strange colors, abstract, complexity, organic, emerging organic, growth, black hole, metapatterns, phyllotaxis, diatoms, texture, voronoi, and depth, forces, photo-realistic');
  const [image, setImage] = useState(null);
  const [strength, setStrength] = useState(0.74); // Default strength value
  const [sceneData, setSceneData] = useState<any>(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [_appState, setAppState] = useState<any>(null);
  const [excalidrawExportFns, setExcalidrawExportFns] = useState<any>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [Comp, setComp] = useState<any>(null);
  const [audioSrc] = useState('/ghost_stolen.mp3'); // Update this path to your audio file

  useEffect(() => {
    import('@excalidraw/excalidraw').then((comp) => setComp(comp.Excalidraw));
  }, []);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    import('@excalidraw/excalidraw').then((module) =>
      setExcalidrawExportFns({
        exportToBlob: module.exportToBlob,
        serializeAsJSON: module.serializeAsJSON
      })
    );
  }, []);

  const baseArgs = {
    sync_mode: true,
    strength: strength, // Use the strength state
    seed
  };

  const { send } = fal.realtime.connect('110602490-sdxl-turbo-realtime', {
    connectionKey: 'realtime-nextjs-app',
    onResult(result) {
      if (result.error) return;
      setImage(result.images[0].url);
    }
  });

  async function getDataUrl(appState = _appState) {
    const elements = excalidrawAPI.getSceneElements();
    if (!elements || !elements.length) return;
    const blob = await excalidrawExportFns.exportToBlob({
      elements,
      exportPadding: 10,
      appState,
      quality: 1,
      files: excalidrawAPI.getFiles(),
      getDimensions: () => { return {width: 550, height: 550};}
    });
    return await new Promise(r => {let a=new FileReader(); a.onload=r; a.readAsDataURL(blob);}).then((e:any) => e.target.result);
  }

  return (
    <main className="p-12">
      <p className="text-xl mb-2">in pursuit of stolen ghosts | duet in <a href='https://en.wikipedia.org/wiki/Latent_spacelatent '>latent space</a> | concept, programming, sound design and performance by <a href='https://marlonbarrios.github.io/'>marlon barrios solano</a></p>
      <p className="text-xl mb-2">created during art and research residency at <a href='https://lakestudiosberlin.com/'>Lake Studios Berlin</a> | February 2024</p>
      <input className='border rounded-lg p-2 w-full mb-2' value={input} onChange={(e) => setInput(e.target.value)}/>
      <p><input type="range" min="0" max="1" step="0.01" value={strength} onChange={(e) => setStrength(parseFloat(e.target.value))}/> | Strength: {strength}</p>
     
      <div className='flex'>
        <div className="w-[650px] h-[650px]">
          {
            isClient && excalidrawExportFns && (
              <Comp
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                onChange={async (elements, appState) => {
                  const newSceneData = excalidrawExportFns.serializeAsJSON(
                    elements,
                    appState,
                    excalidrawAPI.getFiles(),
                    'local'
                  );
                  if (newSceneData !== sceneData) {
                    setAppState(appState);
                    setSceneData(newSceneData);
                    let dataUrl = await getDataUrl(appState);
                    send({
                      ...baseArgs,
                      image_url: dataUrl,
                      prompt: input,
                    });
                  }
                }}
              />
            )
}
      <div className="audio-player mt-4">
      <audio controls src={audioSrc}>
        Your browser does not support the audio element.
      </audio>
    </div>

        </div>
        {
          image && (
            <Image
              src={image}
              width={950}
              height={950}
              alt='fal image'
            />
          )
        }
      </div>
      
    </main>
  );
}
