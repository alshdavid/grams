import "./styles.css";
import { h, Fragment, render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Chart, ChartData } from "./components/chart/chart.tsx";
import { Button } from "./components/button/button.tsx";
import { Input } from "./components/input/input.tsx";
import { Ingestion } from "../platform/ingestion.ts";
import { IngestionModel, parseFromHash, storeAsHash } from "../platform/serde.ts";


const [initialConfig, initialConfigEncoded] = parseFromHash()

function App() {
  const [ingestions, setIngestions] = useState<Array<Ingestion>>(initialConfig);
  const [ingestionsEncoded, setIngestionsEncoded] = useState<string>(initialConfigEncoded);

  useEffect(() => {
    const result = storeAsHash(ingestions)
    if (ingestionsEncoded !== result) {
      setIngestionsEncoded(result)
    }
  }, [ingestions])

  useEffect(() => {
    function onChange() {
      const [config, configEncoded] = parseFromHash()
      if (configEncoded === ingestionsEncoded) {
        return
      }
      setIngestionsEncoded(configEncoded)
      setIngestions(config)
    }

    globalThis.addEventListener("hashchange", onChange)
    return () => globalThis.removeEventListener("hashchange", onChange)
  }, [ingestionsEncoded])

  // Do half life calculations on another thread
  const chartData = useHalfLifeWorker(ingestions);

  function addIngestion(ingestion: Ingestion) {
    setIngestions([...ingestions, ingestion]);
  }

  function updateIngestion(i: number, ingestion: Partial<Ingestion>) {
    ingestions[i].merge(ingestion);
    setIngestions([...ingestions]);
  }

  function removeIngestion(i: number) {
    ingestions.splice(i, 1);
    setIngestions([...ingestions]);
  }

  return (
    <Fragment>
      <nav className="content-max-width">
        <div className="logo">
          <img src="icon.svg" />
          <div>
            <h1>grams</h1>
            <h2>How long do drugs stay in your body?</h2>
          </div>
        </div>
        <div>
          <a href="https://github.com/alshdavid/grams">https://github.com/alshdavid/grams</a>
        </div>
      </nav>

      <section className="content-max-width">
        <p>
          Grams works by calculating the{" "}
          <a href="https://en.wikipedia.org/wiki/Elimination_(pharmacology)">
            half-life elimination
          </a>{" "}
          timeline of ingested drugs. Some drugs (notably alcohol and THC)
          cannot be accurately modeled this way. All drugs metabolize
          differently in different people. For example, caffeine's half-life is
          97 hours in infants but only 5 hours in adults. Research drugs before
          you consume them. This site is not medical advice.
        </p>
      </section>

      <section className="content-max-width">
        <Chart data={chartData} />
      </section>

      <section className="content-max-width">
        <div className="ingestion-table">
          <div>
            <div>Offset</div>
            <div>Drug name</div>
            <div>Dosage</div>
            <div>Half-life</div>
          </div>
          {ingestions.map((ingestion, i) => (
            <div>
              <Input
                value={ingestion.offset}
                placeholder="0days"
                onInput={(e: any) =>
                  updateIngestion(i, { offset: e.target.value })
                }
              />
              <Input
                value={ingestion.drugName}
                placeholder="Caffeine"
                onInput={(e: any) =>
                  updateIngestion(i, { drugName: e.target.value })
                }
              />
              <Input
                value={ingestion.dosage}
                placeholder="80mg"
                onInput={(e: any) =>
                  updateIngestion(i, { dosage: e.target.value })
                }
              />
              <Input
                value={ingestion.halfLife}
                placeholder="5h"
                onInput={(e: any) =>
                  updateIngestion(i, { halfLife: e.target.value })
                }
              />
              <Button onClick={() => removeIngestion(i)}>X</Button>
            </div>
          ))}
        </div>

        <div className="buttons">
          <Button onClick={() => addIngestion(Ingestion.empty())}>
            Add Ingestion
          </Button>
          <Button>Copy URL</Button>
        </div>
      </section>
    </Fragment>
  );
}

render(<App />, document.body);

const url = globalThis.importMap.resolve("worker")!;
const worker = new Worker(url, { type: "module" });

function useHalfLifeWorker(ingestions: Array<Ingestion>): ChartData {
  const [chartData, setChartData] = useState<ChartData>({});

  // Do half life calculation on another thread
  useEffect(() => {
    let id = Math.round(Math.random() * 10000);
    let fn = (event: MessageEvent & { data: [number, ChartData] }) => {
      if (id !== event.data[0]) return;
      setChartData(event.data[1]);
      worker.removeEventListener("message", fn);
    };
    worker.addEventListener("message", fn);
    worker.postMessage([id, ingestions]);
    return () => worker.removeEventListener("message", fn);
  }, [ingestions]);

  return chartData;
}

// CONSOLE UTILS
// @ts-expect-error
globalThis.grams = class {
  static Ingestion = Ingestion

  static addIngestion(model: IngestionModel) {
    const [config] = parseFromHash()
    config.push(Ingestion.new(model))
    storeAsHash(config)
  }

  static removeIngestion(i: number) {
    const [config] = parseFromHash()
    config.splice(i, 1)
    storeAsHash(config)
  }

  static replaceIngestion(i: number, model: IngestionModel) {
    const [config] = parseFromHash()
    config[i] = Ingestion.new(model)
    storeAsHash(config)
  }

  static updateIngestion(i: number, model: IngestionModel) {
    const [config] = parseFromHash()
    Object.assign(config[i], Ingestion.new(model))
    storeAsHash(config)
  }

  static getIngestions(): Ingestion[] {
    const [config] = parseFromHash()
    return config
  }

  static setIngestions(ingestions: Ingestion[]): void {
    storeAsHash(ingestions)
  }
}
