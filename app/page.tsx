'use client'
import { useState, useEffect } from 'react'
import * as fal from "@fal-ai/serverless-client"
import Image from 'next/image'

fal.config({
  proxyUrl: "/api/fal/proxy",
})
const seed = Math.floor(Math.random() * 100000)

export default function Home() {
  const [input, setInput] = useState('human form, human bodies, almost ghost entangled with oil bubbles like hanging from heaven, inner lights, blood, fire, network of tendrils, veins,  umbilical cords, strange colors, abstract, complexity, organic, emerging organic, growth, black hole, metapatterns, phyllotaxis, diatoms, texture, voronoi, and depth, forces, photo-realistic')
  const [image, setImage] = useState(null)
  const [strength, setStrength] = useState(0.6) // Default strength value
  const [sceneData, setSceneData] = useState<any>(null)
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null)
  const [_appState, setAppState] = useState<any>(null)
  const [excalidrawExportFns, setExcalidrawExportFns] = useState<any>(null)
  const [isClient, setIsClient] = useState<boolean>(false)
  const [Comp, setComp] = useState<any>(null);

  useEffect(() => {
    import('@excalidraw/excalidraw').then((comp) => setComp(comp.Excalidraw))
  }, [])

  useEffect(() => { setIsClient(true) }, [])

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
  }

  const { send } = fal.realtime.connect('110602490-sdxl-turbo-realtime', {
    connectionKey: 'realtime-nextjs-app',
    onResult(result) {
      if (result.error) return
      setImage(result.images[0].url)
    }
  })

  async function getDataUrl(appState = _appState) {
    const elements = excalidrawAPI.getSceneElements()
    if (!elements || !elements.length) return
    const blob = await excalidrawExportFns.exportToBlob({
      elements,
      exportPadding: 10,
      appState,
      quality: 1,
      files: excalidrawAPI.getFiles(),
      getDimensions: () => { return {width: 550, height: 550}}
    })
    return await new Promise(r => {let a=new FileReader(); a.onload=r; a.readAsDataURL(blob)}).then((e:any) => e.target.result)
  }

  return (
    <main className="p-12">
      <p className="text-xl mb-2">DUET IN LATENT SPACE 01| Fal SDXL Turbo</p>
      <p className="text-xl mb-2">In Pursuit of Ghosts | Concept, programming and performance by<a href='https://marlonbarrios.github.io/'> Marlon Barrios Solano</a></p>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={strength}
        className="w-full"
        onChange={(e) => setStrength(parseFloat(e.target.value))}
      />
      <p>Strength: {strength}</p>
      <input
        className='border rounded-lg p-2 w-full mb-2'
        value={input}
        onChange={async (e) => {
          setInput(e.target.value)
          let dataUrl = await getDataUrl()
          send({
            ...baseArgs,
            prompt: e.target.value,
            image_url: dataUrl
          })
        }}
      />
      <div className='flex'>
        <div className="w-[550px] h-[550px]">
          {
            isClient && excalidrawExportFns && (
              <Comp
                excalidrawAPI={(api)=> setExcalidrawAPI(api)}
                onChange={async (elements, appState) => {
                  const newSceneData = excalidrawExportFns.serializeAsJSON(
                    elements,
                    appState,
                    excalidrawAPI.getFiles(),
                    'local'
                  )
                  if (newSceneData !== sceneData) {
                    setAppState(appState)
                    setSceneData(newSceneData)
                    let dataUrl = await getDataUrl(appState)
                    send({
                      ...baseArgs,
                      image_url: dataUrl,
                      prompt: input,
                    })
                  }
                }}
              />
            )
          }
        </div>
        {
          image && (
            <Image
              src={image}
              width={550}
              height={550}
              alt='fal image'
            />
          )
        }
      </div>
    </main>
  )
}
