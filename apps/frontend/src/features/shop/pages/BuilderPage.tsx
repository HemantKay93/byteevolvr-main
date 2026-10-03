import { Helmet } from 'react-helmet-async';

import { BuilderCanvas } from '../components/builder/BuilderCanvas';
import { BuilderSummary } from '../components/builder/BuilderSummary';

export function BuilderPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <Helmet>
        <title>Custom PC Builder | ByteEvolvr</title>
        <meta
          name="description"
          content="Build your custom gaming rig or workstation with ByteEvolvr's interactive PC builder. Select compatible CPUs, GPUs, motherboards, and accessories."
        />
        <meta property="og:title" content="Custom PC Builder | ByteEvolvr" />
        <meta
          property="og:description"
          content="Build your custom gaming rig or workstation with ByteEvolvr's interactive PC builder. Select compatible CPUs, GPUs, motherboards, and accessories."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Custom PC Builder
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-3xl">
          Select your components to build the ultimate gaming rig. Start from scratch or choose a
          base model to customize.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-2/3">
          <BuilderCanvas />
        </div>
        <div className="w-full lg:w-1/3 sticky top-28">
          <BuilderSummary />
        </div>
      </div>
    </div>
  );
}
